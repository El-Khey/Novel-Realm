import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth/AuthProvider.tsx";
import { initAccent } from "./features/profile/accent";
import "./index.css";

// Applique l'accent mémorisé avant le premier rendu (évite un flash cramoisi).
initAccent();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);