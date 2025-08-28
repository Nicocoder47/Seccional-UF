import { useCallback, useMemo, useState } from 'react';

/**
 * Manejo simple de formularios con onChange, setField y validación opcional.
 *
 * @template T
 * @param {T} initialValues
 * @param {(values:T)=>Record<string,string>|null} [validate] - retorna objeto de errores { campo: 'mensaje' }
 * @returns {{
 *   values: T,
 *   errors: Record<string,string>,
 *   touched: Record<string,boolean>,
 *   handleChange: (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>void,
 *   handleCheckbox: (e: React.ChangeEvent<HTMLInputElement>)=>void,
 *   setField: (name: keyof T, value: any)=>void,
 *   setValues: (next: Partial<T>)=>void,
 *   reset: (next?: Partial<T>)=>void,
 *   validateForm: ()=>boolean
 * }}
 */
export function useForm(initialValues, validate) {
  const [values, setValuesState] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValues = useCallback((next) => {
    setValuesState((prev) => ({ ...prev, ...next }));
  }, []);

  const setField = useCallback((name, value) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setField(name, value);
  }, [setField]);

  const handleCheckbox = useCallback((e) => {
    const { name, checked } = e.target;
    setField(name, checked);
  }, [setField]);

  const validateForm = useCallback(() => {
    if (!validate) return true;
    const errs = validate(values) || {};
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [validate, values]);

  const reset = useCallback((next = {}) => {
    setValuesState({ ...initialValues, ...next });
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // helpers memorizados opcionales
  const api = useMemo(() => ({
    values, errors, touched,
    handleChange, handleCheckbox,
    setField, setValues, reset, validateForm,
  }), [values, errors, touched, handleChange, handleCheckbox, setField, setValues, reset, validateForm]);

  return api;
}
