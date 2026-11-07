import { useSyncExternalStore } from "react";
import { business } from "../data/business.ts";
import { isDemo } from "../data/mode.ts";
import { navLinks } from "../data/navigation.ts";
import { ExtLink } from "./ExtLink.tsx";
import "./footer.css";

// Ano em que o site foi compilado (igual no HTML pré-renderizado e na hidratação, sem avisos).
// Depois de carregar, o navegador passa para o ano atual: o © atualiza-se sozinho, sem novo deploy.
const ANO_COMPILACAO = __ANO_COMPILACAO__;

const semSubscricao = () => () => {};
const anoAtual = () => new Date().getFullYear();

export default function Footer() {
  const ano = useSyncExternalStore(semSubscricao, anoAtual, () => ANO_COMPILACAO);
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="site-footer__grid">
          <p className="site-footer__tagline">{business.tagline}</p>

          <nav aria-label="Secções">
            <p className="site-footer__title">Secções</p>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Marcações e redes">
            <p className="site-footer__title">Marcações e redes</p>
            <ul>
              <li>
                <ExtLink href={business.links.fresha}>Fresha</ExtLink>
              </li>
              <li>
                <ExtLink href={business.links.whatsapp}>WhatsApp</ExtLink>
              </li>
              <li>
                <ExtLink href={business.links.instagram}>Instagram</ExtLink>
              </li>
              <li>
                <ExtLink href={business.links.tiktok}>TikTok</ExtLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="site-footer__mark">
          <img
            src="/images/logo-480.webp"
            srcSet="/images/logo-240.webp 240w, /images/logo-480.webp 480w"
            sizes="(min-width: 900px) 480px, 70vw"
            width={480}
            height={166}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>

        <p className="site-footer__legal">
          © <span data-testid="ano">{ano}</span> {business.copyrightHolder}.{" "}
          {isDemo
            ? "Website de demonstração, não oficial. O nome, a morada, os preços e os contactos pertencem à barbearia e foram retirados de páginas públicas (Fresha, Linktree e Instagram)."
            : "Todos os direitos reservados."}
        </p>
      </div>
    </footer>
  );
}
