import { business } from "../data/business.ts";
import { ExtLink } from "./ExtLink.tsx";
import "./booking.css";

export default function BookingCta() {
  return (
    <section className="booking on-dark" id="marcacao" aria-labelledby="marcacao-titulo">
      <div className="container booking__grid">
        <div>
          <h2 className="booking__title" id="marcacao-titulo" lang="en">
            <span>Ready for</span>
            <span>your next</span>
            <span>cut?</span>
          </h2>
          <p className="booking__lead">Escolhe o serviço e a hora no Fresha. A marcação é feita lá.</p>
          <div className="booking__actions">
            <ExtLink className="btn btn--solid btn--lg" href={business.links.fresha}>
              Marcar agora
            </ExtLink>
            <ExtLink className="btn btn--line btn--lg" href={business.links.whatsapp}>
              Falar no WhatsApp
            </ExtLink>
          </div>
        </div>
        <img
          className="booking__emblem"
          src="/images/emblema-340.webp"
          width={340}
          height={340}
          alt="Emblema da CUTTING CREW Barbershop: surpreendendo em todo corte, cuidando de cada detalhe, desde 2016."
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
