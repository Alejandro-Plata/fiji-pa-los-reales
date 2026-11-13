import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const SINT = join(import.meta.dirname, '..', 'scripts', 'sinteticas');
test.skip(!existsSync(join(SINT, 'rapido', 'esferas_12mp.jpg')), 'Faltan las sintéticas: npm run sinteticas');

test('TIFF con escala: 8 esferas, igual que Fiji, con el aviso siempre visible', async ({ page }) => {
  await page.goto('/#/rapido');
  await expect(page.getByText('Resultado orientativo. Para datos publicables, debe usarse el macro en Fiji.')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles(join(SINT, 'esferas', 'esferas.tif'));
  await expect(page.getByTestId('recuento')).toHaveText('8 esferas', { timeout: 20_000 });
  await expect(page.getByText('Escala leída del archivo: 0,65 µm/píxel.')).toBeVisible();

  // Deslizadores en vivo: con 85 µm de mínimo quedan menos
  await page.getByLabel(/Diámetro mínimo/).fill('85');
  await expect(page.getByTestId('recuento')).not.toHaveText('8 esferas');
});

test('foto de 12 MP con CPU ×4: menos de 3 s y la interfaz no se bloquea', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/#/rapido');
  await page.locator('input[type=file]').setInputFiles(join(SINT, 'rapido', 'esferas_12mp.jpg'));
  await expect(page.getByText('Analizando la imagen…')).toBeVisible();
  // Mientras procesa, la página responde (el trabajo va en un Web Worker)
  const t0 = Date.now();
  await page.getByRole('button', { name: 'Abrir menú' }).or(page.getByRole('link', { name: 'Ajustes' })).first().hover();
  expect(Date.now() - t0).toBeLessThan(1000);

  await page.getByLabel('Micras por píxel (µm/píxel)').fill('0,26');
  await expect(page.getByTestId('recuento')).toHaveText('8 esferas', { timeout: 30_000 });
  const tiempo = await page.getByText(/Procesado en/).textContent();
  const segundos = Number(tiempo!.match(/([\d,]+) s/)![1]!.replace(',', '.'));
  expect(segundos).toBeLessThan(3);
});

test('calibrar con la barra de escala y guardar en la receteta', async ({ page }) => {
  // Receteta de esferas para recibir los ajustes
  await page.goto('/#/receteta/nueva?plantilla=mamosferas-campo-claro');
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar receteta' }).click();
  await expect(page).toHaveURL(/macro$/);

  await page.goto('/#/rapido');
  await page.locator('input[type=file]').setInputFiles(join(SINT, 'esferas_rgb', 'esferas_camara.jpg'));
  await expect(page.getByText('Se necesita la escala para medir en micras.')).toBeVisible({ timeout: 20_000 });

  // La imagen mide 1600 px de ancho: tocamos dos puntos separados 1000 px = 650 µm
  await page.getByRole('button', { name: 'Calibrar con la barra de escala' }).click();
  const lienzo = page.getByRole('img', { name: /Imagen analizada/ });
  await page.setViewportSize({ width: 1280, height: 1600 });
  await lienzo.scrollIntoViewIfNeeded();
  const caja = (await lienzo.boundingBox())!;
  const k = caja.width / 1600;
  await page.mouse.click(caja.x + 300 * k, caja.y + 50 * k);
  await page.mouse.click(caja.x + 1300 * k, caja.y + 50 * k);
  await expect(page.getByText('Puntos marcados: 2 de 2')).toBeVisible();
  await page.getByLabel('Longitud de la barra (µm)').fill('650');
  await page.getByRole('button', { name: 'Aplicar calibración' }).click();
  await expect(page.getByLabel('Micras por píxel (µm/píxel)')).toHaveValue(/^0,6[45]/);
  await expect(page.getByTestId('recuento')).toHaveText('8 esferas');

  await page.getByLabel(/Circularidad mínima/).fill('0.5');
  await page.getByRole('button', { name: 'Usar estos ajustes en la receteta' }).click();
  await expect(page.getByText(/Ajustes guardados en/)).toBeVisible();
  const r = await page.evaluate(() => JSON.parse(localStorage.getItem('recetetas:v1')!)[0]);
  expect(r.parametros.circularidadMin).toBe(0.5);
  expect(r.imagenes.escala.modo).toBe('manual');
  expect(r.imagenes.escala.micrasPorPixel).toBeCloseTo(0.65, 1);
});
