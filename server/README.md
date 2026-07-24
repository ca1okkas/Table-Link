# TableLink — Servidor (Contas + Salas ao Vivo + Nuvem)

Backend do TableLink: registro/login/sessão, **salas ao vivo hospedadas
pelo próprio servidor** (o Mestre não precisa mais manter a aba aberta
pra sessão continuar) e **persistência em nuvem** de fichas e mesas.
Node.js + Express + SQLite (arquivo local, sem precisar instalar um
banco separado) + WebSocket (`ws`). Senhas ficam salvas com hash
(bcrypt) — nunca em texto puro.

## Por que a sala agora depende deste servidor

Antes, a sala era ponto-a-ponto (WebRTC): o navegador do Mestre virava o
"host", e se ele fechasse a aba a sessão acabava pra todo mundo. Agora
quem hospeda é este servidor — o estado do tabuleiro (tokens, mapas,
névoa, chat, iniciativa, elenco) fica guardado aqui, com persistência em
disco. Na prática:

- Enquanto o Mestre está conectado, tudo funciona exatamente como antes
  (ele decide o que acontece, o servidor só retransmite).
- Se o Mestre fechar a aba ou cair, a sessão **continua de pé**: chat,
  rolagem de dados, movimento de token, edição de ficha e o elenco da
  mesa continuam funcionando entre os jogadores. Só ferramentas que
  realmente exigem o Mestre por perto (subir um mapa novo, pintar
  névoa, expulsar alguém) ficam esperando ele voltar.
- Ao reabrir a aba (mesmo em outro computador), o Mestre recebe de volta
  o estado exatamente de onde a mesa parou.

Isso também significa que **criar uma mesa agora exige estar logado**
numa conta — é o que garante que só o dono consegue reabrir aquela
mesa depois. Jogadores continuam entrando só com o código, sem precisar
de conta.

## 1. Rodar localmente

```bash
cd server
npm install
cp .env.example .env
```

Abra o `.env` e troque `JWT_SECRET` por um valor aleatório. Pode gerar um com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Depois:

```bash
npm start
```

O servidor sobe em `http://localhost:4000` (ou a porta que você definir em
`PORT`). O banco (`data/tablelink.db`) é criado sozinho na primeira vez.

## 2. Ligar o frontend a este servidor

No projeto do TableLink (a pasta com o `index.html`), abra
`js/config.js` e defina:

```js
export const API_BASE_URL = 'http://localhost:4000'; // ou a URL de produção
```

Enquanto estiver testando local, sirva o `index.html` também por um
servidor HTTP (não abrindo o arquivo direto do disco) — por exemplo:

```bash
npx serve .
```

## 3. Publicar de verdade (pra funcionar em qualquer dispositivo)

Este servidor é um app Node comum — qualquer serviço que rode Node dá
conta. Alguns com camada gratuita: **Render**, **Railway**, **Fly.io**,
**Coolify** (self-host). Passos gerais, valem pra qualquer um deles:

1. Suba a pasta `server/` num repositório Git (o `.gitignore` já exclui
   `node_modules/`, `data/` e `.env`).
2. No painel do serviço escolhido, aponte "Start Command" para
   `npm start` e "Build Command" para `npm install`.
3. Configure as variáveis de ambiente do `.env.example` direto no painel
   do serviço (principalmente `JWT_SECRET` e `CORS_ORIGIN` — coloque aí a
   URL onde o TableLink vai ficar hospedado).
4. **Importante — SQLite e disco persistente:** o banco é um arquivo
   (`data/tablelink.db`) — contas, fichas/mesas na nuvem e as salas ao
   vivo (inclusive o estado do tabuleiro) ficam todos nele. Alguns
   serviços apagam o disco a cada deploy — nesses casos, ative um
   "volume"/"disco persistente" apontando pra pasta `server/data`, senão
   tudo isso some no próximo deploy.
5. Depois de publicado, copie a URL pública gerada (ex:
   `https://tablelink-auth.onrender.com`) e coloque em `API_BASE_URL` no
   `js/config.js` do frontend — a URL do WebSocket das salas
   (`ROOMS_WS_URL`) é calculada sozinha a partir dela (troca `http` por
   `ws`/`https` por `wss`).
6. **Hospedagem precisa suportar WebSocket persistente.** Funciona bem
   em Render, Railway, Fly.io e Coolify (self-host). Evite plataformas
   "serverless"/sem servidor de longa duração (ex: funções que hibernam
   entre requisições) — a sala ao vivo depende de uma conexão aberta.

## Rotas da API

| Método | Rota                          | Autenticado? | Corpo                                      |
|--------|-------------------------------|:---:|---------------------------------------------|
| POST   | `/api/auth/register`          | não | `{ username, email, password, displayName? }` |
| POST   | `/api/auth/login`             | não | `{ identifier, password }` (usuário ou e-mail) |
| GET    | `/api/auth/me`                | sim | —                                            |
| PATCH  | `/api/auth/me`                | sim | `{ displayName?, avatar?, color? }`          |
| POST   | `/api/auth/change-password`   | sim | `{ currentPassword, newPassword }`           |
| POST   | `/api/auth/logout`            | sim | — (revoga só esta sessão)                    |
| POST   | `/api/auth/logout-all`        | sim | — (revoga todas as sessões deste usuário)    |
| GET    | `/api/sync/sheets`             | sim | — (fichas salvas na conta)                   |
| PUT    | `/api/sync/sheets`             | sim | `{ sheets }`                                 |
| GET    | `/api/sync/tables`             | sim | — (lista de mesas salva na conta)            |
| PUT    | `/api/sync/tables`             | sim | `{ tables }`                                 |
| GET    | `/api/health`                 | não | — (checagem simples)                         |
| WS     | `/ws/rooms`                   | —   | sala ao vivo (tabuleiro/tokens/chat/etc — ver `src/rooms.js`) |

Autenticado = precisa do header `Authorization: Bearer <token>` (o token
que `/register` ou `/login` devolvem). A sala ao vivo (`/ws/rooms`) tem
seu próprio mecanismo: o Mestre manda o token JWT dentro da mensagem
`gm-connect`; jogadores entram só com o código da mesa, sem login.

## Segurança — o que já está coberto

- Senha nunca é salva em texto puro (hash bcrypt, custo 12).
- Login/registro têm limite de tentativas (20 a cada 15 min por IP) contra
  força-bruta.
- Token (JWT) fica ligado a uma sessão revogável no banco — "sair" de
  verdade invalida o token no servidor, não só apaga ele do navegador.
- Trocar a senha derruba todas as sessões automaticamente.

## O que fica de fora (avalie antes de um uso sério/produção)

- **Confirmação de e-mail** e **recuperação de senha por e-mail** não
  estão implementadas (exigiriam configurar um serviço de envio de
  e-mail). Hoje, se alguém esquecer a senha, não tem como recuperar
  sozinho — só recriando a conta.
- **HTTPS**: o servidor em si não faz TLS — isso é responsabilidade do
  serviço de hospedagem (Render/Railway etc. já entregam HTTPS pronto).
  Rodando isso sem HTTPS na frente, a senha trafega em texto plano na
  rede até chegar aqui.
