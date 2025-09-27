// src/services/afiliados.js
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); // sin / final

function ok(r) {
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

// GET /api/afiliados?dni=12345678  -> [ {...} ]
export async function buscarPorDNI(dni) {
  if (!BASE) throw new Error("VITE_API_URL no está configurada");
  const clean = String(dni || "").trim();
  if (!clean) throw new Error("Ingresá un DNI");
  const url = `${BASE}/afiliados?dni=${encodeURIComponent(clean)}`;
  const data = await fetch(url).then(ok);
  return data[0] || null; // uno o null
}

// GET /api/afiliados?apellido=ABA  -> lista
export async function buscarPorApellido(prefijo) {
  if (!BASE) throw new Error("VITE_API_URL no está configurada");
  const clean = String(prefijo || "").trim().toUpperCase();
  if (clean.length < 2) throw new Error("Ingresá al menos 2 letras");
  const url = `${BASE}/afiliados?apellido=${encodeURIComponent(clean)}&limit=50`;
  const data = await fetch(url).then(ok);
  return data; // array
}
