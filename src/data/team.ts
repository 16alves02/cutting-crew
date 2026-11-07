// Equipa. Nomes de exibição como a barbearia os quer mostrar (indicados pelo programador em
// 26/10/2026, iguais aos do Fresha): Almeida, Rúben, Hiago, Cutting Gu. Todos barbeiros.
// As ligações de marcação por barbeiro e os perfis vêm dos perfis públicos do Fresha.
// `bio` só existe onde o próprio barbeiro a escreveu no seu perfil do Fresha.
// Fotografias (public/images/equipa): Almeida, Rúben e Hiago com a foto indicada pelo programador;
// o Cutting Gu usa o emblema da barbearia até haver uma foto dele.

import { responsiveImage, type ResponsiveImage } from "../lib/images.ts";

const foto = (id: string) => responsiveImage(`/images/equipa/${id}`, [170, 340], { width: 340, height: 340 });

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Texto de apresentação, escrito pelo próprio no Fresha. */
  bio?: string;
  /** Marcar diretamente com este barbeiro. */
  bookingUrl: string;
  /** Perfil público no Fresha (portefólio e avaliações). */
  profileUrl: string;
  photo?: ResponsiveImage;
  photoAlt?: string;
};

const SALAO = "https://www.fresha.com/pt-PT/a/cutting-crew-barbershop-aveiro-rua-nucleo-de-atletismo-de-cucujaes-127-sme9odid";
const marcar = (employeeId: number, perfil: string) =>
  `${SALAO}/booking?employeeId=${employeeId}&entryPoint=professional_profile_book_now&back=/p/${perfil}`;
const perfil = (slug: string) => `https://www.fresha.com/pt-PT/p/${slug}`;

export const team: TeamMember[] = [
  {
    id: "almeida",
    photo: foto("almeida"),
    photoAlt: "Retrato de Almeida",
    name: "Almeida",
    role: "Barbeiro",
    bio: "Cada corte é uma oportunidade de fazer melhor que o anterior. Marca o teu horário e vem ver.",
    bookingUrl: marcar(5240034, "ruben-almeida-6303387"),
    profileUrl: perfil("ruben-almeida-6303387"),
  },
  {
    id: "ruben",
    photo: foto("ruben"),
    photoAlt: "Retrato de Rúben",
    name: "Rúben",
    role: "Barbeiro",
    bio: "Atenção ao detalhe, do primeiro ao último passo da máquina. Marca o teu horário.",
    bookingUrl: marcar(3478445, "ruben-teixeira-4492949"),
    profileUrl: perfil("ruben-teixeira-4492949"),
  },
  {
    id: "hiago",
    photo: foto("hiago"),
    photoAlt: "Retrato de Hiago",
    name: "Hiago",
    role: "Barbeiro",
    bio: "Confiança também se corta. Marca o teu horário e sai daqui a sentir-te no teu melhor.",
    bookingUrl: marcar(3330760, "hiago-barber-4120484"),
    profileUrl: perfil("hiago-barber-4120484"),
  },
  {
    id: "cutting-gu",
    photo: foto("cutting-gu"),
    photoAlt: "Emblema da CUTTING CREW Barbershop",
    name: "Cutting Gu",
    role: "Barbeiro",
    bio: "Barbeiro com 10 anos de experiência, especializado em cortes modernos, visagismo, barbas e sobrancelhas. Ao longo dos anos, desenvolvi um trabalho focado em técnica, precisão e personalização, procurando valorizar o estilo e a identidade de cada cliente. Atualmente em Cucujães, Portugal. Marca o teu horário e vem conhecer o meu trabalho.",
    bookingUrl: marcar(3172699, "cutting-crew-barbershop-4247178"),
    profileUrl: perfil("cutting-crew-barbershop-4247178"),
  },
];
