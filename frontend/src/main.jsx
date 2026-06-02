import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.jsx";

// Registra el service worker — actualiza automáticamente en segundo plano
registerSW({
  onNeedRefresh() {
    // Si hay una nueva versión disponible, recarga silenciosamente
    window.location.reload();
  },
  onOfflineReady() {
    console.log("ArtistHub listo para usar sin conexión");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
