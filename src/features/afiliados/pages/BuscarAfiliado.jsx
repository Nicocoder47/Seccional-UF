// src/features/afiliados/pages/BuscarAfiliado.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/data/EmptyState";
import AfiliadoCard from "../components/AfiliadoCard";
import { getByDni } from "../api/afiliados.api";

export default function BuscarAfiliado() {
  const navigate = useNavigate();

  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [results, setResults] = useState(null); // null: nada buscado aún | []: sin resultados | [..]: resultados

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErr("");

    const clean = String(dni).trim();
    if (!/^\d{7,9}$/.test(clean)) {
      return setErr("Ingresá un DNI válido (7 a 9 dígitos).");
    }

    setLoading(true);
    try {
      const data = await getByDni(clean, { exact: true });
      // puede venir objeto o array:
      const arr = Array.isArray(data) ? data : (data ? [data] : []);
      setResults(arr);
    } catch (er) {
      setResults([]);
      setErr(er?.message || "No se pudo completar la búsqueda.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setDni("");
    setErr("");
    setResults(null);
  }

  return (
    <section>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px" }}>Buscar afiliado</h2>
          <p style={{ margin: 0, color: "var(--text-2,#cde7ce)" }}>
            Ingresá el DNI para encontrar rápidamente un afiliado.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Input
          label="DNI"
          placeholder="Ej: 12345678"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          leftIcon={<img src="/src/assets/icons/search.svg" width="16" height="16" alt="" />}
          helperText="Solo números, sin puntos."
        />
        <Button type="submit" loading={loading}>
          Buscar
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Limpiar
        </Button>
      </form>

      {err && (
        <div style={{ marginBottom: 12 }}>
          <Alert variant="error">{err}</Alert>
        </div>
      )}

      {/* Resultado */}
      <div>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Spinner label="Buscando…" />
          </div>
        ) : results === null ? null : results.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="No encontramos ningún afiliado con ese DNI."
            action={
              <Button onClick={() => navigate("/afiliados/nuevo")}>
                Crear afiliado
              </Button>
            }
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {results.map((af) => (
              <AfiliadoCard
                key={af.id || af.dni}
                afiliado={af}
                onView={() => navigate(`/afiliados/${af.id || af.dni}`)}
                onEdit={() => navigate(`/afiliados/${af.id || af.dni}/editar`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
