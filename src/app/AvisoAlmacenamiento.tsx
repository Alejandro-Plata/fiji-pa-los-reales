import { useState } from 'react';
import { almacenamientoDisponible } from '../dominio/almacen';
import { t } from '../textos/es';
import estilos from './AvisoAlmacenamiento.module.css';

/** Aviso discreto si localStorage no funciona (modo privado). Spec §6. */
export function AvisoAlmacenamiento() {
  const [disponible] = useState(almacenamientoDisponible);
  if (disponible) return null;
  return (
    <p role="status" className={estilos.aviso}>
      {t.app.avisoSinAlmacenamiento}
    </p>
  );
}
