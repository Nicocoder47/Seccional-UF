// src/features/afiliados/api/afiliados.api.js
// Capa de acceso a datos para Afiliados (fetch nativo, sin dependencias).
// Usa VITE_API_URL del .env (ej: http://localhost:5000/api).

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const BASE = `${API}/afiliados`;

/** Helper: arma querystring limpio */
function qs(obj = {}) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Helper: maneja errores HTTP devolviendo JSON útil */
async function handle(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // puede no venir cuerpo
  }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Lista paginada + búsqueda
 * @param {{page?:number, size?:number, q?:string, sort?:string}} params
 * Backend sugerido: GET /afiliados?page=1&size=10&q=12345678&sort=apellido:asc
 */
export async function listAfiliados(params = {}) {
  const res = await fetch(`${BASE}${qs(params)}`, { credentials: "include" });
  return handle(res); // -> { data: Afiliado[], meta: { total, page, size } }
}

/** Obtiene un afiliado por id */
export async function getAfiliado(id) {
  if (!id) throw new Error("id requerido");
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { credentials: "include" });
  return handle(res); // -> Afiliado
}

/** Busca por DNI (con exact=true para coincidencia exacta) */
export async function getByDni(dni, { exact = true } = {}) {
  if (!dni) throw new Error("dni requerido");
  const res = await fetch(`${BASE}/buscar${qs({ dni, exact })}`, { credentials: "include" });
  return handle(res); // -> Afiliado | Afiliado[]
}

/** Crea un afiliado */
export async function createAfiliado(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handle(res); // -> Afiliado creado
}

/** Actualiza un afiliado */
export async function updateAfiliado(id, payload) {
  if (!id) throw new Error("id requerido");
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handle(res); // -> Afiliado actualizado
}

/** Elimina (o marca inactivo) */
export async function deleteAfiliado(id) {
  if (!id) throw new Error("id requerido");
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle(res); // -> { ok: true }
}

export default {
  listAfiliados,
  getAfiliado,
  getByDni,
  createAfiliado,
  updateAfiliado,
  deleteAfiliado,
};
