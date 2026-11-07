import { business } from "../data/business.ts";
import { hero } from "../data/hero.ts";
import { ExtLink } from "./ExtLink.tsx";
import "./hero.css";

export default function Hero() {
  return (
    <section className="hero on-dark" id="top" aria-label="Início">
      <div className="hero__art" aria-hidden={hero.alt ? undefined : true}>
        <picture>
          <source
            media={`(min-width: ${hero.breakpoint}px)`}
            srcSet={hero.wide.srcSet}
            sizes="100vw"
            width={hero.wide.width}
            height={hero.wide.height}
          />
          <img
            src={hero.tall.src}
            srcSet={hero.tall.srcSet}
            sizes="100vw"
            width={hero.tall.width}
            height={hero.tall.height}
            alt={hero.alt}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="hero__veil" />
      </div>

      <div className="hero__reveal">
        <div className="container hero__content">
          <h1 className="hero__title" lang="en">
            <span className="hero__line">Your style.</span>
            <span className="hero__line">Your crew.</span>
          </h1>

          <div className="hero__text">
            <p className="hero__lead">Mais do que um corte. A tua identidade.</p>
            <p className="hero__meta">
              Barbearia em {business.address.locality}, {business.address.region}. {business.hoursSummary}.
            </p>
            <div className="hero__actions">
              <ExtLink className="btn btn--solid btn--lg" href={business.links.fresha}>
                Marcar agora
              </ExtLink>
              <a className="btn btn--line btn--lg" href="#servicos">
                Ver serviços
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
