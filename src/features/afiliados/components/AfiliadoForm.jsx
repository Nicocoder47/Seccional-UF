import React, { useMemo, useState, useEffect } from "react"
import Card from "@/components/common/Card"
import Input from "@/components/common/Input"
import Select from "@/components/common/Select"
import Button from "@/components/common/Button"
import Alert from "@/components/common/Alert"
import { createAfiliado, updateAfiliado } from "../api/afiliados.api"

/**
 * Formulario de alta/edición de Afiliado.
 * Props:
 *  - defaultValues?: objeto afiliado
 *  - onCancel?: () => void
 *  - onSaved?: (afiliadoGuardado) => void
 */
const SECTORES = ["Administración", "Taller", "Depósito", "RRHH", "Sistemas", "Otro"]

export default function AfiliadoForm({ defaultValues = {}, onCancel, onSaved }) {
  const isEdit = Boolean(defaultValues?.id)

  const [form, setForm] = useState(() => ({
    dni: "",
    nombre: "",
    apellido: "",
    legajo: "",
    sector: "",
    telefono: "",
    email: "",
    domicilio: "",
    fechaNacimiento: "",
    fechaIngreso: "",
    activo: true,
    ...defaultValues,
  }))

  // Si defaultValues cambia (p.ej. al abrir otro afiliado), sincronizamos
  useEffect(() => {
    setForm(f => ({ ...f, ...defaultValues }))
  }, [defaultValues])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [okMsg, setOkMsg] = useState("")

  const errors = useMemo(() => validate(form), [form])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
    setOkMsg("")
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setOkMsg("")

    const errs = validate(form)
    if (Object.keys(errs).length) {
      setError("Revisá los campos marcados.")
      return
    }

    setLoading(true)
    try {
      const payload = toSupabasePayload(form)
      const saved = isEdit
        ? await updateAfiliado(form.id ?? form.dni, payload) // soporta id o dni
        : await createAfiliado(payload)
      setOkMsg(isEdit ? "Afiliado actualizado." : "Afiliado creado.")
      onSaved?.(saved)
    } catch (err) {
      setError(err?.message || "No se pudo guardar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={isEdit ? "Editar afiliado" : "Nuevo afiliado"}
      subtitle="Completá los datos obligatorios"
      actions={
        <div style={{ display: "inline-flex", gap: 8 }}>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" form="afiliado-form" loading={loading} disabled={loading}>
            {isEdit ? "Guardar cambios" : "Crear afiliado"}
          </Button>
        </div>
      }
    >
      <form id="afiliado-form" onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 14,
          }}
        >
          <Input
            name="dni"
            label="DNI *"
            value={form.dni}
            onChange={handleChange}
            error={errors.dni}
            placeholder="Ej: 27926634"
            autoComplete="off"
            required
            pattern="\d{7,9}"
            // en edición no permitimos cambiar DNI
            disabled={isEdit}
          />

          <Input
            name="legajo"
            label="Legajo"
            value={form.legajo ?? ""}
            onChange={handleChange}
            autoComplete="off"
          />

          <Input
            name="apellido"
            label="Apellido *"
            value={form.apellido}
            onChange={handleChange}
            error={errors.apellido}
            autoComplete="family-name"
            required
          />
          <Input
            name="nombre"
            label="Nombre *"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            autoComplete="given-name"
            required
          />

          <Select
            name="sector"
            label="Sector *"
            value={form.sector}
            onChange={handleChange}
            error={errors.sector}
            required
          >
            <option value="">Seleccionar…</option>
            {SECTORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Input
            name="telefono"
            label="Teléfono"
            value={form.telefono ?? ""}
            onChange={handleChange}
            placeholder="Ej: 11 5555-5555"
            autoComplete="tel"
          />

          <Input
            name="email"
            label="Email"
            value={form.email ?? ""}
            onChange={handleChange}
            error={errors.email}
            placeholder="nombre@dominio.com"
            autoComplete="email"
            inputMode="email"
          />

          <Input
            name="domicilio"
            label="Domicilio"
            value={form.domicilio ?? ""}
            onChange={handleChange}
            autoComplete="street-address"
          />

          <Input
            type="date"
            name="fechaNacimiento"
            label="Fecha de nacimiento"
            value={form.fechaNacimiento || ""}
            onChange={handleChange}
          />
          <Input
            type="date"
            name="fechaIngreso"
            label="Fecha de ingreso"
            value={form.fechaIngreso || ""}
            onChange={handleChange}
          />
        </div>

        {/* Activo (no existe en la tabla; lo mantenemos por UI si te sirve) */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="activo"
              checked={!!form.activo}
              onChange={handleChange}
            />
            Activo
          </label>
        </div>

        {/* Mensajes */}
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {error && <Alert variant="error">{error}</Alert>}
          {okMsg && <Alert variant="success">{okMsg}</Alert>}
        </div>
      </form>
    </Card>
  )
}

/* ---------- Helpers ---------- */

function validate(f) {
  const errs = {}
  if (!f.dni || !/^\d{7,9}$/.test(String(f.dni))) errs.dni = "DNI inválido"
  if (!f.apellido?.trim()) errs.apellido = "Obligatorio"
  if (!f.nombre?.trim()) errs.nombre = "Obligatorio"
  if (!f.sector?.trim()) errs.sector = "Seleccioná un sector"
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Email inválido"
  return errs
}

/** Mapea los campos del form a columnas de Supabase (tabla public.afiliados_personal) */
function toSupabasePayload(f) {
  const copy = { ...f }

  // Normalizaciones básicas
  copy.dni = String(copy.dni).trim()
  const email = copy.email?.trim() || null
  const telefono = copy.telefono?.trim() || null
  const domicilio = copy.domicilio?.trim() || null
  const legajo = copy.legajo?.toString().trim() || null

  // Fechas → YYYY-MM-DD
  const fecha_nacimiento = copy.fechaNacimiento ? toIsoDate(copy.fechaNacimiento) : null
  const fecha_primer_ingreso = copy.fechaIngreso ? toIsoDate(copy.fechaIngreso) : null

  // Mapeo de nombres al esquema de Postgres
  const payload = {
    dni: copy.dni,
    apellido: copy.apellido?.trim() || null,
    nombres: copy.nombre?.trim() || null,
    legajo,
    sector: copy.sector || null,
    email,
    direccion: domicilio,
    celular: telefono,                // si preferís, dejá solo uno
    telefono_particular: telefono,    // opcional: duplico para tener ambos
    fecha_nacimiento,
    fecha_primer_ingreso,
    // podés agregar otros campos si los incluís en el form:
    // seccional_delegacion, empresa, etc.
    actualizado_en: new Date().toISOString(), // útil si tu API lo preserva
  }

  // Limpio undefined
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
  return payload
}

function toIsoDate(d) {
  try {
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return null
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, "0")
    const day = String(dt.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  } catch {
    return null
  }
}
