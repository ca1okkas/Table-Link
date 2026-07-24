// ══════════════════════════════════════════════════════════════
// server.js — Servidor de contas do TableLink.
//
// Rotas:
//   POST   /api/auth/register        { username, email, password, displayName? }
//   POST   /api/auth/login           { identifier, password }   (identifier = usuário OU e-mail)
//   GET    /api/auth/me              (Bearer token)
//   PATCH  /api/auth/me              (Bearer token) { displayName?, avatar?, color? }
//   POST   /api/auth/change-password (Bearer token) { currentPassword, newPassword }
//   POST   /api/auth/logout          (Bearer token)  — revoga só esta sessão
//   POST   /api/auth/logout-all      (Bearer token)  — revoga todas as sessões deste usuário
//   GET    /api/sync/sheets          (Bearer token)  — fichas salvas na nuvem
//   PUT    /api/sync/sheets          (Bearer token)  { sheets }
//   GET    /api/sync/tables          (Bearer token)  — lista de mesas salva na nuvem
//   PUT    /api/sync/tables          (Bearer token)  { tables }
//   GET    /api/health               — checagem simples (sem auth)
//   WS     /ws/rooms                 — salas ao vivo (tabuleiro/tokens/chat/etc), ver rooms.js
//
// Ver README.md nesta pasta pra instruções de configuração e deploy.
// ══════════════════════════════════════════════════════════════

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';

import { db } from './db.js';
import { hashPassword, verifyPassword, issueToken, revokeSession, revokeAllSessions } from './auth.js';
import { requireAuth } from './middleware.js';
import { validateUsername, validateEmail, validatePassword, validateDisplayName } from './validate.js';
import { attachRoomsServer } from './rooms.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──────────────────────────────────────────────────────
// Em produção, defina CORS_ORIGIN no .env com a(s) URL(s) exata(s) de
// onde o TableLink é servido (ex: "https://minhamesa.com"), separadas
// por vírgula se forem várias. Sem essa variável, aceita qualquer
// origem — ok pra testar localmente, mas troque antes de publicar.
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : true;
app.use(cors({ origin: corsOrigins }));
// Limite alto o bastante pra caber uma foto de perfil em base64 (o
// cliente já redimensiona/comprime antes de mandar, mas o limite padrão
// do Express (100kb) rejeitava a maioria das fotos e a resposta de erro
// era só engolida no cliente — o avatar "salvava" só localmente e sumia
// no próximo login, porque nunca tinha ido pro banco de verdade).
app.use(express.json({ limit: '2mb' }));

// ── Rate limiting em login/registro ──────────────────────────
// Limita tentativas de força-bruta de senha sem travar o resto da API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' },
});

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    displayName: u.display_name,
    avatar: u.avatar || null,
    color: u.color || null,
    createdAt: u.created_at,
  };
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── Registro ──────────────────────────────────────────────────
app.post('/api/auth/register', authLimiter, (req, res) => {
  const { username, email, password } = req.body || {};
  let { displayName } = req.body || {};
  displayName = (displayName || username || '').trim();

  const err =
    validateUsername(username) ||
    validateEmail(email) ||
    validatePassword(password) ||
    validateDisplayName(displayName);
  if (err) return res.status(400).json({ error: err });

  const exists = db.prepare(`SELECT id FROM users WHERE username = ? OR email = ?`).get(username, email);
  if (exists) return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });

  hashPassword(password).then(hash => {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, username, email, hash, displayName);

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
    const { token, expiresAt } = issueToken(id, req.headers['user-agent']);
    res.status(201).json({ token, expiresAt, user: publicUser(user) });
  }).catch(e => {
    console.error('[register]', e);
    res.status(500).json({ error: 'Erro ao criar conta. Tente de novo.' });
  });
});

// ── Login ─────────────────────────────────────────────────────
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Informe usuário/e-mail e senha.' });
  }

  const user = db.prepare(`SELECT * FROM users WHERE username = ? OR email = ?`).get(identifier, identifier);
  if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

  verifyPassword(password, user.password_hash).then(ok => {
    if (!ok) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    const { token, expiresAt } = issueToken(user.id, req.headers['user-agent']);
    res.json({ token, expiresAt, user: publicUser(user) });
  }).catch(e => {
    console.error('[login]', e);
    res.status(500).json({ error: 'Erro ao entrar. Tente de novo.' });
  });
});

// ── Sessão atual ──────────────────────────────────────────────
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.patch('/api/auth/me', requireAuth, (req, res) => {
  const { displayName, avatar, color } = req.body || {};
  if (displayName !== undefined) {
    const err = validateDisplayName(displayName);
    if (err) return res.status(400).json({ error: err });
  }
  db.prepare(`
    UPDATE users SET
      display_name = COALESCE(?, display_name),
      avatar       = COALESCE(?, avatar),
      color        = COALESCE(?, color),
      updated_at   = datetime('now')
    WHERE id = ?
  `).run(displayName?.trim() ?? null, avatar ?? null, color ?? null, req.user.id);

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const err = validatePassword(newPassword);
  if (err) return res.status(400).json({ error: err });

  verifyPassword(currentPassword || '', req.user.password_hash).then(ok => {
    if (!ok) return res.status(401).json({ error: 'Senha atual incorreta.' });
    return hashPassword(newPassword).then(hash => {
      db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(hash, req.user.id);
      revokeAllSessions(req.user.id); // troca de senha derruba todas as sessões, inclusive a atual
      const { token, expiresAt } = issueToken(req.user.id, req.headers['user-agent']);
      res.json({ token, expiresAt });
    });
  }).catch(e => {
    console.error('[change-password]', e);
    res.status(500).json({ error: 'Erro ao trocar a senha. Tente de novo.' });
  });
});

// ── Logout ────────────────────────────────────────────────────
app.post('/api/auth/logout', requireAuth, (req, res) => {
  revokeSession(req.sid);
  res.json({ ok: true });
});

app.post('/api/auth/logout-all', requireAuth, (req, res) => {
  revokeAllSessions(req.user.id);
  res.json({ ok: true });
});

// ── Persistência em nuvem: fichas e lista de mesas ────────────
// Espelho simples "a última versão vence" do que o app guarda no
// IndexedDB local — dá pra acessar as mesmas fichas/mesas de qualquer
// navegador ou aparelho, entrando na mesma conta.
app.get('/api/sync/sheets', requireAuth, (req, res) => {
  const row = db.prepare(`SELECT data, updated_at FROM cloud_sheets WHERE user_id = ?`).get(req.user.id);
  res.json({ sheets: row ? JSON.parse(row.data) : [], updatedAt: row?.updated_at || null });
});
app.put('/api/sync/sheets', requireAuth, (req, res) => {
  const { sheets } = req.body || {};
  if (!Array.isArray(sheets)) return res.status(400).json({ error: 'Formato inválido — esperado uma lista de fichas.' });
  db.prepare(`
    INSERT INTO cloud_sheets (user_id, data, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(req.user.id, JSON.stringify(sheets));
  res.json({ ok: true });
});

app.get('/api/sync/tables', requireAuth, (req, res) => {
  const row = db.prepare(`SELECT data, updated_at FROM cloud_tables WHERE user_id = ?`).get(req.user.id);
  res.json({ tables: row ? JSON.parse(row.data) : [], updatedAt: row?.updated_at || null });
});
app.put('/api/sync/tables', requireAuth, (req, res) => {
  const { tables } = req.body || {};
  if (!Array.isArray(tables)) return res.status(400).json({ error: 'Formato inválido — esperado uma lista de mesas.' });
  db.prepare(`
    INSERT INTO cloud_tables (user_id, data, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(req.user.id, JSON.stringify(tables));
  res.json({ ok: true });
});

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

const httpServer = app.listen(PORT, () => {
  console.log(`[tablelink-auth-server] rodando em http://localhost:${PORT}`);
});

// Salas ao vivo (tabuleiro/tokens/chat/etc), hospedadas por este mesmo
// processo — ver server/src/rooms.js.
attachRoomsServer(httpServer);
