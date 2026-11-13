import { registerSW } from 'virtual:pwa-register';

/** Registra el service worker (instalable y usable sin conexión). No se registra dentro de la app Android. */
export function registrarServiceWorker() {
  const enAppNativa = 'Capacitor' in window;
  if (enAppNativa || !('serviceWorker' in navigator)) return;
  registerSW({ immediate: true });
}
