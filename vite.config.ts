/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  // Rutas relativas: funciona en Vercel, en cualquier subcarpeta y dentro de la app Android (Capacitor).
  base: './',
  define: {
    __VERSION_APP__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'logo.svg', 'capturas/*'],
      manifest: {
        name: 'Fiji pa los reales',
        short_name: 'Fiji pa los reales',
        description: 'Genera macros de Fiji a partir de opciones elegidas con botones.',
        lang: 'es-ES',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#150f23',
        icons: [
          { src: 'iconos/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'iconos/icono-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'iconos/icono-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2,ijm}'],
        navigateFallback: 'index.html',
        // Descargas del APK y version.json: siempre a la red, nunca la página de la app
        navigateFallbackDenylist: [/\/descargas\//],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
