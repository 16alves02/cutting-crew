import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "../styles/base.css";
import "./painel.css";
import Painel from "./Painel.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Painel />
  </StrictMode>,
);
