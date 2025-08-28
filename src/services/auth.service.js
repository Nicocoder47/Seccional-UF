// @/services/auth.service.js
import api from '@/lib/axios';
import { getStorage, setStorage, removeStorage } from '@/lib/storage';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Inicia sesión con DNI/contraseña.
 * Espera que el backend devuelva { token, user }.
 */
export async function login({ dni, password }) {
  const { data } = await api.post('/auth/login', { dni, password });
  if (data?.token) setStorage(TOKEN_KEY, data.token);
  if (data?.user) setStorage(USER_KEY, data.user);
  // Notifica a listeners (p.ej. AuthContext)
  window.dispatchEvent(new Event('auth-login'));
  return data;
}

/** Cierra sesión (opcionalmente avisa al backend) */
export async function logout() {
  try { await api.post('/auth/logout'); } catch { /* ignore */ }
  removeStorage(TOKEN_KEY);
  removeStorage(USER_KEY);
  window.dispatchEvent(new Event('auth-logout'));
}

/** Usuario actual (intenta cache y si no, golpea al backend) */
export async function me({ force = false } = {}) {
  const cached = getStorage(USER_KEY, null);
  if (cached && !force) return cached;

  const { data } = await api.get('/auth/me');
  if (data) setStorage(USER_KEY, data);
  return data;
}

/** Refresca token si tu backend lo soporta */
export async function refresh() {
  const { data } = await api.post('/auth/refresh');
  if (data?.token) setStorage(TOKEN_KEY, data.token);
  return data;
}

/** Helpers básicos */
export const authStorage = {
  getToken: () => getStorage(TOKEN_KEY, null),
  getUser:  () => getStorage(USER_KEY, null),
  setUser:  (u) => setStorage(USER_KEY, u),
  clear:    () => { removeStorage(TOKEN_KEY); removeStorage(USER_KEY); },
};
