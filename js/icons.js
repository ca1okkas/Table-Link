// ══════════════════════════════════════════════════════════════
// icons.js — Ícones próprios do TableLink (substituem os emojis)
//
// Ícones de linha simples (grid 24×24), desenhados para casar com a
// paleta arcana do site (roxo/violeta/magenta/laranja/dourado).
// Cada entrada é um array de "d" de <path>, reaproveitado tanto para
// gerar <svg> em HTML quanto para desenhar em <canvas> via Path2D.
// ══════════════════════════════════════════════════════════════

export const ICON_PATHS = {
  // ── Interface geral ─────────────────────────────
  close:       ['M6 6L18 18M18 6L6 18'],
  edit:        ['M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z', 'M13 7l4 4'],
  avatar:      ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 20c0-4 4-6 8-6s8 2 8 6'],
  clipboard:   ['M9 5h6a1 1 0 0 1 1 1v1H8V6a1 1 0 0 1 1-1Z', 'M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z', 'M9 12h6', 'M9 16h4'],
  dice:        ['M5 5h14v14H5z', 'M9 9h.01', 'M15 9h.01', 'M9 15h.01', 'M15 15h.01', 'M12 12h.01'],
  shield:      ['M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z'],
  key:         ['M9 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12.5 12.5 20 20', 'M16 16l2-2', 'M18.5 18.5 21 16'],
  chat:        ['M4 5h16v11H8l-4 4V5Z'],
  swords:      ['M4 20 14 10', 'M14 10l3-3 3 1-1 3-3 3', 'M20 20 10 10', 'M10 10 7 7l-3 1 1 3 3 3'],
  scroll:      ['M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3V4Z', 'M18 20a3 3 0 0 0 0-6h-3'],
  book:        ['M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 1-2-2V5Z', 'M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6'],
  map:         ['M4 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z', 'M10 4v14', 'M16 6v14'],
  arrowRight:  ['M5 12h14', 'M13 6l6 6-6 6'],
  tag:         ['M4 4h8l8 8-8 8-8-8V4Z', 'M8 8h.01'],
  heart:       ['M12 20s-7-4.4-9.5-9C.7 7.5 3 4 6.2 4 8.4 4 10 5.4 12 7.7 14 5.4 15.6 4 17.8 4 21 4 23.3 7.5 21.5 11 19 15.6 12 20 12 20Z'],
  rotateIcon:  ['M4 12a8 8 0 1 1 2.5 5.8', 'M4 18v-5h5'],
  flipH:       ['M12 4v16', 'M6 8l-3 4 3 4', 'M18 8l3 4-3 4'],
  flipV:       ['M4 12h16', 'M8 6l4-3 4 3', 'M8 18l4 3 4-3'],
  resize:      ['M4 4h6v2H6v4H4V4Z', 'M20 20h-6v-2h4v-4h2v6Z', 'M4 20 20 4'],
  bandage:     ['M5 12 12 5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7Z', 'M9 9l6 6'],
  image:       ['M4 5h16v14H4z', 'M4 16l5-5 4 4 3-3 4 4', 'M9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
  lock:        ['M6 11h12v9H6z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  unlock:      ['M6 11h12v9H6z', 'M8 11V7a4 4 0 0 1 7.5-2'],
  trash:       ['M5 7h14', 'M9 7V5h6v2', 'M7 7l1 13h8l1-13'],
  download:    ['M12 3v12', 'M7 10l5 5 5-5', 'M5 19h14'],
  upload:      ['M12 19V7', 'M7 12l5-5 5 5', 'M5 19h14'],
  search:      ['M11 11a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z', 'M20 20l-4.5-4.5'],
  check:       ['M4 12l5 5 11-11'],
  emptybox:    ['M5 5h14v14H5z'],
  question:    ['M9 9a3 3 0 1 1 4 2.8c-1 .4-1 1.2-1 2.2', 'M12 17h.01'],
  person:      ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 20c0-4 4-6 8-6s8 2 8 6'],
  warning:     ['M12 3 2 20h20L12 3Z', 'M12 10v4', 'M12 17h.01'],
  plug:        ['M9 3v6', 'M15 3v6', 'M6 9h12v3a6 6 0 0 1-12 0V9Z', 'M12 18v3'],
  dot:         ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
  box:         ['M4 8l8-4 8 4v9l-8 4-8-4V8Z', 'M4 8l8 4 8-4', 'M12 12v9'],
  minus:       ['M5 12h14'],
  plus:        ['M12 5v14', 'M5 12h14'],
  target:      ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'],
  chevronUp:   ['M5 15l7-7 7 7'],
  chevronRight:['M9 5l7 7-7 7'],
  moon:        ['M20 14a8 8 0 1 1-9-9 6.5 6.5 0 0 0 9 9Z'],
  sun:         ['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z', 'M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'],
  eye:         ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  eyeOff:      ['M10.6 5.2A10.6 10.6 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.4 4.1M6.5 6.6C4 8.3 2 12 2 12s4 7 10 7c1.4 0 2.7-.3 3.9-.8', 'M9.9 9.9a3 3 0 0 0 4.2 4.2', 'M3 3l18 18'],
  presentation:['M3 4h18v12H3z', 'M8 20h8', 'M12 16v4'],
  dove:        ['M3 12c3-6 9-6 12-2 2-3 6-2 6 1-3 0-4 2-4 4-4 2-9 1-11-1Z'],
  repeatIcon:  ['M4 4v5h5', 'M20 20v-5h-5', 'M5 15a8 8 0 0 0 14 3l1 2', 'M19 9A8 8 0 0 0 5 6l-1-2'],
  coin:        ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M9 9.3c0-1 1.3-1.8 3-1.8s3 .8 3 1.8-1.3 1.2-3 1.7-3 .7-3 1.7 1.3 1.8 3 1.8 3-.8 3-1.8'],
  star:        ['M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6L12 2Z'],
  bolt:        ['M13 2 4 14h6l-1 8 9-12h-6l1-8Z'],
  percent:     ['M6 18 18 6', 'M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'M16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
  square:      ['M5 5h14v14H5z'],
  kite:        ['M12 3 19 10 12 21 5 10 12 3Z'],
  hexagon:     ['M8 3h8l4 7-4 7H8l-4-7 4-7Z'],
  pentagon:    ['M12 3l8 6-3 10H7L4 9 12 3Z'],
  triangle:    ['M12 4 21 20H3L12 4Z'],
  triangleDown:['M12 20 3 4h18L12 20Z'],
  diamond:     ['M12 3 21 12 12 21 3 12 12 3Z'],
  brain:       ['M9 3a4 4 0 0 0-4 4c-2 0-3 2-2 4-1 1-1 3 1 4a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3c2-1 2-3 1-4 1-2 0-4-2-4a4 4 0 0 0-4-4H9Z'],
  globe:       ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18', 'M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9Z'],
  backpack:    ['M8 8V6a4 4 0 0 1 8 0v2', 'M5 8h14v12H5z', 'M9 12h6'],
  notepad:     ['M6 3h9l3 3v15H6z', 'M9 9h6', 'M9 13h6', 'M9 17h4'],
  camera:      ['M4 8h4l2-2h4l2 2h4v11H4z', 'M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  running:     ['M14 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z', 'M11 21l1.5-5-2-2 1-4 3 1 2 3 3 1', 'M9.5 10l-2.5 1.5.5 3.5'],
  orb:         ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z', 'M6 20c1-2 3-3 6-3s5 1 6 3'],
  sparkle:     ['M11 3l1.3 4.7L17 9l-4.7 1.3L11 15l-1.3-4.7L5 9l4.7-1.3L11 3Z', 'M18 14l.6 2.4L21 17l-2.4.6L18 20l-.6-2.4L15 17l2.4-.6L18 14Z'],
  link:        ['M9 15l6-6', 'M8 12l-2 2a3 3 0 0 0 4 4l2-2', 'M16 12l2-2a3 3 0 0 0-4-4l-2 2'],
  burst:       ['M12 2l1.8 5.6L19 6l-3 4.8L21 13l-5.8 1L14 20l-2-4.6L10 20l-1.2-6L3 13l4.8-2.2L4.8 6l4.2 1.6Z'],
  sword:       ['M6 18 17 7', 'M17 7l1.5-1.5 2 2L19 9', 'M6 18l-2 3 3-2Z'],
  store:       ['M4 9l1-5h14l1 5', 'M4 9h16v11H4z', 'M9 20v-6h6v6'],
  flask:       ['M9 3h6', 'M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3Z'],
  keyboard:    ['M3 6h18v12H3z', 'M6.5 10h.01M9.5 10h.01M12.5 10h.01M15.5 10h.01M17.5 10h.01', 'M7 14h10'],
  graduate:    ['M12 3 2 8l10 5 10-5-10-5Z', 'M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5'],
  stopwatch:   ['M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M12 9v4l3 2', 'M10 2h4'],
  info:        ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 8h.01', 'M11.2 12h.9v5h.9'],
  trail:       ['M7 21c0-6 5-4 5-9s-5-3-5-9', 'M17 21c0-6-5-4-5-9s5-3 5-9'],

  // ── Condições (Ordem Paranormal) ─────────────────
  fear:        ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 10h.01', 'M15 10h.01', 'M8 16c1-1.5 3-2 4-2s3 .5 4 2'],
  grabbed:     ['M4 14a4 4 0 0 1 4-4h2l6-6 2 2-6 6v2a4 4 0 0 1-4 4H6l-2 2v-6Z'],
  broken:      ['M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z', 'M10 9l2 3-2 2 2 3'],
  terrified:   ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 10h.01', 'M15 10h.01', 'M9 17c1-2 2-3 3-3s2 1 3 3'],
  lungs:       ['M12 3v9', 'M12 12c-2-3-6-3-7 0-1 3 0 8 3 8 2 0 3-2 4-4', 'M12 12c2-3 6-3 7 0 1 3 0 8-3 8-2 0-3-2-4-4'],
  dizzy:       ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M8 9l2 2-2 2', 'M16 9l-2 2 2 2', 'M9 16h6'],
  fallen:      ['M3 18h9', 'M12 18l6-3-1-2-6 2-4-3-2 1 3 3 4 2Z'],
  confused:    ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9.2 9.8a2.8 2.8 0 1 1 3.6 2.6c-.9.4-.9 1.1-.9 1.9', 'M9 16h.01', 'M15 9h.01'],
  bone:        ['M6 9a2 2 0 1 0-2 2 2 2 0 1 0 2 2l10 10a2 2 0 1 0 2-2 2 2 0 1 0-2-2L6 9Z'],
  sick:        ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 10h.01', 'M15 10h.01', 'M8 16c1 1 2 1.5 4 1.5s3-.5 4-1.5'],
  fire:        ['M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c1 1 1 3 0 4-1 2-3 3-5 3a6 6 0 0 1-6-6c0-5 5-6 8-10Z'],
  nauseated:   ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M8 10c.5-1 1.5-1 2 0', 'M14 10c.5-1 1.5-1 2 0', 'M8 16c1.3-1.3 2.7-1.3 4 0 1.3-1.3 2.7-1.3 4 0'],
  brainCrack:  ['M9 3a4 4 0 0 0-4 4c-2 0-3 2-2 4-1 1-1 3 1 4a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3c2-1 2-3 1-4 1-2 0-4-2-4a4 4 0 0 0-4-4H9Z', 'M10 8l2 3-2 2 2 3'],
  web:         ['M12 2v20', 'M2 12h20', 'M4.5 4.5l15 15', 'M19.5 4.5l-15 15', 'M12 2c3 3 3 15 0 20', 'M2 12c3-3 15-3 20 0'],
  skull:       ['M12 3a7 7 0 0 0-7 7c0 3 2 4 2 6h10c0-2 2-3 2-6a7 7 0 0 0-7-7Z', 'M9 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z', 'M15 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z', 'M10 16v2M14 16v2'],
  discouraged: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 10h.01', 'M15 10h.01', 'M9 16c1-1 2-1.5 3-1.5s2 .5 3 1.5'],
  battery:     ['M3 8h14v8H3z', 'M19 10v4', 'M6 11h4v2H6z'],
  fascinated:  ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 10a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z', 'M13 10a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z', 'M9 16c1 1 2 1.5 3 1.5s2-.5 3-1.5'],
  sleepy:      ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M8 10h3', 'M13 10h3', 'M9 16c1-1.5 2-2 3-2s2 .5 3 2', 'M17 4h2M20 6h2'],
  frailArm:    ['M6 20c2-4 2-8 0-14', 'M6 6c2 0 4 1 4 4', 'M4 4l4 4'],
  frustrated:  ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M8 9l3 1', 'M16 9l-3 1', 'M8 16c1.5-1 2.5-1.5 4-1.5s2.5.5 4 1.5'],
  pin:         ['M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z', 'M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
  unconscious: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M8 9l2 2M10 9l-2 2', 'M16 9l-2 2M14 9l2 2', 'M9 16h6'],
  defenseless: ['M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z', 'M9 9l6 6M15 9l-6 6'],
  snail:       ['M8 16a5 5 0 1 1 5-5', 'M13 11a3 3 0 1 1 3 3H4', 'M4 14h1'],
  hourglass:   ['M6 3h12', 'M6 21h12', 'M6 3c0 5 5 6 6 8-1 2-6 3-6 8', 'M18 3c0 5-5 6-6 8 1 2 6 3 6 8'],
  glare:       ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 4v3M12 17v3M4 12h3M17 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2'],
  stunned:     ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 10h.01', 'M15 10h.01', 'M9 16h6'],
  disturbed:   ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M7.7 9.8a1.7 1.7 0 1 1 2.2 2c-.8.4-.8 1-.8 1.7', 'M14.2 9.8a1.7 1.7 0 1 1 2.2 2c-.8.4-.8 1-.8 1.7', 'M9 16h6'],
  stone:       ['M4 15c0-5 4-9 8-9s8 4 8 9-4 4-8 4-8 1-8-4Z'],
  droplet:     ['M12 2c4 6 7 10 7 13a7 7 0 1 1-14 0c0-3 3-7 7-13Z'],
  deaf:        ['M8 15a5 5 0 0 1 0-6M11 17a8 8 0 0 1 0-10', 'M14 5c3 2 5 5 5 8a9 9 0 0 1-1 4', 'M3 3l18 18'],
  surprised:   ['M12 3v10', 'M12 17h.01'],
  crosshair:   ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 3v4M12 17v4M3 12h4M17 12h4'],
};

// Mapa das condições (Ordem Paranormal) para o nome do ícone acima.
export const CONDITION_ICON_KEY = {
  abalado: 'fear', agarrado: 'grabbed', alquebrado: 'broken', apavorado: 'terrified',
  asfixiado: 'lungs', atordoado: 'dizzy', caido: 'fallen', cego: 'eyeOff',
  confuso: 'confused', debilitado: 'bone', desprevenido: 'warning', doente: 'sick',
  em_chamas: 'fire', enjoado: 'nauseated', enlouquecendo: 'brainCrack', enredado: 'web',
  envenenado: 'skull', esmorecido: 'discouraged', exausto: 'battery', fascinado: 'fascinated',
  fatigado: 'sleepy', fraco: 'frailArm', frustrado: 'frustrated', imovel: 'pin',
  inconsciente: 'unconscious', indefeso: 'defenseless', lento: 'snail', machucado: 'bandage',
  morrendo: 'hourglass', ofuscado: 'glare', paralisado: 'bolt', pasmo: 'stunned',
  perturbado: 'disturbed', petrificado: 'stone', sangrando: 'droplet', surdo: 'deaf',
  surpreendido: 'surprised', vulneravel: 'crosshair',
};

export const DICE_ICON_KEY = {
  d4: 'triangle', d6: 'square', d8: 'kite', d10: 'hexagon',
  d12: 'pentagon', d20: 'bolt', d100: 'percent', d2: 'coin', d3: 'triangleDown',
};

// Gera o markup de um ícone inline (para usar em template strings de HTML).
export function icon(name, cls = '', size = 16) {
  const paths = ICON_PATHS[name];
  if (!paths) return '';
  const body = paths.map(d => `<path d="${d}"/>`).join('');
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// Desenha um ícone diretamente num <canvas> 2D (usado nos tokens do mapa).
export function drawIconOnCanvas(ctx, name, x, y, size, color) {
  const paths = ICON_PATHS[name];
  if (!paths) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const d of paths) ctx.stroke(new Path2D(d));
  ctx.restore();
}
