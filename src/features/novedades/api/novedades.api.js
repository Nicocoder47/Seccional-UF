// @/features/novedades/api/novedades.api.js
const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
const R = {
  list: () => `${BASE}/novedades`,
  get:  (id) => `${BASE}/novedades/${id}`,
  create: () => `${BASE}/novedades`,
  update: (id) => `${BASE}/novedades/${id}`,
  remove: (id) => `${BASE}/novedades/${id}`,
};

const json = (body) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export async function listNovedades({ q = '', page = 1, pageSize = 20 } = {}) {
  const url = new URL(R.list());
  if (q) url.searchParams.set('q', q);
  url.searchParams.set('page', page);
  url.searchParams.set('page_size', pageSize);

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron obtener las novedades');
  return res.json(); // { items:[], total: N }
}

export async function getNovedad(id) {
  const res = await fetch(R.get(id), { credentials: 'include' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al obtener la novedad');
  return res.json();
}

export async function createNovedad(payload) {
  const res = await fetch(R.create(), {
    method: 'POST',
    ...json(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al crear la novedad');
  return res.json();
}

export async function updateNovedad(id, payload) {
  const res = await fetch(R.update(id), {
    method: 'PUT',
    ...json(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al actualizar la novedad');
  return res.json();
}

export async function deleteNovedad(id) {
  const res = await fetch(R.remove(id), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al eliminar la novedad');
  return true;
}
