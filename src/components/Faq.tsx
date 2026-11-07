import { business } from "../data/business.ts";
import { ExtLink } from "./ExtLink.tsx";
import "./faq.css";

// Respostas só com informação que já consta no site (Fresha, Linktree). Nada de políticas inventadas.
export default function Faq() {
  const { address, links, hoursSummary } = business;
  return (
    <section className="faq on-white" id="perguntas" aria-labelledby="perguntas-titulo">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title" id="perguntas-titulo">
            Perguntas
          </h2>
          <p className="section-lead">As dúvidas mais comuns, com respostas rápidas.</p>
        </div>

        <ul className="faq__list">
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Como marco o meu horário?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>
                  A marcação é online, no Fresha. Carrega em “Marcar agora”, escolhe o serviço, o dia e a hora. Também
                  podes escolher o barbeiro na secção Equipa e marcar diretamente com ele.
                </p>
                <ExtLink className="btn btn--solid btn--sm" href={links.fresha}>
                  Marcar agora
                </ExtLink>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Qual é o horário?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>
                  {hoursSummary}. Fechado à segunda-feira e ao domingo.
                </p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Onde fica a barbearia?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>
                  {address.street}, {address.postalCode} {address.locality}, {address.region}. Em baixo, na secção
                  Localização, tens o mapa e as ligações para o Google Maps e o Waze.
                </p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Quanto custa?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>
                  Os preços de todos os serviços estão na secção Serviços. As madeixas têm o valor definido mediante
                  avaliação.
                </p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Posso escolher o barbeiro?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>
                  Sim. Cada barbeiro tem a sua ligação de marcação na secção Equipa, e no perfil dele no Fresha
                  encontras o portefólio e as avaliações.
                </p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Posso ir sem marcação?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>Depende da disponibilidade do momento. Se houver vaga, tentamos sempre arranjar maneira de te atender. Para teres a hora garantida, marca online.</p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                E se eu me atrasar ou não puder vir?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>Avisa-nos com antecedência, pelo WhatsApp ou pelo Instagram, para podermos dar o horário a outra pessoa.</p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Cortam cabelo a crianças?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>Sim, e o preço é o mesmo da tabela de serviços.</p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Quais são as formas de pagamento?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>Aceitamos todas as formas de pagamento.</p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Há estacionamento perto?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>Sim, há estacionamento perto da barbearia.</p>
              </div>
            </details>
          </li>
          <li className="faq__item">
            <details>
              <summary className="faq__q">
                Tenho uma dúvida antes de marcar. Com quem falo?
                <span className="roster__icon" aria-hidden="true" />
              </summary>
              <div className="faq__a">
                <p>Podes falar connosco no WhatsApp ou enviar mensagem no Instagram.</p>
                <div className="faq__links">
                  <ExtLink className="text-link" href={links.whatsapp}>
                    WhatsApp
                  </ExtLink>
                  <ExtLink className="text-link" href={links.instagram}>
                    Instagram
                  </ExtLink>
                </div>
              </div>
            </details>
          </li>
        </ul>
      </div>
    </section>
  );
}
