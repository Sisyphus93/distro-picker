import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { assertDomainIntegrity } from "./domain/integrity";
import "./style.css";

// Curated data is hand-maintained; fail loudly in development if it drifts.
if (import.meta.env.DEV) {
  assertDomainIntegrity();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
