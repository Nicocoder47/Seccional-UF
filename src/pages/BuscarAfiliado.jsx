import { useState } from "react"
import { buscarPorDNI, buscarPorApellido } from "@/services/afiliados" // o "../services/afiliados"

export default function BuscarAfiliado() {
  const [dni, setDni] = useState("")
  const [ape, setApe] = useState("")
  const [uno, setUno] = useState(null)
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  const onBuscarDNI = async () => {
    setLoading(true); setErr(null); setUno(null)
    try { setUno(await buscarPorDNI(dni)) } 
    catch (e) { setErr(e.message) } 
    finally { setLoading(false) }
  }

  const onBuscarApe = async () => {
    setLoading(true); setErr(null); setLista([])
    try { setLista(await buscarPorApellido(ape)) } 
    catch (e) { setErr(e.message) } 
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscar Afiliado</h1>

      <div className="mb-6 border rounded p-4">
        <h2 className="font-semibold mb-2">Por DNI</h2>
        <input
          value={dni}
          onChange={e => setDni(e.target.value)}
          placeholder="27926634"
          className="border p-2 rounded mr-2"
        />
        <button onClick={onBuscarDNI} disabled={loading} className="px-4 py-2 bg-green-700 text-white rounded">
          {loading ? "Buscando..." : "Buscar"}
        </button>
        {uno && (
          <div className="mt-3 border rounded p-3">
            <b>{uno.apellido}, {uno.nombres}</b><br/>
            DNI: {uno.dni} · Seccional: {uno.seccional_delegacion} · Empresa: {uno.empresa}<br/>
            Cel: {uno.celular ?? "-"} · Email: {uno.email ?? "-"}
          </div>
        )}
      </div>

      <div className="mb-6 border rounded p-4">
        <h2 className="font-semibold mb-2">Por Apellido (prefijo)</h2>
        <input
          value={ape}
          onChange={e => setApe(e.target.value)}
          placeholder="ABA"
          className="border p-2 rounded mr-2"
        />
        <button onClick={onBuscarApe} disabled={loading} className="px-4 py-2 bg-green-700 text-white rounded">
          {loading ? "Buscando..." : "Listar"}
        </button>

        {!!lista.length && (
          <table className="mt-3 w-full text-sm border-collapse border">
            <thead><tr className="bg-gray-100">
              <th className="p-2 border">DNI</th>
              <th className="p-2 border">Apellido</th>
              <th className="p-2 border">Nombres</th>
              <th className="p-2 border">Seccional</th>
              <th className="p-2 border">Empresa</th>
            </tr></thead>
            <tbody>
              {lista.map(r => (
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
        )}
      </div>

      {err && <p className="text-red-500">{err}</p>}
    </div>
  )
}
