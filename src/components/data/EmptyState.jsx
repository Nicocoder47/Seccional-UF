import React from "react";

/**
 * Componente para estados vacíos o sin resultados.
 * Props:
 * - title: string
 * - description?: string | ReactNode
 * - action?: ReactNode (ej. un <Button/>)
 * - icon?: ReactNode (si no, usa un SVG por defecto)
 */
export default function EmptyState({ title = "Sin resultados", description, action, icon }) {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "28px 18px",
        borderRadius: 16,
        border: "1px dashed rgba(205,231,206,.25)",
        background:
          "linear-gradient(180deg, rgba(28,58,42,.35), rgba(14,26,19,.35))",
        color: "var(--text,#e7f0ea)",
      }}
    >
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <div style={{ justifySelf: "center", opacity: 0.9 }}>
          {icon ?? (
            <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 5h18v12H3z"
                fill="none"
                stroke="#cde7ce"
                strokeWidth="1.5"
              />
              <path
                d="M7 9h6M7 12h10"
                stroke="#2e7d32"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M6 19h12" stroke="#cde7ce" strokeWidth="1.5" />
            </svg>
          )}
        </div>

        <h3 style={{ margin: "6px 0 0" }}>{title}</h3>
        {description && (
          <p style={{ margin: 0, color: "var(--text-2,#cde7ce)" }}>{description}</p>
        )}

        {action && <div style={{ marginTop: 4, justifySelf: "center" }}>{action}</div>}
      </div>
    </div>
  );
}
