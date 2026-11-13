import type { ReactNode } from 'react';
import estilos from './Plegable.module.css';

interface Props {
  titulo: ReactNode;
  abierto?: boolean;
  children: ReactNode;
  id?: string;
}

/** Sección plegable con <details>: funciona con toque y teclado, sin JavaScript. */
export function Plegable({ titulo, abierto, children, id }: Props) {
  return (
    <details className={estilos.plegable} open={abierto} id={id}>
      <summary className={estilos.resumen}>{titulo}</summary>
      <div className={estilos.contenido}>{children}</div>
    </details>
  );
}
