import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook para ejecutar un fetcher async con manejo de loading/error,
 * cancelación por AbortController y control de dependencias.
 *
 * @param {() => Promise<any>} fetcher - función que retorna una Promesa (por ejemplo, llamar a una API).
 * @param {any[]} deps - dependencias para volver a ejecutar automáticamente.
 * @param {{
 *   immediate?: boolean,          // si se ejecuta al montar/cambiar deps (default: true)
 *   keepPreviousData?: boolean,   // si mantiene el último data durante una nueva carga
 *   onSuccess?: (data:any)=>void,
 *   onError?: (err:any)=>void
 * }} [options]
 * @returns {{
 *   data: any,
 *   error: any,
 *   loading: boolean,
 *   refetch: () => Promise<void>,
 *   setData: (next:any)=>void
 * }}
 */
export function useFetch(fetcher, deps = [], options = {}) {
  const {
    immediate = true,
    keepPreviousData = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(immediate));
  const abortRef = useRef(/** @type {AbortController|null} */(null));
  const callIdRef = useRef(0); // evita condiciones de carrera

  const run = useCallback(async () => {
    const currentId = ++callIdRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!keepPreviousData) setData(null);
      setError(null);
      setLoading(true);

      // Si tu fetcher necesita signal, podés leerlo dentro
      // de la función (ej: fetch(url, { signal: controller.signal }))
      const result = await fetcher(controller.signal);

      // Ignora si hubo una llamada más nueva
      if (callIdRef.current !== currentId) return;
      setData(result);
      onSuccess?.(result);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e);
      onError?.(e);
    } finally {
      if (callIdRef.current === currentId) setLoading(false);
    }
  }, [fetcher, keepPreviousData, onSuccess, onError]);

  // auto-ejecución
  useEffect(() => {
    if (immediate) run();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // deps controlan la recarga

  return { data, error, loading, refetch: run, setData };
}
