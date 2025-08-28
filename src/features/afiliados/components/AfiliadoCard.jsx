import React from "react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

export default function AfiliadoCard({
  afiliado = {},
  onView,
  onEdit,
  onDelete,
  actionsRight, // por si querés inyectar acciones extra
}) {
  const {
    id,
    dni,
    nombre,
    apellido,
    legajo,
    sector,
    telefono,
    email,
    fechaIngreso,
    activo = true,
  } = afiliado;

  const initials = (apellido?.[0] || "") + (nombre?.[0] || "");
  const nombreCompleto = [apellido, nombre].filter(Boolean).join(", ");
  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: `1px solid ${activo ? "rgba(78,191,102,.45)" : "rgba(255,120,120,.45)"}`,
    background: activo
      ? "linear-gradient(180deg, rgba(34,77,45,.35), rgba(20,44,32,.35))"
      : "linear-gradient(180deg, rgba(120,30,30,.35), rgba(60,14,14,.35))",
    color: "var(--text,#e7f0ea)",
  };

  return (
    <Card
      title={nombreCompleto || "Afiliado"}
      subtitle={dni ? `DNI ${dni}` : ""}
      actions={
        actionsRight ?? (
          <div style={{ display: "inline-flex", gap: 8 }}>
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(afiliado)}>
                Ver
              </Button>
            )}
            {onEdit && (
              <Button size="sm" onClick={() => onEdit(afiliado)}>
                Editar
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="danger" onClick={() => onDelete(afiliado)}>
                Eliminar
              </Button>
            )}
          </div>
        )
      }
      style={{ overflow: "hidden" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 }}>
        {/* Avatar */}
        <div
          aria-hidden="true"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(180deg, rgba(28,58,42,.65), rgba(14,26,19,.85))",
            border: "1px solid rgba(205,231,206,.25)",
            fontWeight: 800,
            letterSpacing: ".5px",
          }}
        >
          {initials || "UF"}
        </div>

        {/* Info */}
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={badgeStyle}>{activo ? "Activo" : "Inactivo"}</span>
            {legajo && (
              <small style={{ color: "var(--text-2,#cde7ce)" }}>Legajo #{legajo}</small>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 10,
            }}
          >
            {sector && Field("Sector", sector)}
            {telefono && Field("Teléfono", telefono)}
            {email && Field("Email", email)}
            {fechaIngreso && Field("Ingreso", formatDate(fechaIngreso))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Field(label, value) {
  return (
    <div>
      <small style={{ display: "block", opacity: 0.8 }}>{label}</small>
      <span>{value}</span>
    </div>
  );
}

function formatDate(v) {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString();
  } catch {
    return v;
  }
}
