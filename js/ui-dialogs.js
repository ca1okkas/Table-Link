// ══════════════════════════════════
// ui-dialogs.js — Substitutos estilizados para confirm()/alert()/prompt()
// nativos do navegador, seguindo a estética da mesa (mesmas classes de
// modal usadas em toda a aplicação: .modal-backdrop / .modal / .modal-header
// / .modal-body / .modal-footer).
//
// Todas as funções retornam Promises (os diálogos nativos são síncronos,
// os nossos não podem ser — por isso todo lugar que os chamava precisou
// virar async/await).
// ══════════════════════════════════

import { icon } from './icons.js';

function buildOverlay(innerHtml, extraClass = '') {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop ui-dialog-backdrop';
  overlay.innerHTML = `<div class="modal ui-dialog-box ${extraClass}">${innerHtml}</div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function closeOverlay(overlay) {
  overlay.classList.add('ui-dialog-closing');
  setTimeout(() => overlay.remove(), 120);
}

/**
 * Substitui window.alert(message). Mostra um único botão "OK".
 */
export function uiAlert(message, { title = 'Aviso', okText = 'OK' } = {}) {
  return new Promise(resolve => {
    const overlay = buildOverlay(`
      <div class="modal-header">
        <h3>${icon('warning', 'icon-warning')} ${title}</h3>
      </div>
      <div class="modal-body ui-dialog-body">${message}</div>
      <div class="modal-footer">
        <button class="btn-primary" id="ui-dialog-ok">${okText}</button>
      </div>
    `);
    const okBtn = overlay.querySelector('#ui-dialog-ok');
    const finish = () => { closeOverlay(overlay); resolve(); };
    okBtn.addEventListener('click', finish);
    okBtn.focus();
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        finish();
      }
    });
  });
}

/**
 * Substitui window.confirm(message). Retorna Promise<boolean>.
 */
export function uiConfirm(message, { title = 'Confirmar', okText = 'OK', cancelText = 'Cancelar', danger = false } = {}) {
  return new Promise(resolve => {
    const overlay = buildOverlay(`
      <div class="modal-header">
        <h3>${danger ? icon('trash', 'icon-danger') : icon('question')} ${title}</h3>
      </div>
      <div class="modal-body ui-dialog-body">${message}</div>
      <div class="modal-footer">
        <button class="btn-secondary" id="ui-dialog-cancel">${cancelText}</button>
        <button class="${danger ? 'btn-secondary danger-text' : 'btn-primary'}" id="ui-dialog-ok">${okText}</button>
      </div>
    `);
    const okBtn     = overlay.querySelector('#ui-dialog-ok');
    const cancelBtn = overlay.querySelector('#ui-dialog-cancel');
    let done = false;
    const finish = result => {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey);
      closeOverlay(overlay);
      resolve(result);
    };
    function onKey(e) {
      if (e.key === 'Enter')  finish(true);
      if (e.key === 'Escape') finish(false);
    }
    okBtn.addEventListener('click', () => finish(true));
    cancelBtn.addEventListener('click', () => finish(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) finish(false); });
    document.addEventListener('keydown', onKey);
    okBtn.focus();
  });
}

/**
 * Substitui window.prompt(message, defaultValue). Retorna Promise<string|null>
 * (null quando cancelado, igual ao prompt nativo).
 */
export function uiPrompt(message, defaultValue = '', { title = 'Digite um valor', okText = 'OK', cancelText = 'Cancelar', placeholder = '' } = {}) {
  return new Promise(resolve => {
    const overlay = buildOverlay(`
      <div class="modal-header">
        <h3>${icon('edit')} ${title}</h3>
      </div>
      <div class="modal-body ui-dialog-body">
        <label class="ui-dialog-prompt-label">${message}</label>
        <input type="text" id="ui-dialog-input" class="ui-dialog-input" placeholder="${placeholder}"/>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="ui-dialog-cancel">${cancelText}</button>
        <button class="btn-primary" id="ui-dialog-ok">${okText}</button>
      </div>
    `);
    const input     = overlay.querySelector('#ui-dialog-input');
    const okBtn     = overlay.querySelector('#ui-dialog-ok');
    const cancelBtn = overlay.querySelector('#ui-dialog-cancel');
    input.value = defaultValue ?? '';

    let done = false;
    const finish = result => {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey);
      closeOverlay(overlay);
      resolve(result);
    };
    function onKey(e) {
      if (e.key === 'Enter')  finish(input.value);
      if (e.key === 'Escape') finish(null);
    }
    okBtn.addEventListener('click', () => finish(input.value));
    cancelBtn.addEventListener('click', () => finish(null));
    overlay.addEventListener('click', e => { if (e.target === overlay) finish(null); });
    document.addEventListener('keydown', onKey);

    input.focus();
    input.select();
  });
}
