import { useEffect, type ReactNode } from 'react';
import { t } from '../../textos/es';
import estilos from './Pantalla.module.css';

interface Props {
  titulo: string;
  eyebrow?: string;
  /** Oculta visualmente el h1 (cuando la pantalla tiene su propia cabecera visual). */
  tituloOculto?: boolean;
  children?: ReactNode;
}

/** Envoltorio común de pantalla: título de documento, h1 y contenedor. */
export function Pantalla({ titulo, eyebrow, tituloOculto, children }: Props) {
  useEffect(() => {
    document.title = `${titulo} · ${t.app.nombre}`;
  }, [titulo]);

  return (
    <div className={`contenedor ${estilos.pantalla}`}>
      <header className={tituloOculto ? 'visualmente-oculto' : estilos.cabecera}>
        {eyebrow && <p className={`eyebrow ${estilos.eyebrow}`}>{eyebrow}</p>}
        <h1>{titulo}</h1>
      </header>
      {children}
    </div>
  );
}
