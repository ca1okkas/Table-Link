// ══════════════════════════════════════════════════════════════
// op-equipamentos.js — Catálogo de Equipamentos de Ordem Paranormal
// (Armas, Proteções, Itens Gerais, Munições, Modificações e Maldições)
//
// Fonte: Livro de Regras, Capítulo 3 (Equipamento) — Tabelas 3.3 a 3.10
// — e Capítulo 8 (Itens Amaldiçoados). Estatísticas (categoria, dano,
// crítico, alcance, tipo, espaços, defesa, efeito) são as oficiais do
// livro; descrições foram resumidas. Qualquer coisa homebrew pode ser
// criada livremente pelo botão "Criar Personalizado" no Inventário.
// ══════════════════════════════════════════════════════════════

// ─── ARMAS (Tabela 3.3) ─────────────────────────────────────────
// { name, grupo: proficiência (simples/tatica/pesada), tipoArma: corpo-a-corpo|disparo|fogo,
//   empunhadura: leve|uma-mao|duas-maos, categoria, damage, critRange, critMult,
//   alcance, damageType, espacos, agil (permite Agilidade em vez de Força), automatica, desc }
export const WEAPON_PRESETS = [
  // ── Armas Simples ──
  { name: 'Faca',            grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'leve',      categoria: '0', damage: '1d4',  critRange: 19, critMult: 2, alcance: 'curto', damageType: 'Corte',      espacos: 1, agil: true,  desc: 'Lâmina afiada; pode ser arremessada.' },
  { name: 'Martelo',         grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'leve',      categoria: '0', damage: '1d6',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',    espacos: 1, desc: 'Ferramenta comum usada como arma.' },
  { name: 'Punhal',          grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'leve',      categoria: '0', damage: '1d4',  critRange: 20, critMult: 3, alcance: '',       damageType: 'Perfuração', espacos: 1, agil: true,  desc: 'Faca longa e pontiaguda usada em rituais.' },
  { name: 'Bastão',          grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: '0', damage: '1d6',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',    espacos: 1, desc: 'Cilindro de madeira maciça (1d6 uma mão / 1d8 duas mãos).' },
  { name: 'Machete',         grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: '0', damage: '1d6',  critRange: 19, critMult: 2, alcance: '',       damageType: 'Corte',      espacos: 1, desc: 'Lâmina longa e larga para abrir trilhas.' },
  { name: 'Lança',           grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: '0', damage: '1d6',  critRange: 20, critMult: 2, alcance: 'curto',  damageType: 'Perfuração', espacos: 1, desc: 'Haste com ponta metálica; pode ser arremessada.' },
  { name: 'Cajado',          grupo: 'simples', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: '0', damage: '1d6',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',    espacos: 2, agil: true,  desc: 'Cabo de madeira/ferro longo; arma ágil.' },
  { name: 'Arco',            grupo: 'simples', tipoArma: 'disparo',       empunhadura: 'duas-maos', categoria: '0', damage: '1d6',  critRange: 20, critMult: 3, alcance: 'medio',  damageType: 'Perfuração', espacos: 2, desc: 'Arco e flecha comum.' },
  { name: 'Besta',           grupo: 'simples', tipoArma: 'disparo',       empunhadura: 'duas-maos', categoria: '0', damage: '1d8',  critRange: 19, critMult: 2, alcance: 'medio',  damageType: 'Perfuração', espacos: 2, desc: 'Recarregar exige ação de movimento.' },
  { name: 'Pistola',         grupo: 'simples', tipoArma: 'fogo',          empunhadura: 'leve',      categoria: 'I', damage: '1d12', critRange: 18, critMult: 2, alcance: 'curto',  damageType: 'Balístico',  espacos: 1, desc: 'Arma de mão comum, fácil de recarregar.' },
  { name: 'Revólver',        grupo: 'simples', tipoArma: 'fogo',          empunhadura: 'leve',      categoria: 'I', damage: '2d6',  critRange: 19, critMult: 3, alcance: 'curto',  damageType: 'Balístico',  espacos: 1, desc: 'Uma das armas de fogo mais confiáveis.' },
  { name: 'Fuzil de caça',   grupo: 'simples', tipoArma: 'fogo',          empunhadura: 'duas-maos', categoria: 'I', damage: '2d8',  critRange: 19, critMult: 3, alcance: 'medio',  damageType: 'Balístico',  espacos: 2, desc: 'Popular entre fazendeiros e caçadores.' },

  // ── Armas Táticas ──
  { name: 'Machadinha',      grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'leve',      categoria: '0', damage: '1d6',  critRange: 20, critMult: 3, alcance: 'curto',  damageType: 'Corte',     espacos: 1, desc: 'Ferramenta de corte; pode ser arremessada.' },
  { name: 'Nunchaku',        grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'leve',      categoria: '0', damage: '1d8',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',   espacos: 1, agil: true, desc: 'Dois bastões ligados por corrente; arma ágil.' },
  { name: 'Corrente',        grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: '0', damage: '1d8',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',   espacos: 1, desc: '+2 em testes para desarmar e derrubar.' },
  { name: 'Espada',          grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: 'I', damage: '1d8',  critRange: 19, critMult: 2, alcance: '',       damageType: 'Corte',     espacos: 1, desc: 'Arma medieval clássica (1d8 uma mão / 1d10 duas mãos).' },
  { name: 'Florete',         grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: 'I', damage: '1d6',  critRange: 18, critMult: 2, alcance: '',       damageType: 'Corte',     espacos: 1, agil: true, desc: 'Lâmina fina de esgrimista; arma ágil.' },
  { name: 'Machado',         grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: 'I', damage: '1d8',  critRange: 20, critMult: 3, alcance: '',       damageType: 'Corte',     espacos: 1, desc: 'Ferramenta de lenhador que causa ferimentos terríveis.' },
  { name: 'Maça',            grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'uma-mao',   categoria: 'I', damage: '2d4',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',   espacos: 1, desc: 'Bastão com cabeça metálica cheia de protuberâncias.' },
  { name: 'Acha',            grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: 'I', damage: '1d12', critRange: 20, critMult: 3, alcance: '',       damageType: 'Corte',     espacos: 2, desc: 'Machado grande e pesado de duas mãos.' },
  { name: 'Gadanho',         grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: 'I', damage: '2d4',  critRange: 20, critMult: 4, alcance: '',       damageType: 'Corte',     espacos: 2, desc: 'Ferramenta agrícola que também ceifa vidas.' },
  { name: 'Katana',          grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: 'I', damage: '1d10', critRange: 19, critMult: 2, alcance: '',       damageType: 'Corte',     espacos: 2, agil: true, desc: 'Espada japonesa longa; ágil (veterano em Luta usa com uma mão).' },
  { name: 'Marreta',         grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: 'I', damage: '3d4',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Impacto',   espacos: 2, desc: 'Usada para demolir paredes (ou pessoas).' },
  { name: 'Montante',        grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: 'I', damage: '2d6',  critRange: 19, critMult: 2, alcance: '',       damageType: 'Corte',     espacos: 2, desc: 'Enorme espada de 1,5m.' },
  { name: 'Motosserra',      grupo: 'tatica', tipoArma: 'corpo-a-corpo', empunhadura: 'duas-maos', categoria: 'I', damage: '3d6',  critRange: 20, critMult: 2, alcance: '',       damageType: 'Corte',     espacos: 2, desc: 'Rola 6 num dado de dano? Role mais um dado. –O em ataque; ligar gasta ação de movimento.' },
  { name: 'Arco composto',   grupo: 'tatica', tipoArma: 'disparo', empunhadura: 'duas-maos', categoria: 'I',  damage: '1d10', critRange: 20, critMult: 3, alcance: 'medio', damageType: 'Perfuração', espacos: 2, desc: 'Arco moderno; aplica Força na rolagem de dano.' },
  { name: 'Balestra',        grupo: 'tatica', tipoArma: 'disparo', empunhadura: 'duas-maos', categoria: 'I',  damage: '1d12', critRange: 19, critMult: 2, alcance: 'medio', damageType: 'Perfuração', espacos: 2, desc: 'Besta pesada; recarregar exige ação de movimento.' },
  { name: 'Submetralhadora', grupo: 'tatica', tipoArma: 'fogo',    empunhadura: 'uma-mao',    categoria: 'I',  damage: '2d6',  critRange: 19, critMult: 3, alcance: 'curto', damageType: 'Balístico',  espacos: 1, automatica: true, desc: 'Arma de fogo automática empunhável com uma mão.' },
  { name: 'Espingarda',      grupo: 'tatica', tipoArma: 'fogo',    empunhadura: 'duas-maos',  categoria: 'I',  damage: '4d6',  critRange: 20, critMult: 3, alcance: 'curto', damageType: 'Balístico',  espacos: 2, desc: 'Causa apenas metade do dano em alcance médio ou maior.' },
  { name: 'Fuzil de assalto',   grupo: 'tatica', tipoArma: 'fogo', empunhadura: 'duas-maos',  categoria: 'II', damage: '2d10', critRange: 19, critMult: 3, alcance: 'medio', damageType: 'Balístico',  espacos: 2, automatica: true, desc: 'Arma padrão da maioria dos exércitos modernos.' },
  { name: 'Fuzil de precisão',  grupo: 'tatica', tipoArma: 'fogo', empunhadura: 'duas-maos',  categoria: 'III', damage: '2d10', critRange: 19, critMult: 3, alcance: 'longo', damageType: 'Balístico', espacos: 2, desc: 'Uso militar; veterano em Pontaria mirando ganha +5 na margem de ameaça.' },

  // ── Armas Pesadas ──
  { name: 'Bazuca',          grupo: 'pesada', tipoArma: 'fogo', empunhadura: 'duas-maos', categoria: 'III', damage: '10d8', critRange: 20, critMult: 2, alcance: 'medio', damageType: 'Impacto', espacos: 2, desc: 'Explode num raio de 3m; Reflexos (DT Agi) reduz à metade em quem não for o alvo direto.' },
  { name: 'Lança-chamas',    grupo: 'pesada', tipoArma: 'fogo', empunhadura: 'duas-maos', categoria: 'III', damage: '6d6',  critRange: 20, critMult: 2, alcance: 'curto', damageType: 'Fogo',    espacos: 2, desc: 'Atinge uma linha de 1,5m de largura; alvos atingidos ficam em chamas.' },
  { name: 'Metralhadora',    grupo: 'pesada', tipoArma: 'fogo', empunhadura: 'duas-maos', categoria: 'II',  damage: '2d12', critRange: 19, critMult: 3, alcance: 'medio', damageType: 'Balístico', espacos: 2, automatica: true, desc: 'Precisa de Força 4+ ou apoio em tripé, senão –5 no ataque.' },
];

// ─── MUNIÇÕES (Tabela 3.4) ──────────────────────────────────────
export const MUNITION_PRESETS = [
  { name: 'Balas curtas', categoria: '0', espacos: 1, desc: 'Pistolas, revólveres, submetralhadoras. 1 pacote dura 2 cenas.' },
  { name: 'Balas longas', categoria: 'I', espacos: 1, desc: 'Fuzis e metralhadoras. 1 pacote dura 1 cena.' },
  { name: 'Cartuchos',    categoria: 'I', espacos: 1, desc: 'Espingardas. 1 pacote dura 1 cena.' },
  { name: 'Combustível',  categoria: 'I', espacos: 1, desc: 'Lança-chamas. 1 tanque dura 1 cena.' },
  { name: 'Flechas',      categoria: '0', espacos: 1, desc: 'Arcos e bestas. 1 pacote dura 1 missão inteira (reaproveitável).' },
  { name: 'Foguete',      categoria: 'I', espacos: 1, desc: 'Bazucas. Cada foguete dura 1 disparo.' },
];

// ─── PROTEÇÕES (Tabela 3.6) ─────────────────────────────────────
// { name, defesaBonus, categoria, espacos, pesada (bool), desc }
export const PROTECTION_PRESETS = [
  { name: 'Proteção Leve',   defesaBonus: 5,  categoria: 'I',  espacos: 2, pesada: false, desc: 'Jaqueta de couro pesada ou colete de kevlar.' },
  { name: 'Proteção Pesada', defesaBonus: 10, categoria: 'II', espacos: 5, pesada: true,  desc: 'RD balístico/corte/impacto/perfuração 2. –5 em perícias com penalidade de carga.' },
  { name: 'Escudo',          defesaBonus: 2,  categoria: 'I',  espacos: 2, pesada: true,  desc: 'Precisa ser empunhado; acumula com a Defesa de uma proteção.' },
];

// ─── EQUIPAMENTO GERAL (Tabela 3.8) ──────────────────────────────
// tipo: 'acessorio' (utensilio/vestimenta/kit) | 'explosivo' | 'operacional' | 'paranormal'
export const GENERAL_ITEM_PRESETS = [
  // Acessórios
  { name: 'Kit de Perícia', tipo: 'acessorio', subtipo: 'kit',       categoria: '0', espacos: 1, desc: 'Sem ele, –5 no teste da perícia associada. Escolha a perícia ao adicionar.' },
  { name: 'Utensílio',      tipo: 'acessorio', subtipo: 'utensilio', categoria: 'I', espacos: 1, desc: 'Item empunhável com utilidade específica; +2 em uma perícia (exceto Luta/Pontaria).' },
  { name: 'Vestimenta',     tipo: 'acessorio', subtipo: 'vestimenta',categoria: 'I', espacos: 1, desc: 'Peça de roupa; +2 em uma perícia (exceto Luta/Pontaria). Máximo 2 vestimentas ativas.' },

  // Explosivos
  { name: 'Granada de Atordoamento', tipo: 'explosivo', categoria: '0', espacos: 1, desc: 'Raio 6m. Atordoado 1 rodada (Fortitude DT Agi reduz p/ ofuscado e surdo 1 rodada).' },
  { name: 'Granada de Fragmentação', tipo: 'explosivo', categoria: 'I', espacos: 1, desc: 'Raio 6m. 8d6 perfuração (Reflexos DT Agi reduz à metade).' },
  { name: 'Granada de Fumaça',       tipo: 'explosivo', categoria: '0', espacos: 1, desc: 'Raio 6m. Cegos e camuflagem total por 2 rodadas.' },
  { name: 'Granada Incendiária',     tipo: 'explosivo', categoria: 'I', espacos: 1, desc: 'Raio 6m. 6d6 fogo + em chamas (Reflexos DT Agi reduz dano à metade e evita chamas).' },
  { name: 'Mina Antipessoal',        tipo: 'explosivo', categoria: 'I', espacos: 1, desc: 'Cone de 6m. 12d6 perfuração (Reflexos DT Int reduz à metade). Instalar: Tática DT 15.' },

  // Itens Operacionais
  { name: 'Algemas',                  tipo: 'operacional', categoria: '0', espacos: 1, desc: 'Prender exige agarrar + teste; escapar exige Acrobacia DT 30.' },
  { name: 'Arpéu',                    tipo: 'operacional', categoria: '0', espacos: 1, desc: 'Fixar exige Pontaria DT 15; +5 em Atletismo para subir com a corda.' },
  { name: 'Bandoleira',               tipo: 'operacional', categoria: 'I', espacos: 1, desc: '1x/rodada, saca/guarda um item do inventário como ação livre.' },
  { name: 'Binóculos',                tipo: 'operacional', categoria: '0', espacos: 1, desc: '+5 em Percepção para observar coisas distantes.' },
  { name: 'Bloqueador de Sinal',      tipo: 'operacional', categoria: 'I', espacos: 1, desc: 'Impede celulares em alcance médio de se conectar.' },
  { name: 'Cicatrizante',             tipo: 'operacional', categoria: 'I', espacos: 1, desc: 'Ação padrão: cura 2d8+2 PV em você ou um ser adjacente.' },
  { name: 'Corda',                    tipo: 'operacional', categoria: '0', espacos: 1, desc: '10m de corda resistente; +5 em Atletismo para descer/subir.' },
  { name: 'Equipamento de Sobrevivência', tipo: 'operacional', categoria: '0', espacos: 2, desc: '+5 em Sobrevivência p/ acampar/orientar-se; permite o teste sem treino.' },
  { name: 'Lanterna Tática',          tipo: 'operacional', categoria: 'I', espacos: 1, desc: 'Ilumina cone de 9m; pode ofuscar um alvo em alcance curto por 1 rodada.' },
  { name: 'Máscara de Gás',           tipo: 'operacional', categoria: '0', espacos: 1, desc: '+10 em Fortitude contra efeitos que dependam de respiração.' },
  { name: 'Mochila Militar',          tipo: 'operacional', categoria: 'I', espacos: 0, desc: 'Não ocupa espaço; aumenta a capacidade de carga em +2 espaços.' },
  { name: 'Óculos de Visão Térmica',  tipo: 'operacional', categoria: 'I', espacos: 1, desc: 'Elimina penalidade por camuflagem.' },
  { name: 'Pé de Cabra',              tipo: 'operacional', categoria: '0', espacos: 1, desc: '+5 em Força para arrombar portas; pode ser usado como bastão.' },
  { name: 'Pistola de Dardos',        tipo: 'operacional', categoria: 'I', espacos: 1, desc: 'Alcance curto; acerto deixa inconsciente até o fim da cena (Fortitude DT Agi reduz). Vem com 2 dardos.' },
  { name: 'Pistola Sinalizadora',     tipo: 'operacional', categoria: '0', espacos: 1, desc: 'Pode ser usada como arma leve (2d6 fogo, alcance curto). Vem com 2 cargas.' },
  { name: 'Soqueira',                 tipo: 'operacional', categoria: '0', espacos: 1, desc: '+1 em dano desarmado e torna-o letal. Pode receber mods/maldições de armas corpo a corpo.' },
  { name: 'Spray de Pimenta',         tipo: 'operacional', categoria: 'I', espacos: 1, desc: 'Alvo adjacente fica cego 1d4 rodadas (Fortitude DT Agi evita). 2 usos.' },
  { name: 'Taser',                    tipo: 'operacional', categoria: 'I', espacos: 1, desc: '1d6 elétrico + atordoado 1 rodada (Fortitude DT Agi evita). 2 usos.' },
  { name: 'Traje Hazmat',             tipo: 'operacional', categoria: 'I', espacos: 2, desc: '+5 em resistência a efeitos ambientais; resistência a químico 10.' },

  // Itens Paranormais
  { name: 'Amarras de (Elemento)',                       tipo: 'paranormal', categoria: 'II', espacos: 1, desc: 'Imobilizam criaturas vulneráveis ao elemento (armadilha 3x3m ou laçar 1 criatura).' },
  { name: 'Câmera de Aura Paranormal',                   tipo: 'paranormal', categoria: 'II', espacos: 1, desc: 'Foto revela auras paranormais em pessoas/objetos (cor = elemento).' },
  { name: 'Componentes Ritualísticos de (Elemento)',     tipo: 'paranormal', categoria: '0',  espacos: 1, desc: 'Necessários para conjurar rituais do elemento (não existem de Medo).' },
  { name: 'Emissor de Pulsos Paranormais',                tipo: 'paranormal', categoria: 'II', espacos: 1, desc: 'Atrai criaturas do elemento escolhido e afasta as do elemento oposto (Vontade DT Pre evita).' },
  { name: 'Escuta de Ruídos Paranormais',                 tipo: 'paranormal', categoria: 'II', espacos: 1, desc: 'Grava ruídos paranormais por até 24h; +5 em Ocultismo para identificar criatura.' },
  { name: 'Medidor de Estabilidade da Membrana',          tipo: 'paranormal', categoria: 'II', espacos: 1, desc: 'Indica a chance de uma entidade se manifestar numa área.' },
  { name: 'Scanner de Manifestação Paranormal de (Elemento)', tipo: 'paranormal', categoria: 'II', espacos: 1, desc: '1 PE/rodada: sabe a direção de manifestações ativas do elemento em alcance longo.' },
];

// ─── MODIFICAÇÕES PARA ARMAS (Tabela 3.5) ────────────────────────
// Cada modificação aumenta a categoria do item em I. Modificações iguais
// não se acumulam. appliesTo: 'corpo-a-corpo' | 'disparo' | 'fogo' | 'municao'
export const WEAPON_MODIFICATIONS = [
  { name: 'Certeira',           appliesTo: ['corpo-a-corpo', 'disparo', 'fogo'], effect: '+2 em testes de ataque.' },
  { name: 'Cruel',              appliesTo: ['corpo-a-corpo', 'disparo', 'fogo'], effect: '+2 em rolagens de dano.' },
  { name: 'Discreta',           appliesTo: ['corpo-a-corpo', 'disparo', 'fogo'], effect: '+5 em testes p/ ocultar; reduz o espaço em –1.', espacoDelta: -1 },
  { name: 'Perigosa',           appliesTo: ['corpo-a-corpo', 'disparo', 'fogo'], effect: '+2 na margem de ameaça.', critRangeDelta: -2 },
  { name: 'Tática',             appliesTo: ['corpo-a-corpo', 'disparo', 'fogo'], effect: 'Pode sacar a arma como ação livre.' },
  { name: 'Alongada',           appliesTo: ['fogo'], effect: '+2 em testes de ataque.' },
  { name: 'Calibre Grosso',     appliesTo: ['fogo'], effect: 'Aumenta o dano em mais um dado do mesmo tipo (exige munição de calibre grosso).', danoExtraDinamico: 'calibreGrosso' },
  { name: 'Compensador',        appliesTo: ['fogo'], effect: 'Anula a penalidade de ataque por disparar rajadas (só armas automáticas).' },
  { name: 'Ferrolho Automático',appliesTo: ['fogo'], effect: 'A arma se torna automática.' },
  { name: 'Mira Laser',         appliesTo: ['fogo'], effect: '+2 na margem de ameaça.', critRangeDelta: -2 },
  { name: 'Mira Telescópica',   appliesTo: ['fogo'], effect: 'Aumenta o alcance em uma categoria; permite Ataque Furtivo em qualquer alcance.' },
  { name: 'Silenciador',        appliesTo: ['fogo'], effect: '–OO na penalidade de Furtividade para se esconder no turno em que atacou.' },
  { name: 'Visão de Calor',     appliesTo: ['fogo'], effect: 'Ignora camuflagem do alvo ao disparar.' },
  { name: 'Dum Dum',            appliesTo: ['municao'], effect: '+1 no multiplicador de crítico (só balas curtas/longas).', critMultDelta: 1 },
  { name: 'Explosiva',          appliesTo: ['municao'], effect: 'Aumenta o dano em +2d6 (só balas curtas/longas).', danoExtra: '+2d6' },
];

// ─── MODIFICAÇÕES PARA PROTEÇÕES (Tabela 3.7) ────────────────────
export const PROTECTION_MODIFICATIONS = [
  { name: 'Antibombas', effect: '+5 em testes de resistência contra efeitos de área. Só em proteções pesadas.', soProtecaoPesada: true },
  { name: 'Blindada',   effect: 'Aumenta a Resistência a Dano para 5 e o espaço em +1. Só em proteções pesadas.', soProtecaoPesada: true, espacoDelta: 1 },
  { name: 'Discreta',   effect: '+5 em testes de Crime para ocultar; reduz o espaço em –1. Só em proteções leves.', soProtecaoLeve: true, espacoDelta: -1 },
  { name: 'Reforçada',  effect: 'Aumenta a Defesa em +2 e o espaço em +1. Não pode ser combinada com Discreta.', defesaDelta: 2, espacoDelta: 1 },
];

// ─── MODIFICAÇÕES PARA ACESSÓRIOS (Tabela 3.9) ───────────────────
// Aplicam-se a utensílios, vestimentas e kits de perícia (categoria acessórios).
export const ACCESSORY_MODIFICATIONS = [
  { name: 'Aprimorado',        effect: 'O bônus em perícia do acessório aumenta para +5 (pode ser escolhida 2ª vez se o item tiver função adicional).' },
  { name: 'Discreto',          effect: '+5 em testes de Crime para ocultar; reduz o espaço em –1.', espacoDelta: -1 },
  { name: 'Função Adicional',  effect: 'Concede +2 em uma perícia adicional (sujeito à aprovação do mestre).' },
  { name: 'Instrumental',      effect: 'O acessório funciona como um kit de perícia específico.' },
];

// ─── ELEMENTOS E OPOSIÇÃO ─────────────────────────────────────────
// "A é oprimido por B" — um item não pode ter maldições de elementos
// opressores entre si (ex: não pode ter maldição de Conhecimento E de
// Sangue no mesmo item, pois Sangue é o opressor de Conhecimento).
export const ELEMENTOS = ['conhecimento', 'energia', 'morte', 'sangue'];
export const ELEMENTO_LABEL = { conhecimento: 'Conhecimento', energia: 'Energia', morte: 'Morte', sangue: 'Sangue', medo: 'Medo' };
export const ELEMENTO_OPRESSOR = {
  conhecimento: 'sangue',      // Sangue é o elemento opressor do Conhecimento
  sangue:       'morte',       // Morte é o elemento opressor do Sangue
  morte:        'energia',     // Energia é o elemento opressor da Morte
  energia:      'conhecimento',// Conhecimento é o elemento opressor da Energia
};
// Dois elementos "conflitam" (não podem coexistir em maldições do mesmo item)
// se um é o opressor do outro, em qualquer direção.
export function elementosConflitam(a, b) {
  if (!a || !b || a === b) return false;
  return ELEMENTO_OPRESSOR[a] === b || ELEMENTO_OPRESSOR[b] === a;
}

// ─── MALDIÇÕES PARA ARMAS (Cap. 8 — Itens Amaldiçoados) ──────────
// A 1ª maldição de um item aumenta sua categoria em II; as seguintes em I.
// Maldições iguais não se acumulam; não pode ter maldições de elementos opressores entre si.
export const WEAPON_CURSES = [
  { name: 'Antielemento', elemento: 'conhecimento', effect: '2 PE ao acertar um ser de um elemento (1d4 aleatório): +4d8 de dano.' },
  { name: 'Ritualística',  elemento: 'conhecimento', effect: 'Armazena um ritual; ao acertar um ataque, descarrega-o como ação livre no alvo atingido.' },
  { name: 'Senciente',     elemento: 'conhecimento', effect: '2 PE + ação de movimento: a arma flutua e ataca sozinha 1x/rodada (1 PE/rodada p/ manter).' },
  { name: 'Empuxo',        elemento: 'energia', effect: 'Pode ser arremessada (alcance curto, ou +1 categoria se já tinha); +1 dado de dano e volta para você. Só corpo a corpo.' },
  { name: 'Energética',    elemento: 'energia', effect: '2 PE/ataque: +5 em ataque, ignora RD e converte o dano para Energia.' },
  { name: 'Vibrante',      elemento: 'energia', effect: 'Concede Ataque Extra (trilha Operações Especiais) ou reduz seu custo em –1 PE se já a possui.' },
  { name: 'Consumidora',   elemento: 'morte', effect: '2 PE ao acertar: alvo fica imóvel por 1 rodada.' },
  { name: 'Erosiva',       elemento: 'morte', effect: '+1d8 de dano de Morte; 2 PE ao acertar: +2d4 de dano de Morte no início dos 2 próximos turnos do alvo.', danoExtra: '+1d8' },
  { name: 'Repulsora',     elemento: 'morte', effect: '+2 de Defesa empunhada; ao bloquear, 2 PE dá +5 adicional de Defesa.' },
  { name: 'Lancinante',    elemento: 'sangue', effect: '+1d8 de dano de Sangue (multiplicado em críticos).', danoExtra: '+1d8' },
  { name: 'Predadora',     elemento: 'sangue', effect: 'Ignora camuflagem/cobertura leve; dobra a margem de ameaça (aplicado antes de outros aumentos). Alcance +1 categoria se for à distância.' },
  { name: 'Sanguinária',   elemento: 'sangue', effect: 'Causa sangramento cumulativo (2d6/rodada por acerto); crítico dá 2d10 PV temporários a você.' },
];

// ─── MALDIÇÕES PARA PROTEÇÕES (Cap. 8) ───────────────────────────
export const PROTECTION_CURSES = [
  { name: 'Abascanta', elemento: 'conhecimento', effect: '+5 em resistência a rituais; 1x/cena reflete um ritual de volta ao conjurador.' },
  { name: 'Profética',  elemento: 'conhecimento', effect: 'Resistência a Conhecimento 10; 2 PE para rolar novamente um teste de resistência.' },
  { name: 'Sombria',    elemento: 'conhecimento', effect: '+5 em Furtividade (ignora penalidade de carga); 1 PE + ação p/ parecer roupa comum sem perder propriedades.' },
  { name: 'Cinética',   elemento: 'energia', effect: '+2 de Defesa e RD 2 (leve/escudo) ou 5 (pesada).', defesaDelta: 2 },
  { name: 'Lépida',     elemento: 'energia', effect: '+10 em Atletismo e +3m de deslocamento; 2 PE p/ mover-se ignorando terreno difícil até o fim do turno.' },
  { name: 'Voltaica',   elemento: 'energia', effect: 'Resistência a Energia 10; 2 PE: emite arcos de energia (2d6/turno em adjacentes) até o fim da cena.' },
  { name: 'Letárgica',  elemento: 'morte', effect: '+2 de Defesa; 25% (leve/escudo) ou 50% (pesada) de ignorar dano extra de crítico/furtivo.', defesaDelta: 2 },
  { name: 'Repulsiva',  elemento: 'morte', effect: 'Resistência a Morte 10; 2 PE: cobre-se de Lodo até o fim da cena (2d8 de Morte em quem o atacar corpo a corpo).' },
  { name: 'Regenerativa', elemento: 'sangue', effect: 'Resistência a Sangue 10; 1 PE + ação p/ curar 1d12 PV.' },
  { name: 'Sádica',     elemento: 'sangue', effect: '+1 em ataque e dano por cada 10 pontos de dano sofridos desde o fim do seu último turno.' },
];

// ─── MALDIÇÕES PARA ACESSÓRIOS (Cap. 8) ──────────────────────────
// Aplicam-se a utensílios e vestimentas.
export const ACCESSORY_CURSES = [
  { name: 'Carisma',           elemento: 'conhecimento', effect: '+1 em Presença (não concede PE adicionais).' },
  { name: 'Conjuração',        elemento: 'conhecimento', effect: 'Concede um ritual de 1º círculo (empunhado); –1 PE nele se você já o conhece.' },
  { name: 'Escudo Mental',     elemento: 'conhecimento', effect: 'Resistência mental 10.' },
  { name: 'Reflexão',          elemento: 'conhecimento', effect: '1x/rodada, reflete um ritual de volta ao conjurador (pagando PE igual ao custo dele).' },
  { name: 'Sagacidade',        elemento: 'conhecimento', effect: '+1 em Intelecto (não concede perícias/graus adicionais).' },
  { name: 'Defesa',            elemento: 'energia', effect: '+5 de Defesa.' },
  { name: 'Destreza',          elemento: 'energia', effect: '+1 em Agilidade.' },
  { name: 'Potência',          elemento: 'energia', effect: '+1 na DT contra suas habilidades, poderes e rituais.' },
  { name: 'Esforço Adicional', elemento: 'morte', effect: '+5 PE (só ativa após 1 dia de uso).' },
  { name: 'Disposição',        elemento: 'sangue', effect: '+1 em Vigor.' },
  { name: 'Pujança',           elemento: 'sangue', effect: '+1 em Força.' },
  { name: 'Vitalidade',        elemento: 'sangue', effect: '+15 PV (só ativa após 1 dia de uso).' },
  { name: 'Proteção Elemental', elemento: null, effect: 'Resistência 10 contra um elemento à escolha (o item passa a contar como desse elemento para oposição).' },
];

// Custo de categoria por maldição: a 1ª é +II, as seguintes +I cada.
export function custoCategoriaMaldicoes(qtdMaldicoes) {
  if (qtdMaldicoes <= 0) return 0;
  return 2 + (qtdMaldicoes - 1);
}

// Concatena dano extra (ex: "+1d8", "+2d6") ao final de uma notação de dano
// já existente (ex: "2d6+3") — resultado legível como "2d6+3 +1d8 (Lancinante)".
export function mergeDanoExtra(baseDamage, extraText, label) {
  const base = (baseDamage || '').trim();
  if (!extraText) return base;
  const tag = label ? ` (${label})` : '';
  return base ? `${base} ${extraText}${tag}` : `${extraText}${tag}`;
}

// "Calibre Grosso": mais um dado do MESMO TIPO do dado de dano já existente
// na arma (ex: base "2d6" → "+1d6"; se não achar um padrão XdY reconhecível,
// cai num "+1 dado" textual genérico pra não travar o fluxo).
export function calibreGrossoExtra(baseDamage) {
  const m = /(\d+)d(\d+)/i.exec(baseDamage || '');
  if (!m) return '+1 dado (mesmo tipo)';
  return `+1d${m[2]}`;
}
