// Teste do painel dos barbeiros com um Supabase SIMULADO (pedidos interceptados no navegador).
// Não fala com nenhum servidor real: verifica o que o nosso código faz (formulários, envio de fotos,
// consentimento, download do portefólio, leitura pública no site). As regras de segurança (RLS)
// vivem no Supabase e só se testam com um projeto real (ver README, "Painel dos barbeiros").
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const PORT = 4181, BASE = `http://localhost:${PORT}`;
const MOCK = "https://mock.supabase.test";
const OUT = "dist-painel-teste";
const UID = "11111111-2222-3333-4444-555555555555";

const build = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--mode", "oficial", "--outDir", OUT, "--emptyOutDir"], {
  env: { ...process.env, VITE_SUPABASE_URL: MOCK, VITE_SUPABASE_ANON_KEY: "chave-de-teste" },
  stdio: "ignore",
});
if (build.status !== 0) { console.error("A compilação de teste falhou."); process.exit(2); }
if (await fetch(BASE).then(() => true, () => false)) { console.error(`Porta ${PORT} ocupada.`); process.exit(2); }
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--outDir", OUT, "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(200); }

const results = [];
const check = (nome, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASSOU" : "FALHOU"}  ${nome}${extra ? " — " + extra : ""}`); };
const axeSrc = await readFile("node_modules/axe-core/axe.min.js", "utf8");

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: UID, email: "hiago@teste.pt", role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 })}.assinatura`;
const user = { id: UID, aud: "authenticated", role: "authenticated", email: "hiago@teste.pt", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const sharp = require("sharp");
const PNG = await sharp({ create: { width: 16, height: 12, channels: 3, background: "#808080" } }).png().toBuffer();

// Estado do "servidor" simulado
const estado = { perfil: { id: UID, member_id: "hiago", nome: null, funcao: null, bio: null, instagram: null, avatar_path: null }, fotos: [], pedidos: [] };
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

async function simular(context) {
  await context.route(`${MOCK}/**`, async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const m = req.method();
    const corpo = req.postData() ?? "";
    const json = (data, status = 200) => route.fulfill({ status, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(data) });
    if (m === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    estado.pedidos.push({ m, p: u.pathname, q: u.search, corpo });
    if (u.pathname === "/auth/v1/token") return json({ access_token: jwt, token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "r", user });
    if (u.pathname === "/auth/v1/user") return json(user);
    if (u.pathname === "/auth/v1/logout") return route.fulfill({ status: 204, headers: cors });
    if (u.pathname === "/rest/v1/profiles") {
      if (m === "PATCH") { Object.assign(estado.perfil, JSON.parse(corpo)); return route.fulfill({ status: 204, headers: cors }); }
      if (u.search.includes("id=eq.")) return json(estado.perfil);
      return json([{ ...estado.perfil, photos: estado.fotos.map(({ id, path, legenda }) => ({ id, path, legenda })) }]);
    }
    if (u.pathname === "/rest/v1/photos") {
      if (m === "POST") { estado.fotos.unshift({ id: `f${estado.fotos.length + 1}-${Date.now()}`, legenda: null, ...JSON.parse(corpo) }); return route.fulfill({ status: 201, headers: cors }); }
      if (m === "DELETE") { const id = u.search.match(/id=eq\.([^&]+)/)?.[1]; estado.fotos = estado.fotos.filter((f) => f.id !== id); return route.fulfill({ status: 204, headers: cors }); }
      if (m === "PATCH") return route.fulfill({ status: 204, headers: cors });
      return json(estado.fotos);
    }
    if (u.pathname.startsWith("/storage/v1/object/public/")) return route.fulfill({ status: 200, headers: { ...cors, "content-type": "image/png" }, body: PNG });
    if (u.pathname.startsWith("/storage/v1/object/perfis") && m === "POST") return json({ Key: u.pathname });
    if (u.pathname.startsWith("/storage/v1/object/perfis") && m === "DELETE") return json([]);
    return json({ message: "não simulado" }, 404);
  });
}
const axe = async (page) => { await page.evaluate(axeSrc); return (await page.evaluate(() => axe.run())).violations; };

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
  await simular(ctx);
  const page = await ctx.newPage();
  const erros = [];
  page.on("console", (c) => c.type() === "error" && erros.push(c.text()));
  page.on("pageerror", (e) => erros.push(String(e)));
  page.on("dialog", (d) => d.accept());

  await page.goto(`${BASE}/painel.html`, { waitUntil: "networkidle" });
  check("painel: página marcada noindex", /noindex/.test(await page.content()));
  check("painel: mostra o formulário de entrada", await page.getByRole("heading", { name: "Entrar" }).isVisible());
  const v1 = await axe(page);
  check("painel (entrada): 0 violações de acessibilidade (axe)", v1.length === 0, v1.map((x) => x.id).join(","));

  await page.getByLabel("Email").fill("hiago@teste.pt");
  await page.getByLabel("Palavra-passe", { exact: true }).fill("palavra-teste-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("heading", { name: "O teu perfil" }).waitFor({ timeout: 8000 });
  check("painel: login mostra o perfil do barbeiro", true);

  // Perfil
  await page.getByLabel("Biografia").fill("Corto cabelo em Cucujães e gosto de fazer cada cliente sair a sentir-se bem.");
  await page.getByLabel(/Instagram/).fill("@hiago.teste");
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await page.getByText("Perfil guardado").waitFor();
  const patch = estado.pedidos.find((p) => p.m === "PATCH" && p.p === "/rest/v1/profiles");
  const corpo = JSON.parse(patch.corpo);
  check("painel: guardar perfil envia bio e Instagram (sem @)", corpo.bio.startsWith("Corto cabelo") && corpo.instagram === "hiago.teste");
  check("painel: nunca envia member_id nem links de marcação", !("member_id" in corpo) && !("bookingUrl" in corpo));

  // Fotos: sem consentimento não envia
  const antes = estado.pedidos.length;
  await page.locator('input[type=file][multiple]').setInputFiles({ name: "corte.png", mimeType: "image/png", buffer: PNG });
  await page.getByText("Confirma primeiro que tens autorização").waitFor();
  check("painel: sem confirmar autorização não envia fotografias", !estado.pedidos.slice(antes).some((p) => p.m === "POST"));
  await page.getByLabel(/Tenho autorização/).check();
  await page.locator('input[type=file][multiple]').setInputFiles({ name: "corte.png", mimeType: "image/png", buffer: PNG });
  await page.getByText("Fotografias publicadas").waitFor({ timeout: 6000 }).catch(async () => { console.log("MSG:", await page.locator(".painel__msg").allTextContents(), estado.pedidos.slice(-4).map(p=>p.m+" "+p.p)); throw new Error("upload falhou"); });
  const ins = estado.pedidos.find((p) => p.m === "POST" && p.p === "/rest/v1/photos");
  const insBody = JSON.parse(ins.corpo);
  check("painel: foto enviada para a pasta do próprio barbeiro, com consentimento", insBody.path.startsWith(`${UID}/`) && insBody.consentimento === true && insBody.profile_id === UID, insBody.path);
  check("painel: a fotografia aparece na grelha", (await page.locator(".painel__grelha li").count()) === 1);

  const v2 = await axe(page);
  check("painel (com sessão): 0 violações de acessibilidade (axe)", v2.length === 0, v2.map((x) => `${x.id}:${x.nodes[0]?.html.slice(0, 60)}`).join(" | "));

  // Portefólio
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descarregar portefólio" }).click()]);
  const ficheiro = await readFile(await dl.path(), "utf8");
  check("portefólio: ficheiro HTML com bio, Instagram e a fotografia incluída", /portefolio-.*\.html$/.test(dl.suggestedFilename()) && ficheiro.includes("Corto cabelo") && ficheiro.includes("@hiago.teste") && /<img src="data:image\/png;base64,/.test(ficheiro), dl.suggestedFilename());
  check("portefólio: tem botão para guardar em PDF e é autónomo (sem links externos)", ficheiro.includes("window.print()") && !/(src|href)="https?:/.test(ficheiro));

  // Apagar
  await page.getByRole("button", { name: "Apagar" }).click();
  await page.getByText("Fotografia apagada").waitFor();
  check("painel: apagar remove a fotografia", (await page.locator(".painel__grelha li").count()) === 0 && estado.pedidos.some((p) => p.m === "DELETE" && p.p === "/rest/v1/photos"));

  // Sair
  await page.getByRole("button", { name: "Sair" }).first().click();
  await page.getByRole("heading", { name: "Entrar" }).waitFor();
  check("painel: sair volta ao ecrã de entrada", true);
  check("painel: sem erros na consola", erros.length === 0, erros.slice(0, 2).join(" | "));

  // Site público: mostra o que o barbeiro personalizou
  estado.fotos = [{ id: "a1", path: `${UID}/a.webp`, legenda: "Degradê" }, { id: "a2", path: `${UID}/b.webp`, legenda: null }];
  const pub = await ctx.newPage();
  const errosPub = [];
  pub.on("console", (c) => c.type() === "error" && errosPub.push(c.text()));
  await pub.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const item = pub.locator(".roster__item", { hasText: "Hiago" });
  await item.locator("summary").click();
  await item.getByText("Corto cabelo em Cucujães").waitFor({ timeout: 5000 });
  check("site: mostra a biografia que o barbeiro escreveu no painel", true);
  check("site: mostra a grelha com as suas fotografias", (await item.locator(".roster__fotos img").count()) === 2);
  const marcar = await item.getByRole("link", { name: /Marcar com/ }).getAttribute("href");
  check("site: o link de marcação do Fresha continua o original (employeeId 3330760)", marcar.includes("employeeId=3330760"));
  check("site: mostra o Instagram do barbeiro", (await item.getByRole("link", { name: /@hiago\.teste/ }).getAttribute("href")) === "https://www.instagram.com/hiago.teste/");
  const outro = pub.locator(".roster__item", { hasText: "Almeida" });
  await outro.locator("summary").click();
  check("site: quem não personalizou continua com o conteúdo fixo", (await outro.locator(".roster__fotos").count()) === 0 && (await outro.locator(".roster__bio").count()) === 1);
  check("site: sem erros na consola", errosPub.length === 0, errosPub.slice(0, 2).join(" | "));
} catch (e) {
  check("o teste correu até ao fim sem exceções", false, e.message.split("\n")[0]);
} finally {
  await browser.close();
  server.kill();
}
const ok = results.filter(Boolean).length;
console.log(`\n${ok}/${results.length} testes passaram (painel, com Supabase simulado)`);
process.exit(ok === results.length ? 0 : 1);
