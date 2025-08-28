// src/main.jsx
import React, { startTransition } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App";
import AppProviders from "@/app/providers/AppProviders";

// === MUI ===
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";

// ========= Preboot: tema y preferencias del usuario =========
(() => {
  try {
    const LS_THEME_KEY = "app_theme"; // "system" | "light" | "dark"

    const applyTheme = (mode) => {
      const html = document.documentElement;
      html.setAttribute("data-theme", mode);
      html.style.colorScheme = mode === "dark" ? "dark" : "light";
    };

    const prefersDarkMql =
      window.matchMedia?.("(prefers-color-scheme: dark)") ?? { matches: false };

    const resolveTheme = () => {
      const saved = localStorage.getItem(LS_THEME_KEY) || "system";
      return saved === "system" ? (prefersDarkMql.matches ? "dark" : "light") : saved;
    };

    // Primera aplicación (evita FOUC)
    applyTheme(resolveTheme());

    const onSystemChange = () => {
      if ((localStorage.getItem(LS_THEME_KEY) || "system") === "system") {
        applyTheme(resolveTheme());
      }
    };

    // Compatibilidad addEventListener / addListener
    if (prefersDarkMql.addEventListener) {
      prefersDarkMql.addEventListener("change", onSystemChange);
    } else if (prefersDarkMql.addListener) {
      prefersDarkMql.addListener(onSystemChange);
    }

    const onStorage = (e) => {
      if (e.key === LS_THEME_KEY) applyTheme(resolveTheme());
    };
    window.addEventListener("storage", onStorage);

    // Reduced motion
    const reduceMql =
      window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? { matches: false };
    document.documentElement.toggleAttribute("data-reduce-motion", !!reduceMql.matches);

    const cleanup = () => {
      if (prefersDarkMql.removeEventListener) {
        prefersDarkMql.removeEventListener("change", onSystemChange);
      } else if (prefersDarkMql.removeListener) {
        prefersDarkMql.removeListener(onSystemChange);
      }
      window.removeEventListener("storage", onStorage);
    };

    window.addEventListener("beforeunload", cleanup);

    // Limpieza en HMR
    if (import.meta?.hot) {
      import.meta.hot.dispose(() => cleanup());
    }
  } catch {
    // no-op
  }
})();

// ========= Estilos globales =========
import "@/styles/variables.css";
import "@/styles/globals.css";
import "@/styles/utilities.css";

// ========= Root container =========
const container =
  document.getElementById("root") ??
  (() => {
    const el = document.createElement("div");
    el.id = "root";
    document.body.appendChild(el);
    return el;
  })();

const root = createRoot(container);

// ========= Render =========
startTransition(() => {
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProviders>
          <App />
        </AppProviders>
      </ThemeProvider>
    </React.StrictMode>
  );
});

// ========= Marca de app lista =========
document.documentElement.setAttribute("data-app-ready", "true");
container.removeAttribute?.("hidden");

// Soporte HMR para desmontar limpio
if (import.meta?.hot) {
  import.meta.hot.dispose(() => {
    try {
      root.unmount();
    } catch {
      /* no-op */
    }
  });
}
