// @/features/novedades/components/NovedadCard.jsx
import React from 'react';
import { Card } from '@/components/common/Card';

export default function NovedadCard({ novedad, onOpen, 'aria-posinset': pos }) {
  const { titulo, resumen, fecha_publicacion } = novedad;
  return (
    <Card className="hover:shadow-lg transition"
          role="article"
          aria-roledescription="novedad"
          aria-posinset={pos}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--text)]">{titulo}</h3>
        <p className="text-sm text-[var(--text-2)]">{resumen}</p>
        <p className="text-xs opacity-80" aria-label="fecha de publicación">
          {new Date(fecha_publicacion).toLocaleDateString()}
        </p>
        <div className="mt-2">
          <button
            className="btn btn-primary"
            onClick={onOpen}
            aria-label={`Abrir detalle de ${titulo}`}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </Card>
  );
}
