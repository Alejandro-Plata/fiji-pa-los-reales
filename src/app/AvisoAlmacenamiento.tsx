import { useState } from 'react';
import { almacenamientoDisponible } from '../dominio/almacen';
import { t } from '../textos/es';
import { useRecetetas } from './EstadoRecetetas';
import estilos from './AvisoAlmacenamiento.module.css';

/**
 * Avisos discretos bajo la cabecera (spec §6):
 * - localStorage no disponible (modo privado).
 * - recetetas dañadas que se han apartado al cargar.
 */
export function AvisoAlmacenamiento() {
  const [disponible] = useState(almacenamientoDisponible);
  const { corruptasNuevas, avisoCorruptasVisto } = useRecetetas();
  return (
    <>
      {!disponible && (
        <p role="status" className={estilos.aviso}>
          {t.app.avisoSinAlmacenamiento}
        </p>
      )}
      {corruptasNuevas > 0 && (
        <div role="alert" className={estilos.aviso}>
          <span>{t.app.corruptas(corruptasNuevas)}</span>
          <button type="button" className={estilos.cerrar} onClick={avisoCorruptasVisto}>
            {t.app.cerrar}
          </button>
        </div>
      )}
    </>
  );
}
