import React from "react";

export default function Alert({ children, variant = "info", style }) {
  const variants = {
    info: {
      border: "1px solid rgba(205,231,206,.35)",
      background: "rgba(46,125,50,.12)",
      color: "var(--text,#e7f0ea)",
    },
    success: {
      border: "1px solid rgba(78,191,102,.45)",
      background: "rgba(78,191,102,.12)",
      color: "var(--text,#e7f0ea)",
    },
    warning: {
      border: "1px solid rgba(255,210,120,.45)",
      background: "rgba(255,210,120,.12)",
      color: "var(--text,#e7f0ea)",
    },
    error: {
      border: "1px solid rgba(255,120,120,.45)",
      background: "rgba(255,120,120,.12)",
      color: "var(--text,#e7f0ea)",
    },
  };

  return (
    <div
      role="alert"
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
