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
        .select("*", { count: "exact" })
        .order("apellido", { ascending: true })
        .range(from, to);
      if (!error) setRows(data || []);
    })();
  }, [page]);

  // Determinar las columnas dinámicamente a partir de los datos
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Afiliados</h1>
      <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm border-collapse border min-w-max">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => (
                <th key={col} className="p-2 border whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.dni || i}>
                {columns.map((col) => (
                  <td key={col} className="p-2 border whitespace-nowrap">{r[col]?.toString() ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Anterior</button>
        <span>Página {page}</span>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded">Siguiente</button>
      </div>
    </div>
  );
}
