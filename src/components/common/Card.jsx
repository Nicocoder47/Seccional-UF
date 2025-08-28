import React from "react";

export default function Card({ title, subtitle, actions, children, style }) {
  return (
    <section
      style={{
        borderRadius: 16,
        border: "1px solid rgba(205,231,206,.12)",
        background:
          "linear-gradient(180deg, rgba(28,58,42,.55), rgba(14,26,19,.70))",
        padding: 16,
        ...style,
      }}
    >
      {(title || actions || subtitle) && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div>
            {title && <h3 style={{ margin: 0 }}>{title}</h3>}
            {subtitle && (
              <small style={{ color: "var(--text-2,#cde7ce)" }}>{subtitle}</small>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
