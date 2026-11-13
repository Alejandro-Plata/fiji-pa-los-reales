import { expect, test } from '@playwright/test';

test('el tutorial se abre desde la portada y recorre las ocho diapositivas', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('link', { name: 'Ver tutorial' }).click();
  await expect(page.locator('main h1')).toHaveText('Tutorial');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Macros de Fiji sin programar');
  await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  await expect(page.getByTestId('figura-tutorial').locator('svg')).toBeVisible();

  for (let i = 2; i <= 8; i++) {
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.getByText(`${i} de 8`, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Compartir y conservar');
  await expect(page.getByRole('button', { name: 'Siguiente' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Crear una receteta' }).click();
  await expect(page.locator('main h1')).toHaveText('Nueva receteta');
});

test('teclado, índice y enlace directo a una diapositiva', async ({ page }) => {
  await page.goto('/#/tutorial?paso=5');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Ejecución en Fiji');
  await page.getByRole('button', { name: /^Ir a 6:/ }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Análisis rápido en el móvil');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Ejecución en Fiji');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Umbral desde un control negativo');
});

test('con «reducir movimiento» la figura se muestra completa', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/tutorial?paso=6');
  const recuento = page.getByTestId('figura-tutorial').getByText('8 esferas');
  await expect(recuento).toBeVisible();
  expect(await recuento.evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe('1');
});
