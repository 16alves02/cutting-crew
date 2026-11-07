// Gera o portefólio de um barbeiro como um único ficheiro HTML (as fotos vão dentro do ficheiro,
// por isso funciona offline e pode ser guardado em PDF a partir do botão "Guardar como PDF").

export type DadosPortfolio = {
  nome: string;
  funcao: string;
  bio: string;
  instagram: string;
  /** Retrato e fotografias já em data URL (base64). */
  avatar: string | null;
  fotos: { src: string; legenda: string }[];
  barbearia: string;
  morada: string;
  geradoEm: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function criarPortfolioHtml(d: DadosPortfolio): string {
  const fotos = d.fotos
    .map((f) => `<figure><img src="${f.src}" alt="${esc(f.legenda)}">${f.legenda ? `<figcaption>${esc(f.legenda)}</figcaption>` : ""}</figure>`)
    .join("\n");
  return `<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portefólio de ${esc(d.nome)}</title>
<style>
*{box-sizing:border-box}body{margin:0;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0d1226;background:#fff}
main{max-width:56rem;margin:0 auto;padding:2rem 1.25rem 4rem}
header{display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;padding-bottom:1.5rem;border-bottom:3px solid #233154}
header img{width:7rem;height:7rem;object-fit:cover;border-radius:50%}
h1{margin:0;font-size:2.4rem;line-height:1;text-transform:uppercase;letter-spacing:.01em}
.funcao{margin:.3rem 0 0;color:#4a5578}
.bio{max-width:44rem;margin:1.5rem 0;font-size:1.1rem;white-space:pre-line}
.grelha{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:.75rem}
figure{margin:0;break-inside:avoid}figure img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
figcaption{font-size:.85rem;color:#4a5578;padding-top:.25rem}
footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #ccd;color:#4a5578;font-size:.9rem}
button{margin:0 0 1.5rem;padding:.7rem 1.2rem;font:inherit;font-weight:600;color:#fff;background:#233154;border:0;cursor:pointer}
@media print{button{display:none}main{padding:0}}
</style></head><body><main>
<button type="button" onclick="window.print()">Guardar como PDF</button>
<header>${d.avatar ? `<img src="${d.avatar}" alt="">` : ""}<div><h1>${esc(d.nome)}</h1><p class="funcao">${esc(d.funcao)} · ${esc(d.barbearia)}</p>${d.instagram ? `<p class="funcao">Instagram @${esc(d.instagram)}</p>` : ""}</div></header>
${d.bio ? `<p class="bio">${esc(d.bio)}</p>` : ""}
<section class="grelha" aria-label="Trabalhos">
${fotos}
</section>
<footer>${esc(d.barbearia)}, ${esc(d.morada)}. Portefólio gerado em ${esc(d.geradoEm)}.</footer>
</main></body></html>`;
}
