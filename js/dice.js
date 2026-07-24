// ══════════════════════════════════
// dice.js — Sistema de Dados
// ══════════════════════════════════

import { icon, DICE_ICON_KEY } from './icons.js';

// Imagem oficial de cada dado (usada no overlay de rolagem e nos botões
// rápidos), em vez do emoji genérico — cada tipo de dado usa sua própria foto.
export const DICE_IMAGES = {
  d4: 'assets/dice/d4.png', d6: 'assets/dice/d6.png', d8: 'assets/dice/d8.png',
  d10: 'assets/dice/d10.png', d12: 'assets/dice/d12.png', d20: 'assets/dice/d20.png',
  d100: 'assets/dice/d100.png', d2: 'assets/dice/d2.png',
};

// Som reproduzido toda vez que qualquer dado é rolado.
const DICE_SOUND_SRC = 'assets/sfx/dice-roll.mp3';
let _diceAudio = null;
function playDiceSound() {
  try {
    // Clona o áudio a cada rolagem para permitir rolagens rápidas em sequência
    // (senão a 2ª rolagem cortaria o som da 1ª antes dele terminar).
    if (!_diceAudio) _diceAudio = new Audio(DICE_SOUND_SRC);
    const sfx = _diceAudio.cloneNode();
    sfx.volume = 0.6;
    sfx.play().catch(() => {}); // ignora bloqueio de autoplay do navegador
  } catch (e) { /* ambiente sem suporte a áudio — ignora silenciosamente */ }
}

/**
 * Rola uma fórmula de dados. Ex: "2d6+3", "1d20", "d8-1"
 * Retorna { rolls, total, formula, details }
 *
 * Caso especial — d20: seguindo a mecânica do sistema (ver rollNd20 em
 * sheet.js), testes em d20 nunca são somados entre si — quando há mais
 * de um dado (ex: "2d20+5", vantagem/perícia com treino), o resultado
 * usado é o MAIOR valor rolado, não a soma dos dados. Isso vale tanto
 * pros testes de perícia/atributo do personagem quanto pros testes de
 * ação das fichas de Ameaça, que usam a mesma fórmula "NdX+M".
 * Outros dados (d6, d8, d10... usados em dano) continuam somando
 * normalmente.
 */
export function rollFormula(formula) {
  const clean = formula.trim().toLowerCase().replace(/\s/g, '');
  // Suporta: NdX, NdX+M, NdX-M, dX
  const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match) return null;

  const count  = parseInt(match[1] || '1');
  const sides  = parseInt(match[2]);
  const bonus  = match[3] ? parseInt(match[3]) : 0;

  if (count < 1 || count > 50 || sides < 2 || sides > 1000) return null;

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const isD20AdvantageRoll = sides === 20 && count > 1;
  const sum   = rolls.reduce((a, b) => a + b, 0);
  const best  = Math.max(...rolls);
  const total = (isD20AdvantageRoll ? best : sum) + bonus;

  const bonusStr = bonus > 0 ? `+${bonus}` : bonus < 0 ? `${bonus}` : '';
  const diceKey  = `d${sides}`;

  return {
    rolls,
    total,
    formula: `${count}d${sides}${bonusStr}`,
    details: isD20AdvantageRoll
      ? `[${rolls.join(', ')}] → melhor: ${best}${bonusStr}`
      : count > 1 ? `[${rolls.join(', ')}]${bonusStr}` : `${rolls[0]}${bonusStr}`,
    emoji: icon(DICE_ICON_KEY[diceKey] || 'dice', 'icon-gold', 22),
    diceType: diceKey,
  };
}

/**
 * Módulo de UI dos dados
 */
export class DiceUI {
  constructor({ onRoll }) {
    this.onRoll = onRoll; // callback(result, playerName)
    this._setupEvents();
  }

  _setupEvents() {
    // Botões rápidos de dado
    document.querySelectorAll('.dice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dice = btn.dataset.dice;
        this._roll(`1${dice}`);
      });
    });

    // Fórmula customizada
    const formulaInput = document.getElementById('dice-formula-input');
    const formulaBtn   = document.getElementById('dice-roll-formula');

    formulaBtn.addEventListener('click', () => {
      const val = formulaInput.value.trim();
      if (val) this._roll(val);
    });

    formulaInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') formulaBtn.click();
    });
  }

  _roll(formula) {
    const result = rollFormula(formula);
    if (!result) {
      this._showError('Fórmula inválida. Use: 2d6+3, 1d20, d8...');
      return;
    }
    this.onRoll(result);
    this._showAnimation(result);
    this._addHistory(result);
  }

  _showAnimation(result) {
    playDiceSound();
    const overlay = document.getElementById('dice-overlay');
    const face    = document.getElementById('dice-face-display');
    const val     = document.getElementById('dice-result-value');
    const label   = document.getElementById('dice-result-label');

    const imgSrc = DICE_IMAGES[result.diceType];
    face.innerHTML = imgSrc
      ? `<img src="${imgSrc}" alt="${result.diceType}"/>`
      : result.emoji;
    val.textContent   = result.total;
    label.textContent = `${result.formula} → ${result.details}`;

    overlay.classList.remove('hidden', 'animating');
    overlay.style.display = 'flex';

    // Pequeno delay para reiniciar animação
    requestAnimationFrame(() => {
      overlay.classList.add('animating');
    });

    // Esconder após 1.8s
    clearTimeout(this._animTimeout);
    this._animTimeout = setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.style.display = '';
    }, 1800);
  }

  _addHistory(result) {
    const history = document.getElementById('dice-history');
    const item = document.createElement('div');
    item.className = 'dice-history-item';
    const imgSrc = DICE_IMAGES[result.diceType];
    const iconHtml = imgSrc
      ? `<img class="dice-history-icon" src="${imgSrc}" alt="${result.diceType}"/>`
      : `<span>${result.emoji}</span>`;
    item.innerHTML = `
      <span class="roll-desc">${iconHtml} ${result.formula}</span>
      <span class="roll-val">${result.total}</span>
    `;
    history.insertBefore(item, history.firstChild);

    // Limitar histórico visual a 20 itens
    while (history.children.length > 20) {
      history.removeChild(history.lastChild);
    }
  }

  _showError(msg) {
    const input = document.getElementById('dice-formula-input');
    input.style.borderColor = 'var(--danger)';
    input.title = msg;
    setTimeout(() => {
      input.style.borderColor = '';
      input.title = '';
    }, 2000);
  }
}
