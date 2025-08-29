// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Si faltan variables, no rompas el bundle: devolvé null
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Útil para lanzar un error claro si alguien intenta usarlo sin configurar
export function assertSupabase(): asserts supabase is NonNullable<typeof supabase> {
  if (!supabase) {
    throw new Error("Supabase no configurado (faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY)");
  }
}
