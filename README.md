# CUTTING CREW Barbershop — website

Site de uma página, em React + TypeScript + Vite, para a barbearia **CUTTING CREW Barbershop** (Cucujães, Aveiro).
As marcações continuam a ser feitas no **Fresha**: todos os botões "Marcar agora" abrem o perfil oficial da barbearia. O site não tem sistema de marcações nem pagamentos próprios, e custa 0 € a alojar.

> **Estado:** pronto a publicar no **Netlify** (gratuito). Nada foi publicado ainda. Autorizações (logótipo, fotografias, equipa, publicação) confirmadas pelo programador, presente com o dono e a equipa (27/10/2026). Há duas versões: `npm run build` (demonstração, não indexável) e `npm run build:oficial` (oficial, indexável; é a que o Netlify usa).

## Requisitos
- [Node.js](https://nodejs.org) 20.19 ou superior (recomendado: 22 LTS)

## Instalar e executar
```bash
npm install          # instala as dependências
npm run dev          # servidor de desenvolvimento em http://localhost:5173
```

## Compilar para produção
```bash
npm run build        # versão demo (não indexável) -> pasta dist/
npm run build:oficial  # versão oficial (ver abaixo) -> pasta dist/
npm run preview      # vê a pasta dist/ em http://localhost:4173
```
A compilação verifica os tipos (TypeScript), gera o site e pré-renderiza o HTML, para o conteúdo existir logo no primeiro carregamento (bom para SEO e velocidade).

## Verificações
Depois de `npm install` (ou, para uma instalação limpa e reprodutível, `npm ci`):
```bash
npm run lint         # análise do código
npm run build        # tem de terminar sem erros
npx playwright install chromium   # só na primeira vez
npm run build && npm run test:e2e # testes automáticos (precisam de um build feito)
```
Os testes (`tests/e2e.mjs`) usam Playwright e axe-core. Verificam, entre outros: erros na consola, scroll horizontal em 320/390/768/1440 px, que todos os botões "Marcar agora" abrem exatamente o URL do Fresha, ligações externas, âncoras, imagens (alt, largura, altura, falha de carregamento), menu móvel, teclado, `prefers-reduced-motion`, funcionamento sem JavaScript e acessibilidade (axe). O Playwright vem nas dependências (`npm install`); falta só descarregar o navegador uma vez: `npx playwright install chromium`. Para testar o modo oficial: `npm run build:oficial && npm run test:e2e:oficial`. O script termina com erro se a porta 4179 já estiver ocupada, para nunca testar um servidor antigo.

## Logótipo
O logótipo da barbearia está em `public/images/logo-240.webp` e `logo-480.webp` (branco sobre transparente, feito a partir de `brand/logo-original-fornecido.jpg`, que tem pouca resolução). Para o trocar por uma versão melhor, substitui os dois ficheiros mantendo as proporções (ou muda o `<img>` em `src/components/Header.tsx`) e refaz `public/og-image.jpg` (1200×630).

## Onde alterar o conteúdo
Tudo o que é texto e dados está em `src/data/`, separado do aspeto:

| Ficheiro | O que contém |
|---|---|
| `business.ts` | morada, horário, ligações (Fresha, WhatsApp, Instagram, TikTok), mapa |
| `services.ts` | serviços, durações e preços |
| `team.ts` | nomes e funções da equipa (e fotografia, quando existir) |
| `gallery.ts` | imagens da galeria |
| `hero.ts` | fotografia do topo (montra da barbearia) |
| `seo.ts` | títulos e descrições para motores de busca e partilha |

O que ainda tem de ser confirmado com o dono está em **`CONTEUDOS_POR_CONFIRMAR.md`**.

## Fotografias
- A galeria usa 5 fotografias de trabalhos (`public/images/fotos/foto-1…5`) e a montra da barbearia como fundo da secção de marcação (`janela-*`), retiradas do perfil da barbearia no Instagram, com autorização confirmada pelo programador (27/10/2026).

Para trocar ou acrescentar fotografias:
1. Coloca os `.jpg`/`.png` na pasta `photos/` (não vai para o repositório).
2. `npm run imagens` — cria versões WebP em três tamanhos em `public/images/fotos/` e mostra a linha para colar em `src/data/gallery.ts`.
3. Em `gallery.ts`, usa essa linha e escreve um `alt` que descreva a foto (sem identificar pessoas).

## Equipa
Em `src/data/team.ts`: cada barbeiro tem nome, função, ligação de **marcação direta** (Fresha, com o `employeeId` dele) e ligação ao **perfil no Fresha** (portefólio e avaliações). Só o Cutting Gu tem apresentação, escrita por ele no Fresha. As avaliações **não** são copiadas para o site: o Fresha não tem API pública para isso e copiá-las seria frágil e sem consentimento dos clientes; o site liga ao perfil do Fresha.

## Painel dos barbeiros (opcional, grátis)
Cada barbeiro pode entrar em `/painel`, personalizar o seu perfil (nome, função, biografia, Instagram, retrato), publicar fotografias (como um Instagram pequeno) e descarregar o seu portefólio. O que publica aparece na secção Equipa do site. **Os links de marcação do Fresha continuam no código e nenhum barbeiro os consegue alterar.**

O site é estático; o painel precisa de uma base de dados. Usa o **Supabase** (plano gratuito: contas, base de dados e 1 GB de fotografias). Sem isto o site funciona na mesma, com o conteúdo de `src/data/team.ts`, e o `/painel` mostra um aviso.

**Ligar (uma vez, ~15 minutos):**
1. Em supabase.com, criar conta e um projeto novo (região UE, por exemplo Frankfurt). Guardar a palavra-passe da base de dados.
2. Em **SQL Editor > New query**, colar o conteúdo de `supabase/schema.sql` e carregar em **Run**. Cria as tabelas, as regras de segurança e o balde de fotografias.
3. Em **Authentication > Users > Add user**, criar uma conta por barbeiro (email + palavra-passe, com "Auto Confirm User"). Em **Authentication > Sign In / Providers > Email**, desativar "Allow new users to sign up" para só entrar quem tu criares.
4. Ligar cada conta ao barbeiro certo, no SQL Editor (trocar o email e o nome: `almeida`, `ruben`, `hiago` ou `cutting-gu`):
   `insert into public.profiles (id, member_id) select id, 'hiago' from auth.users where email = 'email@exemplo.com';`
5. Em **Project Settings > API**, copiar o **Project URL** e a chave **anon public**. No Netlify, em **Site configuration > Environment variables**, criar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com esses valores e voltar a publicar. (Para testar no computador, copiar `.env.example` para `.env.local` e preencher.) A chave `anon` pode ficar no site; a segurança está nas regras do passo 2. **Nunca** uses a chave `service_role`.
6. Em **Authentication > URL Configuration**, pôr o endereço do site em "Site URL" e `https://ENDERECO-DO-SITE/painel` em "Redirect URLs" (serve para o "Esqueci-me da palavra-passe").
7. Entrar em `https://ENDERECO-DO-SITE/painel`, experimentar com uma conta e confirmar que o perfil aparece em Equipa.

**Como funciona a segurança:** cada barbeiro só lê e altera o seu perfil, as suas fotografias e a sua pasta de ficheiros (regras RLS em `supabase/schema.sql`). Máximo de 24 fotografias por barbeiro, 2 MB por imagem; as fotografias são reduzidas e perdem a localização antes de sair do telemóvel. Ao enviar, o barbeiro confirma que tem autorização das pessoas que aparecem.

**Gestão do responsável:** para esconder uma fotografia do site, em **Table Editor > photos** pôr `visivel` a falso. Para remover um barbeiro, apagar o utilizador em Authentication (as fotografias dele saem do site).

**Portefólio:** o botão "Descarregar portefólio" gera um ficheiro HTML autónomo (perfil + fotografias) que o barbeiro guarda como quiser, e que se pode guardar em PDF a partir do próprio ficheiro.

**Testes do painel:** `npm run test:painel` testa o painel e a leitura no site com um Supabase **simulado** (21 verificações). As regras de segurança só se testam num projeto real: depois do passo 7, tenta entrar com duas contas e confirma que uma não consegue alterar a outra.

**Privacidade:** o Supabase passa a guardar emails dos barbeiros, textos e fotografias. A política de privacidade do site deve mencionar isto quando o painel for ativado.

## Modo demo e modo oficial
- **Demo** (`npm run build`, por omissão): `noindex`, `robots.txt` com `Disallow: /`, aviso de "website de demonstração" no rodapé.
- **Oficial** (`npm run build:oficial`): permite indexação, gera `sitemap.xml` e `canonical` se o endereço do site for conhecido, e retira o aviso de demonstração.
  Define o endereço com a variável `SITE_URL` (ex.: `SITE_URL=https://o-teu-site.pt npm run build:oficial`), ou ela é detetada automaticamente no Netlify e no Cloudflare Pages.
  **Antes de publicar a versão oficial, confirma por escrito com o dono os pontos de `CONTEUDOS_POR_CONFIRMAR.md`.**

## Pôr o projeto no repositório privado do GitHub
O repositório `https://github.com/16alves02/cutting-crew-website` tem de existir (privado). Na pasta do projeto, no teu computador:
```bash
git init
git add .
git commit -m "Website CUTTING CREW (demonstração)"
git branch -M main
git remote add origin https://github.com/16alves02/cutting-crew-website.git
git push -u origin main
```
O GitHub vai pedir autenticação (o teu utilizador e um *Personal Access Token*, ou o GitHub Desktop / `gh auth login`). O `.gitignore` já exclui `node_modules`, `dist` e as tuas fotografias em `photos/`.

## Publicar no Netlify (gratuito)
O Netlify permite uso comercial no plano gratuito e o projeto já traz a configuração (`netlify.toml`: comando `npm run build:oficial`, pasta `dist`, Node 22).

**Opção 1 — a partir do GitHub (recomendada, atualiza sozinho a cada `git push`):**
1. Põe o projeto no repositório privado (secção anterior).
2. Em netlify.com, cria conta (podes entrar com o GitHub) → **Add new site → Import an existing project → GitHub** → escolhe `cutting-crew-website` (dá acesso ao repositório privado quando pedir).
3. Não mudes nada (as definições vêm do `netlify.toml`) → **Deploy**.
4. O site fica em `nome-aleatorio.netlify.app`. Para mudar o nome: Site configuration → Change site name. O endereço é detetado sozinho para o `canonical` e o `sitemap.xml`.
5. Domínio próprio mais tarde: Domain management → Add a domain.

**Opção 2 — sem GitHub:** corre `npm run build:oficial` e arrasta a pasta `dist` para https://app.netlify.com/drop. (Sem `SITE_URL`, não há `canonical` nem `sitemap.xml`.)

**Alternativa gratuita:** Cloudflare Pages (Build command `npm run build:oficial`, output `dist`, variável `NODE_VERSION` = `22`).
O ficheiro `_headers` (Netlify e Cloudflare) tem os cabeçalhos de segurança e de cache, e `404.html` é usada automaticamente.

## Auditoria de lançamento
Resultado da auditoria final (20 pontos) e ações pendentes: ver `AUDITORIA_LANCAMENTO.md`.

## Cores
O site usa o azul-marinho do logótipo da barbearia (`--navy: #233154`, em `src/styles/tokens.css`), branco e cinzentos azulados. Não há ilustrações geradas: o topo usa a fotografia da montra e a galeria usa fotografias reais.

## Tipos de letra
Sofia Sans Extra Condensed e Instrument Sans, licença OFL, incluídos em `src/assets/fonts/` (sem pedidos a servidores externos). Ver `LICENCAS-DOS-TIPOS-DE-LETRA.txt` na mesma pasta.

## Privacidade
O site não usa cookies, rastreio nem analítica. O mapa do Google só carrega depois de clicares em "Mostrar mapa" (há um aviso junto ao botão). Por isso não é preciso faixa de consentimento de cookies. Se acrescentares analítica, anúncios, vídeos incorporados ou formulários, volta a avaliar isto e acrescenta política de privacidade.

Com o painel ativado, o site pede os perfis dos barbeiros ao Supabase quando alguém abre a página (o Supabase vê o endereço IP do pedido, como qualquer servidor). O site continua sem cookies nem armazenamento local; só quem entra no `/painel` (os barbeiros) fica com uma sessão guardada no navegador.

## Página 404
`public/404.html` é reconhecida automaticamente pelo Netlify e pelo Cloudflare Pages.
