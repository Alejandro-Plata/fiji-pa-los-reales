import { defineConfig } from 'vitest/config';

// Validación con Fiji real: lenta y secuencial (una sola instancia de Fiji a la vez)
export default defineConfig({
  define: { __VERSION_APP__: '"prueba"' },
  test: {
    include: ['scripts/**/*.test.ts'],
    environment: 'node',
    testTimeout: 600_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
