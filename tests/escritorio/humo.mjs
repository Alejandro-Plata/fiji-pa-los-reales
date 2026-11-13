// Prueba de humo de la app de Windows empaquetada (release/win-unpacked).
// Uso: npm run windows && node tests/escritorio/humo.mjs
import { _electron as electron } from '@playwright/test';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const exe = 'release/win-unpacked/Fiji pa los reales.exe';
assert.ok(existsSync(exe), `No existe ${exe}: ejecutar antes npm run windows`);

const app = await electron.launch({ executablePath: exe });
const v = await app.firstWindow();
try {
  await v.locator('main h1').first().waitFor();
  assert.equal(await v.title(), 'Fiji pa los reales');
  assert.ok(v.url().startsWith('app://fplr/'), v.url());
  assert.equal(await v.evaluate(() => typeof window.fplrEscritorio), 'object');
  assert.equal(await v.evaluate(() => navigator.serviceWorker?.controller ?? null), null);

  // Ajustes: rama de escritorio
  await v.evaluate(() => (location.hash = '#/ajustes'));
  await v.getByText('Versión instalada: 1.1.0').waitFor();

  // Análisis rápido: el worker debe funcionar bajo app://
  if (existsSync('scripts/sinteticas/esferas/esferas.tif')) {
    await v.evaluate(() => (location.hash = '#/rapido'));
    await v.locator('input[type=file]').setInputFiles('scripts/sinteticas/esferas/esferas.tif');
    await v.getByTestId('recuento').waitFor({ timeout: 30_000 });
    const recuento = await v.getByTestId('recuento').textContent();
    assert.equal(recuento?.trim(), '8 esferas');
    console.log('Análisis rápido en Electron:', recuento);
  }

  // Tutorial y navegación interna
  await v.evaluate(() => (location.hash = '#/tutorial?paso=3'));
  await v.getByRole('heading', { level: 2, name: 'Configuración paso a paso' }).waitFor();
  console.log('Prueba de humo de Windows: correcta');
} finally {
  await app.close();
}
