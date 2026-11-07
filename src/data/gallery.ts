// Galeria: fotografias de trabalhos da barbearia (public/images/fotos). Para trocar ou acrescentar, ver README.md.

import { responsiveImage, type ResponsiveImage } from "../lib/images.ts";

export type GalleryItem = {
  id: "degrade" | "barba" | "textura" | "risco" | "lateral";
  title: string;
  alt: string;
  image: ResponsiveImage;
  demo: boolean;
  /** Texto curto mostrado por baixo da imagem enquanto não for definitiva. */
  nota: string;
  sizes: string;
};

// Fotografias de trabalhos. `autorizada` só deve ser true com autorização do dono, de quem tirou a
// foto e das pessoas retratadas (menores: encarregados de educação). Não foram incluídas as
// fotografias em que os clientes parecem muito jovens.
const fotos: (GalleryItem & { autorizada: boolean })[] = [
  { id: "degrade", title: "Cabelo e barba", alt: "Homem de perfil, com cabelo encaracolado no topo, degradê nas laterais e barba aparada.", image: responsiveImage("/images/fotos/foto-1", [320, 640], { width: 640, height: 640 }), demo: false, nota: "", sizes: "(min-width: 900px) 30vw, 92vw", autorizada: true },
  { id: "barba", title: "Cabelo e barba", alt: "Homem de perfil, com cabelo rapado nas laterais e barba definida.", image: responsiveImage("/images/fotos/foto-2", [320, 640], { width: 640, height: 640 }), demo: false, nota: "", sizes: "(min-width: 900px) 30vw, 80vw", autorizada: true },
  { id: "textura", title: "Cabelo e barba", alt: "Homem de perfil, com degradê e barba cheia.", image: responsiveImage("/images/fotos/foto-3", [320, 640], { width: 640, height: 640 }), demo: false, nota: "", sizes: "(min-width: 900px) 30vw, 92vw", autorizada: true },
  { id: "risco", title: "Cabelo", alt: "Jovem de perfil, com cabelo mais comprido no topo e degradê nas laterais.", image: responsiveImage("/images/fotos/foto-4", [320, 640], { width: 640, height: 640 }), demo: false, nota: "", sizes: "(min-width: 900px) 30vw, 72vw", autorizada: true },
  { id: "lateral", title: "Cabelo", alt: "Cabeça vista de trás, com degradê a subir pela nuca.", image: responsiveImage("/images/fotos/foto-5", [320, 640], { width: 640, height: 640 }), demo: false, nota: "", sizes: "(min-width: 900px) 30vw, 92vw", autorizada: true },
];

export const gallery: GalleryItem[] = fotos.map(({ autorizada: _a, ...f }) => f);
