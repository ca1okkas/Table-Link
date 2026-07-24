// ══════════════════════════════════
// network.js — Sala Mestre/Jogadores via WebSocket, hospedada pelo
// SERVIDOR (não mais ponto-a-ponto/PeerJS).
//
// Antes, a sala era ponto-a-ponto (WebRTC/PeerJS): o Mestre virava o
// "host" e sua aba precisava ficar aberta a sessão inteira, porque era
// nela que o estado do tabuleiro vivia. Agora quem hospeda é o próprio
// servidor do TableLink (ver server/src/rooms.js) — o estado fica lá,
// persistido, e o Mestre é só mais um cliente que entra e sai. Se ele
// fechar a aba, a sala continua de pé pros jogadores (menos as poucas
// coisas que só fazem sentido com o Mestre por perto, tipo subir um
// mapa novo ou expulsar alguém).
//
// A API pública desta classe (createRoom/joinRoom/broadcast/sendAction/
// etc, e os eventos emitidos via .on(...)) é EXATAMENTE a mesma de
// antes — só o transporte por baixo mudou — então o resto do app
// (main.js) não precisa saber disso.
//
// Protocolo de mensagens (JSON, via WebSocket):
//  { type: 'gm-connect', token, code?, name }      — mestre → servidor, cria/retoma uma sala
//  { type: 'room-ready', code, state, players }    — servidor → mestre, confirma + estado atual
//  { type: 'join',       code, name, avatar, color }— jogador → servidor, entra numa sala
//  { type: 'joined',     peerId, state }           — servidor → jogador, confirma entrada + estado atual
//  { type: 'welcome',    tableName, gmName }       — mestre → jogador, avisa o nome real da mesa e do Mestre
//  { type: 'state',      slice, payload }          — → todos, atualiza um "slice" do estado
//  { type: 'action',     action, payload }         — jogador → servidor, pede uma ação
//  { type: 'sheet',      sheet }                   — jogador → servidor → mestre, sincroniza a ficha do próprio jogador
//  { type: 'sheet-update', sheet }                 — mestre → jogador, avisa que o Mestre editou a ficha dele
//  { type: 'peer-list',  players }                 — servidor → todos, lista de quem está conectado
//  { type: 'roster-request', op, payload }         — jogador → servidor → mestre, pede add/remove no elenco da mesa
//  { type: 'roster',    payload }                  — → todos, elenco (fichas) da mesa atualizado
//  { type: 'kicked' }                               — servidor → jogador, avisa que foi expulso
// ══════════════════════════════════

import { ROOMS_WS_URL } from './config.js';
import * as Auth from './auth.js';

export class NetworkManager {
  constructor() {
    this.role       = null;   // 'gm' | 'player' | null (modo solo)
    this.roomCode   = null;
    this.myId       = null;
    this.myName     = null;
    this.ws         = null;
    this.connections = new Map(); // (GM) peerId -> { name, avatar, color } — jogadores conectados
    this.isConnectedToHost = false; // (player) se o socket com o servidor está de pé

    this._handlers = {}; // type -> [callbacks]
  }

  get isOnline() { return this.role === 'gm' || this.role === 'player'; }
  get isGM()     { return this.role === 'gm'; }

  on(type, cb) {
    (this._handlers[type] ||= []).push(cb);
  }
  _emit(type, data) {
    (this._handlers[type] || []).forEach(cb => { try { cb(data); } catch (e) { console.error(e); } });
  }

  _send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(msg)); } catch (e) { console.error('[network] falha ao enviar:', e); }
    }
  }

  // ═══════════════════════════════
  // MESTRE — criar/retomar sala
  // ═══════════════════════════════
  // Se "code" for passado, tenta reabrir a mesma sala (usado ao reabrir
  // uma mesa salva no Dashboard, pra manter o mesmo convite/estado entre
  // sessões em vez de começar do zero).
  createRoom(myName, code) {
    return new Promise((resolve, reject) => {
      if (!Auth.isLoggedIn()) {
        reject(new Error('Você precisa estar logado numa conta para hospedar uma mesa (isso é o que permite a mesa continuar de pé mesmo se você fechar a aba).'));
        return;
      }
      this.role   = 'gm';
      this.myName = myName;

      let ws;
      try { ws = new WebSocket(ROOMS_WS_URL); }
      catch (e) { reject(new Error('Não foi possível conectar ao servidor de salas.')); return; }
      this.ws = ws;

      const timeout = setTimeout(() => reject(new Error('Tempo esgotado ao criar a sala. Verifique sua internet e tente novamente.')), 15000);

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'gm-connect', token: Auth.getToken(), code, name: myName }));
      });

      ws.addEventListener('message', ev => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }

        if (msg.type === 'room-ready') {
          clearTimeout(timeout);
          this.roomCode = msg.code;
          this.myId = 'gm';
          resolve({ code: this.roomCode, state: msg.state });
        } else if (msg.type === 'error') {
          clearTimeout(timeout);
          reject(new Error(msg.error || 'Erro ao criar a sala.'));
        } else {
          this._handleGmMessage(msg);
        }
      });

      ws.addEventListener('close', () => {
        clearTimeout(timeout);
        if (this.role === 'gm') this._emit('host-disconnected');
      });
      ws.addEventListener('error', () => {
        clearTimeout(timeout);
      });
    });
  }

  _handleGmMessage(msg) {
    if (msg.type === 'player-joined-raw') {
      this.connections.set(msg.peerId, { name: msg.name, avatar: msg.avatar || null, color: msg.color || null });
      this._emit('player-joined', { peerId: msg.peerId, name: msg.name, avatar: msg.avatar, color: msg.color });
      this._emit('request-full-sync', { peerId: msg.peerId });
    } else if (msg.type === 'player-left-raw') {
      this.connections.delete(msg.peerId);
      this._emit('player-left', { peerId: msg.peerId, name: msg.name });
    } else if (msg.type === 'peer-list') {
      this._emit('peer-list', { players: msg.players });
    } else if (msg.type === 'action') {
      this._emit('action', { peerId: msg.peerId, action: msg.action, payload: msg.payload });
    } else if (msg.type === 'state') {
      // Estado que o próprio servidor já aplicou (ex: tokenMove/chat/
      // initiative feitos por um jogador) — o Mestre só precisa refletir
      // isso na tela dele, não reprocessar.
      this._emit('state', { slice: msg.slice, payload: msg.payload });
    } else if (msg.type === 'sheet-from-peer') {
      this._emit('sheet', { peerId: msg.peerId, sheet: msg.sheet });
    } else if (msg.type === 'roster') {
      this._emit('roster', msg.payload);
    } else if (msg.type === 'roster-request') {
      this._emit('roster-request', { peerId: msg.peerId, op: msg.op, payload: msg.payload });
    }
  }

  // Envia para um jogador específico (usado pro sync inicial / welcome / sheet-update)
  sendTo(peerId, type, payload) {
    if (this.role !== 'gm') return;
    this._send({ type: 'sendTo', peerId, payload: { type, ...payload } });
  }

  // Expulsa um jogador da sala (Mestre apenas)
  kickPlayer(peerId) {
    if (this.role !== 'gm') return;
    this._send({ type: 'kick', peerId });
  }

  // Envia para todos os jogadores conectados (GM apenas) — o servidor já
  // guarda esse slice no estado persistido da sala.
  broadcast(slice, payload) {
    if (this.role !== 'gm') return;
    this._send({ type: 'state', slice, payload });
  }

  // Mantido por compatibilidade com quem chamava broadcastExcept — como
  // agora o servidor já cuida de não ecoar de volta pra quem originou a
  // ação (ver rooms.js), aqui isso equivale a um broadcast normal.
  broadcastExcept(slice, payload) {
    this.broadcast(slice, payload);
  }

  // ═══════════════════════════════
  // JOGADOR — entrar em sala
  // ═══════════════════════════════
  joinRoom(code, myName, profileInfo = {}) {
    return new Promise((resolve, reject) => {
      this.role     = 'player';
      this.myName   = myName;
      this.roomCode = code.trim().toUpperCase();

      let ws;
      try { ws = new WebSocket(ROOMS_WS_URL); }
      catch (e) { reject(new Error('Não foi possível conectar ao servidor de salas.')); return; }
      this.ws = ws;

      const timeout = setTimeout(() => reject(new Error('Não foi possível entrar na sala. Confira o código e tente de novo.')), 15000);

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({
          type: 'join', code: this.roomCode, name: myName,
          avatar: profileInfo.avatar || null, color: profileInfo.color || null,
        }));
      });

      ws.addEventListener('message', ev => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }

        if (msg.type === 'joined') {
          clearTimeout(timeout);
          this.myId = msg.peerId;
          this.isConnectedToHost = true;
          resolve({ state: msg.state });
        } else if (msg.type === 'error') {
          clearTimeout(timeout);
          reject(new Error(msg.error || 'Não foi possível entrar na sala.'));
        } else {
          this._handlePlayerMessage(msg);
        }
      });

      ws.addEventListener('close', () => {
        clearTimeout(timeout);
        this.isConnectedToHost = false;
        this._emit('disconnected');
      });
      ws.addEventListener('error', () => {
        clearTimeout(timeout);
      });
    });
  }

  _handlePlayerMessage(msg) {
    if (msg.type === 'state') {
      if (msg.slice === 'peer-list') { this._emit('peer-list', msg.payload); return; }
      this._emit('state', { slice: msg.slice, payload: msg.payload });
    } else if (msg.type === 'peer-list') {
      this._emit('peer-list', msg);
    } else if (msg.type === 'kicked') {
      this._emit('kicked', {});
    } else if (msg.type === 'roster') {
      this._emit('roster', msg.payload);
    } else if (msg.type === 'sheet-update') {
      this._emit('sheet-update', msg.sheet);
    } else if (msg.type === 'welcome') {
      this._emit('welcome', { tableName: msg.tableName, gmName: msg.gmName });
    }
  }

  // Jogador pede uma ação ao servidor (ex: mover token, rolar dado)
  sendAction(action, payload) {
    if (this.role !== 'player') return;
    this._send({ type: 'action', action, payload });
  }

  // Jogador sincroniza a própria ficha com o mestre
  sendSheet(sheet) {
    if (this.role !== 'player') return;
    this._send({ type: 'sheet', sheet });
  }

  // Jogador pede pro Mestre adicionar/remover uma ficha do elenco da mesa
  sendRosterRequest(op, payload) {
    if (this.role !== 'player') return;
    this._send({ type: 'roster-request', op, payload });
  }

  // Mestre transmite o elenco atualizado da mesa pra todos os jogadores
  broadcastRoster(roster) {
    if (this.role !== 'gm') return;
    this._send({ type: 'roster', payload: roster });
  }

  disconnect() {
    try { this.ws?.close(); } catch (e) {}
    this.connections.clear();
    this.ws = null;
    this.role = null;
  }
}
