import type { ReactNode } from 'react';
import { useTecladoAbierto } from '../../app/useTecladoAbierto';
import { t } from '../../textos/es';
import estilos from './BarraInferior.module.css';

export function BarraInferior({ children }: { children: ReactNode }) {
  const teclado = useTecladoAbierto();
  return (
    <>
      <div className={estilos.reserva} aria-hidden="true" />
      <nav
        className={estilos.barra}
        aria-label={t.barraInferior.acciones}
        data-teclado={teclado ? 'abierto' : 'cerrado'}
      >
        {children}
      </nav>
    </>
  );
}
