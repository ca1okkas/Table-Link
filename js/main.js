// ══════════════════════════════════
// main.js — Orquestrador principal do TableLink
// ══════════════════════════════════

import { Storage }      from './storage.js';
import { CanvasEngine } from './canvas.js';
import { TokenManager } from './tokens.js';
import { DiceUI }       from './dice.js';
import { Chat }         from './chat.js';
import { Initiative }   from './initiative.js';
import { SheetManager } from './sheet.js';
import { ThreatManager } from './threats.js';
import { uiConfirm, uiAlert, uiPrompt } from './ui-dialogs.js';
import { NetworkManager } from './network.js';
import { icon, DICE_ICON_KEY } from './icons.js';
import * as Auth from './auth.js';

// ═══════════════════════════════════════════════
// ELEMENTOS
// ═══════════════════════════════════════════════
const loginScreen     = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const lobbyScreen      = document.getElementById('lobby-screen');
const appEl            = document.getElementById('app');

const loginTabs        = document.querySelectorAll('.login-tab');
const loginFormLogin   = document.getElementById('login-form-login');
const loginFormRegister = document.getElementById('login-form-register');
const loginIdentifierInput = document.getElementById('login-identifier-input');
const loginPasswordInput   = document.getElementById('login-password-input');
const loginErrorEl     = document.getElementById('login-error');
const loginSubmitBtn   = document.getElementById('login-btn');
const registerDisplayNameInput = document.getElementById('register-displayname-input');
const registerUsernameInput    = document.getElementById('register-username-input');
const registerEmailInput       = document.getElementById('register-email-input');
const registerPasswordInput    = document.getElementById('register-password-input');
const registerErrorEl  = document.getElementById('register-error');
const registerSubmitBtn = document.getElementById('register-btn');

const roomBadge        = document.getElementById('room-badge');
const roomBadgeIcon    = document.getElementById('room-badge-icon');
const roomBadgeText    = document.getElementById('room-badge-text');
const roomBadgeCopy    = document.getElementById('room-badge-copy');

const network = new NetworkManager();
const SOLO_TABLE_ID = 'solo';

// O menu nativo do navegador ("Recarregar", "Inspecionar elemento"...) não
// deve aparecer em cima do app — só os nossos próprios menus de contexto
// (token, mapa, etc). Vale em qualquer tela (login/dashboard/lobby/mesa).
// Deixamos passar em campos de texto pra não quebrar o "Colar" nativo neles.
document.addEventListener('contextmenu', e => {
  if (e.target.closest('input, textarea')) return;
  e.preventDefault();
});

// Mesa atualmente aberta (dashboard → lobby → mesa). null até o jogador
// escolher "Jogar Sozinho", criar uma mesa ou entrar numa.
let currentTable = null;

function tablesStatus(msg, kind) {
  const el = document.getElementById('tables-status');
  el.textContent = msg;
  el.className   = 'login-status' + (kind ? ' ' + kind : '');
  el.classList.toggle('hidden', !msg);
}

// ── Modo escuro (dossiê à luz de lanterna) ──────────────────────
// Global — funciona tanto no Dashboard quanto dentro de uma mesa (antes
// só existia o botão da mesa; agora os dois botões ficam sincronizados
// e a preferência persiste entre sessões).
function applyDarkMode(on) {
  document.documentElement.classList.toggle('dark-mode', on);
  document.querySelectorAll('#btn-darkmode, #btn-darkmode-dashboard').forEach(btn => {
    btn.innerHTML = icon(on ? 'sun' : 'moon');
    btn.title = on ? 'Modo Claro' : 'Modo Escuro';
    btn.classList.toggle('active', on);
  });
  // O selo de atributos (ficha) é ilegível no modo escuro com a arte
  // padrão — troca pela variante clara já renderizada, se a ficha
  // estiver aberta no momento do toggle.
  document.querySelectorAll('.hexflower-bg').forEach(img => {
    img.src = on ? 'assets/brand/atributos-hex-dark.png' : 'assets/brand/atributos-hex.png';
  });
}
function toggleDarkMode() {
  const on = !document.documentElement.classList.contains('dark-mode');
  localStorage.setItem('tablelink-dark-mode', on ? '1' : '0');
  applyDarkMode(on);
}
applyDarkMode(localStorage.getItem('tablelink-dark-mode') === '1');
document.getElementById('btn-darkmode-dashboard').addEventListener('click', toggleDarkMode);

// Quem sou eu dentro do elenco/roster desta mesa (pra saber quais fichas
// eu tenho permissão de remover sozinho).
function myRosterId() {
  if (network.role === 'gm')     return network.myId || 'local-gm';
  if (network.role === 'player') return network.myId;
  return 'local';
}

// Grava na Storage local (já com a mesa certa ativa) o estado que veio
// do servidor ao conectar/reconectar numa sala hospedada por ele. Isso é
// o que garante que reabrir a aba (ou abrir em outro computador) sempre
// mostra a mesa como ela está de verdade — mesmo que os jogadores tenham
// mexido em algo enquanto o Mestre estava longe — em vez de confiar
// apenas no que este navegador guardou da última vez que esteve aberto.
function hydrateTableFromServerState(state) {
  if (!state) return;
  if (state.tokens     !== undefined) Storage.saveTokens(state.tokens);
  if (state.maps       !== undefined && state.maps.length) Storage.saveMaps(state.maps);
  if (state.fog        !== undefined && state.fog !== null) Storage.saveFog(state.fog);
  if (state.initiative !== undefined) Storage.saveInitiative(state.initiative);
  if (state.chat       !== undefined && state.chat.length) Storage.saveChat(state.chat);
  if (state.roster     !== undefined) Storage.saveRoster(state.roster);
}

// Liga a ficha à rede da mesa: quem é o "dono" das fichas deste cliente,
// se a lista fica restrita só às próprias fichas (jogador), e o que fazer
// quando qualquer ficha muda (nome/foto/atributos/etc). Chamada tanto ao
// entrar no Lobby (pra já poder abrir/editar fichas em "Fichas na Mesa"
// antes mesmo de clicar "Entrar na Mesa") quanto de novo dentro da mesa
// — é seguro chamar mais de uma vez, sempre reflete o estado atual da rede.
function wireSheetNetworkSync() {
  sheetMgr.ownerId         = network.isOnline ? network.myId : 'local';
  sheetMgr.restrictToOwner = network.role === 'player';
  sheetMgr.onChange        = sheets => {
    // Mantém "Fichas na Mesa" em dia quando uma ficha do elenco muda
    // localmente (nome, foto, trilha, NEX) — o cartão do elenco só guarda
    // um resumo, não a ficha inteira.
    Storage.getRoster().forEach(e => {
      const s = sheets.find(x => x.id === e.sheetId);
      if (s) syncRosterFromSheet(s);
    });
    if (network.role === 'player') {
      // Qual ficha é "a minha" nesta mesa: a que EU pus no elenco desta
      // mesa (não uma busca por ownerId — a ficha nasceu no Dashboard
      // com ownerId 'local', que nunca bate com o id de rede efêmero
      // desta sessão; isso é o que fazia a ficha "sumir" dentro da mesa).
      const myEntry = Storage.getRoster().find(e => e.ownerId === myRosterId());
      const mine = myEntry
        ? sheets.find(s => s.id === myEntry.sheetId)
        : sheets.find(s => s.ownerId === network.myId || s.ownerId === 'local');
      if (mine) network.sendSheet(mine);
    } else if (network.isGM) {
      // O Mestre editou a ficha de um jogador direto na mesa (ex: pela
      // lista "Fichas na Mesa") — manda a versão atualizada de volta pro
      // dono, senão a tela do jogador continua com a versão antiga até
      // ele mesmo mexer em algo.
      Storage.getRoster().forEach(e => {
        if (e.ownerId === myRosterId() || !network.connections.has(e.ownerId)) return;
        const s = sheets.find(x => x.id === e.sheetId);
        if (s) network.sendTo(e.ownerId, 'sheet-update', { sheet: s });
      });
    }
    if (!dashboardScreen.classList.contains('hidden')) renderDashboardSheets();
  };
}

// ─────────────────────────────────────────────
// MODAIS (genérico) — precisa estar disponível já no Dashboard, antes de
// qualquer mesa existir, então fica no escopo do módulo (não dentro de
// init()).
// ─────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.querySelectorAll('.modal-close').forEach(btn =>
  btn.addEventListener('click', () => closeModal(btn.dataset.modal))
);
document.querySelectorAll('.modal-backdrop').forEach(bd =>
  bd.addEventListener('click', e => { if (e.target === bd) closeModal(bd.id); })
);
document.querySelectorAll('.btn-secondary[data-modal]').forEach(btn =>
  btn.addEventListener('click', () => closeModal(btn.dataset.modal))
);

// ═══════════════════════════════════════════════
// PERFIL DO JOGADOR (nome, foto, cor)
// ═══════════════════════════════════════════════
const PROFILE_COLORS = [
  '#c0392b', '#a9884f', '#7d6238', '#b8791c', '#ffca63',
  '#2563eb', '#4a7c3f', '#d97706', '#96291d', '#0891b2',
];

let profile = Storage.getPlayer() || {};
if (!profile.color) profile.color = PROFILE_COLORS[0];
let playerName = profile.name || '';

let pendingAvatar = profile.avatar || null;

function avatarHTML(src) { return src ? `<img src="${src}" alt=""/>` : icon('avatar', 'icon-dim', 22); }

// Redimensiona/comprime uma imagem (data URL) antes de guardar como
// avatar — fotos de celular vêm enormes (alguns MB) e, em base64, isso
// estourava fácil o limite de tamanho de requisição do servidor de
// contas; a foto salvava só localmente (nesta aba) mas nunca ia pro
// servidor, então "sumia" no próximo login. Reduzindo pra um quadrado
// pequeno e recomprimindo em JPEG, o avatar sempre cabe tranquilamente.
function resizeImageDataUrl(dataUrl, maxDim = 320, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL('image/jpeg', quality)); }
      catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('Não foi possível ler essa imagem.'));
    img.src = dataUrl;
  });
}

function renderDashboardProfile() {
  document.getElementById('dashboard-profile-name').textContent = profile.name || 'Jogador';
  document.getElementById('dashboard-profile-avatar').innerHTML = avatarHTML(profile.avatar);
  document.getElementById('dashboard-profile-btn').style.setProperty('--profile-color', profile.color);
}

function renderColorSwatches(selected) {
  const wrap = document.getElementById('profile-color-swatches');
  const isPreset = PROFILE_COLORS.includes(selected);
  wrap.innerHTML = PROFILE_COLORS.map(c =>
    `<button type="button" class="profile-color-swatch${c === selected ? ' selected' : ''}" data-color="${c}" style="background:${c}"></button>`
  ).join('') + `
    <label class="profile-color-swatch profile-color-custom${!isPreset ? ' selected' : ''}" data-color="${!isPreset ? selected : '#ffca63'}" style="background:${!isPreset ? selected : 'conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)'}" title="Escolher outra cor">
      <input type="color" id="profile-color-custom-input" value="${!isPreset ? selected : '#ffca63'}" class="profile-color-custom-input"/>
    </label>
  `;
  wrap.querySelectorAll('.profile-color-swatch[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.profile-color-swatch').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  const customLabel = wrap.querySelector('.profile-color-custom');
  const customInput  = document.getElementById('profile-color-custom-input');
  customInput.addEventListener('input', () => {
    wrap.querySelectorAll('.profile-color-swatch').forEach(b => b.classList.remove('selected'));
    customLabel.style.background = customInput.value;
    customLabel.dataset.color = customInput.value;
    customLabel.classList.add('selected');
  });
}

function openProfileModal() {
  document.getElementById('profile-name-input').value = profile.name || '';
  pendingAvatar = profile.avatar || null;
  document.getElementById('profile-avatar-thumb').innerHTML = avatarHTML(pendingAvatar);
  renderColorSwatches(profile.color);
  openModal('modal-profile');
}
document.getElementById('dashboard-profile-btn').addEventListener('click', openProfileModal);

document.getElementById('profile-avatar-upload-btn').addEventListener('click', () =>
  document.getElementById('profile-avatar-input').click());

document.getElementById('profile-avatar-input').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      pendingAvatar = await resizeImageDataUrl(reader.result);
    } catch (err) {
      pendingAvatar = reader.result; // fallback: usa a original se a compressão falhar
    }
    document.getElementById('profile-avatar-thumb').innerHTML = avatarHTML(pendingAvatar);
  };
  reader.readAsDataURL(file);
});
document.getElementById('profile-avatar-clear-btn').addEventListener('click', () => {
  pendingAvatar = null;
  document.getElementById('profile-avatar-thumb').innerHTML = avatarHTML(null);
});

document.getElementById('profile-save-btn').addEventListener('click', async () => {
  const name = document.getElementById('profile-name-input').value.trim();
  const swatch = document.querySelector('.profile-color-swatch.selected');
  const color  = swatch ? swatch.dataset.color : profile.color;

  profile = Storage.setPlayer({ name: name || profile.name, avatar: pendingAvatar, color });
  if (name) playerName = name;

  renderDashboardProfile();
  renderToolbarProfile();
  // Se já tiver uma mesa aberta nesta aba, atualiza a cor do brilho de
  // seleção na hora (sem precisar recarregar).
  if (activeTokenMgr) activeTokenMgr.selectionColor = color;

  closeModal('modal-profile');

  if (Auth.isLoggedIn()) {
    try {
      await Auth.updateProfile({ displayName: name || profile.name, avatar: pendingAvatar, color });
    } catch (err) {
      // IMPORTANTE: se isso falhar silenciosamente, o perfil parece salvo
      // (fica valendo nesta aba) mas na verdade nunca chegou na conta —
      // e some assim que a sessão é revalidada no próximo login. Por
      // isso avisamos explicitamente em vez de só logar no console.
      console.warn('[perfil] não deu pra sincronizar com a conta:', err.message);
      uiAlert('Suas alterações de perfil ficaram salvas neste navegador, mas não foi possível sincronizar com sua conta agora — ao entrar em outro dispositivo (ou se limpar os dados do navegador), elas podem se perder. Tente novamente, ou use uma foto menor.', { title: 'Não sincronizou com a conta' });
    }
  }
});

// ═══════════════════════════════════════════════
// FICHAS — gerenciador único, vivo desde o Dashboard (antes de entrar
// numa mesa) até dentro dela. Começa com um tokenMgr "de mentira" (sem
// mesa ainda não há tokens pra vincular); quando uma mesa é aberta,
// init() troca essa referência pela de verdade.
// ═══════════════════════════════════════════════
const noTableTokenMgr = {
  applyExternalStats() {},
  getToken() { return null; },
  getTokenList() { return []; },
};
let activeTokenMgr = null; // setado dentro de init() quando há uma mesa de verdade

const sheetMgr = new SheetManager({
  storage: Storage,
  tokenMgr: noTableTokenMgr,
  ownerId: 'local',
  onChange: () => {
    if (!dashboardScreen.classList.contains('hidden')) renderDashboardSheets();
  },
});

// ═══════════════════════════════════════════════
// AMEAÇAS — bestiário do mestre (monstros/chefes), global, vivo desde o
// Dashboard (aba "Ameaças").
// ═══════════════════════════════════════════════
const threatMgr = new ThreatManager({ storage: Storage });

// ═══════════════════════════════════════════════
// FICHA EM JANELA SEPARADA (popout)
// ═══════════════════════════════════════════════
// Aberta via window.open(...?popout_sheet=<id>) a partir do ícone no
// título da ficha (sheet.js → _popOut). Essa janela não tem mesa/canvas
// própria — ela só mostra a ficha em tela cheia e usa um BroadcastChannel
// (mesmo navegador, mesma origem) pra avisar a janela da mesa de tudo
// que precisa "cair na mesa em tempo real": rolagens de dado, mensagens
// de sistema, entrada na Iniciativa e mudanças de PV/PD/condições no
// token vinculado. Se a mesa não estiver aberta em nenhuma janela nesse
// momento, os dados são salvos normalmente (mesmo IndexedDB) e só não
// aparecem visualmente até a mesa ser aberta de novo.
const POPOUT_CHANNEL = 'tablelink-popout-sync';
const popoutSheetId  = new URLSearchParams(location.search).get('popout_sheet');
const popoutThreatId = new URLSearchParams(location.search).get('popout_threat');

if (popoutSheetId) {
  initPopoutSheetWindow(popoutSheetId);
} else if (popoutThreatId) {
  initPopoutThreatWindow(popoutThreatId);
}

// Toast simples e discreto, só usado dentro da janela popout — confirma
// visualmente que a rolagem/mensagem foi disparada pra mesa, mesmo que
// a janela da mesa não esteja aberta agora pra mostrar o resultado nela.
function popoutToast(text) {
  let wrap = document.getElementById('popout-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'popout-toast-wrap';
    wrap.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2000;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'background:rgba(20,14,10,0.92);color:#f3ead2;padding:7px 14px;border-radius:6px;font-size:12.5px;box-shadow:0 4px 14px rgba(0,0,0,0.4);border:1px solid rgba(255,202,99,0.35);opacity:0;transition:opacity 0.2s;max-width:90vw;text-align:center;';
  wrap.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 2200);
}

function initPopoutSheetWindow(sheetId) {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.add('hidden');
  appEl.classList.add('hidden');

  const bc = new BroadcastChannel(POPOUT_CHANNEL);

  sheetMgr.tokenMgr = {
    applyExternalStats: (tokenId, patch) => {
      // Persiste direto (garante que fica salvo mesmo se a mesa não
      // estiver aberta em nenhuma janela agora) e avisa a mesa, se houver.
      const tokens = Storage.getTokens();
      const t = tokens.find(x => x.id === tokenId);
      if (t) { Object.assign(t, patch); Storage.saveTokens(tokens); }
      bc.postMessage({ type: 'tokenPatch', tokenId, patch });
    },
    getToken()     { return null; },
    getTokenList() { return []; },
  };
  sheetMgr.onRoll           = result       => { bc.postMessage({ type: 'roll', payload: result }); popoutToast(`${result.formula || ''} → ${result.total}`.trim()); };
  sheetMgr.onMessage        = (msg, ic)    => { bc.postMessage({ type: 'message', payload: { msg, ic } }); popoutToast(msg); };
  sheetMgr.onRollInitiative = (name, value) => bc.postMessage({ type: 'rollInitiative', payload: { name, value } });
  sheetMgr.restrictToOwner  = false; // já era permitido abrir a ficha na janela principal
  sheetMgr.onChange         = () => bc.postMessage({ type: 'sheetsChanged' });

  const backdrop = document.getElementById('modal-sheet');
  backdrop.classList.add('popout-mode');

  const sheet = sheetMgr._find(sheetId);
  if (!sheet) {
    backdrop.classList.remove('hidden');
    document.getElementById('sheet-body').innerHTML =
      `<p style="padding:40px;text-align:center;color:var(--ink-muted)">Ficha não encontrada — pode ter sido apagada. Pode fechar esta janela.</p>`;
    document.title = 'Ficha não encontrada — TableLink';
    return;
  }

  document.title = `${sheet.name} — TableLink`;
  sheetMgr._openModal(sheet.id);

  // Aqui "fechar" a ficha é fechar a própria janela (não faz sentido só
  // esconder o modal e deixar uma janela vazia pra trás).
  document.querySelectorAll('#modal-sheet .modal-close, #modal-sheet [data-modal="modal-sheet"]')
    .forEach(btn => btn.addEventListener('click', () => window.close()));
}

// Mesma ideia de initPopoutSheetWindow, só que pra ficha de Ameaça
// (bestiário do Mestre). Como o bestiário nunca é sincronizado pela rede
// (é local a quem criou), aqui não há nada pra mandar pro network — só o
// BroadcastChannel pra avisar a janela da mesa (rolagens, mensagens de
// sistema e mudanças de PV/nome no token vinculado, se houver).
function initPopoutThreatWindow(threatId) {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.add('hidden');
  appEl.classList.add('hidden');

  const bc = new BroadcastChannel(POPOUT_CHANNEL);

  threatMgr.tokenMgr = {
    applyExternalStats: (tokenId, patch) => {
      const tokens = Storage.getTokens();
      const t = tokens.find(x => x.id === tokenId);
      if (t) { Object.assign(t, patch); Storage.saveTokens(tokens); }
      bc.postMessage({ type: 'tokenPatch', tokenId, patch });
    },
    getToken()     { return null; },
    getTokenList() { return []; },
  };
  threatMgr.onRoll    = result    => { bc.postMessage({ type: 'roll', payload: result }); popoutToast(`${result.formula || ''} → ${result.total}`.trim()); };
  threatMgr.onMessage = (msg, ic) => { bc.postMessage({ type: 'message', payload: { msg, ic } }); popoutToast(msg); };
  threatMgr.onChange  = () => bc.postMessage({ type: 'threatsChanged' });

  const backdrop = document.getElementById('modal-threat');
  backdrop.classList.add('popout-mode');

  const t = threatMgr._find(threatId);
  if (!t) {
    backdrop.classList.remove('hidden');
    backdrop.querySelector('.modal').innerHTML = `
      <div class="modal-header threat-modal-header"><h3>Ameaça não encontrada</h3></div>
      <div class="modal-body">
        <p style="padding:40px;text-align:center;color:var(--ink-muted)">Ameaça não encontrada — pode ter sido apagada. Pode fechar esta janela.</p>
      </div>
    `;
    document.title = 'Ameaça não encontrada — TableLink';
    return;
  }

  document.title = `${t.name} — TableLink`;
  threatMgr.openModal(t.id);

  document.querySelectorAll('#modal-threat .modal-close, #modal-threat #threat-close-footer')
    .forEach(btn => btn.addEventListener('click', () => window.close()));
}

function renderDashboardSheets() {
  const wrap = document.getElementById('dashboard-sheets-list');
  if (sheetMgr.sheets.length === 0) {
    wrap.innerHTML = `<p class="dashboard-empty-hint">Nenhuma ficha ainda — clique em "+ Nova Ficha" pra criar a primeira.</p>`;
    return;
  }
  wrap.innerHTML = sheetMgr.sheets.map(s => `
    <button class="dashboard-sheet-card" data-id="${s.id}">
      <div class="dashboard-sheet-card-photo">${s.photo ? `<img src="${s.photo}" alt=""/>` : icon('avatar', 'icon-dim', 26)}</div>
      <div class="dashboard-sheet-card-info">
        <strong>${s.name || 'Sem nome'}</strong>
        <span>${s.trilha || 'Sem trilha'} · NEX ${s.nex || 0}%</span>
      </div>
    </button>
  `).join('');
  wrap.querySelectorAll('.dashboard-sheet-card').forEach(card => {
    card.addEventListener('click', () => sheetMgr._openModal(card.dataset.id));
  });
}

document.getElementById('dashboard-new-sheet-btn').addEventListener('click', async () => {
  const name = await uiPrompt('Nome do personagem:', 'Novo Personagem', { title: 'Nova Ficha' });
  if (name === null) return;
  const sheet = sheetMgr.createSheet(name.trim() || 'Novo Personagem');
  renderDashboardSheets();
  sheetMgr._openModal(sheet.id);
});

// ═══════════════════════════════════════════════
// ABAS DO DASHBOARD (Mesas / Ameaças / Fichas)
// ═══════════════════════════════════════════════
document.querySelectorAll('.dashboard-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dashboard-dtab').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`dtab-${tab.dataset.dtab}`).classList.add('active');
    if (tab.dataset.dtab === 'tables')  renderDashboardTables();
    if (tab.dataset.dtab === 'threats') threatMgr.renderList(document.getElementById('dashboard-threats-list'));
    if (tab.dataset.dtab === 'sheets')  renderDashboardSheets();
  });
});

// ═══════════════════════════════════════════════
// AMEAÇAS (bestiário do mestre) — edição é tudo "ao vivo" (cada campo
// salva sozinho ao digitar), então só precisamos manter as listas
// visíveis atualizadas sempre que algo mudar.
// ═══════════════════════════════════════════════
function renderVisibleThreatLists() {
  const dashList = document.getElementById('dashboard-threats-list');
  if (dashList && document.getElementById('dtab-threats')?.classList.contains('active')) {
    threatMgr.renderList(dashList);
  }
  const inGameList = document.getElementById('in-game-threats-list');
  if (inGameList && !appEl.classList.contains('hidden')) {
    threatMgr.renderList(inGameList);
  }
}
threatMgr.onChange = renderVisibleThreatLists;

document.getElementById('dashboard-new-threat-btn').addEventListener('click', async () => {
  const name = await uiPrompt('Nome da ameaça:', 'Nova Ameaça', { title: 'Nova Ameaça' });
  if (name === null) return;
  const threat = threatMgr.createThreat(name.trim() || 'Nova Ameaça');
  threatMgr.openModal(threat.id);
});

// ═══════════════════════════════════════════════
// MESAS — listar / criar / entrar / reabrir
// ═══════════════════════════════════════════════
function tableRoleLabel(role) {
  return role === 'gm' ? 'Mestre' : role === 'player' ? 'Jogador' : 'Sozinho';
}
function tableRoleIcon(role) {
  return role === 'gm' ? icon('shield') : role === 'player' ? icon('key') : icon('dice');
}

function renderDashboardTables() {
  const wrap = document.getElementById('dashboard-tables-list');
  const tables = Storage.getTables().slice().sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0));
  if (tables.length === 0) {
    wrap.innerHTML = `<p class="dashboard-empty-hint">Nenhuma mesa ainda — crie uma ou entre com um código acima.</p>`;
    return;
  }
  wrap.innerHTML = tables.map(t => `
    <div class="dashboard-sheet-card table-card" data-id="${t.id}">
      <div class="dashboard-sheet-card-photo">${tableRoleIcon(t.role)}</div>
      <div class="dashboard-sheet-card-info">
        <strong>${t.name || 'Mesa'}</strong>
        <span>${t.role === 'player' && t.gmName ? `Mestre: ${t.gmName}` : tableRoleLabel(t.role)}${t.code ? ' · ' + t.code : ''}</span>
      </div>
      <button class="table-card-forget" data-id="${t.id}" title="Esquecer mesa">${icon('trash')}</button>
    </div>
  `).join('');
  wrap.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.table-card-forget')) return;
      openExistingTable(tables.find(t => t.id === card.dataset.id));
    });
  });
  wrap.querySelectorAll('.table-card-forget').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const ok = await uiConfirm('Esquecer esta mesa? Isso só remove o atalho — nada é apagado.', { title: 'Esquecer Mesa' });
      if (!ok) return;
      Storage.removeTable(btn.dataset.id);
      renderDashboardTables();
    });
  });
}

document.getElementById('dashboard-solo-btn').addEventListener('click', () => {
  const table = { id: SOLO_TABLE_ID, name: 'Mesa Solo', role: 'solo', code: null };
  Storage.setActiveTable(SOLO_TABLE_ID);
  openLobby(table);
});

document.getElementById('dashboard-create-table-btn').addEventListener('click', async () => {
  const name = await uiPrompt('Nome da mesa:', `Mesa de ${playerName}`, { title: 'Criar Mesa' });
  if (name === null) return;
  tablesStatus('Criando mesa...');
  try {
    const { code, state } = await network.createRoom(playerName);
    const table = Storage.upsertTable({
      id: code, name: name.trim() || `Mesa de ${playerName}`, role: 'gm', code,
      createdAt: Date.now(), lastOpenedAt: Date.now(),
    });
    Storage.setActiveTable(code);
    hydrateTableFromServerState(state);
    tablesStatus(`Mesa criada! Código: ${code}`, 'success');
    openLobby(table);
  } catch (err) {
    tablesStatus(err.message || 'Erro ao criar a mesa. Tente novamente.', 'error');
  }
});

document.getElementById('dashboard-join-table-btn').addEventListener('click', async () => {
  const code = await uiPrompt('Código da mesa:', '', { title: 'Entrar com Código', placeholder: 'Ex: AB3XZ' });
  if (code === null || !code.trim()) return;
  const upperCode = code.trim().toUpperCase();
  tablesStatus('Conectando à mesa...');
  try {
    const { state } = await network.joinRoom(upperCode, playerName, { avatar: profile.avatar, color: profile.color });
    const table = Storage.upsertTable({
      id: upperCode, name: `Mesa ${upperCode}`, role: 'player', code: upperCode,
      createdAt: Date.now(), lastOpenedAt: Date.now(),
    });
    Storage.setActiveTable(upperCode);
    hydrateTableFromServerState(state);
    tablesStatus('Conectado!', 'success');
    openLobby(table);
  } catch (err) {
    tablesStatus(err.message || 'Não foi possível entrar na mesa. Confira o código.', 'error');
  }
});

async function openExistingTable(table) {
  if (!table) return;
  if (table.role === 'solo') {
    Storage.setActiveTable(table.id);
    openLobby(table);
    return;
  }
  tablesStatus(table.role === 'gm' ? 'Reabrindo sua mesa...' : 'Conectando à mesa...');
  try {
    Storage.setActiveTable(table.id);
    if (table.role === 'gm') {
      const { state } = await network.createRoom(playerName, table.code);
      hydrateTableFromServerState(state);
    } else {
      const { state } = await network.joinRoom(table.code, playerName, { avatar: profile.avatar, color: profile.color });
      hydrateTableFromServerState(state);
    }
    Storage.upsertTable({ id: table.id, lastOpenedAt: Date.now() });
    tablesStatus('');
    openLobby(table);
  } catch (err) {
    tablesStatus(err.message || 'Não foi possível abrir esta mesa agora.', 'error');
  }
}

// ═══════════════════════════════════════════════
// SALA DE ESPERA (Lobby) — entre escolher/criar a mesa e jogar de fato
// ═══════════════════════════════════════════════
function refreshRosterUI() {
  if (!lobbyScreen.classList.contains('hidden')) renderLobbyRoster();
}

function renderLobbyRoster() {
  const wrap = document.getElementById('lobby-roster-list');
  const roster = Storage.getRoster();
  if (roster.length === 0) {
    wrap.innerHTML = `<p class="dashboard-empty-hint">Nenhuma ficha na mesa ainda — clique em "+ Adicionar Ficha".</p>`;
    return;
  }
  const me = myRosterId();
  wrap.innerHTML = roster.map(e => {
    const canRemove = network.isGM || e.ownerId === me;
    // O Mestre pode abrir e editar a ficha de qualquer um na mesa; um
    // jogador comum só pode abrir a própria.
    const canOpen = network.isGM || e.ownerId === me;
    return `
      <div class="dashboard-sheet-card roster-card ${canOpen ? 'clickable' : ''}" data-sheet="${e.sheetId}">
        <div class="dashboard-sheet-card-photo">${e.photo ? `<img src="${e.photo}" alt=""/>` : icon('avatar', 'icon-dim', 26)}</div>
        <div class="dashboard-sheet-card-info">
          <strong>${e.name || 'Sem nome'}</strong>
          <span>${e.trilha || 'Sem trilha'} · NEX ${e.nex || 0}% · ${e.ownerName}</span>
        </div>
        ${canRemove ? `<button class="table-card-forget" data-sheet="${e.sheetId}" data-owner="${e.ownerId}" title="Remover da mesa">${icon('trash')}</button>` : ''}
      </div>
    `;
  }).join('');
  wrap.querySelectorAll('.roster-card.clickable').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.table-card-forget')) return;
      const sheet = sheetMgr.sheets.find(s => s.id === card.dataset.sheet);
      if (sheet) {
        sheetMgr._openModal(sheet.id);
      } else {
        uiAlert('Essa ficha ainda está sincronizando — tente de novo em instantes.', { title: 'Aguarde' });
      }
    });
  });
  wrap.querySelectorAll('.table-card-forget').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeFromRoster(btn.dataset.sheet, btn.dataset.owner);
    });
  });
}

// Mantém o resumo salvo no elenco ("Fichas na Mesa") em dia com a ficha
// de verdade sempre que ela muda — nome, foto, trilha e NEX podem ter
// sido editados bem depois da ficha já ter entrado na mesa, e o cartão
// do elenco só guarda uma cópia desses campos (não a ficha inteira).
function syncRosterFromSheet(sheet) {
  if (!sheet) return;
  const roster = Storage.getRoster();
  const idx = roster.findIndex(e => e.sheetId === sheet.id);
  if (idx === -1) return;
  const entry = roster[idx];
  if (entry.name === sheet.name && entry.photo === sheet.photo &&
      entry.trilha === sheet.trilha && entry.nex === sheet.nex) return; // nada mudou
  roster[idx] = { ...entry, name: sheet.name, photo: sheet.photo, trilha: sheet.trilha, nex: sheet.nex };
  Storage.saveRoster(roster);
  if (network.isGM) network.broadcastRoster(roster);
  refreshRosterUI();
}

function addToRoster(sheet) {
  const entry = {
    sheetId: sheet.id, ownerId: myRosterId(), ownerName: profile.name || 'Jogador',
    name: sheet.name, photo: sheet.photo, trilha: sheet.trilha, nex: sheet.nex, addedAt: Date.now(),
  };
  if (network.role === 'player') {
    network.sendRosterRequest('add', entry);
    // Manda a ficha completa também (não só o resumo do elenco) — é assim
    // que o Mestre consegue de fato abrir e editar essa ficha na mesa.
    network.sendSheet(sheet);
  } else {
    const roster = Storage.getRoster().filter(e => e.sheetId !== entry.sheetId);
    roster.push(entry);
    Storage.saveRoster(roster);
    if (network.isGM) network.broadcastRoster(roster);
    renderLobbyRoster();
  }
}

function removeFromRoster(sheetId, ownerId) {
  if (network.role === 'player' && ownerId === myRosterId()) {
    network.sendRosterRequest('remove', { sheetId });
  } else {
    // Mestre local (ou modo solo) remove direto — não exclui a ficha, só
    // tira ela do elenco desta mesa.
    const roster = Storage.getRoster().filter(e => !(e.sheetId === sheetId && e.ownerId === ownerId));
    Storage.saveRoster(roster);
    if (network.isGM) network.broadcastRoster(roster);
    renderLobbyRoster();
  }
}

function renderAddSheetPicker() {
  const wrap = document.getElementById('add-sheet-picker-list');
  const inRoster = new Set(Storage.getRoster().filter(e => e.ownerId === myRosterId()).map(e => e.sheetId));
  const mine = sheetMgr.sheets.filter(s => !inRoster.has(s.id));
  if (mine.length === 0) {
    wrap.innerHTML = `<p class="dashboard-empty-hint">Todas as suas fichas já estão na mesa — ou crie uma nova acima.</p>`;
    return;
  }
  wrap.innerHTML = mine.map(s => `
    <button class="dashboard-sheet-card" data-id="${s.id}">
      <div class="dashboard-sheet-card-photo">${s.photo ? `<img src="${s.photo}" alt=""/>` : icon('avatar', 'icon-dim', 26)}</div>
      <div class="dashboard-sheet-card-info">
        <strong>${s.name || 'Sem nome'}</strong>
        <span>${s.trilha || 'Sem trilha'} · NEX ${s.nex || 0}%</span>
      </div>
    </button>
  `).join('');
  wrap.querySelectorAll('.dashboard-sheet-card').forEach(card => {
    card.addEventListener('click', () => {
      addToRoster(sheetMgr.sheets.find(s => s.id === card.dataset.id));
      closeModal('modal-add-sheet');
    });
  });
}

document.getElementById('lobby-add-sheet-btn').addEventListener('click', () => {
  renderAddSheetPicker();
  openModal('modal-add-sheet');
});
document.getElementById('add-sheet-create-new').addEventListener('click', async () => {
  const name = await uiPrompt('Nome do personagem:', 'Novo Personagem', { title: 'Nova Ficha' });
  if (name === null) return;
  const sheet = sheetMgr.createSheet(name.trim() || 'Novo Personagem');
  addToRoster(sheet);
  closeModal('modal-add-sheet');
  sheetMgr._openModal(sheet.id);
});

function renderLobbyPlayers() {
  const listEl  = document.getElementById('lobby-players-list');
  const members = Storage.getMembers();
  // Quem está online AGORA (socket ativo com o servidor da sala), indexado
  // por nome — é o nome que usamos como identidade estável (o id de rede
  // muda a cada reconexão de um jogador).
  const online = new Map(
    [...network.connections.entries()]
      .filter(([, info]) => info.name && info.name !== '?')
      .map(([peerId, info]) => [info.name, { peerId, ...info }])
  );
  // Todo mundo que já esteve nesta mesa (persistido) + qualquer conectado
  // agora que ainda não tenha sido salvo (evita "sumir" por um instante).
  const names = new Set([...members.map(m => m.name), ...online.keys()]);
  if (names.size === 0) {
    listEl.innerHTML = `<p class="dashboard-empty-hint">Ninguém entrou nesta mesa ainda — compartilhe o código acima.</p>`;
    return;
  }
  const rows = [...names].sort((a, b) => {
    const aOn = online.has(a), bOn = online.has(b);
    if (aOn !== bOn) return aOn ? -1 : 1; // online primeiro
    return a.localeCompare(b);
  });
  listEl.innerHTML = rows.map(name => {
    const live    = online.get(name);
    const saved   = members.find(m => m.name === name);
    const avatar  = live?.avatar || saved?.avatar || null;
    const isOnline = !!live;
    return `
      <div class="lobby-player-row">
        <span>
          <span class="lobby-player-avatar ${isOnline ? 'is-online' : 'is-offline'}">${avatar ? `<img src="${avatar}" alt=""/>` : icon('person', 'icon-dim')}</span>
          ${name}
          <span class="lobby-player-status">${isOnline ? 'online' : 'offline'}</span>
        </span>
        ${live ? `<button class="btn-secondary danger-text lobby-kick-btn" data-peer="${live.peerId}">Expulsar</button>` : ''}
      </div>
    `;
  }).join('');
  listEl.querySelectorAll('.lobby-kick-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await uiConfirm('Expulsar este jogador da mesa?', { title: 'Expulsar Jogador', danger: true, okText: 'Expulsar' });
      if (!ok) return;
      const peerId = btn.dataset.peer;
      network.kickPlayer(peerId);
      const roster = Storage.getRoster().filter(e => e.ownerId !== peerId);
      Storage.saveRoster(roster);
      network.broadcastRoster(roster);
      renderLobbyRoster();
    });
  });
}

function openLobby(table) {
  currentTable = table;
  dashboardScreen.classList.add('hidden');
  lobbyScreen.classList.remove('hidden');

  document.getElementById('lobby-title').textContent = table.name;
  const badge = document.getElementById('lobby-role-badge');
  badge.textContent = tableRoleLabel(table.role);
  badge.className = 'lobby-role-badge role-' + table.role;

  const inviteRow = document.getElementById('lobby-invite-row');
  inviteRow.classList.toggle('hidden', !network.isOnline);
  if (network.isOnline) document.getElementById('lobby-invite-code').textContent = table.code;

  document.getElementById('lobby-players-section').classList.toggle('hidden', !network.isGM);
  if (network.isGM) renderLobbyPlayers();

  wireSheetNetworkSync();
  renderLobbyRoster();
  _applyPendingWelcome();
}

document.getElementById('lobby-invite-copy-btn').addEventListener('click', () => {
  const code = document.getElementById('lobby-invite-code').textContent;
  navigator.clipboard?.writeText(code).catch(() => {});
  const btn = document.getElementById('lobby-invite-copy-btn');
  const original = btn.innerHTML;
  btn.innerHTML = `${icon('check')} Copiado!`;
  setTimeout(() => { btn.innerHTML = original; }, 1500);
});

document.getElementById('lobby-back-btn').addEventListener('click', async () => {
  if (network.isOnline) {
    const ok = await uiConfirm('Voltar ao Dashboard sai da mesa agora. Você pode reabrir ela depois pela lista de Mesas.', { title: 'Voltar ao Dashboard' });
    if (!ok) return;
    network.disconnect();
  }
  currentTable = null;
  threatMgr.onAddToMap = null; // fora de mesa não há mapa/tokenMgr pra receber ameaças
  lobbyScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  renderDashboardTables();
});

document.getElementById('lobby-enter-btn').addEventListener('click', () => startApp());

// Handlers de rede que precisam estar ativos já no Lobby (antes de init()).
network.on('peer-list', () => {
  // Guarda cada jogador conectado como "membro" desta mesa — assim ele
  // continua aparecendo na lista mesmo depois de desconectar (a lista de
  // conexões ativas do servidor, essa sim, esvazia na hora).
  if (network.isGM) {
    network.connections.forEach(info => {
      if (info.name && info.name !== '?') {
        Storage.upsertMember({ name: info.name, avatar: info.avatar, color: info.color });
      }
    });
  }
  if (!lobbyScreen.classList.contains('hidden')) renderLobbyPlayers();
});
network.on('roster', payload => { Storage.saveRoster(payload); refreshRosterUI(); });
network.on('roster-request', ({ peerId, op, payload }) => {
  const info = network.connections.get(peerId);
  let roster = Storage.getRoster();
  if (op === 'add') {
    payload.ownerId   = peerId;
    payload.ownerName = info?.name || payload.ownerName || 'Jogador';
    roster = roster.filter(e => e.sheetId !== payload.sheetId || e.ownerId !== peerId);
    roster.push(payload);
  } else if (op === 'remove') {
    roster = roster.filter(e => !(e.sheetId === payload.sheetId && e.ownerId === peerId));
  }
  Storage.saveRoster(roster);
  network.broadcastRoster(roster);
  refreshRosterUI();
});
network.on('kicked', async () => {
  await uiAlert('Você foi expulso desta mesa pelo Mestre.', { title: 'Expulso da Mesa' });
  location.reload();
});
// Assim que alguém entra na sala, o Mestre avisa o nome de verdade da
// mesa (o jogador, ao entrar só com o código, só conhece o código —
// nunca o nome que o Mestre deu à mesa) e o próprio nome dele. Registrado
// já no escopo do módulo pra funcionar mesmo com o Mestre ainda no Lobby
// (antes de clicar "Entrar na Mesa").
network.on('player-joined', ({ peerId }) => {
  if (network.isGM && currentTable) {
    network.sendTo(peerId, 'welcome', { tableName: currentTable.name, gmName: playerName });
  }
});
// Guarda o "welcome" recebido até existir uma mesa ativa (`currentTable`)
// pra aplicar nela — a mensagem pode chegar bem cedo, antes até do Lobby
// abrir de vez.
let _pendingWelcome = null;
function _applyPendingWelcome() {
  if (!_pendingWelcome || network.role !== 'player' || !currentTable) return;
  const { tableName, gmName } = _pendingWelcome;
  currentTable = Storage.upsertTable({
    id: currentTable.id,
    name: tableName || currentTable.name,
    gmName: gmName || currentTable.gmName || null,
  });
  const titleEl = document.getElementById('lobby-title');
  if (titleEl && !lobbyScreen.classList.contains('hidden')) titleEl.textContent = currentTable.name;
  if (!dashboardScreen.classList.contains('hidden')) renderDashboardTables();
}
network.on('welcome', payload => { _pendingWelcome = payload; _applyPendingWelcome(); });
// Ficha completa que um jogador manda (ex: ao adicioná-la à mesa no
// Lobby) — só o Mestre usa isso; é o que permite abrir/editar a ficha
// de qualquer jogador (não só o resumo salvo no elenco da mesa).
network.on('sheet', ({ peerId, sheet }) => {
  if (!network.isGM) return;
  const info = network.connections.get(peerId);
  sheet.ownerId   = peerId;
  sheet.ownerName = info?.name || sheet.ownerName || 'Jogador';
  sheetMgr.receiveExternalSheet(sheet);
  Storage.saveSheets(sheetMgr.sheets);
  syncRosterFromSheet(sheet);
});
// O Mestre editou a ficha de alguém direto na mesa (ex: "Fichas na
// Mesa") — o dono recebe a versão atualizada na hora, sem precisar
// recarregar nem mexer em nada pra "puxar" a mudança.
network.on('sheet-update', sheet => {
  if (network.role !== 'player' || !sheet) return;
  sheetMgr.receiveExternalSheet(sheet);
  Storage.saveSheets(sheetMgr.sheets);
  refreshRosterUI();
  if (!dashboardScreen.classList.contains('hidden')) renderDashboardSheets();
});
network.on('error', err => {
  if (appEl.classList.contains('hidden')) tablesStatus(err.message || 'Problema de conexão.', 'error');
});
network.on('disconnected', () => {
  if (appEl.classList.contains('hidden')) {
    uiAlert('A conexão com o Mestre foi perdida.', { title: 'Desconectado' }).then(() => location.reload());
  }
});

// ═══════════════════════════════════════════════
// LOGIN → DASHBOARD → MESA
// ═══════════════════════════════════════════════
function goToDashboard() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  renderDashboardProfile();
  renderDashboardTables();

  // Busca fichas/mesas da conta em segundo plano (não trava a tela) e
  // re-renderiza só quando (e se) isso trouxer algo novo — cobre o caso
  // de abrir o TableLink num navegador/aparelho diferente e já encontrar
  // tudo que foi criado em outro lugar.
  Storage.pullCloudData().then(() => {
    renderDashboardTables();
    renderDashboardSheets();
  });
}

// Aplica os dados da conta (vindos do servidor) no perfil local usado
// pelo resto do app (mesa, tokens, elenco, etc. só conhecem `profile`,
// vindo de Storage.getPlayer() — mantemos essa parte intacta e só
// alimentamos ela a partir da conta autenticada).
function applyAccountToProfile(user) {
  profile = Storage.setPlayer({
    name:   user.displayName || user.username,
    avatar: user.avatar || null,
    color:  user.color || profile.color || PROFILE_COLORS[0],
  });
  playerName = profile.name;
}

function setLoginTab(tab) {
  loginTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.authTab === tab));
  loginFormLogin.classList.toggle('hidden', tab !== 'login');
  loginFormRegister.classList.toggle('hidden', tab !== 'register');
  loginErrorEl.classList.add('hidden');
  registerErrorEl.classList.add('hidden');
  (tab === 'login' ? loginIdentifierInput : registerDisplayNameInput).focus();
}
loginTabs.forEach(btn => btn.addEventListener('click', () => setLoginTab(btn.dataset.authTab)));

function showFormError(el, message) {
  el.textContent = message;
  el.classList.remove('hidden');
}

loginFormLogin.addEventListener('submit', async e => {
  e.preventDefault();
  const identifier = loginIdentifierInput.value.trim();
  const password    = loginPasswordInput.value;
  if (!identifier || !password) { showFormError(loginErrorEl, 'Preencha usuário/e-mail e senha.'); return; }

  loginErrorEl.classList.add('hidden');
  loginSubmitBtn.disabled = true;
  loginSubmitBtn.textContent = 'Entrando…';
  try {
    const user = await Auth.login({ identifier, password });
    applyAccountToProfile(user);
    goToDashboard();
  } catch (err) {
    showFormError(loginErrorEl, err.message);
  } finally {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = 'Entrar';
  }
});

loginFormRegister.addEventListener('submit', async e => {
  e.preventDefault();
  const displayName = registerDisplayNameInput.value.trim();
  const username     = registerUsernameInput.value.trim();
  const email        = registerEmailInput.value.trim();
  const password     = registerPasswordInput.value;
  if (!displayName || !username || !email || !password) {
    showFormError(registerErrorEl, 'Preencha todos os campos.');
    return;
  }

  registerErrorEl.classList.add('hidden');
  registerSubmitBtn.disabled = true;
  registerSubmitBtn.textContent = 'Criando…';
  try {
    const user = await Auth.register({ username, email, password, displayName });
    applyAccountToProfile(user);
    goToDashboard();
  } catch (err) {
    showFormError(registerErrorEl, err.message);
  } finally {
    registerSubmitBtn.disabled = false;
    registerSubmitBtn.textContent = 'Criar Conta';
  }
});

document.getElementById('profile-logout-btn').addEventListener('click', async () => {
  const ok = await uiConfirm('Sair da conta? Você volta pra tela de login.', { title: 'Sair da Conta', okText: 'Sair', danger: true });
  if (!ok) return;
  await Auth.logout();
  location.reload();
});

// Se já existe uma sessão salva (token), confirma com o servidor antes
// de pular a tela de login — evita entrar "otimista" com um token
// vencido/revogado e só descobrir o problema no meio do uso.
(async function bootAuth() {
  if (!Auth.isLoggedIn()) { setLoginTab('login'); return; }

  const cached = Auth.getCachedUser();
  if (cached) {
    // Já tem sessão salva neste navegador — entra direto no Dashboard
    // (otimista) em vez de mostrar a tela de login enquanto confirma com
    // o servidor em segundo plano. Só volta pro login se a verificação
    // abaixo descobrir que o token não é mais válido.
    applyAccountToProfile(cached);
    goToDashboard();
  }

  const user = await Auth.fetchCurrentUser();

  if (user) {
    applyAccountToProfile(user);
    goToDashboard();
  } else {
    dashboardScreen.classList.add('hidden');
    setLoginTab('login');
  }
})();

function startApp() {
  dashboardScreen.classList.add('hidden');
  lobbyScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  init();
  renderToolbarProfile();
}

// Botão "Dashboard" na toolbar — sair da mesa de volta pro Dashboard.
// Mais simples e seguro que tentar reaproveitar a sessão (canvas/rede/etc.
// já em andamento) é recarregar a página; o nome e a sala não persistem
// de propósito (evita reconectar sozinho numa sala antiga sem querer).
// Logo da toolbar agora É o botão de voltar ao Dashboard (era um botão
// separado com ícone de casa; juntei os dois pra simplificar).
// Mais simples e seguro que tentar reaproveitar a sessão (canvas/rede/etc.
// já em andamento) é recarregar a página; o nome e a sala não persistem
// de propósito (evita reconectar sozinho numa sala antiga sem querer).
document.getElementById('toolbar-logo-btn').addEventListener('click', async () => {
  const ok = await uiConfirm(
    'Voltar ao Dashboard recarrega a página. Se estiver numa sala, você vai sair dela.',
    { title: 'Voltar ao Dashboard', okText: 'Voltar' }
  );
  if (ok) location.reload();
});

// Botão de perfil dentro da mesa (na toolbar) — mesmo modal do Dashboard.
document.getElementById('toolbar-profile-btn').addEventListener('click', openProfileModal);
function renderToolbarProfile() {
  const el = document.getElementById('toolbar-profile-avatar');
  if (!el) return;
  el.innerHTML = avatarHTML(profile.avatar);
  el.style.setProperty('--profile-color', profile.color);
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
function init() {
  const canvasEl  = document.getElementById('main-canvas');
  const fogEl     = document.getElementById('fog-canvas');
  const canvasArea = document.getElementById('canvas-area');

  const settings = Storage.getSettings();
  settings.playerName = playerName;

  // ── Engine ──
  const engine = new CanvasEngine({ canvasEl, fogEl, settings, onSave: c => Storage.saveCamera(c) });
  engine.isGM = network.isGM; // névoa semitransparente pro Mestre

  // Ajuda a salvar fog/mapa localmente e, se houver sala, propagar
  function persistFog() {
    const data = engine.saveFog();
    Storage.saveFog(data);
    if (network.isGM) network.broadcast('fog', data);
  }
  function persistMap(src) {
    Storage.saveMaps(engine.maps);
    if (network.isGM) network.broadcast('maps', engine.maps);
  }
  // Chamado pelo engine sempre que um mapa é movido/redimensionado direto
  // na mesa (arrastar, shift+scroll) — persiste e sincroniza também.
  engine.onMapsChanged = maps => {
    Storage.saveMaps(maps);
    if (network.isGM) network.broadcast('maps', maps);
  };

  const savedCam = Storage.getCamera();
  engine.camera.x    = savedCam.x;
  engine.camera.y    = savedCam.y;
  engine.camera.zoom = savedCam.zoom || 1;

  const savedMaps = Storage.getMaps();
  if (savedMaps.length) engine.loadMaps(savedMaps).then(() => renderMapsList());

  const savedFog = Storage.getFog();
  if (savedFog) engine.loadFog(savedFog);
  // (initFog já é chamado no construtor)

  // ── Chat ──
  const chat = new Chat({
    storage: Storage,
    getPlayerName: () => playerName,
    onRoll: result => diceUI._showAnimation(result),
  });
  // Toda mensagem nova (texto, rolagem ou sistema) nascida neste cliente
  // precisa chegar pra todo mundo na mesa — sem isso, chat e rolagens
  // ficavam 100% locais (cada um só via as próprias). Mesmo padrão de
  // sempre: Mestre transmite, jogador manda como pedido de ação.
  chat.onBroadcast = msg => {
    if (network.isGM)               network.broadcast('chat', msg);
    else if (network.role === 'player') network.sendAction('chat', msg);
  };

  // ── Dice ──
  const diceUI = new DiceUI({ onRoll: result => chat.addRoll(result, playerName, DICE_ICON_KEY[result.diceType] || 'dice') });

  // Mensagem de chat/rolagem chegando de outro cliente pela rede — desenha
  // no chat e, se for uma rolagem, também mostra o "postit" com o
  // resultado e toca o som (_showAnimation já cuida do som, ver dice.js),
  // igual quem rolou vê na hora.
  function receiveRemoteChat(msg) {
    chat._receiveRemote(msg);
    if (msg.type === 'roll' && msg.rollResult) diceUI._showAnimation(msg.rollResult);
  }

  // ── Tokens ──
  const tokenMgr = new TokenManager({
    canvas: canvasEl, ctx: engine.ctx,
    camera: engine.camera, settings,
    onSave:    tokens => Storage.saveTokens(tokens),
    onMessage: (msg, ic) => chat.addSystem(msg, ic),
    // Arraste/giro ao vivo — ver tokens.js. Mesmo padrão de sempre: Mestre
    // transmite pra todos, jogador manda como pedido de ação pro Mestre
    // (que reencaminha pros outros jogadores, ver network.on('action')
    // logo abaixo). Cada cliente já vê o PRÓPRIO arraste na hora (é o
    // mesmo array de tokens local sendo mexido) — isso aqui é só pra
    // levar esse movimento até a tela dos outros.
    onDragStart: token => {
      const payload = { id: token.id, x: token.x, y: token.y, rotation: token.rotation, scale: token.scale, heldBy: { name: playerName, color: profile.color } };
      token._heldBy = payload.heldBy;
      if (network.isGM)               network.broadcast('tokenMove', payload);
      else if (network.role === 'player') network.sendAction('tokenMove', payload);
    },
    onDragMove: token => {
      const payload = { id: token.id, x: token.x, y: token.y, rotation: token.rotation, scale: token.scale };
      if (network.isGM)               network.broadcast('tokenMove', payload);
      else if (network.role === 'player') network.sendAction('tokenMove', payload);
    },
    onDragEnd: token => {
      token._heldBy = null;
      const payload = { id: token.id, x: token.x, y: token.y, rotation: token.rotation, scale: token.scale, heldBy: null };
      if (network.isGM)               network.broadcast('tokenMove', payload);
      else if (network.role === 'player') network.sendAction('tokenMove', payload);
    },
  });
  tokenMgr.isGM = network.isGM || !network.isOnline; // tokens ocultos (ameaças) só pro Mestre; modo solo conta como Mestre
  tokenMgr.loadTokens(Storage.getTokens());
  // Roteia o salvamento de tokens pela rede (sala), se houver uma:
  // Mestre transmite pra todos; jogador manda como um pedido de ação.
  tokenMgr.onSave = tokens => {
    Storage.saveTokens(tokens);
    if (network.isGM)          network.broadcast('tokens', tokens);
    else if (network.role === 'player') network.sendAction('tokens', tokens);
  };

  // ── Initiative ──
  const initiative = new Initiative({
    storage: Storage,
    onMessage: (msg, ic) => chat.addSystem(msg, ic),
    onCombatChange: active => tokenMgr.setCombatActive(active),
    onChange: state => {
      // Antes só o Mestre propagava mudanças de combate/iniciativa — se
      // um jogador clicasse "Iniciar Combate" ou passasse o turno, isso
      // ficava só na tela dele. Agora qualquer um propaga: o Mestre
      // manda direto pra todos; um jogador manda pro Mestre repassar
      // (ele não tem conexão direta com os outros jogadores).
      if (network.isGM) network.broadcast('initiative', state);
      else if (network.role === 'player') network.sendAction('initiative', state);
    },
  });
  // Estado inicial (a página pode recarregar com um combate já em andamento)
  tokenMgr.setCombatActive(initiative.active);

  // ── Ficha de Personagem — reaproveita o SheetManager único criado no
  // escopo do módulo (ele já existe desde o Dashboard); aqui só plugamos
  // as dependências de verdade da mesa (token, dados, chat, iniciativa).
  sheetMgr.tokenMgr         = tokenMgr;
  sheetMgr.onRoll           = result => diceUI._showAnimation(result);
  sheetMgr.onDiceMessage    = (author, text, iconName, result) => chat.addRoll(result, author, iconName, text);
  sheetMgr.onMessage        = (msg, ic) => chat.addSystem(msg, ic);
  sheetMgr.onRollInitiative = (name, value) => initiative.addCombatant(name, value);
  wireSheetNetworkSync();
  sheetMgr._renderList();
  // Dentro da mesa, a aba "Ficha" só mostra o elenco desta mesa — não
  // todas as fichas que este navegador já criou (isso fica só no
  // Dashboard, em "Minhas Fichas").
  sheetMgr.setRosterFilter(new Set(Storage.getRoster().map(e => e.sheetId)));
  sheetMgr._renderList();

  // ── Ameaças (bestiário) — essa aba só existe pro Mestre; o jogador
  // nem carrega os dados (o bestiário é local a quem criou, nunca é
  // sincronizado pela rede).
  threatMgr.onRoll    = result => diceUI._showAnimation(result);
  threatMgr.onDiceMessage = (author, text, iconName, result) => chat.addRoll(result, author, iconName, text);
  threatMgr.onMessage = (msg, ic) => chat.addSystem(msg, ic);
  threatMgr.tokenMgr  = tokenMgr; // habilita sincronização ficha de ameaça <-> token (ver threats.js)
  if (network.role === 'player') {
    document.getElementById('tab-btn-threats')?.classList.add('hidden');
  } else {
    threatMgr.renderList(document.getElementById('in-game-threats-list'));
    threatMgr.onAddToMap = threat => {
      const token = tokenMgr.addThreatToken(threat);
      threatMgr.attachToken(threat.id, token.id);
    };
  }
  document.getElementById('btn-new-threat-ingame').addEventListener('click', async () => {
    const name = await uiPrompt('Nome da ameaça:', 'Nova Ameaça', { title: 'Nova Ameaça' });
    if (name === null) return;
    const threat = threatMgr.createThreat(name.trim() || 'Nova Ameaça');
    threatMgr.openModal(threat.id);
  });

  // Liga os hooks do token à ficha (resolvido depois para evitar
  // dependência circular na criação dos dois módulos).
  tokenMgr.onOpenSheet   = token => {
    // Tokens de ameaça abrem a ficha de ameaça (Bestiário), não a ficha
    // de personagem — antes disso ambos caíam sempre no sheetMgr, o que
    // fazia "Abrir Ficha" num token de ameaça criar/abrir uma ficha de
    // personagem errada em vez da ficha da ameaça correspondente.
    if (token.isThreat) {
      if (token.threatId) threatMgr.openModal(token.threatId);
      return;
    }
    sheetMgr.openForToken(token);
  };
  tokenMgr.onStatChange  = (tokenId, patch) => {
    const token = tokenMgr.getToken(tokenId);
    if (token?.isThreat) threatMgr.syncFromToken(tokenId, patch);
    else sheetMgr.syncFromToken(tokenId, patch);
  };
  tokenMgr.onGetVariants = token => sheetMgr.getVariantsForToken(token);

  // Fichas abertas em janela separada (ver initPopoutSheetWindow acima)
  // avisam a mesa por aqui — assim uma rolagem feita lá "cai na mesa"
  // (overlay de dado + chat) exatamente como se tivesse sido feita aqui.
  const popoutChannel = new BroadcastChannel(POPOUT_CHANNEL);
  popoutChannel.onmessage = e => {
    const { type, payload, tokenId, patch } = e.data || {};
    if (type === 'roll') {
      diceUI._showAnimation(payload);
    } else if (type === 'message') {
      chat.addSystem(payload.msg, payload.ic);
    } else if (type === 'rollInitiative') {
      initiative.addCombatant(payload.name, payload.value);
    } else if (type === 'tokenPatch') {
      tokenMgr.applyExternalStats(tokenId, patch);
    } else if (type === 'sheetsChanged') {
      sheetMgr.sheets = Storage.getSheets().map(s => sheetMgr._migrateSheet(s));
      sheetMgr._renderList();
      if (network.role === 'player') {
        const mine = sheetMgr.sheets.find(s => s.ownerId === network.myId);
        if (mine) network.sendSheet(mine);
      }
      if (sheetMgr._editing) {
        const s = sheetMgr.sheets.find(x => x.id === sheetMgr._editing);
        if (s) sheetMgr._renderModal(s);
      }
    } else if (type === 'threatsChanged') {
      threatMgr.threats = Storage.getThreats();
      renderVisibleThreatLists();
      if (threatMgr._editing) {
        const t = threatMgr._find(threatMgr._editing);
        if (t) threatMgr._renderModal(t);
      }
    }
  };

  // Cor do brilho de seleção de token = cor do perfil do jogador.
  activeTokenMgr = tokenMgr;
  tokenMgr.selectionColor = profile.color;


  // ═══════════════════════════════════════════════
  // SALA (Mestre/Jogador) — sincronização de estado
  // ═══════════════════════════════════════════════
  if (network.isOnline) {
    roomBadge.classList.remove('hidden');
    roomBadgeIcon.innerHTML = network.isGM ? icon('shield') : icon('key');
    roomBadgeText.textContent = network.isGM
      ? `Sala ${network.roomCode} — você é o Mestre`
      : `Sala ${network.roomCode} — conectado`;

    if (network.isGM) {
      roomBadgeCopy.classList.remove('hidden');
      roomBadgeCopy.addEventListener('click', () => {
        navigator.clipboard?.writeText(network.roomCode).catch(() => {});
        chat.addSystem(`Código da sala "${network.roomCode}" copiado.`, 'clipboard');
      });
    }

    network.on('error',        () => chat.addSystem('Problema de conexão com a sala.', 'warning'));
    network.on('disconnected', () => chat.addSystem('A conexão com o Mestre foi perdida. Recarregue a página para tentar de novo.', 'plug'));

    if (network.isGM) {
      // ── MESTRE: acesso a tudo, recebe fichas e pedidos dos jogadores ──
      network.on('player-joined', ({ name }) => chat.addSystem(`${name} entrou na sala.`, 'dot:icon-success'));
      network.on('player-left',   ({ peerId, name }) => { engine.clearSpotlight(peerId); engine.clearRemoteRuler(peerId); chat.addSystem(`${name || 'Um jogador'} saiu da sala.`, 'dot:icon-danger'); });

      // Manda o estado atual (tokens, névoa, mapas, iniciativa/modo de
      // combate) só pra um jogador específico — usado tanto no primeiro
      // "join" quanto no pedido explícito abaixo.
      function sendFullSyncTo(peerId) {
        network.sendTo(peerId, 'state', { slice: 'tokens', payload: tokenMgr.tokens });
        network.sendTo(peerId, 'state', { slice: 'fog',    payload: engine.saveFog() });
        if (engine.maps.length) network.sendTo(peerId, 'state', { slice: 'maps', payload: engine.maps });
        network.sendTo(peerId, 'state', { slice: 'initiative', payload: Storage.getInitiative() });
      }

      // Um novo jogador pediu pra sincronizar — manda o estado atual só pra
      // ele. IMPORTANTE: isso dispara assim que o jogador entra na SALA
      // (ainda no Lobby), antes da tela da mesa dele sequer existir — ou
      // seja, esse primeiro envio quase sempre chega cedo demais e se
      // perde (não tem ninguém ouvindo 'state' ainda). Por isso, quando o
      // jogador REALMENTE entra na mesa (ver "JOGADOR" mais abaixo), ele
      // pede a sincronização de novo, já com tudo pronto pra receber —
      // esse pedido chega como uma 'action' comum, tratado logo abaixo.
      network.on('request-full-sync', ({ peerId }) => sendFullSyncTo(peerId));

      // Ações pedidas por jogadores (por ora: mover/editar tokens, ping,
      // arraste ao vivo, chat/rolagens)
      network.on('action', ({ peerId, action, payload }) => {
        if (action === 'tokens') {
          tokenMgr.loadTokens(payload).then(() => {
            Storage.saveTokens(payload);
            network.broadcast('tokens', payload);
          });
        } else if (action === 'tokenMove') {
          tokenMgr.applyRemoteMove(payload);
          network.broadcastExcept('tokenMove', payload, peerId); // não ecoa de volta pra quem está arrastando
        } else if (action === 'ping') {
          engine.addPing(payload.x, payload.y, payload.color);
          network.broadcast('ping', payload);
        } else if (action === 'spotlight') {
          if (payload.active) engine.setSpotlight(peerId, payload.x, payload.y, payload.color);
          else engine.clearSpotlight(peerId);
          network.broadcastExcept('spotlight', { ...payload, peerId }, peerId);
        } else if (action === 'ruler') {
          if (payload.active) engine.setRemoteRuler(peerId, payload);
          else engine.clearRemoteRuler(peerId);
          network.broadcastExcept('ruler', { ...payload, peerId }, peerId);
        } else if (action === 'initiative') {
          // Jogador iniciou/avançou o combate — aplica no Mestre também e
          // repassa pra todo mundo (inclusive quem mandou, só pra manter
          // tudo 100% consistente caso a rede atrase alguma mensagem).
          initiative.loadState(payload);
          network.broadcast('initiative', payload);
        } else if (action === 'chat') {
          receiveRemoteChat(payload);
          network.broadcastExcept('chat', payload, peerId);
        } else if (action === 'request-sync') {
          sendFullSyncTo(peerId);
        }
      });

      // Fichas que os jogadores sincronizam já são tratadas pelo handler
      // de escopo do módulo (ativo desde o Lobby) — não precisa duplicar aqui.

    } else {
      // ── JOGADOR: só a própria ficha; recebe tudo o mais do Mestre ──
      network.on('state', ({ slice, payload }) => {
        if (slice === 'tokens') {
          tokenMgr.loadTokens(payload).then(() => Storage.saveTokens(payload));
        } else if (slice === 'tokenMove') {
          tokenMgr.applyRemoteMove(payload);
        } else if (slice === 'fog') {
          engine.loadFog(payload); Storage.saveFog(payload);
        } else if (slice === 'maps') {
          engine.loadMaps(payload).then(() => Storage.saveMaps(payload));
        } else if (slice === 'initiative') {
          initiative.loadState(payload);
        } else if (slice === 'ping') {
          engine.addPing(payload.x, payload.y, payload.color);
        } else if (slice === 'spotlight') {
          if (payload.active) engine.setSpotlight(payload.peerId, payload.x, payload.y, payload.color);
          else engine.clearSpotlight(payload.peerId);
        } else if (slice === 'ruler') {
          if (payload.active) engine.setRemoteRuler(payload.peerId, payload);
          else engine.clearRemoteRuler(payload.peerId);
        } else if (slice === 'chat') {
          receiveRemoteChat(payload);
        }
      });

      // Só agora (com os listeners acima já registrados) é seguro pedir o
      // estado da mesa pro Mestre — pedir mais cedo (ex: lá no Lobby, ao
      // entrar na sala) faz a resposta chegar antes de existir alguém
      // ouvindo, e ela se perde (era por isso que mapa/tokens/modo de
      // combate não apareciam pra quem tinha acabado de entrar).
      network.sendAction('request-sync', {});

      // Jogador não pinta névoa — só o Mestre. Desabilita as ferramentas.
      document.querySelectorAll('[data-tool^="fog"]').forEach(b => b.classList.add('net-disabled'));
      // Mapas (adicionar/mover/redimensionar/trancar/esconder) também é só do Mestre.
      document.getElementById('tab-btn-maps')?.classList.add('hidden');
      document.getElementById('btn-upload-map')?.classList.add('net-disabled');
    }
  }

  // ─────────────────────────────────────────────
  // FERRAMENTA ATIVA
  // ─────────────────────────────────────────────
  let activeTool = 'select';

  function setTool(tool) {
    // Só o Mestre pode usar as ferramentas de névoa quando em sala
    if (tool.startsWith('fog') && network.role === 'player') {
      chat.addSystem('Só o Mestre pode controlar a névoa.', 'lock');
      return;
    }
    activeTool = tool;
    document.querySelectorAll('.tool-btn[data-tool]').forEach(b =>
      b.classList.toggle('active', b.dataset.tool === tool)
    );
    canvasArea.className = 'canvas-area tool-' + tool;

    // Mostrar/esconder status de fog
    const isFog = tool.startsWith('fog');
    if (isFog) {
      showStatus(tool === 'fog-paint'  ? `${icon('moon')} Pintando névoa — Scroll para mudar tamanho do brush`
               : tool === 'fog-reveal' ? `${icon('eye')} Revelando área — Scroll para mudar tamanho do brush`
               :                         `${icon('trash')} Apagando névoa — Scroll para mudar tamanho do brush`);
    } else {
      hideStatus();
      engine.clearFogCursor();
    }
  }

  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn =>
    btn.addEventListener('click', () => setTool(btn.dataset.tool))
  );

  // ─────────────────────────────────────────────
  // STATUS BAR
  // ─────────────────────────────────────────────
  let _statusEl = null;
  function showStatus(msg) {
    if (!_statusEl) {
      _statusEl = document.createElement('div');
      _statusEl.className = 'canvas-status';
      canvasArea.appendChild(_statusEl);
    }
    _statusEl.innerHTML = msg;
    _statusEl.style.display = 'block';
  }
  function hideStatus() {
    if (_statusEl) _statusEl.style.display = 'none';
  }

  // ─────────────────────────────────────────────
  // MOUSE EVENTS
  // ─────────────────────────────────────────────
  let isMiddlePan   = false;
  let isFogPainting = false;
  let isRulerActive = false;
  let isSpotlighting = false; // segurando o botão direito fora de um token → "ponteiro laser"
  let spaceDown     = false;
  let fogSaveTimer  = null;
  let lastMouseWorld = null; // posição do mouse em coords de mundo — usado por Ctrl+V (colar no cursor)

  // Manda a posição do spotlight pros outros da mesa, sem floodar a rede
  // a cada pixel de movimento do mouse (no máximo ~20x/segundo).
  let _lastSpotlightSend = 0;
  function sendSpotlight(worldX, worldY, active) {
    const now = performance.now();
    if (active && now - _lastSpotlightSend < 50) return;
    _lastSpotlightSend = now;
    const color = profile.color || '#ef4444';
    if (network.isGM) {
      network.broadcast('spotlight', { peerId: 'gm', x: worldX, y: worldY, active, color });
    } else if (network.role === 'player') {
      network.sendAction('spotlight', { x: worldX, y: worldY, active, color });
    }
  }

  // Manda a régua (medir distância) pra todo mundo na mesa ver ao vivo,
  // igual ao spotlight — throttlada pra não floodar a rede a cada pixel.
  let _lastRulerSend = 0;
  function sendRuler(r, active) {
    const now = performance.now();
    if (active && now - _lastRulerSend < 50) return;
    _lastRulerSend = now;
    const color = profile.color || '#ffba4d';
    const label = profile.name || playerName || null;
    const payload = active
      ? { x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2, color, label, active: true }
      : { active: false };
    if (network.isGM) {
      network.broadcast('ruler', { ...payload, peerId: 'gm' });
    } else if (network.role === 'player') {
      network.sendAction('ruler', payload);
    }
  }

  function getOffset(e) {
    const rect = canvasEl.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvasEl.addEventListener('mousedown', e => {
    e.preventDefault();
    const off   = getOffset(e);
    const world = engine.screenToWorld(off.x, off.y);

    // Botão direito → context menu (sobre um token) ou spotlight (sobre
    // o mapa vazio) — segurar mostra uma bolinha da cor do usuário ao
    // redor do cursor, em tempo real, pra todo mundo na mesa.
    if (e.button === 2) {
      const t = tokenMgr.getTokenAt(world.x, world.y);
      if (t) { tokenMgr.showContextMenu(t, e.clientX, e.clientY); return; }
      isSpotlighting = true;
      engine.setSpotlight('local', world.x, world.y, profile.color || '#ef4444');
      sendSpotlight(world.x, world.y, true);
      return;
    }

    // Botão do meio → pan
    if (e.button === 1) {
      engine.startPan(e.clientX, e.clientY);
      isMiddlePan = true;
      return;
    }

    if (spaceDown) { engine.startPan(e.clientX, e.clientY); return; }

    // Alt+Clique → ping no mapa (menos quando o Alt+clique é sobre o
    // próprio token selecionado, que já significa "girar/redimensionar").
    if (e.altKey && e.button === 0) {
      const overSelected = tokenMgr.selected && tokenMgr.getTokenAt(world.x, world.y) === tokenMgr.selected;
      if (!overSelected) {
        createPing(world.x, world.y);
        return;
      }
    }

    switch (activeTool) {
      case 'select': {
        const gotToken = tokenMgr.onMouseDown(world.x, world.y, e);
        // Nada de token aqui: se for Mestre (ou sozinho), tenta pegar um
        // mapa pra selecionar/arrastar. Jogador nunca mexe em mapas.
        if (!gotToken && network.role !== 'player') {
          engine.startMapDrag(world.x, world.y);
        }
        break;
      }
      case 'pan':
        engine.startPan(e.clientX, e.clientY);
        break;
      case 'ruler':
        engine.rulerStart(world.x, world.y, profile.color);
        isRulerActive = true;
        sendRuler(engine.rulers.get('local'), true);
        break;
      case 'fog-paint':
      case 'fog-reveal':
      case 'fog-erase':
        isFogPainting = true;
        engine.paintFog(world.x, world.y, activeTool);
        break;
    }
  });

  // Cria um ping local e sincroniza com os outros conectados na sala (se houver).
  function createPing(worldX, worldY) {
    const color = profile.color || (network.isGM ? '#ffca63' : '#ef588a');
    engine.addPing(worldX, worldY, color);
    if (network.isGM) {
      network.broadcast('ping', { x: worldX, y: worldY, color });
    } else if (network.role === 'player') {
      network.sendAction('ping', { x: worldX, y: worldY, color });
    }
  }

  canvasEl.addEventListener('mousemove', e => {
    const off   = getOffset(e);
    const world = engine.screenToWorld(off.x, off.y);
    lastMouseWorld = world;

    if (isMiddlePan || (spaceDown && engine.isPanning)) {
      engine.updatePan(e.clientX, e.clientY); return;
    }
    if (engine.isPanning) { engine.updatePan(e.clientX, e.clientY); return; }

    if (isSpotlighting) {
      engine.setSpotlight('local', world.x, world.y, profile.color || '#ef4444');
      sendSpotlight(world.x, world.y, true);
    }

    switch (activeTool) {
      case 'select':
        tokenMgr.onMouseMove(world.x, world.y, e);
        if (network.role !== 'player') engine.updateMapDrag(world.x, world.y);
        break;
      case 'ruler':
        if (isRulerActive) { engine.rulerUpdate(world.x, world.y); sendRuler(engine.rulers.get('local'), true); }
        break;
      case 'fog-paint':
      case 'fog-reveal':
      case 'fog-erase':
        engine.setFogCursor(world.x, world.y, activeTool);
        if (isFogPainting) engine.paintFog(world.x, world.y, activeTool);
        break;
    }
  });

  // IMPORTANTE: o "mouseup" é escutado na WINDOW (não só no canvas).
  // Se o usuário soltar o botão fora do canvas (ex: sobre o painel lateral,
  // a toolbar, ou até fora da janela do navegador), o canvas nunca recebe
  // esse evento — e o token/rotação/régua ficavam "grudados" no mouse até
  // o próximo clique. Ouvindo na window garantimos que o "soltar" é sempre
  // detectado, não importa onde o cursor esteja.
  function handleGlobalMouseUp(e) {
    if (e.button === 1) { engine.endPan(); isMiddlePan = false; return; }
    if (e.button === 2 && isSpotlighting) {
      isSpotlighting = false;
      engine.clearSpotlight('local');
      sendSpotlight(0, 0, false);
    }
    if (engine.isPanning) { engine.endPan(); return; }

    tokenMgr.onMouseUp();

    if (engine._mapDragging) {
      engine.endMapDrag();
      renderMapsList();
    }

    if (isRulerActive) { engine.rulerEnd(); isRulerActive = false; sendRuler(null, false); }

    if (isFogPainting) {
      isFogPainting = false;
      clearTimeout(fogSaveTimer);
      fogSaveTimer = setTimeout(persistFog, 1200);
    }
  }
  window.addEventListener('mouseup', handleGlobalMouseUp);

  // Se a janela perder o foco (alt-tab, DevTools, etc.) com o botão
  // pressionado, o "mouseup" pode nunca chegar. Soltamos tudo por segurança.
  window.addEventListener('blur', () => {
    tokenMgr.onMouseUp();
    if (isRulerActive) { engine.rulerEnd(); isRulerActive = false; sendRuler(null, false); }
    if (engine.isPanning) engine.endPan();
    if (isSpotlighting) { isSpotlighting = false; engine.clearSpotlight('local'); sendSpotlight(0, 0, false); }
    isMiddlePan   = false;
    isFogPainting = false;
  });

  canvasEl.addEventListener('mouseleave', () => {
    // O soltar do token/régua já é tratado pelo listener global de
    // "mouseup" na window; aqui só limpamos o preview do cursor de névoa.
    engine.clearFogCursor();
  });

  canvasEl.addEventListener('dblclick', e => {
    const off   = getOffset(e);
    const world = engine.screenToWorld(off.x, off.y);
    tokenMgr.onDblClick(world.x, world.y);
  });

  canvasEl.addEventListener('wheel', e => {
    e.preventDefault();
    const off   = getOffset(e);
    const world = engine.screenToWorld(off.x, off.y);

    // Shift+scroll sobre fog tool → mudar tamanho do brush
    if (activeTool.startsWith('fog')) {
      engine.fogBrushRadius = Math.max(10, Math.min(300,
        engine.fogBrushRadius + (e.deltaY > 0 ? -8 : 8)
      ));
      showStatus(`Brush: ${engine.fogBrushRadius}px — ${activeTool === 'fog-paint' ? icon('moon')+' Névoa' : activeTool === 'fog-reveal' ? icon('eye')+' Revelar' : icon('trash')+' Apagar'}`);
      return;
    }

    // Shift+scroll sobre token → redimensionar
    if (e.shiftKey && tokenMgr.selected) {
      tokenMgr.onScroll(world.x, world.y, e.deltaY);
      return;
    }
    // Shift+scroll com um mapa selecionado (e nenhum token) → redimensiona o mapa
    if (e.shiftKey && !tokenMgr.selected && engine.selectedMapId && network.role !== 'player') {
      engine.resizeSelectedMap(e.deltaY);
      renderMapsList();
      return;
    }

    // Scroll normal → zoom
    engine.zoom(e.deltaY, off.x, off.y);
  }, { passive: false });

  canvasEl.addEventListener('contextmenu', e => e.preventDefault());

  // ─────────────────────────────────────────────
  // TECLADO
  // ─────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;

    if (e.key === ' ') { spaceDown = true; e.preventDefault(); return; }

    const key = e.key.toLowerCase();

    // Ctrl combos
    if (e.ctrlKey) {
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); tokenMgr.undo(); return; }
      if (key === 'y' || (key === 'z' && e.shiftKey)) { e.preventDefault(); tokenMgr.redo(); return; }
      if (key === 'c') {
        e.preventDefault();
        if (tokenMgr.copySelected()) showStatus(`${icon('clipboard')} "${tokenMgr.selected.name}" copiado`);
        return;
      }
      if (key === 'v') {
        e.preventDefault();
        const at = lastMouseWorld || tokenMgr.selected;
        const t = tokenMgr.pasteToken(at?.x, at?.y);
        if (t) showStatus(`${icon('clipboard')} "${t.name}" colado`);
        return;
      }
      return;
    }

    switch (key) {
      case 's':      setTool('select');     break;
      case 'v':      setTool('pan');        break;
      case 'r':
        if (tokenMgr.selected) {
          const on = tokenMgr.toggleRotateMode();
          showStatus(on ? `${icon('rotateIcon')} Modo Girar ativado — arraste o token` : `${icon('rotateIcon')} Modo Girar desativado`);
        } else {
          setTool('ruler');
        }
        break;
      case 'q':      setTool('fog-paint');  break;
      case 'e':      setTool('fog-reveal'); break;
      case 'w':      setTool('fog-erase');  break;
      case 't':      document.getElementById('token-upload-input').click(); break;
      case 'm':
        if (network.role !== 'player') document.getElementById('map-upload-input').click();
        break;
      case 'c':      switchTab('initiative'); break;
      case 'g':      toggleGrid(); break;
      case 'f':      engine.centerCamera(); break;
      case 'f11':    e.preventDefault(); togglePresentationMode(); break;
      case '?':      openModal('modal-help'); break;
      case ',':      openSettingsModal(); break;
      case 'delete': tokenMgr.onKeyDown(e); break;
      case 'escape':
        if (isRulerActive) sendRuler(null, false);
        engine.rulerEnd(); isRulerActive = false;
        engine.clearFogCursor();
        tokenMgr.selected = null;
        tokenMgr.rotateModeActive = false;
        engine.selectedMapId = null;
        renderMapsList();
        document.getElementById('token-info-bar').classList.add('hidden');
        hideStatus();
        break;
    }
  });

  document.addEventListener('keyup', e => {
    if (e.key === ' ') { spaceDown = false; }
  });

  // ─────────────────────────────────────────────
  // MODO APRESENTAÇÃO (F11) — tela cheia, sem toolbar/painel lateral
  // ─────────────────────────────────────────────
  function togglePresentationMode() {
    const active = document.body.classList.toggle('presentation-mode');
    if (active) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      showStatus(`${icon('presentation')} Modo apresentação — F11 pra sair`);
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) document.body.classList.remove('presentation-mode');
  });

  // ─────────────────────────────────────────────
  // TOOLBAR BUTTONS
  // ─────────────────────────────────────────────
  document.getElementById('btn-center').addEventListener('click',   () => engine.centerCamera());
  document.getElementById('btn-help').addEventListener('click',     () => openModal('modal-help'));
  document.getElementById('btn-settings').addEventListener('click', openSettingsModal);
  document.getElementById('btn-grid-toggle').addEventListener('click', toggleGrid);
  document.getElementById('btn-combat').addEventListener('click',   () => switchTab('initiative'));

  // Modo escuro — lógica compartilhada com o Dashboard (ver topo do
  // arquivo); aqui só garante que o botão desta tela reflita o estado
  // atual e ligue o mesmo toggle. addEventListener com a MESMA função
  // (toggleDarkMode) não duplica o handler mesmo se init() rodar de novo.
  applyDarkMode(document.documentElement.classList.contains('dark-mode'));
  document.getElementById('btn-darkmode').removeEventListener('click', toggleDarkMode);
  document.getElementById('btn-darkmode').addEventListener('click', toggleDarkMode);

  document.getElementById('btn-clear').addEventListener('click', async () => {
    const ok = await uiConfirm('Limpar toda a mesa? Tokens, névoa, mapa e histórico serão apagados.', { title: 'Limpar Mesa', okText: 'Limpar', danger: true });
    if (ok) {
      Storage.clearAll();
      location.reload();
    }
  });

  // Limpar névoa
  document.getElementById('token-info-close').addEventListener('click', () => {
    tokenMgr.selected = null;
    document.getElementById('token-info-bar').classList.add('hidden');
  });

  function toggleGrid() {
    settings.showGrid = !settings.showGrid;
    Storage.saveSettings(settings);
    document.getElementById('btn-grid-toggle').style.opacity = settings.showGrid ? '1' : '0.4';
  }

  function openSettingsModal() {
    document.getElementById('settings-grid-size').value   = settings.gridSize;
    document.getElementById('settings-grid-scale').value  = settings.gridScale;
    document.getElementById('settings-player-name').value = playerName;
    openModal('modal-settings');
  }

  document.getElementById('save-settings-btn').addEventListener('click', () => {
    settings.gridSize  = parseInt(document.getElementById('settings-grid-size').value)    || 60;
    settings.gridScale = parseFloat(document.getElementById('settings-grid-scale').value) || 1.5;
    const newName      = document.getElementById('settings-player-name').value.trim();
    if (newName) { playerName = newName; Storage.setPlayer(newName); }
    Storage.saveSettings(settings);
    closeModal('modal-settings');
  });

  // ─────────────────────────────────────────────
  // BACKUP (exportar / importar tudo em .json)
  // ─────────────────────────────────────────────
  document.getElementById('export-backup-btn').addEventListener('click', () => {
    Storage.exportAll();
  });

  const importBackupInput = document.getElementById('import-backup-input');
  document.getElementById('import-backup-btn').addEventListener('click', () => importBackupInput.click());

  importBackupInput.addEventListener('change', async () => {
    const file = importBackupInput.files[0];
    importBackupInput.value = ''; // permite escolher o mesmo arquivo de novo depois
    if (!file) return;

    const ok = await uiConfirm(
      'Importar esse backup vai substituir o mapa, tokens, névoa, fichas e iniciativa atuais desta mesa. Continuar?',
      { title: 'Importar Backup', okText: 'Importar', danger: true }
    );
    if (!ok) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = Storage.importAll(data);
      if (result.ok) {
        await uiAlert('Backup importado! A página vai recarregar pra aplicar tudo.', { title: 'Pronto' });
        location.reload();
      } else {
        await uiAlert(result.error, { title: 'Não deu certo' });
      }
    } catch (e) {
      await uiAlert('Esse arquivo não pôde ser lido como backup do TableLink.', { title: 'Erro' });
    }
  });

  window.addEventListener('tl-storage-full', () => {
    showStatus(`${icon('warning', 'icon-warning')} Armazenamento do navegador cheio — exporte um backup e libere espaço.`);
  });

  // ─────────────────────────────────────────────
  // UPLOAD DE MAPA (adiciona mais um mapa à mesa — não substitui os outros)
  // ─────────────────────────────────────────────
  const mapInput = document.getElementById('map-upload-input');
  mapInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 30) || 'Mapa';
      engine.addMap(ev.target.result, { name }).then(() => {
        persistMap();
        renderMapsList();
        if (engine.maps.length === 1) {
          // Primeiro mapa da mesa: nasce com a névoa revelada (o Mestre
          // pinta manualmente onde quiser, em vez de nascer 100% coberto).
          engine.clearFogAll();
          persistFog();
        }
        chat.addSystem(`Mapa "${name}" adicionado (aba Mapas — mova, redimensione, tranque ou esconda).`, 'map');
      });
    };
    reader.readAsDataURL(file);
    mapInput.value = '';
  });
  document.getElementById('btn-upload-map').addEventListener('click', () => mapInput.click());
  document.getElementById('btn-add-map').addEventListener('click', () => mapInput.click());

  // ─────────────────────────────────────────────
  // PAINEL "MAPAS" — listar, selecionar, trancar, esconder, redimensionar,
  // centralizar e remover cada mapa da mesa. Só o Mestre mexe aqui (em
  // modo solo também, já que nesse caso você é o "Mestre" sozinho).
  // ─────────────────────────────────────────────
  function renderMapsList() {
    const wrap = document.getElementById('maps-list');
    if (!wrap) return;
    if (engine.maps.length === 0) {
      wrap.innerHTML = `<p class="dashboard-empty-hint">Nenhum mapa ainda — clique em "Adicionar Mapa".</p>`;
      return;
    }
    const sorted = [...engine.maps].sort((a, b) => b.zIndex - a.zIndex);
    wrap.innerHTML = sorted.map(m => `
      <div class="map-card ${engine.selectedMapId === m.id ? 'selected' : ''}" data-id="${m.id}">
        <div class="map-card-thumb"><img src="${m.src}" alt=""/></div>
        <div class="map-card-info">
          <strong>${m.name || 'Mapa'}</strong>
          <span>${Math.round(m.width)}×${Math.round(m.height)}</span>
        </div>
        <div class="map-card-actions">
          <button class="map-act-btn" data-act="lock"   title="${m.locked ? 'Destrancar' : 'Trancar'}">${m.locked ? icon('lock') : icon('unlock')}</button>
          <button class="map-act-btn" data-act="hide"   title="${m.hidden ? 'Mostrar aos jogadores' : 'Esconder dos jogadores'}">${m.hidden ? icon('eyeOff') : icon('eye')}</button>
          <button class="map-act-btn" data-act="smaller" title="Diminuir">${icon('minus')}</button>
          <button class="map-act-btn" data-act="bigger"  title="Aumentar">${icon('plus')}</button>
          <button class="map-act-btn" data-act="center"  title="Centralizar câmera">${icon('target')}</button>
          <button class="map-act-btn" data-act="front"   title="Trazer pra frente">${icon('chevronUp')}</button>
          <button class="map-act-btn danger" data-act="delete" title="Remover">${icon('trash')}</button>
        </div>
      </div>
    `).join('');

    wrap.querySelectorAll('.map-card').forEach(card => {
      const id = card.dataset.id;
      card.addEventListener('click', e => {
        if (e.target.closest('.map-act-btn')) return;
        engine.selectedMapId = (engine.selectedMapId === id) ? null : id;
        renderMapsList();
      });
      card.querySelectorAll('.map-act-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const m = engine.getMap(id);
          if (!m) return;
          switch (btn.dataset.act) {
            case 'lock':   engine.updateMap(id, { locked: !m.locked }); break;
            case 'hide':   engine.updateMap(id, { hidden: !m.hidden }); break;
            case 'smaller': {
              const f = 0.9, cx = m.x + m.width/2, cy = m.y + m.height/2;
              const w = Math.max(40, m.width*f), h = Math.max(40, m.height*f);
              engine.updateMap(id, { width: w, height: h, x: cx-w/2, y: cy-h/2 });
              break;
            }
            case 'bigger': {
              const f = 1.1, cx = m.x + m.width/2, cy = m.y + m.height/2;
              const w = m.width*f, h = m.height*f;
              engine.updateMap(id, { width: w, height: h, x: cx-w/2, y: cy-h/2 });
              break;
            }
            case 'center':
              engine.camera.x = m.x + m.width/2;
              engine.camera.y = m.y + m.height/2;
              Storage.saveCamera(engine.camera);
              break;
            case 'front': {
              const maxZ = Math.max(0, ...engine.maps.map(mm => mm.zIndex));
              engine.updateMap(id, { zIndex: maxZ + 1 });
              break;
            }
            case 'delete':
              engine.removeMap(id);
              break;
          }
          persistMap();
          renderMapsList();
        });
      });
    });
  }
  renderMapsList();


  // ─────────────────────────────────────────────
  // TABS
  // ─────────────────────────────────────────────
  function switchTab(name) {
    document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.panel-tab[data-tab="${name}"]`).classList.add('active');
    document.getElementById(`tab-${name}`).classList.add('active');
  }

  document.querySelectorAll('.panel-tab').forEach(tab =>
    tab.addEventListener('click', () => switchTab(tab.dataset.tab))
  );

  // ─────────────────────────────────────────────
  // GAME LOOP
  // Ordem: fundo → grade → fog → tokens
  // ─────────────────────────────────────────────
  function gameLoop() {
    engine.clear();
    engine.applyCamera();
    engine.drawBackground();
    engine.drawGrid();
    engine.drawFog();       // ← névoa em espaço de mundo, depois da grade
    tokenMgr.draw();        // ← tokens por cima da névoa
    engine.drawPings();     // ← pings (Alt+Clique) por cima de tudo
    engine.drawSpotlights(); // ← spotlight (segurar botão direito) por cima de tudo
    engine.resetTransform();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);

  // ─────────────────────────────────────────────
  // AUTO-SAVE periódico
  // ─────────────────────────────────────────────
  setInterval(() => {
    persistFog();
    Storage.saveCamera(engine.camera);
  }, 30000);

  // ─────────────────────────────────────────────
  // BOAS-VINDAS
  // ─────────────────────────────────────────────
  chat.addSystem(`Bem-vindo ao TableLink, ${playerName}!`, 'swords');
  const savedTokens = Storage.getTokens();
  if (savedTokens.length > 0) chat.addSystem(`${savedTokens.length} token(s) restaurado(s).`, 'box');
}
