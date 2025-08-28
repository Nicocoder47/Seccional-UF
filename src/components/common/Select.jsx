import React from "react";

export default function Select({ label, helperText, error, children, ...props }) {
  const id = props.id || `sel-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, opacity: 0.9 }}>
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        style={{
          width: "100%",
          height: 40,
          padding: "0 12px",
          borderRadius: 12,
          border: `1px solid ${error ? "rgba(255,120,120,.55)" : "rgba(205,231,206,.25)"}`,
          background:
            "linear-gradient(180deg, rgba(28,58,42,.45), rgba(14,26,19,.55))",
          color: "var(--text,#e7f0ea)",
          outline: "none",
        }}
      >
        {children}
      </select>
      {error ? (
        <small style={{ color: "#ffb3b3" }}>{error}</small>
      ) : helperText ? (
        <small style={{ color: "var(--text-2,#cde7ce)" }}>{helperText}</small>
      ) : null}
    </div>
  );
}
