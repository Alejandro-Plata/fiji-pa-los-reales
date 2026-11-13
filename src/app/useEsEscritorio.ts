import { useSyncExternalStore } from 'react';

const CONSULTA = '(min-width: 1024px)'; // punto de corte de escritorio (spec §4)

function suscribir(cb: () => void) {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/** true en escritorio (≥ 1024 px). Evita generar la vista previa del macro en el móvil. */
export function useEsEscritorio(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
}
