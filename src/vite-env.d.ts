/// <reference types="vite/client" />

/** Ano de compilação, definido em vite.config.ts. */
declare const __ANO_COMPILACAO__: number;

interface ImportMetaEnv {
  /** Endereço do projeto Supabase (painel dos barbeiros). Opcional. */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave pública "anon" do Supabase (pode ficar no site; a segurança está nas regras RLS). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
