// ══════════════════════════════════════════════════════════════
// auth.js — hashing de senha (bcrypt) + emissão/validação de token
// (JWT) ligado a uma linha em "sessions", pra dar pra revogar no
// logout de verdade (não só apagar o token no navegador).
// ══════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { db } from './db.js';

const JWT_SECRET  = process.env.JWT_SECRET;
const TOKEN_TTL_DAYS = Number(process.env.TOKEN_TTL_DAYS || 30);

if (!JWT_SECRET) {
  console.error('[auth] JWT_SECRET não configurado — defina no .env antes de subir o servidor (veja .env.example).');
  process.exit(1);
}

export function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Cria uma sessão (linha revogável) + assina um JWT que aponta pra ela
// (claim "sid"). Validar o token sempre confere as duas coisas: a
// assinatura E se a sessão ainda existe e não foi revogada.
export function issueToken(userId, userAgent) {
  const sid = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  db.prepare(`INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)`)
    .run(sid, userId, expiresAt.toISOString(), userAgent || null);

  const token = jwt.sign({ sub: userId, sid }, JWT_SECRET, { expiresIn: `${TOKEN_TTL_DAYS}d` });
  return { token, expiresAt: expiresAt.toISOString() };
}

// Retorna { userId, sid } se o token for válido e a sessão ainda estiver
// ativa; caso contrário retorna null (nunca lança — quem chama só
// verifica null/objeto).
export function verifyToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
  const session = db.prepare(`SELECT * FROM sessions WHERE id = ? AND user_id = ?`).get(payload.sid, payload.sub);
  if (!session || session.revoked) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;
  return { userId: payload.sub, sid: payload.sid };
}

export function revokeSession(sid) {
  db.prepare(`UPDATE sessions SET revoked = 1 WHERE id = ?`).run(sid);
}

export function revokeAllSessions(userId) {
  db.prepare(`UPDATE sessions SET revoked = 1 WHERE user_id = ?`).run(userId);
}
