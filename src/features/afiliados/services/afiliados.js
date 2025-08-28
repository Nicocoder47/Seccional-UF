// src/features/afiliados/services/afiliados.js
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Obtener un afiliado por ID o DNI
 */
export async function getByIdOrDni(idOrDni) {
  const url = `${API}/afiliados/${encodeURIComponent(idOrDni)}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar afiliado`);
  }
  return res.json();
}

/**
 * Listar afiliados con filtros
 */
export async function listAfiliados({ q = "", page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ q, page, limit });
  const res = await fetch(`${API}/afiliados?${params}`, {
    headers: { "Accept": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al listar afiliados`);
  }
  return res.json();
}
