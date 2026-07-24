// ══════════════════════════════════════════════════════════════
// threats.js — Bestiário do Mestre (Ameaças: monstros, chefes, NPCs)
//
// Segue o padrão de "ficha de ameaça" do Ordem Paranormal: cartão com
// foto/nome/VD no topo, barra de PV, e três abas — STATUS (atributos,
// perícias, sentidos, resistências), COMBATE (traços especiais + ações
// e poderes) e DESCRIÇÃO (lore).
//
// Fica guardado globalmente (Storage.getThreats()/saveThreats()), fora
// de qualquer mesa específica — um mesmo monstro costuma voltar em
// campanhas diferentes — e só existe no navegador de quem criou: como
// nunca é sincronizado pela rede, só o Mestre que o criou o vê.
// ══════════════════════════════════════════════════════════════

import { rollFormula } from './dice.js';
import { uiConfirm, uiPrompt } from './ui-dialogs.js';
import { icon } from './icons.js';
import { THREATS_SEED } from './threats-seed.js';
import { CONDITIONS, CONDITION_MAP, conditionTooltip } from './conditions.js';

const TIPOS  = ['Criatura', 'Humano', 'Entidade', 'Outro'];
const PORTES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
// Elementos paranormais (tag de VD do livro) usados pra agrupar o
// bestiário em categorias — igual ao painel de ameaças de referência
// que o usuário mostrou. "Realidade" cobre humanos/animais/ameaças
// sem elemento paranormal.
export const ELEMENTOS = ['Conhecimento', 'Energia', 'Morte', 'Sangue', 'Medo', 'Realidade'];
const ELEMENTO_ICON = {
  Conhecimento: 'brain',
  Energia: 'bolt',
  Morte: 'skull',
  Sangue: 'heart',
  Medo: 'eyeOff',
  Realidade: 'globe',
};
const ATTRS = [
  { key: 'agilidade', abbr: 'AGI' },
  { key: 'forca',     abbr: 'FOR' },
  { key: 'intelecto', abbr: 'INT' },
  { key: 'presenca',  abbr: 'PRE' },
  { key: 'vigor',     abbr: 'VIG' },
];
const FORMAS = ['Corpo a corpo', 'À distância', 'Área'];
const EXECUCOES = ['Padrão', 'Movimento', 'Completa', 'Reação', 'Livre', 'Passiva'];

function uid(prefix) { return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; }
function esc(str) { return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(str) { return esc(str).replace(/"/g, '&quot;'); }
function rollFormulaSafe(formula) { try { return rollFormula(formula); } catch { return null; } }

export class ThreatManager {
  constructor({ storage, tokenMgr = null, onChange = () => {}, onRoll = () => {}, onMessage = () => {}, onDiceMessage = () => {} }) {
    this.storage   = storage;
    this.tokenMgr  = tokenMgr; // ref ao TokenManager da mesa — só existe dentro de uma mesa de verdade;
                                // permite manter ficha de ameaça <-> token sincronizados nos dois sentidos.
    this.onChange  = onChange;
    // onRoll/onMessage/onDiceMessage só ficam disponíveis dentro da mesa
    // (o Dashboard, fora de uma mesa, não tem overlay de dados nem chat
    // pra mostrar).
    this.onRoll    = onRoll;
    this.onMessage = onMessage;
    this.onDiceMessage = onDiceMessage; // rolagens (mesma "caixinha" do painel de dados, ver chat.js → addRoll)
    this.threats   = storage.getThreats();
    this._editing  = null;
    this._tab      = 'status';
    this._combatSub = 'acoes';
    // onAddToMap só é plugado dentro de uma mesa (ver main.js) — permite
    // ao Mestre colocar um token desta ameaça no mapa direto pela ficha.
    // No Dashboard (fora de mesa) fica null e o botão correspondente nem
    // aparece no modal.
    this.onAddToMap = null;
    // Migração: fichas de ameaça salvas antes de existir o campo de
    // condições viram um array vazio; chaves inválidas (de uma versão
    // antiga de conditions.js) são descartadas.
    this.threats.forEach(t => {
      if (!Array.isArray(t.conditions)) t.conditions = [];
      t.conditions = t.conditions.filter(k => !!CONDITION_MAP[k]);
      // Migração: ameaças criadas antes de existir o campo elemento
      // (fichas do usuário, não as pré-salvas) caem em "Realidade".
      if (!ELEMENTOS.includes(t.elemento)) t.elemento = ELEMENTOS[ELEMENTOS.length - 1];
      // Migração: ameaças criadas antes de existir o link com o token
      // da mesa (ver attachToken/_pushToToken/syncFromToken abaixo).
      if (t.tokenId === undefined) t.tokenId = null;
    });
    // Correção pontual: essas 16 ameaças pré-salvas tinham o elemento
    // errado numa revisão anterior (10 delas usavam "Medo", que não é
    // uma tag de VD real nos livros; as outras 6 estavam com
    // Conhecimento em vez de Energia). Quem já tinha essas fichas
    // salvas localmente (de antes dessa correção em threats-seed.js)
    // não recebe o valor novo sozinho — _seedDefaults só adiciona
    // ameaças que faltam, nunca sobrescreve as que já existem — então
    // corrige aqui pelo id fixo, uma única vez.
    const ELEMENTO_FIX = {
      seed_op_vulto: 'Conhecimento',
      seed_op_sh_uivar: 'Energia',
      seed_op_sh_melancolia: 'Conhecimento',
      seed_op_sukkalgir: 'Energia',
      seed_op_rastejador_sombrio: 'Conhecimento',
      seed_op_viajante: 'Energia',
      seed_op_sh_espectro_inesquecido: 'Energia',
      seed_op_espreitador: 'Conhecimento',
      seed_op_infecticidio: 'Energia',
      seed_op_bicho_papao: 'Conhecimento',
      seed_op_degolificada: 'Energia',
      seed_op_estrangeiro: 'Conhecimento',
      seed_op_telopsia: 'Energia',
      seed_op_silhueta: 'Conhecimento',
      seed_op_mascara_do_desespero: 'Conhecimento',
      seed_op_anfitriao: 'Energia',
    };
    let elementoFixApplied = false;
    this.threats.forEach(t => {
      const fixed = ELEMENTO_FIX[t.id];
      if (fixed && t.elemento !== fixed) { t.elemento = fixed; elementoFixApplied = true; }
    });
    this._seedDefaults();
    if (elementoFixApplied) this._persist();
  }

  // Insere as ameaças pré-salvas do livro que ainda não foram inseridas
  // neste navegador. Roda toda vez (barato — geralmente não há nada
  // novo a inserir), e é aditivo: se novas ameaças forem adicionadas em
  // threats-seed.js numa atualização futura, elas aparecem sozinhas na
  // próxima vez que o app abrir, sem duplicar as que já existem nem
  // trazer de volta uma que o usuário decidiu apagar.
  _seedDefaults() {
    if (!THREATS_SEED.length) return;
    const seededIds = new Set(this.storage.getSeededThreatIds());
    const toAdd = THREATS_SEED.filter(t => !seededIds.has(t.id));
    if (!toAdd.length) return;
    // Cópia profunda — nunca deixa o usuário editar e sem querer mutar
    // o objeto do módulo (que seria reusado em outra aba/sessão).
    this.threats.push(...toAdd.map(t => JSON.parse(JSON.stringify(t))));
    toAdd.forEach(t => seededIds.add(t.id));
    this._persist();
    this.storage.saveSeededThreatIds([...seededIds]);
  }

  _persist() {
    this.storage.saveThreats(this.threats);
    this.onChange(this.threats);
  }

  _find(id) { return this.threats.find(t => t.id === id); }

  createThreat(name) {
    const threat = {
      id: uid('threat'),
      name: name || 'Nova Ameaça',
      photo: null,
      vd: 1,
      tipo: TIPOS[0],
      porte: PORTES[2],
      elemento: ELEMENTOS[ELEMENTOS.length - 1], // Realidade por padrão
      attrs: { agilidade: 2, forca: 2, intelecto: 2, presenca: 2, vigor: 2 },
      defesa: 10,
      deslocamento: '9m',
      pv: 20, pvMax: 20,
      pd: 0, pdMax: 0,
      pericias: [],
      sentidos: '',
      resistencias: '',
      tracos: [],
      acoes: [],
      poderes: [],
      descricao: '',
      conditions: [],
      tokenId: null,
    };
    this.threats.push(threat);
    this._persist();
    return threat;
  }

  async deleteThreat(id) {
    const t = this._find(id);
    if (t?.tokenId && this.tokenMgr) this.tokenMgr.applyExternalStats(t.tokenId, { threatId: null });
    this.threats = this.threats.filter(t => t.id !== id);
    this._persist();
  }

  // Chamado depois de tokenMgr.addThreatToken() criar o token no mapa —
  // guarda o vínculo dos dois lados (ficha.tokenId / token.threatId) pra
  // que editar HP/nome em qualquer um dos dois lados reflita no outro.
  attachToken(threatId, tokenId) {
    const t = this._find(threatId);
    if (!t) return;
    t.tokenId = tokenId;
    this._persist();
  }

  // Ficha de ameaça → token: chamado sempre que name/pv/pvMax/condições
  // mudam na ficha, pra refletir na hora no token da mesa (barra de vida,
  // nome mostrado, etc.) — mesmo padrão do SheetManager._pushToToken.
  _pushToToken(t) {
    if (!t.tokenId || !this.tokenMgr) return;
    this.tokenMgr.applyExternalStats(t.tokenId, {
      name:  t.name,
      hp:    t.pv,
      hpMax: t.pvMax,
      conditions: [...(t.conditions || [])],
    });
  }

  // Token → ficha de ameaça: chamado pelo TokenManager (via main.js) quando
  // o token é editado direto na mesa (renomear, alterar vida, condições,
  // modal de edição) — mesmo padrão do SheetManager.syncFromToken.
  syncFromToken(tokenId, patch) {
    const t = this.threats.find(x => x.tokenId === tokenId);
    if (!t) return;
    if (patch.name  !== undefined) t.name  = patch.name;
    if (patch.hp    !== undefined) t.pv    = patch.hp;
    if (patch.hpMax !== undefined) t.pvMax = patch.hpMax;
    if (patch.conditions !== undefined) t.conditions = [...patch.conditions];
    this._persist();
    if (this._editing === t.id) this._renderModal(t);
  }

  // ─── Lista (usada no Dashboard e na mesa) ──────────────────────
  // O bestiário fica separado por Elemento (Conhecimento, Energia,
  // Morte, Sangue, Medo, Realidade), cada um num bloco retangular
  // recolhível — clicar no bloco abre e mostra as ameaças daquele
  // elemento, igual a uma pasta de documentos da mesa. Cada container
  // (Dashboard e Mesa) guarda seu próprio estado de busca/blocos
  // abertos, então abrir uma categoria num lugar não mexe no outro.
  renderList(container) {
    if (!container) return;
    if (!this._panelStates) this._panelStates = new WeakMap();
    if (!this._panelStates.has(container)) {
      this._panelStates.set(container, { query: '', open: new Set() });
    }
    const state = this._panelStates.get(container);
    container.innerHTML = this._threatsPanelHtml(state);
    this._wireThreatsPanel(container, state);
  }

  _normalize(str) {
    return String(str ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  _threatsPanelHtml(state) {
    if (this.threats.length === 0) {
      return `<p class="dashboard-empty-hint">Nenhuma ameaça cadastrada ainda — clique em "+ Nova Ameaça" pra criar a primeira.</p>`;
    }
    const q = this._normalize(state.query);
    const filtered = q ? this.threats.filter(t => this._normalize(t.name).includes(q)) : this.threats;
    const groups = ELEMENTOS.map(cat => ({
      cat,
      items: filtered.filter(t => (t.elemento || 'Realidade') === cat),
    }));
    // Buscando, só mostra categorias com resultado — sem busca, mostra
    // todas as categorias (mesmo vazias), pra manter a estrutura visível.
    const visible = q ? groups.filter(g => g.items.length > 0) : groups;
    return `
      <div class="threats-search-row">
        ${icon('search', 'icon-dim')}
        <input type="text" class="threats-search-input" placeholder="Buscar ameaça..." value="${escAttr(state.query)}"/>
      </div>
      <div class="threats-categories">
        ${visible.length ? visible.map(g => this._categorySectionHtml(g, state)).join('') : '<p class="dashboard-empty-hint">Nenhuma ameaça encontrada.</p>'}
      </div>
    `;
  }

  _categorySectionHtml(g, state) {
    const isOpen = state.open.has(g.cat) || !!state.query;
    return `
      <div class="threat-cat-section ${isOpen ? 'open' : ''}" data-cat="${escAttr(g.cat)}">
        <button type="button" class="threat-cat-header">
          <span class="threat-cat-chevron">${icon('chevronRight')}</span>
          <span class="threat-cat-icon">${icon(ELEMENTO_ICON[g.cat] || 'tag')}</span>
          <span class="threat-cat-name">${esc(g.cat)}</span>
          <span class="threat-cat-count">${g.items.length}</span>
        </button>
        <div class="threat-cat-body">
          <div class="threat-cat-grid">
            ${g.items.length ? g.items.map(t => this._cardHtml(t)).join('') : '<p class="dashboard-empty-hint">Nenhuma ameaça nesta categoria.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  _cardHtml(t) {
    return `
      <button class="dashboard-sheet-card threat-card" data-id="${t.id}">
        <div class="dashboard-sheet-card-photo">${t.photo ? `<img src="${escAttr(t.photo)}" alt=""/>` : icon('skull', 'icon-dim', 26)}</div>
        <div class="dashboard-sheet-card-info">
          <strong>${esc(t.name) || 'Sem nome'}</strong>
          <span>VD ${t.vd ?? 0} · ${esc(t.tipo)} - ${esc(t.porte)}</span>
        </div>
      </button>
    `;
  }

  _wireThreatsPanel(container, state) {
    const searchInput = container.querySelector('.threats-search-input');
    searchInput?.addEventListener('input', e => {
      state.query = e.target.value;
      const pos = e.target.selectionStart;
      container.innerHTML = this._threatsPanelHtml(state);
      this._wireThreatsPanel(container, state);
      const fresh = container.querySelector('.threats-search-input');
      if (fresh) { fresh.focus(); fresh.setSelectionRange(pos, pos); }
    });

    container.querySelectorAll('.threat-cat-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.threat-cat-section');
        const cat = section.dataset.cat;
        if (state.open.has(cat)) state.open.delete(cat); else state.open.add(cat);
        section.classList.toggle('open');
      });
    });

    container.querySelectorAll('.threat-card').forEach(card => {
      card.addEventListener('click', () => this.openModal(card.dataset.id));
    });
  }

  // ─── Modal ──────────────────────────────────────────────────
  openModal(id) {
    const t = this._find(id);
    if (!t) return;
    this._editing = id;
    this._tab = 'status';
    this._combatSub = 'acoes';
    document.getElementById('modal-threat').classList.remove('hidden');
    this._renderModal(t);
  }

  closeModal() {
    document.getElementById('modal-threat').classList.add('hidden');
    this._editing = null;
  }

  // Fecha a ficha aqui e abre a mesma ficha de ameaça numa janela
  // separada (window.open), cheia — mesmo comportamento do "abrir em
  // outra janela" da Ficha de Personagem (ver SheetManager._popOut).
  _popOut(t) {
    this.closeModal();
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('popout_threat', t.id);
    const w = 720, h = 880;
    const left = Math.max(0, (window.screen.width  - w) / 2);
    const top  = Math.max(0, (window.screen.height - h) / 2);
    window.open(
      url.toString(),
      'tablelink_ameaca_' + t.id,
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  }

  _renderModal(t) {
    const root = document.getElementById('modal-threat');
    root.querySelector('.modal').innerHTML = `
      <div class="modal-header threat-modal-header">
        <h3 id="threat-modal-title">
          <button type="button" class="sheet-popout-btn" id="threat-popout-btn" title="Abrir esta ficha em outra janela">${icon('scroll')}</button> ${esc(t.name) || 'Ameaça'}
        </h3>
        <button class="modal-close" id="threat-close-x">${icon('close') || '&times;'}</button>
      </div>
      <div class="threat-card-top">
        <div class="threat-photo-thumb" id="threat-photo-thumb" title="Clique pra trocar a foto">
          ${t.photo ? `<img src="${escAttr(t.photo)}" alt=""/>` : icon('skull', 'icon-dim', 32)}
        </div>
        <input type="file" id="threat-photo-input" accept="image/*" class="hidden"/>
        <div class="threat-card-headinfo">
          <input class="threat-name-input" id="threat-name" value="${escAttr(t.name)}" placeholder="Nome da ameaça" />
          <div class="threat-headinfo-row">
            <span class="threat-vd-tag">VD: <input id="threat-vd" type="number" min="0" max="30" value="${t.vd}" /></span>
            <select id="threat-tipo">${TIPOS.map(o => `<option ${o === t.tipo ? 'selected' : ''}>${o}</option>`).join('')}</select>
            <span>-</span>
            <select id="threat-porte">${PORTES.map(o => `<option ${o === t.porte ? 'selected' : ''}>${o}</option>`).join('')}</select>
          </div>
          <div class="threat-headinfo-row">
            <span class="threat-elemento-tag">${icon('tag')} Elemento:</span>
            <select id="threat-elemento">${ELEMENTOS.map(o => `<option ${o === t.elemento ? 'selected' : ''}>${o}</option>`).join('')}</select>
          </div>
        </div>
      </div>

      <div class="threat-hp-bar">
        <button class="threat-hp-step" data-hp="pv" data-delta="-5">«</button>
        <button class="threat-hp-step" data-hp="pv" data-delta="-1">‹</button>
        <div class="threat-hp-track"><div class="threat-hp-fill" style="width:${t.pvMax > 0 ? Math.max(0, Math.min(100, t.pv / t.pvMax * 100)) : 0}%"></div>
          <span class="threat-hp-label"><input type="number" id="threat-pv" value="${t.pv}" /> / <input type="number" id="threat-pv-max" value="${t.pvMax}" /></span>
        </div>
        <button class="threat-hp-step" data-hp="pv" data-delta="1">›</button>
        <button class="threat-hp-step" data-hp="pv" data-delta="5">»</button>
      </div>

      <div class="threat-tabs">
        <button class="threat-tab-btn ${this._tab === 'status' ? 'active' : ''}" data-ttab="status">Status</button>
        <button class="threat-tab-btn ${this._tab === 'combate' ? 'active' : ''}" data-ttab="combate">Combate</button>
        <button class="threat-tab-btn ${this._tab === 'descricao' ? 'active' : ''}" data-ttab="descricao">Descrição</button>
      </div>

      <!-- Condições ativas (mesmo sistema da ficha de personagem) —
           fica visível em todas as abas, igual na ficha normal. -->
      <div class="sheet-conditions-bar" id="threat-conditions-bar">
        ${this._conditionsBarContent(t)}
      </div>

      <div class="modal-body threat-modal-body" id="threat-body"></div>

      <div class="modal-footer">
        <button class="btn-secondary danger-text" id="threat-delete-btn">${icon('trash')} Excluir</button>
        ${this.onAddToMap ? `<button class="btn-secondary" id="threat-add-map-btn">${icon('person')} Adicionar à Mesa</button>` : ''}
        <button class="btn-secondary" id="threat-close-footer">Fechar</button>
      </div>
    `;
    this._renderBody(t);
    this._wireHeader(t);
    this._bindConditionsBar(t);
  }

  // ── Condições ativas — mesmo padrão visual/funcional da Ficha de
  // Personagem (badge por condição ativa + seletor com busca) ──────
  _conditionsBarContent(t) {
    const active = t.conditions || [];
    const badges = active.map(key => {
      const c = CONDITION_MAP[key];
      if (!c) return '';
      return `<button type="button" class="condition-badge" data-remove-condition="${key}" title="${conditionTooltip(key).replace(/"/g,'&quot;')} (clique para remover)">
        <span>${icon(c.icon)}</span> ${c.label} <span class="condition-badge-x">${icon('close')}</span>
      </button>`;
    }).join('');
    return `
      <span class="conditions-bar-label">${icon('bandage')} Condições:</span>
      <div class="conditions-badge-list">${badges || '<span class="conditions-empty-hint">nenhuma</span>'}</div>
      <div class="condition-add-wrap">
        <button type="button" class="btn-add-condition" id="threat-add-condition-btn">+ Condição</button>
        <div class="condition-picker hidden" id="threat-condition-picker"></div>
      </div>`;
  }

  _renderConditionPicker(t, filter) {
    const picker = document.getElementById('threat-condition-picker');
    if (!picker) return;
    const active = new Set(t.conditions || []);
    const q = (filter || '').toLowerCase().trim();
    const list = CONDITIONS.filter(c => !q || c.label.toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q));
    let html = `<div class="condition-search-wrap">${icon('search','icon-dim')}<input id="threat-condition-search" class="condition-search-input" type="text" placeholder="Buscar condição..." value="${escAttr(filter || '')}"/></div><div class="condition-list">`;
    if (list.length === 0) {
      html += `<div class="ctx-item-disabled">Nenhuma condição encontrada</div>`;
    } else {
      let lastCat = null;
      for (const c of list) {
        if (c.categoria !== lastCat) { html += `<div class="condition-group-title">${c.categoria}</div>`; lastCat = c.categoria; }
        const isOn = active.has(c.key);
        html += `<button type="button" class="ctx-item condition-row ${isOn ? 'on' : ''}" data-toggle-condition="${c.key}" title="${conditionTooltip(c.key).replace(/"/g,'&quot;')}">
          <span class="condition-check">${isOn ? icon('check','icon-success') : icon('emptybox','icon-dim')}</span>
          <span class="condition-icon">${icon(c.icon, 'icon-accent')}</span>
          <span class="condition-label">${c.label}</span>
        </button>`;
      }
    }
    html += `</div>`;
    picker.innerHTML = html;
    const input = picker.querySelector('#threat-condition-search');
    if (input) {
      const pos = input.value.length;
      input.focus();
      input.setSelectionRange(pos, pos);
    }
  }

  _toggleThreatCondition(t, key) {
    if (!t.conditions) t.conditions = [];
    const idx = t.conditions.indexOf(key);
    if (idx === -1) t.conditions.push(key); else t.conditions.splice(idx, 1);
    this._persist();
    const bar = document.getElementById('threat-conditions-bar');
    if (bar) bar.innerHTML = this._conditionsBarContent(t);
    this._bindConditionsBar(t);
  }

  _bindConditionsBar(t) {
    const bar = document.getElementById('threat-conditions-bar');
    if (!bar) return;
    bar.querySelectorAll('[data-remove-condition]').forEach(btn => {
      btn.addEventListener('click', () => this._toggleThreatCondition(t, btn.dataset.removeCondition));
    });
    const addBtn = bar.querySelector('#threat-add-condition-btn');
    const picker = bar.querySelector('#threat-condition-picker');
    addBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = picker.classList.contains('hidden');
      picker.classList.toggle('hidden');
      if (willOpen) this._renderConditionPicker(t, '');
    });
    picker?.addEventListener('click', e => {
      e.stopPropagation();
      const toggleBtn = e.target.closest('[data-toggle-condition]');
      if (toggleBtn) this._toggleThreatCondition(t, toggleBtn.dataset.toggleCondition);
    });
    picker?.addEventListener('input', e => {
      if (e.target.id !== 'threat-condition-search') return;
      this._renderConditionPicker(t, e.target.value);
    });
    // Fecha o seletor ao clicar fora dele — registrado uma única vez
    // (não a cada re-bind, senão acumularia um listener por toggle).
    if (!this._condPickerOutsideBound) {
      this._condPickerOutsideBound = true;
      document.addEventListener('click', e => {
        const p = document.getElementById('threat-condition-picker');
        if (!p || p.classList.contains('hidden')) return;
        if (e.target.closest('#threat-condition-picker') || e.target.closest('#threat-add-condition-btn')) return;
        p.classList.add('hidden');
      });
    }
  }

  _renderBody(t) {
    const body = document.getElementById('threat-body');
    if (this._tab === 'status')        body.innerHTML = this._statusTabHtml(t);
    else if (this._tab === 'combate')  body.innerHTML = this._combatTabHtml(t);
    else                                body.innerHTML = this._descricaoTabHtml(t);
    this._wireBody(t);
  }

  // ── Aba STATUS ──────────────────────────────────────────────
  _statusTabHtml(t) {
    return `
      <div class="threat-attrs-row">
        ${ATTRS.map(a => `
          <div class="threat-attr-input">
            <span>${a.abbr}</span>
            <input type="number" min="0" max="10" data-attr="${a.key}" value="${t.attrs?.[a.key] ?? 1}" />
          </div>
        `).join('')}
      </div>
      <div class="threat-defloc-row">
        <div class="form-row"><label>Defesa</label><input type="number" id="threat-defesa" value="${t.defesa ?? 10}"/></div>
        <div class="form-row"><label>Deslocamento</label><input type="text" id="threat-deslocamento" value="${escAttr(t.deslocamento)}"/></div>
        <div class="form-row"><label>PD/Sanidade</label>
          <div class="threat-pd-inputs"><input type="number" id="threat-pd" value="${t.pd ?? 0}"/> / <input type="number" id="threat-pd-max" value="${t.pdMax ?? 0}"/></div>
        </div>
      </div>

      <div class="threat-section-title">Perícias <button class="threat-add-row-btn" id="threat-add-pericia">+ Adicionar</button></div>
      <div class="threat-pericias-list" id="threat-pericias-list">
        ${(t.pericias || []).map((p, i) => this._periciaRowHtml(p, i)).join('') || '<p class="dashboard-empty-hint">Nenhuma perícia adicionada.</p>'}
      </div>

      <div class="form-row"><label>Sentidos</label><input type="text" id="threat-sentidos" value="${escAttr(t.sentidos)}" placeholder="Ex: Percepção às cegas"/></div>
      <div class="threat-section-title">Resistências</div>
      <textarea id="threat-resistencias" rows="2" placeholder="Ex: Resistente a Frio, Imune a Medo">${esc(t.resistencias)}</textarea>
    `;
  }

  _periciaRowHtml(p, i) {
    return `
      <div class="threat-pericia-row" data-idx="${i}">
        <input class="threat-pericia-nome" data-i="${i}" value="${escAttr(p.nome)}" placeholder="Nome"/>
        <input class="threat-pericia-formula" data-i="${i}" value="${escAttr(p.formula)}" placeholder="1d20+5"/>
        <button class="threat-roll-btn" data-formula="${escAttr(p.formula)}" data-label="${escAttr(p.nome)}" title="Rolar">${icon('dice', '', 16)}</button>
        <button class="threat-remove-row-btn" data-i="${i}" title="Remover">${icon('close') || '×'}</button>
      </div>
    `;
  }

  // ── Aba COMBATE ─────────────────────────────────────────────
  _combatTabHtml(t) {
    return `
      <div class="threat-section-title">Traços Especiais <button class="threat-add-row-btn" id="threat-add-traco">+ Adicionar</button></div>
      <div class="threat-tracos-list" id="threat-tracos-list">
        ${(t.tracos || []).map((tr, i) => this._tracoRowHtml(tr, i)).join('') || '<p class="dashboard-empty-hint">Nenhum traço especial.</p>'}
      </div>

      <div class="threat-combat-sub-tabs">
        <button class="threat-subtab-btn ${this._combatSub === 'acoes' ? 'active' : ''}" data-tsub="acoes">Ações</button>
        <button class="threat-subtab-btn ${this._combatSub === 'poderes' ? 'active' : ''}" data-tsub="poderes">Poderes</button>
      </div>
      <div id="threat-combat-sub-body">
        ${this._combatSub === 'acoes' ? this._acoesHtml(t) : this._poderesHtml(t)}
      </div>
    `;
  }

  _tracoRowHtml(tr, i) {
    return `
      <div class="threat-traco-row" data-idx="${i}">
        <div class="threat-traco-head">
          <input class="threat-traco-titulo" data-i="${i}" value="${escAttr(tr.titulo)}" placeholder="Nome do traço"/>
          <span>DT</span><input class="threat-traco-dt" type="number" data-i="${i}" value="${tr.dt ?? ''}"/>
          <button class="threat-remove-row-btn" data-list="tracos" data-i="${i}" title="Remover">${icon('close') || '×'}</button>
        </div>
        <textarea class="threat-traco-desc" data-i="${i}" rows="2" placeholder="Descrição do efeito...">${esc(tr.descricao)}</textarea>
      </div>
    `;
  }

  _acoesHtml(t) {
    return `
      <button class="threat-add-row-btn" id="threat-add-acao">+ Nova Ação</button>
      <div class="threat-acoes-list" id="threat-acoes-list">
        ${(t.acoes || []).map((a, i) => this._acaoRowHtml(a, i)).join('') || '<p class="dashboard-empty-hint">Nenhuma ação cadastrada.</p>'}
      </div>
    `;
  }

  _acaoRowHtml(a, i) {
    return `
      <div class="threat-acao-card" data-idx="${i}">
        <div class="threat-acao-head-row">
          <span class="threat-acao-execucao">${esc(a.execucao || 'Padrão')} — Agredir</span>
          <button class="threat-remove-row-btn" data-list="acoes" data-i="${i}" title="Remover">${icon('close') || '×'}</button>
        </div>
        <div class="threat-acao-fields">
          <input class="threat-acao-nome" data-i="${i}" value="${escAttr(a.nome)}" placeholder="Nome (ex: Garras)"/>
          <select class="threat-acao-execucao-sel" data-i="${i}">${EXECUCOES.map(o => `<option ${o === (a.execucao || 'Padrão') ? 'selected' : ''}>${o}</option>`).join('')}</select>
          <select class="threat-acao-forma-sel" data-i="${i}">${FORMAS.map(o => `<option ${o === (a.forma || FORMAS[0]) ? 'selected' : ''}>${o}</option>`).join('')}</select>
          <input class="threat-acao-vezes" data-i="${i}" value="${escAttr(a.vezes)}" placeholder="2x (opcional)"/>
        </div>
        <div class="threat-acao-teste-row">
          <label>Teste</label>
          <input class="threat-acao-teste" data-i="${i}" value="${escAttr(a.teste)}" placeholder="2d20+5"/>
          <button class="threat-roll-btn" data-formula="${escAttr(a.teste)}" data-label="${escAttr(a.nome)}" title="Rolar teste">${icon('dice', '', 16)}</button>
        </div>
        <label class="threat-danos-label">Dano (uma linha por efeito)</label>
        <textarea class="threat-acao-danos" data-i="${i}" rows="2" placeholder="1d6 Corte&#10;5 Corte">${esc((a.danos || []).join('\n'))}</textarea>
        <div class="threat-danos-roll-row">
          ${(a.danos || []).filter(d => rollFormulaSafe((d.match(/^\S+/) || [''])[0])).map(d => {
            const formula = d.match(/^\S+/)[0];
            return `<button class="threat-roll-btn" data-formula="${escAttr(formula)}" data-label="Dano — ${escAttr(a.nome)}">${icon('dice', '', 14)} ${esc(d)}</button>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  _poderesHtml(t) {
    return `
      <button class="threat-add-row-btn" id="threat-add-poder">+ Novo Poder</button>
      <div class="threat-poderes-list" id="threat-poderes-list">
        ${(t.poderes || []).map((p, i) => this._poderRowHtml(p, i)).join('') || '<p class="dashboard-empty-hint">Nenhum poder cadastrado.</p>'}
      </div>
    `;
  }

  _poderRowHtml(p, i) {
    return `
      <div class="threat-poder-card" data-idx="${i}">
        <div class="threat-acao-head-row">
          <input class="threat-poder-nome" data-i="${i}" value="${escAttr(p.nome)}" placeholder="Nome do poder"/>
          <button class="threat-remove-row-btn" data-list="poderes" data-i="${i}" title="Remover">${icon('close') || '×'}</button>
        </div>
        <textarea class="threat-poder-desc" data-i="${i}" rows="2" placeholder="Descrição...">${esc(p.descricao)}</textarea>
      </div>
    `;
  }

  // ── Aba DESCRIÇÃO ────────────────────────────────────────────
  _descricaoTabHtml(t) {
    return `
      <div class="threat-section-title">Descrição / Lore</div>
      <textarea id="threat-descricao" rows="10" placeholder="Aparência, comportamento, origem...">${esc(t.descricao)}</textarea>
    `;
  }

  // ── Eventos ──────────────────────────────────────────────────
  _wireHeader(t) {
    const save = patch => { Object.assign(t, patch); this._persist(); this._pushToToken(t); };

    document.getElementById('threat-popout-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      this._popOut(t);
    });

    document.getElementById('threat-name').addEventListener('input', e => save({ name: e.target.value }));
    document.getElementById('threat-vd').addEventListener('input', e => save({ vd: Number(e.target.value) || 0 }));
    document.getElementById('threat-tipo').addEventListener('change', e => save({ tipo: e.target.value }));
    document.getElementById('threat-porte').addEventListener('change', e => save({ porte: e.target.value }));
    document.getElementById('threat-elemento').addEventListener('change', e => save({ elemento: e.target.value }));

    document.getElementById('threat-photo-thumb').addEventListener('click', () => document.getElementById('threat-photo-input').click());
    document.getElementById('threat-photo-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { save({ photo: reader.result }); this._renderModal(t); };
      reader.readAsDataURL(file);
    });

    document.getElementById('threat-pv').addEventListener('input', e => { save({ pv: Number(e.target.value) || 0 }); this._refreshHpBar(t); });
    document.getElementById('threat-pv-max').addEventListener('input', e => { save({ pvMax: Number(e.target.value) || 0 }); this._refreshHpBar(t); });
    document.querySelectorAll('.threat-hp-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = Number(btn.dataset.delta);
        const next = Math.max(0, Math.min(t.pvMax, (t.pv || 0) + delta));
        save({ pv: next });
        document.getElementById('threat-pv').value = next;
        this._refreshHpBar(t);
      });
    });

    document.querySelectorAll('.threat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.ttab;
        document.querySelectorAll('.threat-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        this._renderBody(t);
      });
    });

    document.getElementById('threat-delete-btn').addEventListener('click', async () => {
      const ok = await uiConfirm(`Excluir "${t.name}" permanentemente do bestiário?`, { title: 'Excluir Ameaça', okText: 'Excluir', danger: true });
      if (!ok) return;
      await this.deleteThreat(t.id);
      this.closeModal();
    });

    document.getElementById('threat-close-x').addEventListener('click', () => this.closeModal());
    document.getElementById('threat-close-footer').addEventListener('click', () => this.closeModal());

    document.getElementById('threat-add-map-btn')?.addEventListener('click', () => {
      if (this.onAddToMap) this.onAddToMap(t);
    });
  }

  _refreshHpBar(t) {
    const fill = document.querySelector('.threat-hp-fill');
    if (fill) fill.style.width = `${t.pvMax > 0 ? Math.max(0, Math.min(100, t.pv / t.pvMax * 100)) : 0}%`;
  }

  _rollField(formula, label) {
    const result = rollFormulaSafe(formula);
    if (!result) return;
    const t = this._find(this._editing);
    this.onRoll(result);
    this.onDiceMessage(t ? t.name : 'Ameaça', `${label || 'Rolagem'} → **${result.total}** (${result.details})`, 'dice', result);
  }

  _wireBody(t) {
    const body = document.getElementById('threat-body');

    // Campos simples (status/atributos/defesa/desloc/pd/sentidos/resist/descrição)
    const bind = (id, field, isNum) => {
      const el = body.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('input', () => { t[field] = isNum ? (Number(el.value) || 0) : el.value; this._persist(); });
    };
    bind('threat-defesa', 'defesa', true);
    bind('threat-deslocamento', 'deslocamento');
    bind('threat-pd', 'pd', true);
    bind('threat-pd-max', 'pdMax', true);
    bind('threat-sentidos', 'sentidos');
    bind('threat-resistencias', 'resistencias');
    bind('threat-descricao', 'descricao');

    body.querySelectorAll('.threat-attr-input input').forEach(input => {
      input.addEventListener('input', () => {
        t.attrs = t.attrs || {};
        t.attrs[input.dataset.attr] = Number(input.value) || 0;
        this._persist();
      });
    });

    // Perícias
    body.querySelectorAll('.threat-pericia-nome').forEach(input => {
      input.addEventListener('input', () => { t.pericias[+input.dataset.i].nome = input.value; this._persist(); });
    });
    body.querySelectorAll('.threat-pericia-formula').forEach(input => {
      input.addEventListener('input', () => {
        t.pericias[+input.dataset.i].formula = input.value;
        this._persist();
        const btn = input.parentElement.querySelector('.threat-roll-btn');
        if (btn) btn.dataset.formula = input.value;
      });
    });
    const addPericiaBtn = body.querySelector('#threat-add-pericia');
    if (addPericiaBtn) addPericiaBtn.addEventListener('click', () => {
      t.pericias = t.pericias || [];
      t.pericias.push({ nome: '', formula: '1d20' });
      this._persist();
      this._renderBody(t);
    });

    // Traços
    body.querySelectorAll('.threat-traco-titulo').forEach(input => {
      input.addEventListener('input', () => { t.tracos[+input.dataset.i].titulo = input.value; this._persist(); });
    });
    body.querySelectorAll('.threat-traco-dt').forEach(input => {
      input.addEventListener('input', () => { t.tracos[+input.dataset.i].dt = Number(input.value) || 0; this._persist(); });
    });
    body.querySelectorAll('.threat-traco-desc').forEach(input => {
      input.addEventListener('input', () => { t.tracos[+input.dataset.i].descricao = input.value; this._persist(); });
    });
    const addTracoBtn = body.querySelector('#threat-add-traco');
    if (addTracoBtn) addTracoBtn.addEventListener('click', () => {
      t.tracos = t.tracos || [];
      t.tracos.push({ titulo: '', dt: 15, descricao: '' });
      this._persist();
      this._renderBody(t);
    });

    // Sub-abas de Combate (Ações / Poderes)
    body.querySelectorAll('.threat-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._combatSub = btn.dataset.tsub;
        this._renderBody(t);
      });
    });

    // Ações
    body.querySelectorAll('.threat-acao-nome').forEach(input => input.addEventListener('input', () => { t.acoes[+input.dataset.i].nome = input.value; this._persist(); }));
    body.querySelectorAll('.threat-acao-execucao-sel').forEach(sel => sel.addEventListener('change', () => { t.acoes[+sel.dataset.i].execucao = sel.value; this._persist(); this._renderBody(t); }));
    body.querySelectorAll('.threat-acao-forma-sel').forEach(sel => sel.addEventListener('change', () => { t.acoes[+sel.dataset.i].forma = sel.value; this._persist(); }));
    body.querySelectorAll('.threat-acao-vezes').forEach(input => input.addEventListener('input', () => { t.acoes[+input.dataset.i].vezes = input.value; this._persist(); }));
    body.querySelectorAll('.threat-acao-teste').forEach(input => {
      input.addEventListener('input', () => {
        t.acoes[+input.dataset.i].teste = input.value;
        this._persist();
        const btn = input.parentElement.querySelector('.threat-roll-btn');
        if (btn) btn.dataset.formula = input.value;
      });
    });
    body.querySelectorAll('.threat-acao-danos').forEach(area => {
      area.addEventListener('input', () => {
        t.acoes[+area.dataset.i].danos = area.value.split('\n').map(s => s.trim()).filter(Boolean);
        this._persist();
        this._renderBody(t);
      });
    });
    const addAcaoBtn = body.querySelector('#threat-add-acao');
    if (addAcaoBtn) addAcaoBtn.addEventListener('click', () => {
      t.acoes = t.acoes || [];
      t.acoes.push({ nome: '', execucao: 'Padrão', forma: FORMAS[0], vezes: '', teste: '1d20', danos: [] });
      this._persist();
      this._renderBody(t);
    });

    // Poderes
    body.querySelectorAll('.threat-poder-nome').forEach(input => input.addEventListener('input', () => { t.poderes[+input.dataset.i].nome = input.value; this._persist(); }));
    body.querySelectorAll('.threat-poder-desc').forEach(area => area.addEventListener('input', () => { t.poderes[+area.dataset.i].descricao = area.value; this._persist(); }));
    const addPoderBtn = body.querySelector('#threat-add-poder');
    if (addPoderBtn) addPoderBtn.addEventListener('click', () => {
      t.poderes = t.poderes || [];
      t.poderes.push({ nome: '', descricao: '' });
      this._persist();
      this._renderBody(t);
    });

    // Remover linhas (perícias / traços / ações / poderes)
    body.querySelectorAll('.threat-remove-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = btn.dataset.list || 'pericias';
        const i = +btn.dataset.i;
        t[list].splice(i, 1);
        this._persist();
        this._renderBody(t);
      });
    });

    // Rolar dados (perícias / testes de ação / danos)
    body.querySelectorAll('.threat-roll-btn').forEach(btn => {
      btn.addEventListener('click', () => this._rollField(btn.dataset.formula, btn.dataset.label));
    });
  }
}
