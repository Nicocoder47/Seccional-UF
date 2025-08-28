import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ListadoAfiliados() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    (async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("afiliados_personal")
        .select("dni, apellido, nombres, seccional_delegacion, empresa", { count: "exact" })
        .order("apellido", { ascending: true })
        .range(from, to);
      if (!error) setRows(data || []);
    })();
  }, [page]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Afiliados</h1>
      <table className="w-full text-sm border-collapse border">
        <thead><tr className="bg-gray-100">
          <th className="p-2 border">DNI</th>
          <th className="p-2 border">Apellido</th>
          <th className="p-2 border">Nombres</th>
          <th className="p-2 border">Seccional</th>
          <th className="p-2 border">Empresa</th>
        </tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.dni}>
              <td className="p-2 border">{r.dni}</td>
              <td className="p-2 border">{r.apellido}</td>
              <td className="p-2 border">{r.nombres}</td>
              <td className="p-2 border">{r.seccional_delegacion}</td>
              <td className="p-2 border">{r.empresa}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex gap-2">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Anterior</button>
        <span>Página {page}</span>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded">Siguiente</button>
      </div>
    </div>
  );
}
