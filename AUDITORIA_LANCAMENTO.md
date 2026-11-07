# Auditoria final de lançamento (26/10/2026)

Legenda: ✅ concluído · ➖ não se aplica (justificado) · ⚠️ pendente (depende do dono ou da publicação)

| # | Ponto | Estado | Detalhe / ação pendente |
|---|---|---|---|
| 1 | Política de privacidade | ➖ | O site não recolhe dados pessoais, não tem formulários, cookies, analítica nem contas. O único contacto com terceiros é o mapa do Google, só depois de clicar, com aviso junto ao botão. **Pendente:** se o dono acrescentar analítica, formulários ou anúncios, é preciso uma política com a identidade legal do responsável (que não nos foi dada e não foi inventada). |
| 2 | Termos e condições | ➖ | Não há vendas, pagamentos nem contas no site; as marcações e condições são do Fresha. Nenhuma informação legal da barbearia foi inventada. |
| 3 | CTA de marcação no Fresha | ✅ | 5 botões "Marcar agora" (cabeçalho, menu móvel, topo, serviços, secção de marcação) mais a 404, todos com o URL oficial do briefing; testado. **Pendente:** clicar a sério depois de publicado (o ambiente de testes não chega ao Fresha). |
| 4 | FAQ | ➖ | Não há respostas confirmadas além da morada, do horário e dos preços, que já estão no site. Uma FAQ obrigaria a inventar (pagamentos, cancelamentos, crianças…). **Pendente (opcional):** se o dono enviar respostas, acrescenta-se. |
| 5 | robots.txt | ✅ | Gerado no build: demo = `Disallow: /`; oficial = `Allow: /` + sitemap. Testado nos dois modos. |
| 6 | sitemap.xml | ✅ | Gerado só no modo oficial e com `SITE_URL` conhecido (testado com endereço de exemplo). **Pendente:** definir o domínio final. |
| 7 | Página 404 | ✅ | `public/404.html` (noindex, voltar ao início, marcar agora); testada a existência e o conteúdo. O comportamento com um serviço real (Netlify/Cloudflare) fica por ver após publicar. |
| 8 | Texto alternativo | ✅ | As 7 imagens têm `alt`; as decorativas (arte do topo/marcação) têm `alt=""` de propósito. Testado. Substituir por descrições reais quando houver fotografias. |
| 9 | Analytics | ➖ | Não há analítica. Não era necessária e evita consentimento. Confirmado: sem cookies nem storage no carregamento. |
| 10 | Títulos SEO | ✅ | Site de uma só página: um título (≤70 caracteres), um único `h1`. Testado. |
| 11 | Meta descriptions | ✅ | Uma descrição (50–170 caracteres). Texto atual é de demonstração; **pendente:** o texto oficial é usado em `build:oficial`, validar com o dono. |
| 12 | Open Graph / partilha | ✅ | og:title/description/image/type/locale e Twitter card; `og-image.jpg` 1200×630 (35 KB) com o nome em texto. **Pendente:** testar a pré-visualização em redes reais depois de publicado (as redes não leem sites locais). |
| 13 | Favicon | ✅ | `favicon.svg` + `apple-touch-icon.png`. Genéricos (letras "C"), ainda não usam o logótipo; o logótipo enviado já está no cabeçalho e na imagem de partilha (`og-image.jpg`). **Pendente:** confirmar a autorização de uso e criar um ícone aprovado pelo dono. |
| 14 | URL canónico | ✅ | Só no modo oficial com `SITE_URL` (testado). Em demo não existe de propósito. |
| 15 | Consentimento de cookies | ➖ | Sem cookies nem tecnologias equivalentes, de acordo com os testes. O mapa só carrega após clique, com aviso. Rever se se acrescentar analítica ou incorporações. |
| 16 | Responsivo | ✅ | Testado em 320, 390, 768 e 1440 px: sem scroll horizontal e sem erros; capturas vistas em 390 e 1440. |
| 17 | Acessibilidade | ✅ | Skip link, foco visível, menu móvel com `inert`/Escape, landmarks, um `h1`, axe-core (WCAG 2 A/AA, 2.1 AA e boas práticas) com 0 violações. **Pendente:** teste manual com leitor de ecrã e contraste sobre a arte do topo (o axe não consegue medir texto sobre imagens). |
| 18 | Formulários | ➖ | Não existem formulários (marcação é no Fresha). |
| 19 | Ligações | ✅ | Âncoras internas, domínios externos permitidos, `rel`/`target`, sem respostas HTTP ≥400 em recursos locais; URLs do Fresha, WhatsApp, Instagram e TikTok conferidos com o Fresha e o Linktree. **Pendente:** cliques reais nos serviços externos. |
| 20 | Desempenho | ✅ | Sem JS de terceiros, tipos de letra próprios (woff2 latin, 70 KB), imagens WebP em vários tamanhos com `srcset`, carregamento diferido abaixo da dobra, pré-carregamento do topo, HTML pré-renderizado, cache longa em `/assets`. JS 237 KB (73 KB gzip), CSS 15 KB. **Não medido:** Lighthouse/Web Vitals (não disponível aqui). Imagens maiores: topo 445 KB em ecrãs grandes. |

## Resultados dos testes (executados nesta auditoria)
- `npm run lint`: sem avisos.
- `npm run build` (demo): passou. `npm run build:oficial` (com `SITE_URL=https://exemplo.pt`): passou.
- `npm run test:e2e`: 42/42 (demo) e 42/42 (oficial, `npm run test:e2e:oficial`), repetidos numa cópia limpa com `npm ci`. O Playwright (1.63.0) está agora declarado em `package.json` e `package-lock.json`; o navegador instala-se com `npx playwright install chromium`.

## Alterações posteriores à auditoria (26/10/2026, tarde)
- Lista de serviços alargada de 6 para 16 (dos 17 do Fresha; falta 1), com preços e durações lidos no Fresha.
- Instagram passou para a conta da barbearia (`@cuttingcrew.barbershop`).
- Fotografias fornecidas: só na versão demonstração, marcadas "a aguardar autorização"; removidas do `dist` na versão oficial (testado: o ficheiro não existe no site oficial).
- Emblema redondo usado como `apple-touch-icon`.

## Alterações de 27/10/2026
- 17 serviços (lista completa do Fresha).
- Fotografias, logótipo, equipa e publicação autorizados (confirmado pelo programador em 27/10/2026).
- Equipa: Almeida, Rúben, Hiago (com foto) e Cutting Gu (emblema da barbearia), cada um com ligação de marcação direta (`employeeId`) e perfil no Fresha; bio só do Cutting Gu.
- Alojamento: **Netlify** (gratuito, uso comercial permitido); `netlify.toml` usa `npm run build:oficial`.

## Antes de publicar (resumo)
1. Autorização do dono e validação de `CONTEUDOS_POR_CONFIRMAR.md`.
2. Domínio final e `SITE_URL`; usar `build:oficial`.
3. Fotografias autorizadas (opcional mas recomendado).
4. Testar manualmente o clique no Fresha, o mapa e a partilha social depois de publicado.
