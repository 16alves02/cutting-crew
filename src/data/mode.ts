// Modo de demonstração.
//
// `npm run build`         -> demonstração (por omissão): aviso no rodapé, não indexável.
// `npm run build:oficial` -> versão oficial: usa o ficheiro .env.oficial (VITE_DEMO_MODE=false).
//
// Só se deve usar a versão oficial depois de o responsável pela CUTTING CREW
// autorizar a publicação e de os conteúdos de CONTEUDOS_POR_CONFIRMAR.md estarem validados.
export const isDemo: boolean = import.meta.env.VITE_DEMO_MODE !== "false";
