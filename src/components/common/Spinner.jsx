import React from "react";

export default function Spinner({ label = "Cargando…" }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "3px solid rgba(205,231,206,.25)",
          borderTopColor: "var(--accent,#2e7d32)",
          animation: "spin .9s linear infinite",
        }}
      />
      <span style={{ opacity: 0.9 }}>{label}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
