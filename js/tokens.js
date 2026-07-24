// ══════════════════════════════════
// tokens.js — Sistema de Tokens
// ══════════════════════════════════

import { uiAlert, uiConfirm, uiPrompt } from './ui-dialogs.js';
import { CONDITIONS, CONDITION_MAP, conditionTooltip } from './conditions.js';
import { icon, drawIconOnCanvas } from './icons.js';

const TOKEN_COLORS = [
  '#a9884f','#2563eb','#059669','#d97706',
  '#dc2626','#c0392b','#0891b2','#65a30d',
];

export class TokenManager {
  constructor({ canvas, ctx, camera, settings, onSave, onMessage, onStatChange, onOpenSheet, onGetVariants, onDragStart, onDragMove, onDragEnd }) {
    this.canvas    = canvas;
    this.ctx       = ctx;
    this.camera    = camera;   // ref ao objeto câmera { x, y, zoom }
    this.settings  = settings; // ref ao objeto settings
    this.onSave    = onSave;   // callback para salvar
    this.onMessage = onMessage;
    this.onStatChange = onStatChange || (() => {}); // (tokenId, patch) — avisa a ficha vinculada
    this.onOpenSheet   = onOpenSheet   || (() => {}); // (token) — abrir/criar ficha do token
    this.onGetVariants = onGetVariants || (() => null); // (token) — versões visuais cadastradas na ficha
    // Arraste/giro AO VIVO — chamados enquanto o token está sendo mexido
    // (não só quando solta), pra transmitir pra rede em tempo real. Ver
    // main.js pra como isso vira mensagens de rede.
    this.onDragStart = onDragStart || (() => {}); // (token) — começou a segurar
    this.onDragMove  = onDragMove  || (() => {}); // (token) — posição/ângulo mudou (chamado com limite de frequência)
    this.onDragEnd   = onDragEnd   || (() => {}); // (token) — soltou

    this.tokens        = [];
    this.selected      = null; // token selecionado
    this.dragging      = null; // { token, offX, offY }
    this.rotating      = null; // { token, startAngle, startRotation }
    this.resizing      = null; // { token, startY, startScale }
    this.colorIdx      = 0;
    this.selectionColor = '#c0392b'; // cor do brilho de seleção — vem do perfil do jogador (main.js)
    this.combatActive  = false; // só mostra a barra de vida acima do token quando true (ligado pelo "Iniciar Combate")

    this._images       = {}; // cache de imagens
    this._loadSeq      = 0;  // guarda de corrida do loadTokens (ver comentário lá)
    this._undoStack    = [];
    this._redoStack    = [];
    this._clipboard    = null; // token copiado (Ctrl+C) pra colar depois (Ctrl+V)
    this.rotateModeActive = false; // alternado pela tecla R — arrastar sem precisar segurar Alt
    this._contextToken = null; // token alvo do menu de contexto
    this.isGM = false; // true deixa tokens ocultos visíveis (semitransparentes) só pra quem mestra
    this._lastDragBroadcast = 0; // throttle do onDragMove (ver onMouseMove)

    this._setupContextMenu();
    this._setupModal();
    this._setupUpload();
  }

  // ═══════════════════════════════
  // CARREGAR / SALVAR
  // ═══════════════════════════════

  loadTokens(data) {
    // Guarda de corrida: se dois loadTokens forem disparados em sequência
    // rápida (ex: várias sincronizações de rede chegando durante um
    // arraste), a chamada mais ANTIGA não pode "vencer" e sobrescrever o
    // resultado da mais NOVA quando suas imagens terminarem de carregar
    // depois — isso é o que causava tokens duplicados/fantasmas ao mexer.
    const seq = ++this._loadSeq;
    const built = [];
    const promises = data.map(t => {
      return new Promise(resolve => {
        const token = { ...t };
        // Migração: tokens salvos antes da troca de "Marcadores" genéricos
        // pelas Condições oficiais de Ordem Paranormal viram um array vazio
        // (os marcadores antigos não têm equivalente direto e são descartados).
        if (!Array.isArray(token.conditions)) token.conditions = [];
        delete token.markers;
        // Migração: tokens salvos antes de existir a visibilidade
        // (oculto/visível) e a marca de "token de ameaça" nascem visíveis
        // e como token comum.
        if (typeof token.hidden !== 'boolean') token.hidden = false;
        if (typeof token.isThreat !== 'boolean') token.isThreat = false;
        if (token.threatId === undefined) token.threatId = null;
        // Se a imagem desse token já está carregada em cache (mesmo src),
        // reaproveita em vez de recarregar do zero — evita picar/duplicar
        // tokens numa sincronização de rede que troca só a posição.
        const cachedImg = this._images[token.id];
        if (token.imageSrc && cachedImg && cachedImg.src === token.imageSrc) {
          built.push(token);
          resolve();
        } else if (token.imageSrc) {
          const img = new Image();
          img.onload  = () => { this._images[token.id] = img; built.push(token); resolve(); };
          img.onerror = () => { built.push(token); resolve(); };
          img.src = token.imageSrc;
        } else {
          built.push(token);
          resolve();
        }
      });
    });
    return Promise.all(promises).then(() => {
      if (seq !== this._loadSeq) return; // uma chamada mais nova já assumiu — descarta este resultado desatualizado
      // Mantém a ordem original de "data" (o Promise.all resolve em ordem
      // de conclusão de imagem, não de entrada — sem isso a pilha visual
      // dos tokens "embaralhava" a cada sync).
      const byId = new Map(built.map(t => [t.id, t]));
      this.tokens = data.map(t => byId.get(t.id)).filter(Boolean);
    });
  }

  _save() {
    this.onSave(this.tokens);
  }

  // Aplica uma atualização de posição/ângulo vinda de outro cliente (ver
  // onDragStart/onDragMove/onDragEnd + main.js) diretamente no token já
  // carregado — sem passar pelo loadTokens (não precisa recarregar
  // imagem nenhuma só porque o X/Y mudou) e sem chamar _save (isso é só
  // o "ao vivo" enquanto alguém arrasta; a posição final e definitiva já
  // chega separadamente pela sincronização normal de tokens no soltar).
  applyRemoteMove(patch) {
    const t = this.tokens.find(x => x.id === patch.id);
    if (!t) return;
    if (patch.x        !== undefined) t.x = patch.x;
    if (patch.y        !== undefined) t.y = patch.y;
    if (patch.rotation !== undefined) t.rotation = patch.rotation;
    if (patch.scale    !== undefined) t.scale = patch.scale;
    if ('heldBy' in patch) t._heldBy = patch.heldBy; // { name, color } | null
  }

  _snapshot() {
    return JSON.stringify(this.tokens.map(t => ({ ...t, imageSrc: t.imageSrc })));
  }

  _pushUndo() {
    this._undoStack.push(this._snapshot());
    if (this._undoStack.length > 30) this._undoStack.shift();
    this._redoStack = []; // qualquer ação nova invalida o "refazer" pendente
  }

  undo() {
    if (this._undoStack.length === 0) return;
    this._redoStack.push(this._snapshot());
    const prev = JSON.parse(this._undoStack.pop());
    this.loadTokens(prev).then(() => this._save());
  }

  redo() {
    if (this._redoStack.length === 0) return;
    this._undoStack.push(this._snapshot());
    const next = JSON.parse(this._redoStack.pop());
    this.loadTokens(next).then(() => this._save());
  }

  // Ctrl+C — guarda uma cópia do token selecionado na "área de transferência"
  // interna (não usa o clipboard do sistema, só um campo em memória).
  copySelected() {
    if (!this.selected) return false;
    this._clipboard = JSON.parse(JSON.stringify(this.selected));
    return true;
  }

  // Ctrl+V — cola o token copiado numa posição do mundo (o cursor, se
  // souber onde ele está; senão, um pouco deslocado do original).
  pasteToken(worldX, worldY) {
    if (!this._clipboard) return null;
    this._pushUndo();
    const src = this._clipboard;
    const id  = `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const token = {
      ...src,
      id,
      name: src.name,
      x: worldX ?? src.x + 40,
      y: worldY ?? src.y + 40,
    };
    if (token.imageSrc && this._images[src.id]) {
      this._images[id] = this._images[src.id];
    }
    this.tokens.push(token);
    this.selected = token;
    this._updateInfoBar();
    this._save();
    return token;
  }

  // Tecla R com um token selecionado: alterna um modo em que arrastar o
  // token (sem precisar segurar Alt) gira/redimensiona em vez de mover.
  toggleRotateMode() {
    if (!this.selected) return false;
    this.rotateModeActive = !this.rotateModeActive;
    return this.rotateModeActive;
  }

  // ═══════════════════════════════
  // ADICIONAR TOKEN
  // ═══════════════════════════════

  addToken(imageSrc, worldX, worldY) {
    this._pushUndo();
    // Segurança: um token recém-criado nunca deve nascer "preso" ao
    // mouse. Isso podia acontecer porque abrir o seletor de arquivo do
    // sistema (para escolher a imagem) às vezes deixa um estado de
    // clique "fantasma" quando a janela volta o foco — zeramos qualquer
    // arraste/rotação pendente antes de colocar o token na mesa.
    this.dragging = null;
    this.rotating = null;

    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const color = TOKEN_COLORS[this.colorIdx % TOKEN_COLORS.length];
    this.colorIdx++;

    const token = {
      id, name: 'Token', imageSrc,
      x: worldX, y: worldY,
      scale: 1, rotation: 0,
      flipH: false, flipV: false,
      hp: 10, hpMax: 10, mana: 0, armor: 0,
      conditions: [],
      locked: false,
      color,
      sheetId: null,
      threatId: null,
      hidden: false,
      isThreat: false,
    };

    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        this._images[id] = img;
        this.tokens.push(token);
        this._save();
      };
      img.src = imageSrc;
    } else {
      this.tokens.push(token);
      this._save();
    }

    return token;
  }

  // Cria um token a partir de uma ficha do Bestiário (Ameaças) — chamado
  // pelo botão "Adicionar à Mesa" na ficha de ameaça. Nasce OCULTO: só o
  // Mestre vê (semitransparente), até ele decidir revelar pra mesa toda
  // pelo menu de contexto ("Tornar Visível").
  addThreatToken(threat) {
    this._pushUndo();
    this.dragging = null;
    this.rotating = null;

    const cam = this.camera;
    const cx  = (this.canvas.width  / 2 - cam.x) / cam.zoom;
    const cy  = (this.canvas.height / 2 - cam.y) / cam.zoom;

    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const color = TOKEN_COLORS[this.colorIdx % TOKEN_COLORS.length];
    this.colorIdx++;

    const token = {
      id, name: threat.name || 'Ameaça', imageSrc: threat.photo || null,
      x: cx, y: cy,
      scale: 1, rotation: 0,
      flipH: false, flipV: false,
      hp: threat.pv ?? threat.pvMax ?? 10, hpMax: threat.pvMax ?? 10, mana: 0, armor: 0,
      conditions: [...(threat.conditions || [])],
      locked: false,
      color,
      sheetId: null,
      threatId: threat.id,
      hidden: true,
      isThreat: true,
    };

    const finish = () => {
      this.tokens.push(token);
      this._save();
    };

    if (token.imageSrc) {
      const img = new Image();
      img.onload = () => { this._images[id] = img; finish(); };
      img.onerror = finish;
      img.src = token.imageSrc;
    } else {
      finish();
    }

    return token;
  }

  // ═══════════════════════════════
  // ACESSO EXTERNO (usado pela Ficha de Personagem)
  // ═══════════════════════════════

  getToken(id) {
    return this.tokens.find(t => t.id === id) || null;
  }

  getTokenList() {
    return this.tokens.map(t => ({ id: t.id, name: t.name, sheetId: t.sheetId || null }));
  }

  // Liga/desliga a exibição da barra de vida flutuante acima dos tokens
  // — chamado pelo Initiative quando "Iniciar Combate"/"Encerrar Combate" é clicado.
  setCombatActive(active) {
    this.combatActive = !!active;
  }

  // Aplica alterações vindas de fora (ex: a Ficha de Personagem) sem
  // disparar de volta o aviso onStatChange (evita loop ficha↔token).
  applyExternalStats(id, patch) {
    const t = this.tokens.find(t => t.id === id);
    if (!t) return;
    Object.assign(t, patch);
    this._save();
    if (this.selected?.id === id) this._updateInfoBar();
  }

  // Troca a imagem exibida do token (usado pelo menu de contexto
  // "Versão do Token", com as versões cadastradas na Ficha vinculada).
  setTokenImage(id, imageSrc) {
    const t = this.tokens.find(t => t.id === id);
    if (!t || !imageSrc) return;
    const img = new Image();
    img.onload = () => {
      this._images[id] = img;
      t.imageSrc = imageSrc;
      this._save();
    };
    img.src = imageSrc;
  }

  removeToken(id) {
    this._pushUndo();
    const idx = this.tokens.findIndex(t => t.id === id);
    if (idx !== -1) this.tokens.splice(idx, 1);
    if (this.selected?.id === id) this.selected = null;
    this._save();
    this._updateInfoBar();
  }

  // ═══════════════════════════════
  // HIT TEST
  // ═══════════════════════════════

  getTokenAt(worldX, worldY) {
    // Iterar de trás para frente (elementos de cima primeiro)
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const t = this.tokens[i];
      if (t.hidden && !this.isGM) continue; // jogadores não enxergam (nem clicam em) tokens ocultos
      const size = this._tokenSize(t);
      const dx = worldX - t.x;
      const dy = worldY - t.y;
      if (Math.abs(dx) <= size/2 && Math.abs(dy) <= size/2) return t;
    }
    return null;
  }

  getRotationHandleAt(worldX, worldY) {
    if (!this.selected) return false;
    const t = this.selected;
    const size = this._tokenSize(t);
    const handleX = t.x + size/2;
    const handleY = t.y - size/2;
    const dx = worldX - handleX;
    const dy = worldY - handleY;
    return Math.sqrt(dx*dx + dy*dy) < 10;
  }

  _tokenSize(t) {
    return (this.settings.gridSize || 60) * t.scale;
  }

  // ═══════════════════════════════
  // MOUSE HANDLERS
  // ═══════════════════════════════

  onMouseDown(worldX, worldY, e) {
    if ((e.altKey || this.rotateModeActive) && this.selected
        && (this.getTokenAt(worldX, worldY) === this.selected)) {
      // Modo rotação com ALT, ou com o "modo girar" ligado pela tecla R
      // (também permite redimensionar, ver onMouseMove)
      this.rotating = this._startRotateResize(this.selected, worldX, worldY);
      this.onDragStart(this.rotating.token);
      return true;
    }

    // A "bolinha" de girar/redimensionar só deve valer para o token
    // ATUALMENTE selecionado. Antes disso era checado só pela posição da
    // bolinha, sem olhar o que realmente está embaixo do cursor — como
    // um token novo nasce sempre no mesmo ponto (centro da câmera), ele
    // ficava exatamente sobre o token anterior, e clicar nele acabava
    // "acertando" a bolinha do token antigo em vez de mover o novo.
    // Agora: se houver um token DIFERENTE do selecionado bem debaixo do
    // cursor, esse clique é para MOVER esse outro token, não para
    // girar/redimensionar o antigo.
    const tokenUnderCursor = this.getTokenAt(worldX, worldY);
    const clickedOnHandle = this.getRotationHandleAt(worldX, worldY)
      && (!tokenUnderCursor || tokenUnderCursor === this.selected);

    if (clickedOnHandle) {
      // Arraste a "bolinha" de girar: mover em arco gira o token,
      // aproximar/afastar do centro também muda o tamanho dele.
      this.rotating = this._startRotateResize(this.selected, worldX, worldY);
      this.onDragStart(this.rotating.token);
      return true;
    }

    const token = tokenUnderCursor;
    if (token) {
      if (!token.locked) {
        this._pushUndo();
        this.dragging = {
          token,
          offX: worldX - token.x,
          offY: worldY - token.y,
        };
        this.onDragStart(token);
      }
      this.selected = token;
      this._updateInfoBar();
      return true;
    } else {
      this.selected = null;
      this._updateInfoBar();
      return false;
    }
  }

  // Prepara o estado de arraste da "bolinha" de girar, guardando a
  // distância inicial até o centro do token — essa distância é usada
  // depois em onMouseMove para também redimensionar o token.
  _startRotateResize(token, worldX, worldY) {
    const angle = Math.atan2(worldY - token.y, worldX - token.x);
    const startDist = Math.max(1, Math.hypot(worldX - token.x, worldY - token.y));
    this._pushUndo();
    return {
      token,
      startAngle:    angle,
      startRotation: token.rotation,
      startDist,
      startScale:    token.scale,
    };
  }

  onMouseMove(worldX, worldY, e) {
    // Rede de segurança extra: se por qualquer motivo (trackpad, clique
    // "fantasma", evento de mouseup perdido pelo navegador, etc.) o botão
    // esquerdo não estiver realmente pressionado neste exato momento mas
    // ainda estivermos "arrastando" ou "girando", soltamos tudo aqui —
    // sem isso, o token podia ficar seguindo o cursor mesmo sem o botão
    // pressionado, até o próximo clique.
    if ((this.dragging || this.rotating) && e.buttons !== undefined && (e.buttons & 1) === 0) {
      const t = this.dragging?.token || this.rotating?.token;
      this._save();
      this.dragging = null;
      this.rotating = null;
      if (t) this.onDragEnd(t);
      return false;
    }

    if (this.rotating) {
      const r = this.rotating;
      const angle = Math.atan2(worldY - r.token.y, worldX - r.token.x);
      const delta = angle - r.startAngle;
      r.token.rotation = r.startRotation + delta;

      // Afastar a "bolinha" do centro aumenta o token; aproximar diminui.
      const dist = Math.hypot(worldX - r.token.x, worldY - r.token.y);
      r.token.scale = Math.max(0.25, Math.min(4, r.startScale * (dist / r.startDist)));
      this._throttledDragBroadcast(r.token);
      return true;
    }

    if (this.dragging) {
      const t = this.dragging.token;
      const newX = worldX - this.dragging.offX;
      const newY = worldY - this.dragging.offY;

      // Snap to grid opcional (Shift desativa snap)
      if (!e.shiftKey && this.settings.showGrid) {
        const gs = this.settings.gridSize;
        t.x = Math.round(newX / gs) * gs;
        t.y = Math.round(newY / gs) * gs;
      } else {
        t.x = newX;
        t.y = newY;
      }
      this._throttledDragBroadcast(t);
      return true;
    }

    return false;
  }

  // Manda a posição/ângulo atual pra rede no máximo a cada ~40ms (25/s) —
  // rápido o bastante pra parecer ao vivo, sem afogar a conexão P2P com
  // uma mensagem a cada frame (60/s) do mousemove.
  _throttledDragBroadcast(token) {
    const now = performance.now();
    if (now - this._lastDragBroadcast < 40) return;
    this._lastDragBroadcast = now;
    this.onDragMove(token);
  }

  onMouseUp() {
    if (this.dragging) { const t = this.dragging.token; this._save(); this.dragging = null; this.onDragEnd(t); }
    if (this.rotating) { const t = this.rotating.token; this._save(); this.rotating = null; this.onDragEnd(t); }
  }

  onScroll(worldX, worldY, delta) {
    if (!this.selected) return false;
    const t = this.selected;
    const size = this._tokenSize(t);
    const dx = worldX - t.x;
    const dy = worldY - t.y;
    if (Math.abs(dx) <= size/2 && Math.abs(dy) <= size/2) {
      this._pushUndo();
      const factor = delta > 0 ? 0.9 : 1.1;
      t.scale = Math.max(0.25, Math.min(4, t.scale * factor));
      this._save();
      return true;
    }
    return false;
  }

  // ═══════════════════════════════
  // RENDER
  // ═══════════════════════════════

  draw() {
    const ctx = this.ctx;
    const cam = this.camera;

    this.tokens.forEach(t => {
      // Token oculto (ex.: ameaça recém-adicionada, ainda não revelada):
      // some por completo pra quem não é Mestre; pro Mestre fica
      // semitransparente, como um lembrete visual de que só ele o vê.
      if (t.hidden && !this.isGM) return;
      const hiddenAlpha = (t.hidden && this.isGM) ? 0.4 : 1;

      const img  = this._images[t.id];
      const size = this._tokenSize(t);

      ctx.save();
      ctx.globalAlpha = hiddenAlpha;
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation);
      if (t.flipH) ctx.scale(-1, 1);
      if (t.flipV) ctx.scale(1, -1);

      const isSel = this.selected?.id === t.id;
      // Se alguém (eu ou outro jogador) está segurando este token agora,
      // o brilho usa a cor de quem está segurando; senão, o brilho normal
      // de seleção (só aparece pra quem selecionou localmente).
      const glowColor = t._heldBy?.color || (isSel ? this.selectionColor : null);

      // Imagem ou placeholder
      if (img) {
        // Antes a imagem era esticada pra preencher o quadrado do token
        // inteiro, o que distorcia o desenho (deixava tudo "mais gordo")
        // quando a arte enviada não era quadrada. Agora mantemos a
        // proporção original da imagem, só encaixando (contain) dentro
        // do espaço do token, centralizada.
        const iw = img.naturalWidth  || img.width  || 1;
        const ih = img.naturalHeight || img.height || 1;
        const scale = Math.min(size / iw, size / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = -dw / 2;
        const dy = -dh / 2;

        // O shadow do canvas segue o alfa da própria imagem — então, se o
        // token tem fundo transparente, o brilho contorna só a arte real,
        // não um quadrado/círculo por cima dela.
        ctx.save();
        if (glowColor) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur  = 16;
          // duas passadas para o glow ficar mais encorpado
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.drawImage(img, dx, dy, dw, dh);
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.55)';
          ctx.shadowBlur  = 5;
          ctx.drawImage(img, dx, dy, dw, dh);
        }
        ctx.restore();
      } else {
        // Placeholder: círculo colorido com inicial (sem imagem própria, então
        // o círculo aqui É a "arte" do token, não um anel por cima dela)
        ctx.fillStyle = t.color || '#a9884f';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${size * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.name.charAt(0).toUpperCase(), 0, 0);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = glowColor || 'rgba(255,255,255,0.15)';
        ctx.lineWidth = glowColor ? 3 : 1;
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
      ctx.globalAlpha = hiddenAlpha;

      // ── UI acima do token (sem rotação) ──
      this._drawTokenUI(t, size);
      ctx.globalAlpha = 1;
    });
  }

  // Desenha um retângulo com cantos arredondados (compat sem roundRect nativo)
  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  _drawTokenUI(t, size) {
    const ctx = this.ctx;

    // Etiqueta com o nome de quem está segurando este token — aparece pra
    // TODOS na mesa enquanto alguém está arrastando/girando (o brilho em
    // volta do token já muda de cor sozinho pra cor de quem segura, ver
    // glowColor em draw()).
    if (t._heldBy?.name) {
      const holdColor = t._heldBy.color || '#ffffff';
      const label      = t._heldBy.name;
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const labelY = t.y - size / 2 - 12;
      const labelW = ctx.measureText(label).width + 12;
      this._roundRect(ctx, t.x - labelW / 2, labelY - 15, labelW, 16, 4);
      ctx.fillStyle = holdColor;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(label, t.x, labelY - 1);
      ctx.restore();
    }

    // Barra de vida — estilo arcano: trilho arredondado escuro com borda
    // dourada suave e preenchimento em gradiente.
    // Só aparece durante o combate (depois de clicar em "Iniciar Combate").
    if (this.combatActive && t.hpMax > 0) {
      const barW = size * 0.9;
      const barH = 7;
      const barX = t.x - barW/2;
      const barY = t.y - size/2 - 15;
      const pct  = Math.max(0, Math.min(1, t.hp / t.hpMax));
      const r = barH / 2;

      // Trilho (fundo)
      ctx.save();
      this._roundRect(ctx, barX - 1.5, barY - 1.5, barW + 3, barH + 3, r + 1.5);
      ctx.fillStyle = 'rgba(16,11,20,0.75)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,202,99,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Preenchimento — ameaças sempre em vermelho (o Mestre não quer
      // que a barra "avise" a vida percentual real pela cor pra quem
      // olha de relance); tokens comuns mantêm a faixa verde/âmbar/vermelho.
      if (pct > 0) {
        const barColor  = t.isThreat ? '#dc2626' : (pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444');
        const fillW = Math.max(barH, barW * pct); // nunca menor que a própria altura (mantém as pontas redondas)
        this._roundRect(ctx, barX, barY, fillW, barH, r);
        ctx.save();
        ctx.clip();
        const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        grad.addColorStop(0, barColor);
        grad.addColorStop(1, barColor);
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillW, barH);
        // brilho sutil na metade de cima
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(barX, barY, fillW, barH/2);
        ctx.restore();
      }
      ctx.restore();

      // Texto do HP com contorno pra legibilidade em qualquer fundo —
      // ameaças mostram só a barra (sem número exato de vida/máximo),
      // pra manter a incerteza de quanto falta pra abater a fera.
      if (!t.isThreat) {
        ctx.font = '9px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.strokeText(`${t.hp}/${t.hpMax}`, t.x, barY + barH/2 + 8);
        ctx.fillStyle = '#ffca63';
        ctx.fillText(`${t.hp}/${t.hpMax}`, t.x, barY + barH/2 + 8);
      }
    }

    // Nome — mesma regra da barra de vida: só aparece durante o combate
    // (depois de clicar em "Iniciar Combate"). Levemente transparente
    // pra não pesar tanto visualmente sobre o mapa.
    if (this.combatActive) {
      ctx.save();
      ctx.globalAlpha *= 0.82;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = `bold 11px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const nameY = t.y + size/2 + 4;
      const nameW = ctx.measureText(t.name).width + 8;
      ctx.fillRect(t.x - nameW/2, nameY, nameW, 14);
      ctx.fillStyle = '#f3ead2';
      ctx.fillText(t.name, t.x, nameY + 1);
      ctx.restore();
    }

    // Condições ativas
    if (t.conditions?.length > 0) {
      const startX = t.x - (t.conditions.length * 14) / 2;
      const condY = t.y - size/2 - 26;
      t.conditions.forEach((k, idx) => {
        const cx = startX + idx * 14;
        ctx.fillStyle = 'rgba(28,17,38,0.75)';
        ctx.beginPath();
        ctx.arc(cx + 6, condY + 6, 8, 0, Math.PI * 2);
        ctx.fill();
        drawIconOnCanvas(ctx, CONDITION_MAP[k]?.icon || 'question', cx - 1, condY - 1, 14, '#c0392b');
      });
    }

    // Handle de rotação (quando selecionado) — fica no canto superior direito
    if (this.selected?.id === t.id) {
      const hx = t.x + size/2;
      const hy = t.y - size/2;
      // Linha
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(t.x + size/2 - 10, t.y - size/2 + 10);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.setLineDash([]);
      // Ponto
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(hx, hy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ═══════════════════════════════
  // CONTEXT MENU
  // ═══════════════════════════════

  _setupContextMenu() {
    this._ctxMenu    = document.getElementById('context-menu');
    this._subMenu    = document.getElementById('condition-submenu');
    this._variantMenu = document.getElementById('variant-submenu');

    this._ctxMenu.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      this._handleCtxAction(btn.dataset.action);
    });

    // Marcar/desmarcar uma condição NÃO fecha o submenu — é comum precisar
    // ligar mais de uma de uma vez (ex: "Caído" + "Machucado").
    this._subMenu.addEventListener('click', e => {
      const btn = e.target.closest('[data-condition]');
      if (!btn || !this._contextToken) return;
      this._toggleCondition(this._contextToken, btn.dataset.condition);
      this._renderConditionSubmenu(this._conditionFilter || '');
    });
    this._subMenu.addEventListener('input', e => {
      if (e.target.id !== 'condition-search') return;
      this._conditionFilter = e.target.value;
      this._renderConditionSubmenu(this._conditionFilter);
    });
    this._subMenu.addEventListener('click', e => {
      // Impede que o clique dentro do campo de busca borbulhe e feche o menu
      if (e.target.id === 'condition-search') e.stopPropagation();
    });

    this._variantMenu.addEventListener('click', e => {
      const btn = e.target.closest('[data-variant-id]');
      if (!btn || !this._contextToken || !this._variantList) return;
      const variant = this._variantList.find(v => v.id === btn.dataset.variantId);
      if (variant) this.setTokenImage(this._contextToken.id, variant.imageSrc);
      this._closeMenus();
    });

    // Fechar os menus ao clicar fora deles. IMPORTANTE: um clique num item
    // que ABRE um submenu (ex: "Versão do Token", "Condições") também
    // borbulha até aqui — se fechássemos tudo incondicionalmente, o
    // submenu abria e fechava no MESMO clique, parecendo que o botão não
    // fazia nada. Por isso ignoramos cliques que aconteceram dentro de
    // qualquer um dos três menus; cada um já fecha a si mesmo quando faz
    // sentido (ex: ao escolher uma versão do token).
    document.addEventListener('click', e => {
      if (e.target.closest('.context-menu')) return;
      this._closeMenus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this._closeMenus();
    });
  }

  showContextMenu(token, screenX, screenY) {
    this._contextToken = token;
    this._closeMenus();

    document.getElementById('ctx-token-name').textContent = token.name;

    // Ocultar/Revelar — só o Mestre vê esse item (jogadores nunca ocultam
    // tokens de outros); o texto/ícone reflete o estado atual do token.
    const visBtn = document.getElementById('ctx-toggle-visibility');
    if (visBtn) {
      visBtn.classList.toggle('hidden', !this.isGM);
      visBtn.innerHTML = token.hidden
        ? `${icon('eye')} Tornar Visível pra Todos`
        : `${icon('eyeOff')} Ocultar da Mesa`;
    }

    const menu = this._ctxMenu;
    menu.classList.remove('hidden');

    // Posicionar dentro da tela
    const W = window.innerWidth, H = window.innerHeight;
    const mW = 210, mH = 300;
    const left = Math.min(screenX, W - mW);
    const top  = Math.min(screenY, H - mH);
    menu.style.left = left + 'px';
    menu.style.top  = top + 'px';
    // Guardamos a posição real (o menu já pode ter sido fechado quando um
    // submenu precisar dela para se posicionar "ao lado de onde cliquei").
    this._lastMenuRect = { left, top, right: left + mW, bottom: top + mH };
  }

  async _handleCtxAction(action) {
    const t = this._contextToken;
    if (!t) return;
    this._closeMenus();

    switch (action) {
      case 'rename': {
        const name = await uiPrompt('Novo nome:', t.name, { title: 'Renomear Token' });
        if (name !== null) {
          t.name = name.trim() || t.name;
          this._save();
          if (t.sheetId || t.threatId) this.onStatChange(t.id, { name: t.name });
        }
        break;
      }
      case 'alter-hp': {
        const hp = await uiPrompt(`HP atual de ${t.name} (max ${t.hpMax}):`, t.hp, { title: 'Alterar Vida' });
        if (hp !== null) {
          t.hp = Math.max(0, Math.min(t.hpMax || 999, parseInt(hp) || 0));
          this._save(); this._updateInfoBar();
          if (t.sheetId || t.threatId) this.onStatChange(t.id, { hp: t.hp });
        }
        break;
      }
      case 'open-sheet': {
        this.onOpenSheet(t);
        break;
      }
      case 'rotate': {
        this.selected = t;
        this._openModal(t);
        break;
      }
      case 'flip-h': {
        t.flipH = !t.flipH; this._save(); break;
      }
      case 'flip-v': {
        t.flipV = !t.flipV; this._save(); break;
      }
      case 'resize': {
        this.selected = t;
        this._openModal(t);
        break;
      }
      case 'condition': {
        // Abrir submenu ao lado de onde o menu principal apareceu
        // (não dá pra usar getBoundingClientRect do menu principal aqui
        // porque ele já foi escondido por _closeMenus() lá em cima).
        this._conditionFilter = '';
        this._renderConditionSubmenu('');
        const sub = this._subMenu;
        sub.classList.remove('hidden');
        this._positionSubmenu(sub);
        sub.querySelector('#condition-search')?.focus();
        return; // Não fechar o menu principal
      }
      case 'variant': {
        const variants = this.onGetVariants(t);
        this._variantList = variants || [];
        const sub = this._variantMenu;
        sub.innerHTML = this._variantList.length
          ? this._variantList.map(v => `<button class="ctx-item" data-variant-id="${v.id}">${icon('image')} ${v.label}</button>`).join('')
          : `<div class="ctx-item ctx-item-disabled">Nenhuma versão cadastrada na ficha</div>`;
        sub.classList.remove('hidden');
        this._positionSubmenu(sub);
        return; // Não fechar o menu principal
      }
      case 'toggle-lock': {
        t.locked = !t.locked; this._save();
        if (!t.hidden) this.onMessage(`${t.name} ${t.locked ? 'travado' : 'destravado'}.`, 'lock');
        break;
      }
      case 'toggle-visibility': {
        t.hidden = !t.hidden; this._save();
        this.onMessage(
          t.hidden
            ? `${t.name} ficou **oculto(a)** — só o Mestre vê, até tornar visível de novo.`
            : `${t.name} agora está **visível pra todos**.`,
          t.hidden ? 'eyeOff' : 'eye',
        );
        break;
      }
      case 'delete': {
        const ok = await uiConfirm(`Deletar "${t.name}"?`, { title: 'Deletar Token', okText: 'Deletar', danger: true });
        if (ok) this.removeToken(t.id);
        break;
      }
    }
  }

  _toggleCondition(token, key) {
    if (!token.conditions) token.conditions = [];
    const idx = token.conditions.indexOf(key);
    const active = idx === -1;
    if (active) {
      token.conditions.push(key);
    } else {
      token.conditions.splice(idx, 1);
    }
    this._save();
    this._updateInfoBar();
    // Avisa a Ficha vinculada (se houver) pra ela recalcular tudo que
    // depende da condição (dados de rolagem, Defesa) automaticamente
    // enquanto a condição estiver ativa.
    if (token.sheetId || token.threatId) this.onStatChange(token.id, { conditions: token.conditions });
    const c = CONDITION_MAP[key];
    if (c && !token.hidden) this.onMessage(`${token.name} ${active ? 'ficou **' + c.label + '**' : 'não está mais **' + c.label + '**'}.`, c.icon);
  }

  // Monta o conteúdo do submenu de condições (busca + lista agrupada).
  // Reconstrói tudo a cada chamada porque a lista de condições ativas
  // pode ter mudado (mais simples e rápido o bastante pra ~40 itens).
  _renderConditionSubmenu(filter) {
    const token = this._contextToken;
    if (!token) return;
    const active = new Set(token.conditions || []);
    const q = (filter || '').toLowerCase().trim();
    const list = CONDITIONS.filter(c => !q || c.label.toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q));

    let html = `<div class="condition-search-wrap">${icon('search', 'icon-dim')}<input id="condition-search" class="condition-search-input" type="text" placeholder="Buscar condição..." value="${filter ? filter.replace(/"/g,'&quot;') : ''}"/></div>`;
    html += `<div class="condition-list">`;
    if (list.length === 0) {
      html += `<div class="ctx-item-disabled">Nenhuma condição encontrada</div>`;
    } else {
      let lastCat = null;
      for (const c of list) {
        if (c.categoria !== lastCat) {
          html += `<div class="condition-group-title">${c.categoria}</div>`;
          lastCat = c.categoria;
        }
        const isOn = active.has(c.key);
        html += `<button type="button" class="ctx-item condition-row ${isOn ? 'on' : ''}" data-condition="${c.key}" title="${conditionTooltip(c.key).replace(/"/g,'&quot;')}">
          <span class="condition-check">${isOn ? icon('check', 'icon-success') : icon('emptybox', 'icon-dim')}</span>
          <span class="condition-icon">${icon(c.icon, 'icon-accent')}</span>
          <span class="condition-label">${c.label}</span>
        </button>`;
      }
    }
    html += `</div>`;
    this._subMenu.innerHTML = html;
    // Mantém o foco no campo de busca ao digitar (o innerHTML acima recria o input)
    const input = this._subMenu.querySelector('#condition-search');
    if (input && document.activeElement !== input && filter !== undefined) {
      const pos = input.value.length;
      input.focus();
      input.setSelectionRange(pos, pos);
    }
  }

  _positionSubmenu(sub) {
    const r = this._lastMenuRect || { left: 20, top: 20, right: 230, bottom: 320 };
    const W = window.innerWidth, H = window.innerHeight;
    const isConditions = sub.id === 'condition-submenu';
    const sW = isConditions ? 240 : 220;
    const sH = isConditions ? 360 : 260; // estimativa de tamanho do submenu
    // Por padrão, encosta na borda direita do menu principal (perto de onde clicou).
    // Se não couber à direita, tenta à esquerda; senão, apenas encaixa na tela.
    let left = r.right + 2;
    if (left + sW > W) left = Math.max(0, r.left - sW - 2);
    let top = r.top;
    if (top + sH > H) top = Math.max(0, H - sH);
    sub.style.left = left + 'px';
    sub.style.top  = top + 'px';
  }

  _closeMenus() {
    this._ctxMenu.classList.add('hidden');
    this._subMenu.classList.add('hidden');
    this._variantMenu?.classList.add('hidden');
  }

  // ═══════════════════════════════
  // MODAL DE EDIÇÃO
  // ═══════════════════════════════

  _setupModal() {
    const rotInput   = document.getElementById('edit-token-rotate');
    const rotVal     = document.getElementById('edit-token-rotate-val');
    const scaleInput = document.getElementById('edit-token-scale');
    const scaleVal   = document.getElementById('edit-token-scale-val');

    rotInput.addEventListener('input', () => {
      rotVal.textContent = rotInput.value + '°';
    });
    scaleInput.addEventListener('input', () => {
      scaleVal.textContent = scaleInput.value + '%';
    });

    document.getElementById('save-token-btn').addEventListener('click', () => {
      const t = this._editingToken;
      if (!t) return;
      t.name     = document.getElementById('edit-token-name').value.trim() || t.name;
      t.hp       = parseInt(document.getElementById('edit-token-hp').value) || 0;
      t.hpMax    = parseInt(document.getElementById('edit-token-hpmax').value) || t.hpMax;
      t.mana     = parseInt(document.getElementById('edit-token-mana').value) || 0;
      t.armor    = parseInt(document.getElementById('edit-token-armor').value) || 0;
      t.rotation = (parseInt(rotInput.value) * Math.PI) / 180;
      t.scale    = parseInt(scaleInput.value) / 100;
      this._save();
      this._updateInfoBar();
      if (t.sheetId || t.threatId) this.onStatChange(t.id, { name: t.name, hp: t.hp, hpMax: t.hpMax, mana: t.mana, armor: t.armor });
      this._closeModal('modal-token');
    });

    // Fechar modais
    document.querySelectorAll('.modal-close, .btn-secondary[data-modal]').forEach(btn => {
      btn.addEventListener('click', () => this._closeModal(btn.dataset.modal));
    });
    document.querySelectorAll('.modal-backdrop').forEach(bd => {
      bd.addEventListener('click', e => {
        if (e.target === bd) this._closeModal(bd.id);
      });
    });
  }

  _openModal(t) {
    this._editingToken = t;
    document.getElementById('modal-token-title').textContent = `Editar: ${t.name}`;
    document.getElementById('edit-token-name').value  = t.name;
    document.getElementById('edit-token-hp').value    = t.hp;
    document.getElementById('edit-token-hpmax').value = t.hpMax;
    document.getElementById('edit-token-mana').value  = t.mana;
    document.getElementById('edit-token-armor').value = t.armor;

    const rotDeg = Math.round((t.rotation * 180) / Math.PI);
    document.getElementById('edit-token-rotate').value    = rotDeg;
    document.getElementById('edit-token-rotate-val').textContent = rotDeg + '°';
    document.getElementById('edit-token-scale').value     = Math.round(t.scale * 100);
    document.getElementById('edit-token-scale-val').textContent = Math.round(t.scale * 100) + '%';

    document.getElementById('modal-token').classList.remove('hidden');
  }

  _closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
  }

  // ═══════════════════════════════
  // UPLOAD DE TOKEN
  // ═══════════════════════════════

  _setupUpload() {
    const input = document.getElementById('token-upload-input');
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const src = ev.target.result;
        // Adicionar no centro do canvas visível
        const cam = this.camera;
        const cx  = (this.canvas.width / 2 - cam.x) / cam.zoom;
        const cy  = (this.canvas.height / 2 - cam.y) / cam.zoom;
        this.addToken(src, cx, cy);
        // Reforço: garante que o token novo não fique seguindo o mouse
        // (ver comentário em addToken sobre o clique fantasma do seletor
        // de arquivo do sistema operacional).
        this.dragging = null;
        this.rotating = null;
        this.onMessage(`Token adicionado à mesa.`, 'person');
      };
      reader.readAsDataURL(file);
      input.value = '';
    });

    document.getElementById('btn-add-token').addEventListener('click', () => {
      input.click();
    });
  }

  // ═══════════════════════════════
  // INFO BAR
  // ═══════════════════════════════

  _updateInfoBar() {
    const bar     = document.getElementById('token-info-bar');
    const nameEl  = document.getElementById('token-info-name');
    const hpEl    = document.getElementById('token-info-hp');

    if (this.selected) {
      bar.classList.remove('hidden');
      nameEl.textContent = this.selected.name;
      hpEl.innerHTML   = this.selected.hpMax > 0
        ? `${icon('heart', 'icon-danger')} ${this.selected.hp}/${this.selected.hpMax}`
        : '';
    } else {
      bar.classList.add('hidden');
    }
  }

  // ═══════════════════════════════
  // KEYBOARD
  // ═══════════════════════════════

  async onKeyDown(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selected && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const ok = await uiConfirm(`Deletar "${this.selected.name}"?`, { title: 'Deletar Token', okText: 'Deletar', danger: true });
        if (ok) {
          this.removeToken(this.selected.id);
        }
      }
    }
  }

  // Duplo clique: abrir modal
  onDblClick(worldX, worldY) {
    const t = this.getTokenAt(worldX, worldY);
    if (t) this._openModal(t);
  }
}
