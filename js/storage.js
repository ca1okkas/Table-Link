// ══════════════════════════════════
// storage.js — Persistência com IndexedDB (+ cache em memória)
// ══════════════════════════════════
//
// Antes isso tudo ia direto pro localStorage, que tem uma cota bem
// pequena (uns 5–10MB por site) — fácil de estourar com mapas e fotos
// de token em base64, o que já causava erro de "armazenamento cheio".
//
// Agora os dados de verdade ficam no IndexedDB (centenas de MB, às vezes
// GB, dependendo do navegador/disco livre), mas todo o resto do app
// continua chamando Storage.getX()/saveX() exatamente como antes, sem
// precisar de "await" em lugar nenhum: na inicialização, lemos tudo do
// IndexedDB pra um cache em memória (isso sim é assíncrono, e é o único
// ponto que espera); depois disso, toda leitura vem do cache na hora
// (síncrono) e toda escrita atualiza o cache na hora + manda pro
// IndexedDB em segundo plano.
//
// MÚLTIPLAS MESAS: desde a introdução da aba "Mesas" no Dashboard, o
// tabuleiro (tokens/mapas/névoa/chat/iniciativa/câmera/config) passou a
// ser guardado por mesa, não mais um único conjunto global. Isso é feito
// simplesmente sufixando a chave com o id da mesa ativa (ex:
// "tl_tokens::AB3XZ"). Fichas de personagem, ameaças e o perfil do
// jogador continuam globais (são "seus", atravessam qualquer mesa).

import { idbSet, idbDelete, idbGetAll } from './idb.js';
import * as Auth from './auth.js';

const KEYS = {
  TOKENS:     'tl_tokens',
  MAP:        'tl_map',       // formato antigo (um mapa só) — mantido só pra migração
  MAPS:       'tl_maps',      // formato novo (vários mapas)
  FOG:        'tl_fog',
  SETTINGS:   'tl_settings',
  CHAT:       'tl_chat',
  INITIATIVE: 'tl_initiative',
  CAMERA:     'tl_camera',
  PLAYER:     'tl_player',
  HISTORY:    'tl_undo_history',
  SHEETS:     'tl_sheets',
  TABLES:     'tl_tables',    // global: lista de mesas criadas/entradas por este navegador
  THREATS:    'tl_threats',   // global: bestiário (ameaças) do mestre
  THREATS_SEEDED_IDS: 'tl_threats_seeded_ids', // global: ids de ameaças pré-salvas já inseridas (não reinserir se o usuário apagou)
  ROSTER:     'tl_roster',    // por mesa: fichas adicionadas à mesa
  MEMBERS:    'tl_members',   // por mesa: jogadores que já entraram nesta mesa (persiste mesmo offline)
};

// Chaves que passam a ser namespaced por mesa (sufixo "::<tableId>").
const TABLE_SCOPED_KEYS = new Set([
  KEYS.TOKENS, KEYS.MAP, KEYS.MAPS, KEYS.FOG, KEYS.SETTINGS,
  KEYS.CHAT, KEYS.INITIATIVE, KEYS.CAMERA, KEYS.ROSTER, KEYS.MEMBERS,
]);

function baseKey(key) {
  const i = key.indexOf('::');
  return i === -1 ? key : key.slice(0, i);
}

function defaultFor(key) {
  switch (baseKey(key)) {
    case KEYS.TOKENS:
    case KEYS.MAPS:
    case KEYS.CHAT:
    case KEYS.SHEETS:
    case KEYS.TABLES:
    case KEYS.THREATS:
    case KEYS.THREATS_SEEDED_IDS:
    case KEYS.ROSTER:
    case KEYS.MEMBERS:
      return [];
    case KEYS.SETTINGS:
      return { gridSize: 60, gridScale: 1.5, showGrid: true, playerName: 'Jogador' };
    case KEYS.CAMERA:
      return { x: 0, y: 0, zoom: 1 };
    case KEYS.INITIATIVE:
      return { combatants: [], currentIndex: -1, round: 1, active: false };
    default:
      return null;
  }
}

const cache = {};

// ── Sincronização com a conta (nuvem) ───────────────────────────
// "Minhas Fichas" e a lista de "Mesas" acompanham o navegador (via
// IndexedDB) desde sempre — isso adiciona um espelho na conta (quando
// logado), pra abrir em outro navegador/aparelho e encontrar tudo lá.
// A escrita local (síncrona, de sempre) nunca espera a nuvem: a
// sincronização roda em segundo plano, com um pequeno atraso (debounce)
// pra não bater no servidor a cada tecla digitada numa ficha.
const CLOUD_PUSH_DELAY = 1200;
let _pushSheetsTimer = null;
let _pushTablesTimer = null;

function schedulePushSheets() {
  if (!Auth.isLoggedIn()) return;
  clearTimeout(_pushSheetsTimer);
  _pushSheetsTimer = setTimeout(() => {
    Auth.pushCloudSheets(cache[KEYS.SHEETS] || []).catch(e => {
      console.warn('[TableLink] Não deu pra sincronizar as fichas com a conta:', e.message);
    });
  }, CLOUD_PUSH_DELAY);
}
function schedulePushTables() {
  if (!Auth.isLoggedIn()) return;
  clearTimeout(_pushTablesTimer);
  _pushTablesTimer = setTimeout(() => {
    Auth.pushCloudTables(cache[KEYS.TABLES] || []).catch(e => {
      console.warn('[TableLink] Não deu pra sincronizar a lista de mesas com a conta:', e.message);
    });
  }, CLOUD_PUSH_DELAY);
}

// Mescla o que veio da nuvem com o que já está neste navegador: em caso
// de empate (mesmo id nos dois lados), o que está neste navegador vence
// — é o mais provável de estar mais atualizado numa sessão em andamento.
// O que só existe na nuvem (ex: criado em outro aparelho) entra também.
function mergeById(localList, cloudList) {
  const byId = new Map((cloudList || []).map(item => [item.id, item]));
  (localList || []).forEach(item => byId.set(item.id, item));
  return [...byId.values()];
}

// Mesa atualmente "ativa" (aberta) nesta aba — governa o sufixo usado
// pelas chaves namespaced. null = nenhuma mesa aberta ainda (Dashboard).
let activeTableId = null;

function nsKey(base) {
  return TABLE_SCOPED_KEYS.has(base) && activeTableId ? `${base}::${activeTableId}` : base;
}

// Atualiza o cache na hora (síncrono) e manda pro IndexedDB em segundo
// plano (assíncrono). Se o IndexedDB falhar por algum motivo (raríssimo,
// mas pode acontecer com disco cheio de verdade), a sessão atual continua
// funcionando normalmente — só avisa que aquele salvamento específico não
// persistiu.
function write(key, value) {
  cache[key] = value;
  idbSet(key, value).catch(e => {
    console.warn(`[TableLink] Não foi possível salvar "${key}" no IndexedDB.`, e);
    window.dispatchEvent(new CustomEvent('tl-storage-full', { detail: { key } }));
  });
}

// ── Hidratação inicial ──
// Lê tudo do IndexedDB pro cache antes de qualquer outra parte do app
// tentar usar o Storage — como o IndexedDB guarda "qualquer chave", isso
// já traz de uma vez tanto as chaves globais quanto as de cada mesa
// (tl_tokens::AB3XZ, tl_tokens::XYZ12, etc). Se essa é a primeira vez que
// essa versão roda (IndexedDB ainda vazio), migra o que existir no
// localStorage antigo (formato pré-mesas) — assim ninguém perde a mesa
// única que já tinha ao atualizar.
async function hydrate() {
  let fromIDB = {};
  try {
    fromIDB = await idbGetAll();
  } catch (e) {
    console.warn('[TableLink] IndexedDB indisponível — usando só a memória desta aba (nada persiste ao recarregar).', e);
  }
  Object.assign(cache, fromIDB);

  Object.values(KEYS).forEach(key => {
    if (key in cache) return;
    // Não tinha no IndexedDB ainda — tenta trazer do localStorage (versões
    // anteriores do TableLink guardavam tudo lá, sem conceito de mesa).
    const legacy = localStorage.getItem(key);
    if (legacy !== null) {
      let parsed;
      try { parsed = key === KEYS.FOG ? legacy : JSON.parse(legacy); }
      catch { parsed = defaultFor(key); }
      cache[key] = parsed;
      idbSet(key, parsed).catch(() => {});
    } else {
      cache[key] = defaultFor(key);
    }
  });

  // Migração: se existir uma "mesa" sem namespace (formato de versões
  // anteriores) mas ainda não existir nenhuma mesa cadastrada em
  // tl_tables, registra ela como "Mesa Antiga" pra não perder o acesso.
  if ((!cache[KEYS.TABLES] || cache[KEYS.TABLES].length === 0) &&
      (cache[KEYS.TOKENS]?.length || cache[KEYS.MAPS]?.length)) {
    cache[KEYS.TABLES] = [{
      id: 'legacy', name: 'Mesa Antiga', role: 'solo', code: null, createdAt: Date.now(), lastOpenedAt: Date.now(),
    }];
    write(KEYS.TABLES, cache[KEYS.TABLES]);
    // Copia os dados sem-namespace pra dentro do namespace "legacy" também,
    // pra abrir essa mesa da lista já mostrar tudo que tinha antes.
    TABLE_SCOPED_KEYS.forEach(k => {
      if (cache[k] !== undefined && cache[`${k}::legacy`] === undefined) {
        write(`${k}::legacy`, cache[k]);
      }
    });
  }

  // Migração extra: formato de mapa único (bem antigo) → array de mapas.
  if (!cache[KEYS.MAPS] || cache[KEYS.MAPS].length === 0) {
    const oldMap = cache[KEYS.MAP];
    if (oldMap?.src) {
      cache[KEYS.MAPS] = [{ id: 'map_legacy', src: oldMap.src, name: 'Mapa' }];
      write(KEYS.MAPS, cache[KEYS.MAPS]);
    }
  }
}

// Top-level await: qualquer módulo que importar { Storage } daqui só
// termina de carregar depois que essa hidratação acabar — então, na
// prática, todo o resto do app já encontra o cache pronto e pode
// continuar chamando Storage.getX() de forma 100% síncrona, como sempre.
await hydrate();

export const Storage = {

  // ── MESA ATIVA (governa o namespace usado pelas chaves acima) ──
  setActiveTable(tableId) { activeTableId = tableId || null; },
  getActiveTable() { return activeTableId; },

  // ── PLAYER (perfil: nome, foto, cor) ──
  getPlayer() {
    return cache[KEYS.PLAYER] ?? null;
  },
  // Aceita tanto uma string (só o nome, jeito antigo) quanto um objeto
  // parcial { name, avatar, color } — sempre mescla com o perfil já salvo,
  // pra dar pra atualizar só um campo de cada vez.
  setPlayer(profile) {
    const current = this.getPlayer() || {};
    const patch   = typeof profile === 'string' ? { name: profile } : (profile || {});
    const next    = { ...current, ...patch };
    write(KEYS.PLAYER, next);
    return next;
  },

  // ── MESAS (global — lista das mesas que este navegador criou ou entrou) ──
  getTables() {
    return cache[KEYS.TABLES] || [];
  },
  saveTables(list) {
    write(KEYS.TABLES, list);
    schedulePushTables();
  },
  upsertTable(table) {
    const list = this.getTables();
    const idx = list.findIndex(t => t.id === table.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...table }; else list.push(table);
    this.saveTables(list);
    return idx >= 0 ? list[idx] : table;
  },
  removeTable(id) {
    this.saveTables(this.getTables().filter(t => t.id !== id));
  },

  // ── AMEAÇAS (global — bestiário do mestre: monstros e chefes) ──
  getThreats() {
    return cache[KEYS.THREATS] || [];
  },
  saveThreats(list) {
    write(KEYS.THREATS, list);
  },
  // Ids de ameaças pré-salvas (do livro) já inseridas alguma vez neste
  // navegador — usado só pra decidir o que semear a mais quando o app
  // ganha novas ameaças pré-salvas numa atualização futura, sem reinserir
  // uma que o usuário já apagou de propósito.
  getSeededThreatIds() {
    return cache[KEYS.THREATS_SEEDED_IDS] || [];
  },
  saveSeededThreatIds(list) {
    write(KEYS.THREATS_SEEDED_IDS, list);
  },

  // ── ELENCO DA MESA (roster — fichas adicionadas à mesa ativa) ──
  getRoster() {
    return cache[nsKey(KEYS.ROSTER)] || [];
  },
  saveRoster(list) {
    write(nsKey(KEYS.ROSTER), list);
  },

  // ── MEMBROS DA MESA (jogadores que já entraram nesta mesa alguma vez —
  // fica registrado mesmo depois que a pessoa desconecta, pra dar pra
  // mostrar "quem é da mesa" independente de estar online agora) ──
  getMembers() {
    return cache[nsKey(KEYS.MEMBERS)] || [];
  },
  saveMembers(list) {
    write(nsKey(KEYS.MEMBERS), list);
  },
  // Atualiza (ou cria) o registro de um membro pelo nome — nome é o
  // identificador mais estável que temos aqui, já que o id de rede de um
  // jogador muda a cada reconexão (o servidor gera um novo toda sessão).
  upsertMember({ name, avatar, color }) {
    if (!name) return;
    const list = this.getMembers();
    const idx = list.findIndex(m => m.name === name);
    const entry = { name, avatar: avatar ?? null, color: color || null, lastSeen: Date.now() };
    if (idx >= 0) list[idx] = { ...list[idx], ...entry };
    else list.push(entry);
    this.saveMembers(list);
    return entry;
  },

  // ── SETTINGS ──
  getSettings() {
    return cache[nsKey(KEYS.SETTINGS)] || defaultFor(KEYS.SETTINGS);
  },
  saveSettings(settings) {
    write(nsKey(KEYS.SETTINGS), settings);
  },

  // ── TOKENS ──
  getTokens() {
    return cache[nsKey(KEYS.TOKENS)] || [];
  },
  saveTokens(tokens) {
    // Salvar apenas dados serializáveis (sem o objeto Image)
    const serializable = tokens.map(t => ({
      id: t.id,
      name: t.name,
      x: t.x,
      y: t.y,
      scale: t.scale,
      rotation: t.rotation,
      flipH: t.flipH,
      flipV: t.flipV,
      hp: t.hp,
      hpMax: t.hpMax,
      mana: t.mana,
      armor: t.armor,
      conditions: t.conditions,
      locked: t.locked,
      imageSrc: t.imageSrc,
      color: t.color,
      sheetId: t.sheetId || null,
      threatId: t.threatId || null,
      isThreat: !!t.isThreat,
      hidden: !!t.hidden,
    }));
    write(nsKey(KEYS.TOKENS), serializable);
  },

  // ── MAPAS (vários por mesa) ──
  getMaps() {
    return cache[nsKey(KEYS.MAPS)] || [];
  },
  saveMaps(maps) {
    write(nsKey(KEYS.MAPS), maps);
  },

  // ── CAMERA ──
  getCamera() {
    return cache[nsKey(KEYS.CAMERA)] || defaultFor(KEYS.CAMERA);
  },
  saveCamera(camera) {
    write(nsKey(KEYS.CAMERA), camera);
  },

  // ── FOG ──
  getFog() {
    return cache[nsKey(KEYS.FOG)] ?? null;
  },
  saveFog(dataURL) {
    write(nsKey(KEYS.FOG), dataURL);
  },

  // ── CHAT ──
  getChat() {
    return cache[nsKey(KEYS.CHAT)] || [];
  },
  saveChat(messages) {
    // Guardar apenas as últimas 100 mensagens
    write(nsKey(KEYS.CHAT), messages.slice(-100));
  },

  // ── INITIATIVE ──
  getInitiative() {
    return cache[nsKey(KEYS.INITIATIVE)] || defaultFor(KEYS.INITIATIVE);
  },
  saveInitiative(data) {
    write(nsKey(KEYS.INITIATIVE), data);
  },

  // ── FICHAS DE PERSONAGEM (global — "Minhas Fichas", atravessa mesas) ──
  getSheets() {
    return cache[KEYS.SHEETS] || [];
  },
  saveSheets(sheets) {
    write(KEYS.SHEETS, sheets);
    schedulePushSheets();
  },

  // Chamado logo após confirmar login/registro (ver bootAuth em main.js):
  // busca fichas e mesas salvas na conta e mescla com o que já está
  // neste navegador, sem esperar (nem travar) o resto da tela carregar.
  async pullCloudData() {
    if (!Auth.isLoggedIn()) return;
    try {
      const [cloudSheets, cloudTables] = await Promise.all([
        Auth.fetchCloudSheets(), Auth.fetchCloudTables(),
      ]);
      const mergedSheets = mergeById(cache[KEYS.SHEETS], cloudSheets);
      const mergedTables = mergeById(cache[KEYS.TABLES], cloudTables);
      write(KEYS.SHEETS, mergedSheets);
      write(KEYS.TABLES, mergedTables);
    } catch (e) {
      console.warn('[TableLink] Não deu pra buscar fichas/mesas da conta:', e.message);
    }
  },

  // ── RESET (limpa só o tabuleiro da mesa ATIVA — fichas/mesas continuam) ──
  clearAll() {
    TABLE_SCOPED_KEYS.forEach(k => {
      const key = nsKey(k);
      cache[key] = defaultFor(k);
      idbDelete(key).catch(() => {});
      localStorage.removeItem(key);
    });
  },

  // ── BACKUP (exportar/importar tudo em um arquivo .json) ──
  // Continua existindo mesmo com bem mais espaço agora — sempre é bom
  // poder levar a mesa pra outro computador ou guardar uma cópia à parte.
  // Exporta só o tabuleiro da mesa ativa (mais fichas/ameaças, que são globais).
  exportAll() {
    const data = {
      _tableLinkBackup: true,
      version: 2,
      exportedAt: new Date().toISOString(),
      tableId:    activeTableId,
      tokens:     this.getTokens(),
      maps:       this.getMaps(),
      fog:        this.getFog(),
      settings:   this.getSettings(),
      chat:       this.getChat(),
      initiative: this.getInitiative(),
      roster:     this.getRoster(),
      sheets:     this.getSheets(),
      threats:    this.getThreats(),
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `tablelink-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // Restaura um backup exportado com exportAll(). Retorna { ok, error }.
  importAll(data) {
    if (!data || typeof data !== 'object' || !data._tableLinkBackup) {
      return { ok: false, error: 'Esse arquivo não parece ser um backup do TableLink.' };
    }
    try {
      if (data.tokens     !== undefined) write(nsKey(KEYS.TOKENS),     data.tokens);
      if (data.maps       !== undefined) write(nsKey(KEYS.MAPS),       data.maps);
      if (data.fog        !== undefined && data.fog !== null) write(nsKey(KEYS.FOG), data.fog);
      if (data.settings   !== undefined) write(nsKey(KEYS.SETTINGS),   data.settings);
      if (data.chat       !== undefined) write(nsKey(KEYS.CHAT),       data.chat);
      if (data.initiative !== undefined) write(nsKey(KEYS.INITIATIVE), data.initiative);
      if (data.roster     !== undefined) write(nsKey(KEYS.ROSTER),     data.roster);
      if (data.sheets     !== undefined) write(KEYS.SHEETS,   data.sheets);
      if (data.threats    !== undefined) write(KEYS.THREATS,  data.threats);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Falha ao restaurar o backup: ' + e.message };
    }
  },
};
