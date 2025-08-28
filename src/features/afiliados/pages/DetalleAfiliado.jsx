import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getByIdOrDni } from "@/features/afiliados/services/afiliados.js";

export default function DetalleAfiliado() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const res = await getByIdOrDni(id);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setErr(e?.message || "Error cargando afiliado");
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (err) return <div className="p-6 text-red-400">⚠️ {err}</div>;
  if (!data) return <div className="p-6">Cargando…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        {data.apellido}, {data.nombres}
      </h1>
      <p>DNI: {data.dni}</p>
      <p>Seccional: {data.seccional_delegacion}</p>
      <p>Empresa: {data.empresa}</p>
      <p>Celular: {data.celular ?? "-"}</p>
      <p>Email: {data.email ?? "-"}</p>
    </div>
  );
}
