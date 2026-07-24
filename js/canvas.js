// ══════════════════════════════════
// canvas.js — Canvas, Câmera, Grade, Névoa (espaço de mundo), Régua
// ══════════════════════════════════

// A névoa é armazenada num OffscreenCanvas em coordenadas de MUNDO.
// A cada frame ela é desenhada no canvas principal com a transformação
// da câmera aplicada — assim fica fixada ao mapa independente de zoom/pan.

const FOG_WORLD_SIZE = 8000; // área total de névoa em pixels de mundo
const FOG_HALF       = FOG_WORLD_SIZE / 2;

export class CanvasEngine {
  constructor({ canvasEl, fogEl, settings, onSave }) {
    this.canvas   = canvasEl;
    this.ctx      = canvasEl.getContext('2d');
    this.fogEl    = fogEl;          // canvas overlay (mantido no DOM só pra compatibilidade, não usado mais)
    this.settings = settings;
    this.onSave   = onSave;
    this.isGM     = false; // true deixa a névoa semitransparente (visão do Mestre)

    // Câmera
    this.camera = { x: 0, y: 0, zoom: 1 };

    // Mapas (vários por mesa — cada um com posição/tamanho/cadeado/visibilidade próprios)
    this.maps        = [];   // { id, name, x, y, width, height, locked, hidden, opacity, zIndex }
    this._mapImages  = {};   // id -> HTMLImageElement
    this.selectedMapId = null;
    this._mapDragging  = null; // { id, offX, offY }
    this.onMapsChanged = null; // callback(maps) — avisa o main.js pra persistir/sincronizar

    // Pan
    this.isPanning = false;
    this._panStart = null;
    this._camStart = null;

    // Régua — um traçado por pessoa (key 'local' = a minha; peerId = de
    // outra pessoa na mesa), pra todo mundo ver a régua de todo mundo ao
    // vivo, igual ao spotlight.
    this.rulers = new Map(); // key -> { x1, y1, x2, y2, color?, label? }
    this._rulerSVG = document.getElementById('ruler-svg');

    // Pings (Alt+Clique) — marcações temporárias no mapa, em coords de mundo
    this.pings = []; // { x, y, start, color }

    // Spotlight (segurar botão direito) — um "ponteiro laser" ao redor do
    // cursor, em coords de mundo, visível em tempo real por todo mundo na
    // mesa. Uma entrada por pessoa (própria = 'local', ou o peerId dela).
    this.spotlights = new Map(); // key -> { x, y, color }

    // Fog de mundo — OffscreenCanvas fixo em coordenadas de mundo
    this._fogCanvas = new OffscreenCanvas(FOG_WORLD_SIZE, FOG_WORLD_SIZE);
    this._fogCtx    = this._fogCanvas.getContext('2d');
    this._fogDirty  = false;

    // Cursor de fog (preview)
    this.fogBrushRadius = 40; // em pixels de mundo
    this._fogCursorPos  = null;
    this._fogMode       = null;

    this._initFogCanvas();
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // ─────────────────────────────────────────────
  // SETUP
  // ─────────────────────────────────────────────

  _resize() {
    const area = this.canvas.parentElement;
    this.canvas.width  = area.clientWidth;
    this.canvas.height = area.clientHeight;
    // O fogEl no DOM não é mais usado para pintar — esconder
    this.fogEl.style.display = 'none';
  }

  _initFogCanvas() {
    // Por padrão o mapa NASCE SEM névoa (totalmente visível).
    // O mestre pinta a névoa manualmente com a ferramenta [F] quando quiser
    // esconder áreas do mapa — ela não é mais aplicada automaticamente.
    this._fogCtx.clearRect(0, 0, FOG_WORLD_SIZE, FOG_WORLD_SIZE);
  }

  // ─────────────────────────────────────────────
  // CÂMERA
  // ─────────────────────────────────────────────

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.camera.x) / this.camera.zoom,
      y: (sy - this.camera.y) / this.camera.zoom,
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.camera.zoom + this.camera.x,
      y: wy * this.camera.zoom + this.camera.y,
    };
  }

  applyCamera() {
    this.ctx.setTransform(
      this.camera.zoom, 0,
      0, this.camera.zoom,
      this.camera.x, this.camera.y
    );
  }

  resetTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  centerCamera() {
    this.camera.x    = this.canvas.width  / 2;
    this.camera.y    = this.canvas.height / 2;
    this.camera.zoom = 1;
    this.onSave(this.camera);
  }

  zoom(delta, screenX, screenY) {
    const factor  = delta < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(5, this.camera.zoom * factor));
    const wx = (screenX - this.camera.x) / this.camera.zoom;
    const wy = (screenY - this.camera.y) / this.camera.zoom;
    this.camera.x    = screenX - wx * newZoom;
    this.camera.y    = screenY - wy * newZoom;
    this.camera.zoom = newZoom;
    this.onSave(this.camera);
  }

  startPan(screenX, screenY) {
    this.isPanning = true;
    this._panStart = { x: screenX, y: screenY };
    this._camStart = { x: this.camera.x, y: this.camera.y };
  }

  updatePan(screenX, screenY) {
    if (!this.isPanning) return;
    this.camera.x = this._camStart.x + (screenX - this._panStart.x);
    this.camera.y = this._camStart.y + (screenY - this._panStart.y);
  }

  endPan() {
    this.isPanning = false;
    this.onSave(this.camera);
  }

  // ─────────────────────────────────────────────
  // MAPA
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // MAPAS
  // ─────────────────────────────────────────────

  // Adiciona um mapa novo a partir de uma imagem (base64 ou URL). `opts`
  // permite recriar um mapa salvo (id, posição, tamanho, cadeado, etc.)
  // em vez de sempre nascer um mapa "novo em folha".
  addMap(src, opts = {}) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const id = opts.id || ('map_' + Date.now() + '_' + Math.random().toString(36).slice(2));
        const w  = opts.width  || img.naturalWidth;
        const h  = opts.height || img.naturalHeight;
        const map = {
          id,
          name:    opts.name || 'Mapa',
          src,
          x:       opts.x ?? -w / 2,
          y:       opts.y ?? -h / 2,
          width:   w,
          height:  h,
          locked:  opts.locked  || false,
          hidden:  opts.hidden  || false, // escondido dos jogadores (o Mestre continua vendo, esmaecido)
          opacity: opts.opacity ?? 1,
          zIndex:  opts.zIndex ?? this.maps.length,
        };
        this._mapImages[id] = img;
        this.maps.push(map);
        resolve(map);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  removeMap(id) {
    this.maps = this.maps.filter(m => m.id !== id);
    delete this._mapImages[id];
    if (this.selectedMapId === id) this.selectedMapId = null;
  }

  updateMap(id, patch) {
    const m = this.maps.find(m => m.id === id);
    if (m) Object.assign(m, patch);
    return m;
  }

  getMap(id) { return this.maps.find(m => m.id === id) || null; }

  // Carrega uma lista inteira de mapas salvos (ex: ao abrir a mesa, ou ao
  // receber o estado sincronizado de outro jogador).
  loadMaps(mapsData) {
    this.maps = [];
    this._mapImages = {};
    this.selectedMapId = null;
    return Promise.all((mapsData || []).map(m => this.addMap(m.src, m))).then(() => {});
  }

  // Acha o mapa mais "de cima" (maior zIndex) sob um ponto do mundo.
  // `ignoreLocked` = true faz mapas travados serem transparentes a cliques
  // (usado pra seleção/arraste — um mapa travado não deve ser pego sem querer).
  getMapAt(worldX, worldY, ignoreLocked = false) {
    const sorted = [...this.maps].sort((a, b) => b.zIndex - a.zIndex);
    for (const m of sorted) {
      if (ignoreLocked && m.locked) continue;
      if (worldX >= m.x && worldX <= m.x + m.width && worldY >= m.y && worldY <= m.y + m.height) {
        return m;
      }
    }
    return null;
  }

  // Seleciona/começa a arrastar um mapa (chamado no mousedown, quando
  // nenhum token estava sob o cursor). Retorna true se "pegou" algo.
  startMapDrag(worldX, worldY) {
    const m = this.getMapAt(worldX, worldY);
    if (!m) { this.selectedMapId = null; return false; }
    this.selectedMapId = m.id;
    if (!m.locked) {
      this._mapDragging = { id: m.id, offX: worldX - m.x, offY: worldY - m.y };
    }
    return true;
  }

  updateMapDrag(worldX, worldY) {
    if (!this._mapDragging) return;
    const m = this.getMap(this._mapDragging.id);
    if (!m) return;
    m.x = worldX - this._mapDragging.offX;
    m.y = worldY - this._mapDragging.offY;
  }

  endMapDrag() {
    if (this._mapDragging) {
      this._mapDragging = null;
      this.onMapsChanged?.(this.maps);
    }
  }

  // Shift+Scroll com um mapa selecionado: redimensiona mantendo a proporção.
  resizeSelectedMap(deltaY) {
    const m = this.getMap(this.selectedMapId);
    if (!m || m.locked) return;
    const cx = m.x + m.width / 2, cy = m.y + m.height / 2;
    const factor = deltaY > 0 ? 0.95 : 1.05;
    m.width  = Math.max(40, m.width  * factor);
    m.height = Math.max(40, m.height * factor);
    m.x = cx - m.width / 2;
    m.y = cy - m.height / 2;
    this.onMapsChanged?.(this.maps);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    const ctx = this.ctx;
    // Fundo fixo na tela
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--wood-dark').trim() || '#201812';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    const sorted = [...this.maps].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach(m => {
      // Mapa marcado como "escondido dos jogadores" nunca aparece pra quem
      // não é Mestre; o Mestre continua vendo, só que esmaecido e com um
      // contorno tracejado, pra saber que aquilo está oculto da mesa.
      if (m.hidden && !this.isGM) return;
      const img = this._mapImages[m.id];
      if (!img) return;

      ctx.save();
      ctx.globalAlpha = (m.hidden && this.isGM) ? Math.min(m.opacity, 0.35) : m.opacity;
      ctx.drawImage(img, m.x, m.y, m.width, m.height);

      if (m.hidden && this.isGM) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,202,99,0.85)';
        ctx.lineWidth = 2 / this.camera.zoom;
        ctx.setLineDash([8 / this.camera.zoom, 6 / this.camera.zoom]);
        ctx.strokeRect(m.x, m.y, m.width, m.height);
        ctx.setLineDash([]);
      }
      if (this.selectedMapId === m.id) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffca63';
        ctx.lineWidth = 2.5 / this.camera.zoom;
        ctx.strokeRect(m.x, m.y, m.width, m.height);
      }
      ctx.restore();
    });
  }

  drawGrid() {
    if (!this.settings.showGrid) return;
    const ctx  = this.ctx;
    const gs   = this.settings.gridSize;
    if (gs * this.camera.zoom < 8) return;

    const W  = this.canvas.width  / this.camera.zoom;
    const H  = this.canvas.height / this.camera.zoom;
    const ox = (-this.camera.x / this.camera.zoom) % gs;
    const oy = (-this.camera.y / this.camera.zoom) % gs;

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 1 / this.camera.zoom;
    ctx.beginPath();
    for (let x = -ox; x < W; x += gs) { ctx.moveTo(x - W, -H); ctx.lineTo(x - W, H * 2); }
    for (let y = -oy; y < H; y += gs) { ctx.moveTo(-W, y - H); ctx.lineTo(W * 2, y - H); }
    ctx.stroke();
    ctx.restore();
  }

  // Névoa desenhada em espaço de mundo com a câmera aplicada
  drawFog() {
    const ctx = this.ctx;
    ctx.save();
    // A câmera já está aplicada via applyCamera(), então desenhamos
    // o fog canvas nas coordenadas de mundo onde ele vive.
    // Para o Mestre a névoa fica semitransparente (ele precisa enxergar
    // tudo por baixo); para jogadores ela é totalmente opaca.
    ctx.globalAlpha = this.isGM ? 0.35 : 1;
    ctx.drawImage(this._fogCanvas, -FOG_HALF, -FOG_HALF, FOG_WORLD_SIZE, FOG_WORLD_SIZE);
    ctx.globalAlpha = 1;

    // Preview do cursor de fog
    if (this._fogCursorPos && this._fogMode) {
      const { x, y } = this._fogCursorPos;
      ctx.beginPath();
      ctx.arc(x, y, this.fogBrushRadius, 0, Math.PI * 2);
      if (this._fogMode === 'fog-reveal') {
        ctx.strokeStyle = 'rgba(100,200,255,0.8)';
        ctx.fillStyle   = 'rgba(100,200,255,0.15)';
      } else if (this._fogMode === 'fog-erase') {
        ctx.strokeStyle = 'rgba(255,100,100,0.8)';
        ctx.fillStyle   = 'rgba(255,100,100,0.15)';
      } else {
        ctx.strokeStyle = 'rgba(200,200,200,0.8)';
        ctx.fillStyle   = 'rgba(200,200,200,0.15)';
      }
      ctx.lineWidth = 1.5 / this.camera.zoom;
      ctx.setLineDash([4 / this.camera.zoom, 4 / this.camera.zoom]);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // ─────────────────────────────────────────────
  // NÉVOA — pintar em coordenadas de MUNDO
  // ─────────────────────────────────────────────

  paintFog(worldX, worldY, mode) {
    const fctx   = this._fogCtx;
    // Converter coordenada de mundo para coordenada do fogCanvas
    // O fogCanvas vai de -FOG_HALF a +FOG_HALF em coords de mundo
    const fx = worldX + FOG_HALF;
    const fy = worldY + FOG_HALF;
    const r  = this.fogBrushRadius;

    fctx.save();
    if (mode === 'fog-reveal') {
      fctx.globalCompositeOperation = 'destination-out';
      fctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      // fog-paint e fog-erase repintam névoa
      fctx.globalCompositeOperation = 'source-over';
      fctx.fillStyle = 'rgba(0,0,0,0.88)';
    }

    // Gradiente suave nas bordas do brush
    const grad = fctx.createRadialGradient(fx, fy, 0, fx, fy, r);
    if (mode === 'fog-reveal') {
      grad.addColorStop(0,   'rgba(0,0,0,1)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.9)');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      fctx.fillStyle = grad;
    } else {
      grad.addColorStop(0,   'rgba(0,0,0,0.88)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.7)');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      fctx.fillStyle = grad;
    }

    fctx.beginPath();
    fctx.arc(fx, fy, r, 0, Math.PI * 2);
    fctx.fill();
    fctx.restore();
    this._fogDirty = true;
  }

  // Revelar área retangular (em coordenadas de mundo)
  revealRect(worldX, worldY, w, h) {
    const fctx = this._fogCtx;
    fctx.save();
    fctx.globalCompositeOperation = 'destination-out';
    fctx.fillStyle = 'rgba(0,0,0,1)';
    fctx.fillRect(worldX + FOG_HALF, worldY + FOG_HALF, w, h);
    fctx.restore();
    this._fogDirty = true;
  }

  initFog() {
    this._initFogCanvas();
  }

  clearFogAll() {
    this._fogCtx.clearRect(0, 0, FOG_WORLD_SIZE, FOG_WORLD_SIZE);
    this._fogDirty = true;
  }

  // Serializar névoa para salvar (PNG base64)
  saveFog() {
    // Usar um canvas 2D temporário para exportar o OffscreenCanvas
    const tmp    = document.createElement('canvas');
    tmp.width    = FOG_WORLD_SIZE;
    tmp.height   = FOG_WORLD_SIZE;
    const tctx   = tmp.getContext('2d');
    tctx.drawImage(this._fogCanvas, 0, 0);
    // Reduzir resolução para salvar (1/4 do tamanho)
    const small  = document.createElement('canvas');
    small.width  = FOG_WORLD_SIZE / 4;
    small.height = FOG_WORLD_SIZE / 4;
    small.getContext('2d').drawImage(tmp, 0, 0, small.width, small.height);
    return small.toDataURL('image/png');
  }

  loadFog(dataURL) {
    const img = new Image();
    img.onload = () => {
      this._fogCtx.clearRect(0, 0, FOG_WORLD_SIZE, FOG_WORLD_SIZE);
      // Reescalar de volta ao tamanho completo
      this._fogCtx.drawImage(img, 0, 0, FOG_WORLD_SIZE, FOG_WORLD_SIZE);
    };
    img.src = dataURL;
  }

  // Atualizar posição do cursor de fog (chamado no mousemove)
  setFogCursor(worldX, worldY, mode) {
    this._fogCursorPos = { x: worldX, y: worldY };
    this._fogMode      = mode;
  }

  clearFogCursor() {
    this._fogCursorPos = null;
    this._fogMode      = null;
  }

  // ─────────────────────────────────────────────
  // RÉGUA
  // ─────────────────────────────────────────────

  // "local" é sempre a minha própria régua; réguas de outras pessoas na
  // mesa são guardadas por peerId (ver setRemoteRuler/clearRemoteRuler,
  // chamado pelo main.js quando chega uma atualização pela rede).
  rulerStart(worldX, worldY, color) {
    this.rulers.set('local', { x1: worldX, y1: worldY, x2: worldX, y2: worldY, color: color || '#ffba4d' });
    this._renderRulers();
  }

  rulerUpdate(worldX, worldY) {
    const r = this.rulers.get('local');
    if (!r) return;
    r.x2 = worldX;
    r.y2 = worldY;
    this._renderRulers();
  }

  rulerEnd() {
    this.rulers.delete('local');
    this._renderRulers();
  }

  // Mostra/atualiza a régua de outra pessoa na mesa (mestre ou jogador).
  setRemoteRuler(key, r) {
    this.rulers.set(key, r);
    this._renderRulers();
  }

  clearRemoteRuler(key) {
    this.rulers.delete(key);
    this._renderRulers();
  }

  _renderRulers() {
    if (this.rulers.size === 0) { this._rulerSVG.innerHTML = ''; return; }
    let html = '';
    this.rulers.forEach((r, key) => { html += this._rulerMarkup(r, key === 'local'); });
    this._rulerSVG.innerHTML = html;
  }

  _rulerMarkup(r, isLocal) {
    const s1 = this.worldToScreen(r.x1, r.y1);
    const s2 = this.worldToScreen(r.x2, r.y2);

    const dx      = r.x2 - r.x1;
    const dy      = r.y2 - r.y1;
    const pixDist = Math.sqrt(dx * dx + dy * dy);
    const squares = pixDist / (this.settings.gridSize || 60);
    const meters  = squares * (this.settings.gridScale || 1.5);

    const mx = (s1.x + s2.x) / 2;
    const my = (s1.y + s2.y) / 2;
    const color = r.color || '#ffba4d';
    const label = `${r.label ? this._escXml(r.label) + ': ' : ''}${meters.toFixed(1)} m  (${squares.toFixed(1)} sq)`;
    const lw    = label.length * 7 + 16;

    return `
      <line x1="${s1.x}" y1="${s1.y}" x2="${s2.x}" y2="${s2.y}"
        stroke="${color}" stroke-width="2.5" stroke-dasharray="8 4" stroke-linecap="round"/>
      <circle cx="${s1.x}" cy="${s1.y}" r="5" fill="${color}"/>
      <circle cx="${s2.x}" cy="${s2.y}" r="5" fill="${color}"/>
      <rect x="${mx - lw/2}" y="${my - 13}" width="${lw}" height="22" rx="5"
        fill="rgba(0,0,0,0.8)" stroke="${color}" stroke-width="1"/>
      <text x="${mx}" y="${my + 4}" text-anchor="middle"
        fill="${color}" font-size="12" font-family="monospace" font-weight="bold"
      >${label}</text>
    `;
  }

  _escXml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ─────────────────────────────────────────────
  // PING (Alt+Clique) — marcação temporária, visível a todos na mesa
  // ─────────────────────────────────────────────
  addPing(worldX, worldY, color) {
    this.pings.push({ x: worldX, y: worldY, start: performance.now(), color: color || '#ef4444' });
  }

  drawPings() {
    if (this.pings.length === 0) return;
    const now = performance.now();
    const DURATION = 1400; // ms
    this.pings = this.pings.filter(p => now - p.start < DURATION);

    const ctx = this.ctx;
    this.pings.forEach(p => {
      const t = (now - p.start) / DURATION; // 0 → 1
      const maxR = 46;
      const r1 = 10 + maxR * t;
      const r2 = Math.max(0, r1 - 16);
      const alpha = 1 - t;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 / this.camera.zoom;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r1 / this.camera.zoom, 0, Math.PI * 2);
      ctx.stroke();
      if (r2 > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r2 / this.camera.zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 / this.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ─────────────────────────────────────────────
  // SPOTLIGHT (segurar botão direito) — bolinha ao redor do cursor,
  // em coords de mundo, pra apontar algo pros outros na mesa em tempo real.
  // ─────────────────────────────────────────────
  setSpotlight(key, worldX, worldY, color) {
    this.spotlights.set(key, { x: worldX, y: worldY, color: color || '#ef4444' });
  }

  clearSpotlight(key) {
    this.spotlights.delete(key);
  }

  drawSpotlights() {
    if (this.spotlights.size === 0) return;
    const ctx = this.ctx;
    const t = performance.now() / 500; // fase da pulsação
    const pulse = 0.85 + Math.sin(t) * 0.15;
    this.spotlights.forEach(s => {
      const r = (16 * pulse) / this.camera.zoom;
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5 / this.camera.zoom;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3 / this.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
