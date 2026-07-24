// ══════════════════════════════════════════════════════════════
// config.js — configuração de ambiente do frontend.
//
// Troque API_BASE_URL pra URL do servidor de contas (pasta server/
// deste projeto) depois de rodá-lo/publicá-lo. Veja server/README.md
// pra instruções de como subir esse servidor.
//
//   Testando local:  'http://localhost:4000'
//   Em produção:      a URL pública do servidor que você publicou
//                      (ex: 'https://tablelink-auth.onrender.com')
// ══════════════════════════════════════════════════════════════

export const API_BASE_URL = 'http://localhost:4000';

// URL do WebSocket das salas ao vivo — mesmo servidor de `server/`,
// derivado automaticamente de API_BASE_URL (http→ws, https→wss).
export const ROOMS_WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws/rooms';
