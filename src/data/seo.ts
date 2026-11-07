// Textos de SEO e de partilha. Ficheiro sem dependências do DOM: é lido pelo
// vite.config.ts para escrever o <head> do HTML, o robots.txt e o sitemap.

export const seo = {
  siteName: "CUTTING CREW Barbershop",
  lang: "pt-PT",
  ogLocale: "pt_PT",
  themeColor: "#233154",
  ogImage: "/og-image.jpg",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt:
    "Logótipo da CUTTING CREW Barbershop, em branco sobre fundo azul-marinho.",

  // Versão de demonstração (por omissão).
  demo: {
    title: "CUTTING CREW Barbershop | Proposta de website",
    description:
      "Proposta de website para a CUTTING CREW Barbershop, em Cucujães, Aveiro. Serviços, preços e marcação através do Fresha.",
  },

  // Versão oficial (npm run build:oficial).
  oficial: {
    title: "CUTTING CREW Barbershop | Barbearia em Cucujães, Aveiro",
    description:
      "Barbearia CUTTING CREW em Cucujães, Aveiro. Vê os serviços e preços de cabelo, barba e sobrancelha e marca o teu corte no Fresha.",
  },
} as const;
