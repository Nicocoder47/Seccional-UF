// @/features/novedades/store/useNovedadesStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  listNovedades,
  getNovedad,
  createNovedad,
  updateNovedad,
  deleteNovedad,
} from '@/features/novedades/api/novedades.api';

export const useNovedadesStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      loading: false,
      error: null,
      filtros: { q: '', page: 1, pageSize: 20 },

      async fetch() {
        set({ loading: true, error: null });
        const { filtros } = get();
        try {
          const data = await listNovedades(filtros);
          set({ items: data.items ?? [], total: data.total ?? 0 });
        } catch (e) {
          set({ error: e.message || 'Error' });
        } finally {
          set({ loading: false });
        }
      },

      setFiltros(next) {
        set((s) => ({ filtros: { ...s.filtros, ...next } }));
      },

      async fetchOne(id) {
        return getNovedad(id);
      },

      async create(payload) {
        const created = await createNovedad(payload);
        await get().fetch();
        return created;
      },

      async update(id, payload) {
        const updated = await updateNovedad(id, payload);
        await get().fetch();
        return updated;
      },

      async remove(id) {
        await deleteNovedad(id);
        await get().fetch();
      },
    }),
    { name: 'novedades-store' }
  )
);
