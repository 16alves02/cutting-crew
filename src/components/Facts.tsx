import { services } from "../data/services.ts";
import { team } from "../data/team.ts";
import "./facts.css";

// Só números que já estão no site: equipa e serviços vêm dos dados, o horário do Fresha
// e o ano que consta no emblema da barbearia ("Des. 2016").
const facts = [
  { value: String(team.length), label: "Barbeiros na equipa" },
  { value: String(services.length), label: "Serviços e combinações" },
  { value: "Desde 2016", label: "como está no emblema da barbearia" },
  { value: "Ter–Sáb", label: "Aberto das 09:00 às 20:00" },
];

export default function Facts() {
  return (
    <section className="facts on-white" aria-label="A CUTTING CREW em números">
      <div className="container">
        <dl className="facts__list">
          {facts.map((f) => (
            <div key={f.label} className="facts__item">
              <dt className="facts__label">{f.label}</dt>
              <dd className="facts__value">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
