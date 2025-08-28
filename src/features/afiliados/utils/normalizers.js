// src/features/afiliados/utils/normalizers.js

/** ---------- Strings & helpers ---------- */

/** Elimina acentos/diacríticos y espacios redundantes */
export function stripAccents(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** A título: "juan perez" -> "Juan Perez" */
export function toTitle(str = "") {
  const s = stripAccents(str.toLowerCase());
  return s.replace(/\b([a-záéíóúñ])/gi, (m) => m.toUpperCase());
}

/** Solo dígitos */
export function onlyDigits(str = "") {
  return String(str).replace(/\D+/g, "");
}

/** ---------- DNI / Email / Tel ---------- */

export function normalizeDni(dni) {
  const digits = onlyDigits(dni);
  // aceptamos 7-9 dígitos (flexible para casos históricos)
  return digits.length >= 7 && digits.length <= 9 ? digits : digits;
}

export function isValidEmail(email = "") {
  // simple y suficiente para UI
  return /^\S+@\S+\.\S+$/.test(String(email).trim());
}

export function normalizeEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  return e || null;
}

/** Devuelve objeto: { raw: "1155555555", pretty: "11 5555-5555" } */
export function normalizePhone(phone) {
  const raw = onlyDigits(phone);
  if (!raw) return { raw: "", pretty: "" };

  // Formateo simple para AR (ej. 11 5555-5555 / 11 5555-55555 / 351 555-5555)
  let pretty = raw;
  if (raw.length === 10) {
    pretty = `${raw.slice(0, 2)} ${raw.slice(2, 6)}-${raw.slice(6)}`;
  } else if (raw.length === 11) {
    pretty = `${raw.slice(0, 2)} ${raw.slice(2, 7)}-${raw.slice(7)}`;
  } else if (raw.length >= 6 && raw.length <= 9) {
    pretty = `${raw.slice(0, 3)} ${raw.slice(3, 6)}-${raw.slice(6)}`;
  }
  return { raw, pretty };
}

/** ---------- Fechas ---------- */

/** A YYYY-MM-DD (solo fecha). Acepta Date, string o timestamp. */
export function toISODate(input) {
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return null;
  }
}

/** Fecha local amigable o "—" si no es válida */
export function toLocalDateDisplay(input) {
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

/** ---------- camelCase <-> snake_case ---------- */

const toSnake = (k) =>
  String(k)
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");

const toCamel = (k) => String(k).replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export function snakeizeKeys(obj) {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(snakeizeKeys);
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    out[toSnake(k)] = snakeizeKeys(v);
  });
  return out;
}

export function camelizeKeys(obj) {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(camelizeKeys);
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    out[toCamel(k)] = camelizeKeys(v);
  });
  return out;
}

/** Reemplaza undefined por null (útil para payloads) */
export function nullifyUndefined(obj) {
  if (obj == null || typeof obj !== "object") return obj ?? null;
  if (Array.isArray(obj)) return obj.map(nullifyUndefined);
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    out[k] = v === undefined ? null : nullifyUndefined(v);
  });
  return out;
}

/** ---------- Afiliado mappers ---------- */

/** Normaliza valores del form para enviar al backend */
export function normalizeAfiliadoForAPI(form) {
  const f = { ...(form || {}) };

  // strings
  f.nombre = f.nombre ? toTitle(f.nombre) : null;
  f.apellido = f.apellido ? toTitle(f.apellido) : null;
  f.sector = f.sector ? toTitle(f.sector) : null;
  f.domicilio = f.domicilio?.trim() || null;

  // dni/email/teléfono
  f.dni = normalizeDni(f.dni);
  f.email = f.email ? normalizeEmail(f.email) : null;
  const tel = normalizePhone(f.telefono);
  f.telefono = tel.raw || null;

  // fechas
  if (f.fechaNacimiento) f.fechaNacimiento = toISODate(f.fechaNacimiento);
  if (f.fechaIngreso) f.fechaIngreso = toISODate(f.fechaIngreso);

  // flags
  f.activo = Boolean(f.activo);

  // legajo a string para no perder ceros a la izquierda
  if (f.legajo !== undefined && f.legajo !== null) {
    f.legajo = String(f.legajo).trim() || null;
  }

  // snake_case para Flask y nulls explícitos
  return snakeizeKeys(nullifyUndefined(f));
}

/** Normaliza respuesta del backend para mostrar en UI (camelCase + strings prolijas) */
export function normalizeAfiliadoFromAPI(data) {
  const d = camelizeKeys(data || {});
  return {
    ...d,
    dni: d.dni ? normalizeDni(d.dni) : "",
    nombre: d.nombre ? toTitle(d.nombre) : "",
    apellido: d.apellido ? toTitle(d.apellido) : "",
    sector: d.sector ? toTitle(d.sector) : "",
    telefono: d.telefono || "",
    telefonoPretty: d.telefono ? normalizePhone(d.telefono).pretty : "",
    email: d.email || "",
    domicilio: d.domicilio || "",
    fechaNacimiento: d.fechaNacimiento || null,
    fechaIngreso: d.fechaIngreso || null,
    activo: Boolean(d.activo ?? true),
    legajo: d.legajo ?? "",
  };
}

/** Merge seguro de afiliado (sin undefined) */
export function mergeAfiliado(base = {}, patch = {}) {
  const b = { ...base };
  Object.entries(patch || {}).forEach(([k, v]) => {
    if (v !== undefined) b[k] = v;
  });
  return b;
}

/** ---------- Paginación/Query helpers ---------- */

export function normalizePaginatedResponse(res) {
  if (Array.isArray(res)) {
    return { data: res, meta: { total: res.length, page: 1, size: res.length } };
  }
  const data = Array.isArray(res?.data) ? res.data : [];
  const meta = {
    total: Number(res?.meta?.total ?? data.length),
    page: Number(res?.meta?.page ?? 1),
    size: Number(res?.meta?.size ?? data.length),
  };
  return { data, meta };
}

/** Construye querystring limpio desde un objeto */
export function buildQuery(params = {}) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Sorting util (case-insensitive + números) */
export function smartCompare(a, b) {
  const na = Number(a);
  const nb = Number(b);
  const aa = Number.isNaN(na) ? String(a).toLowerCase() : na;
  const bb = Number.isNaN(nb) ? String(b).toLowerCase() : nb;
  if (aa < bb) return -1;
  if (aa > bb) return 1;
  return 0;
}

export default {
  stripAccents,
  toTitle,
  onlyDigits,
  normalizeDni,
  isValidEmail,
  normalizeEmail,
  normalizePhone,
  toISODate,
  toLocalDateDisplay,
  snakeizeKeys,
  camelizeKeys,
  nullifyUndefined,
  normalizeAfiliadoForAPI,
  normalizeAfiliadoFromAPI,
  mergeAfiliado,
  normalizePaginatedResponse,
  buildQuery,
  smartCompare,
};
