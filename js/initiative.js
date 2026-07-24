// ══════════════════════════════════
// initiative.js — Sistema de Iniciativa
// ══════════════════════════════════

import { icon } from './icons.js';

export class Initiative {
  constructor({ storage, onMessage, onCombatChange, onChange }) {
    this.storage    = storage;
    this.onMessage  = onMessage; // para mandar mensagens ao chat
    this.onCombatChange = onCombatChange || (() => {}); // (active) — avisa outros módulos (ex: barra de vida do token)
    this.onChange   = onChange   || (() => {}); // (state) — avisa a rede (sala) quando algo muda

    const saved = this.storage.getInitiative();
    this.combatants   = saved.combatants   || [];
    this.currentIndex = saved.currentIndex ?? -1;
    this.round        = saved.round        || 1;
    this.active       = saved.active       || false;

    this._setupElements();
    this._setupEvents();
    this._render();
    if (this.active) this._showCombatControls();
  }

  _setupElements() {
    this._list        = document.getElementById('initiative-list');
    this._roundNum    = document.getElementById('round-num');
    this._startBtn    = document.getElementById('btn-start-combat');
    this._combatCtrl  = document.getElementById('combat-controls');
    this._hint        = document.getElementById('initiative-hint');
    this._addForm     = document.getElementById('add-combatant-form');
    this._nameInput   = document.getElementById('combatant-name');
    this._initInput   = document.getElementById('combatant-init');
  }

  _setupEvents() {
    this._startBtn.addEventListener('click', () => this.startCombat());

    document.getElementById('btn-next-turn').addEventListener('click', () => this.nextTurn());
    document.getElementById('btn-end-combat').addEventListener('click', () => this.endCombat());

    document.getElementById('btn-add-combatant').addEventListener('click', () => {
      const name = this._nameInput.value.trim();
      const init = parseInt(this._initInput.value) || 0;
      if (!name) return;
      this.addCombatant(name, init);
      this._nameInput.value = '';
      this._initInput.value = '';
      this._nameInput.focus();
    });

    this._nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-add-combatant').click();
    });

    document.getElementById('btn-roll-all').addEventListener('click', () => {
      this.combatants.forEach(c => {
        c.initiative = Math.floor(Math.random() * 20) + 1;
      });
      this._sort();
      this._save();
      this._render();
      this.onMessage('Iniciativa rolada para todos os combatentes!', 'dice');
    });

    // Botão na toolbar
    document.getElementById('btn-combat').addEventListener('click', () => {
      // Mudar para aba de iniciativa
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('.panel-tab[data-tab="initiative"]').classList.add('active');
      document.getElementById('tab-initiative').classList.add('active');
    });
  }

  startCombat() {
    this.active = true;
    this.round  = 1;
    this.currentIndex = this.combatants.length > 0 ? 0 : -1;
    this._showCombatControls();
    this._save();
    this._render();
    this.onCombatChange(true);
    this.onMessage('Combate iniciado! Cliquem em Iniciativa na ficha para entrar na ordem.', 'swords');
  }


  endCombat() {
    this.active       = false;
    this.currentIndex = -1;
    this.round        = 1;
    this._hideCombatControls();
    this._save();
    this._render();
    this.onCombatChange(false);
    this.onMessage('Combate encerrado.', 'dove');
  }

  nextTurn() {
    if (!this.active || this.combatants.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.combatants.length;
    if (this.currentIndex === 0) {
      this.round++;
      this._roundNum.textContent = this.round;
      this.onMessage(`Rodada ${this.round} começou!`, 'repeatIcon');
    }
    const current = this.combatants[this.currentIndex];
    if (current) this.onMessage(`Turno de: **${current.name}**`, 'arrowRight');
    this._save();
    this._render();
  }

  addCombatant(name, initiative) {
    // Se esse nome já está na lista (ex: o jogador rolou de novo),
    // só atualiza o valor em vez de duplicar a entrada.
    const existing = this.combatants.find(c => c.name === name);
    if (existing) {
      existing.initiative = initiative;
    } else {
      const id = `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      this.combatants.push({ id, name, initiative });
    }
    this._sort();
    this._save();
    this._render();
  }

  removeCombatant(id) {
    const idx = this.combatants.findIndex(c => c.id === id);
    if (idx === -1) return;
    this.combatants.splice(idx, 1);
    if (this.currentIndex >= this.combatants.length) {
      this.currentIndex = 0;
    }
    this._save();
    this._render();
  }

  _sort() {
    this.combatants.sort((a, b) => b.initiative - a.initiative);
  }

  _render() {
    this._list.innerHTML = '';
    this._roundNum.textContent = this.round;

    if (this.combatants.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;color:var(--text-muted);font-size:12px;padding:20px;';
      empty.textContent = 'Nenhum combatente. Adicione abaixo.';
      this._list.appendChild(empty);
      return;
    }

    this.combatants.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = 'init-item' + (this.active && idx === this.currentIndex ? ' active-turn' : '');

      item.innerHTML = `
        <div class="init-num">${c.initiative}</div>
        <span class="init-name">${this._esc(c.name)}</span>
        <button class="init-del" data-id="${c.id}" title="Remover">${icon('close')}</button>
      `;

      item.querySelector('.init-del').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCombatant(c.id);
      });

      this._list.appendChild(item);
    });
  }

  _showCombatControls() {
    this._startBtn.classList.add('hidden');
    this._combatCtrl.classList.remove('hidden');
    this._addForm.classList.remove('hidden');
    this._roundNum.textContent = this.round;
  }

  _hideCombatControls() {
    this._startBtn.classList.remove('hidden');
    this._combatCtrl.classList.add('hidden');
  }

  _save() {
    const state = {
      combatants:   this.combatants,
      currentIndex: this.currentIndex,
      round:        this.round,
      active:       this.active,
    };
    this.storage.saveInitiative(state);
    this.onChange(state);
  }

  // Aplica um estado recebido da rede (sala) sem re-disparar broadcast
  loadState(state) {
    this.combatants   = state.combatants   || [];
    this.currentIndex = state.currentIndex ?? -1;
    this.round        = state.round        || 1;
    this.active       = state.active       || false;
    this.storage.saveInitiative(state);
    this._render();
    if (this.active) this._showCombatControls(); else this._hideCombatControls();
    this.onCombatChange(this.active);
  }

  _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
}
