import React from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";

export default function Perfil() {
  const { user, isAuthenticated, logout, refresh, getProfile } = useAuth();

  if (!isAuthenticated) {
    return <Alert variant="warning">No estás autenticado.</Alert>;
  }

  return (
    <section style={box}>
      <h2 style={{ marginTop: 0 }}>Mi perfil</h2>
      <pre style={pre}>{JSON.stringify(user, null, 2)}</pre>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="outline" onClick={() => getProfile()}>Actualizar perfil</Button>
        <Button variant="outline" onClick={() => refresh()}>Refrescar token</Button>
        <Button variant="danger" onClick={() => logout()}>Salir</Button>
      </div>
    </section>
  );
}
const box = {
  borderRadius: 18,
  padding: 24,
  border: "1px solid rgba(205,231,206,.12)",
  background: "linear-gradient(180deg, rgba(28,58,42,.55), rgba(14,26,19,.70))",
};
const pre = {
  background: "rgba(0,0,0,.25)",
  padding: 12,
  borderRadius: 12,
  maxHeight: 300,
  overflow: "auto",
};
