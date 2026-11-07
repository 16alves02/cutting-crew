import { useEffect, useMemo, useState } from "react";
import { singleImage, type ResponsiveImage } from "./images.ts";
import { backendConfigurado, carregarPerfis, urlPublica, type PerfilRemoto } from "./perfis.ts";
import { team, type TeamMember } from "../data/team.ts";

export type FotoMembro = { id: string; url: string; alt: string };
export type MembroVisto = TeamMember & { instagram?: string; fotos: FotoMembro[]; photo?: ResponsiveImage };

const texto = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

function juntar(m: TeamMember, r?: PerfilRemoto): MembroVisto {
  if (!r) return { ...m, fotos: [] };
  const nome = texto(r.nome) ?? m.name;
  return {
    ...m,
    name: nome,
    role: texto(r.funcao) ?? m.role,
    bio: texto(r.bio) ?? m.bio,
    instagram: texto(r.instagram),
    photo: r.avatar_path ? singleImage(urlPublica(r.avatar_path), { width: 340, height: 340 }) : m.photo,
    photoAlt: r.avatar_path ? `Retrato de ${nome}` : m.photoAlt,
    fotos: r.photos.map((f) => ({ id: f.id, url: urlPublica(f.path), alt: texto(f.legenda) ?? `Trabalho de ${nome}` })),
  };
}

/** Equipa do site: dados fixos + o que cada barbeiro personalizou no painel (se o backend estiver ligado). */
export function useTeam(): MembroVisto[] {
  const [remotos, setRemotos] = useState<PerfilRemoto[]>([]);
  useEffect(() => {
    if (!backendConfigurado) return;
    let vivo = true;
    carregarPerfis()
      .then((r) => vivo && setRemotos(r))
      .catch(() => {}); // sem rede ou sem backend: fica o conteúdo fixo
    return () => {
      vivo = false;
    };
  }, []);
  return useMemo(() => team.map((m) => juntar(m, remotos.find((r) => r.member_id === m.id))), [remotos]);
}
