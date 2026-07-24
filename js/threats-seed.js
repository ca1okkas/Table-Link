// ══════════════════════════════════════════════════════════════
// threats-seed.js — Ameaças pré-salvas (bestiário oficial)
//
// Lista de ameaças pré-carregadas, extraídas dos livros:
//   • Ordem Paranormal (Kabum!/New Order) — cap. Criaturas/Ameaças, p.192–299
//   • Sobrevivendo ao Horror v1.3 — cap. de Ameaças, p.128–166
//
// Cada entrada segue exatamente o mesmo formato de uma ameaça criada
// manualmente pelo usuário (ver ThreatManager.createThreat em
// threats.js) — a única diferença é o "id" fixo (prefixo "seed_"),
// usado pra reconhecer essas entradas entre reinicializações e decidir
// o que semear a mais quando novas ameaças forem adicionadas aqui numa
// atualização futura (ver _seedDefaults em threats.js).
//
// IMPORTANTE: isso é só uma biblioteca inicial — o usuário continua
// podendo criar, editar e apagar qualquer ameaça normalmente,
// incluindo as pré-salvas (uma vez apagada, não volta sozinha).
//
// Formato de "teste" e "danos": segue a fórmula de dados do app
// ("NdX+M"), com testes em d20 (ex: "3d20+15") representando o que o
// livro mostra como "3D+15" (rola os d20 e usa o maior, ver dice.js).
//
// ── ORGANIZAÇÃO ──────────────────────────────────────────────────
// As 95 ameaças estão agrupadas por elemento predominante (tag de VD
// do livro) e, dentro de cada grupo, em ordem CRESCENTE de VD:
//   1. SANGUE                     (14 ameaças)
//   2. MORTE                      (15 ameaças)
//   3. CONHECIMENTO                (16 ameaças)
//   4. ENERGIA                     (15 ameaças — inclui as que tinham
//      sido guardadas aqui como "Medo" numa revisão anterior; "Medo"
//      não é uma tag de VD real nas páginas consultadas dos livros —
//      cada uma delas foi conferida de novo contra a ficha de VD do
//      livro (checando inclusive Resistência ao próprio elemento /
//      Vulnerabilidade ao elemento oposto) e corrigida pro elemento
//      verdadeiro: Vulto, O Uivar, Melancolia, Rastejador Sombrio,
//      Espreitador, Bicho-Papão, Degolificada, Estrangeiro, Silhueta e
//      Máscara do Desespero foram todas para Conhecimento ou Energia;
//      de quebra, Sukkalgir, Viajante, Espectro Inesquecido,
//      Infecticídio, Telopsia e Anfitrião também estavam com o
//      elemento trocado (tag do livro é Energia, não Conhecimento) e
//      foram corrigidas junto.
//   5. AMEAÇAS DA REALIDADE       (35 ameaças — humanos e animais das
//      seções "NPCs"/"Animais" do livro, sem elemento paranormal)
//
// Extração 100% completa dos dois livros nas faixas de página pedidas
// (Ordem Paranormal p.192–299 e Sobrevivendo ao Horror p.128–166).
// ══════════════════════════════════════════════════════════════

export const THREATS_SEED = [
  // ══════════════════════════════════════════════════════════════
  // Ameaças reordenadas por categoria (elemento) e VD DECRESCENTE
  // (maior VD -> menor VD dentro de cada categoria)
  // ══════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────
  // 1. CRIATURAS DE SANGUE
  // ────────────────────────────────────────────────────────────
{
    "id": "seed_op_o_diabo",
    "elemento": "Sangue",
    "name": "O Diabo",
    "photo": null,
    "vd": 400,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 6,
      "forca": 6,
      "intelecto": 6,
      "presenca": 6,
      "vigor": 6
    },
    "defesa": 66,
    "deslocamento": "18m",
    "pv": 1666,
    "pvMax": 1666,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "6d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "6d20+35"
      },
      {
        "nome": "Fortitude",
        "formula": "6d20+35"
      },
      {
        "nome": "Reflexos",
        "formula": "6d20+35"
      },
      {
        "nome": "Vontade",
        "formula": "6d20+35"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a atordoado, condições de paralisia e a dano e efeitos de Sangue. Resistência a Balístico, impacto e perfuração 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver o Diabo pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 45) ou sofre 10d8 pontos de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Chifre do Diabo",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico x3)",
        "teste": "6d20+45",
        "danos": [
          "2d8+50 Sangue"
        ]
      },
      {
        "nome": "Arma Sangrenta",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico x3)",
        "teste": "6d20+45",
        "danos": [
          "2d10+50 Sangue"
        ]
      },
      {
        "nome": "Arma Sangrenta (arremesso)",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Médio, crítico x3)",
        "teste": "6d20+45",
        "danos": [
          "2d10+50 Sangue"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Ardiloso",
        "descricao": "O Diabo gosta de fazer pactos e ocasionalmente aparece para pessoas normais — pode escolher não ativar sua Presença Perturbadora ao encontrar um personagem."
      },
      {
        "nome": "Decepar Máscara",
        "descricao": "A intensidade dos sentimentos do Diabo é a única coisa capaz de romper a calmaria do Equilíbrio e resolver o Enigma de Medo da Máscara do Desespero."
      },
      {
        "nome": "Potência de Sangue",
        "descricao": "O Diabo recupera 50 PV no início de cada um de seus turnos. Seu modificador para testes de perícia baseados em Força, Vigor ou Presença é +35; para os demais atributos, +25."
      },
      {
        "nome": "[Livre] Explodir em Sangue",
        "descricao": "O Diabo controla o sangue de qualquer ser com o qual tenha contato direto. Se causar dano com sua arma sangrenta, ou tocar diretamente uma ferida de um personagem, causa 10d6 de dano de Sangue. Pode usar esta habilidade duas vezes por turno."
      },
      {
        "nome": "[Livre] Sangrar",
        "descricao": "Se acertar um ataque com o chifre, pode soltá-lo, deixando-o preso no personagem, que sofre vulnerabilidade a Sangue até removê-lo (ação padrão, causando 8d8 de dano de Sangue ao removê-lo). O chifre sempre cresce de volta no começo do turno do Diabo."
      },
      {
        "nome": "[Movimento] Transportar pelo Sangue",
        "descricao": "O Diabo pode se movimentar através do Sangue, inclusive o que esteja saindo de um personagem. Com uma ação de movimento, desloca-se para qualquer espaço com grande quantidade de sangue exposta ou adjacente a um personagem machucado ou morrendo."
      },
      {
        "nome": "[Padrão] Senhor do Sangue",
        "descricao": "Uma vez por cena, pode invocar e controlar uma ou mais criaturas de Sangue cujo VD total some até 400. As criaturas aparecem em alcance médio do Diabo e agem a partir da próxima rodada, no turno dele."
      },
      {
        "nome": "[Padrão] Pacto",
        "descricao": "Oferece ao alvo um pacto de Sangue. Se aceito, o Diabo cumpre o prometido, normalmente com resoluções distorcidas ao pé da letra. Em troca, o alvo sofre 10d6 de dano mental e, se enlouquecer, se torna um servo obcecado pelo Diabo pelo resto da vida."
      },
      {
        "nome": "[Completa] Desejos de Sangue",
        "descricao": "Todos os personagens em alcance médio do Diabo entram em fúria de Sangue e atacam outro personagem em alcance curto à escolha do Diabo (Vontade DT 45 evita). Um afetado deve usar a ação com maior potencial de dano, mas não pode conjurar rituais. Quem passar no teste fica imune até o final da cena."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Ninguém sabe como derrotar o Diabo — mas sabe-se que a Morte é a entidade opressora do Sangue. Quando seu Enigma de Medo for resolvido, ele perde sua imunidade a dano e seus bônus de testes de resistência são reduzidos para +25."
      }
    ],
    "descricao": "O Príncipe do Ódio, o Imperador das Aberrações, o Portador do Trono ou o Sangue Encarnado: uma das manifestações do Outro Lado mais significativas da história da Realidade, nunca derrotado, controlado ou aprisionado, capaz de invocar e controlar qualquer criatura paranormal irracional associada ao Sangue. Não age com sutileza — gosta de aparecer pessoalmente e se alimenta dos sentimentos extremos e descontrolados de quem interage com ele. Sua origem mais comum é um Pacto, e aqueles que buscam sua ajuda ou o desafiam sofrem consequências terríveis."
  },

{
    "id": "seed_op_aniquilacao",
    "elemento": "Sangue",
    "name": "Aniquilação",
    "photo": null,
    "vd": 380,
    "tipo": "Criatura",
    "porte": "Colossal",
    "attrs": {
      "agilidade": 4,
      "forca": 5,
      "intelecto": 3,
      "presenca": 4,
      "vigor": 5
    },
    "defesa": 58,
    "deslocamento": "15m",
    "pv": 1200,
    "pvMax": 1200,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "4d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+30"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "4d20+20"
      },
      {
        "nome": "Atletismo",
        "formula": "5d20+20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a dano 50. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver a Aniquilação pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 45) ou sofre 9d8 pontos de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+40",
        "danos": [
          "4d10+30 Sangue"
        ]
      },
      {
        "nome": "Tentáculos Espinhentos",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+40",
        "danos": [
          "2d12+30 Sangue"
        ]
      },
      {
        "nome": "Disparo de Espinhos",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x3 (Médio)",
        "teste": "4d20+40",
        "danos": [
          "2d10+20 Sangue"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Reação] Agarrão",
        "descricao": "Se a Aniquilação acertar um ataque de tentáculos espinhentos, ela pode tentar agarrar o alvo (teste 5d20+50). Ela pode manter até quatro personagens agarrados por vez."
      },
      {
        "nome": "[Reação] Instinto Aniquilador",
        "descricao": "Sempre que um personagem em alcance curto da Aniquilação se movimenta mais do que 3m, a Aniquilação realiza um ataque de tentáculos espinhentos contra o personagem."
      },
      {
        "nome": "[Livre] Apertar e Destruir",
        "descricao": "No início do seu turno, a Aniquilação aperta os personagens agarrados com seus tentáculos, causando 40 pontos de dano de Sangue."
      },
      {
        "nome": "[Movimento] Bater as Asas",
        "descricao": "A Aniquilação bate suas asas, criando um som ensurdecedor. Cada personagem em alcance longo sofre 8d6 pontos de dano Mental, é empurrado 6m para longe da Aniquilação e fica atordoado por uma rodada (Fortitude DT 40 reduz o dano à metade e evita os efeitos)."
      },
      {
        "nome": "[Movimento] Estrangulamento Final",
        "descricao": "A Aniquilação se desloca 15m enquanto seus inúmeros braços agarram e estrangulam personagens no caminho. Cada personagem que ficar adjacente a Aniquilação durante esse deslocamento fica agarrado e asfixiado (Reflexos DT 30 evita). Um agarrado pode escapar gastando uma ação padrão e passando em um teste de Reflexos DT 30."
      },
      {
        "nome": "[Completa] Tempestade de Espinhos",
        "descricao": "A Aniquilação lança todos os seus espinhos. Todos os personagens em alcance médio sofrem 20d6+20 pontos de dano de Sangue (Reflexos DT 40 reduz à metade). Só pode ser usada uma vez por cena; quando usada, a Aniquilação perde seu disparo de espinhos até o fim da cena."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "O Enigma de Medo da Aniquilação é desconhecido. Quando resolvido, ela perde sua resistência a dano e a habilidade Tempestade de Espinhos."
      }
    ],
    "descricao": "A maior criatura já registrada na história da Realidade, uma aberração colossal com mais de dez metros de altura, também conhecida como \"A Besta do Apocalipse\" ou \"O Dragão do Inferno\". Seus enormes braços se ramificam em inúmeros outros braços menores que se movem de forma irregular tentando agarrar tudo ao redor, e espinhos alongados cobrem seus tentáculos. No centro do corpo há uma enorme bocarra com dentes do tamanho de pessoas adultas. Não existem registros de alguém que tenha derrotado a Aniquilação — lendas dizem que ela nunca foi de fato vencida, apenas dorme em algum lugar da Realidade, aguardando seu despertar."
  },

{
    "id": "seed_op_kerberos",
    "elemento": "Sangue",
    "name": "Kerberos",
    "photo": null,
    "vd": 340,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 4,
      "forca": 5,
      "intelecto": 0,
      "presenca": 3,
      "vigor": 5
    },
    "defesa": 46,
    "deslocamento": "18m",
    "pv": 1150,
    "pvMax": 1150,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+25"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+20"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      },
      {
        "nome": "Atletismo",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto, perfuração e Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o Kerberos pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 35) ou sofre 10d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 99%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "5d20+40",
        "danos": [
          "4d12+30 Sangue"
        ]
      },
      {
        "nome": "Disparo de Espinhos",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Médio)",
        "teste": "4d20+35",
        "danos": [
          "4d8+20 Sangue"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Devorar",
        "descricao": "Uma vez por cena, quando reduz os PV de um personagem a 0 com sua mordida, o Kerberos pode devorá-lo, matando-o instantaneamente e recuperando PV iguais à metade dos PV totais da vítima. A vítima tem direito a um teste de Fortitude (DT 40) para evitar."
      },
      {
        "nome": "[Completa] Derrubar e Devorar",
        "descricao": "O Kerberos usa a manobra derrubar em um personagem a até 3m (teste 5d20+45). Se vencer, desfere três ataques de mordida contra o personagem, com dano aumentado para 4d12+40."
      },
      {
        "nome": "Ataque Flexível",
        "descricao": "O Kerberos é movido por sede de Sangue e desejo de matar. Pode executar até quatro ataques por rodada, combinando corpo a corpo e à distância, mas nunca o mesmo ataque mais de três vezes na mesma rodada."
      }
    ],
    "descricao": "O cão de três cabeças, o demônio do poço, o guardião do portão do inferno. Besta enorme com mais de três metros de altura e sete de comprimento, seis patas, cauda, espinhos e veias saltadas pela pele vermelha carnosa, com três cabeças de bocas asquerosas. Só se manifesta em um \"Inferno\" — área tomada pelo Sangue com a Membrana devastada — protegendo uma entrada importante. É ilógico e não toma decisões estratégicas, apenas defende um ponto específico."
  },

{
    "id": "seed_op_carente",
    "elemento": "Sangue",
    "name": "Carente",
    "photo": null,
    "vd": 300,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 4,
      "forca": 4,
      "intelecto": 2,
      "presenca": 3,
      "vigor": 4
    },
    "defesa": 40,
    "deslocamento": "12m",
    "pv": 700,
    "pvMax": 700,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+25"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      },
      {
        "nome": "Atletismo",
        "formula": "4d20+20"
      },
      {
        "nome": "Enganação",
        "formula": "3d20+15"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto, perfuração e Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o carente pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 35) ou sofre 7d8 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 90%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Garras de Sangue",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+35",
        "danos": [
          "2d8+20 Sangue"
        ]
      },
      {
        "nome": "Ferrão de Sangue",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "4d20+35",
        "danos": [
          "2d12+20 Sangue"
        ]
      },
      {
        "nome": "Tentáculo",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "4d20+35",
        "danos": [
          "2d8+20 Sangue"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Regeneração de Sangue",
        "descricao": "O carente possui Cura Acelerada 20. Se ficar inconsciente ou sofrer dano de Energia, esta habilidade deixa de funcionar até o fim da cena."
      },
      {
        "nome": "Carência",
        "descricao": "Qualquer ser que já esteve envolvido na gestação de outro ser recebe +1d20 em ataques contra o carente, porém o carente também recebe +1d20 em ataques contra esse ser."
      },
      {
        "nome": "[Movimento] Forma Infantil",
        "descricao": "O carente se contorce de volta para o corpo da pequena criança para passar em espaços pequenos. Também não consegue abrir a primeira porta para entrar em um lugar — uma vez que essa porta é aberta e ele deixa de estar na forma infantil, ignora essa restrição."
      },
      {
        "nome": "[Reação] Rasteira de Tentáculo",
        "descricao": "Uma vez por rodada, quando fica adjacente a dois ou mais seres, o carente faz um ataque de tentáculo contra um deles. Se acertar, a vítima fica caída e é empurrada 6m para longe dele."
      },
      {
        "nome": "[Livre] Sugada Mortal",
        "descricao": "Usando seu ferrão, o carente suga fluidos e apodrece órgãos internos. Um ser atingido pelo ferrão de sangue fica debilitado e enjoado até o fim da cena (Fortitude DT 35 evita)."
      },
      {
        "nome": "[Movimento] Você é Minha Mamãe?",
        "descricao": "O carente usa a parte que simula o corpo de uma criança para abraçar um ser adjacente, que fica paralisado até ser solto (Reflexos DT 25 evita). Pode manter o abraço indefinidamente, mas é forçado a soltar o alvo se sofrer dano de Energia."
      }
    ],
    "descricao": "Criatura famosa do escritor de terror Daniel Hartmann: uma manifestação nascida da inveja de um ser que nunca sentiu amor e busca devorar os órgãos de quem já foi mãe. Toma originalmente a forma de uma criança com lacerações no rosto, batendo em portas e chamando por sua mãe — mas ao ser deixado entrar, revela uma criatura bizarra de mais de três metros com pele gosmenta e um grande ferrão. Não consegue abrir a primeira porta sozinho."
  },

{
    "id": "seed_op_minotauro",
    "elemento": "Sangue",
    "name": "Minotauro",
    "photo": null,
    "vd": 280,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 4,
      "forca": 5,
      "intelecto": 1,
      "presenca": 3,
      "vigor": 5
    },
    "defesa": 44,
    "deslocamento": "12m",
    "pv": 750,
    "pvMax": 750,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+10"
      },
      {
        "nome": "Atletismo",
        "formula": "5d20+20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto, perfuração e Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o minotauro pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 35) ou sofre 8d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 80%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Chifres",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "5d20+30",
        "danos": [
          "6d12+20 perfuração"
        ]
      },
      {
        "nome": "Machado",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+32",
        "danos": [
          "4d12+20 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Cravar Chifres",
        "descricao": "Se fizer uma investida com os chifres e acertar, o minotauro os crava no alvo, que fica agarrado (e enquanto isso não pode atacar com os chifres). No fim de cada turno da vítima ainda agarrada, ela sofre 4d12+20 de dano de Sangue."
      }
    ],
    "descricao": "Um animal enorme, furioso e bípede com mais de três metros, infectado com pústulas de Sangue e veias pulsantes por um lado inteiro do corpo. Originário das lendas gregas sobre um monstro terrível que habita labirintos. Em seu braço esquerdo há um enorme machado de lâmina dupla fundido em seus ossos e carne. Realiza investidas brutais buscando manter os alvos empalados em seus chifres enquanto usa seu instinto bestial para caçar dentro de seu labirinto."
  },

{
    "id": "seed_op_tita_de_sangue",
    "elemento": "Sangue",
    "name": "Titã de Sangue",
    "photo": null,
    "vd": 220,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 1,
      "forca": 5,
      "intelecto": 1,
      "presenca": 2,
      "vigor": 4
    },
    "defesa": 35,
    "deslocamento": "12m",
    "pv": 550,
    "pvMax": 550,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto, perfuração e Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 30,
        "descricao": "Ao ver o titã de Sangue pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 30) ou sofre 7d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 70%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+25",
        "danos": [
          "4d8+10 corte"
        ]
      },
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "5d20+25",
        "danos": [
          "4d12+10 perfuração"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Sede de Sangue",
        "descricao": "Os ataques do titã causam +4d6 pontos de dano de Sangue em personagens que estejam machucados ou sangrando."
      },
      {
        "nome": "[Livre] Estraçalhar",
        "descricao": "Se o titã acertar um ser com sua mordida, estraçalha o alvo, que sofre 4d12+10 de dano de perfuração e fica sangrando até o final da cena (Reflexos DT 30 reduz o dano à metade e evita a condição)."
      }
    ],
    "descricao": "A maior versão já encontrada de um zumbi de Sangue: uma criatura monstruosa com mais de quatro metros de altura, massa corporal de carne e Sangue endurecida e musculosa, veias saltadas por todo o corpo e uma enorme boca com quatro quelíceras gigantes. Manifestado apenas em locais com a Membrana debilitada onde massacres terríveis aconteceram, pode surgir do aglomerado de vários corpos em um só, ou de uma pessoa com exposição paranormal extremamente elevada devorada pelo Sangue."
  },

{
    "id": "seed_op_enpap_x",
    "elemento": "Sangue",
    "name": "Enpap-X",
    "photo": null,
    "vd": 180,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 2,
      "forca": 4,
      "intelecto": 1,
      "presenca": 3,
      "vigor": 3
    },
    "defesa": 36,
    "deslocamento": "9m",
    "pv": 360,
    "pvMax": 360,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto e perfuração 10, Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 25,
        "descricao": "Ao ver o enpap-X pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 25) ou sofre 6d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 60%+ são imunes."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "[Reação] Forma Desencadeada",
        "descricao": "Quando faz um acerto crítico com um socão ou com uma corrente, o enpap-X pode derrubar o alvo ou empurrá-lo 3m na direção oposta."
      },
      {
        "nome": "[Livre] Acorrentar",
        "descricao": "Se o enpap-X acertar um ataque de correntes, pode tentar agarrar o alvo (teste 2d20+17). No começo do seu turno, aperta os agarrados causando dano adicional de suas correntes."
      }
    ],
    "descricao": "Aberração originada de uma lenda perdida da antiga Suméria, surgida da dor e tortura de um prisioneiro de guerra obrigado a marcar em sua pele os feitos terríveis cometidos por seu soberano. Surge quando uma pessoa é forçada a viver aprisionada, torturada e acorrentada, exposta constantemente a brutalidades e manifestações paranormais sem nunca ter a libertação da morte. O ódio, a dor e a angústia transformam a mente dessa pessoa em uma tormenta enfurecida, e as marcas registradas em sua pele se tornam correntes físicas."
  },

{
    "id": "seed_op_sh_quibungo",
    "elemento": "Sangue",
    "name": "Quibungo",
    "photo": null,
    "vd": 160,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 4,
      "forca": 4,
      "intelecto": 1,
      "presenca": 3,
      "vigor": 4
    },
    "defesa": 34,
    "deslocamento": "15m, escalada 15m, natação 15m",
    "pv": 320,
    "pvMax": 320,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+5"
      },
      {
        "nome": "Atletismo",
        "formula": "4d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+8"
      },
      {
        "nome": "Sobrevivência",
        "formula": "1d20+20"
      }
    ],
    "sentidos": "Faro, visão no escuro",
    "resistencias": "Resistência a Balístico, impacto, perfuração e Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 25,
        "descricao": "Ao ver o Quibungo pela primeira vez, teste de Vontade (DT 25) ou sofre 4d8 de dano mental e fica apavorado por uma rodada. NEX 55%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x4",
        "teste": "4d20+20",
        "danos": [
          "2d6+10 corte"
        ]
      },
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "4d20+20",
        "danos": [
          "3d12+10 perfuração"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Besta da Mata",
        "descricao": "Em mata fechada, +10 em Furtividade e camuflagem total contra seres além de 9m."
      },
      {
        "nome": "Regeneração Acelerada",
        "descricao": "Cura Acelerada 10/Morte."
      },
      {
        "nome": "[Reação] Agarrão",
        "descricao": "Se acertar as garras, pode agarrar (teste 4d20+22)."
      },
      {
        "nome": "[Livre] Dilacerar",
        "descricao": "Uma vez por rodada, se acertar dois ataques de garra no mesmo alvo, +1d12+10 de dano de perfuração."
      },
      {
        "nome": "[Reação] Instintos Bestiais",
        "descricao": "Uma vez por rodada, esquiva completamente de um ataque à distância ou efeito em área."
      },
      {
        "nome": "[Completa] Bocarra Torturadora",
        "descricao": "Põe um ser agarrado na bocarra das costas: continua agarrado com cobertura total, sofrendo 1d12+10 de dano de Sangue por turno. Escapa vencendo agarrar/Acrobacia ou causando 25+ de dano ao Quibungo. Reduzido a 0 PV lá dentro, fica preso até o Quibungo engoli-lo (recupera 25 PV) ou outros o libertarem vencendo um teste de agarrar."
      },
      {
        "nome": "[Completa] Investida Brutal",
        "descricao": "Percorre o dobro do deslocamento até o alvo (mesmo fora de linha reta), conta como investida, e ao final faz dois ataques de garra."
      }
    ],
    "descricao": "Lenda afro-brasileira transformada por Sangue: uma besta de quatro braços com múltiplas mandíbulas e uma segunda bocarra enorme nas costas, capaz de engolir vítimas vivas para digeri-las lentamente por dias."
  },

{
    "id": "seed_op_mulher_afogada",
    "elemento": "Sangue",
    "name": "Mulher Afogada",
    "photo": null,
    "vd": 140,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 4,
      "forca": 3,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 28,
    "deslocamento": "9m",
    "pv": 240,
    "pvMax": 240,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, Energia, impacto e perfuração 10, Sangue 20 (em sua forma padrão).",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 25,
        "descricao": "Ao ver a mulher afogada pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 25) ou sofre 4d8 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 50%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+15",
        "danos": [
          "4d6+6 corte"
        ]
      },
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+15",
        "danos": [
          "4d8+8 perfuração"
        ]
      },
      {
        "nome": "Jato de Sangue",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto)",
        "teste": "4d20+10",
        "danos": [
          "4d8+8 Sangue"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Forma de Sangue",
        "descricao": "Por padrão, a mulher afogada é encontrada na forma de líquido de Sangue: resistência a balístico, corte, impacto, perfuração e Sangue 20; deslocamento 36m; pode percorrer canos, frestas e orifícios como qualquer líquido; e recebe Afogar em Sangue, Arrancar Sangue e Invadir Órgãos. Perde esta habilidade quando é invocada em forma física (após seu Enigma de Medo ser desvendado)."
      },
      {
        "nome": "[Movimento] Sugar Sangue",
        "descricao": "A mulher afogada devora o corpo de um personagem adjacente que tenha morrido nesta cena, recuperando 40 PV."
      },
      {
        "nome": "[Padrão] Afogar em Sangue",
        "descricao": "Invade nariz e boca de um personagem em alcance curto, afogando-o com Sangue — fica asfixiado. No início de cada turno pode tentar Fortitude DT 24; se passar, encerra a condição e expele a mulher afogada na forma líquida para um espaço adjacente."
      },
      {
        "nome": "[Reação] Arrancar Sangue",
        "descricao": "Toda vez que é arrancada de um corpo que estava asfixiando com afogar em Sangue, carrega parte do sangue da vítima, causando 6d6 de dano de Sangue e deixando-a fraca."
      },
      {
        "nome": "[Movimento] Invadir Órgãos",
        "descricao": "Invade órgãos vitais de um personagem que esteja asfixiando com afogar em Sangue. O personagem sofre 6d6 de dano de Sangue e fica enjoado."
      }
    ],
    "descricao": "Lenda urbana popularizada entre crianças, associada a mulheres que morreram em afogamentos brutais e trágicos. Move-se em forma de Sangue líquido pelos encanamentos de casas assombradas, identificável pela coloração avermelhada escorrendo das saídas de água. Ataca em surtos de Sangue, puxando o alvo para dentro do encanamento para afogá-lo e devorá-lo lentamente. A única forma de enfrentá-la é bloquear todas as saídas de água e fechar o registro hidráulico do local, forçando sua manifestação física sem chance de fuga."
  },

{
    "id": "seed_op_zumbi_de_sangue_bestial",
    "elemento": "Sangue",
    "name": "Zumbi de Sangue Bestial",
    "photo": null,
    "vd": 100,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 2,
      "forca": 3,
      "intelecto": 0,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 23,
    "deslocamento": "12m",
    "pv": 200,
    "pvMax": 200,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "2d20+13"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto e perfuração 5, Sangue 10. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o zumbi de Sangue bestial pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 20) ou sofre 4d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 45%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida de Sangue",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+15",
        "danos": [
          "2d10+5 perfuração"
        ]
      },
      {
        "nome": "Garras de Sangue",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+15",
        "danos": [
          "2d6+5 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Furtivo e Letal",
        "descricao": "Quando ataca um personagem desprevenido, recebe +1d20 nos testes de ataque e, se acertar, cada ataque causa dois dados de dano adicional do mesmo tipo."
      },
      {
        "nome": "Instinto Predatório",
        "descricao": "O zumbi de Sangue bestial não sofre penalidade em Furtividade por se mover seu deslocamento normal."
      }
    ],
    "descricao": "Versão maior, mais forte e brutal de um zumbi de Sangue, resultado de um cadáver torturado brutalmente antes de morrer, ou do corpo de alguém com exposição paranormal elevada devorado por completo pelo Sangue. Massa corporal cresce até o triplo da massa do cadáver original, corpo quadrúpede animalesco e o crânio partido ao meio forma uma enorme bocarra capaz de decapitar um humano em uma mordida. Ao contrário da versão inferior, age de forma estratégica, se escondendo para pegar alvos desprevenidos."
  },

{
    "id": "seed_op_sh_derretido",
    "elemento": "Sangue",
    "name": "Derretido",
    "photo": null,
    "vd": 80,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 1,
      "forca": 4,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 4
    },
    "defesa": 23,
    "deslocamento": "9m, escalada 9m",
    "pv": 140,
    "pvMax": 140,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Enganação",
        "formula": "1d20"
      },
      {
        "nome": "Furtividade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a Balístico, corte, impacto e perfuração. Resistência a Sangue 20. Vulnerabilidade a Morte, fogo e químico.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o Derretido pela primeira vez, teste de Vontade (DT 20) ou sofre 4d6 de dano mental e fica apavorado por uma rodada. NEX 40%+ imune."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Matéria Nociva",
        "descricao": "Quem entra ou começa o turno em sua área sofre 6d6 de dano de Sangue e fica lento e enjoado por uma rodada (Fortitude DT 20 reduz à metade e evita o lento); uma vez por rodada por criatura."
      },
      {
        "nome": "Amorfo",
        "descricao": "Massa sem forma fixa; não é restringido por obstáculos físicos, passando por qualquer fresta que a água passaria (fica lento ao se espremer)."
      },
      {
        "nome": "Liberdade de Espaço",
        "descricao": "Não precisa seguir regras de espaço ocupado, podendo invadir o espaço de outras criaturas; espaços que ocupa são terreno difícil para outros."
      },
      {
        "nome": "[Padrão] Arrastar Repulsivo",
        "descricao": "Envolve seres/objetos e os arrasta ao se mover (Atletismo DT 20 evita); arrastados sofrem 4d6 de dano de Sangue e ficam caídos."
      },
      {
        "nome": "[Padrão] Rastro Corrosivo",
        "descricao": "Deixa um rastro de ácido (terreno difícil); quem entra ou começa o turno nele sofre 1d6 de dano de ácido por rodada."
      },
      {
        "nome": "[Padrão] Simular Corpo",
        "descricao": "Molda seu corpo como pessoa, animal ou objeto; em penumbra/escuridão recebe +10 em Furtividade/Enganação para disfarce."
      },
      {
        "nome": "[Completa] Consumir",
        "descricao": "Consome um ser inconsciente com 0 PV em sua área, recuperando 20 PV e dissolvendo-o por completo."
      },
      {
        "nome": "[Completa] Deslizar Nojento",
        "descricao": "Percorre o triplo do deslocamento padrão, desviando de obstáculos."
      }
    ],
    "descricao": "Uma massa gelatinosa avermelhada com veias, órgãos e restos mortais flutuando em ácido borbulhante, capaz de assumir temporariamente silhuetas do que já absorveu. Move-se por frestas e encanamentos, surpreendendo vítimas desavisadas."
  },

{
    "id": "seed_op_dama_de_sangue",
    "elemento": "Sangue",
    "name": "Dama de Sangue",
    "photo": null,
    "vd": 60,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 2,
      "forca": 3,
      "intelecto": 1,
      "presenca": 2,
      "vigor": 2
    },
    "defesa": 20,
    "deslocamento": "12m",
    "pv": 105,
    "pvMax": 105,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "2d20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto e perfuração 10, Sangue 20. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver a dama de Sangue pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 20) ou sofre 3d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 35%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Tentáculo",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+10",
        "danos": [
          "2d6+5 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Consumir",
        "descricao": "Quando invocada, a dama de Sangue não possui nenhuma das habilidades de flor. Sempre que consome um corpo (adjacente, ação padrão), recebe uma habilidade na ordem: Arremessar, Chuva de Ácido, Grito Devastador, Miasma Fétido, Prisão de Tentáculos, Visão Macabra. No início do turno, se não tiver consumido sete corpos, ela usa suas ações para se deslocar até um corpo e consumi-lo."
      },
      {
        "nome": "[Movimento] Arremessar (Flor Rosa)",
        "descricao": "Ergue um personagem em alcance curto e o arremessa a um ponto também em alcance curto. O alvo sofre 2d6 de dano de impacto e fica caído (Reflexos DT 15 evita tudo). A flor rosa murcha em contato com fertilizante, fazendo a dama perder esta habilidade e sofrer −1d20 em Luta."
      },
      {
        "nome": "[Movimento] Chuva de Ácido (Flor Vermelha)",
        "descricao": "A dama espirra ácido que derrete carne e corrói metal. Todos em alcance curto sofrem 4d4 de dano químico (Fortitude DT 15 reduz à metade). Murcha em contato com agrotóxico, reduzindo suas resistências a dano em 5."
      },
      {
        "nome": "[Movimento] Grito Devastador (Flor Roxa)",
        "descricao": "Grito agudo que causa confusão. Todos em alcance curto ficam confusos (Vontade DT 15 evita, repetível no fim do turno). Murcha em contato com o bulbo de bravo purpulis, fazendo a dama sofrer −1d20 em Vontade."
      },
      {
        "nome": "[Padrão] Miasma Fétido (Flor Azul)",
        "descricao": "Miasma que contamina o ar; todos em alcance curto ficam enjoados por 1d4+1 rodadas (Fortitude DT 15 reduz a 1 rodada). Murcha com dano de eletricidade ou Energia, reduzindo o deslocamento da dama em 6m."
      },
      {
        "nome": "[Padrão] Prisão de Tentáculos (Flor Verde)",
        "descricao": "Tentáculos prendem um personagem em alcance curto, que fica agarrado até destruí-los (acertados automaticamente, 20 PV). Murcha se molhada em água corrente, reduzindo a Defesa da dama em 5."
      },
      {
        "nome": "[Movimento] Visão Macabra (Flor Laranja)",
        "descricao": "Movimento hipnotizante causa delírios macabros; todos em alcance médio sofrem 1d6 de dano Mental (Vontade DT 15 reduz à metade). Murcha ao sofrer 10+ de dano de corte de um único efeito, reduzindo os PV totais da dama em 20."
      },
      {
        "nome": "[Movimento] Espinhos (Flor Amarela)",
        "descricao": "Dispara espinhos em até três alvos em alcance médio; cada um sofre 2d8 de dano de perfuração (Reflexos DT 15 reduz à metade). Murcha ao sofrer 10+ de dano de fogo de um único efeito, fazendo a dama sofrer −1d20 em Reflexos."
      }
    ],
    "descricao": "Criatura grotesca nascida de um corpo humano partido ao meio, com os órgãos se misturando a plantas, dando origem a sete tentáculos com flores e espinhos e um tentáculo maior e central com uma grande flor dentada. Criatura de Sangue com elementos de Morte e Medo, invocada através de um ritual envolvendo o sacrifício de sete pessoas — cada flor representa uma das vítimas e possui uma fraqueza própria."
  },

{
    "id": "seed_op_sh_mescla",
    "elemento": "Sangue",
    "name": "Mescla",
    "photo": null,
    "vd": 60,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 21,
    "deslocamento": "12m, escalada 12m, voo 9m",
    "pv": 100,
    "pvMax": 100,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Acrobacia",
        "formula": "3d20+10"
      },
      {
        "nome": "Atletismo",
        "formula": "3d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "3d20+8"
      }
    ],
    "sentidos": "Faro, Percepção às cegas (alcance longo)",
    "resistencias": "Imune a Químico. Resistência a Balístico, corte e perfuração 10, Sangue 20. Vulnerabilidade a Morte, fogo e frio.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver a Mescla pela primeira vez, teste de Vontade (DT 20) ou sofre 3d6 de dano mental e fica apavorado por uma rodada. NEX 35%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+10",
        "danos": [
          "2d6+5 corte"
        ]
      },
      {
        "nome": "Cuspe Ácido",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto)",
        "teste": "3d20+10",
        "danos": [
          "3d12 Sangue"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Fluidos Repugnantes",
        "descricao": "Quem causa dano corpo a corpo/curto a ela, ou sofre dano de Sangue dela, fica enjoado por uma rodada (Fortitude DT 20 evita)."
      },
      {
        "nome": "Percepção Multifacetada",
        "descricao": "Não pode ser flanqueada nem surpreendida."
      },
      {
        "nome": "[Livre] Vomitar Ácido",
        "descricao": "Ao acertar os dois ataques de garra na mesma ação, vomita substância cáustica: +1d12 de dano de Sangue."
      },
      {
        "nome": "[Reação] Agarrão",
        "descricao": "Se acertar os dois ataques de garra em um ser na mesma ação, pode tentar agarrar (teste 3d20+12)."
      },
      {
        "nome": "[Completa] Camuflagem Sobrenatural",
        "descricao": "Se não vista, pode ficar imóvel com camuflagem total e +10 em Furtividade."
      },
      {
        "nome": "[Completa] Incubar Ovos",
        "descricao": "Se agarrando um ser, perfura-o com um ferrão (teste 3d20+10) incubando 1d4 ovos (Fortitude DT 5+5/ovo evita); o alvo desenvolve uma versão da doença Sangue Quente com um Estágio IV fatal, do qual nasce uma nova Mescla."
      },
      {
        "nome": "[Completa] Investida Insectoide",
        "descricao": "De um ponto elevado, salta sobre um ser em alcance médio; conta como investida com os dois ataques de garra."
      }
    ],
    "descricao": "Uma fusão grotesca entre pessoa e inseto, resultado de exposição voluntária a vermes e parasitas na busca de uma revelação \"natural\" da humanidade. Membros longos terminados em garras, olhos substituídos por buracos fétidos cheios de larvas."
  },

{
    "id": "seed_op_zumbi_de_sangue",
    "elemento": "Sangue",
    "name": "Zumbi de Sangue",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 17,
    "deslocamento": "9m",
    "pv": 45,
    "pvMax": 45,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, impacto e perfuração 5, Sangue 10. Vulnerabilidade a Morte.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 15,
        "descricao": "Ao ver o zumbi de Sangue pela primeira vez, um personagem deve ser bem sucedido em um teste de Vontade (DT 15) ou sofre 2d6 pontos de dano mental e fica apavorado por uma rodada. Personagens com NEX 25%+ são imunes."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "2d20+5",
        "danos": [
          "1d6+5 corte"
        ]
      }
    ],
    "poderes": [],
    "descricao": "Quando cadáveres que morreram de forma muito brutal ou dolorosa são abandonados em uma área, servem de passagem para a entidade de Sangue devorá-los e tomar controle de sua forma física. A pele se transforma em material gosmento e vermelho, os ossos se desfazem em pura carne, os olhos são destruídos e as unhas se estendem em garras. São cegos e detectam presenças pela movimentação da corrente de ar — a pele exposta é tão sensível que até os mais sutis movimentos do ar revelam a posição dos alvos. Comportam-se de maneira bestial e agressiva, sem raciocinar estrategicamente."
  },

  // ────────────────────────────────────────────────────────────
  // 2. CRIATURAS DE MORTE
  // ────────────────────────────────────────────────────────────
{
    "id": "seed_op_o_deus_da_morte",
    "elemento": "Morte",
    "name": "O Deus da Morte",
    "photo": null,
    "vd": 400,
    "tipo": "Entidade",
    "porte": "Grande",
    "attrs": {
      "agilidade": 6,
      "forca": 6,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 7
    },
    "defesa": 60,
    "deslocamento": "15m",
    "pv": 2000,
    "pvMax": 2000,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+30"
      },
      {
        "nome": "Iniciativa",
        "formula": "6d20+30"
      },
      {
        "nome": "Fortitude",
        "formula": "7d20+35"
      },
      {
        "nome": "Reflexos",
        "formula": "6d20+35"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+35"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a atordoado, condições de paralisia, dano e efeitos de Morte. Resistência a corte, impacto e perfuração 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver o Deus da Morte pela primeira vez, teste de Vontade (DT 45) ou sofre 10d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Soco Espiral",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "6d20+45",
        "danos": [
          "5d10+50 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Senhor do Tempo",
        "descricao": "No início de cada rodada, rola 1d20 e recebe um turno adicional na iniciativa correspondente ao resultado."
      },
      {
        "nome": "Potência de Morte",
        "descricao": "Modificador +35 para testes baseados em Força, Vigor ou Presença; +25 para os demais atributos."
      },
      {
        "nome": "Ciclo Infinito",
        "descricao": "Recupera 50 PV no início de cada turno. Reduzido a 0 PV, vira uma poça de Lodo e no início do próximo turno se manifesta no cadáver mais próximo (ou de maior NEX ao alcance), recuperando todos os PV e curando todas as condições. Quando o Enigma de Medo for resolvido, perde essa regeneração e capacidade de se manifestar em outro corpo."
      },
      {
        "nome": "Destruir o Diabo",
        "descricao": "O Deus da Morte é a única coisa capaz de causar a solução do Enigma de Medo do Diabo."
      },
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar o soco espiral em um ser Médio ou menor, pode tentar agarrá-lo (teste 6d20+47)."
      },
      {
        "nome": "[Livre] Controlar Relógio Interno",
        "descricao": "No início de cada turno, encerra até duas condições que o afetem."
      },
      {
        "nome": "[Movimento] Controlar Mortos",
        "descricao": "Controla qualquer criatura de Morte em alcance longo, fazendo-a se mover e atacar."
      },
      {
        "nome": "[Movimento] Espiral Descendente",
        "descricao": "Acelera o tempo de um ser agarrado, que envelhece 3d20 anos, paralisado, sofrendo 1 de dano mental por ano envelhecido."
      },
      {
        "nome": "[Padrão] Espiral Destrutiva",
        "descricao": "Cria uma espiral de Morte com 12m de raio em alcance longo; todos dentro sofrem 10d10+50 de dano de Morte (Fortitude DT 45 reduz à metade)."
      }
    ],
    "descricao": "Também conhecido como Parasita de Dimensões, uma entidade suprema que consome a entropia — a energia potencial e o tempo de tudo que é vivo. Pode parasitar o cadáver de alguém com exposição paranormal extrema para se manifestar de forma descomunal. Viaja pelo tempo, não pelo espaço, podendo estar em vários pontos da Realidade ao mesmo tempo."
  },

{
    "id": "seed_op_ceifador_espiral",
    "elemento": "Morte",
    "name": "Ceifador Espiral",
    "photo": null,
    "vd": 380,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 5,
      "forca": 5,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 5
    },
    "defesa": 58,
    "deslocamento": "15m",
    "pv": 999,
    "pvMax": 999,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+25"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a condições de paralisia, efeitos e dano de Morte. Resistência a dano 50. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver o Ceifador pela primeira vez, teste de Vontade (DT 45) ou sofre 9d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Foice da Morte",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+40",
        "danos": [
          "5d10+20 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Decepar",
        "descricao": "Em acerto crítico com a foice, o alvo é reduzido a 25 PV e perde 1 ponto de Força, Agilidade ou Vigor permanentemente (se tiver 25 PV ou menos, morre). Ao matar, o Ceifador recebe 50 PV temporários e +1d10 de dano até o fim da cena."
      },
      {
        "nome": "[Movimento] Transporte pelo Pó",
        "descricao": "Dentro da área de Cinzas das Terras Desoladas, teletransporta-se para outro ponto dessa área e pode fazer um ataque livre de foice."
      },
      {
        "nome": "[Completa] Contemplar a Espiral",
        "descricao": "Todos em alcance médio que o vejam sofrem 10d10+30 de dano mental (Vontade DT 43 reduz à metade). Imune a repetir até o fim da cena."
      },
      {
        "nome": "[Completa] Cinzas das Terras Desoladas",
        "descricao": "Uma área de alcance longo é tomada por cinzas aceleradas pelo tempo. Cada ser dentro sofre 10d10+20 de dano de Morte e fica enjoado (Fortitude DT 43 reduz à metade e evita); quem terminar o turno na área sofre mais 20 de dano de Morte."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Quando resolvido, o Ceifador perde sua resistência a dano e qualquer área de Terras Desoladas vira terreno normal no fim do próximo turno dele."
      }
    ],
    "descricao": "O rosto da Morte: uma entidade vista por quem viveu experiências de quase-morte intensas, manifestando-se como uma silhueta espiralada. Deixa desertos de cinzas espiraladas por onde passa; se manifesta em um ambiente, tudo é levado pela Morte."
  },

{
    "id": "seed_op_sh_amigo_imaginario",
    "elemento": "Morte",
    "name": "Amigo Imaginário",
    "photo": null,
    "vd": 360,
    "tipo": "Entidade",
    "porte": "Grande",
    "attrs": {
      "agilidade": 5,
      "forca": 5,
      "intelecto": 3,
      "presenca": 5,
      "vigor": 3
    },
    "defesa": 56,
    "deslocamento": "12m",
    "pv": 1000,
    "pvMax": 1000,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+30"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+30"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+30"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+30"
      },
      {
        "nome": "Furtividade",
        "formula": "5d20+28"
      }
    ],
    "sentidos": "Percepção às cegas (alcance extremo)",
    "resistencias": "Imune a Morte e Sangue. Resistência a Balístico, corte, impacto e perfuração 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver o Amigo Imaginário pela primeira vez, teste de Vontade (DT 40) ou sofre 8d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+40",
        "danos": [
          "4d10+10 corte"
        ]
      },
      {
        "nome": "Tentáculos",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Médio)",
        "teste": "5d20+40",
        "danos": [
          "4d10+20 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "O Sino",
        "descricao": "Ao aparecer, todos em alcance extremo que o ouçam ficam pasmos por 1 rodada (Vontade DT 40 evita e imuniza até o fim da cena); quem já \"Entrou em um Quadro\" e falhar não consegue mais se afastar dele até o fim da cena. Repete no início de cada turno dele."
      },
      {
        "nome": "Quadros",
        "descricao": "Sete pinturas influenciadas pelo Medo; observá-las exige Vontade DT 40 ou a pessoa \"Entra no Quadro\", revivendo traumas e sofrendo 8d8 de dano mental (Vontade DT 40 evita), enfraquecendo a Membrana local."
      },
      {
        "nome": "Frenesi de Sangue",
        "descricao": "Ao ficar machucado, ganha fúria: Vigor vira 5, Fortitude 5d20+30, deslocamento de escalada 15m, duas ações padrão e duas de movimento por turno, e O Sino passa a forçar a vítima a morder o ser vivo mais próximo (ou a si mesma) em vez de ficar pasma."
      },
      {
        "nome": "[Reação] Agarrão",
        "descricao": "Se acertar os tentáculos, pode agarrar (teste 5d20+42); o tentáculo agarrando pode ser destruído (Defesa 30, 50 PV, imune a Morte/Sangue, vulnerável a Energia) para libertar a vítima, custando 50 PV ao Amigo Imaginário."
      },
      {
        "nome": "[Completa] Derreter",
        "descricao": "Puxa um agarrado até seu rosto e despeja tinta corrosiva: 4d10+10 de dano de Morte e 4d10+10 de dano de Sangue (Fortitude DT 40 reduz à metade)."
      },
      {
        "nome": "[Completa] Dissolver",
        "descricao": "Envolve um agarrado com mais tentáculos: 4d10+20 de dano químico (Fortitude DT 40 reduz à metade), recuperando PV igual ao dano causado."
      }
    ],
    "descricao": "Uma obra de arte viva nascida do delírio coletivo de uma ilha isolada, criada por um composto impossível de Sangue e Morte associado ao \"Sino de Tenebris\". Um ser encapuzado e alongado que jorra tinta vermelho-ocre do rosto, alimentando-se do medo daqueles cujos segredos manipulou."
  },

{
    "id": "seed_op_sempiternal",
    "elemento": "Morte",
    "name": "Sempiternal",
    "photo": null,
    "vd": 360,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 5,
      "forca": 5,
      "intelecto": 4,
      "presenca": 5,
      "vigor": 4
    },
    "defesa": 53,
    "deslocamento": "12m",
    "pv": 990,
    "pvMax": 990,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+25"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+30"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a condições de paralisia e dano e efeitos de Morte. Resistência a corte, impacto e perfuração 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver o sempiternal pela primeira vez, teste de Vontade (DT 40) ou sofre 8d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Dedos Alongados",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x4",
        "teste": "5d20+40",
        "danos": [
          "4d10 Morte mais envelhecimento (veja Toque Acelerador)"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Toque Acelerador",
        "descricao": "Sempre que um ser sofre dano dos dedos alongados, envelhece 1d10 anos. 20+ anos: fraco até o fim da cena. 40+ anos: debilitado até o fim da cena. 60+ anos: morre. Seres com afinidade com a Morte são imunes."
      },
      {
        "nome": "[Movimento] Correntes de Lodo",
        "descricao": "Projeta vinhas de Lodo em área de alcance médio; todos ali sofrem 20d6 de dano de Morte (Fortitude DT 40 reduz à metade). Quem ficar machucado por esse dano fica infectado com vulnerabilidade a Morte até o fim da cena; reduzido a 0 PV vira um enraizado."
      }
    ],
    "descricao": "Resultado da manifestação da Morte através de gerações de uma civilização isolada com exposição paranormal repetida em ciclos. Figura esquelética retorcida com olhos pretos e pele acinzentada; não come, não bebe, não dorme, e manipula a própria percepção do tempo."
  },

{
    "id": "seed_op_nidere",
    "elemento": "Morte",
    "name": "Nidere",
    "photo": null,
    "vd": 320,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 5,
      "forca": 5,
      "intelecto": 3,
      "presenca": 4,
      "vigor": 5
    },
    "defesa": 50,
    "deslocamento": "24m",
    "pv": 800,
    "pvMax": 800,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "6d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+25"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+25"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "4d20+15"
      },
      {
        "nome": "Furtividade",
        "formula": "5d20+23"
      },
      {
        "nome": "Sobrevivência",
        "formula": "5d20+20"
      }
    ],
    "sentidos": "Percepção às cegas, faro",
    "resistencias": "Resistência a corte, impacto, perfuração e Morte 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o nidere pela primeira vez, teste de Vontade (DT 35) ou sofre 8d6 de dano mental e fica apavorado por uma rodada. NEX 95%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garra Invertida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+35",
        "danos": [
          "4d10+40 Morte"
        ]
      },
      {
        "nome": "Mordida Invertida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "5d20+35",
        "danos": [
          "4d12+40 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Caçador Veloz",
        "descricao": "Pode se mover em seu deslocamento normal sem penalidade em Furtividade."
      },
      {
        "nome": "Regeneração Acelerada",
        "descricao": "Cura Acelerada 50. Perde esta habilidade se seu Enigma de Medo for resolvido."
      },
      {
        "nome": "Senso de Direção Perfeito",
        "descricao": "Nunca se perde; recebe +2d20 em Percepção e Sobrevivência (já incluídos na ficha). Perde a habilidade se o Enigma de Medo for resolvido."
      },
      {
        "nome": "[Livre] Reverter",
        "descricao": "Um ser que sofra dano das garras invertidas é afetado por surto temporal que apodrece a carne — fica enjoado até o final do próximo turno."
      },
      {
        "nome": "[Livre] Rastrear e Abater",
        "descricao": "Causa +6d6 de dano contra seres desprevenidos."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Encontrar seu covil e destruir a origem de sua manifestação faz o nidere entrar em fúria incontrolável: sofre −10 na Defesa e −2d20 em testes de resistência, e perde Regeneração Acelerada e Senso de Direção Perfeito."
      }
    ],
    "descricao": "\"O lobo invertido\", um enorme lobo atroz e desfigurado que se manifesta em ambientes selvagens, considerado o maior responsável por desaparecimentos misteriosos de campistas. Caçador brutal e eficaz; só pode ser derrotado encontrando seu lar e destruindo o motivo de sua manifestação."
  },

{
    "id": "seed_op_marionete",
    "elemento": "Morte",
    "name": "Marionete",
    "photo": null,
    "vd": 280,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 5,
      "intelecto": 1,
      "presenca": 5,
      "vigor": 2
    },
    "defesa": 40,
    "deslocamento": "6m",
    "pv": 700,
    "pvMax": 700,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a corte, impacto, perfuração e Morte 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver a marionete pela primeira vez, teste de Vontade (DT 35) ou sofre 8d6 de dano mental e fica apavorado por uma rodada. NEX 85%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Foice Óssea",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+30",
        "danos": [
          "10d8+10 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Momento Passivo",
        "descricao": "Não pode ter o deslocamento reduzido e ignora terreno difícil; não sofre dano ou efeitos que dependam de tocar o chão."
      },
      {
        "nome": "[Reação] Reflexos Guiados por Corda",
        "descricao": "Uma vez por rodada, quando um ser fica adjacente a ela, faz um ataque de foice óssea contra ele."
      },
      {
        "nome": "[Completa] Ironia do Destino",
        "descricao": "Dois ataques de foice óssea contra um ser adjacente; se o segundo acertar, agarra a vítima com a arma e pode se deslocar 6m carregando-a, dividindo o dano que sofrer com o agarrado."
      }
    ],
    "descricao": "Resquício de uma memória distorcida por um trauma, a rejeição do luto materializada: um esqueleto retorcido preenchido de Lodo, mandíbula presa aberta por um fio com Lodo preto escorrendo, braços erguidos como por uma força invisível, e uma lâmina de ossos em foice amarrada a um braço."
  },

{
    "id": "seed_op_sh_memento_mori",
    "elemento": "Morte",
    "name": "Memento Mori",
    "photo": null,
    "vd": 260,
    "tipo": "Entidade",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 3
    },
    "defesa": 44,
    "deslocamento": "9m",
    "pv": 650,
    "pvMax": 650,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+20"
      },
      {
        "nome": "Furtividade",
        "formula": "1d20+30"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Resistência a Balístico, corte, impacto, perfuração e Morte 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o Memento Mori pela primeira vez, teste de Vontade (DT 35) ou sofre 8d6 de dano mental e fica apavorado por uma rodada. NEX 80%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+30",
        "danos": [
          "4d10+30 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Inevitável Fim",
        "descricao": "Ao ser reduzido a 0 PV, não morre — desaparece em cinzas e sombras até o fim da cena, podendo reaparecer depois para continuar perseguindo seu alvo."
      },
      {
        "nome": "A Ampulheta da Morte",
        "descricao": "Ao surgir, já tem um alvo cujo tempo de vida é contado por sua ampulheta — um item amaldiçoado de Morte indestrutível. O portador pode gastar ação padrão, 2 PE e 2 Sanidade para descobrir o alvo vinculado e uma estimativa de seu tempo restante."
      },
      {
        "nome": "Ininterrupto",
        "descricao": "Não corre; só pode gastar uma ação por rodada para se deslocar, mas ignora qualquer condição/efeito que reduza ou impeça seu deslocamento."
      },
      {
        "nome": "[Movimento] Visagem",
        "descricao": "Até três vezes por cena, teletransporta-se para um espaço desocupado em alcance extremo, ou fica invisível até agir de outra forma."
      },
      {
        "nome": "[Padrão] Encarar o Abismo",
        "descricao": "Um ser em alcance curto sofre 4d10+30 de dano de Morte e revela memórias/pensamentos (Vontade DT 35 reduz o dano à metade e evita a revelação)."
      },
      {
        "nome": "[Padrão] Revelar a Ampulheta",
        "descricao": "Todos em até 36m que a vejam sofrem 8d6 de dano mental de presságios de morte (Vontade DT 35 reduz à metade)."
      },
      {
        "nome": "[Completa] Atrair a Ampulheta",
        "descricao": "Se em alcance curto da própria ampulheta, teletransporta-a para suas mãos."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Sem a ampulheta, para de perseguir o alvo e passa a perseguir o item até recuperá-lo; lendas falam de um ritual capaz de destruir a ampulheta e matar o Memento Mori de vez, libertando o alvo."
      }
    ],
    "descricao": "Uma figura humanoide encapuzada com rosto de crânio de pássaro apodrecido, carregando uma ampulheta que conta o tempo de vida de sua vítima escolhida. Move-se lentamente, mas nunca para, e fugir é inútil."
  },

{
    "id": "seed_op_mumia_xipofaga",
    "elemento": "Morte",
    "name": "Múmia Xipófaga",
    "photo": null,
    "vd": 240,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 5,
      "forca": 4,
      "intelecto": 2,
      "presenca": 3,
      "vigor": 4
    },
    "defesa": 35,
    "deslocamento": "9m",
    "pv": 400,
    "pvMax": 400,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a corte, impacto e perfuração 10, Morte 20. Vulnerabilidade a Energia e fogo.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 30,
        "descricao": "Ao ver a múmia pela primeira vez, teste de Vontade (DT 30) ou sofre 6d8 de dano mental e fica apavorado por uma rodada. NEX 75%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garra Enfaixada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+30",
        "danos": [
          "4d8+30 corte"
        ]
      },
      {
        "nome": "Vomitar Lodo",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Curto)",
        "teste": "5d20+25",
        "danos": [
          "3d6+30 Morte mais 3d8 mental"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Faixas da Permanência",
        "descricao": "Reduzida a 0 PV, não é destruída — continua agindo até o fim do próximo turno; se não terminar com ao menos 1 PV, morre."
      },
      {
        "nome": "[Livre] Agarrada Mumificadora",
        "descricao": "Se acertar com a garra enfaixada, pode agarrar o alvo (teste 4d20+30); enquanto agarrado, a vítima sofre 4d8+30 de dano de Morte por turno e a múmia recupera o mesmo valor em PV. Se reduzida a 0 PV assim, vira um esqueleto de Lodo."
      },
      {
        "nome": "[Padrão] Amalgamar",
        "descricao": "Enquanto com 0 PV, pode amalgamar um morto ou criatura de Morte adjacente, entrelaçando-se com ele: recupera 200 PV, passa a atacar três vezes com garras (+5 de dano cada). Pode amalgamar uma segunda vez: mais 200 PV, quatro ataques, +10 de dano total por ataque."
      }
    ],
    "descricao": "Origem ligada à obsessão pela imortalidade através de mumificação, praticada até em vida por seitas que cultuavam o Outro Lado. Absorve quem agarra até o fim de sua vida, fundindo-o ao próprio corpo."
  },

{
    "id": "seed_op_carnical_preto_da_morte",
    "elemento": "Morte",
    "name": "Carniçal Preto da Morte",
    "photo": null,
    "vd": 200,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 4,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 3
    },
    "defesa": 38,
    "deslocamento": "12m",
    "pv": 400,
    "pvMax": 400,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      },
      {
        "nome": "Atletismo",
        "formula": "4d20+15"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano balístico. Resistência a corte, impacto e perfuração 10, Morte 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 30,
        "descricao": "Ao ver o carniçal pela primeira vez, teste de Vontade (DT 30) ou sofre 6d6 de dano mental e fica apavorado por uma rodada. NEX 65%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garra da Morte",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+25",
        "danos": [
          "4d10+20 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Físico Paranormal",
        "descricao": "O carniçal pode saltar o dobro do deslocamento normal."
      },
      {
        "nome": "Instinto Mortal",
        "descricao": "Quando machucado (200 PV ou menos), usa Hipnose como ação livre no início de cada turno e pode fazer um ataque adicional de garra da Morte contra o mesmo alvo."
      },
      {
        "nome": "Corpo Fechado",
        "descricao": "Um ataque com a ação mirar na cabeça do carniçal ignora sua imunidade a dano balístico."
      },
      {
        "nome": "[Reação] Pancada Poderosa",
        "descricao": "Em acerto crítico com a garra da Morte, pode empurrar o alvo 6m; se colidir com algo resistente, sofre 4d6 de dano de impacto."
      },
      {
        "nome": "[Movimento] Comando",
        "descricao": "Dá um comando a um ser em alcance curto, que deve obedecer (Vontade DT 29 evita) — efeito do ritual Perturbação."
      },
      {
        "nome": "[Padrão] Hipnose",
        "descricao": "Domina a mente de um ser em alcance curto (Vontade DT 29 evita), controle telepático total (exceto tirar a própria vida). Pode repetir Vontade no fim do turno com bônus cumulativo de +1. Até três hipnotizados por vez."
      },
      {
        "nome": "[Completa] Reanimar Corpos",
        "descricao": "Uma vez por cena, reanima até 2d4+2 corpos em alcance médio como esqueletos de Lodo, que atacam o ser mais próximo até serem destruídos."
      }
    ],
    "descricao": "Originada de uma tentativa fracassada de dar consciência à Morte, uma criatura de Lodo entrelaçada a partir de um crânio humano apodrecido, com anatomia muscular humana exposta. Comporta-se com estratégia e arrogância, mas se torna mais irracional com o passar do tempo."
  },

{
    "id": "seed_op_escutado",
    "elemento": "Morte",
    "name": "Escutado",
    "photo": null,
    "vd": 160,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 3,
      "intelecto": 1,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 29,
    "deslocamento": "12m",
    "pv": 290,
    "pvMax": 290,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano (enquanto ouvindo a Melodia Espiral, veja Enigma de Medo).",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 25,
        "descricao": "Ao ver o escutado pela primeira vez, teste de Vontade (DT 25) ou sofre 4d8 de dano mental e fica apavorado por uma rodada. NEX 55%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+20",
        "danos": [
          "3d6+10 perfuração"
        ]
      },
      {
        "nome": "Cabeça Arremessada",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Curto)",
        "teste": "4d20+15",
        "danos": [
          "1d10+10 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Multiplicação Melódica",
        "descricao": "Se estiver ouvindo a melodia de sua criação no início do turno, manifesta uma cópia com 145 PV sem a imunidade a dano, que também pode se multiplicar."
      },
      {
        "nome": "[Movimento] Vomitar Lodo",
        "descricao": "Uma vez por cena, na primeira rodada após manifestada, cada cópia despeja Lodo em um ser em alcance curto: 4d10+10 de dano de Morte e fica lento até o fim da cena (Reflexos DT 25 reduz à metade e evita)."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Tocar a melodia proibida (Artes DT 25, uma vez por rodada) por 4 rodadas ininterruptas faz o escutado perder a imunidade a dano até o fim da cena, permitindo enfim derrotá-lo — mas ele terá tido chance de se multiplicar até 16 vezes nesse período."
      }
    ],
    "descricao": "Originado de alguém que escutou a \"Melodia Espiral\", uma música proibida capaz de enlouquecer quem a ouve inteira. Corpo humanoide retorcido e magro, anda de forma quadrúpede invertida, com a cabeça capaz de se desprender do corpo, deixando rastro de Lodo."
  },

{
    "id": "seed_op_enraizado",
    "elemento": "Morte",
    "name": "Enraizado",
    "photo": null,
    "vd": 120,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 28,
    "deslocamento": "9m",
    "pv": 140,
    "pvMax": 140,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Atletismo",
        "formula": "3d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a corte, impacto e perfuração 10, Morte 20. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o enraizado pela primeira vez, teste de Vontade (DT 20) ou sofre 4d6 de dano mental e fica apavorado por uma rodada. NEX 50%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Punho Espinhento",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+15",
        "danos": [
          "2d8+8 impacto mais 2d12 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Imortalidade",
        "descricao": "Ao morrer, desfaz-se em poça de Lodo, galhos e raízes; retorna após 1d2 rodadas com 70 PV. 20+ de dano de fogo ou Energia na forma de poça destrói permanentemente."
      },
      {
        "nome": "Veneno Pútrido",
        "descricao": "A primeira vez que um personagem sofre dano do punho espinhento na cena, fica envenenado: no início de cada turno, Fortitude DT 23 ou sofre 4d12 de dano de Morte (passar cura o veneno)."
      }
    ],
    "descricao": "Resultado de um corpo enterrado próximo a vegetação infestada pela Morte, invadido por raízes grossas e preenchido de Lodo que move seus membros como um esqueleto de armadura vegetal."
  },

{
    "id": "seed_op_aracnasita",
    "elemento": "Morte",
    "name": "Aracnasita",
    "photo": null,
    "vd": 80,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 3,
      "forca": 2,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 23,
    "deslocamento": "12m",
    "pv": 140,
    "pvMax": 140,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "3d20+8"
      }
    ],
    "sentidos": "Percepção às cegas; Percepção Tátil (percebe tudo em contato com sua teia, ignorando penalidades de visão/sentidos para isso)",
    "resistencias": "Imune a dano (exceto fogo). Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver a aracnasita pela primeira vez, teste de Vontade (DT 20) ou sofre 4d6 de dano mental e fica apavorado por uma rodada. NEX 40%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+15",
        "danos": [
          "2d10+10 perfuração"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Estacar",
        "descricao": "Quando causa dano com a mordida, a aracnasita pode usar seu Lodo da Morte para prender o alvo, que sofre +1d10 de dano de Morte e fica agarrado (Atletismo DT 20 para escapar)."
      },
      {
        "nome": "[Reação] Desovar Aranhas",
        "descricao": "Uma vez por cena, ao ficar machucada, desova aranhas menores que se espalham ao seu redor, gerando efeitos crescentes turno a turno (dano em área que aumenta de alcance curto pra médio, e a partir do 4º turno pode gerar novas aracnasitas a partir de mortos próximos)."
      },
      {
        "nome": "[Movimento] Disparar Teia",
        "descricao": "Dispara uma teia em alcance curto (área 3m). Quem estiver nela ou entrar fica agarrado (Reflexos DT 20 evita) e sofre 2d8+10 de dano de Morte por turno agarrado; pode se soltar causando 15 de dano de corte na teia ou com Atletismo DT 20."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "O Lodo da Morte no corpo da aracnasita foge do fogo e do calor. Se sofrer dano de fogo, perde sua imunidade a dano até o início do próximo turno."
      }
    ],
    "descricao": "Também chamada de aranha preta da Morte: uma criatura originada de um aracnídeo exposto a um símbolo de invocação de Morte, desenvolvendo comportamento parasitário. Agarra-se ao rosto da vítima e absorve seu corpo ainda vivo em um casulo no abdômen, crescendo e se reproduzindo quanto mais tempo absorve."
  },

{
    "id": "seed_op_succ",
    "elemento": "Morte",
    "name": "Succ",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 2,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 1
    },
    "defesa": 20,
    "deslocamento": "12m",
    "pv": 65,
    "pvMax": 65,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a corte, impacto e perfuração 5, Morte 10. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 15,
        "descricao": "Ao ver o succ pela primeira vez, teste de Vontade (DT 15) ou sofre 3d6 de dano mental e fica apavorado por uma rodada. NEX 30%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "4d20+10",
        "danos": [
          "2d8+2 perfuração"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Sucção",
        "descricao": "Se acertar a mordida, prende os dentes no rosto da vítima e suga o ar dos pulmões. A vítima faz Fortitude DT 17: se passar, se solta; se falhar, fica inconsciente e no início do próximo turno do succ é reduzida a 0 PV e fica morrendo. Enquanto prende, o succ só pode usar reações e tem deslocamento reduzido a 3m; solta se sofrer 10+ de dano na mesma rodada."
      }
    ],
    "descricao": "Um ser quadrúpede com patas pontudas, pele enrugada e acinzentada, dois buracos onde deveriam estar seus pulmões e uma enorme boca circular com dentes em camadas. Busca sugar todo o ar dos pulmões da vítima, emitindo um som constante como um aspirador de pó."
  },

{
    "id": "seed_op_esqueleto_de_lodo",
    "elemento": "Morte",
    "name": "Esqueleto de Lodo",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 1
    },
    "defesa": 14,
    "deslocamento": "6m",
    "pv": 40,
    "pvMax": 40,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a corte, impacto e perfuração 5, Morte 10. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 14,
        "descricao": "Ao ver o esqueleto pela primeira vez, teste de Vontade (DT 14) ou sofre 2d4 de dano mental e fica apavorado por uma rodada. NEX 25%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "2d20+5",
        "danos": [
          "2d6+2 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Imortalidade",
        "descricao": "Ao morrer, desfaz-se em poça de Lodo e ossos; retorna após 1d3 rodadas com 20 PV. Dano de fogo ou Energia na forma de poça destrói permanentemente."
      },
      {
        "nome": "[Completa] Espiral de Lodo",
        "descricao": "Transforma-se em uma poça de Lodo e se lança como espiral perfurante por até 9m em linha reta; quem estiver no caminho sofre 2d10 de dano de Morte (Reflexos DT 14 reduz à metade). Se reforma no fim do trajeto."
      }
    ],
    "descricao": "Um cadáver consumido pela Morte, forma esquelética e acinzentada com Lodo escorrendo por todos os orifícios do corpo. Regenera-se após ser destruído, a menos que o Lodo seja queimado ou exposto a Energia."
  },

{
    "id": "seed_op_sh_sepultado",
    "elemento": "Morte",
    "name": "Sepultado",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 16,
    "deslocamento": "9m, escalada 9m",
    "pv": 50,
    "pvMax": 50,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Furtividade",
        "formula": "1d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte, impacto e perfuração 5, Morte 10. Vulnerabilidade a Energia.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 15,
        "descricao": "Ao ver o Sepultado pela primeira vez, teste de Vontade (DT 15) ou sofre 2d4 de dano mental e fica apavorado por uma rodada. NEX 25%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Dedos Ósseos",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x3",
        "teste": "3d20+5",
        "danos": [
          "1d6+5 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Membros Longos",
        "descricao": "Embora Médio, seus braços e pernas se esticam, dando alcance natural de 3m."
      },
      {
        "nome": "Parte do Cenário",
        "descricao": "Em forma de caixão, passa despercebido em ambientes como cemitérios e mausoléus, recebendo +10 em Furtividade. Um ser treinado em Ocultismo que procure ativamente pode notar com um teste DT 20."
      },
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar os dedos ósseos, pode tentar agarrar (teste 3d20+5)."
      },
      {
        "nome": "[Padrão] Bater Desesperado",
        "descricao": "Emite um som desritmado ouvido a até 90m; contra criaturas a até 9m, todos ficam atordoados por uma rodada (Vontade DT 14 reduz a abalado); quem passar fica imune até o fim da cena."
      },
      {
        "nome": "[Completa] Tragar",
        "descricao": "Se agarrando um ser Médio ou menor, traga-o para dentro do caixão; o ser fica agarrado e imóvel, sofrendo 2d4 de dano mental (Vontade DT 14 reduz à metade) ao ser tragado e no início de cada turno preso. Só destruindo o Sepultado o liberta."
      }
    ],
    "descricao": "Inúmeros corpos selados juntos em uma maldição imortal, tornando-se uma só aberração em forma de caixão. Um som de tambor repetitivo, às vezes imperceptível, às vezes ensurdecedor conforme se arrasta em direção a uma vítima."
  },

  // ────────────────────────────────────────────────────────────
  // 3. CRIATURAS DE CONHECIMENTO
  // ────────────────────────────────────────────────────────────
{
    "id": "seed_op_mascara_do_desespero",
    "elemento": "Conhecimento",
    "name": "Máscara do Desespero",
    "photo": null,
    "vd": 400,
    "tipo": "Entidade",
    "porte": "Minúsculo",
    "attrs": {
      "agilidade": 4,
      "forca": 4,
      "intelecto": 6,
      "presenca": 6,
      "vigor": 5
    },
    "defesa": 55,
    "deslocamento": "Voo 12m",
    "pv": 1200,
    "pvMax": 1200,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "6d20+35"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+25"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+35"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "6d20+35"
      },
      {
        "nome": "Ciência",
        "formula": "6d20+35"
      },
      {
        "nome": "Ocultismo",
        "formula": "6d20+35"
      },
      {
        "nome": "Religião",
        "formula": "6d20+35"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a condições e dano. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver a Máscara pela primeira vez, teste de Vontade (DT 45) ou sofre 10d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Destronar o Anfitrião",
        "descricao": "A Máscara do Desespero é a única capaz de resolver o Enigma de Medo do Anfitrião."
      },
      {
        "nome": "Potência do Conhecimento",
        "descricao": "Modificador +35 para testes de Intelecto, Presença e Vigor; +25 para os demais atributos."
      },
      {
        "nome": "[Livre] Conjuração Verdadeira",
        "descricao": "Uma vez por turno, conjura um ritual de Conhecimento à escolha, de qualquer círculo, execução máxima de ação completa e custo máximo de 20 PE. DT para resistir: 45."
      },
      {
        "nome": "[Movimento] Onipresença",
        "descricao": "Desloca-se para qualquer lugar da Realidade com sombra ou escuridão, independente da distância. Sabe tudo que acontece na Realidade ao mesmo tempo — ninguém pode se esconder dela, e ignora a necessidade de ver ou ouvir para usar suas habilidades."
      },
      {
        "nome": "[Padrão] Reescrever Realidade",
        "descricao": "Altera propriedades de seres e objetos em alcance médio. Contra objetos de até 1 tonelada, muda composição/posição/estado da matéria (Reflexos do portador DT 45 evita se vestido/empunhado). Contra seres: 10d6 de dano de Conhecimento, 10d6 de dano mental e uma condição à escolha, exceto morrendo/enlouquecendo (Vontade DT 45 reduz cada dano à metade e evita a condição)."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Pode ser enfrentada abalando diretamente o Equilíbrio através do Medo, ou devastando a razão de seu portador através da brutalidade do Diabo. Quando resolvido, perde imunidade a dano e a habilidade Onipresença."
      }
    ],
    "descricao": "Também conhecida como a Relíquia do Conhecimento, uma máscara indestrutível que contém toda a verdade do Outro Lado. Quem a veste tem sua mente soterrada pelo Conhecimento infinito e seu ego é inexistido, tornando-se a Magistrada — executora das regras que protege o equilíbrio da Realidade."
  },

{
    "id": "seed_op_anjo",
    "elemento": "Conhecimento",
    "name": "Anjo",
    "photo": null,
    "vd": 380,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 4,
      "forca": 5,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 5
    },
    "defesa": 57,
    "deslocamento": "Voo 24m",
    "pv": 1111,
    "pvMax": 1111,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+25"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+25"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+30"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a condições de paralisia, dano e efeitos de Conhecimento. Resistência a dano 50. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver o anjo pela primeira vez, teste de Vontade (DT 40) ou sofre 10d6 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Asas do Conhecimento",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+40",
        "danos": [
          "4d10+40 Conhecimento"
        ]
      },
      {
        "nome": "Olhares do Saber",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Longo)",
        "teste": "4d20+40",
        "danos": [
          "6d8+20 Conhecimento"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Julgamento",
        "descricao": "Sempre que um ser sofre dano de Conhecimento das asas ou dos olhares do anjo, sofre também dano mental igual à metade do dano de Conhecimento (após resistências). Reduzido a Sanidade 0 assim, sua mente colapsa e ele inexiste, morrendo instantaneamente."
      },
      {
        "nome": "[Livre] Faixas Detentoras",
        "descricao": "Se acertar as asas em um ser Médio ou menor, pode agarrar (teste 5d20+45); o agarrado fica fascinado. Mantém um agarrado por vez sem impedir o uso das asas."
      },
      {
        "nome": "[Padrão] Chamas Reveladoras",
        "descricao": "Círculo de chamas douradas em alcance médio; todos ali sofrem 10d8 de dano de Conhecimento (Vontade DT 43 reduz à metade) e recebem uma auréola reveladora — o anjo passa a ignorar furtividade/invisibilidade/ilusão contra eles até o fim da cena."
      },
      {
        "nome": "[Completa] Raio Dourado",
        "descricao": "Uma vez por cena, dispara um raio de seu olho central: linha de 3m em alcance longo, 15d8+50 de dano de Conhecimento (Reflexos DT 43 reduz à metade)."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Um anjo que falhe em julgar corretamente pode cair e ser alcançado por mortais. Quando resolvido, perde resistência a dano, deslocamento de voo e a habilidade Julgamento."
      }
    ],
    "descricao": "Uma manifestação revelada por transcendência espontânea, capaz de desmantelar a sanidade de quem a observa, derretendo os olhos em lágrimas douradas. Descrito como \"o rosto da verdade impossível\". Não há registros de manifestação desde o século XIII."
  },

{
    "id": "seed_op_silhueta",
    "elemento": "Conhecimento",
    "name": "Silhueta",
    "photo": null,
    "vd": 360,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 4,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 4
    },
    "defesa": 55,
    "deslocamento": "12m",
    "pv": 500,
    "pvMax": 500,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+20"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a condições de paralisia, efeitos e dano de Conhecimento, e a manobras de combate. Resistência a dano 30. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver a silhueta pela primeira vez, teste de Vontade (DT 40) ou sofre 8d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Aura Tangível",
        "descricao": "Qualquer ser ou item que a toque sofre 20d12 de dano de Conhecimento (Fortitude DT 42 reduz à metade); se reduzido a 0 PV, é desintegrado instantaneamente. Máximo uma vez por turno por alvo."
      },
      {
        "nome": "Conhecimento Verdadeiro",
        "descricao": "Testes baseados em Intelecto e Presença têm +25; testes baseados em Agilidade, Força e Vigor têm +20."
      },
      {
        "nome": "[Livre] Reescrever a Realidade",
        "descricao": "Enquanto se desloca, transforma objetos em alcance curto em outros objetos de mesmo tamanho. Seres vivos e equipamentos vestidos/portados não são afetados."
      },
      {
        "nome": "[Padrão] Toque Devastador",
        "descricao": "Toca até dois seres e/ou objetos, causando o dano de sua Aura Tangível."
      }
    ],
    "descricao": "A ausência consciente de si mesma: uma forma humanoide vazia cercada de sigilos do Outro Lado, eco de alguém inexistido pelo Conhecimento. Lenta, calma e vazia, mas tudo que toca sofre um efeito devastador de inexistência."
  },

{
    "id": "seed_op_estrangeiro",
    "elemento": "Conhecimento",
    "name": "Estrangeiro",
    "photo": null,
    "vd": 340,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 3,
      "forca": 5,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 3
    },
    "defesa": 50,
    "deslocamento": "Voo 15m",
    "pv": 750,
    "pvMax": 750,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+20"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      },
      {
        "nome": "Ciência",
        "formula": "5d20+20"
      },
      {
        "nome": "Ocultismo",
        "formula": "5d20+20"
      },
      {
        "nome": "Furtividade",
        "formula": "3d20+20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver o Estrangeiro pela primeira vez, teste de Vontade (DT 40) ou sofre 10d6 de dano mental e fica apavorado por uma rodada. NEX 99%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Toque Sutil",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x3",
        "teste": "5d20+35",
        "danos": [
          "4d8+10 Conhecimento"
        ]
      },
      {
        "nome": "Rajada Psíquica",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Extremo)",
        "teste": "5d20+35",
        "danos": [
          "4d10+20 Conhecimento"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Comandar",
        "descricao": "Sempre que causa dano com a rajada psíquica, pode dominar a mente do alvo (Vontade DT 35 evita), forçando-o a Render-se, Atacar um aliado ou Fugir no próximo turno. Seres com Intelecto 5+ são imunes."
      },
      {
        "nome": "[Livre] Apagar Memória",
        "descricao": "Um ser insano pelos ataques do Estrangeiro tem a mente controlada por ele; como alternativa, pode apagar a memória da vítima e devolver 1d4 de Sanidade, fazendo-a duvidar da existência da criatura."
      },
      {
        "nome": "[Livre] Oblívio",
        "descricao": "Um ser que sofra dano do Toque Sutil esquece a existência do Estrangeiro (Vontade DT 30 evita), considerando-o invisível. Repete o teste no fim de cada turno; se passar, volta a percebê-lo mas sofre 6d6 de dano mental. Quem estiver incubando uma larva não repete o teste."
      },
      {
        "nome": "[Completa] Incubar",
        "descricao": "Toca um ser alheio à sua presença e implanta uma larva; tem acesso total à mente do hospedeiro à distância. A larva causa 1d6 de dano mental no início de cada cena; ao zerar a Sanidade, um novo Estrangeiro eclode da cabeça, matando o hospedeiro."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Decifrar os sinais e a linguagem do Estrangeiro faz com que ele perca sua imunidade a dano (exceto a Conhecimento) e não possa mais usar Incubar."
      }
    ],
    "descricao": "Uma manifestação paranormal inteligente que se comunica através de sinais em dispositivos digitais, associada a relatos de abdução alienígena. Parece ter linguagem própria e capacidade de estar em vários lugares ao mesmo tempo."
  },

{
    "id": "seed_op_sh_medusa",
    "elemento": "Conhecimento",
    "name": "Medusa",
    "photo": null,
    "vd": 320,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 5,
      "forca": 5,
      "intelecto": 4,
      "presenca": 5,
      "vigor": 3
    },
    "defesa": 50,
    "deslocamento": "12m, escalada 12m, natação 12m",
    "pv": 380,
    "pvMax": 380,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+20"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Faro, visão no escuro",
    "resistencias": "Imune a Conhecimento. Resistência a corte, impacto, perfuração e Morte 20. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver a Medusa pela primeira vez, teste de Vontade (DT 40) ou sofre 9d6 de dano mental e fica apavorado por uma rodada. NEX 95%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+35",
        "danos": [
          "8d8+20 corte"
        ]
      },
      {
        "nome": "Cauda",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto)",
        "teste": "5d20+35",
        "danos": [
          "8d8+40 impacto"
        ]
      },
      {
        "nome": "Jato Venenoso",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Longo)",
        "teste": "5d20+35",
        "danos": [
          "8d12 Morte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Veneno Mortal",
        "descricao": "Quem for atingido pelas garras ou jato venenoso fica envenenado: Fortitude DT 40 no início de cada turno ou sofre 4d10 de dano de Morte."
      },
      {
        "nome": "Recuperação Acelerada",
        "descricao": "Cura Acelerada 20, exceto dano de acertos críticos ou cortes no pescoço (Defesa 60 para esses golpes)."
      },
      {
        "nome": "Camuflagem Sombria",
        "descricao": "Em penumbra/escuridão, camuflagem e +10 em Furtividade."
      },
      {
        "nome": "Conhecimento de Eras",
        "descricao": "Expert em todas as perícias não listadas (4d20+20); comunica-se normalmente."
      },
      {
        "nome": "Olhar Petrificante",
        "descricao": "Quem olhar diretamente nos olhos dela faz Reflexos DT 40 ou fica petrificado (temporalmente paralisado, ainda pode ser ferido normalmente). Só se salva matando a Medusa. Lutar sem olhá-la diretamente causa penalidades de cego."
      },
      {
        "nome": "[Reação] Agarrão",
        "descricao": "Se acertar a cauda, pode agarrar (teste 5d20+37)."
      },
      {
        "nome": "[Livre] Dilacerar",
        "descricao": "Se acertar as duas garras, +8d8 de dano de corte."
      },
      {
        "nome": "[Padrão] Sussurrar Maléfico",
        "descricao": "Um ser em alcance médio sofre 6d10 de dano mental (Vontade DT 40 reduz à metade)."
      },
      {
        "nome": "[Padrão] Sugestões Irresistíveis",
        "descricao": "Um ser em alcance médio faz Vontade DT 40 ou não consegue evitar olhar para ela até seu próximo turno."
      },
      {
        "nome": "[Completa] Rastejar Imparável",
        "descricao": "Percorre o dobro do deslocamento ignorando terreno difícil; se terminar adjacente a alguém, ataca como ação livre."
      }
    ],
    "descricao": "Uma manifestação da lenda grega da górgona: forma feminina serpentina e sombria que colecionava vítimas petrificadas para sempre fitá-la, mantida em um covil-templo esculpido por seus próprios adoradores eternos."
  },

{
    "id": "seed_op_bicho_papao",
    "elemento": "Conhecimento",
    "name": "Bicho-Papão",
    "photo": null,
    "vd": 300,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 5,
      "forca": 4,
      "intelecto": 3,
      "presenca": 5,
      "vigor": 4
    },
    "defesa": 41,
    "deslocamento": "15m",
    "pv": 750,
    "pvMax": 750,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+25"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+20"
      },
      {
        "nome": "Atletismo",
        "formula": "4d20+15"
      },
      {
        "nome": "Furtividade",
        "formula": "5d20+18"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte, impacto e Conhecimento 20. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o bicho-papão pela primeira vez, teste de Vontade (DT 35) ou sofre 7d8 de dano mental e fica apavorado por uma rodada. NEX 90%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garras Atormentadoras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x3",
        "teste": "5d20+35",
        "danos": [
          "4d10+10 Conhecimento"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Tormento Infantil",
        "descricao": "Fica desprevenido se estiver ouvindo cantiga de ninar ou canção infantil. Se ouvir choro de criança, usa todas as ações para encontrar e silenciar a fonte."
      },
      {
        "nome": "Destruir Mente",
        "descricao": "Sempre que acerta um alvo perturbado com suas garras, causa também 1d8 de dano mental por acerto."
      },
      {
        "nome": "Tamanho Adaptável",
        "descricao": "Pode reduzir seu corpo para qualquer categoria de tamanho menor; deslocamento não é reduzido por furtividade ou escalada."
      },
      {
        "nome": "[Movimento] Atormentar",
        "descricao": "Envia sussurros a um ser em alcance curto: 3d8 de dano mental (Vontade DT 30 reduz à metade); +3d8 se estiver escondido do alvo."
      },
      {
        "nome": "[Completa] Saltar e Assustar",
        "descricao": "Se escondido de um ser em alcance curto, sai do esconderijo assumindo forma assustadora: o alvo sofre 10d8 de dano mental (Vontade DT 35 reduz à metade)."
      }
    ],
    "descricao": "Nascido da história que pais contam para crianças obedecerem, uma figura encapuzada e alongada como uma centopeia de braços e pernas humanoides, que se esconde em telhados, dutos e frestas, se comunicando por sussurros e cantigas macabras durante o sono das vítimas."
  },

{
    "id": "seed_op_sh_rascunho",
    "elemento": "Conhecimento",
    "name": "Rascunho",
    "photo": null,
    "vd": 300,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 2
    },
    "defesa": 48,
    "deslocamento": "15m",
    "pv": 750,
    "pvMax": 750,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Percepção às cegas, visão no escuro",
    "resistencias": "Resistência a Balístico, corte, impacto, perfuração, Conhecimento e Energia 20. Vulnerabilidade a Sangue e à Luz (sofre −10 na Defesa e perde as resistências sob luz que o ilumine por completo).",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o Rascunho pela primeira vez, teste de Vontade (DT 35) ou sofre 7d8 de dano mental e fica apavorado por uma rodada. NEX 90%+ imune."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Ele Não Existe",
        "descricao": "É invisível, inaudível e incorpóreo (sempre passa em Furtividade) enquanto alguém o observa diretamente — inclusive por reflexo. Se não observado, perde essas características. Combatê-lo sem olhar diretamente causa as penalidades de estar cego."
      },
      {
        "nome": "[Movimento] Possuir Objeto",
        "descricao": "Se não observado, uma vez por rodada arremessa um objeto contra um ser em alcance médio: 4d6 de dano de impacto (Reflexos DT 35 reduz à metade; dobrado se objeto muito pesado)."
      },
      {
        "nome": "[Padrão] Aterrorizar",
        "descricao": "Todos em até 9m à sua escolha sofrem 7d8 de dano mental (Vontade DT 35 reduz à metade)."
      },
      {
        "nome": "[Completa] Piscar",
        "descricao": "Até três vezes por cena, teletransporta-se para um espaço desocupado em alcance extremo mesmo sem linha de visão; se surgir adjacente a alguém, pode usar Aterrorizar como ação livre contra ele."
      }
    ],
    "descricao": "Uma memória apagada manifestada não pela lembrança, mas pela ideia de sua própria existência — vista apenas pelo canto do olho, nunca diretamente. Contornos negros e mutantes que se aproximam pelas pequenas brechas da percepção."
  },

{
    "id": "seed_op_ocioso",
    "elemento": "Conhecimento",
    "name": "Ocioso",
    "photo": null,
    "vd": 260,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 1,
      "forca": 5,
      "intelecto": 1,
      "presenca": 5,
      "vigor": 3
    },
    "defesa": 37,
    "deslocamento": "Voo 0m",
    "pv": 390,
    "pvMax": 390,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte, impacto e Conhecimento 20. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o ocioso pela primeira vez, teste de Vontade (DT 35) ou sofre 8d6 de dano mental e fica apavorado por uma rodada. NEX 80%+ imune."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Sempre Presente",
        "descricao": "No começo de uma cena, escolhe um personagem que possa vê-lo — só esse personagem o enxerga; para todos os demais, é invisível."
      },
      {
        "nome": "[Reação] Retaliação",
        "descricao": "Não ataca ativamente, mas se for atacado de qualquer forma, teletransporta-se para ficar adjacente ao atacante e faz um ataque corpo a corpo (teste 5d20+30, 4d10+20 de dano de impacto não letal)."
      },
      {
        "nome": "[Livre] Permanecer Próximo",
        "descricao": "Uma vez por rodada, teletransporta-se para qualquer ponto dentro do campo de visão do alvo."
      },
      {
        "nome": "[Completa] Aterrorizar",
        "descricao": "Fica parado; seu olhar entra na alma do alvo, que sofre 4d10+10 de dano mental se estiver adjacente."
      }
    ],
    "descricao": "Uma manifestação que aterroriza observando passivamente, visível apenas para um único alvo escolhido. Vítimas desenvolvem comportamento claustrofóbico, evitando espaços pequenos onde a criatura possa estar junto com eles. Parece deixar de existir quando o alvo fecha os olhos."
  },

{
    "id": "seed_op_espreitador",
    "elemento": "Conhecimento",
    "name": "Espreitador",
    "photo": null,
    "vd": 220,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 2,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 3
    },
    "defesa": 34,
    "deslocamento": "12m",
    "pv": 500,
    "pvMax": 500,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+20"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano (enquanto não encurralado, veja Enigma de Medo). Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 30,
        "descricao": "Ao ver o espreitador pela primeira vez, teste de Vontade (DT 30) ou sofre 7d6 de dano mental e fica apavorado por uma rodada. NEX 70%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "2d20+10",
        "danos": [
          "1d6+2 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Movimento] Correr pelas Frestas",
        "descricao": "Teletransporta-se para qualquer espaço em alcance longo, desde que haja uma pequena fresta no caminho."
      },
      {
        "nome": "[Completa] Espreitar",
        "descricao": "Uma vez por cena, se adjacente a um ser dormindo, causa 10d6 de dano mental (Vontade DT 30 reduz à metade); se enlouquecer, o espreitador pode criar uma cópia observada dela."
      },
      {
        "nome": "[Padrão] Cópia Observada",
        "descricao": "Manifesta uma cópia de um ser enlouquecido com Espreitar; usa a mesma ficha, mas causa dano de Conhecimento, não pode conjurar rituais nem usar habilidades paranormais, e dura até o fim da cena."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Só pode ser derrotado atraindo-o para fora do esconderijo simulando dormir (às 2h11) e fechando a porta antes que ele retorne, encurralando-o — quando encurralado, perde a imunidade a dano."
      }
    ],
    "descricao": "Uma forma asquerosa, curvada e cinza, com dezenas de olhos de pupilas amarelas na cabeça. Escolhe um alvo para assombrar, perturbando seu sono e devorando sua sanidade sem nunca ser percebido."
  },

{
    "id": "seed_op_sh_profundo",
    "elemento": "Conhecimento",
    "name": "Profundo",
    "photo": null,
    "vd": 200,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 4,
      "forca": 4,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 2
    },
    "defesa": 34,
    "deslocamento": "6m, natação 15m",
    "pv": 380,
    "pvMax": 380,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+10"
      }
    ],
    "sentidos": "Percepção às cegas, visão no escuro",
    "resistencias": "Resistência a Balístico, corte, impacto, perfuração, Energia e Sangue 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 30,
        "descricao": "Ao ver o Profundo pela primeira vez, teste de Vontade (DT 30) ou sofre 6d6 de dano mental e fica apavorado por uma rodada. NEX 65%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "4d20+25",
        "danos": [
          "4d10+20 perfuração"
        ]
      },
      {
        "nome": "Tentáculos",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x6 (máx. 2 no mesmo alvo)",
        "teste": "4d20+25",
        "danos": [
          "2d10+10 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Camuflagem Submersa",
        "descricao": "Quando submerso, camuflagem contra quem está além de 1,5m (total além disso) e +10 em Furtividade."
      },
      {
        "nome": "Regeneração Acelerada",
        "descricao": "Cura Acelerada 20/Morte e fogo."
      },
      {
        "nome": "[Reação] Agarrão",
        "descricao": "Ao acertar um tentáculo, pode agarrar (teste 4d20+30); mantém um agarrado por vez sem perder os demais ataques."
      },
      {
        "nome": "[Livre] Mastigar",
        "descricao": "Uma vez por rodada, se acertar dois tentáculos no mesmo ser, ataque adicional de mordida."
      },
      {
        "nome": "[Completa] Engolir",
        "descricao": "Se começa o turno agarrando alguém com os tentáculos, testa agarrar de novo (4d20+30); se vencer, engole o ser (cego, coberto, 2d10 Sangue + 2d10 perfuração por turno). Escapa vencendo agarrar/Acrobacia ou causando 30+ de dano."
      },
      {
        "nome": "[Completa] Onda Energética",
        "descricao": "Enlouquece sistemas eletrônicos em raio de 90m (Vontade DT 25 do portador evita)."
      }
    ],
    "descricao": "Um ser de pele esverdeada translúcida com corpo humanoide alongado e cabeça de lula, encontrado nas profundezas abissais. Emite uma luz vermelha hipnótica antes de dilacerar suas vítimas."
  },

{
    "id": "seed_op_rastejador_sombrio",
    "elemento": "Conhecimento",
    "name": "Rastejador Sombrio",
    "photo": null,
    "vd": 180,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 3,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 3
    },
    "defesa": 41,
    "deslocamento": "12m",
    "pv": 330,
    "pvMax": 330,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+15"
      },
      {
        "nome": "Ocultismo",
        "formula": "3d20+15"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte e impacto 10, Conhecimento 20. Vulnerabilidade a Sangue e Vulnerabilidade a Luz (sofre −10 em Defesa e perde Desespero, Rastejar e Tentáculos das Sombras sob luz forte).",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 25,
        "descricao": "Ao ver o rastejador pela primeira vez, teste de Vontade (DT 25) ou sofre 6d6 de dano mental e fica apavorado por uma rodada. NEX 60%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Toque da Dor",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x3",
        "teste": "4d20+20",
        "danos": [
          "4d8+5 Conhecimento"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Rastejar",
        "descricao": "Se sob cobertura ou camuflagem, recebe +10 em Furtividade e não tem deslocamento reduzido por se mover furtivamente até o início do próximo turno."
      },
      {
        "nome": "[Movimento] Tentáculos das Sombras",
        "descricao": "Projeta fibras pelas sombras, agarrando até três seres em alcance médio (Reflexos DT 28 evita); pode arrastá-los para outros pontos. Agarrados sofrem 4d6 de dano mental no fim de cada turno."
      },
      {
        "nome": "[Livre] Desespero",
        "descricao": "Sempre que causa dano com o toque da dor, causa a mesma quantidade de dano mental (Vontade DT 25 reduz o mental à metade)."
      }
    ],
    "descricao": "Entidade maligna que se aproxima escondida em sombras distorcidas, sádica e inteligente, escolhendo sempre causar a maior dor possível. Forma humanoide vestindo sobretudo e chapéu, com uma enorme boca e tentáculos que se infiltram pelo chão e paredes como sombra."
  },

{
    "id": "seed_op_sh_melancolia",
    "elemento": "Conhecimento",
    "name": "Melancolia",
    "photo": null,
    "vd": 140,
    "tipo": "Criatura",
    "porte": "Minúsculo",
    "attrs": {
      "agilidade": 4,
      "forca": 0,
      "intelecto": 4,
      "presenca": 3,
      "vigor": 1
    },
    "defesa": 29,
    "deslocamento": "9m",
    "pv": 200,
    "pvMax": 200,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+5"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Imune a dano (até a DT do Enigma de Medo chegar a 0 — veja Enigma de Medo).",
    "tracos": [
      {
        "titulo": "Vontade (infecção)",
        "dt": 25,
        "descricao": "Parasita invisível e incorpóreo que infecta por contato; a vítima deve passar em Vontade (DT 25, crescendo por estágio) ou fica infectada, sofrendo condições progressivas de Medo, Sangue, Morte e por fim Conhecimento — veja Parasitose Melancólica."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Parasita Invisível",
        "descricao": "É invisível e incorpóreo, podendo escalar uma pessoa sem ser sentido. Só evita a infecção quem passar em Vontade DT 25 no momento da tentativa."
      },
      {
        "nome": "Parasitose Melancólica",
        "descricao": "Segue regras de doença por contato (Vontade DT 25, crescente por estágio: 25/30/35/40). Estágio I (Medo): abalado. Estágio II (Sangue): alquebrado e frustrado. Estágio III (Morte): esmorecido. Estágio IV (Conhecimento): a vítima só pode agir para tirar a própria vida. Cada estágio recuperado leva um dia."
      },
      {
        "nome": "Parasitas Poderosos",
        "descricao": "Um parasita que já consumiu outros seres cresce (até Grande, DT 40) e fica mais forte."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "A vítima precisa perceber o parasita (evento narrativo, ou falhar por 5 ou menos no teste) e buscar ajuda (Intuição, Medicina, Ocultismo ou Profissão psicólogo, ou pequenos rituais de Ocultismo) contra a DT atual. Cada ajuda bem-sucedida reduz a DT em 5; ao chegar a 0, a Melancolia perde invisibilidade, incorporeidade e imunidade a dano."
      }
    ],
    "descricao": "Um parasita cruel e lento que deforma o rosto da vítima em uma expressão exagerada de tristeza, marcando-a com tatuagens paranormais visíveis conforme consome mais dela, e então migra para um novo hospedeiro."
  },

{
    "id": "seed_op_lembrado",
    "elemento": "Conhecimento",
    "name": "Lembrado",
    "photo": null,
    "vd": 100,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 4,
      "presenca": 2,
      "vigor": 2
    },
    "defesa": 22,
    "deslocamento": "9m",
    "pv": 180,
    "pvMax": 180,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+10"
      },
      {
        "nome": "Ciências",
        "formula": "4d20+10"
      },
      {
        "nome": "Ocultismo",
        "formula": "4d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte e impacto 10, Conhecimento 20. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o lembrado pela primeira vez, teste de Vontade (DT 20) ou sofre 4d6 de dano mental e fica apavorado por uma rodada. NEX 45%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "2d20+5",
        "danos": [
          "2d4+7 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Aura Manifestada",
        "descricao": "Cercado por uma aura dourada de faces flutuantes que gritam; personagens em alcance curto sofrem −2d20 em todos os testes."
      },
      {
        "nome": "[Padrão] Expandir Aura",
        "descricao": "Expande a aura; seres em alcance curto sofrem 6d6 de dano mental (Vontade DT 20 reduz à metade)."
      }
    ],
    "descricao": "Versão amplificada de um existido: alguém com alta exposição paranormal e forte contenção psicológica cujo Conhecimento consumiu por completo a mente. Comete atrocidades apenas para jamais ser esquecido, gritando o nome que o Outro Lado lhe deu."
  },

{
    "id": "seed_op_parasita_de_culpa",
    "elemento": "Conhecimento",
    "name": "Parasita de Culpa",
    "photo": null,
    "vd": 60,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 0,
      "intelecto": 4,
      "presenca": 4,
      "vigor": 1
    },
    "defesa": 15,
    "deslocamento": "6m",
    "pv": 90,
    "pvMax": 90,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "4d20"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "4d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano (exceto causado pelo hospedeiro).",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o parasita pela primeira vez, teste de Vontade (DT 20) ou sofre 2d6 de dano mental e fica apavorado por uma rodada. NEX 35%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "1d20",
        "danos": [
          "1d4 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Devorar Culpa",
        "descricao": "Alimenta-se da culpa e traumas de um hospedeiro. Ao se fixar em alguém dormindo, prende todos que dormem em alcance médio em um sonho compartilhado até ser derrotado ou o hospedeiro morrer/enlouquecer."
      },
      {
        "nome": "[Completa] Fixar",
        "descricao": "Aproxima-se de alguém dormindo (Percepção com −2d20 do alvo, oposta à Furtividade 2d20+15 do parasita); se o alvo passar, desperta antes da fixação; se falhar, torna-se hospedeiro."
      },
      {
        "nome": "[Completa] Atormentar",
        "descricao": "Se fixado, atormenta a mente do hospedeiro e de todos que ele mantém inconscientes: 2d6 de dano mental no início de cada cena do sonho (Vontade DT 20 reduz à metade)."
      },
      {
        "nome": "[Completa] Cópias do Hospedeiro",
        "descricao": "Se fixado, manifesta até quatro cópias de Conhecimento do hospedeiro, com 20 PV cada, causando dano de Conhecimento."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Os personagens precisam perceber que vivem um sonho compartilhado, identificar o hospedeiro, e o hospedeiro deve confrontar e derrotar as manifestações sozinho dentro do sonho."
      }
    ],
    "descricao": "Uma criatura disforme que se alimenta da culpa através de pesadelos e ilusões baseadas em traumas não resolvidos da vítima, distorcendo figuras e acontecimentos do passado."
  },

{
    "id": "seed_op_vulto",
    "elemento": "Conhecimento",
    "name": "Vulto",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 2,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 1
    },
    "defesa": 19,
    "deslocamento": "12m",
    "pv": 60,
    "pvMax": 60,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte e perfuração 5, Conhecimento 10. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 15,
        "descricao": "Ao ver o vulto pela primeira vez, teste de Vontade (DT 15) ou sofre 3d6 de dano mental e fica apavorado por uma rodada. NEX 30%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Toque Macabro",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+10",
        "danos": [
          "2d6 Conhecimento"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Aura Tangível",
        "descricao": "Ataques contra pessoas sob qualquer condição de medo causam +2d6 de dano de Conhecimento."
      },
      {
        "nome": "[Completa] Plantar Paranoia",
        "descricao": "Implanta medo na mente das vítimas: cada personagem em alcance médio fica abalado (Vontade DT 15 evita), ou apavorado se já estiver abalado. Se estiver escondido ao usar, cada personagem sofre −1d20 no teste."
      }
    ],
    "descricao": "Manifestação criada pelo Medo e delírio de um observador em ambientes com a Membrana danificada — uma criatura humanoide de névoa sólida que sequer estava lá, capaz de causar estragos reais. Busca pessoas assustadas para se alimentar dos sentimentos de susto."
  },

{
    "id": "seed_op_existido",
    "elemento": "Conhecimento",
    "name": "Existido",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 4,
      "presenca": 2,
      "vigor": 2
    },
    "defesa": 13,
    "deslocamento": "9m",
    "pv": 36,
    "pvMax": 36,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+10"
      },
      {
        "nome": "Ciências",
        "formula": "4d20+10"
      },
      {
        "nome": "Ocultismo",
        "formula": "4d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Resistência a Balístico, corte e impacto 5, Conhecimento 10. Vulnerabilidade a Sangue.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 14,
        "descricao": "Ao ver o existido pela primeira vez, teste de Vontade (DT 14) ou sofre 1d6 de dano mental e fica apavorado por uma rodada. NEX 25%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "1d20+5",
        "danos": [
          "1d4+1 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Brilho Enlouquecedor",
        "descricao": "Uma vez por rodada, faz suas marcas douradas brilharem; seres em alcance médio que o vejam sofrem 1d6 de dano mental (Vontade DT 14 reduz à metade)."
      },
      {
        "nome": "[Movimento] Fortalecimento Paranormal",
        "descricao": "Até o fim da cena, recebe +1d20 em testes de Agilidade, Força e Vigor e suas pancadas causam +2d4 de dano de Conhecimento; só pode usar se já tiver causado dano mental com Brilho Enlouquecedor nesta cena."
      }
    ],
    "descricao": "Uma vez humano, hoje apenas uma casca desesperada para continuar existindo. Alguém que foi longe demais no Conhecimento do Outro Lado e não consegue esquecer o que viu, repetindo seu próprio nome na tentativa de ser lembrado."
  },

  // ────────────────────────────────────────────────────────────
  // 4. CRIATURAS DE ENERGIA
  // ────────────────────────────────────────────────────────────
{
    "id": "seed_op_anfitriao",
    "elemento": "Energia",
    "name": "Anfitrião",
    "photo": null,
    "vd": 413,
    "tipo": "Entidade",
    "porte": "Médio",
    "attrs": {
      "agilidade": 7,
      "forca": 5,
      "intelecto": 6,
      "presenca": 6,
      "vigor": 5
    },
    "defesa": 59,
    "deslocamento": "12m",
    "pv": 1413,
    "pvMax": 1413,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "6d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "7d20+35"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+25"
      },
      {
        "nome": "Reflexos",
        "formula": "7d20+35"
      },
      {
        "nome": "Vontade",
        "formula": "6d20+25"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Imune a condições de paralisia, dano e efeitos de Energia. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver o Anfitrião pela primeira vez, teste de Vontade (DT 45) ou sofre 10d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Corte Caótico (Liber)",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "7d20+45",
        "danos": [
          "3d12+20 Energia"
        ]
      },
      {
        "nome": "Lança e Adaga (Plautus)",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "7d20+45",
        "danos": [
          "2d12+20 Energia"
        ]
      },
      {
        "nome": "Corte de Água (Silenus)",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "7d20+45",
        "danos": [
          "5d12+20 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Potência de Energia",
        "descricao": "Modificador +35 para testes de Agilidade e Intelecto; +25 para os demais atributos."
      },
      {
        "nome": "Ato 1: Cinco Facetas",
        "descricao": "Inicia o combate dividido em 5 facetas — Amphitruo, Aeneas, Liber, Silenus e Plautus — cada uma com as mesmas estatísticas, mas 250 PV e resistência a dano 20 próprias, só podendo usar habilidades com seu nome. Quando todas forem destruídas, o Anfitrião retorna à forma única e inicia o Ato 2."
      },
      {
        "nome": "Ato 2: Forma Única",
        "descricao": "Retorna à forma única com todos os PV, pode usar todas as habilidades das cinco facetas e executar 3 ações padrão por rodada (desde que diferentes)."
      },
      {
        "nome": "Trilha Sonora (Ato 2)",
        "descricao": "No início de cada turno do Anfitrião, cada ser em alcance longo sofre 2d10 de dano mental."
      },
      {
        "nome": "Roleta Maluca (Ato 2)",
        "descricao": "No início do turno, cada ser em alcance longo sofre um efeito aleatório (1d6, cumulativo se repetido): −5 na Defesa; ação completa fazendo algo sem sentido ou 4d10 de dano mental; 4d20 de dano de Energia; −1d20 em Pontaria; −1d20 em Luta; ou nada."
      },
      {
        "nome": "[Padrão] Teatro (Amphitruo)",
        "descricao": "Envia um texto incompreensível à mente do alvo, que deve recitá-lo com perfeição (Artes DT 35) ou passar em Vontade DT 45, senão sofre 10d6 de dano mental."
      },
      {
        "nome": "[Padrão] Queimar (Aeneas)",
        "descricao": "Dispara chamas em cone de alcance médio: 10d6+20 de dano de Energia (Reflexos DT 45 reduz à metade)."
      },
      {
        "nome": "[Livre] Romance Forçado (Liber)",
        "descricao": "Ao acertar o corte caótico, escolhe outro ser visível; os dois decidem entre si quem sofre o dano."
      },
      {
        "nome": "[Livre] Eu Sou o Caos (Plautus)",
        "descricao": "Ao acertar lança e adaga em desprevenido/flanqueado, causa +4d12 de dano de Energia."
      },
      {
        "nome": "[Livre] Afogamento (Silenus)",
        "descricao": "Quem sofre dano do corte de água fica asfixiado (Fortitude DT 35 evita); pode repetir o teste no fim de cada turno."
      },
      {
        "nome": "[Movimento] Teletransporte",
        "descricao": "Transporta-se para outro ponto em alcance médio."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Só pode ser enfrentado sob a proteção do Equilíbrio, oferecida apenas pela Máscara do Desespero. Resolvido, remove sua imunidade a dano. É a única coisa capaz de resolver o Enigma de Medo do Deus da Morte."
      }
    ],
    "descricao": "A personificação do caos e da irracionalidade, capaz de transformar tudo que toca de forma abstrata e incompreensível. Inicia combates dividido em cinco facetas teatrais distintas, cada uma com seu próprio estilo de ataque."
  },

{
    "id": "seed_op_anomalia",
    "elemento": "Energia",
    "name": "Anomalia",
    "photo": null,
    "vd": 380,
    "tipo": "Entidade",
    "porte": "Médio",
    "attrs": {
      "agilidade": 0,
      "forca": 0,
      "intelecto": 5,
      "presenca": 5,
      "vigor": 0
    },
    "defesa": 0,
    "deslocamento": "0m",
    "pv": 1000,
    "pvMax": 1000,
    "pd": 0,
    "pdMax": 0,
    "pericias": [],
    "sentidos": "Visão no escuro. Sem Percepção, Iniciativa, Reflexos ou Defesa numéricos — veja Imaterial.",
    "resistencias": "Imune a dano e a todas as condições.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 45,
        "descricao": "Ao ver a anomalia pela primeira vez, teste de Vontade (DT 45) ou sofre 9d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Imaterial",
        "descricao": "Corpo físico desprezível escondido atrás de uma imensidão de Energia paranormal; imune a dano e a todas as condições. Não faz testes e não age como outras criaturas. Só pode ser derrotada resolvendo seu Enigma de Medo."
      },
      {
        "nome": "Existência Impossível",
        "descricao": "Existe apenas dentro de um objeto que possa ser aberto por uma porta. Enquanto a porta estiver aberta, está manifestada e pode usar seus poderes; passa a perseguir quem a manifestou toda vez que abrirem uma porta ou compartimento."
      },
      {
        "nome": "[Livre] Romper Consciência",
        "descricao": "No início do turno, sorteia um ser em sua linha de visão: 10d6 de dano mental (Vontade DT 41 reduz à metade); se ficar insano por esse dano, é absorvido pela anomalia."
      },
      {
        "nome": "[Livre] Manipular Ondas da Existência",
        "descricao": "No final do turno, ativa/desativa/opera até seis objetos tecnológicos em alcance médio, ou sobrecarrega-os causando 2d12 de dano de Energia por objeto em todos na área (Reflexos DT 30 reduz à metade)."
      },
      {
        "nome": "[Completa] Manifestar o Impossível",
        "descricao": "Invoca uma ou mais criaturas de Energia cujo VD total some até 240, aparecendo em alcance curto e agindo a partir da próxima rodada."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Só pode ser combatida mergulhando nela para entendê-la no Outro Lado. Quando resolvido, transforma-se em um ser ou objeto aleatório por 2d4 rodadas, perdendo imunidade a dano e condições (mantendo seus próprios PV)."
      }
    ],
    "descricao": "Uma criatura tão caótica que a Realidade a esconde atrás da menor das possibilidades. Manifesta-se ao abrir portas ou compartimentos (elevadores, micro-ondas), perseguindo quem a escolheu ao acaso e levando-os à loucura."
  },

{
    "id": "seed_op_tempestuoso",
    "elemento": "Energia",
    "name": "Tempestuoso",
    "photo": null,
    "vd": 360,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 5,
      "forca": 4,
      "intelecto": 2,
      "presenca": 5,
      "vigor": 4
    },
    "defesa": 56,
    "deslocamento": "24m",
    "pv": 950,
    "pvMax": 950,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+20"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+25"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+30"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Imune a condições de paralisia. Resistência a Balístico, corte, perfuração e Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver o tempestuoso pela primeira vez, teste de Vontade (DT 40) ou sofre 8d8 de dano mental e fica apavorado por uma rodada."
      }
    ],
    "acoes": [
      {
        "nome": "Garras Radioativas",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (também atinge alcance curto)",
        "teste": "5d20+40",
        "danos": [
          "4d20+20 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Aura Radioativa",
        "descricao": "Qualquer ser que comece o turno em alcance curto sofre 2d20+20 de dano de Energia (Fortitude DT 40 reduz à metade)."
      },
      {
        "nome": "Espectro Radioativo",
        "descricao": "Manifesta um espectro de radiação como extensão de seu corpo; ataques e habilidades corpo a corpo podem ser feitos em alcance curto."
      },
      {
        "nome": "[Livre] Raio de Energia Radioativa",
        "descricao": "Ao acertar dois ataques de garras no mesmo ser, projeta um raio deste ser para outro alvo em alcance médio: 4d20+20 de dano de Energia (Reflexos DT 40 reduz à metade)."
      },
      {
        "nome": "[Completa] Expandir em Radiação",
        "descricao": "Concentra e expande energia radioativa; cada ser em alcance longo sofre 10d20+20 de dano de Energia (Reflexos DT 40 reduz à metade). O próprio tempestuoso perde 100 PV ao usar."
      }
    ],
    "descricao": "Uma tempestade do caos: nuvem de pura Energia em forma humanoide, em constante transformação, contida por cabos metálicos e tecnologia incompreensível. Só se origina em ambientes com a Membrana extremamente danificada, como usinas radioativas abandonadas."
  },

{
    "id": "seed_op_telopsia",
    "elemento": "Energia",
    "name": "Telopsia",
    "photo": null,
    "vd": 340,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 2,
      "intelecto": 3,
      "presenca": 5,
      "vigor": 2
    },
    "defesa": 48,
    "deslocamento": "12m",
    "pv": 560,
    "pvMax": 560,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "5d20+25"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+20"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+15"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+20"
      },
      {
        "nome": "Vontade",
        "formula": "5d20+25"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+20"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Imune a condições de paralisia. Resistência a Balístico, corte, perfuração e Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver o telopsia pela primeira vez, teste de Vontade (DT 40) ou sofre 10d6 de dano mental e fica apavorado por uma rodada. NEX 99%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Toque Desintegrador",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x3",
        "teste": "4d20+35",
        "danos": [
          "6d12+30 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Movimento] Viajar pela Tela",
        "descricao": "Desmaterializa-se e se materializa em outra tela/visor em alcance longo, depois se desloca 9m."
      },
      {
        "nome": "[Padrão] Tela Zumbificadora",
        "descricao": "Projeta imagens em sua tela; todos em alcance médio sofrem 6d6 de dano mental e ficam confusos até o fim da cena (Vontade DT 30 reduz o dano à metade e evita); quem já estiver confuso e falhar também fica fascinado."
      },
      {
        "nome": "[Completa] Prender na Tela",
        "descricao": "Desintegra um ser em alcance curto e o materializa dentro de sua tela (Fortitude DT 30 evita); paralisado, sofre 2d12 de dano mental por turno. Sempre que o telopsia sofrer 50+ de dano em um turno, o preso pode repetir Fortitude para escapar."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Só pode ser derrotado destruindo a fita VHS amaldiçoada que o originou; se destruída, seus PV são reduzidos a 0 e é destruído. Caso contrário, mesmo derrotado em combate, eventualmente retorna."
      }
    ],
    "descricao": "A lenda da fita VHS amaldiçoada: uma gravação misteriosa que causa a morte de quem assiste. Homem esquelético em sobretudo preto com uma cabeça de televisão antiga transmitindo imagens perturbadoras. Restam apenas manchas em silhueta de suas vítimas."
  },

{
    "id": "seed_op_degolificada",
    "elemento": "Energia",
    "name": "Degolificada",
    "photo": null,
    "vd": 320,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 5,
      "intelecto": 3,
      "presenca": 4,
      "vigor": 4
    },
    "defesa": 45,
    "deslocamento": "6m",
    "pv": 850,
    "pvMax": 850,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "4d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20"
      },
      {
        "nome": "Fortitude",
        "formula": "4d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "4d20+25"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano (até que sua origem seja investigada e confrontada — veja Enigma de Medo).",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 40,
        "descricao": "Ao ver a degolificada pela primeira vez, teste de Vontade (DT 40) ou sofre 9d6 de dano mental e fica apavorado por uma rodada. NEX 95%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+35",
        "danos": [
          "8d8+20 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Criatura de Medo",
        "descricao": "É imune a dano até que o mistério de sua origem seja resolvido e ela seja confrontada com a causa de sua morte, sem poder escapar."
      },
      {
        "nome": "[Livre] Agarrar e Estrangular",
        "descricao": "Se acertar a pancada em um ser Médio ou menor, pode agarrar (teste 5d20+35); o agarrado fica asfixiado. Mantém até duas criaturas agarradas por vez."
      },
      {
        "nome": "[Livre] Grito Rasgado",
        "descricao": "Uma vez por cena, rompe a vedação da boca e grita: cada ser em alcance médio sofre 4d10+10 de dano mental e um efeito de surdez aleatório (1d4: surdo permanente em um ou dois ouvidos, ou até o fim da cena) — Vontade DT 35 reduz o dano à metade e evita o efeito."
      },
      {
        "nome": "[Movimento] Desfiguramento Capilar",
        "descricao": "Usa os longos cabelos para perfurar orifícios faciais; cada ser agarrado sofre 10d6+20 de dano de perfuração (Fortitude DT 35 reduz à metade) e 6d10 de dano mental (Vontade DT 35 reduz à metade)."
      },
      {
        "nome": "Metamorfose — Degolificada Devoradora (Sangue)",
        "descricao": "Se mata um alvo e o mantém agarrado até seu próximo turno, absorve-o e ganha um ataque de mordida (5d20+35, 10d10+20 Sangue) e resistência a Sangue 20."
      },
      {
        "nome": "Metamorfose — Degolificada Conturbada (Energia)",
        "descricao": "Se enlouquece um alvo, assume forma de espectro de Energia: atravessa paredes, ignora coberturas, seu dano vira Energia, e ganha resistência a Energia 20."
      },
      {
        "nome": "Metamorfose — Degolificada Decrépita (Morte)",
        "descricao": "Após 3 erros consecutivos contra ela, assume forma esquelética de Lodo: deslocamento aumenta para 12m, ganha resistência a Morte 20, e os cabelos viram Lodo capazes de agarrar (ação de movimento, Reflexos DT 35 evita)."
      },
      {
        "nome": "Metamorfose — Degolificada Gnóstica (Conhecimento)",
        "descricao": "Se receber a resposta errada ao tentarem resolver seu enigma, sigilos dourados de Conhecimento aparecem ao redor dela; no fim de cada turno, o alvo visível mais próximo sofre uma alucinação (4d6 de dano mental e atordoado até o fim do próximo turno, Vontade DT 35 reduz e evita)."
      }
    ],
    "descricao": "Uma das criaturas mais temidas, formada por todos os elementos paranormais conhecidos. Figura humanoide flutuante com cabelo negro liso até o chão, movendo-se com vontade própria, e um rosto de olhos vazios atrás dos fios. Ligada a tragédias envolvendo mortes cruéis de crianças ou adolescentes em rituais."
  },

{
    "id": "seed_op_infecticidio",
    "elemento": "Energia",
    "name": "Infecticídio",
    "photo": null,
    "vd": 280,
    "tipo": "Criatura",
    "porte": "Enorme",
    "attrs": {
      "agilidade": 3,
      "forca": 5,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 5
    },
    "defesa": 25,
    "deslocamento": "9m",
    "pv": 600,
    "pvMax": 600,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "5d20+20"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+15"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Resistência a Balístico, corte, perfuração e Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o infecticídio pela primeira vez, teste de Vontade (DT 35) ou sofre 8d6 de dano mental e fica apavorado por uma rodada. NEX 85%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancadas Infectadas",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x3",
        "teste": "5d20+30",
        "danos": [
          "4d12+20 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Horda",
        "descricao": "Sofre apenas metade do dano de ataques/habilidades que afetem um só ser, mas o dobro de efeitos de área. Ataques que erram ainda causam metade do dano (exceto se o defensor usou reação para se esquivar)."
      },
      {
        "nome": "[Livre] Infecção",
        "descricao": "Um ser que sofra dano das pancadas é infectado pelo vírus do infecticídio (Fortitude DT 30 evita); quem passar fica imune até o fim da cena."
      },
      {
        "nome": "[Reação] Consumação Insidiosa",
        "descricao": "Se reduzir um ser a 0 PV com as pancadas infectadas, consome a vítima e recupera 50 PV."
      },
      {
        "nome": "[Completa] Atropelar",
        "descricao": "Percorre até o dobro do deslocamento, passando pelo espaço de outros seres e atacando cada um que atravessar."
      }
    ],
    "descricao": "Uma doença paranormal originada como vírus digital em dispositivos eletrônicos, que infecta seres vivos formando uma horda descontrolada com mente compartilhada e ensandecida. Contagia por sangue, saliva ou infectando dispositivos."
  },

{
    "id": "seed_op_anomiatico",
    "elemento": "Energia",
    "name": "Anomiático",
    "photo": null,
    "vd": 240,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 5,
      "forca": 3,
      "intelecto": 1,
      "presenca": 4,
      "vigor": 3
    },
    "defesa": 41,
    "deslocamento": "18m",
    "pv": 600,
    "pvMax": 600,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "4d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "5d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "5d20+20"
      },
      {
        "nome": "Vontade",
        "formula": "4d20+15"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Resistência a Balístico, corte e perfuração 10, Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 30,
        "descricao": "Ao ver o anomiático pela primeira vez, teste de Vontade (DT 30) ou sofre 6d8 de dano mental e fica apavorado por uma rodada. NEX 75%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Garra Desintegradora",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "5d20+30",
        "danos": [
          "4d12+20 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Comportamento Errático",
        "descricao": "No início do turno, rola 1d6 três vezes e executa cada resultado na ordem: (1-2) salta até 18m e agride com garras se ficar adjacente; (3) vira facho de Energia e se move até um alvo aleatório; (4) explode parte do corpo — 4d12+20/6d12+20/8d12+20 de dano de Energia por distância (Reflexos DT 30 reduz a média e curto/médio à metade), perde 50 PV; (5) risada descontrolada, fica desprevenido mas ataques imprevisíveis; (6) toca um adjacente causando 10d12+20 de dano de Energia (Fortitude DT 30 reduz à metade). Ação que não puder executar: fica parado e ganha +10 de resistência a dano até o próximo turno."
      }
    ],
    "descricao": "Um espectro da loucura originado de um corpo transformado ao extremo pela Energia. Vulto de luz que se teleporta desenfreadamente, rindo caoticamente enquanto ataca de forma completamente aleatória."
  },

{
    "id": "seed_op_sh_espectro_inesquecido",
    "elemento": "Energia",
    "name": "Espectro Inesquecido (exemplo, NEX 55%)",
    "photo": null,
    "vd": 220,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 1,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 2
    },
    "defesa": 27,
    "deslocamento": "9m",
    "pv": 340,
    "pvMax": 340,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Ciências",
        "formula": "3d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "2d20+10"
      },
      {
        "nome": "Intimidação",
        "formula": "3d20+5"
      },
      {
        "nome": "Intuição",
        "formula": "3d20+10"
      },
      {
        "nome": "Investigação",
        "formula": "3d20+10"
      },
      {
        "nome": "Medicina",
        "formula": "3d20+10"
      },
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      }
    ],
    "sentidos": "Percepção às cegas, visão no escuro",
    "resistencias": "Resistência a Balístico, corte, impacto, perfuração, Conhecimento e Morte 15, Energia 25. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 35,
        "descricao": "Ao ver o espectro pela primeira vez, teste de Vontade (DT 35) ou sofre 6d8 de dano mental e fica apavorado por uma rodada. NEX 75%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Lâmina Espectral",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 19)",
        "teste": "2d20+10",
        "danos": [
          "1d4+31 Energia"
        ]
      },
      {
        "nome": "Pistola Sinalizadora Espectral",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto)",
        "teste": "3d20+15",
        "danos": [
          "2d6+32 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Sobre Espectros Inesquecidos",
        "descricao": "Não existe uma ficha padrão: cada espectro é gerado a partir da ficha de um Marcado (personagem morto), tornando-se uma criatura de Energia com VD = 4× o NEX do Marcado, mantendo porte, deslocamento, atributos e perícias originais, e ganhando Presença Perturbadora, bônus de Defesa/resistências/PV/dano por faixa de VD (Tabela 3.1 do livro), e convertendo todos os ataques e habilidades do Marcado em manifestações espectrais de dano de Energia. Esta ficha é um EXEMPLO usando um Marcado de NEX 55%."
      },
      {
        "nome": "Balística Avançada",
        "descricao": "Proficiência com armas táticas de fogo e +2 em rolagens de dano com elas."
      },
      {
        "nome": "Ecléticos e perícias herdadas",
        "descricao": "Mantém as habilidades do Marcado original: Conhecimento Aplicado, Eclético, Investigação Científica, Na Trilha Certa, Pensamento Ágil, Perito, Equipe de Trauma e Paramédico, todas usando Pontos de Esforço (PE) — este exemplo tem 66 PE."
      },
      {
        "nome": "[Completa] Aterrorizar",
        "descricao": "Comum a todo espectro: pessoas e animais em alcance curto sofrem dano mental conforme a faixa de VD (neste exemplo, 2d8, Vontade DT 15 reduz à metade)."
      }
    ],
    "descricao": "Ecos das memórias da Realidade, repetições distorcidas de Marcados que morreram no passado em que poderiam ter sobrevivido — não são almas nem fantasmas, mas sobreposições anacrônicas manifestadas onde a Membrana é frágil e revisitada por outro Marcado com a mesma Marca."
  },

{
    "id": "seed_op_viajante",
    "elemento": "Energia",
    "name": "Viajante",
    "photo": null,
    "vd": 200,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 2,
      "intelecto": 3,
      "presenca": 4,
      "vigor": 2
    },
    "defesa": 34,
    "deslocamento": "9m",
    "pv": 360,
    "pvMax": 360,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "4d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "4d20+15"
      }
    ],
    "sentidos": "Visão no escuro. Escalada 9m.",
    "resistencias": "Resistência a Balístico, corte e perfuração 10, Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o viajante pela primeira vez, teste de Vontade (DT 20) ou sofre 6d6 de dano mental e fica apavorado por uma rodada. NEX 60%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+15",
        "danos": [
          "2d12+10 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Invisibilidade Permanente",
        "descricao": "É invisível: recebe camuflagem total, +15 em Furtividade, e quem não puder vê-lo fica desprevenido contra seus ataques."
      },
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar a pancada em um ser Médio ou menor, pode agarrar (teste 2d20+15)."
      },
      {
        "nome": "[Completa] Devorar Memória",
        "descricao": "Entra na mente de um ser agarrado e devora suas memórias: 4d12 de dano mental e esquecimento completo de uma pessoa (Vontade DT 29 reduz o dano à metade e evita o efeito). Cada vítima perturbada assim aumenta o dano de sua pancada em +1d12 até o fim da cena."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Só pode ser visto fotografando-o sem que esteja de fato viajando através da imagem, o que o distrai e torna visível por alguns segundos. Quando resolvido, perde a Invisibilidade Permanente até o início do próximo turno de quem o fotografou."
      }
    ],
    "descricao": "Uma criatura maligna que distorce memórias, se transportando através de fotografias e consumindo o rosto de todos que nelas aparecem. Corpo esbranquiçado, membros alongados e uma cabeça com incontáveis rostos mesclados; anda em paredes e tetos, fisicamente invisível."
  },

{
    "id": "seed_op_sukkalgir",
    "elemento": "Energia",
    "name": "Sukkalgir",
    "photo": null,
    "vd": 160,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 2,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 2
    },
    "defesa": 34,
    "deslocamento": "Voo 18m",
    "pv": 220,
    "pvMax": 220,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Imune a dano balístico, de corte e de perfuração. Resistência a impacto e Energia 10. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 25,
        "descricao": "Ao ver a sukkalgir pela primeira vez, teste de Vontade (DT 25) ou sofre 4d8 de dano mental e fica apavorado por uma rodada. NEX 55%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Mordida do Outro Lado",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+15",
        "danos": [
          "2d12 mental"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Aura Desesperada",
        "descricao": "Qualquer ser que comece o turno em alcance curto sofre 2d12 de dano mental (Vontade DT 25 reduz à metade)."
      },
      {
        "nome": "Espírito Plasmático",
        "descricao": "É parcialmente intangível e pode atravessar obstáculos sólidos como paredes."
      },
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar a mordida em um ser Médio ou menor, pode agarrar (teste 3d20+15)."
      },
      {
        "nome": "[Completa] Grito de Desespero",
        "descricao": "Cada ser em alcance médio sofre 3d12 de dano mental (Vontade DT 20 reduz à metade; cobertura dá +5)."
      }
    ],
    "descricao": "Uma alma torturada através do fogo, originada na antiga Suméria por texto cravado com brasa na pele de vítimas. Corpo de Energia semelhante a uma labareda, pairando acima do chão, com um sorriso desesperado rasgado em um grito enlouquecedor constante."
  },

{
    "id": "seed_op_anarquico_descontrolado",
    "elemento": "Energia",
    "name": "Anárquico Descontrolado",
    "photo": null,
    "vd": 120,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 3,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 28,
    "deslocamento": "12m",
    "pv": 120,
    "pvMax": 120,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Resistência a Balístico, corte e perfuração 10, Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 21,
        "descricao": "Ao ver o anárquico descontrolado pela primeira vez, teste de Vontade (DT 21) ou sofre 4d6 de dano mental e fica apavorado por uma rodada. NEX 50%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada Energética",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+15",
        "danos": [
          "4d12 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Aceleração",
        "descricao": "Sempre que um personagem sofre dano da pancada energética, entra em aceleração: se realizar uma ação de movimento e uma padrão (ou uma completa) no próximo turno, sofre 4d12 de dano de Energia."
      },
      {
        "nome": "[Movimento] Autodestruição",
        "descricao": "Concentra Energia e se autodestrói, causando 8d12 de dano de Energia em alcance curto (Reflexos DT 25 reduz à metade; adjacentes sofrem −2d20 no teste). O anárquico descontrolado morre após usar."
      }
    ],
    "descricao": "Versão potencializada do anárquico, quando alguém de alta exposição paranormal é transformado após um desastre extremamente inoportuno. Forma translúcida e alucinada, hiperativa e caótica, capaz de explodir o próprio corpo em Energia."
  },

{
    "id": "seed_op_sh_uivar",
    "elemento": "Energia",
    "name": "O Uivar",
    "photo": null,
    "vd": 100,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 0,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 1
    },
    "defesa": 20,
    "deslocamento": "Voo 12m",
    "pv": 100,
    "pvMax": 100,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+10"
      }
    ],
    "sentidos": "Percepção às cegas",
    "resistencias": "Imune a dano.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 20,
        "descricao": "Ao ver o Uivar pela primeira vez, teste de Vontade (DT 20) ou sofre 4d6 de dano mental e fica apavorado por uma rodada. NEX 45%+ imune."
      }
    ],
    "acoes": [],
    "poderes": [
      {
        "nome": "Alterações Climáticas",
        "descricao": "Altera constantemente o clima em raio de 90m: frio extremo, neblina, neve e vento forte."
      },
      {
        "nome": "Vibrações Térmicas",
        "descricao": "É invisível e incorpóreo, quase silencioso (só um assovio de vento gelado). Quem o vê enxerga uma silhueta Média vazia e distorcida."
      },
      {
        "nome": "[Movimento] Granizo Perfurante",
        "descricao": "Gera granizo; se usado na mesma rodada de Congelar, todos sem cobertura na área sofrem 2d8 de dano de perfuração (Reflexos DT 20 reduz à metade)."
      },
      {
        "nome": "[Padrão] Congelar",
        "descricao": "Emana frio absorvendo calor em raio de 90m: 2d8 de dano de frio (Fortitude DT 20 reduz à metade); também escurece o céu, congela objetos (−1d20 em testes de manipulação) e gera granizo/chuva/vendaval até o fim da cena/missão."
      },
      {
        "nome": "[Padrão] Beijo Gélido",
        "descricao": "Aproxima-se e suga a temperatura de um ser corpo a corpo: 6d6 de dano de Energia e fica lento (Fortitude DT 20 reduz à metade). Reduzido a 0 PV assim vira uma \"estátua de gelo\" petrificada (20 PV, RD 20/fogo); o Uivar recupera 20 PV ao petrificar, mas perde 10 PV se a estátua for destruída (e quem a matar sofre 6d6 de dano mental, Vontade DT 20 reduz à metade)."
      }
    ],
    "descricao": "Uma anomalia climática paranormal: nevasca incontrolável e irreversível, silhueta gélida e vazia que rouba o calor e a essência de suas vítimas, deixando estátuas de gelo em seu rastro."
  },

{
    "id": "seed_op_ciborgue",
    "elemento": "Energia",
    "name": "Ciborgue",
    "photo": null,
    "vd": 80,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 25,
    "deslocamento": "9m",
    "pv": 160,
    "pvMax": 160,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "2d20"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Imune a condições de paralisia. Resistência a Balístico, corte e perfuração 10, Energia 20. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 15,
        "descricao": "Ao ver o ciborgue pela primeira vez, teste de Vontade (DT 15) ou sofre 2d6 de dano mental e fica apavorado por uma rodada. NEX 40%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Braço Laminado (Estado Alpha)",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 18)",
        "teste": "3d20+10",
        "danos": [
          "1d12+10 corte"
        ]
      },
      {
        "nome": "Punho Energizado (Estado Beta)",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+10",
        "danos": [
          "2d8+10 impacto"
        ]
      },
      {
        "nome": "Canhão (Estado Gama)",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Longo)",
        "teste": "3d20+10",
        "danos": [
          "4d12+5 Energia"
        ]
      },
      {
        "nome": "Raio Energético (Estado Delta)",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Médio)",
        "teste": "3d20+10",
        "danos": [
          "1d12+5 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Regeneração Energética",
        "descricao": "Recupera 20 PV no início do turno; perde esta habilidade se perder três ou mais estados de combate."
      },
      {
        "nome": "Estado de Combate",
        "descricao": "No início do turno, assume um dos quatro estados disponíveis — Alpha (ataque próximo), Beta (perseguição/punho), Gama (distância), Delta (tático/defensivo) — que define suas ações disponíveis. Um estado deixa de estar disponível quando sua fraqueza é resolvida."
      },
      {
        "nome": "[Completa] Investida Energética (Beta)",
        "descricao": "Avança até 24m e ataca com punho energizado com +1d20; se acertar, +2d8 de dano (total 4d8+10) e derruba o alvo (Fortitude DT 20 evita)."
      },
      {
        "nome": "[Movimento] Criar Barreira (Delta)",
        "descricao": "+5 na Defesa até o início do próximo turno."
      },
      {
        "nome": "[Movimento] Reiniciar (Delta)",
        "descricao": "Encerra uma condição que o esteja afetando."
      },
      {
        "nome": "[Livre] Desorientar (Delta)",
        "descricao": "Um ser que sofra dano do raio energético fica alquebrado (ou atordoado 1 rodada se já estava, Vontade DT 20 evita)."
      },
      {
        "nome": "Enigma de Medo",
        "descricao": "Cada estado tem uma fraqueza específica (ex: sofrer 15 de dano de um tipo específico, ou exposição a uma substância). Resolvida a fraqueza de um estado, o ciborgue não pode mais assumi-lo. Sem nenhum estado, se desativa: Defesa 10 e deslocamento 0m."
      }
    ],
    "descricao": "Originado de um cientista obcecado por melhorias cibernéticas que amputou os próprios membros, substituindo-os por mecanismos ativados por Energia paranormal. Grande aglomerado de partes mecânicas e orgânicas, com comportamento que muda espontaneamente."
  },

{
    "id": "seed_op_perturbado_de_energia",
    "elemento": "Energia",
    "name": "Perturbado de Energia",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 1,
      "intelecto": 0,
      "presenca": 0,
      "vigor": 0
    },
    "defesa": 19,
    "deslocamento": "9m",
    "pv": 60,
    "pvMax": 60,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "-2d20"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "-2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "-2d20"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Resistência a Balístico, corte e perfuração 5, Energia 10. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 15,
        "descricao": "Ao ver o perturbado pela primeira vez, teste de Vontade (DT 15) ou sofre 2d8 de dano mental e fica apavorado por uma rodada. NEX 30%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Toque Plasmático",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "4d20+10",
        "danos": [
          "2d12 Energia"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Implantar Confusão",
        "descricao": "Uma vez por rodada, tenta agarrar um personagem que acabou de sofrer dano do toque plasmático (teste 4d20+10). Se conseguir, implanta imagens traumáticas: 2d8 de dano mental (Vontade DT 15 reduz à metade) e vulnerabilidade a Energia até o fim da cena."
      }
    ],
    "descricao": "Quando uma alma é enlouquecida de forma brusca e agressiva, o resultado é uma forma plasmática inconsistente e desesperada que se agarra a qualquer consciência próxima tentando compartilhar sua discórdia mental."
  },

{
    "id": "seed_op_anarquico",
    "elemento": "Energia",
    "name": "Anárquico",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 2,
      "intelecto": 0,
      "presenca": 0,
      "vigor": 1
    },
    "defesa": 21,
    "deslocamento": "9m",
    "pv": 30,
    "pvMax": 30,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "-2d20"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "-2d20"
      }
    ],
    "sentidos": "Visão no escuro",
    "resistencias": "Resistência a Energia 5. Vulnerabilidade a Conhecimento.",
    "tracos": [
      {
        "titulo": "Presença Perturbadora",
        "dt": 14,
        "descricao": "Ao ver o anárquico pela primeira vez, teste de Vontade (DT 14) ou sofre 2d6 de dano mental e fica apavorado por uma rodada. NEX 25%+ imune."
      }
    ],
    "acoes": [
      {
        "nome": "Pancada Errática",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "2d12 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Comportamento Errático",
        "descricao": "No início do turno, role 1d6: (1-2) investe/agride o mais próximo; (3-4) projeta luz prismática em um ser em alcance médio, 2d8 de dano de Energia e atordoado 1 rodada (Fortitude DT 14 reduz e evita); (5) explosão de Energia em alcance curto, 2d6 de dano (Reflexos DT 14 reduz à metade, +1d6 se adjacente); (6) risada descontrolada, ataca desprevenido mas seus ataques ficam imprevisíveis. Se não puder agir, fica parado com resistência a dano 5 até o próximo turno."
      }
    ],
    "descricao": "Quando alguém morre em situações azaradas com a Membrana danificada, o corpo é consumido pela entidade de Energia, tendo oxigênio e líquido substituídos pela surrealidade da entidade. Pele semi-transparente, órgãos brilhantes e coloridos, movimentos erráticos e imprevisíveis."
  },

  // ────────────────────────────────────────────────────────────
  // 5. AMEAÇAS DA REALIDADE
  // ────────────────────────────────────────────────────────────
  // -- Criminosos & Mercenários --
{
    "id": "seed_op_sh_artista_da_morte",
    "elemento": "Realidade",
    "name": "Artista da Morte",
    "photo": null,
    "vd": 140,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 1,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 1
    },
    "defesa": 27,
    "deslocamento": "9m",
    "pv": 150,
    "pvMax": 150,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+15"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      },
      {
        "nome": "Artes",
        "formula": "3d20+15"
      },
      {
        "nome": "Enganação",
        "formula": "3d20+15"
      },
      {
        "nome": "Furtividade",
        "formula": "3d20+15"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+15",
        "danos": [
          "1d4+15 impacto"
        ]
      },
      {
        "nome": "Machado",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico x3)",
        "teste": "3d20+15",
        "danos": [
          "2d8+15 corte"
        ]
      },
      {
        "nome": "Motosserra",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico x4)",
        "teste": "3d20+15",
        "danos": [
          "3d6+15 corte"
        ]
      },
      {
        "nome": "Bisturi",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 19/x4)",
        "teste": "3d20+15",
        "danos": [
          "1d4+17 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Matar é uma Arte",
        "descricao": "Usa Artes no lugar de qualquer outra perícia envolvendo mentes/corpos humanos (ex: no lugar de Medicina para necrópsia, ou de Diplomacia para persuadir); com horas para analisar uma cena/vítima, substitui Investigação por Artes com +1d20."
      },
      {
        "nome": "Cenas Imprevisíveis",
        "descricao": "Se busca disfarçar a cena como acidente, testes para achar pistas ali têm DT +5. Se busca deixar sua marca, quem vê a cena fica enjoado e, se não sair, sofre 4d8 de dano mental (Vontade DT 25 reduz à metade e evita)."
      },
      {
        "nome": "[Livre] Ataque Furtivo",
        "descricao": "Uma vez por rodada, +7d6 de dano corpo a corpo (ou à distância em alcance curto) contra desprevenidos ou flanqueados."
      },
      {
        "nome": "[Padrão] Discurso Artístico",
        "descricao": "Todos que o ouçam em alcance curto sofrem 4d8 de dano mental e ficam alquebrados e frustrados (Vontade DT 25 reduz à metade e evita); uma vez por cena por pessoa."
      }
    ],
    "descricao": "Para este assassino, matar é uma arte meticulosa a ser dominada e admirada — não é um combatente, mas planeja cada morte e cena de crime com atenção obsessiva."
  },

{
    "id": "seed_op_comandante_mercenario",
    "elemento": "Realidade",
    "name": "Comandante Mercenário",
    "photo": null,
    "vd": 120,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 29,
    "deslocamento": "9m",
    "pv": 145,
    "pvMax": 145,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Intimidação",
        "formula": "2d20+10"
      },
      {
        "nome": "Tática",
        "formula": "2d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "Resistência a Balístico, corte, impacto e perfuração 5.",
    "tracos": [],
    "acoes": [
      {
        "nome": "Metralhadora",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Médio, crítico 19/x3)",
        "teste": "2d20+17",
        "danos": [
          "3d12+15 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Sadismo",
        "descricao": "Se causar dano em um inimigo, seu próximo ataque recebe +1d20 no teste e, se acertar, causa mais um dado de dano do mesmo tipo."
      },
      {
        "nome": "[Completa] Ataque em Movimento",
        "descricao": "Pode percorrer seu deslocamento e atacar em qualquer ponto durante o movimento, com seus dois ataques corpo a corpo ou à distância."
      },
      {
        "nome": "[Movimento] Ordens",
        "descricao": "Grita ordens para aliados em alcance médio: eles recebem +1d20 em testes de perícia e causam mais um dado de dano do mesmo tipo até o fim da cena."
      }
    ],
    "descricao": "Um homem ou mulher endurecido por anos de conflitos: tanto um oficial competente capaz de liderar subordinados quanto um combatente perigoso por si só."
  },

{
    "id": "seed_op_assassino",
    "elemento": "Realidade",
    "name": "Assassino",
    "photo": null,
    "vd": 80,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 4,
      "forca": 2,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 2
    },
    "defesa": 26,
    "deslocamento": "9m",
    "pv": 90,
    "pvMax": 90,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "4d20+15"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "4d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+10"
      },
      {
        "nome": "Crime",
        "formula": "4d20+10"
      },
      {
        "nome": "Enganação",
        "formula": "3d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "4d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Faca",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 19)",
        "teste": "4d20+17",
        "danos": [
          "1d4+11 corte"
        ]
      },
      {
        "nome": "Pistola",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Curto, crítico 16/x4)",
        "teste": "4d20+15",
        "danos": [
          "1d12+14 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Evasão",
        "descricao": "Quando sofre um ataque que permite teste de Reflexos para reduzir o dano à metade, não sofre dano algum se passar."
      },
      {
        "nome": "[Livre] Ataque Furtivo",
        "descricao": "Uma vez por rodada, causa +4d6 de dano corpo a corpo (ou à distância em alcance curto) contra desprevenidos ou flanqueados."
      },
      {
        "nome": "[Livre] Mão na Boca",
        "descricao": "Ao fazer um ataque corpo a corpo furtivo contra alguém desprevenido, pode tentar agarrar (teste 2d20+15); enquanto agarrada, a vítima não pode falar."
      },
      {
        "nome": "[Movimento] Assassinar",
        "descricao": "Analisa um ser em alcance curto; até o fim do próximo turno, seu primeiro Ataque Furtivo contra ele tem os dados extras dobrados."
      }
    ],
    "descricao": "Um matador habilidoso e furtivo, que surge quando as ameaças da Realidade precisam eliminar alguém de forma discreta e eficiente."
  },

{
    "id": "seed_op_sh_cacador_de_gente",
    "elemento": "Realidade",
    "name": "Caçador de Gente",
    "photo": null,
    "vd": 80,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 3,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 23,
    "deslocamento": "9m",
    "pv": 80,
    "pvMax": 80,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Atletismo",
        "formula": "3d20+10"
      },
      {
        "nome": "Sobrevivência",
        "formula": "1d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [],
    "poderes": [
      {
        "nome": "Abrutalhado",
        "descricao": "Pode usar itens de duas mãos com uma só e itens de criaturas Grandes sem penalidade; ganha resistência a dano 10/paranormal enquanto machucado."
      },
      {
        "nome": "Área de Caça",
        "descricao": "Recebe +1d20 em testes de perícia na área isolada onde vive e caça."
      },
      {
        "nome": "Faro para Humanos",
        "descricao": "+2d20 em Sobrevivência envolvendo pessoas; percebe humanos pelo olfato como se tivesse faro."
      },
      {
        "nome": "[Movimento] Imparável",
        "descricao": "Anula qualquer efeito que reduza seu deslocamento (outras consequências continuam valendo)."
      },
      {
        "nome": "[Padrão] Assustar",
        "descricao": "Um movimento assustador causa 4d6 de dano mental a todos que o vejam/ouçam em alcance curto (Vontade DT 20 reduz à metade)."
      },
      {
        "nome": "[Padrão] Fatalidade",
        "descricao": "Um único ataque de pancada que, se acertar, também causa um ferimento debilitante; uma vez por cena por alvo."
      }
    ],
    "descricao": "Um assassino além da convivência social, com sede de sangue incontrolável, isolado no campo ou em prédios abandonados."
  },

{
    "id": "seed_op_sh_predador_sofisticado",
    "elemento": "Realidade",
    "name": "Predador Sofisticado",
    "photo": null,
    "vd": 60,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 2,
      "presenca": 3,
      "vigor": 1
    },
    "defesa": 21,
    "deslocamento": "9m",
    "pv": 60,
    "pvMax": 60,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+10"
      },
      {
        "nome": "Diplomacia",
        "formula": "3d20+10"
      },
      {
        "nome": "Enganação",
        "formula": "3d20+10"
      },
      {
        "nome": "Intimidação",
        "formula": "3d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Navalha",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 19/x3)",
        "teste": "3d20+10",
        "danos": [
          "1d8+13 corte"
        ]
      },
      {
        "nome": "Machado",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico x3)",
        "teste": "3d20+10",
        "danos": [
          "2d8+13 corte"
        ]
      },
      {
        "nome": "Pistola Silenciada",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Curto, crítico x3)",
        "teste": "3d20+10",
        "danos": [
          "1d12+13 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Escondido em Plena Vista",
        "descricao": "Em locais movimentados, usa Enganação no lugar de Furtividade e não sofre penalidade por ações chamativas enquanto furtivo."
      },
      {
        "nome": "Recursos Abundantes",
        "descricao": "Dinheiro abre portas — pode acessar locais/documentos normalmente restritos e cometer crimes menores impunemente."
      },
      {
        "nome": "Sorriso Sedutor",
        "descricao": "Quem não sabe que é um assassino fica desprevenido contra ele e sofre −1d20 em testes contra ele."
      },
      {
        "nome": "[Livre] Ataque Furtivo",
        "descricao": "Uma vez por rodada, +3d6 de dano corpo a corpo (ou à distância em alcance curto) contra desprevenidos ou flanqueados."
      },
      {
        "nome": "[Padrão] Guarda-Costas",
        "descricao": "Uma vez por cena, chama 1d4+1 capangas, que entram em cena na rodada seguinte."
      }
    ],
    "descricao": "Um assassino sofisticado que vive no topo de arranha-céus, subestimando vítimas e rivais de cima — prefere mortes limpas e discretas, mas é brutal quando tem oportunidade."
  },

{
    "id": "seed_op_soldado_de_aluguel",
    "elemento": "Realidade",
    "name": "Soldado de Aluguel",
    "photo": null,
    "vd": 40,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 18,
    "deslocamento": "9m",
    "pv": 25,
    "pvMax": 25,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Machete",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 19)",
        "teste": "2d20+10",
        "danos": [
          "1d6+9 corte"
        ]
      },
      {
        "nome": "Fuzil de Assalto",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Médio, crítico 19/x3)",
        "teste": "2d20+10",
        "danos": [
          "2d8+9 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Completa] Ataque em Movimento",
        "descricao": "Pode percorrer seu deslocamento e atacar em qualquer ponto durante o movimento."
      }
    ],
    "descricao": "Um combatente profissional que trabalha para quem pagar mais."
  },

{
    "id": "seed_op_capanga",
    "elemento": "Realidade",
    "name": "Capanga",
    "photo": null,
    "vd": 20,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 1
    },
    "defesa": 14,
    "deslocamento": "9m",
    "pv": 8,
    "pvMax": 8,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Crime",
        "formula": "2d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "2d20+5"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Faca",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "1d4+2 perfuração"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Ataque Furtivo",
        "descricao": "Uma vez por rodada, causa +1d6 de dano corpo a corpo (ou à distância em alcance curto) contra desprevenidos ou flanqueados."
      }
    ],
    "descricao": "Pessoas embrutecidas que vivem pela violência — membros de gangue, executores da máfia, leões de chácara de boates."
  },

{
    "id": "seed_op_bandido",
    "elemento": "Realidade",
    "name": "Bandido",
    "photo": null,
    "vd": 10,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 2,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 13,
    "deslocamento": "9m",
    "pv": 17,
    "pvMax": 17,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Intimidação",
        "formula": "1d20+5"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Bastão",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "1d8+7 impacto"
        ]
      },
      {
        "nome": "Revólver",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto, crítico 19/x3)",
        "teste": "1d20+5",
        "danos": [
          "2d6+5 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Ataque Furtivo",
        "descricao": "Uma vez por rodada, causa +2d6 de dano corpo a corpo (ou à distância em alcance curto) contra desprevenidos ou flanqueados."
      }
    ],
    "descricao": "Um criminoso típico, como um ladrão ou assaltante."
  },

  // -- Cultistas --
{
    "id": "seed_op_lider_de_culto",
    "elemento": "Realidade",
    "name": "Líder de Culto",
    "photo": null,
    "vd": 140,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 1,
      "intelecto": 3,
      "presenca": 3,
      "vigor": 2
    },
    "defesa": 27,
    "deslocamento": "9m",
    "pv": 150,
    "pvMax": 150,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      },
      {
        "nome": "Enganação",
        "formula": "3d20+15"
      },
      {
        "nome": "Ocultismo",
        "formula": "3d20+15"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Faca",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 19)",
        "teste": "2d20+10",
        "danos": [
          "1d4+1 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Conjurador",
        "descricao": "Escolhe dois rituais de 1º, dois de 2º e dois de 3º círculo de até dois elementos; pode conjurá-los sem pagar PE, até um limite de 10 PE por conjuração. DT para resistir: 25."
      }
    ],
    "descricao": "Experiente e capaz de conjurar rituais mais poderosos, mantém habilmente seu disfarce de bom cidadão — pode ser qualquer um, até alguém muito próximo dos agentes."
  },

{
    "id": "seed_op_sh_religioso",
    "elemento": "Realidade",
    "name": "Religioso",
    "photo": null,
    "vd": 40,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 2,
      "presenca": 3,
      "vigor": 1
    },
    "defesa": 15,
    "deslocamento": "9m",
    "pv": 32,
    "pvMax": 32,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+5"
      },
      {
        "nome": "Diplomacia",
        "formula": "3d20+5"
      },
      {
        "nome": "Intuição",
        "formula": "3d20+5"
      },
      {
        "nome": "Religião",
        "formula": "3d20+5"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "1d20+5",
        "danos": [
          "1d3+1 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Fé Inabalável",
        "descricao": "+10 em Vontade contra efeitos paranormais (incluindo rituais)."
      },
      {
        "nome": "Potência da Voz",
        "descricao": "Com microfone/amplificador, o alcance de suas habilidades aumenta um passo e a DT delas +5."
      },
      {
        "nome": "Seguidores",
        "descricao": "Está sempre acompanhado por 1d4+1 iniciados devotos, dispostos a protegê-lo."
      },
      {
        "nome": "[Padrão] Voz Guia",
        "descricao": "Uma pessoa em alcance curto que o ouça recebe um bônus em seu próximo teste de perícia até o fim da próxima rodada."
      },
      {
        "nome": "[Padrão] Voz Acusadora",
        "descricao": "Escolhe alguém em alcance curto e a humilha: 3d6 de dano mental e fica alquebrada (Vontade DT 15 reduz à metade e evita)."
      },
      {
        "nome": "[Reação] Sacrifício Sagrado",
        "descricao": "Uma vez por rodada, ao sofrer dano, pode trocar de lugar com um seguidor adjacente, que sofre o dano em seu lugar."
      }
    ],
    "descricao": "Líder religioso carismático, capaz de arrebatar a adoração de seus fiéis — para o bem de sua congregação, ou em busca de riqueza e poder paranormal."
  },

{
    "id": "seed_op_iniciado",
    "elemento": "Realidade",
    "name": "Iniciado",
    "photo": null,
    "vd": 20,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 1
    },
    "defesa": 16,
    "deslocamento": "9m",
    "pv": 15,
    "pvMax": 15,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Enganação",
        "formula": "2d20+5"
      },
      {
        "nome": "Ocultismo",
        "formula": "2d20+5"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Faca",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 19)",
        "teste": "1d20",
        "danos": [
          "1d4+1 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Conjurador",
        "descricao": "Escolhe dois rituais de 1º círculo de um elemento; pode conjurá-los sem pagar PE, até um limite de 3 PE por conjuração. DT para resistir: 15."
      }
    ],
    "descricao": "Ainda iniciado no caminho da adoração às entidades, mas já capaz de conjurar rituais — um oponente perigoso para agentes inexperientes."
  },

  // -- Policiais --
{
    "id": "seed_op_chefe_de_policia",
    "elemento": "Realidade",
    "name": "Chefe de Polícia",
    "photo": null,
    "vd": 100,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 3,
      "intelecto": 2,
      "presenca": 3,
      "vigor": 3
    },
    "defesa": 25,
    "deslocamento": "9m",
    "pv": 105,
    "pvMax": 105,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "3d20+15"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "3d20+15"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Bastão",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+15",
        "danos": [
          "1d8+8 impacto"
        ]
      },
      {
        "nome": "Espingarda",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "x2 (Curto, crítico x3)",
        "teste": "2d20+17",
        "danos": [
          "4d6+12 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Reação] Teimoso",
        "descricao": "Uma vez por cena, pode ignorar um efeito que exija teste de resistência ou reduzir um dano recém-sofrido à metade."
      }
    ],
    "descricao": "Um delegado ou coronel que já passou por situações difíceis e não se intimida facilmente."
  },

{
    "id": "seed_op_policial_de_elite",
    "elemento": "Realidade",
    "name": "Policial de Elite",
    "photo": null,
    "vd": 60,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 27,
    "deslocamento": "6m",
    "pv": 40,
    "pvMax": 40,
    "pd": 0,
    "pdMax": 0,
    "pericias": [],
    "sentidos": "",
    "resistencias": "Resistência a Balístico, corte, impacto e perfuração 5.",
    "tracos": [],
    "acoes": [
      {
        "nome": "Bastão",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "3d20+10",
        "danos": [
          "1d8+13 impacto"
        ]
      },
      {
        "nome": "Fuzil de Assalto",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Médio, crítico 17/x3)",
        "teste": "3d20+10",
        "danos": [
          "2d8+13 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Padrão] Lança-Granadas",
        "descricao": "Uma vez por cena, dispara uma granada explosiva em alcance médio: cada ser a 6m do impacto sofre 8d6 de dano de impacto (Reflexos DT 19 reduz à metade)."
      },
      {
        "nome": "Fortificação",
        "descricao": "50% de chance de ignorar o dano adicional de um acerto crítico ou ataque furtivo."
      },
      {
        "nome": "[Completa] Empurrar e Atirar",
        "descricao": "Empurra um adjacente 3m (Fortitude DT 19 evita) e atira com o fuzil de assalto; se empurrou, recebe +1d20 no ataque e +2d8 no dano se acertar."
      }
    ],
    "descricao": "Treinado e equipado para situações extremas — provavelmente o primeiro a aparecer quando uma investigação discreta se transforma em confronto armado."
  },

{
    "id": "seed_op_sh_investigador",
    "elemento": "Realidade",
    "name": "Investigador",
    "photo": null,
    "vd": 40,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 1,
      "intelecto": 2,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 18,
    "deslocamento": "9m",
    "pv": 68,
    "pvMax": 68,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Crime",
        "formula": "2d20+5"
      },
      {
        "nome": "Diplomacia",
        "formula": "1d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "2d20+5"
      },
      {
        "nome": "Intuição",
        "formula": "1d20+5"
      },
      {
        "nome": "Investigação",
        "formula": "2d20+5"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Soco",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "1d20+10",
        "danos": [
          "1d3+1 impacto"
        ]
      },
      {
        "nome": "Revólver",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto, crítico 19/x3)",
        "teste": "2d20+10",
        "danos": [
          "2d6+6 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Fonte de Informações",
        "descricao": "Se amigável, uma vez por interlúdio pode dar +5 em uma ação de revisar caso."
      },
      {
        "nome": "[Movimento] Olhar do Investigador",
        "descricao": "Investigação (DT 15) para notar uma fraqueza em um ser em alcance médio; se passar, seus ataques causam +1d6 até o fim da cena."
      }
    ],
    "descricao": "Um agente da lei especializado em trabalho investigativo em campo — escrivão, investigador privado ou detetive, a favor ou contra os agentes da Ordem."
  },

{
    "id": "seed_op_policial",
    "elemento": "Realidade",
    "name": "Policial",
    "photo": null,
    "vd": 20,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 1,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 19,
    "deslocamento": "9m",
    "pv": 15,
    "pvMax": 15,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Bastão",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "1d8+7 impacto"
        ]
      },
      {
        "nome": "Pistola",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto, crítico 18)",
        "teste": "2d20+5",
        "danos": [
          "1d12+5 balístico"
        ]
      }
    ],
    "poderes": [],
    "descricao": "O policial padrão, patrulhando ruas e praças. Provavelmente nunca teve contato com o paranormal. Pode representar vigias e seguranças com treinamento em armas."
  },

  // -- Civis --
{
    "id": "seed_op_investido",
    "elemento": "Realidade",
    "name": "Investido",
    "photo": null,
    "vd": 40,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 1,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 1
    },
    "defesa": 17,
    "deslocamento": "9m",
    "pv": 35,
    "pvMax": 35,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Enganação",
        "formula": "2d20+10"
      },
      {
        "nome": "Ocultismo",
        "formula": "2d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Faca",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 19)",
        "teste": "2d20+5",
        "danos": [
          "1d4+1 corte"
        ]
      },
      {
        "nome": "Revólver",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto, crítico 19/x3)",
        "teste": "2d20",
        "danos": [
          "2d6 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Conjurador",
        "descricao": "Escolhe dois rituais de 1º círculo e dois de 2º círculo de até dois elementos; pode conjurá-los sem pagar PE, até um limite de 5 PE por conjuração. DT para resistir: 17."
      }
    ],
    "descricao": "Tendo executado os ritos iniciais e provado lealdade ao seu Elemento, um cultista comprometido com as entidades — um perigo real para a Realidade."
  },

{
    "id": "seed_op_sh_fazendeiro_isolado",
    "elemento": "Realidade",
    "name": "Fazendeiro Isolado",
    "photo": null,
    "vd": 20,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 16,
    "deslocamento": "9m",
    "pv": 16,
    "pvMax": 16,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Profissão (fazendeiro)",
        "formula": "1d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Peixeira",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 19)",
        "teste": "2d20+5",
        "danos": [
          "1d8+5 corte"
        ]
      },
      {
        "nome": "Espingarda",
        "execucao": "Padrão",
        "forma": "À distância",
        "vezes": "(Curto, crítico x3)",
        "teste": "1d20+5",
        "danos": [
          "4d6 balístico"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "De Sol a Sol",
        "descricao": "Não fica inconsciente por ter os PV reduzidos a 0."
      },
      {
        "nome": "Histórias de Pescador",
        "descricao": "Pode fazer um teste de revisar o caso usando Profissão (fazendeiro) se os agentes compartilharem a investigação com ele."
      },
      {
        "nome": "Resiliência do Campo",
        "descricao": "Pode usar Profissão (fazendeiro) no lugar de perícias baseadas em Força ou Presença."
      },
      {
        "nome": "[Movimento] Atiçar os Cães",
        "descricao": "Comanda cães de guarda contra um alvo em alcance curto; seu próximo ataque acertado causa +1d8 de dano de perfuração e derruba o alvo (Luta DT 15 evita)."
      }
    ],
    "descricao": "Vive isolado no campo, desconfiado de estranhos e acostumado a resolver tudo com as próprias mãos."
  },

{
    "id": "seed_op_sh_medico",
    "elemento": "Realidade",
    "name": "Médico",
    "photo": null,
    "vd": 20,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 1
    },
    "defesa": 13,
    "deslocamento": "9m",
    "pv": 14,
    "pvMax": 14,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Ciências",
        "formula": "2d20+5"
      },
      {
        "nome": "Medicina",
        "formula": "2d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Bisturi",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "(crítico 18)",
        "teste": "2d20+5",
        "danos": [
          "1d4+1 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Conhecimento Anatômico",
        "descricao": "Um alvo atingido pelo bisturi fica atordoado por uma rodada e sangrando (Fortitude DT 15 evita); uma vez por cena por pessoa."
      },
      {
        "nome": "[Padrão] Tratar Ferimentos",
        "descricao": "Cura 2d10+2 PV de si mesmo ou de um adjacente, uma vez por dia por pessoa."
      }
    ],
    "descricao": "Treinado para socorrer pessoas — pode ser a salvação de um grupo, ou nas mãos erradas, uma fonte de dor e morte."
  },

{
    "id": "seed_op_sh_burocrata",
    "elemento": "Realidade",
    "name": "Burocrata",
    "photo": null,
    "vd": 10,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 2,
      "presenca": 2,
      "vigor": 1
    },
    "defesa": 11,
    "deslocamento": "9m",
    "pv": 6,
    "pvMax": 6,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Diplomacia",
        "formula": "2d20+5"
      },
      {
        "nome": "Profissão (burocrata)",
        "formula": "2d20+10"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Soco",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "1d20",
        "danos": [
          "1d3+1 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Atendimento Protocolar",
        "descricao": "Sua atitude inicial com desconhecidos é sempre indiferente; enquanto indiferente ou pior, causa −5 em testes baseados em Intelecto e Presença contra ele."
      },
      {
        "nome": "Burocracia Frustrante",
        "descricao": "Quem falha em um teste de Intelecto ou Presença contra ele perde 1 ponto de Sanidade."
      },
      {
        "nome": "Morosidade",
        "descricao": "Em cenas com urgência, cada personagem que o encontrar pela primeira vez faz Diplomacia (DT 15) ou perde uma rodada em discussão/procedimento."
      },
      {
        "nome": "Preencha o Formulário",
        "descricao": "Interrogá-lo exige a perícia certa conforme sua área de atuação (definida pelo mestre); usar a perícia errada falha automaticamente."
      }
    ],
    "descricao": "Encarregado de zelar pela execução de trâmites organizacionais em serviços públicos ou negócios privados — um obstáculo (ou aliado relutante) quando o tempo está contra os agentes."
  },

{
    "id": "seed_op_sh_bebado_local",
    "elemento": "Realidade",
    "name": "Bêbado Local",
    "photo": null,
    "vd": 10,
    "tipo": "Humano",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 0,
      "presenca": 0,
      "vigor": 1
    },
    "defesa": 12,
    "deslocamento": "6m",
    "pv": 6,
    "pvMax": 6,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "-2d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "-2d20"
      },
      {
        "nome": "Diplomacia",
        "formula": "1d20+5"
      }
    ],
    "sentidos": "",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Soco",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "1d20",
        "danos": [
          "1d3+1 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Invisibilidade Social",
        "descricao": "Se não estiver fazendo algo chamativo, outras pessoas precisam de um teste de Percepção (DT 15) para notá-lo."
      },
      {
        "nome": "Causos e Histórias",
        "descricao": "Personagens recebem +5 em Investigação para interrogá-lo, desde que a DT da informação seja 20 ou menos."
      },
      {
        "nome": "Espião Involuntário",
        "descricao": "Quem interage com ele faz Intuição ou Vontade (DT 15) ou revela involuntariamente uma informação relevante, que o mestre pode usar depois para aumentar a DT de um teste de investigação."
      }
    ],
    "descricao": "Simpático, falante e conhecido de toda a vizinhança, circula de bar em bar compartilhando histórias e fofocas — uma valiosa (ou perigosa) fonte de informação."
  },

  // -- Animais --
{
    "id": "seed_op_sh_leao",
    "elemento": "Realidade",
    "name": "Leão",
    "photo": null,
    "vd": 60,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 0,
      "presenca": 2,
      "vigor": 2
    },
    "defesa": 18,
    "deslocamento": "15m",
    "pv": 80,
    "pvMax": 80,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+10"
      },
      {
        "nome": "Vontade",
        "formula": "2d20+5"
      },
      {
        "nome": "Atletismo",
        "formula": "3d20+10"
      },
      {
        "nome": "Furtividade",
        "formula": "3d20+8"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 19)",
        "teste": "3d20+10",
        "danos": [
          "1d6+4 corte"
        ]
      },
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+10",
        "danos": [
          "1d8+4 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acerta a mordida em um ser Médio ou menor, pode tentar agarrar (teste 3d20+12)."
      },
      {
        "nome": "[Completa] Bote",
        "descricao": "Investida com mordida e as duas garras contra o mesmo alvo, todos com +1d20 da investida."
      }
    ],
    "descricao": "O \"rei das selvas\", um dos maiores predadores das savanas africanas — outrora comum em circos brasileiros, ainda encontrado em coleções (geralmente ilegais) de animais exóticos."
  },

{
    "id": "seed_op_sh_urso_pardo",
    "elemento": "Realidade",
    "name": "Urso Pardo",
    "photo": null,
    "vd": 60,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 1,
      "forca": 3,
      "intelecto": 0,
      "presenca": 2,
      "vigor": 3
    },
    "defesa": 19,
    "deslocamento": "12m",
    "pv": 90,
    "pvMax": 90,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+10"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "2d20"
      },
      {
        "nome": "Atletismo",
        "formula": "3d20+10"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "Resistência a Balístico, corte, impacto e perfuração 2.",
    "tracos": [],
    "acoes": [
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 19)",
        "teste": "3d20+10",
        "danos": [
          "1d6+4 corte"
        ]
      },
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+10",
        "danos": [
          "1d8+4 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acerta a mordida em um ser Médio ou menor, pode tentar agarrar (teste 3d20+12)."
      }
    ],
    "descricao": "Um dos ursos mais perigosos, predador imponente e poderoso."
  },

{
    "id": "seed_op_sh_gorila",
    "elemento": "Realidade",
    "name": "Gorila",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 2,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 19,
    "deslocamento": "9m, escalada 9m",
    "pv": 70,
    "pvMax": 70,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Atletismo",
        "formula": "3d20+5"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Pancada",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2",
        "teste": "2d20+10",
        "danos": [
          "1d6+3 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Morder",
        "descricao": "Se acerta os dois ataques de pancada no mesmo ser na mesma rodada, ataca também com a mordida (teste 2d20+10, dano 1d6+4 corte)."
      }
    ],
    "descricao": "Territorialista e imponente, fará de tudo para proteger seu habitat."
  },

{
    "id": "seed_op_jacare",
    "elemento": "Realidade",
    "name": "Jacaré",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 1,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 16,
    "deslocamento": "9m, escalar/nadar 6m",
    "pv": 40,
    "pvMax": 40,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+5",
        "danos": [
          "1d8+8 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar a mordida em um ser Médio ou menor, pode tentar agarrar (teste 3d20+7)."
      },
      {
        "nome": "Giro da Morte",
        "descricao": "Se estiver agarrando um ser dentro d'água e repetir a manobra agarrar para causar dano, causa +2d8 de dano."
      }
    ],
    "descricao": "Diversas espécies de jacarés podem ser encontradas até em áreas urbanas; esta ficha representa um espécime grande e perigoso."
  },

{
    "id": "seed_op_onca_pintada",
    "elemento": "Realidade",
    "name": "Onça-Pintada",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 16,
    "deslocamento": "12m, escalar/nadar 6m",
    "pv": 55,
    "pvMax": 55,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+10"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20+5"
      },
      {
        "nome": "Furtividade",
        "formula": "3d20+13"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+10",
        "danos": [
          "1d8+5 corte"
        ]
      },
      {
        "nome": "Garras",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "x2 (crítico 19)",
        "teste": "3d20+10",
        "danos": [
          "1d6+5 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar a mordida em um ser Médio ou menor, pode tentar agarrar (teste 3d20+7)."
      },
      {
        "nome": "[Completa] Bote",
        "descricao": "Investida com mordida e as duas garras; os três ataques recebem +1d20 mas devem mirar o mesmo alvo."
      }
    ],
    "descricao": "O maior felino das Américas, principal predador das selvas brasileiras — um oponente mortal em seu campo de caça."
  },

{
    "id": "seed_op_sucuri",
    "elemento": "Realidade",
    "name": "Sucuri",
    "photo": null,
    "vd": 40,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 1,
      "forca": 2,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 14,
    "deslocamento": "6m, escalar/nadar 9m",
    "pv": 68,
    "pvMax": 68,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Furtividade",
        "formula": "2d20+8"
      }
    ],
    "sentidos": "Visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "1d6+8 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Agarrão",
        "descricao": "Se acertar a mordida em um ser Médio ou menor, pode tentar agarrar (teste 3d20+12)."
      },
      {
        "nome": "[Livre] Constrição",
        "descricao": "No início de cada turno, causa 2d6+8 de dano de impacto a qualquer ser que esteja agarrando."
      }
    ],
    "descricao": "Uma grande cobra constritora das selvas amazônicas, encontrada também sob posse de colecionadores exóticos ou como mascote de cultistas excêntricos."
  },

{
    "id": "seed_op_sh_ariranha",
    "elemento": "Realidade",
    "name": "Ariranha",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 1,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 16,
    "deslocamento": "12m, natação 9m",
    "pv": 32,
    "pvMax": 32,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "2d4+2 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Evasão",
        "descricao": "Quando sofre um ataque com teste de Reflexos para reduzir o dano à metade, não sofre dano algum se passar."
      },
      {
        "nome": "Táticas Familiares",
        "descricao": "+2 em testes de ataque e rolagens de dano para cada outra ariranha atacando o mesmo alvo na mesma rodada."
      }
    ],
    "descricao": "Predador brincalhão e corajoso do Pantanal e Amazônia, vive em bandos familiares capazes de derrotar oponentes muito maiores."
  },

{
    "id": "seed_op_sh_enxame_de_tocandiras",
    "elemento": "Realidade",
    "name": "Enxame de Tocandiras",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 0,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 0
    },
    "defesa": 16,
    "deslocamento": "6m, escalada 6m",
    "pv": 22,
    "pvMax": 22,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "-2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [],
    "poderes": [
      {
        "nome": "Enxame",
        "descricao": "Pode ocupar o espaço de um ser; no fim do turno causa 4d4 de dano de perfuração automático a quem estiver em seu espaço. Imune a manobras e efeitos de alvo único sem dano; sofre metade de dano de armas, +50% de efeitos de área."
      },
      {
        "nome": "Dor Debilitante",
        "descricao": "Quem sofre dano do enxame sofre −1d20 em todos os testes por dor profunda (Fortitude DT 20 evita); só é removido dormindo ou com antídoto."
      },
      {
        "nome": "Por Dentro das Roupas",
        "descricao": "Quem sai do espaço do enxame carrega formigas nas vestes, continuando a sofrer metade do dano (2d4) até gastar uma ação de movimento para se livrar delas."
      }
    ],
    "descricao": "Também chamada formiga-bala, conhecida por sua mordida de dor intensa e debilitante, típica da Amazônia."
  },

{
    "id": "seed_op_javaporco",
    "elemento": "Realidade",
    "name": "Javaporco",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 3
    },
    "defesa": 16,
    "deslocamento": "12m",
    "pv": 35,
    "pvMax": 35,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "3d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "1d8+4 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Ferocidade",
        "descricao": "Se sofrer dano, recebe +1d20 em testes de ataque e um dado de dano adicional em todas as rolagens de dano até o fim da cena."
      },
      {
        "nome": "[Reação] Mordida Final",
        "descricao": "Ao ser reduzido a 0 PV, faz um ataque de mordida contra um oponente aleatório em seu alcance antes de morrer."
      }
    ],
    "descricao": "Resultado do cruzamento de javalis com porcos domésticos, tornou-se uma praga em regiões rurais — voraz e agressivo."
  },

{
    "id": "seed_op_sh_lobo",
    "elemento": "Realidade",
    "name": "Lobo",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 3,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 15,
    "deslocamento": "12m",
    "pv": 18,
    "pvMax": 18,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "3d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "3d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Sobrevivência",
        "formula": "1d20+10"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+5",
        "danos": [
          "1d6+4 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Táticas de Alcateia",
        "descricao": "Ao flanquear, recebe +1d20 no ataque (total +2d20 com o bônus normal de flanquear) e +1d6 de dano com a mordida."
      },
      {
        "nome": "[Livre] Derrubar",
        "descricao": "Se acerta a mordida, pode fazer a manobra derrubar (teste 3d20+5)."
      }
    ],
    "descricao": "Hábil caçador em grupo — ao ouvir seu uivo, saiba que ele nunca está sozinho."
  },

{
    "id": "seed_op_sh_touro",
    "elemento": "Realidade",
    "name": "Touro",
    "photo": null,
    "vd": 20,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 1,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 15,
    "deslocamento": "12m",
    "pv": 38,
    "pvMax": 38,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Chifres",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+5",
        "danos": [
          "2d6+6 perfuração"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Completa] Atropelamento",
        "descricao": "Percorre até o dobro do deslocamento em linha reta, atravessando o espaço de seres menores; quem está na linha sofre 2d6+6 de dano de impacto e fica caído (Reflexos DT 15 reduz à metade e evita). Recarga (movimento)."
      }
    ],
    "descricao": "Uma montanha de músculos famosa pelo temperamento imprevisível."
  },

{
    "id": "seed_op_sh_cavalo",
    "elemento": "Realidade",
    "name": "Cavalo",
    "photo": null,
    "vd": 10,
    "tipo": "Criatura",
    "porte": "Grande",
    "attrs": {
      "agilidade": 1,
      "forca": 3,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 13,
    "deslocamento": "15m",
    "pv": 12,
    "pvMax": 12,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Cascos",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "3d20+5",
        "danos": [
          "2d4+3 impacto"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "Montaria",
        "descricao": "Um personagem treinado em Adestramento pode usá-lo como montaria: conta como aliado, aumenta o deslocamento para 15m e dá uma ação extra por rodada (só para se deslocar)."
      }
    ],
    "descricao": "Usado por forças policiais, esportes, recreação ou como meio de transporte no campo — geralmente pacato, mas capaz de chutes poderosos."
  },

{
    "id": "seed_op_cao_de_guarda",
    "elemento": "Realidade",
    "name": "Cão de Guarda",
    "photo": null,
    "vd": 10,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 2,
      "forca": 2,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 2
    },
    "defesa": 14,
    "deslocamento": "9m",
    "pv": 12,
    "pvMax": 12,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+10"
      },
      {
        "nome": "Iniciativa",
        "formula": "2d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "2d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "2d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      },
      {
        "nome": "Sobrevivência",
        "formula": "1d20+10"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [
      {
        "nome": "Mordida",
        "execucao": "Padrão",
        "forma": "Corpo a corpo",
        "vezes": "",
        "teste": "2d20+5",
        "danos": [
          "1d6+2 corte"
        ]
      }
    ],
    "poderes": [
      {
        "nome": "[Livre] Derrubar",
        "descricao": "Ao acertar a mordida, pode fazer a manobra derrubar (bônus 2d20+5)."
      }
    ],
    "descricao": "Cães treinados para guarda. Estas estatísticas também servem para cães policiais ou lobos."
  },

{
    "id": "seed_op_enxame_de_abelhas",
    "elemento": "Realidade",
    "name": "Enxame de Abelhas",
    "photo": null,
    "vd": 10,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 0,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 0
    },
    "defesa": 15,
    "deslocamento": "3m, voo 9m",
    "pv": 10,
    "pvMax": 10,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "-2d20"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [],
    "poderes": [
      {
        "nome": "Enxame",
        "descricao": "Aglomeração que pode ocupar o espaço de um ser; no fim do turno causa 2d6 de dano de perfuração automático a quem estiver em seu espaço. Imune a manobras e efeitos de alvo único sem dano; sofre metade de dano de armas, mas +50% de efeitos de área."
      },
      {
        "nome": "Zumbido Nauseante",
        "descricao": "Um ser que sofra dano do enxame fica enjoado por 1 rodada (Fortitude DT 15 evita)."
      }
    ],
    "descricao": "Normalmente pacíficas, abelhas podem se tornar agressivas se a colmeia for ameaçada."
  },

{
    "id": "seed_op_enxame_de_ratos",
    "elemento": "Realidade",
    "name": "Enxame de Ratos",
    "photo": null,
    "vd": 10,
    "tipo": "Criatura",
    "porte": "Médio",
    "attrs": {
      "agilidade": 1,
      "forca": 0,
      "intelecto": 0,
      "presenca": 1,
      "vigor": 0
    },
    "defesa": 13,
    "deslocamento": "6m",
    "pv": 15,
    "pvMax": 15,
    "pd": 0,
    "pdMax": 0,
    "pericias": [
      {
        "nome": "Percepção",
        "formula": "1d20+5"
      },
      {
        "nome": "Iniciativa",
        "formula": "1d20+5"
      },
      {
        "nome": "Fortitude",
        "formula": "1d20+5"
      },
      {
        "nome": "Reflexos",
        "formula": "1d20+5"
      },
      {
        "nome": "Vontade",
        "formula": "1d20"
      }
    ],
    "sentidos": "Faro, visão na penumbra",
    "resistencias": "",
    "tracos": [],
    "acoes": [],
    "poderes": [
      {
        "nome": "Enxame",
        "descricao": "Aglomeração que pode ocupar o espaço de um ser; no fim do turno causa 2d6 de dano de perfuração automático a quem estiver em seu espaço. Imune a manobras e efeitos de alvo único sem dano; sofre metade de dano de armas, mas +50% de efeitos de área."
      },
      {
        "nome": "Doença",
        "descricao": "Um ser que sofra dano do enxame contrai febre hemorrágica (Fortitude DT 15 evita)."
      }
    ],
    "descricao": "Ratos podem se unir em perigosos enxames quando movidos por fome intensa ou energias paranormais."
  },

];
