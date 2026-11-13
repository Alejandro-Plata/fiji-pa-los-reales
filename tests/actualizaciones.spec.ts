import { expect, test } from '@playwright/test';

test('web: Ajustes ofrece descargar el APK publicado', async ({ page }) => {
  await page.route('**/descargas/version.json', (r) =>
    r.fulfill({
      json: {
        version: '1.1.0',
        apk: 'fiji-pa-los-reales-1.1.0.apk',
        tamano: 5_452_595,
        publicada: '2026-11-14',
        novedades: ['Tutorial'],
        windows: { instalador: 'fiji-pa-los-reales-1.1.0-instalador.exe', tamano: 121_900_000 },
      },
    }),
  );
  await page.goto('/#/ajustes');
  const seccion = page.getByRole('region', { name: 'Actualizaciones' });
  await expect(seccion.getByText('La versión web se actualiza automáticamente.')).toBeVisible();
  const enlace = seccion.getByRole('link', { name: /Descargar APK 1\.1\.0 · 5,2 MB/ });
  await expect(enlace).toBeVisible();
  expect(await enlace.getAttribute('href')).toMatch(/\/descargas\/fiji-pa-los-reales-1\.1\.0\.apk$/);
  const windows = seccion.getByRole('link', { name: /Descargar instalador 1\.1\.0 · 116,3 MB/ });
  await expect(windows).toBeVisible();
  expect(await windows.getAttribute('href')).toMatch(/\/descargas\/fiji-pa-los-reales-1\.1\.0-instalador\.exe$/);
});

test('web: sin publicación no se muestra la descarga', async ({ page }) => {
  await page.route('**/descargas/version.json', (r) => r.fulfill({ status: 404, body: '' }));
  await page.goto('/#/ajustes');
  const seccion = page.getByRole('region', { name: 'Actualizaciones' });
  await expect(seccion.getByText('La versión web se actualiza automáticamente.')).toBeVisible();
  await expect(seccion.getByRole('link')).toHaveCount(0);
});
