import { useEffect, useState } from 'react';

/**
 * Retorna un valor "debounced" luego de esperar `delay` ms sin cambios.
 * Útil para buscadores / inputs que disparan requests.
 * @template T
 * @param {T} value
 * @param {number} [delay=300]
 * @returns {T}
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
