import React from "react";

export default function Button({
  children,
  variant = "primary", // "primary" | "outline" | "danger"
  size = "md", // "sm" | "md"
  loading = false,
  disabled = false,
  style,
  ...props
}) {
  const isDisabled = disabled || loading;

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    border: "1px solid transparent",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.7 : 1,
    transition: "transform .05s ease, background .15s ease, border .15s ease",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  const sizes = {
    sm: { height: 34, padding: "0 12px", fontSize: 13 },
    md: { height: 40, padding: "0 16px", fontSize: 14 },
  };

  const variants = {
    primary: {
      background: "var(--accent,#2e7d32)",
      color: "#fff",
      borderColor: "rgba(205,231,206,.25)",
    },
    outline: {
      background: "transparent",
      color: "var(--text,#e7f0ea)",
      borderColor: "rgba(205,231,206,.35)",
    },
    danger: {
      background: "linear-gradient(180deg, #8b1f1f, #5c1313)",
      color: "#fff",
      borderColor: "rgba(255,120,120,.45)",
    },
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,.35)",
            borderTopColor: "#fff",
            animation: "spin .8s linear infinite",
          }}
        />
      )}
      <span>{children}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
