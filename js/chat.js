// ══════════════════════════════════
// chat.js — Sistema de Chat
// ══════════════════════════════════

import { rollFormula } from './dice.js';
import { icon, DICE_ICON_KEY } from './icons.js';

export class Chat {
  constructor({ onRoll, getPlayerName, storage }) {
    this.onRoll       = onRoll;
    this.getPlayer    = getPlayerName;
    this.storage      = storage;
    this.messages     = [];
    // Chamado com CADA mensagem nova que nasce NESTE cliente (digitada,
    // rolada, ou de sistema) — main.js usa isso pra mandar pra rede.
    // Mensagens que chegam da rede entram por _receiveRemote() e não
    // disparam isso de novo (senão ficaria ecoando pra sempre).
    this.onBroadcast  = () => {};
    this._el          = document.getElementById('chat-messages');
    this._input       = document.getElementById('chat-input');
    this._setupEvents();
    this._loadHistory();
  }

  _setupEvents() {
    document.getElementById('chat-send').addEventListener('click', () => this._send());
    this._input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._send();
    });
  }

  _send() {
    const val = this._input.value.trim();
    if (!val) return;
    this._input.value = '';

    // Comando de rolagem: /r 2d6+3
    if (val.startsWith('/r ') || val.startsWith('/roll ')) {
      const formula = val.replace(/^\/r(?:oll)?\s+/, '');
      const result  = rollFormula(formula);
      if (result) {
        this.onRoll(result);
        this.addRoll(result, this.getPlayer(), DICE_ICON_KEY[result.diceType] || 'dice');
      } else {
        this.addSystem('Fórmula inválida. Tente: /r 1d20, /r 2d6+3');
      }
      return;
    }

    this.addMessage(this.getPlayer(), val);
  }

  addMessage(author, text) {
    this._push({ type: 'msg', author, text, time: this._time() });
  }

  addRoll(result, author, iconName = 'dice', customText = null) {
    const text = customText || `${result.formula} → ${result.details} = **${result.total}**`;
    this._push({ type: 'roll', author, text, icon: iconName, time: this._time(), rollResult: result });
  }

  addSystem(text, iconName = null) {
    this._push({ type: 'system', text, icon: iconName, time: this._time() });
  }

  _push(msg) {
    msg.id = msg.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    this.messages.push(msg);
    this._renderMsg(msg);
    this._el.scrollTop = this._el.scrollHeight;
    this.storage.saveChat(this.messages);
    this.onBroadcast(msg);
  }

  // Mensagem que chegou de outro cliente pela rede (ver main.js) — só
  // desenha/guarda, nunca reenvia (isso é o que evita loop infinito de
  // eco entre Mestre e jogadores).
  _receiveRemote(msg) {
    if (!msg || this.messages.some(m => m.id === msg.id)) return; // já temos essa (evita duplicar)
    this.messages.push(msg);
    this._renderMsg(msg);
    this._el.scrollTop = this._el.scrollHeight;
    this.storage.saveChat(this.messages);
  }

  _renderMsg(msg) {
    const div = document.createElement('div');

    if (msg.type === 'system') {
      div.className = 'chat-msg msg-system';
      const [iName, iCls] = (msg.icon || '').split(':');
      div.innerHTML = `${iName ? icon(iName, iCls || 'icon-dim') : ''}<span>${this._esc(msg.text)}</span>`;
    } else if (msg.type === 'roll') {
      div.className = 'chat-msg msg-roll';
      div.innerHTML = `
        <div class="msg-author">${this._esc(msg.author)} <span class="msg-time">${msg.time}</span></div>
        <div class="msg-text">${msg.icon ? icon(msg.icon, 'icon-gold') : ''}${this._esc(msg.text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        ${this._rollTooltip(msg.rollResult)}
      `;
    } else {
      div.className = 'chat-msg';
      div.innerHTML = `
        <div class="msg-author">${this._esc(msg.author)} <span class="msg-time">${msg.time}</span></div>
        <div class="msg-text">${this._esc(msg.text)}</div>
      `;
    }

    this._el.appendChild(div);
  }

  // Painel que aparece ao passar o mouse por cima de uma rolagem no chat,
  // mostrando TODOS os dados individuais daquele teste (não só o texto
  // resumido da mensagem) — útil principalmente em testes com vários d20
  // (vantagem/vários pontos na perícia), onde o texto já fica cheio.
  _rollTooltip(result) {
    if (!result || !Array.isArray(result.rolls) || result.rolls.length === 0) return '';
    const best = Math.max(...result.rolls);
    const dice = result.rolls.map(v =>
      `<span class="roll-die${result.rolls.length > 1 && v === best ? ' roll-die-best' : ''}">${v}</span>`
    ).join('');
    return `
      <div class="roll-tooltip">
        <div class="roll-tooltip-title">${this._esc(result.formula || '')}</div>
        <div class="roll-tooltip-dice">${dice}</div>
        <div class="roll-tooltip-total">Total: <strong>${result.total}</strong></div>
      </div>
    `;
  }

  _loadHistory() {
    const saved = this.storage.getChat();
    saved.forEach(msg => {
      this.messages.push(msg);
      this._renderMsg(msg);
    });
    this._el.scrollTop = this._el.scrollHeight;
  }

  _time() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
