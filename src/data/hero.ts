// Imagem de fundo do hero: fotografia real da montra da barbearia (o logótipo na vitrine).

import { responsiveImage } from "../lib/images.ts";

const montra = responsiveImage("/images/fotos/janela", [720, 1440], { width: 1440, height: 1795 });

export const hero = {
  wide: montra,
  tall: montra,
  alt: "Montra da CUTTING CREW Barbershop, com o logótipo e a frase “Surpreendendo em todo corte, cuidando de cada detalhe”.",
  breakpoint: 760,
} as const;
