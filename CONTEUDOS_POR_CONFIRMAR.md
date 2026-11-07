# Conteúdos por confirmar com a barbearia

Tudo o que está no site foi lido no perfil público do Fresha, no Linktree e no Instagram da barbearia (consultados em 26/10/2026), ou fornecido pelo programador. Nada foi inventado, mas há pontos que só o dono pode validar.

## Autorizações (confirmadas em 27/10/2026)
- [x] O programador confirmou, estando presente com o dono e a equipa, o uso do **logótipo**, das **fotografias** (incluindo as do `@jj__arc`, que dispensou crédito), dos **nomes e fotos da equipa** e a **publicação** do site.
- [x] **Alojamento:** Netlify (gratuito, uso comercial permitido); `netlify.toml` já usa a versão oficial. Domínio próprio mais tarde.
- [ ] **Entidade para o ©** do rodapé (hoje: "CUTTING CREW Barbershop").
- [ ] Se for útil, guardar uma mensagem do dono a confirmar o acima (não é preciso para o site funcionar).

## Serviços e preços
- [x] Os **17 serviços** do Fresha estão no site (lista completa do passo "Selecionar serviços", 26/10/2026).
- [ ] **Madeixas** (2 h) não tem preço fixo: o Fresha mostra "Valor mediante a avaliação". No site aparece "Valor mediante avaliação".
- [ ] Só a **Limpeza de pele** e a **Pigmentação** têm descrição no Fresha (usada tal e qual).
- [ ] Preços/durações estão fixos em `src/data/services.ts`: se mudarem no Fresha, é preciso atualizar.

## Equipa
- [x] Nomes no site, indicados pelo programador: **Almeida**, **Rúben**, **Hiago**, **Cutting Gu**; todos "Barbeiro".
- [ ] Confirmar com o Gustavo (Cutting Gu) se quer a função de proprietário/responsável no site (por agora só "Barbeiro").
- [x] Cada barbeiro tem a sua ligação de **marcação direta** (Fresha, `employeeId`) e de **perfil no Fresha**. As ligações do Almeida, Rúben e Hiago vêm dos perfis com o nome deles; a do **Cutting Gu** é a do perfil que aparece com o nome da barbearia — **confirmar que é o dele**.
- [ ] Só o Cutting Gu tem apresentação (texto dele no Fresha, usado tal e qual). Os outros não têm: se quiserem, escrevem uma.
- [ ] **Avaliações e portefólio** de cada barbeiro: o site liga ao perfil do Fresha. Copiar avaliações para o site exigiria o consentimento dos clientes e não há API pública do Fresha para isso.
- [x] **Fotografias da equipa:** Almeida, Rúben e Hiago usam as fotos enviadas (identificadas pelo programador). O **Cutting Gu usa o emblema da barbearia** até haver uma foto dele. Cada pessoa tem de concordar em aparecer; as fotos são pequenas (340 px).
- [ ] O Instagram refere formações de novos barbeiros: não aparece no site.

## Contactos e redes
- [ ] **WhatsApp** (+351 960 351 733): usado apenas na ligação `wa.me`, vem do Linktree; o número não aparece escrito no site. Confirmar que é o número da barbearia.
- [ ] **Instagram:** o site aponta agora para a conta da barbearia, `@cuttingcrew.barbershop` (indicada pelo programador); o Linktree usa `@cutting_gu`, que parece ser a conta pessoal de um membro da equipa. Confirmar qual deve aparecer.
- [ ] **TikTok** `@cutting_gu` (do Linktree): confirmar se é da barbearia ou pessoal.
- [ ] O botão "Agendamentos" do Linktree aponta para um endereço Fresha **diferente** (`.../pt/book-now/cutting-gu-ltc7nuzo/...`) do URL oficial fornecido no briefing, que é o usado no site. Confirmar qual é o correto.
- [ ] Sem **telefone fixo** nem **email** confirmados — não foram colocados.

## Horário e morada
- [ ] Horário lido no Fresha: terça a sábado 09:00–20:00; segunda e domingo fechado. Confirmar (inclui feriados/pausas?).
- [ ] Morada: Rua Núcleo de Atletismo de Cucujães, 127, 3720-780 Cucujães, Aveiro. O código postal completo vem da morada do Fresha/mapas; confirmar.
- [ ] O **mapa incorporado e as ligações Google Maps/Waze** foram ligados à morada em texto, mas **não foram testados num navegador real com acesso ao Google** (o ambiente de testes não o permite). Testar uma vez depois de publicar.

## Imagem e marca
- [ ] **Fotografias da galeria e da montra:** usadas, com autorização verbal do dono (ver "Autorizações"). Se for preciso retirar alguma, `autorizada: false` em `src/data/gallery.ts`.
- [x] Não há ilustrações geradas: o topo usa a fotografia da montra e a galeria usa fotografias reais.
- [ ] **Logótipo:** foi-me enviado um logótipo (letra manuscrita "Cutting" + "CREW & BARBERSHOP", branco sobre azul-marinho) e está usado no cabeçalho e na imagem de partilha. Autorização confirmada em 27/10/2026. Foi apenas convertido para branco sobre transparente (não foi redesenhado); o original está em `brand/logo-original-fornecido.jpg`. A resolução é baixa (1026×572): pedir o ficheiro vetorial (SVG/PDF) ou PNG grande para melhor nitidez.
- [x] **Cores:** o site usa o azul-marinho do logótipo (`#233154`), branco e cinzentos azulados, como pedido.
- [x] **Ícone do separador (favicon) e do ecrã inicial:** monograma "C&B" da montra, branco sobre azul-marinho (fotografia original em `brand/monograma-cb-montra-fornecido.png`; o ícone foi vetorizado a partir dela, por isso convém trocar pelo ficheiro vetorial original se a barbearia o tiver). O emblema redondo continua guardado em `brand/`.
- [ ] "**Des. 2016**" (desde 2016) aparece na montra e no emblema, mas não está escrito no site: confirmar se querem mostrar.
- [ ] A frase do rodapé ("Surpreendendo em todo corte. Cuidando de cada detalhe.") vem da bio do Linktree. Confirmar que pode ser usada.
- [ ] **Avaliações/classificações não são mostradas** (decisão minha): o Fresha mostra 1011 avaliações da barbearia com nota 5,0 (4,981 no pormenor, arredondado a 5,0), e as avaliações têm nomes de clientes. Se o dono quiser, pode mostrar-se "nota e número de avaliações no Fresha" com ligação à fonte.
- [ ] "Cucujães, Aveiro": a localidade pertence ao município de Oliveira de Azeméis (distrito de Aveiro). Confirmar como querem que apareça.

## O que não foi possível verificar
- O clique real no Fresha, no WhatsApp e nas redes (só se verificou que os URLs estão corretos).
- O site publicado: nada foi publicado.

## Perguntas frequentes: respostas dadas em 29/10/2026 (via equipa)
- Aceitam todas as formas de pagamento; há estacionamento perto.
- Sem marcação: depende da disponibilidade. Atraso/cancelamento: avisar com antecedência (prazo exato por confirmar).
- Crianças: mesmo preço (confirmar se há idade mínima).
- Ainda por confirmar: se fecham à hora de almoço e em feriados.

## Painel dos barbeiros
- [ ] Criar o projeto no Supabase e ligar as contas (README, "Painel dos barbeiros"). Sem isto, o `/painel` só mostra um aviso.
- [ ] Atualizar a política de privacidade quando o painel for ativado (emails, textos e fotografias dos barbeiros ficam no Supabase).
- [ ] Combinar com os barbeiros quem pode publicar fotografias de clientes e como se obtém a autorização.
