// @/services/upload.service.js
import api from '@/lib/axios';

/**
 * Sube un archivo (o varios) al backend.
 * Flask: asegurate de aceptar 'multipart/form-data' en /uploads
 *
 * @param {File|File[]} files - uno o varios archivos
 * @param {Object} [extra] - campos extra del formulario (por ej. tipo='dni_frente')
 * @param {(p:number)=>void} [onProgress] - callback 0..100
 * @returns {Promise<any>} respuesta del backend (por ej. { files: [{id, url, name, size}] })
 */
export async function uploadFiles(files, extra = {}, onProgress) {
  const form = new FormData();
  const list = Array.isArray(files) ? files : [files];
  list.forEach((f) => form.append('files', f));
  Object.entries(extra).forEach(([k, v]) => form.append(k, v));

  const { data } = await api.post('/uploads', form, {
    onUploadProgress: (evt) => {
      if (!onProgress || !evt.total) return;
      const pct = Math.round((evt.loaded * 100) / evt.total);
      onProgress(pct);
    },
  });
  return data;
}

/**
 * Obtiene la URL pública de un archivo si tu backend la sirve por id.
 * Útil para renderizar imágenes/documentos.
 */
export function fileUrl(idOrPath) {
  // Si viene completo (http...), devolver tal cual:
  if (/^https?:\/\//i.test(idOrPath)) return idOrPath;
  const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
  return `${base}/uploads/${idOrPath}`;
}

/** Borra un archivo por id (si tu backend lo permite) */
export async function removeFile(fileId) {
  const { data } = await api.delete(`/uploads/${fileId}`);
  return data;
}
