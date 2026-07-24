// ══════════════════════════════════════════════════════════════
// conditions.js — CONDIÇÕES (Ordem Paranormal, Livro de Regras, p.310-311)
//
// Substitui o antigo sistema genérico de "Marcadores" (veneno, sangramento
// etc.) pela lista oficial de Condições do jogo. Cada condição carrega,
// além do texto de regra (mostrado como referência), os efeitos que dá
// pra automatizar na rolagem de dados:
//
//   allTests    — penalidade de DADOS aplicada a QUALQUER teste de
//                 atributo ou perícia (ex: Abalado, Apavorado)
//   attrDice    — penalidade de dados só quando o teste usa aquele
//                 atributo específico (ex: Debilitado em AGI/FOR/VIG)
//   periciaMods — penalidade de dados só numa perícia nomeada
//                 (ex: Surdo em Iniciativa, Ofuscado em Percepção)
//   atkDiceMod  — penalidade de dados só em rolagens de ATAQUE
//   defesaMod   — modificador fixo somado à Defesa
//   semAcoes    — true = a condição impede (ou restringe muito) ações;
//                 é só um aviso, não bloqueia nada na interface
//
// "–O" no livro = "um dado a menos" na rolagem (reduz a QUANTIDADE de
// d20 rolados, nunca o resultado); é isso que os campos acima fazem.
// ══════════════════════════════════════════════════════════════

export const CONDITIONS = [
  { key: 'abalado', label: 'Abalado', icon: 'fear', categoria: 'Medo',
    texto: '–1 dado em todos os testes. Se ficar Abalado de novo (ou tirar –2 em testes de Agilidade/Força), vira Apavorado.',
    allTests: -1 },

  { key: 'agarrado', label: 'Agarrado', icon: 'grabbed', categoria: 'Paralisia',
    texto: 'Desprevenido e imóvel. –1 dado em testes de ataque e só pode atacar com armas leves. Ataques à distância contra o alvo têm 50% de chance de acertar o alvo errado.',
    atkDiceMod: -1, defesaMod: -5, periciaMods: { reflexos: -1 } },

  { key: 'alquebrado', label: 'Alquebrado', icon: 'broken', categoria: 'Outra',
    texto: 'O custo em Pontos de Esforço de habilidades e rituais aumenta em +1.' },

  { key: 'apavorado', label: 'Apavorado', icon: 'terrified', categoria: 'Medo',
    texto: '–2 dados em testes de perícia e deve fugir da fonte do medo pelo caminho mais eficiente possível.',
    periciaMods: {}, allTests: -2 },

  { key: 'asfixiado', label: 'Asfixiado', icon: 'lungs', categoria: 'Outra',
    texto: 'Não pode respirar. Aguenta um número de rodadas igual ao Vigor; depois disso, testa Fortitude (DT 5 +5 por teste anterior) por rodada ou cai inconsciente e perde 1d6 PV/rodada.' },

  { key: 'atordoado', label: 'Atordoado', icon: 'dizzy', categoria: 'Mental',
    texto: 'Fica desprevenido e não pode fazer ações.',
    defesaMod: -5, periciaMods: { reflexos: -1 }, semAcoes: true },

  { key: 'caido', label: 'Caído', icon: 'fallen', categoria: 'Outra',
    texto: '–2 dados em ataques corpo a corpo; deslocamento reduzido a 1,5m. –5 na Defesa contra ataques corpo a corpo, mas +5 na Defesa contra ataques à distância.' },

  { key: 'cego', label: 'Cego', icon: 'eyeOff', categoria: 'Sentidos',
    texto: 'Fica desprevenido e lento; não pode fazer testes de Percepção para observar. Considerado cego em áreas de escuridão total.',
    defesaMod: -5, periciaMods: { reflexos: -1, percepcao: -2 } },

  { key: 'confuso', label: 'Confuso', icon: 'confused', categoria: 'Mental',
    texto: 'Comporta-se de modo aleatório: role 1d6 no início do turno para saber o que acontece (mover, balbuciar, atacar o mais próximo ou a si mesmo, ou agir normalmente).' },

  { key: 'debilitado', label: 'Debilitado', icon: 'bone', categoria: 'Outra',
    texto: '–2 dados em testes de Agilidade, Força e Vigor. Se ficar Debilitado de novo, fica Inconsciente.',
    attrDice: { agilidade: -2, forca: -2, vigor: -2 } },

  { key: 'desprevenido', label: 'Desprevenido', icon: 'warning', categoria: 'Outra',
    texto: 'Despreparado para reagir: –5 na Defesa e –1 dado em Reflexos. Fica desprevenido contra inimigos que não possa perceber.',
    defesaMod: -5, periciaMods: { reflexos: -1 } },

  { key: 'doente', label: 'Doente', icon: 'sick', categoria: 'Outra',
    texto: 'Sob efeito de uma doença — efeitos variam de acordo com a doença específica.' },

  { key: 'em_chamas', label: 'Em Chamas', icon: 'fire', categoria: 'Outra',
    texto: 'Pegando fogo: sofre 1d6 de dano de fogo no início dos turnos. Pode gastar uma ação padrão para apagar o fogo com as mãos; imersão em água também apaga.' },

  { key: 'enjoado', label: 'Enjoado', icon: 'nauseated', categoria: 'Outra',
    texto: 'Só pode realizar uma ação padrão OU uma de movimento (não ambas) por rodada.' },

  { key: 'enlouquecendo', label: 'Enlouquecendo', icon: 'brainCrack', categoria: 'Mental',
    texto: 'Se iniciar três turnos Enlouquecendo na mesma cena, fica insano (vira NPC). Pode ser encerrada com Diplomacia (DT 20 +5 por vez já acalmado) ou recuperando ao menos 1 de Sanidade.' },

  { key: 'enredado', label: 'Enredado', icon: 'web', categoria: 'Paralisia',
    texto: 'Fica lento, vulnerável e sofre –1 dado em testes de ataque.',
    atkDiceMod: -1, defesaMod: -2 },

  { key: 'envenenado', label: 'Envenenado', icon: 'skull', categoria: 'Outra',
    texto: 'Efeito varia de acordo com o veneno (outra condição ou dano recorrente). Dano recorrente de venenos sempre se acumula.' },

  { key: 'esmorecido', label: 'Esmorecido', icon: 'discouraged', categoria: 'Mental',
    texto: '–2 dados em testes de Intelecto e Presença.',
    attrDice: { intelecto: -2, presenca: -2 } },

  { key: 'exausto', label: 'Exausto', icon: 'battery', categoria: 'Fadiga',
    texto: 'Fica Debilitado, Lento e Vulnerável. Se ficar Exausto de novo, fica Inconsciente.',
    attrDice: { agilidade: -2, forca: -2, vigor: -2 }, defesaMod: -2 },

  { key: 'fascinado', label: 'Fascinado', icon: 'fascinated', categoria: 'Mental',
    texto: '–2 dados em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou. Qualquer ação hostil contra ele anula a condição.',
    periciaMods: { percepcao: -2 }, semAcoes: true },

  { key: 'fatigado', label: 'Fatigado', icon: 'sleepy', categoria: 'Fadiga',
    texto: 'Fica Fraco e Vulnerável. Se ficar Fatigado de novo, fica Exausto.',
    attrDice: { agilidade: -1, forca: -1, vigor: -1 }, defesaMod: -2 },

  { key: 'fraco', label: 'Fraco', icon: 'frailArm', categoria: 'Outra',
    texto: '–1 dado em testes de Agilidade, Força e Vigor. Se ficar Fraco de novo, fica Debilitado.',
    attrDice: { agilidade: -1, forca: -1, vigor: -1 } },

  { key: 'frustrado', label: 'Frustrado', icon: 'frustrated', categoria: 'Mental',
    texto: '–1 dado em testes de Intelecto e Presença. Se ficar Frustrado de novo, fica Esmorecido.',
    attrDice: { intelecto: -1, presenca: -1 } },

  { key: 'imovel', label: 'Imóvel', icon: 'pin', categoria: 'Paralisia',
    texto: 'Todas as formas de deslocamento são reduzidas a 0m.' },

  { key: 'inconsciente', label: 'Inconsciente', icon: 'unconscious', categoria: 'Outra',
    texto: 'Fica indefeso e não pode fazer ações, incluindo reações. Balançar o personagem para acordá-lo gasta uma ação padrão.',
    defesaMod: -10, semAcoes: true },

  { key: 'indefeso', label: 'Indefeso', icon: 'defenseless', categoria: 'Outra',
    texto: 'Considerado desprevenido, mas sofre –10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.',
    defesaMod: -10, periciaMods: { reflexos: -1 } },

  { key: 'lento', label: 'Lento', icon: 'snail', categoria: 'Paralisia',
    texto: 'Todo deslocamento é reduzido à metade e não pode correr ou fazer investidas.' },

  { key: 'machucado', label: 'Machucado', icon: 'bandage', categoria: 'Outra',
    texto: 'Tem metade ou menos dos pontos de vida totais.' },

  { key: 'morrendo', label: 'Morrendo', icon: 'hourglass', categoria: 'Outra',
    texto: 'Com 0 pontos de vida. Se iniciar três turnos Morrendo na mesma cena, morre. Pode ser encerrada com Medicina (DT 20 +5 por vez já estabilizado) ou efeito específico.' },

  { key: 'ofuscado', label: 'Ofuscado', icon: 'glare', categoria: 'Sentidos',
    texto: '–1 dado em testes de ataque e de Percepção.',
    atkDiceMod: -1, periciaMods: { percepcao: -1 } },

  { key: 'paralisado', label: 'Paralisado', icon: 'bolt', categoria: 'Paralisia',
    texto: 'Fica imóvel e indefeso; só pode realizar ações puramente mentais.',
    defesaMod: -10, periciaMods: { reflexos: -1 }, semAcoes: true },

  { key: 'pasmo', label: 'Pasmo', icon: 'stunned', categoria: 'Mental',
    texto: 'Não pode fazer ações.', semAcoes: true },

  { key: 'perturbado', label: 'Perturbado', icon: 'disturbed', categoria: 'Outra',
    texto: 'Na primeira vez que isso acontece numa cena, recebe um efeito de insanidade.' },

  { key: 'petrificado', label: 'Petrificado', icon: 'stone', categoria: 'Outra',
    texto: 'Fica inconsciente e recebe resistência a dano 10.',
    defesaMod: -10, semAcoes: true },

  { key: 'sangrando', label: 'Sangrando', icon: 'droplet', categoria: 'Outra',
    texto: 'Ferimento aberto: no início dos turnos, teste de Vigor (DT 20) — se passar, estabiliza; se falhar, perde 1d6 PV e continua sangrando. Estabilizar outro alguém: ação completa + Medicina (DT 20).' },

  { key: 'surdo', label: 'Surdo', icon: 'deaf', categoria: 'Sentidos',
    texto: 'Não pode fazer testes de Percepção para ouvir e sofre –2 dados em Iniciativa. Considerado em condição ruim para lançar rituais.',
    periciaMods: { iniciativa: -2 } },

  { key: 'surpreendido', label: 'Surpreendido', icon: 'surprised', categoria: 'Outra',
    texto: 'Não ciente de seus inimigos: fica desprevenido e não pode fazer ações.',
    defesaMod: -5, periciaMods: { reflexos: -1 }, semAcoes: true },

  { key: 'vulneravel', label: 'Vulnerável', icon: 'crosshair', categoria: 'Outra',
    texto: '–2 na Defesa.',
    defesaMod: -2 },
];

export const CONDITION_MAP = Object.fromEntries(CONDITIONS.map(c => [c.key, c]));

export const CONDITION_CATEGORIAS = ['Medo', 'Paralisia', 'Mental', 'Sentidos', 'Fadiga', 'Outra'];

// ─── Cálculo de efeitos combinados (usado pela Ficha ao rolar) ───

// Penalidade de DADOS para um teste de atributo/perícia. `opts.attrKey` é o
// atributo efetivamente usado na rolagem (já considerando troca manual);
// `opts.periciaKey` é a perícia nomeada (reflexos, percepcao, iniciativa...).
export function getConditionRollPenalty(activeKeys, opts = {}) {
  const { attrKey, periciaKey } = opts;
  let mod = 0;
  for (const key of activeKeys || []) {
    const c = CONDITION_MAP[key];
    if (!c) continue;
    if (c.allTests) mod += c.allTests;
    if (attrKey && c.attrDice && c.attrDice[attrKey]) mod += c.attrDice[attrKey];
    if (periciaKey && c.periciaMods && c.periciaMods[periciaKey]) mod += c.periciaMods[periciaKey];
  }
  return mod;
}

// Penalidade de DADOS específica de rolagens de ataque (soma-se à penalidade
// normal de perícia/atributo — um ataque agarrado E ofuscado, por exemplo,
// acumula os dois –1).
export function getConditionAtkPenalty(activeKeys) {
  let mod = 0;
  for (const key of activeKeys || []) {
    const c = CONDITION_MAP[key];
    if (c?.atkDiceMod) mod += c.atkDiceMod;
  }
  return mod;
}

// Modificador fixo somado à Defesa.
export function getConditionDefesaMod(activeKeys) {
  let mod = 0;
  for (const key of activeKeys || []) {
    const c = CONDITION_MAP[key];
    if (c?.defesaMod) mod += c.defesaMod;
  }
  return mod;
}

// Texto curto pra tooltip / lista, com aviso de "sem ações" quando aplicável.
export function conditionTooltip(key) {
  const c = CONDITION_MAP[key];
  if (!c) return '';
  return c.semAcoes ? `${c.texto} Impede (ou restringe muito) ações.` : c.texto;
}
