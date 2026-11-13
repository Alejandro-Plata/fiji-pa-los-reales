import type { CapacitorConfig } from '@capacitor/cli';

// App Android: envuelve la misma app web (dist/). Todo sigue ocurriendo en el dispositivo.
const config: CapacitorConfig = {
  appId: 'es.fijipalosreales.app',
  appName: 'Fiji pa los reales',
  webDir: 'dist',
  android: {
    // Esquema https://localhost: contexto seguro, necesario para el portapapeles.
    allowMixedContent: false,
  },
};

export default config;
