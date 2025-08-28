// src/utils/constants.js

// Ambiente
export const APP_NAME =
  import.meta.env.VITE_APP_NAME || "Seccional UF";
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// UI / Tema (verde militar)
export const THEME = {
  primary: import.meta.env.VITE_THEME_PRIMARY || "#2e7d32",
  darkBg: "#0e1a13",
  darkBg2: "#1c3a2a",
  text: "#e7f0ea",
  text2: "#cde7ce",
};

// Paginación por defecto
export const PAGE_SIZE_DEFAULT = 10;
export const PAGE_SIZES = [10, 20, 50];

// Rutas “semánticas” (útil para Nav/Permisos/Tests)
export const ROUTES = {
  home: "/",
  login: "/login",
  perfil: "/perfil",
  admin: "/admin",

  afiliados: "/afiliados",
  afiliadosBuscar: "/afiliados/buscar",
  afiliadoNuevo: "/afiliados/nuevo",
  afiliadoDetalle: (id = ":id") => `/afiliados/${id}`,
  afiliadoEditar: (id = ":id") => `/afiliados/${id}/editar`,

  solicitudes: "/solicitudes",
  reclamos: "/reclamos",
  novedades: "/novedades",
};

// Patrones frecuentes
export const PATTERNS = {
  dni: /^\d{7,9}$/, // tolerante (7–9 dígitos)
  cuit: /^\d{2}-?\d{8}-?\d{1}$/, // 11 dígitos con o sin guiones
  email: /^\S+@\S+\.\S+$/,
  phoneDigits: /^\d{6,15}$/, // sólo dígitos para validación “cruda”
};

// Headers comunes
export const JSON_HEADERS = { "Content-Type": "application/json" };

// Estados genéricos
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Helpers varios
export const BLANK = "—";
