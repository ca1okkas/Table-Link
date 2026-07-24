// ══════════════════════════════════════════════════════════════
// validate.js — validação simples de entrada (sem depender de
// nenhuma lib extra). Cada função retorna uma string de erro em
// português (pra mostrar direto na UI) ou null se estiver ok.
// ══════════════════════════════════════════════════════════════

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username) {
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return 'Usuário deve ter 3–20 caracteres: letras, números ou "_".';
  }
  return null;
}

export function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return 'E-mail inválido.';
  }
  return null;
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Senha deve ter pelo menos 8 caracteres.';
  }
  if (password.length > 200) {
    return 'Senha muito longa.';
  }
  return null;
}

export function validateDisplayName(name) {
  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 40) {
    return 'Nome de exibição deve ter entre 1 e 40 caracteres.';
  }
  return null;
}
