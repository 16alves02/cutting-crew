// Leitura pública dos perfis dos barbeiros (Supabase). Usa fetch simples para não pesar no site.
// Sem as variáveis de ambiente, nada é pedido e o site mostra os dados de src/data/team.ts.

const URL_BASE = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, "");
const CHAVE = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const backendConfigurado = Boolean(URL_BASE && CHAVE);

export type FotoRemota = { id: string; path: string; legenda: string | null };
export type PerfilRemoto = {
  member_id: string;
  nome: string | null;
  funcao: string | null;
  bio: string | null;
  instagram: string | null;
  avatar_path: string | null;
  photos: FotoRemota[];
};

export const urlPublica = (path: string) => `${URL_BASE}/storage/v1/object/public/perfis/${path}`;

export async function carregarPerfis(): Promise<PerfilRemoto[]> {
  if (!URL_BASE || !CHAVE) return [];
  const campos = "member_id,nome,funcao,bio,instagram,avatar_path,photos(id,path,legenda)";
  const res = await fetch(`${URL_BASE}/rest/v1/profiles?select=${campos}&photos.order=criado_em.desc`, {
    headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` },
  });
  if (!res.ok) throw new Error(`Perfis: ${res.status}`);
  return (await res.json()) as PerfilRemoto[];
}
