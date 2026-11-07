import { gallery } from "../data/gallery.ts";
import { SmartImage } from "./SmartImage.tsx";
import "./gallery.css";

export default function Gallery() {
  return (
    <section className="gallery on-dark" id="galeria" aria-labelledby="galeria-titulo">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title" id="galeria-titulo">
            Galeria
          </h2>
          <p className="section-lead">Alguns trabalhos feitos na CUTTING CREW.</p>
        </div>

        <div className="gallery__grid gallery__grid--fotos">
          {gallery.map((g) => (
            <figure key={g.id} className={`gallery__item gallery__item--${g.id}`}>
              <div className="gallery__frame" style={{ aspectRatio: `${g.image.width} / ${g.image.height}` }}>
                <SmartImage image={g.image} alt={g.alt} sizes={g.sizes} />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
