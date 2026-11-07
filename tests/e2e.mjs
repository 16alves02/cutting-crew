// Testes automáticos de ponta a ponta (Playwright + axe-core).
// Uso: npm run build && npm run test:e2e              (testa a versão demo)
//      npm run build:oficial && npm run test:e2e:oficial (testa a versão oficial)
// O preview é arrancado e terminado pelo próprio script.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Falta o Playwright. Corre: npm install && npx playwright install chromium");
  process.exit(2);
}

const FRESHA = "https://www.fresha.com/a/cutting-crew-barbershop-aveiro-rua-nucleo-de-atletismo-de-cucujaes-127-sme9odid";
const PORT = 4179, BASE = `http://localhost:${PORT}/`;
const OFICIAL = process.env.MODO === "oficial" || process.argv.includes("--oficial");
const INSTAGRAM = "https://www.instagram.com/cuttingcrew.barbershop/";
const PERMITIDOS = ["www.fresha.com", "wa.me", "www.instagram.com", "www.tiktok.com", "www.google.com", "waze.com"];

// Se a porta já estiver ocupada, algum servidor antigo responderia com um build diferente: aborta.
if (await fetch(BASE).then(() => true, () => false)) {
  console.error(`A porta ${PORT} já está em uso (servidor antigo?). Termina esse processo e volta a correr.`);
  process.exit(2);
}
// Arranca o Vite diretamente com o Node (e não via npx) para o conseguirmos terminar no fim.
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
const results = [];
const check = (nome, ok, extra = "") => { results.push({ nome, ok }); console.log(`${ok ? "PASSOU" : "FALHOU"}  ${nome}${extra ? " — " + extra : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(200); }

const browser = await chromium.launch().catch((e) => {
  console.error("Não foi possível abrir o Chromium. Corre: npx playwright install chromium\n" + e.message.split("\n")[0]);
  server.kill();
  process.exit(2);
});
await mkdir("tests/screenshots", { recursive: true });
const axeSrc = await readFile("node_modules/axe-core/axe.min.js", "utf8");

try {
  // HTML pré-renderizado (sem JavaScript)
  const html = await (await fetch(BASE)).text();
  check("HTML pré-renderizado contém o título do hero", /Your style/i.test(html) && /Your crew/i.test(html));
  check(`robots meta ${OFICIAL ? "sem noindex (oficial)" : "noindex (demo)"}`, OFICIAL ? !/noindex/.test(html) : /noindex/.test(html));
  const robots = await (await fetch(BASE + "robots.txt")).text();
  check("robots.txt coerente com o modo", OFICIAL ? !/Disallow: \/\s*$/m.test(robots) : /Disallow: \//.test(robots), robots.trim().replace(/\n/g, " | "));
  const fp = await fetch(BASE + "images/fotos/foto-1-640.webp");
  check("fotografias autorizadas existem no site", fp.ok && /image\//.test(fp.headers.get("content-type") || ""));
  const pend = await fetch(BASE + "images/pendentes/qualquer.webp");
  check("não existe pasta de fotografias pendentes no site", !/image\//.test(pend.headers.get("content-type") || ""));
  const f404 = await fetch(BASE + "404.html"); const h404 = await f404.text();
  check("404.html personalizada (noindex, ligação ao início e ao Fresha)", f404.ok && /noindex/.test(h404) && h404.includes('href="/"') && h404.includes(FRESHA));
  check("og-image e favicon existem", (await fetch(BASE + "og-image.jpg")).ok && (await fetch(BASE + "favicon.svg")).ok && (await fetch(BASE + "apple-touch-icon.png")).ok);

  for (const [nome, vp] of [["telemovel", { width: 390, height: 844 }], ["tablet", { width: 768, height: 1024 }], ["computador", { width: 1440, height: 900 }], ["pequeno", { width: 320, height: 640 }]]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    const problemas = [];
    page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problemas.push("consola: " + m.text()); });
    page.on("pageerror", (e) => problemas.push("erro: " + e.message));
    page.on("requestfailed", (r) => problemas.push("pedido falhado: " + r.url()));
    page.on("response", (r) => { if (r.status() >= 400) problemas.push(`HTTP ${r.status()}: ${r.url()}`); });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await sleep(1800);
    check(`[${nome}] sem erros nem avisos na consola/rede`, problemas.length === 0, problemas.join("; "));
    check(`[${nome}] sem scroll horizontal`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    if (nome === "computador") {
      // Todos os botões/ligações de marcação usam exatamente o URL do Fresha
      const marcar = await page.$$eval("a", (as) => as.filter((a) => /marcar agora/i.test(a.textContent || "")).map((a) => a.href));
      check(`botões "Marcar agora" (${marcar.length}) abrem o URL oficial do Fresha`, marcar.length >= 4 && marcar.every((h) => h === FRESHA), marcar.join(", "));
      // Ligações externas
      const ext = await page.$$eval("a[href^=http]", (as) => as.map((a) => ({ h: a.href, rel: a.rel, t: a.target })));
      check("ligações externas só para domínios esperados", ext.every((e) => PERMITIDOS.includes(new URL(e.h).hostname)), [...new Set(ext.map((e) => new URL(e.h).hostname))].join(", "));
      const barbeiros = { Almeida: 5240034, "Rúben": 3478445, Hiago: 3330760, "Cutting Gu": 3172699 };
      const links = await page.$$eval("#equipa a", (as) => as.map((a) => ({ t: a.textContent.replace(/\(abre num novo separador\)/, "").trim(), h: a.href })));
      const okEquipa = Object.entries(barbeiros).every(([n, id]) => links.some((l) => l.t === `Marcar com ${n}` && l.h.startsWith("https://www.fresha.com/pt-PT/a/cutting-crew-barbershop-aveiro-rua-nucleo-de-atletismo-de-cucujaes-127-sme9odid/booking?employeeId=" + id + "&")));
      check("equipa: 4 barbeiros, cada um com a sua ligação de marcação (employeeId)", okEquipa && (await page.$$("#equipa details")).length === 4, JSON.stringify(links.map((l) => l.t)));
      await page.locator("#equipa summary").first().click();
      check("equipa: o painel do barbeiro abre com o clique", await page.$eval("#equipa details", (d) => d.open));
      await page.reload({ waitUntil: "networkidle" }); await sleep(1800); // repõe o foco e o scroll para os testes de teclado
      const estilos = await page.evaluate(() => ({
        equipa: getComputedStyle(document.querySelector(".roster__summary")).display,
        servicos: getComputedStyle(document.querySelector(".menu-item__row")).display,
        local: getComputedStyle(document.querySelector(".location__grid")).display,
      }));
      check("CSS: estilos de Equipa, Serviços e Localização aplicados (nenhuma regra cortada)", estilos.equipa === "flex" && estilos.servicos === "flex" && estilos.local === "grid", JSON.stringify(estilos));
      const rodape = await page.textContent(".site-footer__legal");
      check("rodapé: © com o ano atual e o nome da barbearia", rodape.includes(`© ${new Date().getFullYear()} CUTTING CREW Barbershop`), rodape.slice(0, 40));
      check("Instagram aponta para a conta da barbearia", ext.some((e) => e.h === INSTAGRAM));
      check("ligações externas com target=_blank e rel=noopener noreferrer", ext.every((e) => e.t === "_blank" && /noopener/.test(e.rel) && /noreferrer/.test(e.rel)));
      // Âncoras internas
      const ancoras = await page.$$eval("a[href^='#']", (as) => as.map((a) => a.getAttribute("href")));
      const falta = [];
      for (const h of new Set(ancoras)) if (h !== "#" && !(await page.$(h))) falta.push(h);
      check(`âncoras internas existem (${new Set(ancoras).size})`, falta.length === 0, falta.join(","));
      // Imagens (percorre a página para accionar o carregamento diferido)
      for (let y = 0; y < 12000; y += 600) { await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y); await sleep(120); }
      await sleep(800); await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      const imgs = await page.$$eval("img", (is) => is.map((i) => ({ s: i.currentSrc, alt: i.getAttribute("alt"), w: i.getAttribute("width"), h: i.getAttribute("height"), ok: i.complete && i.naturalWidth > 0 })));
      check(`imagens (${imgs.length}) carregam, têm alt, width e height`, imgs.every((i) => i.ok && i.alt !== null && i.w && i.h), JSON.stringify(imgs.filter((i) => !(i.ok && i.alt !== null && i.w && i.h))));
      // Preços e serviços
      const esperados = [["Cabelo", "13"], ["Barba", "11"], ["Sobrancelha", "4"], ["Acabamento", "5"], ["Hidratação", "10"], ["Limpeza de pele", "12"], ["Pigmentação", "12"], ["Depilação com cera (nariz)", "6"], ["Depilação com cera (orelha)", "6"], ["Depilação com cera (nariz e orelha)", "8"], ["Cabelo e sobrancelha", "16"], ["Cabelo e barba", "20"], ["Cabelo, barba e sobrancelha", "23"], ["Cabelo e hidratação", "16"], ["Cabelo e limpeza de pele", "25"], ["Cabelo e pigmentação", "25"]];
      const nomes = await page.$$eval("#servicos .menu-item", (els) => els.map((e) => ({ n: e.querySelector(".menu-item__name").textContent, p: e.querySelector(".menu-item__price").textContent.replace(/\u00a0/g, " ") })));
      check(`serviços e preços iguais aos confirmados no Fresha (${nomes.length} serviços)`, nomes.length === 17 && esperados.every(([n, p]) => nomes.some((x) => x.n === n && x.p === p + " €")) && nomes.some((x) => x.n === "Madeixas" && /avaliação/.test(x.p)), JSON.stringify(nomes.filter((x) => !esperados.some(([n, p]) => x.n === n && x.p === p + " €"))));
      // Estrutura
      check("um único h1", (await page.$$("h1")).length === 1);
      check("landmarks header/nav/main/footer", (await page.$$("header, nav, main, footer")).length >= 4);
      // Teclado: skip link e foco visível
      await page.keyboard.press("Tab"); await sleep(400);
      const skip = await page.evaluate(() => { const a = document.activeElement; return a?.classList.contains("skip-link") && a.getBoundingClientRect().top >= 0; });
      check("skip link visível ao primeiro Tab", !!skip);
      let focoVisivel = true;
      for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); const o = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle); if (o === "none") focoVisivel = false; }
      check("foco do teclado com contorno visível", focoVisivel);
      // Mapa: só carrega depois do clique
      check("mapa não carrega antes do clique", (await page.$$("iframe")).length === 0);
      check("aviso de privacidade junto ao mapa", /Google recebe/.test(await page.textContent(".map")));
      const cookies = await ctx.cookies(); const ls = await page.evaluate(() => localStorage.length + sessionStorage.length);
      check("sem cookies nem armazenamento local antes de qualquer interação", cookies.length === 0 && ls === 0);
      const meta = await page.evaluate(() => ({ t: document.title, d: document.querySelector('meta[name=description]')?.content, og: ["og:title", "og:description", "og:image", "og:type", "og:locale"].every((k) => document.querySelector(`meta[property="${k}"]`)?.content), tw: !!document.querySelector('meta[name="twitter:card"]'), lang: document.documentElement.lang }));
      check("título, descrição, Open Graph, Twitter card e lang=pt-PT", meta.t.length > 10 && meta.t.length <= 70 && meta.d?.length > 50 && meta.d.length <= 170 && meta.og && meta.tw && meta.lang === "pt-PT", JSON.stringify({ t: meta.t.length, d: meta.d?.length, lang: meta.lang }));
      // axe
      await page.evaluate(axeSrc);
      const axe = await page.evaluate(() => window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }));
      check("axe-core: 0 violações", axe.violations.length === 0, axe.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0].target}`).join("; "));
    }

    if (nome === "telemovel") {
      const burger = page.getByRole("button", { name: /menu/i });
      await burger.click(); await sleep(600);
      check("menu móvel abre (aria-expanded=true)", (await burger.getAttribute("aria-expanded")) === "true");
      check("conteúdo principal inerte com o menu aberto", await page.$eval("main", (m) => m.inert === true));
      await page.keyboard.press("Escape"); await sleep(600);
      check("Escape fecha o menu", (await burger.getAttribute("aria-expanded")) === "false");
      await burger.click(); await sleep(500);
      await page.locator(".menu a", { hasText: "Localização" }).click(); await sleep(2200);
      check("ligação do menu fecha-o e navega", (await burger.getAttribute("aria-expanded")) === "false" && (await page.$eval("#localizacao", (e) => e.getBoundingClientRect().top)) < 200);
      // clique para mostrar mapa
      await page.getByRole("button", { name: /mostrar mapa/i }).click(); await sleep(500);
      check("mapa carrega depois do clique (iframe)", (await page.$$("iframe")).length === 1);
    }
    await page.screenshot({ path: `tests/screenshots/${nome}.png`, fullPage: false });
    await ctx.close();
  }

  // prefers-reduced-motion
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p2 = await rm.newPage(); await p2.goto(BASE, { waitUntil: "networkidle" });
  const anim = await p2.evaluate(() => ({ reveal: getComputedStyle(document.querySelector(".hero__reveal")).animationName, arte: getComputedStyle(document.querySelector(".hero__art")).animationName }));
  check("prefers-reduced-motion desliga as animações do hero", anim.reveal === "none" && anim.arte === "none", JSON.stringify(anim));
  await rm.close();

  // sem JavaScript: conteúdo e botão de marcação continuam presentes
  const nj = await browser.newContext({ javaScriptEnabled: false });
  const p3 = await nj.newPage(); await p3.goto(BASE);
  check("sem JavaScript: conteúdo e botão Fresha visíveis", (await p3.$$eval("a", (as) => as.some((a) => a.href.includes("fresha.com")))) && (await p3.textContent("body")).includes("Cabelo"));
  await nj.close();

  // Galeria: só fotografias reais da barbearia, sem ilustrações geradas
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } }); await pg.goto(BASE, { waitUntil: "load" });
  const srcs = await pg.$$eval("img", (imgs) => imgs.map((i) => i.getAttribute("src") || ""));
  check("galeria: 5 fotografias reais e nenhuma ilustração gerada (g-*, hero-*)", (await pg.$$("#galeria figure")).length === 5 && !srcs.some((x) => /\/images\/(g-|hero-)/.test(x)), srcs.join(" ").slice(0, 80));
  await pg.close();

  // fallback de imagem partida
  const bad = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p4 = await bad.newPage();
  await p4.route(/\/images\/.*\.webp/, (r) => r.abort());
  await p4.goto(BASE, { waitUntil: "load" }); await sleep(1000);
  check("imagens que falham mostram plano B (.img-fallback) sem partir a página", (await p4.$$(".img-fallback")).length > 0 && (await p4.textContent("h1")).length > 0);
  await bad.close();
} finally {
  await browser.close();
  server.kill();
}
const falhas = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - falhas}/${results.length} testes passaram${OFICIAL ? " (modo oficial)" : ""}`);
process.exit(falhas ? 1 : 0);
