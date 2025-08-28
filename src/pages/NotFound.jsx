import React from "react";
import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <section style={{ textAlign:"center", padding:24 }}>
      <h2>Página no encontrada</h2>
      <p style={{ color: "var(--text-2,#cde7ce)" }}>La URL no existe.</p>
      <Link to="/" style={{ color: "var(--text,#e7f0ea)" }}>Volver al inicio</Link>
    </section>
  );
}
