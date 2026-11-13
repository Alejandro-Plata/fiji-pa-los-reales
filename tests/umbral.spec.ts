import { expect, test } from '@playwright/test';

test('calcular umbral desde el objetos.csv de un control negativo y guardarlo', async ({ page }) => {
  // Receteta de fluorescencia con un marcador
  await page.goto('/#/receteta/nueva?plantilla=nucleos-dapi-marcador');
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByLabel('Nombre de la receteta').fill('Control CD44');
  await page.getByRole('button', { name: 'Guardar receteta' }).click();
  await expect(page).toHaveURL(/macro$/);
  await page.getByRole('link', { name: 'Calcular umbral' }).click();

  // CSV con 0..200 en la columna del marcador: el percentil 99 es 198
  const filas = Array.from({ length: 201 }, (_, i) => `${i + 1},ctrl,${i},${i},100`);
  const csv = ['Imagen,Nucleo,Marcador_media,Brillo_nuclear,Area_um2', ...filas].join('\n');
  await page.locator('input[type=file]').setInputFiles({
    name: 'objetos.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv),
  });
  await expect(page.getByTestId('umbral-propuesto')).toHaveText('198');
  await page.getByLabel(/Percentil/).fill('95');
  await expect(page.getByTestId('umbral-propuesto')).toHaveText('190');

  await page.getByRole('button', { name: 'Guardar umbral en la receteta' }).click();
  await expect(page.getByText('Umbral guardado para Marcador en «Control CD44»')).toBeVisible();
  const umbral = await page.evaluate(
    () => JSON.parse(localStorage.getItem('recetetas:v1')!)[0].parametros.marcadores[0].umbralPositivo,
  );
  expect(umbral).toBe(190);
});

test('un CSV sin columnas de marcador da un aviso claro', async ({ page }) => {
  await page.goto('/#/umbral');
  await page.locator('input[type=file]').setInputFiles({
    name: 'resumen.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Imagen,Esferas\nx,8\n'),
  });
  await expect(page.getByText(/no contiene columnas de marcador/)).toBeVisible();
});
