/**
 * Almacena un valor en localStorage en formato JSON
 * @param {string} key
 * @param {any} value
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error guardando en localStorage', e);
  }
}

/**
 * Obtiene y parsea un valor desde localStorage
 * @param {string} key
 * @param {any} fallback valor por defecto si no existe
 * @returns {any}
 */
export function getStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error leyendo de localStorage', e);
    return fallback;
  }
}

/**
 * Elimina una clave de localStorage
 * @param {string} key
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error eliminando de localStorage', e);
  }
}
