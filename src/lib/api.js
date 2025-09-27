// src/lib/api.js
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); // sin barra al final

function toQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, v);
  });
  return usp.toString();
}

// === Afiliados ===
// /api/afiliados?dni=12345678
export async function apiBuscarAfiliadoPorDNI(dni) {
  if (!BASE) throw new Error("VITE_API_URL no está configurada");
  const qs = toQuery({ dni: String(dni).trim() });
  const url = `${BASE}/afiliados?${qs}`;
  const r = await fetch(url);
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Error ${r.status} ${r.statusText}: ${txt}`);
  }
  const data = await r.json();
  return data[0] || null;
}
