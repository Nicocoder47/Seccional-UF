import { supabase } from '@/lib/supabase'

export async function buscarPorDNI(dni: string) {
  const { data, error } = await supabase
    .from('afiliados_personal')
    .select('dni, apellido, nombres, seccional_delegacion, empresa, celular, email')
    .eq('dni', dni.trim())
    .limit(1)
  if (error) throw error
  return data?.[0] ?? null
}
