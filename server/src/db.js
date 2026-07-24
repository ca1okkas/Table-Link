// ══════════════════════════════════════════════════════════════
// db.js — Banco SQLite (arquivo local, sem precisar de um servidor
// de banco de dados separado). Cria o schema na primeira vez que o
// servidor sobe.
// ══════════════════════════════════════════════════════════════

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, '..', 'data');
const DB_PATH   = process.env.DB_PATH || path.join(DATA_DIR, 'tablelink.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    avatar        TEXT,
    color         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Uma linha por sessão ativa (um "refresh"/login) — permite revogar um
  -- token específico no logout, em vez de confiar só na expiração do JWT.
  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    revoked    INTEGER NOT NULL DEFAULT 0,
    user_agent TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

  -- ── Persistência em nuvem ──────────────────────────────────────
  -- Fichas de personagem ("Minhas Fichas") do usuário — espelho em
  -- nuvem do que fica no IndexedDB local, pra acompanhar a conta em
  -- qualquer navegador/aparelho.
  CREATE TABLE IF NOT EXISTS cloud_sheets (
    user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data       TEXT NOT NULL DEFAULT '[]', -- JSON: array de fichas
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Lista de mesas (metadados: nome, papel, código) que o usuário já
  -- criou ou entrou — espelho em nuvem da tela "Mesas" do Dashboard.
  CREATE TABLE IF NOT EXISTS cloud_tables (
    user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data       TEXT NOT NULL DEFAULT '[]', -- JSON: array de mesas
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- ── Salas ao vivo (hospedadas pelo servidor, não pelo navegador do
  -- Mestre) ───────────────────────────────────────────────────────
  -- O estado do tabuleiro (tokens/mapas/névoa/chat/iniciativa/elenco)
  -- fica aqui, não só na memória do processo — então sobrevive tanto a
  -- um reinício do servidor quanto (o que importa de verdade pro
  -- Mestre) ao navegador dele fechando: o servidor é quem hospeda a
  -- sessão agora, o Mestre é só mais um cliente que entra e sai.
  CREATE TABLE IF NOT EXISTS rooms (
    code       TEXT PRIMARY KEY,
    gm_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    name       TEXT NOT NULL DEFAULT 'Mesa',
    state      TEXT NOT NULL DEFAULT '{}', -- JSON: { tokens, maps, fog, settings, chat, initiative, roster, members }
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_rooms_gm ON rooms(gm_user_id);
`);

export default db;
