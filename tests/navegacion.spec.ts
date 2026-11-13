import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PANTALLAS } from './pantallas';

test('las seis pantallas son navegables', async ({ page }) => {
  for (const p of PANTALLAS) {
    await page.goto(p.ruta);
    await expect(page.locator('main h1').first()).toBeVisible();
  }
});

test('el menú hamburguesa abre la navegación en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/#/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).toBeHidden();
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(nav).toBeVisible();
  await nav.getByRole('link', { name: 'Ajustes' }).click();
  await expect(page.locator('main h1')).toHaveText('Ajustes');
  await expect(nav).toBeHidden();
});

test('barra inferior fija del asistente en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/#/receteta/nueva/esferas');
  const barra = page.getByRole('navigation', { name: 'Acciones del asistente' });
  await expect(barra).toBeVisible();
  const caja = await barra.boundingBox();
  expect(caja && Math.round(caja.y + caja.height)).toBe(700);
});

for (const p of PANTALLAS) {
  test(`accesibilidad: ${p.nombre} sin errores críticos`, async ({ page }) => {
    await page.goto(p.ruta);
    await page.locator('main h1').first().waitFor();
    const r = await new AxeBuilder({ page }).analyze();
    const graves = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(graves.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

test('funciona sin conexión tras la primera visita', async ({ page, context }) => {
  await page.goto('/#/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Recarga para que el service worker controle la página y precachee
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('main h1').first()).toBeVisible();
  await page.goto('/#/ajustes');
  await expect(page.locator('main h1')).toHaveText('Ajustes');
  await context.setOffline(false);
});
