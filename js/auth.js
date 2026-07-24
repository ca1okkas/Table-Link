// ══════════════════════════════════════════════════════════════
// auth.js — cliente do servidor de contas (ver server/README.md).
//
// Guarda o token de sessão no localStorage (fora do sistema de
// Storage do app, que é assíncrono/por IndexedDB — o token precisa
// estar disponível na hora, antes de qualquer coisa carregar, pra
// decidir se mostra a tela de login ou pula direto pro Dashboard).
// ══════════════════════════════════════════════════════════════

import { API_BASE_URL } from './config.js';

const TOKEN_KEY = 'tl_auth_token';
const USER_KEY  = 'tl_auth_user'; // cache local dos dados públicos do usuário (evita "piscar" sem nome no primeiro load)

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) throw new Error('Não autenticado.');
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível falar com o servidor de contas. Verifique sua conexão (ou se o servidor está no ar).');
  }

  let data = null;
  try { data = await res.json(); } catch { /* resposta sem corpo (ex: 204) */ }

  if (!res.ok) {
    throw new Error((data && data.error) || `Erro (${res.status}).`);
  }
  return data;
}

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function isLoggedIn() { return !!getToken(); }

export function getCachedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function register({ username, email, password, displayName }) {
  const data = await request('/api/auth/register', { method: 'POST', body: { username, email, password, displayName } });
  persistSession(data.token, data.user);
  return data.user;
}

export async function login({ identifier, password }) {
  const data = await request('/api/auth/login', { method: 'POST', body: { identifier, password } });
  persistSession(data.token, data.user);
  return data.user;
}

// Confere com o servidor se o token salvo ainda é válido e devolve o
// usuário atualizado; limpa a sessão local (sem lançar) se não for.
export async function fetchCurrentUser() {
  if (!getToken()) return null;
  try {
    const data = await request('/api/auth/me', { auth: true });
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function updateProfile(patch) {
  const data = await request('/api/auth/me', { method: 'PATCH', auth: true, body: patch });
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function changePassword({ currentPassword, newPassword }) {
  const data = await request('/api/auth/change-password', { method: 'POST', auth: true, body: { currentPassword, newPassword } });
  localStorage.setItem(TOKEN_KEY, data.token); // troca de senha emite um token novo e derruba os antigos
  return true;
}

export async function logout() {
  try { await request('/api/auth/logout', { method: 'POST', auth: true }); }
  catch { /* mesmo se o servidor não responder, ainda limpamos a sessão local */ }
  clearSession();
}

// ── Persistência em nuvem: fichas e mesas ──────────────────────
// Espelham "Minhas Fichas" e "Mesas" na conta — assim elas acompanham o
// usuário em qualquer navegador/aparelho, não só neste IndexedDB local.
export async function fetchCloudSheets() {
  const data = await request('/api/sync/sheets', { auth: true });
  return data.sheets;
}
export async function pushCloudSheets(sheets) {
  await request('/api/sync/sheets', { method: 'PUT', auth: true, body: { sheets } });
}
export async function fetchCloudTables() {
  const data = await request('/api/sync/tables', { auth: true });
  return data.tables;
}
export async function pushCloudTables(tables) {
  await request('/api/sync/tables', { method: 'PUT', auth: true, body: { tables } });
}
