// src/utils/formatters.js
import { BLANK } from "./constants";

/** Locales por defecto */
const LOCALE = "es-AR";

/** Capitaliza cada palabra (con soporte a acentos) */
export function titleCase(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase())
    .trim();
}

/** Trunca con puntos suspensivos si supera max */
export function truncate(str = "", max = 80) {
  const s = String(str);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/** Formatea número */
export function formatNumber(n, { minimumFractionDigits = 0, maximumFractionDigits = 0 } = {}) {
  if (n === null || n === undefined || n === "") return BLANK;
  const value = Number(n);
  if (Number.isNaN(value)) return String(n);
  return new Intl.NumberFormat(LOCALE, { minimumFractionDigits, maximumFractionDigits }).format(value);
}

/** Moneda (ARS por defecto) */
export function formatCurrency(n, currency = "ARS") {
  if (n === null || n === undefined || n === "") return BLANK;
  const value = Number(n);
  if (Number.isNaN(value)) return String(n);
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

/** Fecha local corta */
export function formatDate(date) {
  if (!date) return BLANK;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return BLANK;
  return new Intl.DateTimeFormat(LOCALE).format(d);
}

/** Fecha y hora local */
export function formatDateTime(date) {
  if (!date) return BLANK;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return BLANK;
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** A YYYY-MM-DD (solo fecha) */
export function toISODate(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return null;
  }
}

/** DNI con puntos opcionales (12.345.678) */
export function formatDni(dni) {
  const digits = String(dni || "").replace(/\D+/g, "");
  if (!digits) return BLANK;
  // 7–9 dígitos: aplicamos separadores simples (para 8 queda XX.XXX.XXX)
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** CUIT con guiones (XX-XXXXXXXX-X) */
export function formatCuit(cuit) {
  const d = String(cuit || "").replace(/\D+/g, "");
  if (d.length !== 11) return cuit || BLANK;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

/** Teléfono “amigable” (heurística simple AR) */
export function formatPhone(phone) {
  const raw = String(phone || "").replace(/\D+/g, "");
  if (!raw) return BLANK;
  if (raw.length === 10) return `${raw.slice(0, 2)} ${raw.slice(2, 6)}-${raw.slice(6)}`;
  if (raw.length === 11) return `${raw.slice(0, 2)} ${raw.slice(2, 7)}-${raw.slice(7)}`;
  if (raw.length >= 6 && raw.length <= 9) return `${raw.slice(0, 3)} ${raw.slice(3, 6)}-${raw.slice(6)}`;
  return raw;
}

/** Limpia texto de búsqueda */
export function normalizeSearch(text = "") {
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default {
  titleCase,
  truncate,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  toISODate,
  formatDni,
  formatCuit,
  formatPhone,
  normalizeSearch,
};
