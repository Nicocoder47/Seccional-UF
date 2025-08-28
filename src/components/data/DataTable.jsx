import React, { useMemo, useState } from "react";
import Spinner from "../common/Spinner";
import EmptyState from "./EmptyState";

/**
 * DataTable simple, accesible y sin dependencias externas.
 *
 * Props:
 * - columns: Array<{ key: string, header: string, sortable?: boolean, align?: "left"|"center"|"right", accessor?: (row)=>any, render?: (value,row)=>ReactNode }>
 * - rows: Array<any>
 * - isLoading?: boolean
 * - pageSize?: number (default 10)
 * - onRowClick?: (row) => void
 * - filterText?: string  -> filtra por texto
 * - filterKeys?: string[] -> columnas/keys a considerar en el filtrado (si se omite, usa todas)
 * - emptyTitle?, emptyDescription?, emptyAction? -> props para EmptyState
 */
export default function DataTable({
  columns = [],
  rows = [],
  isLoading = false,
  pageSize = 10,
  onRowClick,
  filterText = "",
  filterKeys,
  emptyTitle = "No hay datos para mostrar",
  emptyDescription = "Ajustá los filtros o agregá nuevos registros.",
  emptyAction,
  style,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  // --- Filtrado por texto (cliente)
  const filtered = useMemo(() => {
    if (!filterText) return rows;
    const q = String(filterText).toLowerCase();
    return rows.filter((r) => {
      const keys = filterKeys && filterKeys.length ? filterKeys : Object.keys(r ?? {});
      return keys.some((k) => {
        const val =
          typeof k === "function" ? k(r) : (r?.[k] ?? r?.[k?.key] ?? "");
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [rows, filterText, filterKeys]);

  // --- Ordenamiento simple
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const acc = col?.accessor;
    const getVal = (row) =>
      acc ? acc(row) : row?.[sortKey];

    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      const na = normalize(va);
      const nb = normalize(vb);
      if (na < nb) return sortDir === "asc" ? -1 : 1;
      if (na > nb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  // --- Paginación
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  function handleSort(key, sortable) {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const tableStyles = {
    wrapper: {
      borderRadius: 16,
      border: "1px solid rgba(205,231,206,.10)",
      background:
        "linear-gradient(180deg, rgba(28,58,42,.55), rgba(14,26,19,.70))",
      boxShadow: "0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03)",
      overflow: "hidden",
      ...style,
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    th: {
      position: "sticky",
      top: 0,
      background: "rgba(14,26,19,.85)",
      color: "var(--text,#e7f0ea)",
      textAlign: "left",
      fontWeight: 700,
      fontSize: 13,
      padding: "12px 14px",
      borderBottom: "1px solid rgba(205,231,206,.12)",
      userSelect: "none",
    },
    td: {
      padding: "12px 14px",
      borderBottom: "1px solid rgba(205,231,206,.06)",
      color: "var(--text,#e7f0ea)",
      fontSize: 14,
    },
    rowClickable: {
      cursor: "pointer",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      color: "var(--text-2,#cde7ce)",
      fontSize: 13,
    },
    pagerBtn: {
      padding: "6px 10px",
      borderRadius: 10,
      border: "1px solid rgba(205,231,206,.25)",
      background: "rgba(46,125,50,.12)",
      color: "var(--text,#e7f0ea)",
      cursor: "pointer",
    },
    sortIcon: {
      marginInlineStart: 6,
      opacity: 0.85,
    },
  };

  return (
    <section style={tableStyles.wrapper} aria-live={isLoading ? "polite" : "off"}>
      <div style={{ overflow: "auto", maxHeight: "65vh" }}>
        <table role="table" style={tableStyles.table}>
          <thead>
            <tr role="row">
              {columns.map((col) => {
                const active = sortKey === col.key;
                const sortable = col.sortable !== false;
                const align = col.align || "left";
                return (
                  <th
                    key={col.key}
                    role="columnheader"
                    aria-sort={
                      active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                    }
                    onClick={() => handleSort(col.key, sortable)}
                    style={{
                      ...tableStyles.th,
                      textAlign: align,
                      cursor: sortable ? "pointer" : "default",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      {col.header}
                      {sortable && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          style={tableStyles.sortIcon}
                        >
                          {active ? (
                            sortDir === "asc" ? (
                              <path d="M7 14l5-5 5 5" fill="none" stroke="#cde7ce" strokeWidth="2" />
                            ) : (
                              <path d="M7 10l5 5 5-5" fill="none" stroke="#cde7ce" strokeWidth="2" />
                            )
                          ) : (
                            <path d="M8 10l4-4 4 4M8 14l4 4 4-4" fill="none" stroke="#cde7ce" strokeWidth="2" />
                          )}
                        </svg>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 24, textAlign: "center" }}>
                  <Spinner label="Cargando datos…" />
                </td>
              </tr>
            ) : pageRows.length > 0 ? (
              pageRows.map((row, i) => (
                <tr
                  key={i}
                  role="row"
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{
                    ...(onRowClick ? tableStyles.rowClickable : null),
                    transition: "background .12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(46,125,50,.07)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {columns.map((col) => {
                    const val = col.accessor ? col.accessor(row) : row?.[col.key];
                    const content = col.render ? col.render(val, row) : val ?? "—";
                    const align = col.align || "left";
                    return (
                      <td key={col.key} role="cell" style={{ ...tableStyles.td, textAlign: align }}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: 18 }}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de paginación */}
      {!isLoading && total > 0 && (
        <div style={tableStyles.footer}>
          <span>
            Mostrando{" "}
            <strong>
              {start + 1}-{Math.min(start + pageSize, total)}
            </strong>{" "}
            de <strong>{total}</strong>
          </span>

          <div style={{ display: "inline-flex", gap: 8 }}>
            <button
              type="button"
              style={tableStyles.pagerBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            <span style={{ alignSelf: "center" }}>
              Página {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              style={tableStyles.pagerBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function normalize(v) {
  if (v == null) return "";
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  return String(v).toLowerCase();
}
