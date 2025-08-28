// vite.config.js
// @ts-check
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/** Lee y castea variables .env con prefijo VITE_ */
function readEnv(mode) {
  const raw = loadEnv(mode, process.cwd(), "");
  const get = (k, def) => (raw[k] ?? def);
  // URLs
  const API_URL = get("VITE_API_URL", "http://localhost:5000/api");
  // Acepta API_URL sin /api: derivamos origen siempre
  let API_ORIGIN = "http://localhost:5000";
  try { API_ORIGIN = new URL(API_URL).origin; } catch {}
  return {
    VITE_API_URL: API_URL,
    API_ORIGIN,
    VITE_SUPABASE_URL: get("VITE_SUPABASE_URL", ""),
    VITE_SUPABASE_ANON_KEY: get("VITE_SUPABASE_ANON_KEY", ""),
    VITE_APP_NAME: get("VITE_APP_NAME", "Seccional UF"),
    VITE_APP_ENV: get("VITE_APP_ENV", mode),
  };
}

export default defineConfig(({ mode }) => {
  const env = readEnv(mode);
  const isProd = mode === "production";

  // Pequeña validación útil en dev
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
      "[vite] Faltan variables de Supabase: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY"
    );
  }

  return {
    plugins: [
      react({
        fastRefresh: true,
        jsxImportSource: "react",
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "~": path.resolve(__dirname),
      },
    },

    server: {
      host: true,
      port: 5173,
      open: true,
      cors: true,
      hmr: { overlay: true },
      proxy: {
        // API Flask → forward 1:1 (evita CORS en dev)
        "/api": {
          target: env.API_ORIGIN,
          changeOrigin: true,
          secure: false,
          // deja la ruta tal cual ("/api/...") hacia el backend
          rewrite: (p) => p,
        },
        "/uploads": {
          target: env.API_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      target: "es2020",
      outDir: "dist",
      assetsDir: "assets",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 900,
      sourcemap: false, // en prod apagado para menor peso
      rollupOptions: {
        output: {
          // Split por paquetes más usados
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-router")) return "react";
              if (id.includes("@supabase")) return "supabase";
              return "vendor";
            }
          },
        },
      },
    },

    preview: {
      port: 4173,
      open: true,
      proxy: {
        "/api": {
          target: env.API_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: env.API_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "zustand",
        "@supabase/supabase-js",
      ],
      esbuildOptions: {
        target: "es2020",
      },
    },

    css: {
      devSourcemap: !isProd,
      modules: { localsConvention: "camelCaseOnly" },
    },

    // Definiciones globales disponibles en runtime (no sensibles)
    define: {
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      // Si querés leerlas como constantes globales además de import.meta.env:
      __SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __SUPABASE_ANON__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },

    // Minificación/stripping extra para prod (opcional)
    esbuild: isProd
      ? {
          // Quita logs ruidosos en prod; deja warn/error
          drop: ["console", "debugger"],
          // Si querés conservar console.error:
          // pure: ["console.debug","console.info","console.log"],
        }
      : undefined,
  };
});
