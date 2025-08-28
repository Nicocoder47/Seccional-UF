import React, { useEffect } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = 720 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Modal"}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.55)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          borderRadius: 16,
          border: "1px solid rgba(205,231,206,.12)",
          background:
            "linear-gradient(180deg, rgba(28,58,42,.95), rgba(14,26,19,.95))",
          color: "var(--text,#e7f0ea)",
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 14,
            borderBottom: "1px solid rgba(205,231,206,.10)",
          }}
        >
          <strong>{title}</strong>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid rgba(205,231,206,.25)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </header>
        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}
