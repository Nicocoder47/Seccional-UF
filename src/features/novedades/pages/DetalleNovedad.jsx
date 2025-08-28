// @/features/novedades/pages/ListadoNovedades.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNovedadesStore } from '@/features/novedades/store/useNovedadesStore';
import NovedadCard from '@/features/novedades/components/NovedadCard';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/data/EmptyState';

export default function ListadoNovedades() {
  const nav = useNavigate();
  const { items, total, loading, filtros, setFiltros, fetch, error } = useNovedadesStore();

  useEffect(() => { fetch(); }, [filtros.q, filtros.page, filtros.pageSize]);

  return (
    <section className="container" aria-labelledby="titulo-novedades">
      <header className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 id="titulo-novedades" className="text-2xl font-bold">Novedades</h1>
          <p className="text-[var(--text-2)]">Últimas noticias y comunicados.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => nav('/novedades/nueva')}
          aria-label="Crear nueva novedad"
        >
          Nueva
        </button>
      </header>

      <div className="mb-4 max-w-md">
        <label htmlFor="buscador" className="sr-only">Buscar</label>
        <Input
          id="buscador"
          placeholder="Buscar por título o contenido…"
          value={filtros.q}
          onChange={(e) => setFiltros({ q: e.target.value, page: 1 })}
          aria-describedby="ayuda-busqueda"
        />
        <small id="ayuda-busqueda" className="text-[var(--text-2)]">
          Presioná Enter para buscar.
        </small>
      </div>

      {loading && <Spinner aria-label="Cargando novedades" />}
      {error && <div role="alert" className="alert error">{error}</div>}

      {!loading && items.length === 0 ? (
        <EmptyState title="Sin resultados" description="No encontramos novedades con ese filtro." />
      ) : (
        <ul role="list" className="grid gap-3 md:grid-cols-2">
          {items.map((n, i) => (
            <li key={n.id}>
              <NovedadCard
                novedad={n}
                aria-posinset={i + 1}
                onOpen={() => nav(`/novedades/${n.id}`)}
              />
            </li>
          ))}
        </ul>
      )}

      {!loading && total > filtros.pageSize && (
        <nav className="mt-4 flex items-center gap-2" aria-label="Paginación">
          <button
            className="btn"
            onClick={() => setFiltros({ page: Math.max(1, filtros.page - 1) })}
            disabled={filtros.page === 1}
          >
            Anterior
          </button>
          <span aria-live="polite" className="px-2">
            Página {filtros.page}
          </span>
          <button
            className="btn"
            onClick={() => setFiltros({ page: filtros.page + 1 })}
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}
