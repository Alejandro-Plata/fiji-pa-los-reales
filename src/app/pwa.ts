import { registerSW } from 'virtual:pwa-register';
import { esAppNativa } from './plataforma';

/** Registra el service worker (instalable y usable sin conexión). No se registra dentro de la app Android. */
export function registrarServiceWorker() {
  if (esAppNativa() || !('serviceWorker' in navigator)) return;
  registerSW({ immediate: true });
}
