// ══════════════════════════════════════════════════════════════
// rooms.js — Salas ao vivo hospedadas pelo PRÓPRIO SERVIDOR.
//
// Antes (v2.20 e anteriores) a sala era ponto-a-ponto: o navegador do
// Mestre virava o "host" via WebRTC/PeerJS, e se ele fechasse a aba a
// sessão inteira acabava pra todo mundo. Agora quem hospeda é este
// processo Node — o Mestre é só mais um cliente que entra e sai. O
// estado do tabuleiro (tokens, mapas, névoa, chat, iniciativa, elenco)
// fica guardado aqui em memória + persistido no SQLite, então:
//   • a sessão continua rolando pros jogadores mesmo se o Mestre cair
//     ou fechar a aba (menos as poucas ações que só fazem sentido com
//     o Mestre por perto, como subir mapa novo ou expulsar alguém);
//   • ao reabrir a aba (mesmo em outro computador), o Mestre recebe de
//     volta o estado exatamente de onde parou.
//
// O protocolo de mensagens (JSON, por WebSocket) é o mesmo já usado
// pelo cliente em network.js: join/state/action/sheet/roster/welcome/
// kicked/sheet-update/peer-list — só a "cor cana" por baixo mudou de
// WebRTC pra WebSocket.
// ══════════════════════════════════════════════════════════════

import { WebSocketServer } from 'ws';
import crypto from 'node:crypto';
import { db } from './db.js';
import { verifyToken } from './auth.js';

const EMPTY_STATE = () => ({
  tokens: [], maps: [], fog: null,
  settings: { gridSize: 60, gridScale: 1.5, showGrid: true },
  chat: [], initiative: { combatants: [], currentIndex: -1, round: 1, active: false },
  roster: [], members: [],
});

// rooms em memória: code -> { name, gmUserId, state, gmSocket, players: Map(peerId -> {ws,name,avatar,color}), sheets: Map(ownerId -> sheet) }
const live = new Map();

function loadOrCreateRoom(code, gmUserId, name) {
  let row = db.prepare(`SELECT * FROM rooms WHERE code = ?`).get(code);
  if (!row) {
    const state = JSON.stringify(EMPTY_STATE());
    db.prepare(`INSERT INTO rooms (code, gm_user_id, name, state) VALUES (?, ?, ?, ?)`)
      .run(code, gmUserId, name || 'Mesa', state);
    row = db.prepare(`SELECT * FROM rooms WHERE code = ?`).get(code);
  }
  return row;
}

function persist(code) {
  const room = live.get(code);
  if (!room) return;
  db.prepare(`UPDATE rooms SET state = ?, name = ?, updated_at = datetime('now') WHERE code = ?`)
    .run(JSON.stringify(room.state), room.name, code);
}

// Persistência é "quase em tempo real" mas não a cada byte: sincroniza no
// máximo a cada 1.5s por sala (chat/tokens/etc mudam com frequência
// alta durante o jogo — não faz sentido bater no disco a cada evento).
const persistTimers = new Map();
function schedulePersist(code) {
  if (persistTimers.has(code)) return;
  persistTimers.set(code, setTimeout(() => {
    persistTimers.delete(code);
    persist(code);
  }, 1500));
}

function getRoom(code) {
  if (live.has(code)) return live.get(code);
  const row = db.prepare(`SELECT * FROM rooms WHERE code = ?`).get(code);
  if (!row) return null;
  let state;
  try { state = JSON.parse(row.state); } catch { state = EMPTY_STATE(); }
  const room = { name: row.name, gmUserId: row.gm_user_id, state, gmSocket: null, players: new Map(), sheets: new Map() };
  live.set(code, room);
  return room;
}

function send(ws, msg) {
  if (ws && ws.readyState === ws.OPEN) {
    try { ws.send(JSON.stringify(msg)); } catch { /* ignore */ }
  }
}

function broadcast(room, msg, exceptPeerId) {
  room.players.forEach((p, peerId) => {
    if (peerId === exceptPeerId) return;
    send(p.ws, msg);
  });
}

function peerListPayload(room) {
  return { players: [...room.players.values()].map(p => p.name) };
}

// Reducer simplificado usado só quando o Mestre NÃO está conectado —
// aplica a ação direto no estado persistido da sala e retransmite pros
// outros jogadores, pra sala continuar de pé mesmo com o Mestre longe
// (com exceção de ferramentas que realmente só fazem sentido com ele
// por perto, tipo subir mapa novo ou pintar névoa).
function applyAction(room, peerId, action, payload, code) {
  switch (action) {
    case 'tokens':
      room.state.tokens = payload;
      broadcast(room, { type: 'state', slice: 'tokens', payload });
      schedulePersist(code);
      break;
    case 'tokenMove': {
      const t = room.state.tokens.find(x => x.id === payload.id);
      if (t) Object.assign(t, payload);
      broadcast(room, { type: 'state', slice: 'tokenMove', payload }, peerId);
      schedulePersist(code);
      break;
    }
    case 'ping':
      broadcast(room, { type: 'state', slice: 'ping', payload });
      break;
    case 'spotlight':
    case 'ruler': {
      const out = { ...payload, peerId };
      broadcast(room, { type: 'state', slice: action, payload: out }, peerId);
      break;
    }
    case 'initiative':
      room.state.initiative = payload;
      broadcast(room, { type: 'state', slice: 'initiative', payload });
      schedulePersist(code);
      break;
    case 'chat':
      room.state.chat = [...room.state.chat, payload].slice(-100);
      broadcast(room, { type: 'state', slice: 'chat', payload }, peerId);
      schedulePersist(code);
      break;
    case 'request-sync': {
      const target = room.players.get(peerId)?.ws;
      if (!target) break;
      send(target, { type: 'state', slice: 'tokens', payload: room.state.tokens });
      send(target, { type: 'state', slice: 'fog', payload: room.state.fog });
      if (room.state.maps?.length) send(target, { type: 'state', slice: 'maps', payload: room.state.maps });
      send(target, { type: 'state', slice: 'initiative', payload: room.state.initiative });
      break;
    }
    default:
      break;
  }
}

function applyRosterOp(room, peerId, op, payload) {
  const info = room.players.get(peerId);
  let roster = room.state.roster;
  if (op === 'add') {
    payload.ownerId   = peerId;
    payload.ownerName = info?.name || payload.ownerName || 'Jogador';
    roster = roster.filter(e => e.sheetId !== payload.sheetId || e.ownerId !== peerId);
    roster.push(payload);
  } else if (op === 'remove') {
    roster = roster.filter(e => !(e.sheetId === payload.sheetId && e.ownerId === peerId));
  }
  room.state.roster = roster;
  broadcast(room, { type: 'roster', payload: roster });
}

export function attachRoomsServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/rooms' });

  wss.on('connection', ws => {
    let joined = null; // { code, peerId, isGM }

    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      // ── Mestre cria/retoma uma sala ──────────────────────────
      if (msg.type === 'gm-connect') {
        const session = msg.token ? verifyToken(msg.token) : null;
        if (!session) { send(ws, { type: 'error', error: 'Sessão inválida — faça login de novo pra hospedar uma mesa.' }); ws.close(); return; }
        const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(session.userId);
        if (!user) { send(ws, { type: 'error', error: 'Usuário não encontrado.' }); ws.close(); return; }

        const code = (msg.code || randomRoomCode()).toUpperCase();
        const existingRow = db.prepare(`SELECT * FROM rooms WHERE code = ?`).get(code);
        if (existingRow && existingRow.gm_user_id && existingRow.gm_user_id !== user.id) {
          send(ws, { type: 'error', error: 'Esse código de mesa pertence a outra conta.' });
          ws.close();
          return;
        }
        loadOrCreateRoom(code, user.id, msg.name);
        const room = getRoom(code);
        room.gmUserId = user.id;
        if (msg.name) room.name = msg.name;
        room.gmSocket = ws;

        joined = { code, peerId: 'gm', isGM: true };
        send(ws, { type: 'room-ready', code, state: room.state, players: peerListPayload(room).players });
        return;
      }

      // ── Jogador entra numa sala existente ────────────────────
      if (msg.type === 'join') {
        const code = (msg.code || '').toUpperCase();
        const room = getRoom(code);
        if (!room) { send(ws, { type: 'error', error: 'Mesa não encontrada. Confira o código — o Mestre precisa ter aberto essa mesa pelo menos uma vez.' }); ws.close(); return; }

        const peerId = crypto.randomUUID();
        room.players.set(peerId, { ws, name: msg.name, avatar: msg.avatar || null, color: msg.color || null });
        joined = { code, peerId, isGM: false };

        if (room.gmSocket) send(room.gmSocket, { type: 'player-joined-raw', peerId, name: msg.name, avatar: msg.avatar, color: msg.color });
        broadcast(room, { type: 'peer-list', players: peerListPayload(room).players });
        send(ws, { type: 'joined', peerId, state: room.state });
        return;
      }

      if (!joined) return; // mensagem antes de gm-connect/join — ignora
      const room = getRoom(joined.code);
      if (!room) return;

      if (joined.isGM) {
        // Mensagens vindas do Mestre: broadcasts de estado completo
        // (tokens/mapas/névoa/settings/etc — coisas que só o Mestre edita
        // de verdade) e utilitários (welcome, sheet-update, kicked, roster).
        if (msg.type === 'state') {
          room.state[msg.slice] = msg.payload;
          broadcast(room, { type: 'state', slice: msg.slice, payload: msg.payload });
          schedulePersist(joined.code);
        } else if (msg.type === 'roster') {
          room.state.roster = msg.payload;
          broadcast(room, { type: 'roster', payload: msg.payload });
          schedulePersist(joined.code);
        } else if (msg.type === 'sendTo') {
          const target = room.players.get(msg.peerId);
          if (target) send(target.ws, msg.payload);
        } else if (msg.type === 'kick') {
          const target = room.players.get(msg.peerId);
          if (target) { send(target.ws, { type: 'kicked' }); setTimeout(() => { try { target.ws.close(); } catch {} }, 150); }
        }
      } else {
        // Mensagens vindas de um jogador.
        //
        // Se o Mestre estiver online, repassa a mensagem crua pra ele
        // exatamente como antes (era assim que o PeerJS funcionava) — o
        // main.js do Mestre já sabe processar cada uma dessas e
        // rebroadcastar o resultado via 'state'/'roster', sem precisar
        // mudar nada ali. Só quando o Mestre NÃO está por perto é que o
        // servidor aplica a versão simplificada dele mesmo (applyAction/
        // applyRosterOp abaixo), pra sala continuar funcionando pros
        // jogadores mesmo sem o Mestre conectado.
        if (msg.type === 'action') {
          if (room.gmSocket) {
            send(room.gmSocket, { type: 'action', peerId: joined.peerId, action: msg.action, payload: msg.payload });
          } else {
            applyAction(room, joined.peerId, msg.action, msg.payload, joined.code);
          }
        } else if (msg.type === 'sheet') {
          room.sheets.set(joined.peerId, msg.sheet);
          if (room.gmSocket) send(room.gmSocket, { type: 'sheet-from-peer', peerId: joined.peerId, sheet: msg.sheet });
          schedulePersist(joined.code);
        } else if (msg.type === 'roster-request') {
          if (room.gmSocket) {
            send(room.gmSocket, { type: 'roster-request', peerId: joined.peerId, op: msg.op, payload: msg.payload });
          } else {
            applyRosterOp(room, joined.peerId, msg.op, msg.payload);
          }
          schedulePersist(joined.code);
        }
      }
    });

    ws.on('close', () => {
      if (!joined) return;
      const room = live.get(joined.code);
      if (!room) return;
      if (joined.isGM) {
        if (room.gmSocket === ws) room.gmSocket = null;
        persist(joined.code); // salva o estado atual assim que o Mestre sai, não só a cada 1.5s
      } else {
        const info = room.players.get(joined.peerId);
        room.players.delete(joined.peerId);
        if (room.gmSocket) send(room.gmSocket, { type: 'player-left-raw', peerId: joined.peerId, name: info?.name });
        broadcast(room, { type: 'peer-list', players: peerListPayload(room).players });
      }
    });
  });

  console.log('[tablelink] Salas ao vivo em ws(s)://<host>/ws/rooms');
}

function randomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
