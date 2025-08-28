// src/utils/validators.js
import { PATTERNS } from "./constants";

/** Requerido (no vacío) */
export const isRequired = (v) => !(v === undefined || v === null || String(v).trim() === "");

/** Longitud mínima / máxima */
export const minLen = (n) => (v) => String(v ?? "").trim().length >= n;
export const maxLen = (n) => (v) => String(v ?? "").trim().length <= n;

/** DNI válido (7–9 dígitos) */
export const isDni = (v) => PATTERNS.dni.test(String(v ?? "").replace(/\D+/g, ""));

/** Email */
export const isEmail = (v) => PATTERNS.email.test(String(v ?? "").trim());

/** Teléfono: sólo dígitos 6–15 (validación cruda) */
export const isPhone = (v) => PATTERNS.phoneDigits.test(String(v ?? "").replace(/\D+/g, ""));

/** CUIT con dígito verificador */
export function isCuit(v) {
  const d = String(v ?? "").replace(/\D+/g, "");
  if (d.length !== 11) return false;
  const mult = [5,4,3,2,7,6,5,4,3,2];
  const sum = mult.reduce((acc, m, i) => acc + m * Number(d[i]), 0);
  let dv = 11 - (sum % 11);
  if (dv === 11) dv = 0;
  if (dv === 10) dv = 9;
  return dv === Number(d[10]);
}

/** Número */
export const isNumber = (v) => !Number.isNaN(Number(v));

/** Fecha válida */
export const isDate = (v) => {
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
};

/**
 * Validador de objeto simple.
 * schema: { campo: [(value)=>true|false, ...], ... }
 * Devuelve: { ok: boolean, errors: { campo: "mensaje" } }
 */
export function validateObject(obj, schema, messages = {}) {
  const errors = {};
  Object.entries(schema || {}).forEach(([key, rules]) => {
    const value = obj?.[key];
    (rules || []).some((rule) => {
      const ok = rule.fn(value, obj);
      if (!ok) {
        errors[key] = rule.msg || messages[key] || "Campo inválido";
        return true; // corta en el primer error del campo
      }
      return false;
    });
  });
  return { ok: Object.keys(errors).length === 0, errors };
}

/** Helpers para armar reglas con mensaje */
export const rule = (fn, msg) => ({ fn, msg });

/** Reglas rápidas típicas */
export const rules = {
  required: (msg = "Obligatorio") => rule(isRequired, msg),
  dni: (msg = "DNI inválido") => rule(isDni, msg),
  email: (msg = "Email inválido") => rule(isEmail, msg),
  phone: (msg = "Teléfono inválido") => rule(isPhone, msg),
  cuit: (msg = "CUIT inválido") => rule(isCuit, msg),
  min: (n, msg = `Mínimo ${n} caracteres`) => rule(minLen(n), msg),
  max: (n, msg = `Máximo ${n} caracteres`) => rule(maxLen(n), msg),
  date: (msg = "Fecha inválida") => rule(isDate, msg),
  number: (msg = "Número inválido") => rule(isNumber, msg),
};

export default {
  isRequired,
  minLen,
  maxLen,
  isDni,
  isEmail,
  isPhone,
  isCuit,
  isNumber,
  isDate,
  validateObject,
  rule,
  rules,
};
