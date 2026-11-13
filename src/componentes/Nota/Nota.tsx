import type { ReactNode } from 'react';
import estilos from './Nota.module.css';

/** Nota fija dentro de una pantalla (avisos de la spec, información). */
export function Nota({
  tipo = 'info',
  children,
}: {
  tipo?: 'info' | 'aviso' | 'error' | 'exito';
  children: ReactNode;
}) {
  return (
    <div className={estilos.nota} data-tipo={tipo} role={tipo === 'error' ? 'alert' : undefined}>
      {children}
    </div>
  );
}
