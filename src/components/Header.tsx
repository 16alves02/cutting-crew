import { useEffect, useRef, useState } from "react";
import { business } from "../data/business.ts";
import { navLinks } from "../data/navigation.ts";
import { ExtLink } from "./ExtLink.tsx";
import "./header.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Com o menu aberto: o resto da página fica inerte (sem foco), o fundo não se mexe,
  // Escape fecha e o menu fecha sozinho se o ecrã passar a largo.
  useEffect(() => {
    if (!open) return;
    const resto = document.querySelectorAll<HTMLElement>("main, footer");
    resto.forEach((el) => el.setAttribute("inert", ""));
    document.documentElement.classList.add("menu-aberto");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 900px)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      resto.forEach((el) => el.removeAttribute("inert"));
      document.documentElement.classList.remove("menu-aberto");
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <header className="site-header on-dark" data-solid={scrolled || open}>
      <div className="site-header__bar">
        <a className="wordmark" href="#top" onClick={close} aria-label="CUTTING CREW Barbershop, início">
          <img
            src="/images/logo-240.webp"
            srcSet="/images/logo-240.webp 240w, /images/logo-480.webp 480w"
            sizes="(min-width: 900px) 11rem, 8.5rem"
            width={480}
            height={166}
            alt=""
          />
        </a>

        <nav className="site-header__nav" aria-label="Principal">
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <ExtLink className="btn btn--solid btn--sm" href={business.links.fresha}>
            Marcar agora
          </ExtLink>
          <button
            ref={toggleRef}
            type="button"
            className="burger"
            aria-expanded={open}
            aria-controls="menu-movel"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
            <span className="burger__lines" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="menu-movel" className="menu" data-open={open} inert={!open}>
        <nav aria-label="Menu móvel">
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={close}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu__foot">
          <ExtLink className="btn btn--solid btn--lg" href={business.links.fresha} onClick={close}>
            Marcar agora
          </ExtLink>
          <p>
            {business.address.street}, {business.address.locality}
          </p>
        </div>
      </div>
    </header>
  );
}
