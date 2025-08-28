// src/features/afiliados/store/useAfiliadosStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  listAfiliados,
  getAfiliado,
  createAfiliado,
  updateAfiliado,
  deleteAfiliado,
} from "@/features/afiliados/api/afiliados.api";

/**
 * Estado centralizado de Afiliados
 * - Guarda listado + meta + filtros
 * - Maneja item seleccionado (current)
 * - Acciones CRUD contra la API
 */
const initialFilters = { q: "", page: 1, size: 20, sort: "apellido:asc" };

export const useAfiliadosStore = create(
  persist(
    (set, get) => ({
      // --- Estado ---
      items: [],
      meta: { total: 0, page: 1, size: 20 },
      filters: { ...initialFilters },

      current: null, // afiliado seleccionado (por id/dni)
      loadingList: false,
      loadingItem: false,
      saving: false,
      removing: false,
      error: "",

      // --- Acciones auxiliares ---
      setError: (msg) => set({ error: msg || "" }),
      clearError: () => set({ error: "" }),

      setFilters: (partial) =>
        set((s) => ({
          filters: { ...s.filters, ...(partial || {}) },
        })),

      resetFilters: () => set({ filters: { ...initialFilters } }),

      setCurrent: (afiliado) => set({ current: afiliado }),

      // --- Acciones API ---
      async fetchList(params = {}) {
        set({ loadingList: true, error: "" });
        try {
          const { filters } = get();
          const query = { ...filters, ...params };
          // si viene page o q desde afuera, reseteamos meta.page si corresponde
          if (params?.q !== undefined && params.q !== filters.q) query.page = 1;

          const res = await listAfiliados(query);
          const data = Array.isArray(res) ? res : res?.data || [];
          const meta = res?.meta || {
            total: data.length,
            page: query.page || 1,
            size: query.size || 20,
          };

          set({ items: data, meta, filters: query });
          return { data, meta };
        } catch (e) {
          set({ error: e?.message || "No se pudo obtener el listado." });
          throw e;
        } finally {
          set({ loadingList: false });
        }
      },

      async fetchById(id) {
        if (!id) return;
        set({ loadingItem: true, error: "" });
        try {
          const item = await getAfiliado(id);
          set({ current: item });
          return item;
        } catch (e) {
          set({ error: e?.message || "No se pudo obtener el afiliado." });
          throw e;
        } finally {
          set({ loadingItem: false });
        }
      },

      async create(payload) {
        set({ saving: true, error: "" });
        try {
          const saved = await createAfiliado(payload);
          // Actualizamos listado si existe y entra en filtros actuales
          set((s) => ({ items: [saved, ...s.items] }));
          return saved;
        } catch (e) {
          set({ error: e?.message || "No se pudo crear el afiliado." });
          throw e;
        } finally {
          set({ saving: false });
        }
      },

      async update(id, payload) {
        set({ saving: true, error: "" });
        try {
          const saved = await updateAfiliado(id, payload);
          set((s) => ({
            current: s.current && (s.current.id === id || s.current.dni === id) ? saved : s.current,
            items: s.items.map((it) =>
              it.id === id || it.dni === id ? { ...it, ...saved } : it
            ),
          }));
          return saved;
        } catch (e) {
          set({ error: e?.message || "No se pudo actualizar el afiliado." });
          throw e;
        } finally {
          set({ saving: false });
        }
      },

      async remove(id) {
        set({ removing: true, error: "" });
        try {
          await deleteAfiliado(id);
          set((s) => ({
            items: s.items.filter((it) => it.id !== id && it.dni !== id),
            current:
              s.current && (s.current.id === id || s.current.dni === id)
                ? null
                : s.current,
          }));
          return true;
        } catch (e) {
          set({ error: e?.message || "No se pudo eliminar el afiliado." });
          throw e;
        } finally {
          set({ removing: false });
        }
      },
    }),
    {
      name: "afiliados-store",
      version: 1,
      // Persistimos solo filtros para no cachear datos sensibles
      partialize: (state) => ({ filters: state.filters }),
      storage: {
        getItem: (name) => {
          try {
            const raw = sessionStorage.getItem(name);
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch {}
        },
        removeItem: (name) => {
          try {
            sessionStorage.removeItem(name);
          } catch {}
        },
      },
    }
  )
);

export default useAfiliadosStore;
