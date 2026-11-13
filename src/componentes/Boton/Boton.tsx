import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import estilos from './Boton.module.css';

export type VarianteBoton = 'primario' | 'invertido' | 'secundario' | 'fantasma' | 'token';

interface PropsComunes {
  variante?: VarianteBoton;
  anchoCompleto?: boolean;
  children: ReactNode;
}

function clases(variante: VarianteBoton, anchoCompleto?: boolean, extra?: string) {
  return [estilos.boton, estilos[variante], anchoCompleto ? estilos.anchoCompleto : '', extra ?? '']
    .filter(Boolean)
    .join(' ');
}

export function Boton({
  variante = 'primario',
  anchoCompleto,
  className,
  type = 'button',
  children,
  ...resto
}: PropsComunes & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={clases(variante, anchoCompleto, className)} {...resto}>
      {children}
    </button>
  );
}

/** Enlace con aspecto de botón (navegación interna). */
export function BotonEnlace({
  variante = 'primario',
  anchoCompleto,
  to,
  children,
}: PropsComunes & { to: string }) {
  return (
    <Link to={to} className={clases(variante, anchoCompleto)}>
      {children}
    </Link>
  );
}
