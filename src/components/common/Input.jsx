import React from "react";

export default function Input({
  label,
  helperText,
  error,
  leftIcon,
  type = "text",
  style,
  ...props
}) {
  const id = props.id || `inp-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, opacity: 0.9 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              insetInlineStart: 10,
              insetBlockStart: "50%",
              transform: "translateY(-50%)",
              opacity: 0.85,
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type={type}
          style={{
            width: "100%",
            height: 40,
            padding: leftIcon ? "0 12px 0 32px" : "0 12px",
            borderRadius: 12,
            border: `1px solid ${error ? "rgba(255,120,120,.55)" : "rgba(205,231,206,.25)"}`,
            background:
              "linear-gradient(180deg, rgba(28,58,42,.45), rgba(14,26,19,.55))",
            color: "var(--text,#e7f0ea)",
            outline: "none",
          }}
          {...props}
        />
      </div>
      {error ? (
        <small style={{ color: "#ffb3b3" }}>{error}</small>
      ) : helperText ? (
        <small style={{ color: "var(--text-2,#cde7ce)" }}>{helperText}</small>
      ) : null}
    </div>
  );
}
