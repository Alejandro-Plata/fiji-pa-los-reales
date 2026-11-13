import { registerSW } from 'virtual:pwa-register';
import { esAppNativa, esEscritorio } from './plataforma';

/**
 * Registra el service worker (instalable y usable sin conexión). No se registra dentro de las apps
 * de Android ni de Windows: ya llevan la web dentro y se actualizan desde Ajustes.
 */
export function registrarServiceWorker() {
  if (esAppNativa() || esEscritorio() || !('serviceWorker' in navigator)) return;
  registerSW({ immediate: true });
}
