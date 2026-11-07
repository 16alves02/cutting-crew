import { business } from "../data/business.ts";
import { useTeam } from "../lib/useTeam.ts";
import { ExtLink } from "./ExtLink.tsx";
import { SmartImage } from "./SmartImage.tsx";
import "./team.css";

export default function Team() {
  const team = useTeam();
  return (
    <section className="team on-white" id="equipa" aria-labelledby="equipa-titulo">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title" id="equipa-titulo">
            Equipa
          </h2>
          <p className="section-lead">
            A CUTTING CREW conta hoje com uma equipa de 4 profissionais dedicados à barbearia. Escolhe um barbeiro para o
            conhecer ou marcar diretamente com ele.
          </p>
        </div>

        <ul className="roster">
          {team.map((m) => (
            <li key={m.id} className="roster__item">
              <details className="roster__details">
                <summary className="roster__summary">
                  {m.photo && (
                    <SmartImage image={m.photo} alt={m.photoAlt ?? ""} sizes="96px" className="roster__photo" />
                  )}
                  <span className="roster__name">{m.name}</span>
                  <span className="roster__role">{m.role}</span>
                  <span className="roster__icon" aria-hidden="true" />
                </summary>
                <div className="roster__panel">
                  {m.bio && <p className="roster__bio">{m.bio}</p>}
                  {m.fotos.length > 0 && (
                    <ul className="roster__fotos" aria-label={`Fotografias de ${m.name}`}>
                      {m.fotos.map((f) => (
                        <li key={f.id}>
                          <a href={f.url} target="_blank" rel="noopener noreferrer">
                            <img src={f.url} alt={f.alt} loading="lazy" decoding="async" width="240" height="240" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="roster__actions">
                    <ExtLink className="btn btn--solid btn--sm" href={m.bookingUrl}>
                      Marcar com {m.name}
                    </ExtLink>
                    <ExtLink className="text-link" href={m.profileUrl}>
                      Ver perfil no Fresha
                    </ExtLink>
                    {m.instagram && (
                      <ExtLink className="text-link" href={`https://www.instagram.com/${m.instagram}/`}>
                        Instagram @{m.instagram}
                      </ExtLink>
                    )}
                  </div>
                  <p className="roster__hint">No perfil do Fresha encontras o portefólio e as avaliações.</p>
                </div>
              </details>
            </li>
          ))}
        </ul>

        <p className="team__reviews">
          <ExtLink className="text-link" href={business.links.freshaPt}>
            Ver as avaliações da barbearia no Fresha
          </ExtLink>
        </p>
      </div>
    </section>
  );
}
