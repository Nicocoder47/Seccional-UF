// src/features/afiliados/services/afiliados.js
import { api, assertAPI } from "@/lib/axios";

export async function getByIdOrDni(idOrDni) {
  assertAPI();
  const { data } = await api.get(`/afiliados/${encodeURIComponent(idOrDni)}`);
  return data;
}

export async function listAfiliados({ q = "", page = 1, limit = 20 } = {}) {
  assertAPI();
  const params = new URLSearchParams({ q, page, limit });
  const { data } = await api.get(`/afiliados?${params}`);
  return data;
}
