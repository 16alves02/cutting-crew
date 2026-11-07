import { business, mapsLinks } from "../data/business.ts";
import { ExtLink } from "./ExtLink.tsx";
import { MapEmbed } from "./MapEmbed.tsx";
import "./location.css";

export default function Location() {
  const a = business.address;
  return (
    <section className="location on-light" id="localizacao" aria-labelledby="localizacao-titulo">
      <div className="container">
        <h2 className="section-title" id="localizacao-titulo">
          Localização
        </h2>

        <div className="location__grid">
          <div className="location__info">
            <address className="location__address">
              <span>{a.street}</span>
              <span>
                {a.postalCode} {a.locality}, {a.region}
              </span>
            </address>

            <div className="location__actions">
              <ExtLink className="btn btn--solid" href={mapsLinks.google}>
                Como chegar
              </ExtLink>
              <ExtLink className="btn btn--line" href={mapsLinks.waze}>
                Waze
              </ExtLink>
            </div>

            <h3 className="location__sub">Horário</h3>
            <dl className="hours">
              {business.hours.map((h) => (
                <div key={h.days} className="hours__row">
                  <dt>{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>

            <h3 className="location__sub">Contactos</h3>
            <ul className="contacts">
              <li>
                <ExtLink className="text-link" href={business.links.whatsapp}>
                  WhatsApp
                </ExtLink>
              </li>
              <li>
                <ExtLink className="text-link" href={business.links.instagram}>
                  Instagram {business.handles.instagram}
                </ExtLink>
              </li>
              <li>
                <ExtLink className="text-link" href={business.links.tiktok}>
                  TikTok {business.handles.tiktok}
                </ExtLink>
              </li>
            </ul>
          </div>

          <MapEmbed />
        </div>
      </div>
    </section>
  );
}
