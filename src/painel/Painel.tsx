import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { business } from "../data/business.ts";
import { team } from "../data/team.ts";
import { criarPortfolioHtml } from "../lib/portfolio.ts";

const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const CHAVE = import.meta.env.VITE_SUPABASE_ANON_KEY;
const cliente: SupabaseClient | null = URL_BASE && CHAVE ? createClient(URL_BASE, CHAVE) : null;
const BALDE = "perfis";
const MAX_FOTOS = 24;

type Perfil = {
  id: string;
  member_id: string;
  nome: string | null;
  funcao: string | null;
  bio: string | null;
  instagram: string | null;
  avatar_path: string | null;
};
type Foto = { id: string; path: string; legenda: string | null };

const urlPublica = (path: string) => `${URL_BASE}/storage/v1/object/public/${BALDE}/${path}`;

/** Reduz a imagem (tira também a localização e outros metadados) e converte para WebP. */
async function reduzir(file: File, max: number, quadrado: boolean): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  let sx = 0;
  let sy = 0;
  let sw = bmp.width;
  let sh = bmp.height;
  let w: number;
  let h: number;
  if (quadrado) {
    const lado = Math.min(sw, sh);
    sx = (sw - lado) / 2;
    sy = (sh - lado) / 2;
    sw = sh = lado;
    w = h = Math.min(lado, max);
  } else {
    const k = Math.min(1, max / Math.max(sw, sh));
    w = Math.round(sw * k);
    h = Math.round(sh * k);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
  return new Promise((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error("Não foi possível processar a imagem."))), "image/webp", 0.82),
  );
}

const extensao = (b: Blob) => (b.type === "image/png" ? "png" : b.type === "image/jpeg" ? "jpg" : "webp");

async function paraDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((ok, falha) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => falha(new Error("Falha a ler a imagem."));
    r.readAsDataURL(blob);
  });
}

export default function Painel() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [pronto, setPronto] = useState(false);
  const [recuperar, setRecuperar] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    cliente.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setPronto(true);
    });
    const { data } = cliente.auth.onAuthStateChange((evento, s) => {
      setSessao(s);
      if (evento === "PASSWORD_RECOVERY") setRecuperar(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="painel on-white">
      <header className="painel__topo">
        <a href="/" className="painel__voltar">
          ← Voltar ao site
        </a>
        <h1 className="painel__titulo">Painel dos barbeiros</h1>
      </header>
      <main className="painel__corpo">
        {!cliente ? (
          <p className="painel__aviso" role="status">
            O painel ainda não está ligado a uma base de dados. Quem gere o site tem de seguir a secção “Painel dos
            barbeiros” do README (criar o projeto no Supabase e definir as duas variáveis de ambiente).
          </p>
        ) : !pronto ? (
          <p role="status">A carregar…</p>
        ) : !sessao ? (
          <Entrar cliente={cliente} />
        ) : (
          <Area cliente={cliente} sessao={sessao} recuperar={recuperar} acabouRecuperar={() => setRecuperar(false)} />
        )}
      </main>
    </div>
  );
}

function Entrar({ cliente }: { cliente: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [palavra, setPalavra] = useState("");
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setMsg("");
    const { error } = await cliente.auth.signInWithPassword({ email, password: palavra });
    if (error) setMsg("Email ou palavra-passe incorretos.");
    setOcupado(false);
  }
  async function esqueci() {
    if (!email) return setMsg("Escreve primeiro o teu email.");
    const { error } = await cliente.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/painel` });
    setMsg(error ? "Não foi possível enviar o email." : "Se o email existir, enviámos um link para definires nova palavra-passe.");
  }

  return (
    <form className="painel__cartao painel__entrar" onSubmit={entrar}>
      <h2>Entrar</h2>
      <p className="painel__nota">As contas são criadas pelo responsável da barbearia.</p>
      <label>
        Email
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Palavra-passe
        <input type="password" autoComplete="current-password" required value={palavra} onChange={(e) => setPalavra(e.target.value)} />
      </label>
      <button className="btn btn--solid" type="submit" disabled={ocupado}>
        Entrar
      </button>
      <button className="painel__link" type="button" onClick={esqueci}>
        Esqueci-me da palavra-passe
      </button>
      {msg && (
        <p role="status" className="painel__msg">
          {msg}
        </p>
      )}
    </form>
  );
}

function Area({
  cliente,
  sessao,
  recuperar,
  acabouRecuperar,
}: {
  cliente: SupabaseClient;
  sessao: Session;
  recuperar: boolean;
  acabouRecuperar: () => void;
}) {
  const uid = sessao.user.id;
  const [perfil, setPerfil] = useState<Perfil | null | undefined>(undefined);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [consentimento, setConsentimento] = useState(false);

  const [versao, setVersao] = useState(0);
  const carregar = useCallback(async () => setVersao((v) => v + 1), []);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      cliente.from("profiles").select("*").eq("id", uid).maybeSingle(),
      cliente.from("photos").select("id,path,legenda").eq("profile_id", uid).order("criado_em", { ascending: false }),
    ]).then(([p, f]) => {
      if (!vivo) return;
      setPerfil((p.data as Perfil | null) ?? null);
      setFotos((f.data as Foto[] | null) ?? []);
    });
    return () => {
      vivo = false;
    };
  }, [cliente, uid, versao]);

  const membro = team.find((m) => m.id === perfil?.member_id);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const valor = (k: string) => String(f.get(k) ?? "").trim() || null;
    setOcupado(true);
    const { error } = await cliente
      .from("profiles")
      .update({
        nome: valor("nome"),
        funcao: valor("funcao"),
        bio: valor("bio"),
        instagram: valor("instagram")?.replace(/^@/, "") ?? null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", uid);
    setMsg(error ? `Não foi possível guardar: ${error.message}` : "Perfil guardado. Já aparece no site.");
    setOcupado(false);
    if (!error) await carregar();
  }

  async function trocarRetrato(file: File | undefined) {
    if (!file) return;
    setOcupado(true);
    setMsg("");
    try {
      const blob = await reduzir(file, 340, true);
      const path = `${uid}/retrato-${Date.now()}.${extensao(blob)}`;
      const up = await cliente.storage.from(BALDE).upload(path, blob, { contentType: blob.type });
      if (up.error) throw up.error;
      const antigo = perfil?.avatar_path;
      const { error } = await cliente.from("profiles").update({ avatar_path: path, atualizado_em: new Date().toISOString() }).eq("id", uid);
      if (error) throw error;
      if (antigo) await cliente.storage.from(BALDE).remove([antigo]);
      setMsg("Retrato atualizado.");
      await carregar();
    } catch (e) {
      setMsg(`Não foi possível enviar o retrato: ${(e as Error).message}`);
    }
    setOcupado(false);
  }

  async function enviarFotos(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    if (!consentimento) return setMsg("Confirma primeiro que tens autorização das pessoas que aparecem nas fotos.");
    if (fotos.length + lista.length > MAX_FOTOS) return setMsg(`Podes ter no máximo ${MAX_FOTOS} fotografias.`);
    setOcupado(true);
    setMsg("");
    try {
      for (const file of Array.from(lista)) {
        const blob = await reduzir(file, 1200, false);
        const path = `${uid}/${crypto.randomUUID()}.${extensao(blob)}`;
        const up = await cliente.storage.from(BALDE).upload(path, blob, { contentType: blob.type });
        if (up.error) throw up.error;
        const ins = await cliente.from("photos").insert({ profile_id: uid, path, consentimento: true });
        if (ins.error) {
          await cliente.storage.from(BALDE).remove([path]);
          throw ins.error;
        }
      }
      setMsg("Fotografias publicadas.");
      await carregar();
    } catch (e) {
      setMsg(`Não foi possível enviar: ${(e as Error).message}`);
    }
    setOcupado(false);
  }

  async function apagar(f: Foto) {
    if (!confirm("Apagar esta fotografia do site?")) return;
    setOcupado(true);
    const { error } = await cliente.from("photos").delete().eq("id", f.id);
    if (!error) await cliente.storage.from(BALDE).remove([f.path]);
    setMsg(error ? `Não foi possível apagar: ${error.message}` : "Fotografia apagada.");
    setOcupado(false);
    await carregar();
  }

  async function legenda(f: Foto, texto: string) {
    const novo = texto.trim() || null;
    if (novo === f.legenda) return;
    const { error } = await cliente.from("photos").update({ legenda: novo }).eq("id", f.id);
    setMsg(error ? `Não foi possível guardar a legenda: ${error.message}` : "Legenda guardada.");
    if (!error) await carregar();
  }

  async function descarregar() {
    if (!perfil) return;
    setOcupado(true);
    setMsg("A preparar o portefólio…");
    try {
      const nome = perfil.nome?.trim() || membro?.name || "Barbeiro";
      const html = criarPortfolioHtml({
        nome,
        funcao: perfil.funcao?.trim() || membro?.role || "Barbeiro",
        bio: perfil.bio?.trim() || membro?.bio || "",
        instagram: perfil.instagram ?? "",
        avatar: perfil.avatar_path ? await paraDataUrl(urlPublica(perfil.avatar_path)) : null,
        fotos: await Promise.all(fotos.map(async (f) => ({ src: await paraDataUrl(urlPublica(f.path)), legenda: f.legenda ?? "" }))),
        barbearia: business.fullName,
        morada: `${business.address.street}, ${business.address.postalCode} ${business.address.locality}`,
        geradoEm: new Date().toLocaleDateString("pt-PT"),
      });
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `portefolio-${nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setMsg("Portefólio descarregado. Abre o ficheiro e carrega em “Guardar como PDF” se quiseres um PDF.");
    } catch (e) {
      setMsg(`Não foi possível gerar o portefólio: ${(e as Error).message}`);
    }
    setOcupado(false);
  }

  if (recuperar) return <NovaPalavra cliente={cliente} fechar={acabouRecuperar} />;
  if (perfil === undefined) return <p role="status">A carregar…</p>;
  if (perfil === null)
    return (
      <div className="painel__cartao">
        <p className="painel__aviso">
          A tua conta ({sessao.user.email}) ainda não está ligada a nenhum barbeiro. Fala com o responsável da barbearia.
        </p>
        <button className="btn btn--line" type="button" onClick={() => cliente.auth.signOut()}>
          Sair
        </button>
      </div>
    );

  return (
    <>
      <div className="painel__barra">
        <p>
          Sessão de <strong>{sessao.user.email}</strong>
        </p>
        <button className="btn btn--line btn--sm" type="button" onClick={() => cliente.auth.signOut()}>
          Sair
        </button>
      </div>

      {msg && (
        <p role="status" className="painel__msg painel__msg--topo">
          {msg}
        </p>
      )}

      <section className="painel__cartao" aria-labelledby="p-perfil">
        <h2 id="p-perfil">O teu perfil</h2>
        <p className="painel__nota">O que escreveres aqui aparece no teu painel da secção Equipa do site.</p>
        <div className="painel__retrato">
          {perfil.avatar_path ? (
            <img src={urlPublica(perfil.avatar_path)} alt="O teu retrato atual" width="112" height="112" />
          ) : membro?.photo ? (
            <img src={membro.photo.src} alt="O teu retrato atual" width="112" height="112" />
          ) : (
            <span className="painel__sem-retrato" aria-hidden="true" />
          )}
          <label className="btn btn--line btn--sm">
            Trocar retrato
            <input type="file" accept="image/*" hidden disabled={ocupado} onChange={(e) => trocarRetrato(e.target.files?.[0])} />
          </label>
        </div>
        <form key={perfil.nome + (perfil.bio ?? "")} onSubmit={guardar} className="painel__form">
          <label>
            Nome que aparece no site
            <input name="nome" maxLength={40} defaultValue={perfil.nome ?? membro?.name ?? ""} />
          </label>
          <label>
            Função
            <input name="funcao" maxLength={40} defaultValue={perfil.funcao ?? membro?.role ?? ""} />
          </label>
          <label>
            Instagram (sem o link, só o nome de utilizador)
            <input name="instagram" maxLength={31} pattern="@?[A-Za-z0-9._]{1,30}" defaultValue={perfil.instagram ?? ""} placeholder="@o.teu.instagram" />
          </label>
          <label>
            Biografia (até 600 caracteres)
            <textarea name="bio" rows={5} maxLength={600} defaultValue={perfil.bio ?? membro?.bio ?? ""} />
          </label>
          <button className="btn btn--solid" type="submit" disabled={ocupado}>
            Guardar perfil
          </button>
        </form>
      </section>

      <section className="painel__cartao" aria-labelledby="p-fotos">
        <h2 id="p-fotos">As tuas fotografias</h2>
        <p className="painel__nota">
          Até {MAX_FOTOS} fotografias. Reduzimos o tamanho e retiramos a localização automaticamente. Tens {fotos.length}.
        </p>
        <label className="painel__consent">
          <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} />
          Tenho autorização das pessoas que aparecem nas fotografias para as publicar.
        </label>
        <label className="btn btn--solid btn--sm">
          Adicionar fotografias
          <input type="file" accept="image/*" multiple hidden disabled={ocupado} onChange={(e) => { void enviarFotos(e.target.files); e.target.value = ""; }} />
        </label>
        {fotos.length > 0 && (
          <ul className="painel__grelha">
            {fotos.map((f) => (
              <li key={f.id}>
                <img src={urlPublica(f.path)} alt={f.legenda ?? "Fotografia publicada"} loading="lazy" width="240" height="240" />
                <input
                  aria-label="Legenda da fotografia"
                  maxLength={120}
                  placeholder="Legenda (opcional)"
                  defaultValue={f.legenda ?? ""}
                  onBlur={(e) => legenda(f, e.target.value)}
                />
                <button className="painel__link" type="button" onClick={() => apagar(f)} disabled={ocupado}>
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="painel__cartao" aria-labelledby="p-port">
        <h2 id="p-port">O teu portefólio</h2>
        <p className="painel__nota">
          Descarrega um ficheiro com o teu perfil e as tuas fotografias. É teu: serve para mostrares o teu trabalho em qualquer outro sítio.
        </p>
        <button className="btn btn--solid" type="button" onClick={descarregar} disabled={ocupado}>
          Descarregar portefólio
        </button>
      </section>

      <NovaPalavra cliente={cliente} compacto />
    </>
  );
}

function NovaPalavra({ cliente, fechar, compacto }: { cliente: SupabaseClient; fechar?: () => void; compacto?: boolean }) {
  const [palavra, setPalavra] = useState("");
  const [msg, setMsg] = useState("");
  async function guardar(e: FormEvent) {
    e.preventDefault();
    const { error } = await cliente.auth.updateUser({ password: palavra });
    setMsg(error ? `Não foi possível alterar: ${error.message}` : "Palavra-passe alterada.");
    if (!error) {
      setPalavra("");
      fechar?.();
    }
  }
  return (
    <form className="painel__cartao" onSubmit={guardar} aria-label="Alterar palavra-passe">
      <h2>{compacto ? "Alterar palavra-passe" : "Define a nova palavra-passe"}</h2>
      <label>
        Nova palavra-passe (mínimo 8 caracteres)
        <input type="password" autoComplete="new-password" minLength={8} required value={palavra} onChange={(e) => setPalavra(e.target.value)} />
      </label>
      <button className="btn btn--line btn--sm" type="submit">
        Guardar palavra-passe
      </button>
      {msg && <p role="status" className="painel__msg">{msg}</p>}
    </form>
  );
}
