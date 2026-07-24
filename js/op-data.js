// ══════════════════════════════════
// op-data.js — Dados pré-definidos de Ordem Paranormal
// (Rituais, Poderes Paranormais/Gerais, Poderes de Classe e de Trilha)
//
// Fonte: Livro de Regras (v1.3) e Sobrevivendo ao Horror — usados aqui
// apenas como referência de NOMES e um resumo funcional bem curto de
// cada entrada (uma linha), para servir de ponto de partida na ficha.
// Isso NÃO substitui o livro: círculo/execução/alcance/duração/dados
// exatos de cada ritual e o texto completo de cada poder devem ser
// conferidos no livro e preenchidos por quem estiver montando a ficha.
// Qualquer coisa que não esteja aqui (ou qualquer regra homebrew) pode
// ser criada livremente pelos botões "Criar Personalizado".
// ══════════════════════════════════

// Custo em PE por círculo (Tabela 5.2 do livro)
export const CUSTO_POR_CIRCULO = { 1: 1, 2: 3, 3: 6, 4: 10 };

// ─── Lista de Rituais (Livro de Regras, cap. 5) ───
// { name, elemento, circulo, efeito (resumo funcional bem curto) }
export const RITUAL_PRESETS = [
  // 1º Círculo — Conhecimento
  { name: 'Amaldiçoar Arma',        elemento: 'conhecimento', circulo: 1, efeito: 'Arma passa a causar mais dano.' },
  { name: 'Compreensão Paranormal', elemento: 'conhecimento', circulo: 1, efeito: 'Entende qualquer idioma escrito ou falado.' },
  { name: 'Enfeitiçar',             elemento: 'conhecimento', circulo: 1, efeito: 'Alvo fica prestativo com você.' },
  { name: 'Perturbação',            elemento: 'conhecimento', circulo: 1, efeito: 'Força o alvo a obedecer uma ordem simples.' },
  { name: 'Ouvir os Sussurros',     elemento: 'conhecimento', circulo: 1, efeito: 'Comunica-se com vozes do Outro Lado para obter informações.' },
  { name: 'Tecer Ilusão',           elemento: 'conhecimento', circulo: 1, efeito: 'Cria uma ilusão visual ou sonora.' },
  { name: 'Terceiro Olho',          elemento: 'conhecimento', circulo: 1, efeito: 'Permite ver manifestações paranormais.' },
  // 1º Círculo — Energia
  { name: 'Amaldiçoar Tecnologia',  elemento: 'energia', circulo: 1, efeito: 'Aprimora um item tecnológico.' },
  { name: 'Coincidência Forçada',   elemento: 'energia', circulo: 1, efeito: 'Concede bônus em testes.' },
  { name: 'Eletrocussão',           elemento: 'energia', circulo: 1, efeito: 'Corrente elétrica choca o alvo.' },
  { name: 'Embaralhar',             elemento: 'energia', circulo: 1, efeito: 'Cria duplicatas ilusórias, concedendo bônus na Defesa.' },
  { name: 'Luz',                    elemento: 'energia', circulo: 1, efeito: 'Um objeto passa a brilhar como uma lâmpada.' },
  { name: 'Polarização Caótica',    elemento: 'energia', circulo: 1, efeito: 'Objetos metálicos são atraídos ou repelidos.' },
  // 1º Círculo — Morte
  { name: 'Cicatrização',           elemento: 'morte', circulo: 1, efeito: 'Acelera a regeneração de um ferimento.' },
  { name: 'Consumir Manancial',     elemento: 'morte', circulo: 1, efeito: 'Suga tempo de vida de seres próximos, ganhando PV temporários.' },
  { name: 'Decadência',             elemento: 'morte', circulo: 1, efeito: 'Acelera o envelhecimento do alvo.' },
  { name: 'Definhar',               elemento: 'morte', circulo: 1, efeito: 'Alvo fica fatigado ou vulnerável.' },
  { name: 'Espirais da Perdição',   elemento: 'morte', circulo: 1, efeito: 'Inimigos na área sofrem penalidade em ataque.' },
  { name: 'Nuvem de Cinzas',        elemento: 'morte', circulo: 1, efeito: 'Nuvem de cinzas fornece camuflagem.' },
  // 1º Círculo — Sangue
  { name: 'Arma Atroz',             elemento: 'sangue', circulo: 1, efeito: 'Arma corpo a corpo ganha bônus em ataque e margem de ameaça.' },
  { name: 'Armadura de Sangue',     elemento: 'sangue', circulo: 1, efeito: 'Placas de sangue endurecido cobrem o corpo.' },
  { name: 'Aprimorar Físico',       elemento: 'sangue', circulo: 1, efeito: 'Bônus em Agilidade ou Força.' },
  { name: 'Corpo Adaptado',         elemento: 'sangue', circulo: 1, efeito: 'Ignora frio/calor extremos e respira debaixo d\u2019água.' },
  { name: 'Descarnar',              elemento: 'sangue', circulo: 1, efeito: 'Abre cortes profundos no alvo.' },
  { name: 'Distorcer Aparência',    elemento: 'sangue', circulo: 1, efeito: 'Muda a aparência de um ou mais alvos.' },
  { name: 'Flagelo de Sangue',      elemento: 'sangue', circulo: 1, efeito: 'Alvo precisa obedecer uma ordem.' },
  { name: 'Fortalecimento Sensorial', elemento: 'sangue', circulo: 1, efeito: 'Melhora sentidos e percepção.' },
  { name: 'Hemofagia',              elemento: 'sangue', circulo: 1, efeito: 'Absorve sangue do alvo: causa dano e cura você.' },
  { name: 'Ódio Incontrolável',     elemento: 'sangue', circulo: 1, efeito: 'Mais dano corpo a corpo, mas atrapalha calma/concentração.' },
  { name: 'Transfusão Vital',       elemento: 'sangue', circulo: 1, efeito: 'Transfere vida de você para curar outro ser instantaneamente.' },
  // 1º Círculo — Medo
  { name: 'Cinerária',              elemento: 'medo', circulo: 1, efeito: 'Névoa fortalece rituais na área.' },
  { name: 'Proteção contra Rituais', elemento: 'medo', circulo: 1, efeito: 'Alvo recebe resistência a efeitos e criaturas paranormais.' },
  { name: 'Rejeitar Névoa',         elemento: 'medo', circulo: 1, efeito: 'Enfraquece a conjuração de rituais próximos.' },

  // 2º Círculo — Conhecimento
  { name: 'Aprimorar Mente',        elemento: 'conhecimento', circulo: 2, efeito: 'Bônus em Intelecto ou Presença.' },
  { name: 'Detecção de Ameaças',    elemento: 'conhecimento', circulo: 2, efeito: 'Detecta seres hostis e armadilhas na área.' },
  { name: 'Esconder dos Olhos',     elemento: 'conhecimento', circulo: 2, efeito: 'Torna o usuário invisível por um tempo.' },
  { name: 'Invadir Mente',          elemento: 'conhecimento', circulo: 2, efeito: 'Rajada mental ou conexão telepática.' },
  { name: 'Localização',            elemento: 'conhecimento', circulo: 2, efeito: 'Aponta a direção de um objeto ou ser escolhido.' },
  // 2º Círculo — Energia
  { name: 'Chamas do Caos',         elemento: 'energia', circulo: 2, efeito: 'Controla o fogo à vontade.' },
  { name: 'Contenção Fantasmagórica', elemento: 'energia', circulo: 2, efeito: 'Laços de energia prendem o alvo.' },
  { name: 'Dissonância Acústica',   elemento: 'energia', circulo: 2, efeito: 'Cria uma área onde é impossível ouvir sons.' },
  { name: 'Sopro do Caos',          elemento: 'energia', circulo: 2, efeito: 'Move o ar de formas impossíveis.' },
  { name: 'Tela de Ruído',          elemento: 'energia', circulo: 2, efeito: 'Película protetora que absorve dano.' },
  // 2º Círculo — Morte
  { name: 'Desacelerar Impacto',    elemento: 'morte', circulo: 2, efeito: 'Reduz dano de queda e de projéteis.' },
  { name: 'Eco Espiral',            elemento: 'morte', circulo: 2, efeito: 'Repete ao longo do tempo o dano que o alvo sofreu.' },
  { name: 'Miasma Entrópico',       elemento: 'morte', circulo: 2, efeito: 'Nuvem tóxica enjoa e sufoca os alvos.' },
  { name: 'Paradoxo',               elemento: 'morte', circulo: 2, efeito: 'Área de tempo paradoxal que envelhece corpo e alma.' },
  { name: 'Velocidade Mortal',      elemento: 'morte', circulo: 2, efeito: 'Alvo acelera no tempo e age mais rápido.' },

  // 3º Círculo — Conhecimento
  { name: 'Alterar Memória',        elemento: 'conhecimento', circulo: 3, efeito: 'Apaga ou modifica a memória recente do alvo.' },
  { name: 'Contato Paranormal',     elemento: 'conhecimento', circulo: 3, efeito: 'Barganha com o Outro Lado por ajuda.' },
  { name: 'Mergulho Mental',        elemento: 'conhecimento', circulo: 3, efeito: 'Infiltra-se na mente do alvo para vasculhar pensamentos.' },
  { name: 'Vidência',               elemento: 'conhecimento', circulo: 3, efeito: 'Observa e ouve um alvo à distância.' },
  // 3º Círculo — Energia
  { name: 'Convocação Instantânea', elemento: 'energia', circulo: 3, efeito: 'Teletransporta um objeto marcado para suas mãos.' },
  { name: 'Salto Fantasma',         elemento: 'energia', circulo: 3, efeito: 'Teletransporta você e outros para um ponto no alcance.' },
  { name: 'Transfigurar Água',      elemento: 'energia', circulo: 3, efeito: 'Água e gelo se comportam de forma caótica.' },
  { name: 'Transfigurar Terra',     elemento: 'energia', circulo: 3, efeito: 'Rocha, lama e areia se comportam de forma caótica.' },
  // 3º Círculo — Morte
  { name: 'Âncora Temporal',        elemento: 'morte', circulo: 3, efeito: 'Impede o alvo de se afastar de um ponto.' },
  { name: 'Poeira da Podridão',     elemento: 'morte', circulo: 3, efeito: 'Nuvem de poeira apodrece tudo que toca.' },
  { name: 'Tentáculos de Lodo',     elemento: 'morte', circulo: 3, efeito: 'Tentáculos negros atacam e agarram seres na área.' },
  { name: 'Zerar Entropia',         elemento: 'morte', circulo: 3, efeito: 'Alvo fica lento ou paralisado.' },
  // 3º Círculo — Sangue
  { name: 'Ferver Sangue',          elemento: 'sangue', circulo: 3, efeito: 'Faz o sangue do alvo ferver: dano e fraqueza.' },
  { name: 'Forma Monstruosa',       elemento: 'sangue', circulo: 3, efeito: 'Você assume forma de uma criatura monstruosa.' },
  { name: 'Purgatório',             elemento: 'sangue', circulo: 3, efeito: 'Área de sangue fere quem tenta sair dela.' },
  { name: 'Vomitar Pestes',         elemento: 'sangue', circulo: 3, efeito: 'Vomita um enxame de pequenas criaturas de Sangue.' },
  // 3º Círculo — Medo
  { name: 'Dissipar Ritual',        elemento: 'medo', circulo: 3, efeito: 'Cancela os efeitos de rituais em um alvo/área.' },

  // 4º Círculo — Conhecimento
  { name: 'Controle Mental',        elemento: 'conhecimento', circulo: 4, efeito: 'A mente da vítima passa a ser controlada por outra pessoa.' },
  { name: 'Inexistir',              elemento: 'conhecimento', circulo: 4, efeito: 'Apaga completamente um alvo tocado da existência.' },
  { name: 'Possessão',              elemento: 'conhecimento', circulo: 4, efeito: 'Transfere sua consciência para o corpo do alvo.' },
  // 4º Círculo — Energia
  { name: 'Alterar Destino',        elemento: 'energia', circulo: 4, efeito: 'Enxerga o futuro próximo e pode alterar um resultado.' },
  { name: 'Deflagração de Energia', elemento: 'energia', circulo: 4, efeito: 'Explosão de energia bruta causa dano.' },
  { name: 'Teletransporte',        elemento: 'energia', circulo: 4, efeito: 'Teletransporta você e outros seres.' },
  // 4º Círculo — Morte
  { name: 'Convocar o Algoz',       elemento: 'morte', circulo: 4, efeito: 'Conjura o maior medo do alvo para persegui-lo.' },
  { name: 'Distorção Temporal',     elemento: 'morte', circulo: 4, efeito: 'Você age livremente por um curto período.' },
  { name: 'Fim Inevitável',         elemento: 'morte', circulo: 4, efeito: 'Ruptura no espaço que suga tudo ao redor.' },
  // 4º Círculo — Sangue
  { name: 'Capturar o Coração',     elemento: 'sangue', circulo: 4, efeito: 'Manipula emoções e vontades do alvo, tornando-o aliado.' },
  { name: 'Invólucro de Carne',     elemento: 'sangue', circulo: 4, efeito: 'Cria um clone de carne e sangue com stats do alvo.' },
  { name: 'Vínculo de Sangue',      elemento: 'sangue', circulo: 4, efeito: 'Alvo passa a sofrer todo dano que você sofrer.' },
  // 4º Círculo — Medo (exigem poder de trilha específico)
  { name: 'Canalizar o Medo',       elemento: 'medo', circulo: 4, efeito: '[Requer poder de trilha] Transfere parte do seu poder paranormal a um alvo.' },
  { name: 'Conhecendo o Medo',      elemento: 'medo', circulo: 4, efeito: '[Requer poder de trilha] Manifesta o Medo absoluto na mente do alvo.' },
  { name: 'Lâmina do Medo',         elemento: 'medo', circulo: 4, efeito: '[Requer poder de trilha] Golpeia o alvo com uma lâmina de medo puro.' },
  { name: 'Medo Tangível',          elemento: 'medo', circulo: 4, efeito: '[Requer poder de trilha] Concede uma série de imunidades.' },
  { name: 'Presença do Medo',       elemento: 'medo', circulo: 4, efeito: '[Requer poder de trilha] Você assume uma forma impossível na Realidade.' },
];

// ─── Poderes Paranormais (gerais — obtidos via poder de classe "Transcender") ───
export const PODER_PARANORMAL_PRESETS = [
  { name: 'Aprender Ritual',        elemento: 'geral',        efeito: 'Aprende um ritual de 1º círculo (3º em NEX 75%+).' },
  { name: 'Afinidade Elemental',    elemento: 'geral',        efeito: 'Em NEX 50%, ganha afinidade com um elemento escolhido.' },
  { name: 'Resistir a <Elemento>',  elemento: 'geral',        efeito: 'Resistência 10 contra o elemento escolhido.' },
  { name: 'Expansão de Conhecimento', elemento: 'conhecimento', efeito: 'Aprende um poder de classe que não é da sua classe.' },
  { name: 'Percepção Paranormal',   elemento: 'conhecimento', efeito: 'Pode rolar novamente um dado baixo ao procurar pistas.' },
  { name: 'Precognição',            elemento: 'conhecimento', efeito: '+2 em Defesa e em testes de resistência.' },
  { name: 'Sensitivo',              elemento: 'conhecimento', efeito: '+5 em Diplomacia, Intimidação e Intuição.' },
  { name: 'Visão do Oculto',        elemento: 'conhecimento', efeito: '+5 em Percepção e enxerga no escuro.' },
  { name: 'Afortunado',             elemento: 'energia',      efeito: 'Pode rolar novamente um resultado 1 (exceto d20).' },
  { name: 'Campo Protetor',         elemento: 'energia',      efeito: '+5 em Defesa ao usar a ação esquiva (custa PE).' },
  { name: 'Causalidade Fortuita',   elemento: 'energia',      efeito: 'DT para procurar pistas diminui em investigação.' },
  { name: 'Golpe de Sorte',         elemento: 'energia',      efeito: '+1 na margem de ameaça dos seus ataques.' },
  { name: 'Manipular Entropia',     elemento: 'energia',      efeito: 'Força um inimigo a rolar novamente um teste de perícia.' },
  { name: 'Encarar a Morte',        elemento: 'morte',        efeito: 'Aumenta seu limite de gasto de PE por rodada em cenas de ação.' },
  { name: 'Escapar da Morte',       elemento: 'morte',        efeito: 'Uma vez por cena, sobrevive com 1 PV em vez de cair a 0.' },
  { name: 'Potencial Aprimorado',   elemento: 'morte',        efeito: 'PE adicionais que escalam com o NEX.' },
  { name: 'Potencial Reaproveitado', elemento: 'morte',       efeito: 'Ganha PE temporários ao passar em testes de resistência.' },
  { name: 'Surto Temporal',         elemento: 'morte',        efeito: 'Uma ação padrão adicional por cena (custa PE).' },
  { name: 'Anatomia Insana',        elemento: 'sangue',       efeito: 'Chance de ignorar dano extra de crítico/furtivo.' },
  { name: 'Arma de Sangue',         elemento: 'sangue',       efeito: 'Cria garras/lâmina de sangue como arma extra.' },
  { name: 'Sangue de Ferro',        elemento: 'sangue',       efeito: 'PV extras que escalam com o NEX.' },
  { name: 'Sangue Fervente',        elemento: 'sangue',       efeito: 'Bônus em Agilidade ou Força enquanto machucado.' },
  { name: 'Sangue Vivo',            elemento: 'sangue',       efeito: 'Cura acelerada ao ficar machucado pela primeira vez na cena.' },
];

// ─── Poderes de Classe (Livro de Regras, cap. 1) ───
export const PODER_CLASSE_PRESETS = {
  combatente: [
    { name: 'Armamento Pesado',        efeito: 'Proficiência com armas pesadas. Pré-requisito: For 2.' },
    { name: 'Artista Marcial',         efeito: 'Ataques desarmados causam 1d6 (1d8 em NEX 35%, 1d10 em NEX 70%), letal e ágil.' },
    { name: 'Ataque de Oportunidade',  efeito: 'Reação + 1 PE: ataque corpo a corpo quando alguém sai de um espaço adjacente.' },
    { name: 'Combater com Duas Armas', efeito: 'Ataca com as duas armas empunhadas (com penalidade). Pré-requisitos: Agi 3, treinado em Luta/Pontaria.' },
    { name: 'Combate Defensivo',       efeito: '–O em ataque, +5 em Defesa ao agredir. Pré-requisito: Int 2.' },
    { name: 'Golpe Demolidor',         efeito: '1 PE: +2 dados de dano ao quebrar/atacar objetos. Pré-requisitos: For 2, treinado em Luta.' },
    { name: 'Golpe Pesado',            efeito: 'Dano de arma corpo a corpo aumenta em um dado.' },
    { name: 'Incansável',              efeito: 'Uma vez por cena, 2 PE: ação de investigação adicional usando For/Agi.' },
    { name: 'Presteza Atlética',       efeito: '1 PE: usa For/Agi no lugar do atributo-base da perícia de investigação.' },
    { name: 'Proteção Pesada',         efeito: 'Proficiência com Proteções Pesadas. Pré-requisito: NEX 30%.' },
    { name: 'Reflexos Defensivos',     efeito: '+2 em Defesa e testes de resistência. Pré-requisito: Agi 2.' },
    { name: 'Saque Rápido',            efeito: 'Sacar/guardar itens e recarregar como ação livre.' },
    { name: 'Segurar o Gatilho',       efeito: 'Ataques extras com arma de fogo contra o mesmo alvo, pagando PE crescente.' },
    { name: 'Sentido Tático',          efeito: '2 PE: bônus em Defesa/resistência igual ao Intelecto até o fim da cena.' },
    { name: 'Tanque de Guerra',        efeito: '+2 em Defesa e resistência a dano de proteção pesada. Pré-requisito: Proteção Pesada.' },
    { name: 'Tiro Certeiro',           efeito: 'Soma Agilidade no dano com arma de disparo; ignora penalidade corpo a corpo.' },
    { name: 'Tiro de Cobertura',       efeito: '1 PE: força um alvo a se proteger com um teste de Pontaria x Vontade.' },
    { name: 'Transcender',             efeito: 'Recebe um poder paranormal, mas não ganha Sanidade neste NEX.' },
    { name: 'Treinamento em Perícia',  efeito: 'Torna-se treinado (ou sobe de grau) em duas perícias.' },
  ],
  especialista: [
    { name: 'Artista Marcial',         efeito: 'Ataques desarmados causam 1d6 (1d8 em NEX 35%, 1d10 em NEX 70%), letal e ágil.' },
    { name: 'Balística Avançada',      efeito: 'Proficiência com armas táticas de fogo; +2 no dano com armas de fogo.' },
    { name: 'Conhecimento Aplicado',   efeito: '2 PE: usa Intelecto como atributo-base da perícia (exceto Luta/Pontaria). Pré-requisito: Int 2.' },
    { name: 'Hacker',                  efeito: '+5 em Tecnologia para invadir sistemas; hackear leva menos tempo. Pré-requisito: treinado em Tecnologia.' },
    { name: 'Mãos Rápidas',            efeito: '1 PE: teste de Crime como ação livre. Pré-requisitos: Agi 3, treinado em Crime.' },
    { name: 'Mochila de Utilidades',   efeito: 'Um item (exceto armas) ocupa uma categoria e espaço a menos.' },
    { name: 'Movimento Tático',        efeito: '1 PE: ignora penalidade de terreno difícil/escalada no turno. Pré-requisito: treinado em Atletismo.' },
    { name: 'Na Trilha Certa',         efeito: '1 PE por sucesso em procurar pistas: bônus cumulativo no próximo teste.' },
    { name: 'Nerd',                    efeito: '2 PE, 1x/cena: teste de Atualidades para obter uma informação útil.' },
    { name: 'Ninja Urbano',            efeito: 'Proficiência com armas táticas corpo a corpo/disparo; +2 no dano com elas.' },
    { name: 'Pensamento Ágil',         efeito: '2 PE: ação de procurar pistas adicional em cena de investigação.' },
    { name: 'Perito em Explosivos',    efeito: 'Soma Intelecto na DT dos seus explosivos; pode excluir alvos da explosão.' },
    { name: 'Primeira Impressão',      efeito: '+OO no primeiro teste social (Diplomacia/Enganação/Intimidação/Intuição) da cena.' },
    { name: 'Transcender',             efeito: 'Recebe um poder paranormal, mas não ganha Sanidade neste NEX.' },
    { name: 'Treinamento em Perícia',  efeito: 'Torna-se treinado (ou sobe de grau) em duas perícias.' },
  ],
  ocultista: [
    { name: 'Camuflar Ocultismo',      efeito: 'Esconde sigilos/símbolos; +2 PE para lançar ritual sem gestos/componentes.' },
    { name: 'Criar Selo',              efeito: 'Fabrica selos paranormais de rituais conhecidos.' },
    { name: 'Envolto em Mistério',     efeito: '+5 em Enganação/Intimidação contra quem não é treinado em Ocultismo.' },
    { name: 'Especialista em Elemento', efeito: '+2 na DT para resistir aos rituais do elemento escolhido.' },
    { name: 'Ferramentas Paranormais', efeito: 'Reduz categoria de item paranormal em I; ativa sem pagar PE.' },
    { name: 'Fluxo de Poder',          efeito: 'Mantém 2 efeitos sustentados de rituais com uma ação livre. Pré-requisito: NEX 60%.' },
    { name: 'Guiado pelo Paranormal',  efeito: '2 PE, 1x/cena: ação de investigação adicional.' },
    { name: 'Identificação Paranormal', efeito: '+10 em Ocultismo para identificar criaturas, objetos ou rituais.' },
    { name: 'Improvisar Componentes',  efeito: '1x/cena: teste de Investigação para achar componentes ritualísticos.' },
    { name: 'Intuição Paranormal',     efeito: 'Soma Intelecto ou Presença ao facilitar investigação.' },
    { name: 'Mestre em Elemento',      efeito: '–1 PE no custo de rituais do elemento. Pré-requisitos: Especialista no elemento, NEX 45%.' },
    { name: 'Ritual Potente',          efeito: 'Soma Intelecto no dano/cura dos seus rituais. Pré-requisito: Int 2.' },
    { name: 'Ritual Predileto',        efeito: '–1 PE no custo de um ritual escolhido (acumulável).' },
    { name: 'Tatuagem Ritualística',   efeito: '–1 PE em rituais de alcance pessoal com você como alvo.' },
    { name: 'Transcender',             efeito: 'Recebe um poder paranormal, mas não ganha Sanidade neste NEX.' },
    { name: 'Treinamento em Perícia',  efeito: 'Torna-se treinado (ou sobe de grau) em duas perícias.' },
  ],
};

// ─── Poderes de Trilha (amostra — cada trilha tem mais poderes nos NEX
// 40%/65%/99%; confira o livro para os tiers seguintes) ───
export const TRILHA_PODER_PRESETS = {
  combatente: [
    { trilha: 'Aniquilador',        nex: 10, name: 'A Favorita',    efeito: 'Escolhe uma arma favorita; categoria dela reduzida em I.' },
    { trilha: 'Comandante de Campo', nex: 10, name: '(ver livro p.26)', efeito: 'Poder de liderança em combate — consulte o livro.' },
  ],
  especialista: [
    { trilha: 'Atirador de Elite', nex: 10, name: 'Mira de Elite',   efeito: 'Proficiência com balas longas; soma Intelecto no dano dessas armas.' },
    { trilha: 'Infiltrador',       nex: 10, name: 'Ataque Furtivo',  efeito: '1 PE: +1d6 de dano contra alvo desprevenido/flanqueado (escala com NEX).' },
  ],
  ocultista: [
    { trilha: 'Conduíte',    nex: 10, name: 'Ampliar Ritual', efeito: '+2 PE: aumenta alcance em um passo ou dobra a área do ritual.' },
    { trilha: 'Flagelador',  nex: 10, name: 'Poder do Flagelo', efeito: 'Pode pagar custo de PE de rituais com PV (2 PV por PE).' },
  ],
};
