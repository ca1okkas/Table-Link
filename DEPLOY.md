# TableLink — Guia de Deploy Online

TableLink é um site 100% estático (HTML/CSS/JS puro, sem back-end). Isso
significa que "subir online" é só uma questão de hospedar os arquivos em
qualquer servidor de arquivos estáticos com HTTPS.

## 1. Onde hospedar (grátis)

Qualquer uma dessas funciona bem — todas dão HTTPS automático, que é
**obrigatório** (o WebRTC da sala Mestre/Jogadores não funciona em HTTP):

- **Cloudflare Pages** — arrasta a pasta, pronto.
- **Netlify** — idem (drag-and-drop em app.netlify.com/drop).
- **Vercel**
- **GitHub Pages** — se o projeto estiver num repositório Git.

Não precisa de Node, banco de dados nem variáveis de ambiente. É só subir
a pasta `tablelink_v13` inteira (mantendo a estrutura de `js/`, `css/`,
`assets/`).

## 2. Como a sala funciona (importante entender antes de divulgar)

TableLink **não tem servidor próprio**. A sala Mestre/Jogadores usa
WebRTC (via PeerJS) para conectar os navegadores **direto entre si**:

- O Mestre cria a sala → a aba dele vira o "host". **Se o Mestre fechar a
  aba ou cair a internet, a sala cai pra todo mundo.**
- Os dados (mapa, tokens, névoa, fichas, chat) ficam salvos só no
  `localStorage` de cada navegador — não existe um banco central. Se o
  Mestre limpar os dados do navegador ou trocar de computador, perde tudo
  **a menos que tenha exportado um backup** (Configurações → Exportar
  Backup, adicionado agora).
- O "broker" que ajuda Mestre e Jogadores a se encontrarem é o serviço
  público e gratuito do PeerJS Cloud. Funciona bem pra mesas pequenas
  (grupo de amigos), mas é um serviço de terceiros fora do seu controle —
  se ele cair, criar/entrar em salas para de funcionar até voltar.
- Pra melhorar a taxa de conexão em redes mais fechadas (wifi de
  faculdade, rede corporativa, alguns 4G de operadora), já adicionei um
  servidor TURN público gratuito (Open Relay) como fallback do STUN do
  Google. Ainda assim, **não há garantia de 100% de conexão** — é uma
  limitação inerente de qualquer app P2P sem servidor de relay pago.

Se no futuro isso crescer e virar algo mais sério (mais gente, mesas
persistentes, sem depender da aba do Mestre ficar aberta), o próximo passo
seria migrar pra um back-end de verdade (ex: um servidor WebSocket com
banco de dados) — é uma reescrita bem maior, não é uma opção de
configuração.

## 3. Antes de divulgar o link, confira

- [ ] Testou criar sala + entrar como jogador em **duas redes diferentes**
      (ex: seu wifi de casa + 4G do celular), não só duas abas no mesmo PC
      — isso pega problema de STUN/TURN que não aparece testando local.
- [ ] Testou em celular (a interface é responsiva, mas vale conferir).
- [ ] Exportou um backup de teste em Configurações pra confirmar que o
      arquivo baixa certinho.

## 4. O que eu já ajustei nesta rodada

- Fallback de TURN (Open Relay) no WebRTC, além do STUN do Google.
- Backup completo (exportar/importar `.json` com mapa, tokens, névoa,
  fichas, iniciativa e configurações) em Configurações.
- Todas as gravações no `localStorage` agora são "seguras": se o
  navegador estourar a cota de armazenamento (comum com muitas imagens
  em base64), o app avisa em vez de quebrar silenciosamente.

## 5. Limitações que continuam existindo (por decisão de arquitetura, não bug)

- Sem conta de usuário / autenticação — qualquer um com o código da sala
  entra.
- Sem persistência em nuvem — é tudo local ao navegador de cada pessoa.
- Mestre precisa manter a aba aberta durante a sessão.

Nada disso impede colocar no ar pra jogar com seu grupo — são só os
trade-offs de um app P2P sem back-end, que é a arquitetura que faz sentido
pra um projeto desse tamanho.
