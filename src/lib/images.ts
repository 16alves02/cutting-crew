// Ajudante para imagens responsivas. Sem dependências do DOM: é usado também
// pelo vite.config.ts (para pré-carregar a imagem do hero).

export type ResponsiveImage = {
  /** Ficheiro por omissão (o do meio, para telemóveis e portáteis). */
  src: string;
  /** Lista "ficheiro largura" para o atributo srcset. */
  srcSet: string;
  /** Dimensões do ficheiro maior: só servem para reservar espaço (evita saltos de layout). */
  width: number;
  height: number;
};

/**
 * Constrói uma imagem responsiva a partir de ficheiros com o padrão
 * `<base>-<largura>.<ext>`, por exemplo `/images/g-barba-800.webp`.
 */
export function responsiveImage(
  base: string,
  widths: number[],
  size: { width: number; height: number },
  ext = "webp",
): ResponsiveImage {
  const ordenadas = [...widths].sort((a, b) => a - b);
  const meio = ordenadas[Math.floor((ordenadas.length - 1) / 2)];
  return {
    src: `${base}-${meio}.${ext}`,
    srcSet: ordenadas.map((w) => `${base}-${w}.${ext} ${w}w`).join(", "),
    width: size.width,
    height: size.height,
  };
}

/** Imagem única (por exemplo uma fotografia já otimizada, sem versões). */
export function singleImage(
  src: string,
  size: { width: number; height: number },
): ResponsiveImage {
  return { src, srcSet: "", width: size.width, height: size.height };
}
