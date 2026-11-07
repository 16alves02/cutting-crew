import { existsSync, rmSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { hero } from "./src/data/hero.ts";
import { seo } from "./src/data/seo.ts";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Endereço final do site, se o alojamento o der a conhecer (ou se estiver em SITE_URL). */
function siteUrlFrom(env: Record<string, string>): string {
  const bruto =
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    env.URL || // Netlify
    env.CF_PAGES_URL || // Cloudflare Pages
    "";
  return bruto.replace(/\/+$/, "");
}

/**
 * Escreve o <head> (título, descrição, Open Graph, robots, pré-carregamentos) e gera
 * robots.txt, sitemap.xml e _headers. Em modo demonstração o site não é indexável.
 */
function siteMeta(demo: boolean, siteUrl: string): Plugin {
  const textos = demo ? seo.demo : seo.oficial;
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : p);
  let base = "/";
  let isSsr = false;

  return {
    name: "cutting-crew-site-meta",
    configResolved(c) {
      base = c.base;
      isSsr = !!c.build.ssr;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const t: string[] = [];
        t.push(`<title>${esc(textos.title)}</title>`);
        t.push(`<meta name="description" content="${esc(textos.description)}" />`);
        t.push(`<meta name="theme-color" content="${seo.themeColor}" />`);
        if (demo) t.push(`<meta name="robots" content="noindex, nofollow" />`);
        if (siteUrl) t.push(`<link rel="canonical" href="${siteUrl}/" />`);
        t.push(`<meta property="og:type" content="website" />`);
        t.push(`<meta property="og:site_name" content="${esc(seo.siteName)}" />`);
        t.push(`<meta property="og:locale" content="${seo.ogLocale}" />`);
        t.push(`<meta property="og:title" content="${esc(textos.title)}" />`);
        t.push(`<meta property="og:description" content="${esc(textos.description)}" />`);
        if (siteUrl) t.push(`<meta property="og:url" content="${siteUrl}/" />`);
        t.push(`<meta property="og:image" content="${abs(seo.ogImage)}" />`);
        t.push(`<meta property="og:image:width" content="${seo.ogImageWidth}" />`);
        t.push(`<meta property="og:image:height" content="${seo.ogImageHeight}" />`);
        t.push(`<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`);
        t.push(`<meta name="twitter:card" content="summary_large_image" />`);
        t.push(`<meta name="twitter:title" content="${esc(textos.title)}" />`);
        t.push(`<meta name="twitter:description" content="${esc(textos.description)}" />`);
        t.push(`<meta name="twitter:image" content="${abs(seo.ogImage)}" />`);

        // Imagem do hero (maior elemento visível): pré-carregar a versão certa para cada ecrã.
        const bp = hero.breakpoint;
        t.push(
          `<link rel="preload" as="image" href="${hero.wide.src}" imagesrcset="${hero.wide.srcSet}" imagesizes="100vw" media="(min-width: ${bp}px)" fetchpriority="high" />`,
          `<link rel="preload" as="image" href="${hero.tall.src}" imagesrcset="${hero.tall.srcSet}" imagesizes="100vw" media="(max-width: ${bp - 1}px)" fetchpriority="high" />`,
        );

        // Tipos de letra (só existem no build): pré-carregar para evitar saltos de texto.
        if (ctx.bundle) {
          for (const nome of Object.keys(ctx.bundle)) {
            if (nome.endsWith(".woff2")) {
              t.push(`<link rel="preload" as="font" type="font/woff2" href="${base}${nome}" crossorigin />`);
            }
          }
        }
        return html.replace("<!--seo-->", t.join("\n    "));
      },
    },
    // Fotografias sem autorização (public/images/pendentes) nunca vão para a versão oficial.
    closeBundle() {
      if (!demo && !isSsr && existsSync("dist/images/pendentes")) rmSync("dist/images/pendentes", { recursive: true, force: true });
    },
    generateBundle() {
      const robots = demo
        ? "# Demonstração: não indexar.\nUser-agent: *\nDisallow: /\n"
        : `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ""}`;
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });

      if (!demo && siteUrl) {
        const dia = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${dia}</lastmod>\n  </url>\n</urlset>\n`,
        });
      }

      // Cabeçalhos HTTP (Netlify e Cloudflare Pages leem este ficheiro).
      const geral = [
        "  X-Content-Type-Options: nosniff",
        "  Referrer-Policy: strict-origin-when-cross-origin",
        "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
        ...(demo ? ["  X-Robots-Tag: noindex, nofollow"] : []),
      ].join("\n");
      this.emitFile({
        type: "asset",
        fileName: "_headers",
        source: `/*\n${geral}\n/painel*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/images/*\n  Cache-Control: public, max-age=604800\n`,
      });
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const demo = env.VITE_DEMO_MODE !== "false";
  return {
    define: { __ANO_COMPILACAO__: JSON.stringify(new Date().getFullYear()) },
    plugins: [react(), siteMeta(demo, siteUrlFrom(env))],
    // Duas páginas: o site (index.html) e o painel dos barbeiros (painel.html). A compilação SSR usa a sua própria entrada.
    build: isSsrBuild ? {} : { rollupOptions: { input: { main: "index.html", painel: "painel.html" } } },
  };
});
