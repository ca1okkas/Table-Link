// ══════════════════════════════════════════════════════════════
// sheet.js — Ficha de Personagem (Ordem Paranormal / Sistema D20)
//
// MECÂNICA PRINCIPAL:
//   Cada atributo tem um VALOR (ex: 3).
//   Ao testar esse atributo ou uma perícia ligada a ele,
//   o jogador rola N d20 (onde N = valor do atributo).
//   O resultado é o MAIOR dos dados rolados.
//   Perícias treinadas: rolar N+treino dados, pegar o maior.
//
// ATRIBUTOS: Agilidade, Força, Intelecto, Presença, Vigor
// RECURSOS:  HP / Pontos de Determinação (PD) / PE / Armadura
// SEÇÕES:    Personagem · Combate · Rituais · Inventário · Habilidades · Notas
// ══════════════════════════════════════════════════════════════

import { rollFormula } from './dice.js';
import { uiAlert, uiConfirm, uiPrompt } from './ui-dialogs.js';
import { RITUAL_PRESETS, PODER_PARANORMAL_PRESETS, PODER_CLASSE_PRESETS, TRILHA_PODER_PRESETS, CUSTO_POR_CIRCULO } from './op-data.js';
import {
  WEAPON_PRESETS, MUNITION_PRESETS, PROTECTION_PRESETS, GENERAL_ITEM_PRESETS,
  WEAPON_MODIFICATIONS, PROTECTION_MODIFICATIONS, ACCESSORY_MODIFICATIONS,
  WEAPON_CURSES, PROTECTION_CURSES, ACCESSORY_CURSES,
  ELEMENTO_LABEL, elementosConflitam, custoCategoriaMaldicoes, mergeDanoExtra, calibreGrossoExtra,
} from './op-equipamentos.js';
import { CONDITIONS, CONDITION_MAP, getConditionRollPenalty, getConditionAtkPenalty, getConditionDefesaMod, conditionTooltip } from './conditions.js';
import { icon } from './icons.js';

// Wrapper seguro — retorna null se fórmula inválida em vez de explodir
function rollFormulaSafe(formula) {
  try { return rollFormula(formula); } catch { return null; }
}

// ─── Tipos de dano (armas/ataques) ─────────────────────────────
const DAMAGE_TYPES = ['Corte', 'Perfuração', 'Impacto', 'Balístico', 'Fogo', 'Ácido', 'Elétrico', 'Frio', 'Sagrado', 'Insano', 'Outro'];

// Multiplica só a QUANTIDADE de dados de uma fórmula (ex: "2d6+3", x3 → "6d6+3").
// Bônus fixo não é multiplicado — só os dados de dano, como manda a regra de crítico.
// Se a fórmula não for reconhecida, devolve ela mesma sem alterar.
function multiplyDiceFormula(formula, mult) {
  const clean = (formula || '').trim().toLowerCase().replace(/\s/g, '');
  const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match || mult <= 1) return formula;
  const count = (parseInt(match[1] || '1')) * mult;
  const sides = match[2];
  const bonus = match[3] || '';
  return `${count}d${sides}${bonus}`;
}

// ─── Atributos ────────────────────────────────────────────────
const ATTR_LIST = [
  { key: 'agilidade', label: 'Agilidade', abbr: 'AGI' },
  { key: 'forca',     label: 'Força',     abbr: 'FOR' },
  { key: 'intelecto', label: 'Intelecto', abbr: 'INT' },
  { key: 'presenca',  label: 'Presença',  abbr: 'PRE' },
  { key: 'vigor',     label: 'Vigor',     abbr: 'VIG' },
];
const ATTR_MAP = Object.fromEntries(ATTR_LIST.map(a => [a.key, a]));

// Lê o valor de um atributo com segurança: 0 é um valor válido (zerado),
// só cai para 1 se o atributo realmente não existir na ficha.
function getAttrVal(sheet, key) {
  const v = sheet.attrs[key];
  return v === undefined || v === null ? 1 : v;
}

// Uma perícia tem um atributo "padrão" (ex: Luta → Força), mas o jogador
// pode trocar na hora de rolar (ex: lutando com uma katana, Luta com
// Agilidade em vez de Força). Se não houver override salvo, usa o padrão.
function getPericiaAttrKey(sheet, p) {
  const perData = sheet.pericias[p.key];
  const override = perData && perData.attrOverride;
  return (override && ATTR_MAP[override]) ? override : p.attr;
}

// ─── Perícias (imagem do usuário) ─────────────────────────────
// Formato: { key, label, attr, starred } — starred = classe (*)
const PERICIAS = [
  { key: 'acrobacia',    label: 'Acrobacia',    attr: 'agilidade', starred: false },
  { key: 'adestramento', label: 'Adestramento', attr: 'presenca',  starred: false },
  { key: 'artes',        label: 'Artes',        attr: 'presenca',  starred: true  },
  { key: 'atletismo',    label: 'Atletismo',    attr: 'forca',     starred: false },
  { key: 'atualidades',  label: 'Atualidades',  attr: 'intelecto', starred: false },
  { key: 'ciencias',     label: 'Ciências',     attr: 'intelecto', starred: true  },
  { key: 'crime',        label: 'Crime',        attr: 'agilidade', starred: false },
  { key: 'diplomacia',   label: 'Diplomacia',   attr: 'presenca',  starred: false },
  { key: 'enganacao',    label: 'Enganação',    attr: 'presenca',  starred: false },
  { key: 'fortitude',    label: 'Fortitude',    attr: 'vigor',     starred: false },
  { key: 'furtividade',  label: 'Furtividade',  attr: 'agilidade', starred: false },
  { key: 'iniciativa',   label: 'Iniciativa',   attr: 'agilidade', starred: false },
  { key: 'intimidacao',  label: 'Intimidação',  attr: 'presenca',  starred: false },
  { key: 'intuicao',     label: 'Intuição',     attr: 'presenca',  starred: false },
  { key: 'investigacao', label: 'Investigação', attr: 'intelecto', starred: false },
  { key: 'luta',         label: 'Luta',         attr: 'forca',     starred: false },
  { key: 'medicina',     label: 'Medicina',     attr: 'intelecto', starred: false },
  { key: 'ocultismo',    label: 'Ocultismo',    attr: 'intelecto', starred: true  },
  { key: 'percepcao',    label: 'Percepção',    attr: 'presenca',  starred: false },
  { key: 'pilotagem',    label: 'Pilotagem',    attr: 'agilidade', starred: true  },
  { key: 'pontaria',     label: 'Pontaria',     attr: 'agilidade', starred: false },
  { key: 'profissao',    label: 'Profissão',    attr: 'intelecto', starred: true  },
  { key: 'reflexos',     label: 'Reflexos',     attr: 'agilidade', starred: false },
  { key: 'religiao',     label: 'Religião',     attr: 'presenca',  starred: true  },
  { key: 'sobrevivencia',label: 'Sobrevivência',attr: 'intelecto', starred: false },
  { key: 'tatica',       label: 'Tática',       attr: 'intelecto', starred: false },
  { key: 'tecnologia',   label: 'Tecnologia',   attr: 'intelecto', starred: true  },
  { key: 'vontade',      label: 'Vontade',      attr: 'presenca',  starred: false },
];

// ─── Bônus de Treinamento (Tabela oficial — Livro de Regras) ──
// O treino NUNCA aumenta a quantidade de dados rolados.
// Ele soma um bônus FIXO ao maior resultado do dado do atributo.
const TREINO_BONUS = [0, 5, 10, 15];               // Destreinado / Treinado / Veterano / Expert

// ─── Patentes ─────────────────────────────────────────────────
// Tabela 3.1 do livro de regras
const PATENTES = [
  { nome: 'Recruta',              pp: 0,   credito: 'Baixo',      limites: [2, 0, 0, 0] },
  { nome: 'Operador',             pp: 20,  credito: 'Médio',      limites: [3, 1, 0, 0] },
  { nome: 'Agente Especial',      pp: 50,  credito: 'Médio',      limites: [3, 2, 1, 0] },
  { nome: 'Oficial de Operações', pp: 100, credito: 'Alto',       limites: [3, 3, 2, 1] },
  { nome: 'Agente de Elite',      pp: 200, credito: 'Ilimitado',  limites: [3, 3, 3, 2] },
];

function getPatente(pp) {
  let pat = PATENTES[0];
  for (const p of PATENTES) { if (pp >= p.pp) pat = p; }
  return pat;
}

// Capacidade de carga: 5 × Força (Força 0 = 2 espaços) — livro p.53
function calcCarga(forca) {
  return forca === 0 ? 2 : forca * 5;
}

// Peso do item por categoria (espaços padrão): 0→0, I→1, II→1, III→2, IV→5
// (armas 2 mãos = 2, proteções pesadas = 5; simplificamos por cat)
const CAT_PESO_DEFAULT = { '0': 0, 'I': 1, 'II': 1, 'III': 2, 'IV': 5 };
const CAT_LABELS = ['0', 'I', 'II', 'III', 'IV'];

// ─── Rituais (Ordem Paranormal) ─────────────────────────
const RITUAL_ELEMENTOS = [
  { key: 'conhecimento', label: 'Conhecimento' },
  { key: 'sangue',       label: 'Sangue' },
  { key: 'morte',        label: 'Morte' },
  { key: 'energia',      label: 'Energia' },
  { key: 'medo',         label: 'Medo' },
];
const RITUAL_CIRCULOS = [1, 2, 3, 4];
const RITUAL_EXECUCOES = [
  { key: 'reacao',   label: 'Reação' },
  { key: 'padrao',   label: 'Padrão' },
  { key: 'completa', label: 'Completa' },
];
const RITUAL_ALCANCES = [
  { key: 'pessoal', label: 'Pessoal' },
  { key: 'toque',   label: 'Toque' },
  { key: 'curto',   label: 'Curto (9m)' },
  { key: 'medio',   label: 'Médio (18m)' },
  { key: 'longo',   label: 'Longo (30m)' },
];
function ritualElementoLabel(key) { return RITUAL_ELEMENTOS.find(e => e.key === key)?.label || key; }
function ritualExecucaoLabel(key) { return RITUAL_EXECUCOES.find(e => e.key === key)?.label || key; }
function ritualAlcanceLabel(key)  { return RITUAL_ALCANCES.find(e => e.key === key)?.label  || key; }


// Calcula o uso atual de cada categoria (apenas itens do armazém)
function calcCatUsage(items) {
  const uso = { '0': 0, 'I': 0, 'II': 0, 'III': 0, 'IV': 0 };
  for (const it of items) {
    if (!it.deMissao && it.categoria && uso[it.categoria] !== undefined) {
      uso[it.categoria] += (it.qty || 1);
    }
  }
  return uso;
}

// Calcula espaços usados no inventário (todos os itens, missão ou não)
function calcEspacosUsados(items) {
  let total = 0;
  for (const it of items) {
    const peso = it.peso !== undefined ? it.peso : (CAT_PESO_DEFAULT[it.categoria] ?? 1);
    total += peso * (it.qty || 1);
  }
  return total;
}

// ─── Defesa e Esquiva ─────────────────────────────────────────
// DEFESA  = 10 + Agilidade + bonusDefesa (bônus livre do jogador)
// ESQUIVA = DEFESA + bônus total de Reflexos (treino + extra)
function calcDefesa(sheet) {
  const agi        = getAttrVal(sheet, 'agilidade');
  const bonusExtra = sheet.bonusDefesa || 0;
  const protecao   = calcProtecaoAtiva(sheet.items).bonus;
  const condMod    = getConditionDefesaMod(sheet.conditions);
  return 10 + agi + bonusExtra + protecao + condMod;
}
function calcEsquiva(sheet) {
  const defesa     = calcDefesa(sheet);
  const refData    = sheet.pericias['reflexos'] || { treino: 0, extra: 0 };
  const refTreino  = TREINO_BONUS[refData.treino] || 0;
  const refExtra   = refData.extra || 0;
  return defesa + refTreino + refExtra;
}
const TREINO_LABEL = ['Destreinado', 'Treinado', 'Veterano', 'Expert'];

// ─── Progressão de NEX (Nível de Exposição Paranormal) ────────
// NEX sobe de 5 em 5%, até 95%, e o último degrau é 99%.
const NEX_STEPS = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99];

// Nos NEX 20/50/80/95% você ganha +1 ponto de atributo à escolha.
const ATTR_MILESTONES = [20, 50, 80, 95];
// Nos NEX 35/70% você pode subir o grau de treinamento de (2+Intelecto) perícias.
const TREINO_MILESTONES = [35, 70];

// Tabela 1.3 / 1.4 / 1.5 do Livro de Regras — Características por classe
// pv/pe/san = valor inicial (NEX 5%) · *Per = ganho a cada novo NEX (some o atributo relevante quando indicado)
const CLASSE_TABLE = {
  combatente:   { pv: 20, pvPer: 4, pe: 2, pePer: 2, san: 12, sanPer: 3 },
  especialista: { pv: 16, pvPer: 3, pe: 3, pePer: 3, san: 16, sanPer: 4 },
  ocultista:    { pv: 12, pvPer: 2, pe: 4, pePer: 4, san: 20, sanPer: 5 },
};

// Tabela 1.3/1.4/1.5 — Proficiências concedidas por classe (Livro de Regras)
const PROFICIENCIA_TABLE = {
  combatente:   ['Armas simples', 'Armas táticas', 'Armas pesadas', 'Proteções leves', 'Proteções pesadas'],
  especialista: ['Armas simples', 'Armas táticas', 'Proteções leves'],
  ocultista:    ['Armas simples', 'Proteções leves'],
};
function getProficiencias(classe) {
  return PROFICIENCIA_TABLE[normalize(classe)] || null;
}

// Soma o bônus de Defesa de todas as proteções (itens tipo "protecao") ativas.
// Retorna { bonus, itens: [{name, bonus}] } — usado no cálculo de Defesa e
// no box informativo "Proteção" da ficha.
function calcProtecaoAtiva(items) {
  const ativos = (items || []).filter(it => it.tipo === 'protecao' && it.ativo);
  const bonus = ativos.reduce((sum, it) => sum + (it.defesaBonus || 0), 0);
  return { bonus, itens: ativos.map(it => ({ name: it.name, bonus: it.defesaBonus || 0 })) };
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// ─── Catálogo de equipamentos: montagem do <select> de presets ────
// Cada <option> carrega um "ref" tipo "categoria:índice" que localiza o
// preset original nas listas importadas de op-equipamentos.js.
const WEAPON_GRUPO_LABEL = { simples: 'Armas Simples', tatica: 'Armas Táticas', pesada: 'Armas Pesadas' };
const GENERAL_TIPO_LABEL = { acessorio: 'Acessórios', explosivo: 'Explosivos', operacional: 'Itens Operacionais', paranormal: 'Itens Paranormais' };

function buildItemPresetOptions() {
  const groups = [];

  ['simples', 'tatica', 'pesada'].forEach(grupo => {
    const opts = WEAPON_PRESETS
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => w.grupo === grupo)
      .map(({ w, i }) => `<option value="weapon:${i}">${escAttr(w.name)} (Cat ${w.categoria})</option>`)
      .join('');
    if (opts) groups.push(`<optgroup label="${WEAPON_GRUPO_LABEL[grupo]}">${opts}</optgroup>`);
  });

  const munOpts = MUNITION_PRESETS.map((m, i) => `<option value="munition:${i}">${escAttr(m.name)} (Cat ${m.categoria})</option>`).join('');
  if (munOpts) groups.push(`<optgroup label="Munições">${munOpts}</optgroup>`);

  const protOpts = PROTECTION_PRESETS.map((p, i) => `<option value="protection:${i}">${escAttr(p.name)} (Cat ${p.categoria})</option>`).join('');
  if (protOpts) groups.push(`<optgroup label="Proteções">${protOpts}</optgroup>`);

  ['acessorio', 'explosivo', 'operacional', 'paranormal'].forEach(tipo => {
    const opts = GENERAL_ITEM_PRESETS
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => g.tipo === tipo)
      .map(({ g, i }) => `<option value="general:${i}">${escAttr(g.name)} (Cat ${g.categoria})</option>`)
      .join('');
    if (opts) groups.push(`<optgroup label="${GENERAL_TIPO_LABEL[tipo]}">${opts}</optgroup>`);
  });

  return `<option value="">— Criar Personalizado —</option>${groups.join('')}`;
}

function resolvePresetRef(ref) {
  if (!ref) return null;
  const [kind, idxStr] = ref.split(':');
  const idx = parseInt(idxStr, 10);
  if (kind === 'weapon')     return { kind, data: WEAPON_PRESETS[idx] };
  if (kind === 'munition')   return { kind, data: MUNITION_PRESETS[idx] };
  if (kind === 'protection') return { kind, data: PROTECTION_PRESETS[idx] };
  if (kind === 'general')    return { kind, data: GENERAL_ITEM_PRESETS[idx] };
  return null;
}

// Índice de uma categoria (CAT_LABELS), sempre resolvendo pra um número válido.
function catIndex(cat) {
  const i = CAT_LABELS.indexOf(cat);
  return i === -1 ? 0 : i;
}

function nexLevelIndex(nex) {
  const idx = NEX_STEPS.indexOf(Number(nex));
  return idx === -1 ? null : idx + 1; // 1..20
}
// Limite de PD/PE que pode ser gasto POR TURNO: começa em 1 no NEX 5%
// e sobe +1 a cada novo grau de NEX (5 em 5%) — mesma progressão do índice de NEX.
function calcLimitePorTurno(nex) {
  return nexLevelIndex(nex) || 1;
}
function signed(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

// ─── Mecânica de Rolagem ──────────────────────────────────────
// Rola N d20 e retorna o maior (+ exibe todos os dados).
// Regra de atributo ZERADO: quando o valor do atributo/perícia é 0,
// em vez de não rolar nada (ou rolar como se fosse 1), a pessoa rola
// 2d20 e fica com o PIOR resultado entre os dois (desvantagem).
function rollNd20(n) {
  if (n <= 0) {
    const rolls = [
      Math.floor(Math.random() * 20) + 1,
      Math.floor(Math.random() * 20) + 1,
    ];
    const best = Math.min(...rolls); // "pega o pior"
    return { rolls, best, count: 2, zeroed: true };
  }
  const rolls = [];
  const count = Math.max(1, Math.min(n, 10)); // máximo 10 dados
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * 20) + 1);
  }
  const best = Math.max(...rolls);
  return { rolls, best, count, zeroed: false };
}

// Formata o rótulo de dados de um atributo/perícia para exibição na UI.
// Ex: diceLabel(3) => "3d20" · diceLabel(0) => "2d20 (pior)"
function diceLabel(n) {
  return n <= 0 ? '2d20 (pior)' : `${n}d20`;
}

// ─── Utilitários ──────────────────────────────────────────────
function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(str) {
  return esc(str).replace(/"/g,'&quot;');
}
function treinoLabel(t) {
  return ['—', '+1d', '+2d', '+3d'][t] || '—';
}

// ─── Ficha padrão ─────────────────────────────────────────────
function defaultSheet(name = 'Novo Personagem') {
  const attrs = {};
  ATTR_LIST.forEach(a => (attrs[a.key] = 1)); // começa com 1 (rola 1d20)
  const pericias = {};
  PERICIAS.forEach(p => (pericias[p.key] = { treino: 0, extra: 0, attrOverride: null }));
  return {
    id: uid('sheet'),
    tokenId: null,
    name,
    jogador: '',
    classe: '',
    trilha: '',
    origem: '',
    nex: 5,                        // Nível de Exposição Paranormal (%)
    xp: 0,
    attrs,
    pericias,
    // Sistema de recurso mental: "classic" = Sanidade + PE (padrão do
    // Livro de Regras) · pdMode = true → regra "Jogando Sem Sanidade"
    // (Sobrevivendo ao Horror, p.104), onde SAN e PE viram uma única
    // barra de Pontos de Determinação (PD).
    pdMode: false,
    hp:  { current: 0, max: 0, marks: 0 },   // Pontos de Vida (PV) — marks: marcas de risco de morte (0-3) quando current chega a 0
    pe:  { current: 0, max: 0 },   // Pontos de Esforço (PE)
    san: { current: 0, max: 0, marks: 0 },   // Sanidade (SAN) — marks: marcas de colapso (0-3) quando current chega a 0
    pd:  { current: 0, max: 0, marks: 0 },   // Pontos de Determinação (modo PD) / barra extra livre (modo clássico) — marks: idem
    bonusDefesa: 0,   // bônus livre somado à Defesa (itens, poderes, etc.)
    conditions: [],   // condições ativas (Ordem Paranormal, p.310-311) — chaves de conditions.js
    // defesa e esquiva são calculados automaticamente — não armazenados
    deslocamento: 9,       // Deslocamento em metros (base: 9m)
    resistencias: '',      // Resistências / imunidades — anotação livre
    photo: null,            // Foto do personagem (dataURL)
    tokenVariants: [],       // [{ id, label, imageSrc }] — versões do token (normal/machucado/morrendo...)
    pp: 0,            // Pontos de Prestígio
    attacks:     [],
    rituais:     [],
    // items: { id, name, categoria ('0'|'I'|'II'|'III'|'IV'), peso (espaços),
    //          qty, effect, periciaBonus [{pericia, valor}], deMissao (bool),
    //          ativo (bool — se está equipado/ativo aplicando bônus),
    //          tipo ('geral'|'arma'|'protecao'), defesaBonus (se protecao) }
    items:       [],
    habilidades: [],
    notas: '',
  };
}

// ══════════════════════════════════════════════════════════════
export class SheetManager {
  constructor({ storage, tokenMgr, onRoll, onMessage, onDiceMessage, onRollInitiative, onChange, ownerId, restrictToOwner }) {
    this.storage          = storage;
    this.tokenMgr         = tokenMgr;
    this.onRoll           = onRoll           || (() => {});
    this.onMessage        = onMessage        || (() => {});
    // Rolagem de dado (teste, ataque, dano, ritual) — vai pro chat com a
    // mesma "caixinha" das rolagens do painel de dados, não como uma
    // mensagem de sistema comum (ver chat.js → addRoll).
    this.onDiceMessage    = onDiceMessage    || (() => {});
    this.onRollInitiative = onRollInitiative || (() => {});
    this.onChange         = onChange         || (() => {}); // (sheets) — avisa a rede (sala) quando algo muda
    this.ownerId          = ownerId || 'local';   // dono das fichas criadas por este cliente
    this.restrictToOwner  = !!restrictToOwner;     // true para jogador: só vê/edita as próprias fichas

    this.sheets   = storage.getSheets().map(s => this._migrateSheet(s));
    this._editing = null;

    this._setupStaticUI();
    this._renderList();
  }

  // ── Migração de fichas antigas (raça→trilha, nível→NEX, SAN nova) ──
  _migrateSheet(s) {
    if (s.ownerId === undefined) s.ownerId = 'local';
    if (s.raca !== undefined && s.trilha === undefined) { s.trilha = s.raca; delete s.raca; }
    if (s.trilha === undefined) s.trilha = '';

    if (s.nex === undefined) {
      if (s.level !== undefined) {
        const guess = Math.min(99, Math.max(5, Math.round((s.level * 5) / 5) * 5));
        s.nex = NEX_STEPS.includes(guess) ? guess : 5;
        delete s.level;
      } else {
        s.nex = 5;
      }
    }

    if (!s.hp)  s.hp  = { current: 0, max: 0, marks: 0 };
    if (s.hp.marks === undefined) s.hp.marks = 0;
    if (!s.san) s.san = { current: 0, max: 0, marks: 0 };
    if (s.san.marks === undefined) s.san.marks = 0;
    if (!s.pd)  s.pd  = { current: 0, max: 0, marks: 0 };
    if (s.pd.marks === undefined) s.pd.marks = 0;
    if (!s.pe)  s.pe  = { current: 0, max: 0 };
    if (s.pdMode === undefined) s.pdMode = false;
    if (s.deslocamento === undefined) s.deslocamento = 9;
    if (s.resistencias === undefined) s.resistencias = '';
    if (s.photo === undefined) s.photo = null;
    if (!s.tokenVariants) s.tokenVariants = [];
    if (s.pp === undefined) s.pp = 0;
    if (!Array.isArray(s.conditions)) s.conditions = [];
    // Descarta chaves de condição que não existem mais na lista oficial
    s.conditions = s.conditions.filter(k => !!CONDITION_MAP[k]);

    Object.keys(s.pericias || {}).forEach(k => {
      const p = s.pericias[k];
      if (p.extra === undefined) p.extra = 0;
      if (p.treino > 3) p.treino = 3;
      if (p.treino < 0) p.treino = 0;
      if (p.attrOverride === undefined) p.attrOverride = null;
    });

    (s.attacks || []).forEach(a => {
      if (a.damageType === undefined) a.damageType = 'Corte';
      if (a.critRange  === undefined) a.critRange  = 20;
      if (a.critMult   === undefined) a.critMult   = 2;
      if (a.pericia    === undefined) a.pericia    = (a.attr === 'agilidade') ? 'pontaria' : 'luta';
    });

    (s.items || []).forEach(it => {
      if (it.tipo === undefined) it.tipo = it.isWeapon ? 'arma' : 'geral';
      if (it.defesaBonus === undefined) it.defesaBonus = 0;
    });

    // Rituais no formato antigo (nome/custo/dano/alcance simples) ganham os
    // campos novos com valores neutros, pra não quebrar a listagem.
    (s.rituais || []).forEach(r => {
      if (r.elemento        === undefined) r.elemento        = 'conhecimento';
      if (r.circulo         === undefined) r.circulo         = 1;
      if (r.execucao        === undefined) r.execucao        = 'padrao';
      if (r.alcance         === undefined || RITUAL_ALCANCES.every(a => a.key !== r.alcance)) r.alcance = 'pessoal';
      if (r.area            === undefined) r.area            = '';
      if (r.alvo            === undefined) r.alvo            = '';
      if (r.duracao         === undefined) r.duracao         = '';
      if (r.efeito          === undefined) r.efeito          = '';
      if (r.resistencia     === undefined) r.resistencia     = '';
      if (r.dados           === undefined) r.dados           = r.damage || '';
      if (r.dadosDiscente   === undefined) r.dadosDiscente   = '';
      if (r.dadosVerdadeiro === undefined) r.dadosVerdadeiro = '';
      if (r.imageSrc        === undefined) r.imageSrc        = null;
    });

    return s;
  }

  // ── Cálculo automático de recursos pela NEX (Ordem Paranormal) ──
  // PV sempre segue a tabela da Classe (quando reconhecida).
  // • Modo clássico (pdMode=false): PE e SAN também vêm da tabela da Classe.
  // • Modo PD (pdMode=true, regra "Jogando Sem Sanidade"): PE e SAN somem;
  //   em vez disso, TODAS as classes calculam a mesma barra de Determinação:
  //     PD Iniciais (NEX 5%)   = 10 + Presença
  //     Ganho por NEX (a cada avanço de 5%) = 4 + Presença
  //   Se a Classe não for reconhecida, o PV fica livre para edição manual,
  //   mas o PD é calculado do mesmo jeito (não depende de classe).
  _recalcResources(sheet) {
    const L = nexLevelIndex(sheet.nex);
    if (!L) return false;

    let changed = false;
    const vig = sheet.attrs.vigor    || 0;
    const pre = sheet.attrs.presenca || 0;

    const table = CLASSE_TABLE[normalize(sheet.classe)];
    if (table) {
      const newPvMax = table.pv + vig + (L - 1) * (table.pvPer + vig);
      const dPv = newPvMax - (sheet.hp.max || 0);
      sheet.hp.max = newPvMax;
      if (dPv > 0) sheet.hp.current = Math.min(sheet.hp.max, sheet.hp.current + dPv);
      sheet.hp.current = Math.min(sheet.hp.current, sheet.hp.max);
      changed = true;

      if (!sheet.pdMode) {
        const newPeMax  = table.pe  + pre + (L - 1) * (table.pePer + pre);
        const newSanMax = table.san + (L - 1) * table.sanPer;
        const dPe  = newPeMax  - (sheet.pe.max  || 0);
        const dSan = newSanMax - (sheet.san.max || 0);
        sheet.pe.max  = newPeMax;
        sheet.san.max = newSanMax;
        if (dPe  > 0) sheet.pe.current  = Math.min(sheet.pe.max,  sheet.pe.current  + dPe);
        if (dSan > 0) sheet.san.current = Math.min(sheet.san.max, sheet.san.current + dSan);
        sheet.pe.current  = Math.min(sheet.pe.current,  sheet.pe.max);
        sheet.san.current = Math.min(sheet.san.current, sheet.san.max);
      }
    }

    if (sheet.pdMode) {
      // PD Iniciais = 10 + Presença · Ganho por NEX = 4 + Presença
      const newPdMax = 10 + pre + (L - 1) * (4 + pre);
      const dPd = newPdMax - (sheet.pd.max || 0);
      sheet.pd.max = newPdMax;
      if (dPd > 0) sheet.pd.current = Math.min(sheet.pd.max, sheet.pd.current + dPd);
      sheet.pd.current = Math.min(sheet.pd.current, sheet.pd.max);
      changed = true;
    }

    return changed;
  }

  // ── Persistência ──────────────────────────────────────────
  _save() { this.storage.saveSheets(this.sheets); this.onChange(this.sheets); }
  _find(id) { return this.sheets.find(s => s.id === id) || null; }

  createSheet(name) {
    const sheet = defaultSheet(name);
    sheet.ownerId = this.ownerId;
    this.sheets.push(sheet);
    this._save();
    this._renderList();
    return sheet;
  }

  deleteSheet(id) {
    const sheet = this._find(id);
    if (!sheet) return;
    if (sheet.tokenId) this.tokenMgr.applyExternalStats(sheet.tokenId, { sheetId: null });
    this.sheets = this.sheets.filter(s => s.id !== id);
    this._save();
    this._renderList();
  }

  openForToken(token) {
    let sheet = token.sheetId ? this._find(token.sheetId) : null;
    if (!sheet) {
      sheet = defaultSheet(token.name);
      sheet.tokenId      = token.id;
      sheet.ownerId      = this.ownerId;
      sheet.hp.current   = token.hp    ?? 0;
      sheet.hp.max       = token.hpMax ?? 0;
      sheet.pd.current   = token.mana  ?? 0;
      sheet.pd.max       = token.mana  ?? 0;
      sheet.bonusDefesa  = 0;
      sheet.conditions   = [...(token.conditions || [])];
      this.sheets.push(sheet);
      this.tokenMgr.applyExternalStats(token.id, { sheetId: sheet.id });
      this._save();
      this._renderList();
    }
    this._openModal(sheet.id);
  }

  syncFromToken(tokenId, patch) {
    const sheet = this.sheets.find(s => s.tokenId === tokenId);
    if (!sheet) return;
    if (patch.name  !== undefined) sheet.name       = patch.name;
    if (patch.hp    !== undefined) sheet.hp.current = patch.hp;
    if (patch.hpMax !== undefined) sheet.hp.max     = patch.hpMax;
    if (patch.mana  !== undefined) sheet.pd.current = patch.mana;
    if (patch.conditions !== undefined) sheet.conditions = [...patch.conditions];
    // armor removido — defesa/esquiva calculados automaticamente
    this._save();
    if (this._editing === sheet.id) this._renderModal(sheet);
    this._renderList();
  }

  // Recebe a ficha completa de um jogador vinda pela rede (ver
  // main.js → network.on('sheet')). Só o Mestre usa isso. Precisa
  // re-renderizar a MODAL na hora se ela estiver aberta (senão o Mestre
  // fica olhando pra uma versão desatualizada da ficha do jogador até
  // fechar e abrir de novo) — daí o cuidado extra em relação a um
  // simples `this.sheets[idx] = sheet`.
  receiveExternalSheet(sheet) {
    const idx = this.sheets.findIndex(s => s.id === sheet.id);
    if (idx >= 0) this.sheets[idx] = sheet; else this.sheets.push(sheet);
    if (this._editing === sheet.id) this._renderModal(sheet);
    this._renderList();
  }

  _pushToToken(sheet) {
    if (!sheet.tokenId) return;
    this.tokenMgr.applyExternalStats(sheet.tokenId, {
      name:  sheet.name,
      hp:    sheet.hp.current,
      hpMax: sheet.hp.max,
      mana:  sheet.pd.current,
      armor: calcEsquiva(sheet), // envia a esquiva para o token como referência
      conditions: [...(sheet.conditions || [])],
    });
  }

  // ── Condições ativas ────────────────────────────────────────
  // Gera o HTML da barra: um badge por condição ativa (clicável pra
  // remover) + botão que abre um seletor com busca pra adicionar novas.
  _conditionsBarContent(sheet) {
    const active = sheet.conditions || [];
    const badges = active.map(key => {
      const c = CONDITION_MAP[key];
      if (!c) return '';
      return `<button type="button" class="condition-badge" data-remove-condition="${key}" title="${conditionTooltip(key).replace(/"/g,'&quot;')} (clique para remover)">
        <span>${icon(c.icon)}</span> ${c.label} <span class="condition-badge-x">${icon('close')}</span>
      </button>`;
    }).join('');
    return `
      <span class="conditions-bar-label">${icon('bandage')} Condições:</span>
      <div class="conditions-badge-list">${badges || '<span class="conditions-empty-hint">nenhuma</span>'}</div>
      <div class="condition-add-wrap">
        <button type="button" class="btn-add-condition" id="sf-add-condition-btn">+ Condição</button>
        <div class="condition-picker hidden" id="sf-condition-picker"></div>
      </div>`;
  }

  _renderConditionPicker(sheet, filter) {
    const picker = document.getElementById('sf-condition-picker');
    if (!picker) return;
    const active = new Set(sheet.conditions || []);
    const q = (filter || '').toLowerCase().trim();
    const list = CONDITIONS.filter(c => !q || c.label.toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q));
    let html = `<div class="condition-search-wrap">${icon('search','icon-dim')}<input id="sf-condition-search" class="condition-search-input" type="text" placeholder="Buscar condição..." value="${escAttr(filter || '')}"/></div><div class="condition-list">`;
    if (list.length === 0) {
      html += `<div class="ctx-item-disabled">Nenhuma condição encontrada</div>`;
    } else {
      let lastCat = null;
      for (const c of list) {
        if (c.categoria !== lastCat) { html += `<div class="condition-group-title">${c.categoria}</div>`; lastCat = c.categoria; }
        const isOn = active.has(c.key);
        html += `<button type="button" class="ctx-item condition-row ${isOn ? 'on' : ''}" data-toggle-condition="${c.key}" title="${conditionTooltip(c.key).replace(/"/g,'&quot;')}">
          <span class="condition-check">${isOn ? icon('check','icon-success') : icon('emptybox','icon-dim')}</span>
          <span class="condition-icon">${icon(c.icon, 'icon-accent')}</span>
          <span class="condition-label">${c.label}</span>
        </button>`;
      }
    }
    html += `</div>`;
    picker.innerHTML = html;
    const input = picker.querySelector('#sf-condition-search');
    if (input) {
      const pos = input.value.length;
      input.focus();
      input.setSelectionRange(pos, pos);
    }
  }

  _toggleSheetCondition(sheet, key) {
    if (!sheet.conditions) sheet.conditions = [];
    const idx = sheet.conditions.indexOf(key);
    if (idx === -1) sheet.conditions.push(key); else sheet.conditions.splice(idx, 1);
    this._save();
    this._pushToToken(sheet);
    // Re-renderiza a ficha inteira: a condição pode afetar Defesa,
    // Esquiva e os dados mostrados em perícias/atributos/ataques.
    this._renderModal(sheet);
  }

  _bindConditionsBar(body, sheet) {
    const bar = body.querySelector('#sheet-conditions-bar');
    if (!bar) return;
    bar.querySelectorAll('[data-remove-condition]').forEach(btn => {
      btn.addEventListener('click', () => this._toggleSheetCondition(sheet, btn.dataset.removeCondition));
    });
    const addBtn = bar.querySelector('#sf-add-condition-btn');
    const picker = bar.querySelector('#sf-condition-picker');
    addBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = picker.classList.contains('hidden');
      picker.classList.toggle('hidden');
      if (willOpen) this._renderConditionPicker(sheet, '');
    });
    picker?.addEventListener('click', e => {
      e.stopPropagation();
      const toggleBtn = e.target.closest('[data-toggle-condition]');
      if (toggleBtn) {
        this._toggleSheetCondition(sheet, toggleBtn.dataset.toggleCondition);
        return;
      }
    });
    picker?.addEventListener('input', e => {
      if (e.target.id !== 'sf-condition-search') return;
      this._renderConditionPicker(sheet, e.target.value);
    });
    // Fecha o seletor ao clicar fora dele
    document.addEventListener('click', e => {
      if (!picker || picker.classList.contains('hidden')) return;
      if (e.target.closest('#sf-condition-picker') || e.target.closest('#sf-add-condition-btn')) return;
      picker.classList.add('hidden');
    });
  }

  // ── Lista de fichas ───────────────────────────────────────
  _setupStaticUI() {
    document.getElementById('btn-new-sheet').addEventListener('click', async () => {
      const name = await uiPrompt('Nome do personagem:', 'Novo Personagem', { title: 'Nova Ficha' });
      if (name === null) return;
      const sheet = this.createSheet(name.trim() || 'Novo Personagem');
      this._openModal(sheet.id);
    });

    document.getElementById('sheet-delete-btn').addEventListener('click', async () => {
      if (!this._editing) return;
      const sheet = this._find(this._editing);
      if (!sheet) return;
      const ok = await uiConfirm(`Excluir a ficha de "${sheet.name}"?`, { title: 'Excluir Ficha', okText: 'Excluir', danger: true });
      if (ok) {
        this.deleteSheet(this._editing);
        this._closeModal();
      }
    });
  }

  // Dentro de uma mesa, a aba "Ficha" deve mostrar só o elenco desta
  // mesa (Storage.getRoster()), não todas as fichas que este navegador
  // já criou. null = sem filtro (usado fora de uma mesa, no Dashboard).
  setRosterFilter(idsSet) {
    this.rosterFilter = idsSet || null;
  }

  _visibleSheets() {
    let list = this.restrictToOwner ? this.sheets.filter(s => s.ownerId === this.ownerId || s.ownerId === 'local') : this.sheets;
    if (this.rosterFilter) list = list.filter(s => this.rosterFilter.has(s.id));
    return list;
  }

  _renderList() {
    const list = document.getElementById('sheet-list');
    list.innerHTML = '';
    const visible = this._visibleSheets();
    if (visible.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:20px;">Nenhuma ficha criada.</div>';
      return;
    }
    visible.forEach(s => {
      const card = document.createElement('div');
      card.className = 'sheet-card';
      const pct = s.hp.max > 0 ? Math.max(0, Math.min(100, (s.hp.current / s.hp.max) * 100)) : 0;
      const col = pct > 50 ? 'var(--success)' : pct > 25 ? 'var(--warning)' : 'var(--danger)';
      const ownerTag = (!this.restrictToOwner && s.ownerId && s.ownerId !== 'local' && s.ownerId !== this.ownerId)
        ? `<span class="sheet-card-owner">${icon('link')} ${esc(s.ownerName || 'jogador')}</span>` : '';
      card.innerHTML = `
        <div class="sheet-card-head">
          <span class="sheet-card-name">${esc(s.name)}</span>
          <span class="sheet-card-lvl">NEX ${s.nex}%</span>
        </div>
        <div class="sheet-card-hpbar"><div class="sheet-card-hpfill" style="width:${pct}%;background:${col}"></div></div>
        <div class="sheet-card-meta"><span>${icon('heart','icon-danger')} ${s.hp.current}/${s.hp.max}</span><span>${icon('diamond','icon-accent')} ${s.pd.current}/${s.pd.max} PD</span></div>
        ${ownerTag}
      `;
      card.addEventListener('click', () => this._openModal(s.id));
      list.appendChild(card);
    });
  }

  // ── Modal ──────────────────────────────────────────────────
  _openModal(id) {
    this._editing = id;
    const sheet = this._find(id);
    if (!sheet) return;
    document.getElementById('sheet-modal-title').innerHTML =
      `<button type="button" class="sheet-popout-btn" id="sheet-popout-btn" title="Abrir esta ficha em outra janela">${icon('scroll')}</button> ${esc(sheet.name)}`;
    document.getElementById('sheet-popout-btn').addEventListener('click', e => {
      e.stopPropagation();
      this._popOut(sheet);
    });
    this._renderModal(sheet);
    document.getElementById('modal-sheet').classList.remove('hidden');
    // Garantir que a aba ativa seja a primeira
    this._switchSheetTab('personagem');
  }

  // Fecha a ficha aqui e abre a mesma ficha numa janela separada
  // (window.open), cheia — útil pra deixar num segundo monitor. Rolagens
  // e mudanças feitas por lá (PV, condições, etc.) chegam na mesa em
  // tempo real via BroadcastChannel (ver main.js).
  _popOut(sheet) {
    this._closeModal();
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('popout_sheet', sheet.id);
    const w = 720, h = 880;
    const left = Math.max(0, (window.screen.width  - w) / 2);
    const top  = Math.max(0, (window.screen.height - h) / 2);
    window.open(
      url.toString(),
      'tablelink_ficha_' + sheet.id,
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  }

  _closeModal() {
    this._editing = null;
    document.getElementById('modal-sheet').classList.add('hidden');
  }

  _switchSheetTab(tab) {
    document.querySelectorAll('.sheet-tab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.sheet-tab-content').forEach(c =>
      c.classList.toggle('hidden', c.dataset.tab !== tab));
  }

  // Reexecuta a normalização de campos (a mesma usada ao carregar fichas
  // antigas) antes de CADA render — não só na primeira vez que a ficha é
  // aberta. Isso evita que um campo novo ainda ausente numa ficha salva
  // em versão anterior quebre o re-render (e pareça que "não fez nada"
  // até fechar e abrir de novo).
  _renderModal(sheet) {
    this._migrateSheet(sheet);
    try {
      this._renderModalUnsafe(sheet);
    } catch (err) {
      console.error('Erro ao renderizar a ficha — reabrindo do zero:', err);
      // Mesmo se algo inesperado quebrar, tentamos de novo uma vez;
      // se falhar de novo, ao menos o erro fica visível no console
      // em vez de deixar a tela desatualizada silenciosamente.
      try { this._renderModalUnsafe(sheet); } catch (err2) { console.error(err2); }
    }
  }

  _renderModalUnsafe(sheet) {
    const body = document.getElementById('sheet-body');
    const linked = sheet.tokenId ? this.tokenMgr.getToken(sheet.tokenId) : null;
    const tokenOptions = this.tokenMgr.getTokenList()
      .filter(t => !t.sheetId || t.id === sheet.tokenId)
      .map(t => `<option value="${t.id}" ${t.id === sheet.tokenId ? 'selected' : ''}>${esc(t.name)}</option>`)
      .join('');

    body.innerHTML = `
      <!-- ═══ ABAS ═══ -->
      <div class="sheet-tabs-bar">
        <button class="sheet-tab-btn active" data-tab="personagem">${icon('person')} Personagem</button>
        <button class="sheet-tab-btn" data-tab="pericias">${icon('target')} Perícias</button>
        <button class="sheet-tab-btn" data-tab="combate">${icon('swords')} Combate</button>
        <button class="sheet-tab-btn" data-tab="rituais">${icon('orb')} Rituais</button>
        <button class="sheet-tab-btn" data-tab="habilidades">${icon('sparkle')} Habilidades</button>
        <button class="sheet-tab-btn" data-tab="inventario">${icon('backpack')} Inventário</button>
        <button class="sheet-tab-btn" data-tab="notas">${icon('notepad')} Notas</button>
      </div>

      <!-- ═══ CONDIÇÕES ATIVAS (visível em todas as abas) ═══ -->
      <div class="sheet-conditions-bar" id="sheet-conditions-bar">
        ${this._conditionsBarContent(sheet)}
      </div>

      <!-- ═══ PERSONAGEM ═══ -->
      <div class="sheet-tab-content" data-tab="personagem">
        <div class="sheet-photo-row">
          <div class="sheet-photo-block">
            <img class="sheet-photo-img" id="sf-photo-img" src="${sheet.photo || ''}" style="${sheet.photo ? '' : 'display:none;'}" alt="Foto do personagem"/>
            <div class="sheet-photo-placeholder" id="sf-photo-placeholder" style="${sheet.photo ? 'display:none;' : ''}">${icon('camera','icon-dim',24)}</div>
            <button class="sheet-photo-btn" id="sf-photo-btn" type="button">${icon('camera')} ${sheet.photo ? 'Trocar' : 'Adicionar'} Foto</button>
            ${sheet.photo ? `<button class="sheet-photo-remove" id="sf-photo-remove" type="button">${icon('close')} Remover</button>` : ''}
            <input type="file" id="sf-photo-input" accept="image/*" class="hidden"/>
          </div>
          <div class="sheet-identity-grid">
          <div class="id-field-group">
            <label>Nome</label>
            <input class="id-nome" data-sf="name" value="${escAttr(sheet.name)}" maxlength="32"/>
          </div>
          <div class="id-field-group">
            <label>Classe</label>
            <input data-sf="classe" list="classe-options-${sheet.id}" value="${escAttr(sheet.classe)}" placeholder="Combatente..."/>
            <datalist id="classe-options-${sheet.id}">
              <option value="Combatente"></option>
              <option value="Especialista"></option>
              <option value="Ocultista"></option>
            </datalist>
          </div>
          <div class="id-field-group">
            <label>Trilha</label>
            <input data-sf="trilha" value="${escAttr(sheet.trilha)}" placeholder="Trilha..."/>
          </div>
          <div class="id-field-group">
            <label>Origem</label>
            <input data-sf="origem" value="${escAttr(sheet.origem)}" placeholder="Amnésico..."/>
          </div>
          <div class="id-field-group">
            <label>Jogador</label>
            <input data-sf="jogador" value="${escAttr(sheet.jogador)}"/>
          </div>
          <div class="id-field-group id-lvl">
            <label>NEX</label>
            <select data-sf="nex">
              ${NEX_STEPS.map(n => `<option value="${n}" ${n === sheet.nex ? 'selected' : ''}>${n}%</option>`).join('')}
            </select>
          </div>
          <div class="id-field-group">
            <label>XP</label>
            <input type="number" data-sf="xp" value="${sheet.xp}" min="0"/>
          </div>
          <div class="id-field-group">
            <label>${icon('running')} Deslocamento (m)</label>
            <input type="number" data-sf="deslocamento" value="${sheet.deslocamento ?? 9}" min="0" step="1" title="Base: 9m"/>
          </div>
          <div class="id-field-group">
            <label>Token vinculado</label>
            <select data-sf="token">
              <option value="">— nenhum —</option>
              ${tokenOptions}
            </select>
          </div>
          </div>
        </div>

        <!-- Recursos -->
        <div class="sheet-section-title">
          Recursos
          <span class="res-mode-toggle">
            <label class="res-mode-opt">
              <input type="radio" name="resmode" data-sf="resmode" value="classic" ${!sheet.pdMode ? 'checked' : ''}/>
              Sanidade + PE
            </label>
            <label class="res-mode-opt">
              <input type="radio" name="resmode" data-sf="resmode" value="pd" ${sheet.pdMode ? 'checked' : ''}/>
              Pontos de Determinação (PD)
            </label>
          </span>
        </div>
        <div class="turno-limite-note">${icon('stopwatch')} Limite de ${sheet.pdMode ? 'PD' : 'PE'} gasto por turno: <strong>${calcLimitePorTurno(sheet.nex)}</strong> <span class="hint">(+1 a cada 5% de NEX)</span></div>
        <div class="resources-grid">
          ${this._resBlock('hp',  `${icon('heart')} PV`,   sheet.hp,  '#ef4444')}
          ${sheet.pdMode
            ? this._resBlock('pd', `${icon('diamond')} PD`, sheet.pd, '#8b2fd1')
            : `${this._resBlock('pe',  `${icon('bolt')} PE`,   sheet.pe,  '#ffba4d')}
               ${this._resBlock('san', `${icon('brain')} SAN`,  sheet.san, '#c9a3f7')}`}
          <div class="res-block res-block-def">
            <div class="res-lbl">${icon('shield')} DEFESA</div>
            <div class="def-calc-display" id="sf-defesa-display">${calcDefesa(sheet)}</div>
            <div class="def-calc-formula" id="sf-defesa-formula">10 + AGI(${getAttrVal(sheet,'agilidade')}) + bônus(${sheet.bonusDefesa||0}) + proteção(${calcProtecaoAtiva(sheet.items).bonus})${getConditionDefesaMod(sheet.conditions) ? ` + condições(${signed(getConditionDefesaMod(sheet.conditions))})` : ''}</div>
            <div class="def-bonus-row">
              <label class="def-bonus-lbl">Bônus</label>
              <input class="def-bonus-inp" type="number" data-sf="bonusDefesa" value="${sheet.bonusDefesa||0}" min="0" title="Bônus extra de Defesa (itens, poderes...)"/>
            </div>
          </div>
          <div class="res-block res-block-def">
            <div class="res-lbl">${icon('bolt')} ESQV</div>
            <div class="def-calc-display esqv-color" id="sf-esquiva-display">${calcEsquiva(sheet)}</div>
            <div class="def-calc-formula">DEF(${calcDefesa(sheet)}) + Reflexos(${(TREINO_BONUS[sheet.pericias['reflexos']?.treino||0]||0) + (sheet.pericias['reflexos']?.extra||0)})</div>
            <div class="def-bonus-row">
              <span class="def-hint">Treino: ${TREINO_BONUS[sheet.pericias['reflexos']?.treino||0]||0} · Extra: ${sheet.pericias['reflexos']?.extra||0}</span>
            </div>
          </div>
          <div class="res-block res-block-protecao" id="sf-protecao-block">
            ${this._protecaoBlock(sheet)}
          </div>
        </div>

        <!-- Atributos -->
        <div class="sheet-section-title">Atributos</div>
        <div class="attrs-hexflower">
          <img class="hexflower-bg" src="${document.documentElement.classList.contains('dark-mode') ? 'assets/brand/atributos-hex-dark.png' : 'assets/brand/atributos-hex.png'}" alt="Selo de Atributos"/>
          ${ATTR_LIST.map(a => this._attrBlock(a, sheet.attrs[a.key], sheet.conditions)).join('')}
        </div>

        ${this._nexInfoBlock(sheet)}

        <!-- Proficiências (conforme a classe) -->
        <div class="prof-info-box">
          <strong>${icon('graduate')} Proficiências${sheet.classe ? ` — ${escAttr(sheet.classe)}` : ''}</strong>
          ${getProficiencias(sheet.classe)
            ? `<div class="prof-tags">${getProficiencias(sheet.classe).map(p => `<span class="prof-tag">${p}</span>`).join('')}</div>`
            : '<span class="hint">Defina a Classe (Combatente, Especialista ou Ocultista) para ver as proficiências.</span>'}
        </div>

        <!-- Resistências / Imunidades -->
        <div class="sheet-section-title">Resistências / Imunidades</div>
        <textarea class="sheet-resist-area" data-sf="resistencias" placeholder="Ex: Resistente a Fogo, Imune a Medo...">${esc(sheet.resistencias)}</textarea>

        <!-- Versões do Token -->
        <div class="sheet-section-title">${icon('image')} Versões do Token</div>
        <div class="token-variants-hint hint">Cadastre versões visuais deste personagem (normal, machucado, morrendo...). Depois, clique com o botão direito no token na mesa e escolha "Versão do Token" para trocar a aparência.</div>
        <div class="token-variants-list" id="sf-token-variants">
          ${sheet.tokenVariants.length
            ? sheet.tokenVariants.map(v => this._variantRow(v)).join('')
            : '<div class="empty-row">Nenhuma versão cadastrada.</div>'}
        </div>
        <div class="token-variants-add-bar">
          <button class="btn-add-row" data-add-variant="Normal">+ Normal</button>
          <button class="btn-add-row" data-add-variant="Machucado">+ Machucado</button>
          <button class="btn-add-row" data-add-variant="Morrendo">+ Morrendo</button>
          <button class="btn-add-row" data-add-variant="">+ Outra versão</button>
        </div>
        <input type="file" id="sf-variant-input" accept="image/*" class="hidden"/>
      </div>

      <!-- ═══ PERÍCIAS ═══ -->
      <div class="sheet-tab-content hidden" data-tab="pericias">
        <div class="pericias-list">
          ${PERICIAS.map(p => this._periciaRow(p, sheet)).join('')}
        </div>
      </div>

      <!-- ═══ COMBATE ═══ -->
      <div class="sheet-tab-content hidden" data-tab="combate">
        <div class="tab-add-bar">
          <button class="btn-add-row" data-add="attack">+ Novo Ataque</button>
        </div>
        <div class="sheet-list-rows" id="sf-attacks">
          ${sheet.attacks.length
            ? sheet.attacks.map(a => this._attackRow(a, sheet)).join('')
            : '<div class="empty-row">Nenhum ataque cadastrado.</div>'}
        </div>
      </div>

      <!-- ═══ RITUAIS ═══ -->
      <div class="sheet-tab-content hidden" data-tab="rituais">
        <div class="tab-add-bar">
          <button class="btn-add-row" data-add="ritual">+ Novo Ritual</button>
        </div>
        <div class="sheet-list-rows" id="sf-rituais">
          ${sheet.rituais.length
            ? sheet.rituais.map(r => this._ritualRow(r, sheet)).join('')
            : '<div class="empty-row">Nenhum ritual cadastrado.</div>'}
        </div>
      </div>

      <!-- ═══ HABILIDADES ═══ -->
      <div class="sheet-tab-content hidden" data-tab="habilidades">
        <div class="tab-add-bar">
          <button class="btn-add-row" data-add="habilidade">+ Nova Habilidade</button>
        </div>
        <div class="sheet-list-rows" id="sf-habilidades">
          ${sheet.habilidades.length
            ? sheet.habilidades.map(h => this._habilidadeRow(h)).join('')
            : '<div class="empty-row">Nenhuma habilidade cadastrada.</div>'}
        </div>
      </div>

      <!-- ═══ INVENTÁRIO ═══ -->
      <div class="sheet-tab-content hidden" data-tab="inventario">
        ${this._inventoryPanel(sheet)}
      </div>

      <!-- ═══ NOTAS ═══ -->
      <div class="sheet-tab-content hidden" data-tab="notas">
        <textarea class="sheet-notes-area" data-sf="notas" placeholder="Anotações, história, lembretes...">${esc(sheet.notas)}</textarea>
      </div>
    `;

    this._bindModalEvents(sheet);
  }

  // ── Blocos visuais ────────────────────────────────────────
  // Atualiza a barrinha (ou as bolinhas de marca, quando o recurso está
  // zerado) de PV/PD/PE/SAN ao vivo, sem re-renderizar a ficha inteira.
  _updateResBar(body, key, res, sheet) {
    const input = body.querySelector(`[data-sf="${key}Cur"]`);
    const block = input?.closest('.res-block');
    const bottom = block?.querySelector('.res-bottom');
    if (!bottom) return;
    block.classList.toggle('res-block-critical', res.current <= 0 && res.max > 0);
    bottom.innerHTML = this._resBottomHtml(key, res);
    this._bindResMarks(body, key, res, sheet);
  }

  // Barrinha de progresso normal, ou — quando o recurso chega a 0 — as 3
  // bolinhas de marca (risco de morte/colapso, Ordem Paranormal p.108-109):
  // o jogador clica pra preencher; ao completar as 3, o recurso volta a 1.
  _resBottomHtml(key, res) {
    if (res.current <= 0 && res.max > 0) {
      const marks = Math.min(3, res.marks || 0);
      return `
        <div class="res-marks-row" data-marks-for="${key}" title="Marque quando algo ruim acontecer. Ao completar as 3, volta a 1.">
          ${[0, 1, 2].map(i => `<button type="button" class="res-mark-dot${i < marks ? ' filled' : ''}" data-mark-key="${key}" data-mark-index="${i}"></button>`).join('')}
        </div>`;
    }
    const pct = res.max > 0 ? Math.max(0, Math.min(100, (res.current / res.max) * 100)) : 0;
    return `<div class="res-bar-track"><div class="res-bar-fill" style="width:${pct}%"></div></div>`;
  }

  // Liga o clique das bolinhas de marca — feito à parte porque elas são
  // recriadas a cada atualização (_updateResBar troca o innerHTML).
  _bindResMarks(body, key, res, sheet) {
    const row = body.querySelector(`.res-marks-row[data-marks-for="${key}"]`);
    if (!row || !sheet) return;
    row.querySelectorAll('.res-mark-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const i = parseInt(dot.dataset.markIndex);
        const current = res.marks || 0;
        // Clicar numa bolinha já preenchida desmarca ela (e as seguintes);
        // clicar numa vazia preenche até ela.
        res.marks = (current === i + 1) ? i : i + 1;
        if (res.marks >= 3) {
          // Completou as 3 marcas: o recurso "estabiliza" de volta a 1.
          res.current = 1;
          res.marks = 0;
          const curInput = body.querySelector(`[data-sf="${key}Cur"]`);
          if (curInput) curInput.value = 1;
          this.onMessage?.(`${sheet.name || 'Personagem'} estabilizou — ${key.toUpperCase()} volta a 1.`, 'sparkle');
        }
        this._updateResBar(body, key, res, sheet);
        this._save();
        this._pushToToken(sheet);
      });
    });
  }

  _resBlock(key, label, res, color) {
    return `
      <div class="res-block${res.current <= 0 && res.max > 0 ? ' res-block-critical' : ''}">
        <div class="res-lbl" style="color:${color}">${label}</div>
        <div class="res-row">
          <input class="res-cur" type="number" data-sf="${key}Cur" value="${res.current}" min="0"/>
          <span>/</span>
          <input class="res-max" type="number" data-sf="${key}Max" value="${res.max}" min="0"/>
        </div>
        <div class="res-bottom" style="--res-color:${color}">${this._resBottomHtml(key, res)}</div>
      </div>`;
  }

  _attrBlock(attr, valor, conditions) {
    const penalty = getConditionRollPenalty(conditions, { attrKey: attr.key });
    const effVal  = valor + penalty;
    const penTag  = penalty ? `<span class="attr-condition-pen" title="Penalidade de dados por condição ativa">${signed(penalty)}d</span>` : '';
    return `
      <div class="attr-block-op attr-hex-node attr-hex-${attr.key}" title="${attr.label}">
        <input class="attr-val-input" type="number" data-attr="${attr.key}" value="${valor}" min="0" max="10" title="${attr.label} — 0 = atributo zerado: rola 2d20 e fica com o pior"/>
        <div class="attr-hex-controls">
          <div class="attr-dice-label">${diceLabel(effVal)}${penTag}</div>
          <button class="attr-roll-btn" data-attr="${attr.key}" title="Rolar ${diceLabel(effVal)}"><img src="assets/dice/d20.png" alt="d20"/></button>
        </div>
      </div>`;
  }

  _protecaoBlock(sheet) {
    const { bonus, itens } = calcProtecaoAtiva(sheet.items);
    if (!itens.length) {
      return `
        <div class="res-lbl">${icon('shield')} PROTEÇÃO</div>
        <div class="def-calc-display protecao-empty">—</div>
        <div class="def-calc-formula hint">Equipe um item tipo "Proteção" no Inventário para aparecer aqui.</div>`;
    }
    return `
      <div class="res-lbl">${icon('shield')} PROTEÇÃO</div>
      <div class="def-calc-display">+${bonus}</div>
      <div class="def-calc-formula">${itens.map(i => `${esc(i.name)} (+${i.bonus})`).join(', ')}</div>`;
  }

  _variantRow(v) {
    return `
      <div class="token-variant-row" data-variant-id="${v.id}">
        ${v.imageSrc ? `<img class="token-variant-thumb" src="${v.imageSrc}" alt=""/>` : `<div class="token-variant-thumb empty">${icon('image')}</div>`}
        <input class="token-variant-label" value="${escAttr(v.label)}" placeholder="Nome da versão (ex: Machucado)"/>
        <button class="token-variant-upload" data-variant-upload="${v.id}" title="Trocar imagem">${icon('camera')}</button>
        <button class="row-del" data-variant-del="${v.id}" title="Remover">${icon('close')}</button>
      </div>`;
  }

  _nexInfoBlock(sheet) {
    const nex = sheet.nex;
    const attrGained   = ATTR_MILESTONES.filter(m => nex >= m).length;
    const treinoGained  = TREINO_MILESTONES.filter(m => nex >= m).length;
    const intAttr       = sheet.attrs.intelecto || 0;
    const periciasCount = 2 + intAttr;
    return `
      <div class="nex-info-box">
        <strong>Progressão de NEX (${nex}%)</strong>
        <span>Pontos de atributo ganhos em NEX 20/50/80/95%: <strong>${attrGained} de 4</strong> (+1 atributo à escolha, máx. 5 por este método)</span>
        <span>Aumentos de grau de treinamento em NEX 35/70%: <strong>${treinoGained} de 2</strong> (cada um libera ${periciasCount} perícia(s) = 2 + Intelecto)</span>
      </div>`;
  }

  _periciaRow(p, sheet) {
    const perData  = sheet.pericias[p.key] || { treino: 0, extra: 0, attrOverride: null };
    const attrKey  = getPericiaAttrKey(sheet, p);
    const attrVal  = getAttrVal(sheet, attrKey);
    const condPen  = getConditionRollPenalty(sheet.conditions, { attrKey, periciaKey: p.key });
    const effAttrVal = attrVal + condPen;
    const treinoB  = TREINO_BONUS[perData.treino] || 0;
    const extra    = perData.extra || 0;
    const bonusItem = perData.bonusItem || 0;
    const totalBns = treinoB + extra + bonusItem;
    const diceLbl  = diceLabel(effAttrVal);
    const condTag  = condPen ? `<span class="attr-condition-pen" title="Penalidade de dados por condição ativa">${signed(condPen)}d</span>` : '';
    const totalLbl = `${diceLbl}${condTag}${totalBns ? ' ' + signed(totalBns) : ''}`;
    const isOverridden = attrKey !== p.attr;
    const itemBonusTag = bonusItem !== 0
      ? `<span class="pericia-item-bonus ${bonusItem < 0 ? 'neg' : ''}" title="Bônus de item equipado">${bonusItem > 0 ? '+' : ''}${bonusItem} ${icon('backpack','',12)}</span>`
      : '';
    const attrOptions = ATTR_LIST.map(a =>
      `<option value="${a.key}" ${a.key === attrKey ? 'selected' : ''}>${a.abbr}</option>`
    ).join('');
    return `
      <div class="pericia-row" data-pericia="${p.key}">
        <div class="pericia-treino-btns">
          <button class="treino-pip ${perData.treino >= 1 ? 'on' : ''}" data-pericia="${p.key}" data-t="1" title="Treinado (+5)">T</button>
          <button class="treino-pip ${perData.treino >= 2 ? 'on' : ''}" data-pericia="${p.key}" data-t="2" title="Veterano (+10)">V</button>
          <button class="treino-pip ${perData.treino >= 3 ? 'on' : ''}" data-pericia="${p.key}" data-t="3" title="Expert (+15)">E</button>
        </div>
        <span class="pericia-nome ${p.starred ? 'starred' : ''}">${esc(p.label)}${p.starred ? '*' : ''}</span>
        <select class="pericia-attr-select ${isOverridden ? 'overridden' : ''}" data-pericia="${p.key}"
          title="Atributo usado nesta rolagem (padrão: ${ATTR_MAP[p.attr].abbr}). Ex: Luta com Agilidade lutando de katana.">
          ${attrOptions}
        </select>
        <input class="pericia-extra" type="number" data-pericia="${p.key}" value="${extra}" title="Bônus extra manual (talentos, etc.) — bônus de itens são somados automaticamente"/>
        ${itemBonusTag}
        <span class="pericia-total" title="${diceLbl} (dado) ${signed(totalBns)} (bônus)">${totalLbl}</span>
        <button class="pericia-roll-btn" data-pericia="${p.key}" title="Rolar ${p.label}"><img src="assets/dice/d20.png" alt="d20"/></button>
      </div>`;
  }

  _attackRow(a, sheet) {
    const critRange = a.critRange || 20;
    const critMult  = a.critMult  || 2;
    const periciaKey = a.pericia || 'luta';
    const per = PERICIAS.find(p => p.key === periciaKey);
    // Usa o atributo de verdade que essa perícia vai usar pra rolar — se o
    // jogador trocou o atributo padrão dela (ex: Luta com AGI em vez de
    // FOR) na aba Perícias, a dica aqui tem que refletir isso, e não
    // sempre mostrar o atributo padrão da perícia.
    const attrKey  = per ? getPericiaAttrKey(sheet, per) : 'forca';
    const atkPen = getConditionRollPenalty(sheet.conditions, { attrKey, periciaKey }) + getConditionAtkPenalty(sheet.conditions);
    const atkPenTag = atkPen ? `<span class="attr-condition-pen" title="Penalidade de dados por condição ativa">${signed(atkPen)}d</span>` : '';
    return `
      <div class="sheet-row attack-row" data-id="${a.id}" data-kind="attack">
        <div class="row-main">
          <input class="row-name" value="${escAttr(a.name)}" placeholder="Nome do ataque"/>
          <select class="row-pericia" title="Perícia usada no ataque (ex: Luta corpo a corpo, Pontaria à distância)">
            ${PERICIAS.map(p => `<option value="${p.key}" ${p.key === periciaKey ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
          <input class="row-formula" value="${escAttr(a.damage||'1d6')}" placeholder="Dano ex: 2d8+3" title="Fórmula de dano"/>
        </div>
        <div class="row-details attack-row-details">
          <span class="attack-pericia-hint hint">Rola com ${per ? per.label : 'Luta'} (${ATTR_MAP[attrKey].abbr})${atkPenTag}</span>
          <select class="attack-dmg-type" title="Tipo de dano">
            ${DAMAGE_TYPES.map(t => `<option value="${t}" ${t === (a.damageType||'Corte') ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
          <label class="attack-crit-field" title="A partir de qual resultado no d20 (dado, não o total) este ataque é crítico">
            ${icon('burst')} crítico ≥ <input class="attack-crit-range" type="number" min="2" max="20" value="${critRange}"/>
          </label>
          <label class="attack-crit-field" title="Quantas vezes multiplicar a quantidade de dados de dano no crítico">
            ${icon('close')} <input class="attack-crit-mult" type="number" min="2" max="5" value="${critMult}"/>
          </label>
        </div>
        <div class="row-actions">
          <button class="roll-btn" data-roll="attack" title="Rolar ataque">${icon('swords')} Atacar</button>
          <button class="roll-btn dmg-btn hidden" data-roll="damage" title="Rolar dano">${icon('burst')} Dano</button>
          <button class="row-del" title="Remover">${icon('close')}</button>
        </div>
      </div>`;
  }

  _ritualRow(r, sheet) {
    const tags = [
      ritualElementoLabel(r.elemento),
      `${r.circulo}º círculo`,
      ritualExecucaoLabel(r.execucao),
      ritualAlcanceLabel(r.alcance),
    ].filter(Boolean);
    const diceBtn = (label, formula, cls) => formula
      ? `<button class="ritual-dice-btn ${cls}" data-ritual-dice="${escAttr(formula)}" data-ritual-id="${r.id}" title="Rolar ${label}: ${escAttr(formula)}">${label}</button>`
      : '';
    return `
      <div class="ritual-card" data-id="${r.id}" data-kind="ritual">
        <div class="ritual-card-thumb">${r.imageSrc ? `<img src="${r.imageSrc}" alt=""/>` : icon('orb','',26)}</div>
        <div class="ritual-card-main">
          <div class="ritual-card-top">
            <span class="ritual-card-name">${escAttr(r.name)}</span>
            <div class="ritual-card-actions">
              <button class="ritual-edit-btn" title="Editar ritual">${icon('edit')}</button>
              <button class="row-del" title="Remover">${icon('close')}</button>
            </div>
          </div>
          <div class="ritual-card-tags">${tags.map(t => `<span class="ritual-tag">${t}</span>`).join('')}</div>
          ${r.efeito ? `<div class="ritual-card-efeito">${escAttr(r.efeito)}</div>` : ''}
          <div class="ritual-card-meta">
            ${r.area ? `<span><strong>Área:</strong> ${escAttr(r.area)}</span>` : ''}
            ${r.alvo ? `<span><strong>Alvo:</strong> ${escAttr(r.alvo)}</span>` : ''}
            ${r.duracao ? `<span><strong>Duração:</strong> ${escAttr(r.duracao)}</span>` : ''}
            ${r.resistencia ? `<span><strong>Resistência:</strong> ${escAttr(r.resistencia)}</span>` : ''}
          </div>
          <div class="ritual-card-dice">
            ${diceBtn('Dados', r.dados, 'tier-normal')}
            ${diceBtn('Discente', r.dadosDiscente, 'tier-discente')}
            ${diceBtn('Verdadeiro', r.dadosVerdadeiro, 'tier-verdadeiro')}
          </div>
        </div>
      </div>`;
  }

  _habilidadeRow(h) {
    return `
      <div class="sheet-row habilidade-row" data-id="${h.id}" data-kind="habilidade">
        <div class="row-main habilidade-main">
          <input class="row-name habilidade-nome" value="${escAttr(h.name)}" placeholder="Nome da habilidade"/>
          <select class="row-attr habilidade-tipo" title="Tipo">
            <option value="passiva"    ${h.tipo==='passiva'   ?'selected':''}>Passiva</option>
            <option value="acao"       ${h.tipo==='acao'      ?'selected':''}>Ação</option>
            <option value="reacao"     ${h.tipo==='reacao'    ?'selected':''}>Reação</option>
            <option value="bonus"      ${h.tipo==='bonus'     ?'selected':''}>Bônus</option>
            <option value="livre"      ${h.tipo==='livre'     ?'selected':''}>Livre</option>
          </select>
          <input class="row-num" type="number" value="${h.custo||0}" title="Custo (PE)" min="0" style="width:52px"/>
        </div>
        <textarea class="habilidade-desc" placeholder="Descrição da habilidade...">${esc(h.desc||'')}</textarea>
        <div class="row-actions">
          <button class="roll-btn" data-roll="habilidade" title="Usar habilidade">${icon('sparkle')} Usar</button>
          <button class="row-del" title="Remover">${icon('close')}</button>
        </div>
      </div>`;
  }

  // ── Painel fixo de patente + inventário ──────────────────────
  _inventoryPanel(sheet) {
    const pat     = getPatente(sheet.pp);
    const forca   = sheet.attrs?.forca ?? 1;
    const cargaMax = calcCarga(forca);
    const usado   = calcEspacosUsados(sheet.items);
    const catUso  = calcCatUsage(sheet.items);
    const sobrec  = usado > cargaMax;
    const limiteMx = cargaMax * 2;

    // Linha de limites por categoria: mostra uso/limite (itens missão não contam)
    const catCells = CAT_LABELS.map((c, i) => {
      const lim = pat.limites[i - 1] ?? (i === 0 ? '∞' : 0); // cat 0 = ilimitada
      const uso = catUso[c] || 0;
      const over = i > 0 && typeof lim === 'number' && uso > lim;
      return `<div class="inv-cat-cell ${over ? 'over' : ''}">
        <div class="inv-cat-label">Cat ${c}</div>
        <div class="inv-cat-val">${uso}${typeof lim === 'number' && i > 0 ? `<span>/${lim}</span>` : '<span>/∞</span>'}</div>
      </div>`;
    }).join('');

    const itemsHtml = sheet.items.length
      ? sheet.items.map(it => this._itemRow(it, sheet, pat)).join('')
      : '<div class="empty-row">Inventário vazio. Clique em + Armazém ou + Missão.</div>';

    return `
      <!-- Painel fixo de patente -->
      <div class="inv-patent-panel">
        <div class="inv-patent-row">
          <div class="inv-stat-block">
            <div class="inv-stat-label">PONTOS DE PRESTÍGIO</div>
            <input class="inv-pp-input" type="number" data-sf="pp" value="${sheet.pp}" min="0" title="Pontos de Prestígio"/>
          </div>
          <div class="inv-stat-block">
            <div class="inv-stat-label">PATENTE</div>
            <div class="inv-patente-badge">${pat.nome}</div>
          </div>
        </div>

        <div class="inv-patent-row">
          <div class="inv-stat-block inv-full">
            <div class="inv-stat-label">LIMITE DE ITENS (armazém) — itens de missão não contam</div>
            <div class="inv-cat-row">${catCells}</div>
          </div>
        </div>

        <div class="inv-patent-row">
          <div class="inv-stat-block">
            <div class="inv-stat-label">NO INVENTÁRIO</div>
            <div class="inv-carga-bar-wrap">
              <div class="inv-carga-bar ${sobrec ? 'sobrec' : ''}"
                style="width:${Math.min(100,(usado/limiteMx)*100)}%"></div>
            </div>
            <div class="inv-carga-nums ${sobrec ? 'sobrec' : ''}">${usado} / ${cargaMax} espaços${sobrec ? ' ' + icon('warning','icon-warning') + ' sobrecarregado' : ''}</div>
          </div>
          <div class="inv-stat-block">
            <div class="inv-stat-label">LIMITE DE CRÉDITO</div>
            <div class="inv-credito-badge">${pat.credito}</div>
          </div>
          <div class="inv-stat-block">
            <div class="inv-stat-label">CARGA MÁX.</div>
            <div class="inv-cargamax-val">${cargaMax} <span class="inv-hint">/ ${limiteMx} sobrec.</span></div>
          </div>
        </div>
      </div>

      <!-- Lista + botões de adicionar -->
      <div class="tab-add-bar">
        <button class="btn-add-row" data-add="item-armazem">${icon('store')} + Armazém</button>
        <button class="btn-add-row btn-missao" data-add="item-missao">${icon('target')} + Missão</button>
      </div>
      <div class="sheet-list-rows" id="sf-items">
        ${itemsHtml}
      </div>`;
  }

  _itemRow(it, sheet, pat) {
    if (!pat) pat = getPatente(sheet.pp);
    const lim  = it.categoria === '0' ? null : (pat.limites[CAT_LABELS.indexOf(it.categoria) - 1] ?? 0);
    const peso = it.peso !== undefined ? it.peso : (CAT_PESO_DEFAULT[it.categoria] ?? 1);
    const bonusStr = (it.periciaBonus || []).map(b =>
      `<span class="item-bonus-tag ${b.valor < 0 ? 'neg' : ''}">${b.pericia} ${b.valor > 0 ? '+' : ''}${b.valor}</span>`
    ).join('');
    const missaoTag = it.deMissao
      ? `<span class="item-missao-tag" title="Item encontrado em missão — não conta no limite de categoria">${icon('target')} Missão</span>`
      : `<span class="item-armazem-tag" title="Item do armazém da Ordem — conta no limite de categoria">${icon('store')}</span>`;
    const weaponTag = it.isWeapon
      ? `<span class="item-weapon-tag" title="Arma cadastrada na aba Combate">${icon('sword')} Arma</span>`
      : '';
    const protecaoTag = it.tipo === 'protecao'
      ? `<span class="item-protecao-tag" title="Soma à Defesa quando equipada">${icon('shield')} Proteção +${it.defesaBonus||0}</span>`
      : '';
    const modTags = (it.modificacoes || []).map(m =>
      `<span class="item-mod-tag" title="${escAttr(m.effect)}">${icon('bolt')} ${escAttr(m.name)}</span>`
    ).join('');
    const curseTags = (it.maldicoes || []).map(m =>
      `<span class="item-curse-tag" title="${escAttr(m.effect)}">${icon('orb')} ${escAttr(m.name)}</span>`
    ).join('');

    return `
      <div class="sheet-row item-row ${it.ativo ? 'item-ativo' : ''}" data-id="${it.id}" data-kind="item">
        <div class="item-row-top">
          <button class="item-toggle-btn ${it.ativo ? 'on' : ''}" data-item-toggle="${it.id}" title="${it.ativo ? 'Desequipar' : 'Equipar/Ativar'}">
            ${it.ativo ? icon('check','icon-success') : icon('emptybox','icon-dim')}
          </button>
          ${missaoTag}
          ${weaponTag}
          ${protecaoTag}
          <span class="item-cat-badge cat-${it.categoria||'I'}">Cat ${it.categoria||'I'}</span>
          <input class="row-name item-name-inp" value="${escAttr(it.name)}" placeholder="Nome do item"/>
          <input class="item-qty" type="number" value="${it.qty??1}" min="0" title="Qtd" data-item-field="qty"/>
          <span class="item-peso-label">${peso * (it.qty||1)} esp.</span>
          <button class="row-edit" title="Editar item">${icon('edit')}</button>
          <button class="row-del" title="Remover">${icon('close')}</button>
        </div>
        <div class="item-row-details">
          <input class="row-formula item-effect-inp" value="${escAttr(it.effect||'')}" placeholder="Efeito (ex: +2d6 PV, cura 1d6+2)" data-item-field="effect"/>
          <div class="item-bonus-tags">${bonusStr}${modTags}${curseTags}</div>
        </div>
        <div class="row-actions item-actions">
          <button class="roll-btn" data-roll="item" title="Usar item">${icon('flask')} Usar</button>
        </div>
      </div>`;
  }


  // Modal para adicionar OU editar item (passe existingItem para editar)
  _openAddItemModal(sheet, deMissao, existingItem = null) {
    const existing = document.getElementById('add-item-modal');
    if (existing) existing.remove();
    const isEdit = !!existingItem;
    const linkedAttack = isEdit && existingItem.linkedAttackId
      ? sheet.attacks.find(a => a.id === existingItem.linkedAttackId) : null;

    const overlay = document.createElement('div');
    overlay.id = 'add-item-modal';
    overlay.className = 'modal-backdrop';
    overlay.innerHTML = `
      <div class="modal add-item-modal-box">
        <div class="modal-header">
          <h3>${isEdit ? icon('edit')+' Editar Item' : (deMissao ? icon('target')+' Adicionar Item de Missão' : icon('store')+' Adicionar Item do Armazém')}</h3>
          <button class="modal-close" id="add-item-close">${icon('close')}</button>
        </div>
        <div class="modal-body add-item-body">
          ${isEdit ? '' : `
          <div class="add-item-row">
            <label>Escolher do Catálogo <span class="hint">(preenche os campos automaticamente — ou monte um item do zero abaixo)</span></label>
            <select id="ai-preset">${buildItemPresetOptions()}</select>
          </div>`}
          <div class="add-item-row">
            <label>Nome do item</label>
            <input id="ai-name" type="text" placeholder="Ex: Colete balístico" value="${isEdit ? escAttr(existingItem.name) : ''}"/>
          </div>
          <div class="add-item-row two-col">
            <div>
              <label>Categoria <span class="hint" id="ai-cat-hint"></span></label>
              <select id="ai-cat">
                ${CAT_LABELS.map(c => `<option value="${c}" ${isEdit && existingItem.categoria===c ? 'selected':''}>Categoria ${c}</option>`).join('')}
              </select>
            </div>
            <div>
              <label>Quantidade</label>
              <input id="ai-qty" type="number" value="${isEdit ? (existingItem.qty??1) : 1}" min="1"/>
            </div>
          </div>
          <div class="add-item-row two-col">
            <div>
              <label>Peso (espaços por unidade)</label>
              <input id="ai-peso" type="number" value="${isEdit ? (existingItem.peso??1) : 1}" min="0" step="1"/>
            </div>
            <div>
              <label>Efeito / Descrição</label>
              <input id="ai-effect" type="text" placeholder="Ex: +2d6 PV, +5 Furtividade" value="${isEdit ? escAttr(existingItem.effect||'') : ''}"/>
            </div>
          </div>

          <div class="add-item-bonus-section">
            <div class="add-item-bonus-title">Bônus/Penalidade em Perícia <span class="hint">(aplica automaticamente ao ativar o item)</span></div>
            <div id="ai-bonus-list"></div>
            <div class="add-item-bonus-add-row">
              <select id="ai-bonus-pericia">
                ${PERICIAS.map(p => `<option value="${p.key}">${p.label}</option>`).join('')}
              </select>
              <input id="ai-bonus-val" type="number" value="5" step="5" style="width:64px"/>
              <button id="ai-bonus-add-btn" class="btn-add-bonus">+ Adicionar</button>
            </div>
          </div>

          <div class="add-item-weapon-section">
            <label class="add-item-weapon-toggle">
              <input type="checkbox" id="ai-is-weapon" ${isEdit && existingItem.isWeapon ? 'checked' : ''}/>
              ${icon('sword')} Isso é uma arma <span class="hint">(adiciona automaticamente na aba Combate)</span>
            </label>
            <div id="ai-weapon-fields" class="add-item-weapon-fields ${isEdit && existingItem.isWeapon ? '' : 'hidden'}">
              <div class="add-item-row two-col">
                <div>
                  <label>Perícia usada no ataque</label>
                  <select id="ai-weapon-pericia">
                    ${PERICIAS.map(p => `<option value="${p.key}" ${linkedAttack ? (linkedAttack.pericia===p.key?'selected':'') : (p.key==='luta'?'selected':'')}>${p.label}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label>Dano base</label>
                  <input id="ai-weapon-damage" type="text" placeholder="Ex: 2d6+3" value="${linkedAttack ? escAttr(linkedAttack.damage) : ''}"/>
                </div>
              </div>
              <div class="add-item-row two-col">
                <div>
                  <label>Tipo de dano</label>
                  <select id="ai-weapon-type">
                    ${DAMAGE_TYPES.map(t => `<option value="${t}" ${linkedAttack && linkedAttack.damageType===t ? 'selected':''}>${t}</option>`).join('')}
                  </select>
                </div>
                <div></div>
              </div>
              <div class="add-item-row two-col">
                <div>
                  <label>Crítico a partir de <span class="hint">(no dado, ex: 20 ou 19-20)</span></label>
                  <input id="ai-weapon-crit-range" type="number" min="2" max="20" value="${linkedAttack ? linkedAttack.critRange : 20}"/>
                </div>
                <div>
                  <label>Multiplicador do crítico</label>
                  <input id="ai-weapon-crit-mult" type="number" min="2" max="5" value="${linkedAttack ? linkedAttack.critMult : 2}"/>
                </div>
              </div>
              <div class="add-item-row">
                <div id="ai-weapon-computed" class="ai-computed-note"></div>
              </div>
              <div class="ai-modcurse-block">
                <div class="ai-modcurse-title">${icon('bolt')} Modificações para Armas <span class="hint">(cada uma aumenta a categoria em I; não se repetem)</span></div>
                <div id="ai-weapon-mods-list" class="ai-mc-list"></div>
                <div class="ai-modcurse-title">${icon('orb')} Maldições para Armas <span class="hint">(1ª aumenta a categoria em II; as seguintes, em I cada)</span></div>
                <div id="ai-weapon-curses-list" class="ai-mc-list"></div>
              </div>
            </div>
          </div>

          <div class="add-item-weapon-section">
            <label class="add-item-weapon-toggle">
              <input type="checkbox" id="ai-is-protecao" ${isEdit && existingItem.tipo==='protecao' ? 'checked' : ''}/>
              ${icon('shield')} Isso é uma proteção <span class="hint">(bônus somado à Defesa quando equipada)</span>
            </label>
            <div id="ai-protecao-fields" class="add-item-weapon-fields ${isEdit && existingItem.tipo==='protecao' ? '' : 'hidden'}">
              <div class="add-item-row two-col">
                <div>
                  <label>Bônus de Defesa base</label>
                  <input id="ai-protecao-bonus" type="number" value="${isEdit && existingItem.tipo==='protecao' ? (existingItem.defesaBonusBase ?? existingItem.defesaBonus ?? 1) : 1}" min="0"/>
                </div>
                <div>
                  <label class="ai-inline-check"><input type="checkbox" id="ai-protecao-pesada" ${isEdit && existingItem.protecaoPesada ? 'checked' : ''}/> Proteção pesada <span class="hint">(libera/restringe mods.)</span></label>
                </div>
              </div>
              <div class="ai-computed-note" id="ai-protecao-computed"></div>
              <div class="ai-modcurse-block">
                <div class="ai-modcurse-title">${icon('bolt')} Modificações para Proteções</div>
                <div id="ai-protecao-mods-list" class="ai-mc-list"></div>
                <div class="ai-modcurse-title">${icon('orb')} Maldições para Proteções</div>
                <div id="ai-protecao-curses-list" class="ai-mc-list"></div>
              </div>
            </div>
          </div>

          <div class="add-item-weapon-section" id="ai-accessory-section">
            <div class="add-item-weapon-toggle" style="cursor:default">
              ${icon('tag')} Acessório (utensílio / vestimenta / kit) <span class="hint">— disponível quando o item não é arma nem proteção</span>
            </div>
            <div id="ai-accessory-fields" class="add-item-weapon-fields">
              <div class="ai-modcurse-block">
                <div class="ai-modcurse-title">${icon('bolt')} Modificações para Acessórios</div>
                <div id="ai-accessory-mods-list" class="ai-mc-list"></div>
                <div class="ai-modcurse-title">${icon('orb')} Maldições para Acessórios</div>
                <div id="ai-accessory-curses-list" class="ai-mc-list"></div>
              </div>
            </div>
          </div>

          ${deMissao ? `<div class="add-item-missao-note">${icon('info')} Item de missão não conta no limite de categoria do armazém.</div>` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="add-item-cancel">Cancelar</button>
          <button class="btn-primary" id="add-item-confirm">${isEdit ? 'Salvar Alterações' : 'Adicionar ao Inventário'}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // ── Estado de modificações/maldições ────────────────────────
    // "Base" = valores ANTES de aplicar mods/maldições (o que o preset ou
    // o usuário definiu). Os campos visíveis (categoria/peso/dano/crítico/
    // defesa) sempre mostram o TOTAL já calculado — os campos base ficam
    // só na memória (e persistidos no item, pra reabrir/editar depois
    // sem perder a conta).
    const state = {
      weaponMods: new Set(), weaponCurses: new Set(),
      protMods: new Set(), protCurses: new Set(),
      accMods: new Set(), accCurses: new Set(),
      baseCat: isEdit ? (existingItem.categoriaBase || existingItem.categoria) : 'I',
      basePeso: isEdit ? (existingItem.pesoBase ?? existingItem.peso ?? 1) : 1,
      baseDamage: linkedAttack ? (linkedAttack.damageBase || linkedAttack.damage) : '',
      baseCritRange: linkedAttack ? (linkedAttack.critRangeBase ?? linkedAttack.critRange) : 20,
      baseCritMult: linkedAttack ? (linkedAttack.critMultBase ?? linkedAttack.critMult) : 2,
      baseDefesa: isEdit && existingItem.tipo === 'protecao' ? (existingItem.defesaBonusBase ?? existingItem.defesaBonus ?? 1) : 1,
    };
    if (isEdit) {
      (existingItem.modificacoes || []).forEach(m => {
        const list = existingItem.isWeapon ? WEAPON_MODIFICATIONS : (existingItem.tipo === 'protecao' ? PROTECTION_MODIFICATIONS : ACCESSORY_MODIFICATIONS);
        const idx = list.findIndex(x => x.name === m.name);
        if (idx === -1) return;
        if (existingItem.isWeapon) state.weaponMods.add(idx);
        else if (existingItem.tipo === 'protecao') state.protMods.add(idx);
        else state.accMods.add(idx);
      });
      (existingItem.maldicoes || []).forEach(m => {
        const list = existingItem.isWeapon ? WEAPON_CURSES : (existingItem.tipo === 'protecao' ? PROTECTION_CURSES : ACCESSORY_CURSES);
        const idx = list.findIndex(x => x.name === m.name);
        if (idx === -1) return;
        if (existingItem.isWeapon) state.weaponCurses.add(idx);
        else if (existingItem.tipo === 'protecao') state.protCurses.add(idx);
        else state.accCurses.add(idx);
      });
    }

    const $ = sel => overlay.querySelector(sel);

    function renderModList(container, mods, selected, extraFilter) {
      container.innerHTML = mods.map((m, i) => {
        if (extraFilter && !extraFilter(m)) return '';
        const on = selected.has(i);
        return `<label class="ai-mc-chip ${on?'checked':''}">
          <input type="checkbox" data-i="${i}" ${on?'checked':''}/>
          <div class="ai-mc-chip-text"><strong>${escAttr(m.name)}</strong><span>${escAttr(m.effect)}</span></div>
        </label>`;
      }).join('');
    }

    function renderCurseList(container, curses, selected) {
      const order = ['conhecimento', 'energia', 'morte', 'sangue', 'variados'];
      const byEl = {};
      curses.forEach((c, i) => { const k = c.elemento || 'variados'; (byEl[k] ||= []).push(i); });
      container.innerHTML = order.filter(k => byEl[k]).map(k => `
        <div class="ai-mc-group">
          <div class="ai-mc-group-label">${k === 'variados' ? 'Diversos' : ELEMENTO_LABEL[k]}</div>
          ${byEl[k].map(i => {
            const c = curses[i];
            const on = selected.has(i);
            const conflict = !on && [...selected].some(si => elementosConflitam(curses[si].elemento, c.elemento));
            return `<label class="ai-mc-chip ${on?'checked':''} ${conflict?'disabled':''}" ${conflict ? 'title="Conflita com um elemento oposto já selecionado"' : ''}>
              <input type="checkbox" data-i="${i}" ${on?'checked':''} ${conflict?'disabled':''}/>
              <div class="ai-mc-chip-text"><strong>${escAttr(c.name)}</strong><span>${escAttr(c.effect)}</span></div>
            </label>`;
          }).join('')}
        </div>`).join('');
    }

    function wireList(container, mods, selected, onToggle) {
      container.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', () => {
          const i = parseInt(cb.dataset.i);
          if (cb.checked) selected.add(i); else selected.delete(i);
          onToggle();
        });
      });
    }

    const isWeaponEl = $('#ai-is-weapon'), isProtEl = $('#ai-is-protecao');

    function recomputeWeapon() {
      const modCount = state.weaponMods.size;
      const curseCount = state.weaponCurses.size;
      const bump = modCount + custoCategoriaMaldicoes(curseCount);
      const rawIdx = catIndex(state.baseCat) + bump;
      const idx = Math.min(CAT_LABELS.length - 1, rawIdx);
      $('#ai-cat').value = CAT_LABELS[idx];

      let peso = state.basePeso;
      let critRange = state.baseCritRange, critMult = state.baseCritMult;
      let dmg = state.baseDamage;
      const notes = [];
      state.weaponMods.forEach(i => {
        const m = WEAPON_MODIFICATIONS[i];
        if (m.espacoDelta) peso += m.espacoDelta;
        if (m.critRangeDelta) critRange += m.critRangeDelta;
        if (m.critMultDelta) critMult += m.critMultDelta;
        if (m.danoExtraDinamico === 'calibreGrosso') dmg = mergeDanoExtra(dmg, calibreGrossoExtra(state.baseDamage), m.name);
      });
      state.weaponCurses.forEach(i => {
        const c = WEAPON_CURSES[i];
        if (c.danoExtra) dmg = mergeDanoExtra(dmg, c.danoExtra, c.name);
      });
      $('#ai-peso').value = Math.max(0, peso);
      $('#ai-weapon-crit-range').value = Math.max(2, Math.min(20, critRange));
      $('#ai-weapon-crit-mult').value = Math.max(2, Math.min(5, critMult));
      $('#ai-weapon-damage').value = dmg;

      const exceeds = rawIdx > CAT_LABELS.length - 1;
      $('#ai-cat-hint').textContent = (modCount || curseCount) ? `(base ${state.baseCat} + ${modCount} mod. + ${curseCount} maldição/ões)` : '';
      $('#ai-weapon-computed').textContent = exceeds
        ? `⚠ A categoria total excede IV (seria ${CAT_LABELS[0]}+${rawIdx}) — exige aprovação especial do mestre.`
        : '';
    }

    function recomputeProtecao() {
      const modCount = state.protMods.size;
      const curseCount = state.protCurses.size;
      const bump = modCount + custoCategoriaMaldicoes(curseCount);
      const rawIdx = catIndex(state.baseCat) + bump;
      const idx = Math.min(CAT_LABELS.length - 1, rawIdx);
      $('#ai-cat').value = CAT_LABELS[idx];

      let peso = state.basePeso, defesa = state.baseDefesa;
      state.protMods.forEach(i => {
        const m = PROTECTION_MODIFICATIONS[i];
        if (m.espacoDelta) peso += m.espacoDelta;
        if (m.defesaDelta) defesa += m.defesaDelta;
      });
      state.protCurses.forEach(i => {
        const c = PROTECTION_CURSES[i];
        if (c.defesaDelta) defesa += c.defesaDelta;
      });
      $('#ai-peso').value = Math.max(0, peso);
      $('#ai-protecao-bonus').value = Math.max(0, defesa);
      $('#ai-cat-hint').textContent = (modCount || curseCount) ? `(base ${state.baseCat} + ${modCount} mod. + ${curseCount} maldição/ões)` : '';
      const exceeds = rawIdx > CAT_LABELS.length - 1;
      $('#ai-protecao-computed').textContent = exceeds
        ? `⚠ A categoria total excede IV (seria ${CAT_LABELS[0]}+${rawIdx}) — exige aprovação especial do mestre.`
        : '';
    }

    function recomputeAccessory() {
      const modCount = state.accMods.size;
      const curseCount = state.accCurses.size;
      const bump = modCount + custoCategoriaMaldicoes(curseCount);
      const rawIdx = catIndex(state.baseCat) + bump;
      const idx = Math.min(CAT_LABELS.length - 1, rawIdx);
      $('#ai-cat').value = CAT_LABELS[idx];

      let peso = state.basePeso;
      state.accMods.forEach(i => { const m = ACCESSORY_MODIFICATIONS[i]; if (m.espacoDelta) peso += m.espacoDelta; });
      $('#ai-peso').value = Math.max(0, peso);
      $('#ai-cat-hint').textContent = (modCount || curseCount) ? `(base ${state.baseCat} + ${modCount} mod. + ${curseCount} maldição/ões)` : '';
    }

    function renderWeaponLists() {
      renderModList($('#ai-weapon-mods-list'), WEAPON_MODIFICATIONS, state.weaponMods);
      renderCurseList($('#ai-weapon-curses-list'), WEAPON_CURSES, state.weaponCurses);
      wireList($('#ai-weapon-mods-list'), WEAPON_MODIFICATIONS, state.weaponMods, () => { renderWeaponLists(); recomputeWeapon(); });
      wireList($('#ai-weapon-curses-list'), WEAPON_CURSES, state.weaponCurses, () => { renderWeaponLists(); recomputeWeapon(); });
    }
    function renderProtecaoLists() {
      const pesada = $('#ai-protecao-pesada').checked;
      renderModList($('#ai-protecao-mods-list'), PROTECTION_MODIFICATIONS, state.protMods, m =>
        (!m.soProtecaoPesada || pesada) && (!m.soProtecaoLeve || !pesada));
      renderCurseList($('#ai-protecao-curses-list'), PROTECTION_CURSES, state.protCurses);
      wireList($('#ai-protecao-mods-list'), PROTECTION_MODIFICATIONS, state.protMods, () => { renderProtecaoLists(); recomputeProtecao(); });
      wireList($('#ai-protecao-curses-list'), PROTECTION_CURSES, state.protCurses, () => { renderProtecaoLists(); recomputeProtecao(); });
    }
    function renderAccessoryLists() {
      renderModList($('#ai-accessory-mods-list'), ACCESSORY_MODIFICATIONS, state.accMods);
      renderCurseList($('#ai-accessory-curses-list'), ACCESSORY_CURSES, state.accCurses);
      wireList($('#ai-accessory-mods-list'), ACCESSORY_MODIFICATIONS, state.accMods, () => { renderAccessoryLists(); recomputeAccessory(); });
      wireList($('#ai-accessory-curses-list'), ACCESSORY_CURSES, state.accCurses, () => { renderAccessoryLists(); recomputeAccessory(); });
    }

    function updateModeVisibility() {
      const isW = isWeaponEl.checked, isP = isProtEl.checked;
      $('#ai-weapon-fields').classList.toggle('hidden', !isW);
      $('#ai-protecao-fields').classList.toggle('hidden', !isP);
      $('#ai-accessory-section').classList.toggle('hidden', isW || isP);
      if (isW) { renderWeaponLists(); recomputeWeapon(); }
      else if (isP) { renderProtecaoLists(); recomputeProtecao(); }
      else { renderAccessoryLists(); recomputeAccessory(); }
    }

    isWeaponEl.addEventListener('change', () => { if (isWeaponEl.checked) isProtEl.checked = false; updateModeVisibility(); });
    isProtEl.addEventListener('change', () => { if (isProtEl.checked) isWeaponEl.checked = false; updateModeVisibility(); });
    $('#ai-protecao-pesada')?.addEventListener('change', () => { renderProtecaoLists(); recomputeProtecao(); });

    // "Categoria" e "Peso" editados manualmente (sem mods/maldições) viram
    // a nova base — assim editar do zero continua funcionando normal.
    $('#ai-cat').addEventListener('input', () => {
      const totalSel = state.weaponMods.size + state.weaponCurses.size + state.protMods.size + state.protCurses.size + state.accMods.size + state.accCurses.size;
      if (totalSel === 0) state.baseCat = $('#ai-cat').value;
    });
    $('#ai-peso').addEventListener('input', () => {
      const totalSel = state.weaponMods.size + state.weaponCurses.size + state.protMods.size + state.protCurses.size + state.accMods.size + state.accCurses.size;
      if (totalSel === 0) state.basePeso = parseFloat($('#ai-peso').value) || 0;
    });
    $('#ai-weapon-damage').addEventListener('input', () => {
      if (state.weaponMods.size === 0 && state.weaponCurses.size === 0) state.baseDamage = $('#ai-weapon-damage').value;
    });
    $('#ai-weapon-crit-range').addEventListener('input', () => {
      if (state.weaponMods.size === 0) state.baseCritRange = parseInt($('#ai-weapon-crit-range').value) || 20;
    });
    $('#ai-weapon-crit-mult').addEventListener('input', () => {
      if (state.weaponMods.size === 0 && state.weaponCurses.size === 0) state.baseCritMult = parseInt($('#ai-weapon-crit-mult').value) || 2;
    });
    $('#ai-protecao-bonus').addEventListener('input', () => {
      if (state.protMods.size === 0 && state.protCurses.size === 0) state.baseDefesa = parseInt($('#ai-protecao-bonus').value) || 0;
    });

    // ── Preset picker ────────────────────────────────────────────
    $('#ai-preset')?.addEventListener('change', e => {
      const resolved = resolvePresetRef(e.target.value);
      // trocar de preset zera mods/maldições selecionadas (são de tabelas diferentes)
      state.weaponMods.clear(); state.weaponCurses.clear();
      state.protMods.clear(); state.protCurses.clear();
      state.accMods.clear(); state.accCurses.clear();
      if (!resolved) { updateModeVisibility(); return; }
      const { kind, data } = resolved;

      $('#ai-name').value = data.name;
      $('#ai-effect').value = data.desc || '';

      if (kind === 'weapon') {
        state.baseCat = data.categoria; state.basePeso = data.espacos;
        state.baseDamage = data.damage; state.baseCritRange = data.critRange; state.baseCritMult = data.critMult;
        isWeaponEl.checked = true; isProtEl.checked = false;
        $('#ai-weapon-pericia').value = data.tipoArma === 'fogo' || data.tipoArma === 'disparo' ? 'pontaria' : 'luta';
        $('#ai-weapon-type').value = data.damageType;
      } else if (kind === 'munition') {
        state.baseCat = data.categoria; state.basePeso = data.espacos;
        isWeaponEl.checked = false; isProtEl.checked = false;
      } else if (kind === 'protection') {
        state.baseCat = data.categoria; state.basePeso = data.espacos; state.baseDefesa = data.defesaBonus;
        isProtEl.checked = true; isWeaponEl.checked = false;
        $('#ai-protecao-pesada').checked = !!data.pesada;
      } else if (kind === 'general') {
        state.baseCat = data.categoria; state.basePeso = data.espacos;
        isWeaponEl.checked = false; isProtEl.checked = false;
      }
      $('#ai-cat').value = state.baseCat;
      $('#ai-peso').value = state.basePeso;
      updateModeVisibility();
    });

    updateModeVisibility();

    const bonusList = isEdit ? (existingItem.periciaBonus || []).map(b => ({ ...b })) : [];

    const renderBonusList = () => {
      const el = overlay.querySelector('#ai-bonus-list');
      el.innerHTML = bonusList.map((b, i) =>
        `<div class="ai-bonus-chip ${b.valor < 0 ? 'neg' : ''}">
          ${PERICIAS.find(p=>p.key===b.pericia)?.label||b.pericia}
          <strong>${b.valor > 0 ? '+' : ''}${b.valor}</strong>
          <button class="ai-bonus-rm" data-i="${i}">${icon('close')}</button>
        </div>`
      ).join('');
      el.querySelectorAll('.ai-bonus-rm').forEach(btn => {
        btn.addEventListener('click', () => { bonusList.splice(parseInt(btn.dataset.i), 1); renderBonusList(); });
      });
    };
    renderBonusList();

    overlay.querySelector('#ai-bonus-add-btn').addEventListener('click', () => {
      const per = overlay.querySelector('#ai-bonus-pericia').value;
      const val = parseInt(overlay.querySelector('#ai-bonus-val').value) || 0;
      if (val !== 0) { bonusList.push({ pericia: per, valor: val }); renderBonusList(); }
    });

    const close = () => overlay.remove();
    overlay.querySelector('#add-item-close').addEventListener('click', close);
    overlay.querySelector('#add-item-cancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#add-item-confirm').addEventListener('click', () => {
      const name   = overlay.querySelector('#ai-name').value.trim();
      if (!name) { overlay.querySelector('#ai-name').focus(); return; }
      const cat    = overlay.querySelector('#ai-cat').value;
      const qty    = parseInt(overlay.querySelector('#ai-qty').value) || 1;
      const peso   = parseFloat(overlay.querySelector('#ai-peso').value) ?? 1;
      const effect = overlay.querySelector('#ai-effect').value.trim();
      const isWeapon = overlay.querySelector('#ai-is-weapon').checked;
      const isProtecao = overlay.querySelector('#ai-is-protecao').checked;

      const target = isEdit ? existingItem : {
        id: uid('itm'), deMissao: !!deMissao, ativo: false,
      };
      target.name = name; target.categoria = cat; target.qty = qty;
      target.peso = peso; target.effect = effect;
      target.categoriaBase = state.baseCat;
      target.pesoBase = state.basePeso;
      target.periciaBonus = [...bonusList];
      target.tipo = isWeapon ? 'arma' : (isProtecao ? 'protecao' : 'geral');

      // Modificações/maldições aplicadas — guardadas de forma estruturada
      // (nome + efeito, já resolvido no momento da escolha) pra aparecer
      // como tags no Inventário sem precisar reabrir o modal.
      if (isWeapon) {
        target.modificacoes = [...state.weaponMods].map(i => ({ name: WEAPON_MODIFICATIONS[i].name, effect: WEAPON_MODIFICATIONS[i].effect }));
        target.maldicoes = [...state.weaponCurses].map(i => ({ name: WEAPON_CURSES[i].name, elemento: WEAPON_CURSES[i].elemento, effect: WEAPON_CURSES[i].effect }));
      } else if (isProtecao) {
        target.modificacoes = [...state.protMods].map(i => ({ name: PROTECTION_MODIFICATIONS[i].name, effect: PROTECTION_MODIFICATIONS[i].effect }));
        target.maldicoes = [...state.protCurses].map(i => ({ name: PROTECTION_CURSES[i].name, elemento: PROTECTION_CURSES[i].elemento, effect: PROTECTION_CURSES[i].effect }));
        target.protecaoPesada = overlay.querySelector('#ai-protecao-pesada').checked;
      } else {
        target.modificacoes = [...state.accMods].map(i => ({ name: ACCESSORY_MODIFICATIONS[i].name, effect: ACCESSORY_MODIFICATIONS[i].effect }));
        target.maldicoes = [...state.accCurses].map(i => ({ name: ACCESSORY_CURSES[i].name, elemento: ACCESSORY_CURSES[i].elemento, effect: ACCESSORY_CURSES[i].effect }));
        delete target.protecaoPesada;
      }

      // Proteção
      if (isProtecao) {
        target.defesaBonus = Math.max(0, parseInt(overlay.querySelector('#ai-protecao-bonus').value) || 0);
        target.defesaBonusBase = state.baseDefesa;
      } else {
        delete target.defesaBonus;
        delete target.defesaBonusBase;
      }

      // Arma — cria, atualiza ou remove o ataque vinculado conforme o toggle
      const hadAttackId = target.linkedAttackId;
      if (isWeapon) {
        const weaponPericia = overlay.querySelector('#ai-weapon-pericia').value;
        const weaponAttr    = PERICIAS.find(p => p.key === weaponPericia)?.attr || 'forca';
        const weaponDamage  = overlay.querySelector('#ai-weapon-damage').value.trim() || '1d6';
        const weaponType    = overlay.querySelector('#ai-weapon-type').value;
        const critRange     = Math.max(2, Math.min(20, parseInt(overlay.querySelector('#ai-weapon-crit-range').value) || 20));
        const critMult      = Math.max(2, Math.min(5,  parseInt(overlay.querySelector('#ai-weapon-crit-mult').value)  || 2));

        let attack = hadAttackId ? sheet.attacks.find(a => a.id === hadAttackId) : null;
        if (!attack) {
          attack = { id: uid('atk'), fromItemId: target.id };
          sheet.attacks.push(attack);
        }
        Object.assign(attack, {
          name, attr: weaponAttr, pericia: weaponPericia, damage: weaponDamage,
          damageType: weaponType, critRange, critMult,
          damageBase: state.baseDamage, critRangeBase: state.baseCritRange, critMultBase: state.baseCritMult,
        });
        target.isWeapon = true;
        target.linkedAttackId = attack.id;
      } else if (hadAttackId) {
        // deixou de ser arma: remove o ataque vinculado
        const atkIdx = sheet.attacks.findIndex(a => a.id === hadAttackId);
        if (atkIdx !== -1) sheet.attacks.splice(atkIdx, 1);
        target.isWeapon = false;
        delete target.linkedAttackId;
      } else {
        target.isWeapon = false;
      }

      if (!isEdit) sheet.items.push(target);
      this._save();
      this._applyItemBonuses(sheet); // re-aplicar todos
      this._renderModal(sheet);
      this._switchSheetTab('inventario');
      if (isEdit) {
        this.onMessage(`"${name}" foi atualizado.`, 'edit');
      } else {
        if (isWeapon) this.onMessage(`"${name}" foi adicionado ao Inventário e à aba Combate.`, 'sword');
        if (isProtecao) this.onMessage(`"${name}" foi adicionado ao Inventário como Proteção (+${target.defesaBonus} Defesa quando equipada).`, 'shield');
      }
      close();
    });
  }

  // ── Modal de Ritual (criar/editar) ────────────────────────
  // Campos seguem o padrão de ficha de Ordem Paranormal: Elemento, Círculo,
  // Execução, Alcance, Área, Alvo, Duração, Efeito, Resistência e os três
  // níveis de dado (Dados / Dados Discente / Dados Verdadeiro), além de
  // uma imagem opcional pra ilustrar o ritual.
  _openRitualModal(sheet, existingRitual, presetSeed) {
    const existingEl = document.getElementById('ritual-modal');
    if (existingEl) existingEl.remove();

    const r = existingRitual || {
      id: uid('rit'), name: '', elemento: 'conhecimento', circulo: 1,
      execucao: 'padrao', alcance: 'pessoal', area: '', alvo: '', duracao: '',
      efeito: '', resistencia: '', dados: '', dadosDiscente: '', dadosVerdadeiro: '',
      imageSrc: null,
      ...(presetSeed ? {
        name: presetSeed.name, elemento: presetSeed.elemento, circulo: presetSeed.circulo,
        efeito: presetSeed.efeito || '',
      } : {}),
    };
    let imageSrc = r.imageSrc || null;
    const isEdit = !!existingRitual;

    const overlay = document.createElement('div');
    overlay.id = 'ritual-modal';
    overlay.className = 'modal-backdrop';
    overlay.innerHTML = `
      <div class="modal ritual-modal-box">
        <div class="modal-header">
          <h3>${icon('orb')} ${isEdit ? 'Editar Ritual' : 'Novo Ritual'}</h3>
          <button class="modal-close" id="rit-close">${icon('close')}</button>
        </div>
        <div class="modal-body add-item-body">
          <div class="add-item-row">
            <label>Nome*</label>
            <input id="rit-name" type="text" placeholder="Nome do ritual" value="${escAttr(r.name)}"/>
          </div>
          <div class="add-item-row multi-col">
            <div>
              <label>Elemento</label>
              <select id="rit-elemento">
                ${RITUAL_ELEMENTOS.map(e => `<option value="${e.key}" ${e.key===r.elemento?'selected':''}>${e.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label>Círculo</label>
              <select id="rit-circulo">
                ${RITUAL_CIRCULOS.map(c => `<option value="${c}" ${c===r.circulo?'selected':''}>${c}º</option>`).join('')}
              </select>
            </div>
            <div>
              <label>Execução</label>
              <select id="rit-execucao">
                ${RITUAL_EXECUCOES.map(e => `<option value="${e.key}" ${e.key===r.execucao?'selected':''}>${e.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label>Alcance</label>
              <select id="rit-alcance">
                ${RITUAL_ALCANCES.map(e => `<option value="${e.key}" ${e.key===r.alcance?'selected':''}>${e.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="add-item-row multi-col">
            <div>
              <label>Área</label>
              <input id="rit-area" type="text" placeholder="Ex: Esfera 9m" value="${escAttr(r.area||'')}"/>
            </div>
            <div>
              <label>Alvo</label>
              <input id="rit-alvo" type="text" placeholder="Ex: Um alvo" value="${escAttr(r.alvo||'')}"/>
            </div>
            <div>
              <label>Duração</label>
              <input id="rit-duracao" type="text" placeholder="Ex: Instantânea" value="${escAttr(r.duracao||'')}"/>
            </div>
          </div>
          <div class="add-item-row multi-col">
            <div style="flex:2 1 200px">
              <label>Efeito</label>
              <input id="rit-efeito" type="text" placeholder="Descrição do efeito" value="${escAttr(r.efeito||'')}"/>
            </div>
            <div>
              <label>Resistência</label>
              <input id="rit-resistencia" type="text" placeholder="Ex: Fortitude" value="${escAttr(r.resistencia||'')}"/>
            </div>
          </div>
          <div class="add-item-row multi-col">
            <div>
              <label>Dados</label>
              <input id="rit-dados" type="text" placeholder="Ex: 2d6" value="${escAttr(r.dados||'')}"/>
            </div>
            <div>
              <label>Dados Discente</label>
              <input id="rit-dados-discente" type="text" placeholder="Ex: 3d6" value="${escAttr(r.dadosDiscente||'')}"/>
            </div>
            <div>
              <label>Dados Verdadeiro</label>
              <input id="rit-dados-verdadeiro" type="text" placeholder="Ex: 4d6" value="${escAttr(r.dadosVerdadeiro||'')}"/>
            </div>
          </div>
          <div class="add-item-row">
            <label>Imagem</label>
            <div class="ritual-image-pick">
              <div class="ritual-image-thumb" id="rit-image-thumb">
                ${imageSrc ? `<img src="${imageSrc}" alt=""/>` : icon('image','',22)}
              </div>
              <input type="file" id="rit-image-input" accept="image/*" class="hidden"/>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="rit-cancel">Cancelar</button>
          <button class="btn-primary" id="rit-confirm">${isEdit ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const thumb = overlay.querySelector('#rit-image-thumb');
    const fileInput = overlay.querySelector('#rit-image-input');
    thumb.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        imageSrc = reader.result;
        thumb.innerHTML = `<img src="${imageSrc}" alt=""/>`;
      };
      reader.readAsDataURL(file);
    });

    const close = () => overlay.remove();
    overlay.querySelector('#rit-close').addEventListener('click', close);
    overlay.querySelector('#rit-cancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#rit-confirm').addEventListener('click', () => {
      const name = overlay.querySelector('#rit-name').value.trim();
      if (!name) { overlay.querySelector('#rit-name').focus(); return; }

      Object.assign(r, {
        name,
        elemento:        overlay.querySelector('#rit-elemento').value,
        circulo:         parseInt(overlay.querySelector('#rit-circulo').value) || 1,
        execucao:        overlay.querySelector('#rit-execucao').value,
        alcance:         overlay.querySelector('#rit-alcance').value,
        area:            overlay.querySelector('#rit-area').value.trim(),
        alvo:            overlay.querySelector('#rit-alvo').value.trim(),
        duracao:         overlay.querySelector('#rit-duracao').value.trim(),
        efeito:          overlay.querySelector('#rit-efeito').value.trim(),
        resistencia:     overlay.querySelector('#rit-resistencia').value.trim(),
        dados:           overlay.querySelector('#rit-dados').value.trim(),
        dadosDiscente:   overlay.querySelector('#rit-dados-discente').value.trim(),
        dadosVerdadeiro: overlay.querySelector('#rit-dados-verdadeiro').value.trim(),
        imageSrc,
      });

      if (!isEdit) sheet.rituais.push(r);
      this._save();
      this._renderModal(sheet);
      this._switchSheetTab('rituais');
      this.onMessage(`"${name}" foi ${isEdit ? 'atualizado' : 'adicionado'} aos Rituais de ${sheet.name}.`, 'orb');
      close();
    });
  }

  // ── Seletor de predefinições (Rituais / Habilidades / Poderes) ──
  // Modal genérico: lista agrupada e pesquisável de itens pré-definidos
  // do livro, com um botão para criar algo personalizado/homebrew caso
  // a pessoa não encontre o que precisa (ou queira inventar o próprio).
  _openPresetPicker(sheet, { title, icon: pickerIcon = 'book', groups, onPick, onCustom }) {
    const existingEl = document.getElementById('preset-picker-modal');
    if (existingEl) existingEl.remove();

    const overlay = document.createElement('div');
    overlay.id = 'preset-picker-modal';
    overlay.className = 'modal-backdrop ui-dialog-backdrop';
    overlay.innerHTML = `
      <div class="modal preset-picker-box">
        <div class="modal-header">
          <h3>${icon(pickerIcon)} ${title}</h3>
          <button class="modal-close" id="pp-close">${icon('close')}</button>
        </div>
        <div class="modal-body preset-picker-body">
          <input type="text" id="pp-search" class="ui-dialog-input" placeholder="Buscar por nome..."/>
          <div class="preset-picker-list" id="pp-list">
            ${groups.map((g, gi) => `
              <div class="preset-picker-group" data-group="${gi}">
                <div class="preset-picker-group-label">${g.label}</div>
                ${g.items.map((it, ii) => `
                  <button class="preset-picker-item" data-group="${gi}" data-idx="${ii}" data-search="${escAttr((it.name + ' ' + (it.efeito||it.desc||'')).toLowerCase())}">
                    <span class="preset-picker-item-name">${escAttr(it.name)}</span>
                    <span class="preset-picker-item-desc">${escAttr(it.efeito || it.desc || '')}</span>
                  </button>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="pp-custom">${icon('edit')} Criar Personalizado</button>
          <button class="btn-secondary" id="pp-cancel">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#pp-close').addEventListener('click', close);
    overlay.querySelector('#pp-cancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#pp-custom').addEventListener('click', () => { close(); onCustom(); });

    overlay.querySelectorAll('.preset-picker-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const gi = parseInt(btn.dataset.group);
        const ii = parseInt(btn.dataset.idx);
        const item = groups[gi].items[ii];
        close();
        onPick(item);
      });
    });

    const search = overlay.querySelector('#pp-search');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      overlay.querySelectorAll('.preset-picker-item').forEach(btn => {
        btn.classList.toggle('hidden', !!q && !btn.dataset.search.includes(q));
      });
      overlay.querySelectorAll('.preset-picker-group').forEach(g => {
        const anyVisible = [...g.querySelectorAll('.preset-picker-item')].some(b => !b.classList.contains('hidden'));
        g.classList.toggle('hidden', !anyVisible);
      });
    });
    search.focus();
  }

  _openRitualPicker(sheet) {
    const CIRCULOS = [1, 2, 3, 4];
    const ELEMENTOS = ['conhecimento', 'energia', 'morte', 'sangue', 'medo'];
    const groups = [];
    CIRCULOS.forEach(c => {
      ELEMENTOS.forEach(el => {
        const items = RITUAL_PRESETS.filter(r => r.circulo === c && r.elemento === el);
        if (items.length) groups.push({ label: `${c}º Círculo — ${ritualElementoLabel(el)} (${CUSTO_POR_CIRCULO[c]} PE)`, items });
      });
    });
    this._openPresetPicker(sheet, {
      title: 'Escolher Ritual', icon: 'orb', groups,
      onPick: preset => this._openRitualModal(sheet, null, preset),
      onCustom: () => this._openRitualModal(sheet, null),
    });
  }

  _openHabilidadePicker(sheet) {
    const groups = [];

    groups.push({ label: `${icon('sparkle')} Poderes Paranormais (gerais)`, items: PODER_PARANORMAL_PRESETS });

    const classeKey = normalize(sheet.classe);
    ['combatente', 'especialista', 'ocultista'].forEach(c => {
      const label = `${icon('swords')} Poder de ${c.charAt(0).toUpperCase()+c.slice(1)}` + (c === classeKey ? ' (sua classe)' : '');
      groups.push({ label, items: PODER_CLASSE_PRESETS[c] });
    });

    ['combatente', 'especialista', 'ocultista'].forEach(c => {
      const items = TRILHA_PODER_PRESETS[c].map(p => ({ name: `${p.name} (${p.trilha}, NEX ${p.nex}%)`, efeito: p.efeito }));
      groups.push({ label: `${icon('trail')} Poder de Trilha — ${c.charAt(0).toUpperCase()+c.slice(1)}`, items });
    });

    this._openPresetPicker(sheet, {
      title: 'Escolher Habilidade/Poder', icon: 'sparkle', groups,
      onPick: preset => {
        sheet.habilidades.push({ id: uid('hab'), name: preset.name, tipo: 'passiva', custo: 0, desc: preset.efeito || preset.desc || '' });
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('habilidades');
        this.onMessage(`"${preset.name}" foi adicionado às Habilidades de ${sheet.name}.`, 'sparkle');
      },
      onCustom: () => {
        sheet.habilidades.push({ id: uid('hab'), name: 'Nova Habilidade', tipo: 'passiva', custo: 0, desc: '' });
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('habilidades');
      },
    });
  }

  // ── Eventos do modal ──────────────────────────────────────
  _bindModalEvents(sheet) {
    const body = document.getElementById('sheet-body');

    // Tabs internas da ficha
    body.querySelectorAll('.sheet-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this._switchSheetTab(btn.dataset.tab));
    });

    // Campos genéricos [data-sf]
    body.querySelectorAll('[data-sf]').forEach(el => {
      const key = el.dataset.sf;
      const save = () => {
        let needsFullRerender = false;
        switch(key) {
          case 'name':    sheet.name    = el.value.trim() || sheet.name; break;
          case 'classe':  sheet.classe  = el.value; needsFullRerender = true; break;
          case 'trilha':  sheet.trilha  = el.value; break;
          case 'origem':  sheet.origem  = el.value; break;
          case 'jogador': sheet.jogador = el.value; break;
          case 'nex':     sheet.nex     = parseInt(el.value) || 5; needsFullRerender = true; break;
          case 'xp':      sheet.xp      = parseInt(el.value) || 0; break;
          case 'hpCur':   sheet.hp.current = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'hp',sheet.hp,sheet); break;
          case 'hpMax':   sheet.hp.max     = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'hp',sheet.hp,sheet); break;
          case 'sanCur':  sheet.san.current = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'san',sheet.san,sheet); break;
          case 'sanMax':  sheet.san.max     = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'san',sheet.san,sheet); break;
          case 'pdCur':   sheet.pd.current = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'pd',sheet.pd,sheet); break;
          case 'pdMax':   sheet.pd.max     = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'pd',sheet.pd,sheet); break;
          case 'peCur':   sheet.pe.current = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'pe',sheet.pe,sheet); break;
          case 'peMax':   sheet.pe.max     = Math.max(0, parseInt(el.value)||0); this._updateResBar(body,'pe',sheet.pe,sheet); break;
          case 'bonusDefesa':
            sheet.bonusDefesa = Math.max(0, parseInt(el.value)||0);
            this._updateDefEsqvDisplay(sheet);
            break;
          case 'notas':   sheet.notas   = el.value; break;
          case 'deslocamento': sheet.deslocamento = Math.max(0, parseInt(el.value)||0); break;
          case 'resistencias': sheet.resistencias = el.value; break;
          case 'resmode':
            sheet.pdMode = (el.value === 'pd');
            needsFullRerender = true;
            break;
          case 'token':
            const newId = el.value || null;
            if (sheet.tokenId && sheet.tokenId !== newId)
              this.tokenMgr.applyExternalStats(sheet.tokenId, { sheetId: null });
            sheet.tokenId = newId;
            if (newId) this.tokenMgr.applyExternalStats(newId, { sheetId: sheet.id });
            break;
        }
        if (key === 'classe' || key === 'nex' || key === 'resmode') this._recalcResources(sheet);
        this._save();
        this._pushToToken(sheet);
        this._renderList();
        if (needsFullRerender) this._renderModal(sheet);
      };
      el.addEventListener('change', save);
      if (el.tagName === 'TEXTAREA' || el.classList.contains('res-cur') || el.classList.contains('res-max')) el.addEventListener('input', save);
    });

    // Bolinhas de marca (risco de morte/colapso) — liga o clique das que já
    // aparecem renderizadas de cara, caso PV/SAN/PD já estejam zerados.
    this._bindResMarks(body, 'hp',  sheet.hp,  sheet);
    this._bindResMarks(body, 'san', sheet.san, sheet);
    this._bindResMarks(body, 'pd',  sheet.pd,  sheet);

    // Atributos — editar valor
    body.querySelectorAll('.attr-val-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const key    = inp.dataset.attr;
        const parsed = parseInt(inp.value);
        // 0 é um valor válido (atributo zerado) — não pode virar 1 aqui.
        const val = Number.isNaN(parsed) ? 1 : Math.max(0, Math.min(10, parsed));
        sheet.attrs[key] = val;
        // Atualizar label Nd20 (mostra "2d20 (pior)" quando zerado, já
        // considerando penalidade de dados de condições ativas)
        const effVal = val + getConditionRollPenalty(sheet.conditions, { attrKey: key });
        const block = inp.closest('.attr-block-op');
        block.querySelector('.attr-dice-label').textContent = diceLabel(effVal);
        block.querySelector('.attr-roll-btn').title = `Rolar ${diceLabel(effVal)}`;
        // Atualizar perícias linkadas (re-render não feito para não perder foco)
        // Se mudou Agilidade, recalcular Defesa e Esquiva em tempo real
        if (key === 'agilidade') this._updateDefEsqvDisplay(sheet);
      });
      inp.addEventListener('change', () => {
        this._save();
        const changed = this._recalcResources(sheet);
        if (changed) this._renderModal(sheet);
      });
      inp.addEventListener('click', e => e.stopPropagation());
    });

    // Atributos — rolar Nd20
    body.querySelectorAll('.attr-roll-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key  = btn.dataset.attr;
        const attr = ATTR_MAP[key];
        const base = getAttrVal(sheet, key);
        const n    = base + getConditionRollPenalty(sheet.conditions, { attrKey: key });
        this._doAttrRoll(sheet, attr, n);
      });
    });

    // Perícias — treino (pips) e rolar
    this._bindTreinoEvents(body, sheet);
    this._bindPericiaEvents(body, sheet);

    // Botões +adicionar
    body.querySelectorAll('.btn-add-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.add;
        if (kind === 'attack')
          sheet.attacks.push({ id: uid('atk'), name: 'Novo Ataque', attr: 'forca', pericia: 'luta', damage: '1d6', damageType: 'Corte', critRange: 20, critMult: 2 });
        else if (kind === 'ritual')
          return this._openRitualPicker(sheet);
        else if (kind === 'habilidade')
          return this._openHabilidadePicker(sheet);
        else if (kind === 'item-armazem')
          return this._openAddItemModal(sheet, false);
        else if (kind === 'item-missao')
          return this._openAddItemModal(sheet, true);
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab(kind === 'attack' ? 'combate' : kind === 'ritual' ? 'rituais' : kind === 'habilidade' ? 'habilidades' : 'inventario');
      });
    });

    // Linhas de combate/rituais/habilidades
    this._bindRows(body, sheet, 'sf-attacks',     sheet.attacks,     'attack');
    this._bindRitualRows(body, sheet);
    this._bindRows(body, sheet, 'sf-habilidades',  sheet.habilidades, 'habilidade');

    // Inventário — eventos especiais
    this._bindInventoryEvents(body, sheet);

    // Foto do personagem + versões do token
    this._bindPersonagemExtras(body, sheet);

    // PP — atualizar painel ao mudar
    body.querySelector('[data-sf="pp"]')?.addEventListener('input', () => {
      const val = parseInt(body.querySelector('[data-sf="pp"]').value) || 0;
      sheet.pp = val;
      this._save();
      this._refreshInventoryPanel(sheet);
      this._renderList();
    });

    // Condições ativas — badges + seletor
    this._bindConditionsBar(body, sheet);
  }

  // ── Foto do personagem + versões do token (Bloco 6 — extras) ──
  _bindPersonagemExtras(body, sheet) {
    // Foto do personagem
    const photoBtn   = body.querySelector('#sf-photo-btn');
    const photoInput = body.querySelector('#sf-photo-input');
    const photoImg   = body.querySelector('#sf-photo-img');
    const photoPh    = body.querySelector('#sf-photo-placeholder');
    const photoRemove = body.querySelector('#sf-photo-remove');

    photoBtn?.addEventListener('click', () => photoInput.click());
    photoInput?.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        sheet.photo = reader.result;
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('personagem');
        this._renderList();
      };
      reader.readAsDataURL(file);
    });
    photoRemove?.addEventListener('click', () => {
      sheet.photo = null;
      this._save();
      this._renderModal(sheet);
      this._switchSheetTab('personagem');
      this._renderList();
    });

    // Versões do token (adicionar via botões rápidos)
    body.querySelectorAll('[data-add-variant]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const presetLabel = btn.dataset.addVariant;
        const label = presetLabel || (await uiPrompt('Nome da versão (ex: Ferido, Disfarçado...):', '', { title: 'Nova Versão do Token' })) || '';
        if (!label.trim() && !presetLabel) return;
        sheet.tokenVariants.push({ id: uid('var'), label: label.trim() || 'Versão', imageSrc: null });
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('personagem');
      });
    });

    // Upload de imagem por versão + edição de nome + remoção
    const variantInput = body.querySelector('#sf-variant-input');
    let uploadTargetId = null;

    body.querySelectorAll('[data-variant-upload]').forEach(btn => {
      btn.addEventListener('click', () => {
        uploadTargetId = btn.dataset.variantUpload;
        variantInput.click();
      });
    });
    variantInput?.addEventListener('change', () => {
      const file = variantInput.files[0];
      if (!file || !uploadTargetId) return;
      const variant = sheet.tokenVariants.find(v => v.id === uploadTargetId);
      if (!variant) return;
      const reader = new FileReader();
      reader.onload = () => {
        variant.imageSrc = reader.result;
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('personagem');
      };
      reader.readAsDataURL(file);
      variantInput.value = '';
    });

    body.querySelectorAll('.token-variant-label').forEach(inp => {
      inp.addEventListener('change', () => {
        const row = inp.closest('.token-variant-row');
        const variant = sheet.tokenVariants.find(v => v.id === row.dataset.variantId);
        if (variant) { variant.label = inp.value.trim() || variant.label; this._save(); }
      });
    });

    body.querySelectorAll('[data-variant-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        sheet.tokenVariants = sheet.tokenVariants.filter(v => v.id !== btn.dataset.variantDel);
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('personagem');
      });
    });
  }

  // Chamado pelo TokenManager ao abrir o submenu "Versão do Token" do
  // menu de contexto — retorna as versões cadastradas na ficha vinculada
  // (só as que já têm imagem definida) ou null se não houver ficha/versão.
  getVariantsForToken(token) {
    if (!token?.sheetId) return null;
    const sheet = this._find(token.sheetId);
    if (!sheet) return null;
    const withImage = sheet.tokenVariants.filter(v => v.imageSrc);
    return withImage.length ? withImage : null;
  }

  // ── Eventos do inventário ─────────────────────────────────
  _bindInventoryEvents(body, sheet) {
    const container = body.querySelector('#sf-items');
    if (!container) return;

    container.querySelectorAll('.item-row').forEach(row => {
      const id   = row.dataset.id;
      const item = sheet.items.find(x => x.id === id);
      if (!item) return;

      // Toggle equipar/ativar
      const toggleBtn = row.querySelector('[data-item-toggle]');
      toggleBtn?.addEventListener('click', () => {
        item.ativo = !item.ativo;
        this._applyItemBonuses(sheet);
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('inventario');
      });

      // Nome
      row.querySelector('.item-name-inp')?.addEventListener('change', e => {
        item.name = e.target.value.trim() || item.name;
        this._save();
      });

      // Quantidade
      row.querySelector('.item-qty')?.addEventListener('change', e => {
        item.qty = Math.max(0, parseInt(e.target.value) || 0);
        this._save();
        this._refreshInventoryPanel(sheet);
      });

      // Efeito
      row.querySelector('.item-effect-inp')?.addEventListener('change', e => {
        item.effect = e.target.value.trim();
        this._save();
      });

      // Editar (reabre o modal completo pré-preenchido)
      row.querySelector('.row-edit')?.addEventListener('click', () => {
        this._openAddItemModal(sheet, item.deMissao, item);
      });

      // Deletar
      row.querySelector('.row-del')?.addEventListener('click', () => {
        item.ativo = false;
        this._applyItemBonuses(sheet);
        const idx = sheet.items.indexOf(item);
        if (idx !== -1) sheet.items.splice(idx, 1);
        // Item era uma arma vinculada a um ataque? Remove o ataque também.
        if (item.linkedAttackId) {
          const atkIdx = sheet.attacks.findIndex(a => a.id === item.linkedAttackId);
          if (atkIdx !== -1) sheet.attacks.splice(atkIdx, 1);
        }
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('inventario');
      });

      // Usar item (consumível)
      row.querySelector('[data-roll="item"]')?.addEventListener('click', async () => {
        const ok = await uiConfirm(`Usar "${item.name}"?`, { title: 'Usar Item', okText: 'Usar' });
        if (!ok) return;

        const efeito = item.effect || '';

        // Detectar cura de PV: "+2d6 PV", "+10 PV", "cura 1d6+2"
        const pvMatch = efeito.match(/\+?(\d+(?:d\d+)?(?:[+-]\d+)?)\s*pv/i);
        if (pvMatch) {
          const r = rollFormulaSafe(pvMatch[1]);
          const cura = r ? r.total : parseInt(pvMatch[1]) || 0;
          sheet.hp.current = Math.min(sheet.hp.max, sheet.hp.current + cura);
          this._pushToToken(sheet);
          this.onMessage(`${sheet.name} usou ${item.name} → curou ${cura} PV (${sheet.hp.current}/${sheet.hp.max})`, 'flask');
        } else {
          this.onMessage(`${sheet.name} usou ${item.name}${efeito ? ' — ' + efeito : ''}`, 'flask');
        }

        // Consumir quantidade
        if (item.qty > 0) item.qty--;
        if (item.qty <= 0) {
          item.ativo = false;
          this._applyItemBonuses(sheet);
          this.onMessage(`"${item.name}" acabou e foi removido do inventário.`, 'warning');
          const idx = sheet.items.indexOf(item);
          if (idx !== -1) sheet.items.splice(idx, 1);
        }

        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('inventario');
      });
    });
  }

  // Aplica/remove todos os bônus de itens ativos nas perícias
  // Zera bônus de itens primeiro, depois aplica os ativos
  _applyItemBonuses(sheet) {
    // Zerar todos os bônus de item nas perícias
    for (const key of Object.keys(sheet.pericias)) {
      sheet.pericias[key].bonusItem = 0;
    }
    // Re-aplicar bônus de itens ativos
    for (const item of sheet.items) {
      if (!item.ativo || !item.periciaBonus?.length) continue;
      for (const b of item.periciaBonus) {
        if (!sheet.pericias[b.pericia]) continue;
        sheet.pericias[b.pericia].bonusItem = (sheet.pericias[b.pericia].bonusItem || 0) + b.valor;
      }
    }
    // Atualizar campo extra nas perícias (bonusItem sobrescreve o campo "extra" da interface)
    // O campo "extra" no periciaRow já lê bonusItem+extra juntos — salvar separado
    this._save();
  }

  // Atualiza o painel fixo de patente/carga sem re-renderizar o modal inteiro
  _refreshInventoryPanel(sheet) {
    const panel = document.querySelector('.inv-patent-panel');
    if (!panel) return;
    const forca    = sheet.attrs?.forca ?? 1;
    const cargaMax = calcCarga(forca);
    const usado    = calcEspacosUsados(sheet.items);
    const sobrec   = usado > cargaMax;
    const limiteMx = cargaMax * 2;
    const pat      = getPatente(sheet.pp);
    const catUso   = calcCatUsage(sheet.items);

    // Atualizar badge de patente
    const badge = panel.querySelector('.inv-patente-badge');
    if (badge) badge.textContent = pat.nome;

    // Atualizar células de categoria
    panel.querySelectorAll('.inv-cat-cell').forEach((cell, i) => {
      const c   = CAT_LABELS[i];
      const lim = pat.limites[i - 1] ?? null;
      const uso = catUso[c] || 0;
      const over = i > 0 && lim !== null && uso > lim;
      cell.className = `inv-cat-cell ${over ? 'over' : ''}`;
      const valEl = cell.querySelector('.inv-cat-val');
      if (valEl) valEl.innerHTML = `${uso}${lim !== null && i > 0 ? `<span>/${lim}</span>` : '<span>/∞</span>'}`;
    });

    // Atualizar barra e números de carga
    const bar = panel.querySelector('.inv-carga-bar');
    if (bar) {
      bar.style.width = Math.min(100, (usado / limiteMx) * 100) + '%';
      bar.className = `inv-carga-bar ${sobrec ? 'sobrec' : ''}`;
    }
    const nums = panel.querySelector('.inv-carga-nums');
    if (nums) {
      nums.className = `inv-carga-nums ${sobrec ? 'sobrec' : ''}`;
      nums.innerHTML = `${usado} / ${cargaMax} espaços${sobrec ? ' ' + icon('warning','icon-warning') + ' sobrecarregado' : ''}`;
    }
    const cargamaxEl = panel.querySelector('.inv-cargamax-val');
    if (cargamaxEl) cargamaxEl.innerHTML = `${cargaMax} <span class="inv-hint">/ ${limiteMx} sobrec.</span>`;

    // Crédito
    const credEl = panel.querySelector('.inv-credito-badge');
    if (credEl) credEl.textContent = pat.credito;
  }

  // Atualiza os displays de Defesa e Esquiva sem re-renderizar o modal inteiro.
  // Chamado sempre que AGI, bonusDefesa, Reflexos treino ou Reflexos extra mudarem.
  _updateDefEsqvDisplay(sheet) {
    const defVal  = calcDefesa(sheet);
    const esqvVal = calcEsquiva(sheet);
    const refData = sheet.pericias['reflexos'] || { treino: 0, extra: 0 };
    const refTrei = TREINO_BONUS[refData.treino] || 0;
    const refExt  = refData.extra || 0;
    const agi     = getAttrVal(sheet, 'agilidade');
    const bonus   = sheet.bonusDefesa || 0;

    const defDisp = document.getElementById('sf-defesa-display');
    const esqDisp = document.getElementById('sf-esquiva-display');

    if (defDisp) {
      defDisp.textContent = defVal;
      const fml = defDisp.nextElementSibling;
      if (fml) fml.textContent = `10 + AGI(${agi}) + bônus(${bonus}) + proteção(${calcProtecaoAtiva(sheet.items).bonus})`;
    }
    if (esqDisp) {
      esqDisp.textContent = esqvVal;
      const fml = esqDisp.nextElementSibling;
      if (fml) fml.textContent = `DEF(${defVal}) + Reflexos(${refTrei + refExt})`;
      const hint = esqDisp.closest('.res-block-def')?.querySelector('.def-hint');
      if (hint) hint.textContent = `Treino: ${refTrei} · Extra: ${refExt}`;
    }
  }

  // Re-renderiza só a lista de perícias (preserva a aba/rolagem atual)
  // e rebinda os eventos, já que innerHTML novo não carrega os listeners.
  _rerenderPericiasList(body, sheet) {
    const tabEl = body.querySelector('.sheet-tab-content[data-tab="pericias"]');
    if (!tabEl) return;
    tabEl.querySelector('.pericias-list').innerHTML =
      PERICIAS.map(p => this._periciaRow(p, sheet)).join('');
    this._bindTreinoEvents(body, sheet);
    this._bindPericiaEvents(body, sheet);
  }

  // Chamado junto com _rerenderPericiasList sempre que um atributo de
  // perícia é trocado (ex: Luta com AGI em vez de FOR) — sem isso, a
  // dica "Rola com Luta (FOR)" na aba Combate ficava com o atributo
  // antigo até a ficha ser fechada e reaberta.
  _rerenderAttacksList(body, sheet) {
    const tabEl = body.querySelector('.sheet-tab-content[data-tab="combate"]');
    if (!tabEl) return;
    const container = tabEl.querySelector('#sf-attacks');
    if (!container) return;
    container.innerHTML = sheet.attacks.length
      ? sheet.attacks.map(a => this._attackRow(a, sheet)).join('')
      : '<div class="empty-row">Nenhum ataque cadastrado.</div>';
    this._bindRows(body, sheet, 'sf-attacks', sheet.attacks, 'attack');
  }

  // Pips de treino (T/V/E). Precisa ser rechamado sempre que o HTML dos
  // pips for recriado, senão os botões ficam "mortos" (era o bug relatado
  // de precisar sair e voltar da ficha para o clique funcionar de novo).
  _bindTreinoEvents(body, sheet) {
    body.querySelectorAll('.treino-pip').forEach(pip => {
      pip.addEventListener('click', () => {
        const key = pip.dataset.pericia;
        const t   = parseInt(pip.dataset.t);
        const cur = sheet.pericias[key].treino;
        // Toggle: se já é esse nível, volta a 0; senão vai até esse nível
        sheet.pericias[key].treino = (cur === t) ? 0 : t;
        this._save();
        this._rerenderPericiasList(body, sheet);
        // Se mudou Reflexos, atualizar Esquiva automaticamente
        if (key === 'reflexos') this._updateDefEsqvDisplay(sheet);
      });
    });
  }

  _bindPericiaEvents(body, sheet) {
    body.querySelectorAll('.pericia-roll-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key     = btn.dataset.pericia;
        const p       = PERICIAS.find(x => x.key === key);
        const perData = sheet.pericias[key] || { treino: 0, extra: 0, attrOverride: null };
        const attrKey = getPericiaAttrKey(sheet, p);
        const attrVal = getAttrVal(sheet, attrKey) + getConditionRollPenalty(sheet.conditions, { attrKey, periciaKey: key });
        const treinoB = TREINO_BONUS[perData.treino] || 0;
        const bonus   = treinoB + (perData.extra || 0) + (perData.bonusItem || 0);
        this._doPericiaRoll(sheet, p.label, attrVal, bonus, perData.treino, attrKey, p.attr, key);
      });
    });

    // Trocar o atributo usado na rolagem desta perícia (ex: Luta com
    // Agilidade em vez de Força, lutando de katana).
    body.querySelectorAll('.pericia-attr-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const key = sel.dataset.pericia;
        const p   = PERICIAS.find(x => x.key === key);
        if (!sheet.pericias[key]) sheet.pericias[key] = { treino: 0, extra: 0, attrOverride: null };
        // Se voltou ao atributo padrão da perícia, limpa o override
        // (deixa o dado salvo mais limpo, mas funciona igual de qualquer jeito).
        sheet.pericias[key].attrOverride = (sel.value === p.attr) ? null : sel.value;
        this._save();
        this._rerenderPericiasList(body, sheet);
        this._rerenderAttacksList(body, sheet);
      });
      sel.addEventListener('click', e => e.stopPropagation());
    });

    // Bônus extra (itens, talentos...) — só soma ao resultado, não rola dado a mais
    body.querySelectorAll('.pericia-extra').forEach(inp => {
      inp.addEventListener('change', () => {
        const key = inp.dataset.pericia;
        const val = parseInt(inp.value) || 0;
        sheet.pericias[key].extra = val;
        this._save();
        // Atualiza só o texto do total, sem recriar a linha (mantém o foco)
        const row = inp.closest('.pericia-row');
        const p   = PERICIAS.find(x => x.key === key);
        if (row && p) {
          const attrKey  = getPericiaAttrKey(sheet, p);
          const attrVal  = getAttrVal(sheet, attrKey);
          const treinoB  = TREINO_BONUS[sheet.pericias[key].treino] || 0;
          const totalBns = treinoB + val;
          const totalEl  = row.querySelector('.pericia-total');
          if (totalEl) totalEl.textContent = `${diceLabel(attrVal)}${totalBns ? ' ' + signed(totalBns) : ''}`;
        }
        // Se mudou bônus extra de Reflexos, atualizar Esquiva
        if (key === 'reflexos') this._updateDefEsqvDisplay(sheet);
      });
      inp.addEventListener('click', e => e.stopPropagation());
    });
  }

  // Rituais têm um card próprio (imagem, tags, 3 níveis de dado) em vez do
  // padrão de linha genérica usado por ataques/habilidades — por isso ganham
  // seu próprio binder em vez de passar por _bindRows.
  _bindRitualRows(body, sheet) {
    const container = body.querySelector('#sf-rituais');
    if (!container) return;

    container.querySelectorAll('.ritual-card').forEach(card => {
      const id = card.dataset.id;
      const r  = sheet.rituais.find(x => x.id === id);
      if (!r) return;

      card.querySelector('.ritual-edit-btn')?.addEventListener('click', () => {
        this._openRitualModal(sheet, r);
      });

      card.querySelector('.row-del')?.addEventListener('click', () => {
        const idx = sheet.rituais.indexOf(r);
        if (idx !== -1) sheet.rituais.splice(idx, 1);
        this._save();
        this._renderModal(sheet);
        this._switchSheetTab('rituais');
      });

      card.querySelectorAll('.ritual-dice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const formula = btn.dataset.ritualDice;
          const result = rollFormulaSafe(formula);
          if (!result) return;
          this.onRoll(result);
          this.onDiceMessage(sheet.name, `lançou "${r.name}" (${btn.textContent}) → ${result.total} (${formula})`, 'orb', result);
        });
      });
    });
  }


  _bindRows(body, sheet, containerId, list, kind) {
    const container = body.querySelector(`#${containerId}`);
    if (!container) return;

    container.querySelectorAll('.sheet-row').forEach(row => {
      const id   = row.dataset.id;
      const item = list.find(x => x.id === id);
      if (!item) return;

      const save = () => this._save();

      row.querySelector('.row-name')?.addEventListener('change', e => { item.name = e.target.value.trim() || item.name; save(); });
      row.querySelector('.row-formula')?.addEventListener('change', e => {
        if (kind === 'attack' || kind === 'ritual') item.damage = e.target.value.trim();
        if (kind === 'item')                        item.effect = e.target.value.trim();
        save();
      });
      row.querySelector('.row-attr')?.addEventListener('change', e => {
        if (kind === 'ritual') item.tipo = e.target.value;
        if (kind === 'habilidade') item.tipo = e.target.value;
        save();
      });
      row.querySelector('.row-pericia')?.addEventListener('change', e => {
        if (kind === 'attack') {
          item.pericia = e.target.value;
          item.attr = PERICIAS.find(p => p.key === item.pericia)?.attr || 'forca';
          save();
          this._renderModal(sheet);
          this._switchSheetTab('combate');
        }
      });
      row.querySelector('.row-cost')?.addEventListener('change', e => { item.cost = parseInt(e.target.value)||0; save(); });
      row.querySelector('.row-num')?.addEventListener('change', e => {
        if (kind === 'item') item.qty = Math.max(0, parseInt(e.target.value)||0);
        if (kind === 'habilidade') item.custo = Math.max(0, parseInt(e.target.value)||0);
        if (kind === 'ritual') item.cost = Math.max(0, parseInt(e.target.value)||0);
        save();
      });
      row.querySelector('.row-text')?.addEventListener('change', e => { item.alcance = e.target.value.trim(); save(); });
      row.querySelector('.habilidade-desc')?.addEventListener('change', e => { item.desc = e.target.value; save(); });

      // Campos de arma/crítico (só existem em ataques)
      row.querySelector('.attack-dmg-type')?.addEventListener('change', e => { item.damageType = e.target.value; save(); });
      row.querySelector('.attack-crit-range')?.addEventListener('change', e => {
        item.critRange = Math.max(2, Math.min(20, parseInt(e.target.value) || 20));
        e.target.value = item.critRange;
        save();
      });
      row.querySelector('.attack-crit-mult')?.addEventListener('change', e => {
        item.critMult = Math.max(2, Math.min(5, parseInt(e.target.value) || 2));
        e.target.value = item.critMult;
        save();
      });

      row.querySelector('.row-del')?.addEventListener('click', () => {
        const idx = list.indexOf(item);
        if (idx !== -1) list.splice(idx, 1);
        save();
        this._renderModal(sheet);
        this._switchSheetTab(kind === 'attack' ? 'combate' : kind === 'ritual' ? 'rituais' : kind === 'habilidade' ? 'habilidades' : 'inventario');
      });

      // Botão principal de ação
      row.querySelector('[data-roll="attack"]')?.addEventListener('click', () => {
        const periciaKey = item.pericia || 'luta';
        const p          = PERICIAS.find(x => x.key === periciaKey) || PERICIAS.find(x => x.key === 'luta');
        const perData    = sheet.pericias[periciaKey] || { treino: 0, extra: 0, attrOverride: null };
        const attrKey    = getPericiaAttrKey(sheet, p);
        const attrVal    = getAttrVal(sheet, attrKey)
          + getConditionRollPenalty(sheet.conditions, { attrKey, periciaKey })
          + getConditionAtkPenalty(sheet.conditions);
        const treinoB    = TREINO_BONUS[perData.treino] || 0;
        const bonus      = treinoB + (perData.extra || 0) + (perData.bonusItem || 0);
        const { rolls, best } = rollNd20(attrVal);
        const rollsStr = rolls.join(', ');
        const total    = best + bonus;
        // Crítico: olha o dado (best) puro, não um total com bônus —
        // "tirar 16 no dado" é o próprio resultado do d20 mantido.
        const critRange = item.critRange || 20;
        const isCrit    = best >= critRange;
        const critTag   = isCrit ? ' — **CRÍTICO!**' : '';
        const result = {
          rolls, total, formula: `${diceLabel(attrVal)}${bonus ? ' ' + signed(bonus) : ''}`, details: `[${rollsStr}]`,
          emoji: icon(isCrit ? 'burst' : 'swords', 'icon-gold', 22), diceType: 'd20',
        };
        this.onRoll(result);
        const bonusStr = bonus ? ` ${signed(bonus)}` : '';
        this.onDiceMessage(sheet.name, `atacou com ${item.name} (${p.label}/${ATTR_MAP[attrKey]?.abbr||'?'}) → [${rollsStr}]${bonusStr} = **${total}**${critTag}`, 'swords', result);
        // Mostrar botão de dano (já sabendo se foi crítico)
        const dmgBtn = row.querySelector('[data-roll="damage"]');
        if (dmgBtn) {
          dmgBtn.classList.remove('hidden');
          dmgBtn.innerHTML = isCrit ? `${icon('burst')} Dano (Crítico!)` : `${icon('burst')} Dano`;
          dmgBtn.onclick = () => {
            const mult    = isCrit ? (item.critMult || 2) : 1;
            const formula = isCrit ? multiplyDiceFormula(item.damage || '1d6', mult) : (item.damage || '1d6');
            const dmgResult = rollFormula(formula);
            if (dmgResult) {
              this.onRoll(dmgResult);
              const typeStr = item.damageType ? ` (${item.damageType})` : '';
              const critStr = isCrit ? ` — CRÍTICO x${mult} (${formula})` : '';
              this.onDiceMessage(sheet.name, `causou dano de ${item.name}${typeStr} → **${dmgResult.total}**${critStr}`, 'burst', dmgResult);
            }
            dmgBtn.classList.add('hidden');
          };
        }
      });

      row.querySelector('[data-roll="habilidade"]')?.addEventListener('click', async () => {
        const cost = item.custo || 0;
        if (cost > 0 && sheet.pe.current < cost) {
          await uiAlert(`PE insuficiente para "${item.name}".`, { title: 'PE Insuficiente' });
          return;
        }
        if (cost > 0) { sheet.pe.current -= cost; this._save(); this._pushToToken(sheet); }
        this.onMessage(`${sheet.name} usou habilidade: ${item.name}${cost > 0 ? ` (−${cost} PE)` : ''}`, 'sparkle');
      });

      row.querySelector('[data-roll="item"]')?.addEventListener('click', async () => {
        const ok = await uiConfirm(`Usar "${item.name}"?`, { title: 'Usar Item', okText: 'Usar' });
        if (!ok) return;
        if (item.qty > 0) { item.qty--; }
        this._save();
        const hpMatch = item.effect?.match(/\+(\d+)\s*(pv|hp)/i);
        if (hpMatch) {
          sheet.hp.current = Math.min(sheet.hp.max, sheet.hp.current + parseInt(hpMatch[1]));
          this._save(); this._pushToToken(sheet);
        }
        this.onMessage(`${sheet.name} usou ${item.name}${item.effect ? ' → ' + item.effect : ''}`, 'flask');
        if (item.qty <= 0) this.onMessage(`"${item.name}" acabou!`, 'warning');
        this._renderModal(sheet);
        this._switchSheetTab('inventario');
      });
    });
  }

  // ── Rolagens ──────────────────────────────────────────────

  // Rola Nd20 pelo atributo (N = valor do atributo). Se o atributo estiver
  // ZERADO, rola 2d20 e fica com o pior resultado (ver rollNd20).
  _doAttrRoll(sheet, attr, n) {
    const { rolls, best, zeroed } = rollNd20(n);
    const rollsStr = rolls.length > 1 ? `[${rolls.join(', ')}]` : `${rolls[0]}`;
    const label = diceLabel(n);
    const result = {
      rolls, total: best,
      formula: label, details: rollsStr,
      emoji: icon(zeroed ? 'skull' : 'dice', 'icon-gold', 22), diceType: 'd20',
    };
    this.onRoll(result);
    const zeroedStr = zeroed ? ' — atributo zerado, pior resultado' : '';
    this.onDiceMessage(sheet.name, `testou ${attr.label} (${label})${zeroedStr} → ${rollsStr} = **${best}**`, 'dice', result);
  }

  // Rola Nd20 (N = valor do atributo, treino NUNCA aumenta a quantidade de
  // dados) e soma o bônus fixo de treino + bônus extra ao maior resultado.
  // Se o atributo estiver ZERADO, rola 2d20 e fica com o pior (desvantagem).
  // attrKey/defaultAttrKey: qual atributo foi usado e qual seria o padrão
  // da perícia — se forem diferentes, avisa no chat (ex: "Luta com AGI").
  _doPericiaRoll(sheet, label, attrVal, bonus, treino, attrKey, defaultAttrKey, periciaKey) {
    const { rolls, best, zeroed } = rollNd20(attrVal);
    const rollsStr = rolls.length > 1 ? `[${rolls.join(', ')}]` : `${rolls[0]}`;
    const total = best + bonus;
    const diceLbl = diceLabel(attrVal);
    const result = {
      rolls, total,
      formula: `${diceLbl}${bonus ? ' ' + signed(bonus) : ''}`,
      details: rollsStr,
      emoji: icon(zeroed ? 'skull' : 'target', 'icon-gold', 22), diceType: 'd20',
    };
    this.onRoll(result);
    const treinoStr  = treino > 0 ? ` (${TREINO_LABEL[treino]})` : '';
    const bonusStr   = bonus ? ` ${signed(bonus)}` : '';
    const zeroedStr  = zeroed ? ' — zerado, pior resultado' : '';
    const attrAbbr   = attrKey ? ATTR_MAP[attrKey]?.abbr : null;
    const overrideStr = (attrKey && defaultAttrKey && attrKey !== defaultAttrKey)
      ? ` com ${attrAbbr}` : '';
    this.onDiceMessage(sheet.name, `testou ${label}${overrideStr}${treinoStr} (${diceLbl})${zeroedStr} → ${rollsStr}${bonusStr} = **${total}**`, 'target', result);

    // Rolou a perícia Iniciativa? Entra (ou atualiza) direto na aba de
    // Iniciativa, para o combate — sem precisar digitar nada manualmente.
    if (periciaKey === 'iniciativa') this.onRollInitiative(sheet.name, total);
  }

  _esc(str) { return esc(str); }
}
