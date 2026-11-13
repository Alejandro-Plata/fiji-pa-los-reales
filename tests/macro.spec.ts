import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });
test.describe.configure({ mode: 'serial' });

async function guardarPlantilla(page: import('@playwright/test').Page, plantilla: string) {
  await page.goto(`/#/receteta/nueva?plantilla=${plantilla}`);
  for (let i = 0; i < 6; i++) {
    const sig = page.getByRole('button', { name: 'Siguiente', exact: true });
    if (!(await sig.isVisible())) break;
    await sig.click();
  }
  await page.getByRole('button', { name: 'Guardar receteta' }).click();
  await expect(page).toHaveURL(/macro$/);
}

test('resultado: resumen, macro con números de línea y copiar', async ({ page }) => {
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  await expect(page.getByText(/Cuenta esferas de 50 µm o más/)).toBeVisible();
  // Orden de los botones (spec §5)
  const botones = page.locator('main').getByRole('button');
  await expect(botones.nth(0)).toHaveText('Copiar macro');
  await expect(botones.nth(1)).toHaveText('Descargar .ijm');
  await expect(botones.nth(2)).toHaveText('Enviar al ordenador');
  await expect(botones.nth(3)).toHaveText('Texto para Métodos');
  await expect(botones.nth(4)).toHaveText('Cómo lanzarlo en Fiji');

  await expect(page.locator('pre')).toContainText('size=1963.50-Infinity');
  await page.getByRole('button', { name: 'Copiar macro' }).click();
  await expect(page.getByText('Macro copiado')).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado.startsWith('// ====')).toBe(true);
  expect(copiado).toContain('requires("1.54f");');
  // Los números de línea no se copian
  expect(copiado).not.toMatch(/^1\s*\/\/ ====/);
});

test('descargar .ijm idéntico al macro', async ({ page }) => {
  await guardarPlantilla(page, 'mamosferas-contraste');
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar .ijm' }).click();
  const d = await descarga;
  expect(d.suggestedFilename()).toBe('Mamosferas_contraste_simple.ijm');
  const contenido = readFileSync((await d.path())!, 'utf8');
  expect(contenido).toContain('setAutoThreshold("Otsu");');
  expect(contenido).toContain('rolling=50 light');
});

test('enviar al ordenador sin hoja de compartir copia el enlace', async ({ page }) => {
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  await page.getByRole('button', { name: 'Enviar al ordenador' }).click();
  await expect(page.getByText('Enlace copiado')).toBeVisible();
});

test('portapapeles bloqueado: selecciona el macro y pide Ctrl+C', async ({ page }) => {
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
    document.execCommand = () => false;
  });
  await page.getByRole('button', { name: 'Copiar macro' }).click();
  await expect(page.getByText(/pulsa Ctrl\+C/)).toBeVisible();
  const seleccion = await page.evaluate(() => window.getSelection()?.toString() ?? '');
  expect(seleccion).toContain('requires("1.54f");');
});

test('ajustar líneas evita el scroll horizontal del código', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  const pre = page.locator('pre');
  const desborda = () => pre.evaluate((e) => e.scrollWidth > e.clientWidth);
  expect(await desborda()).toBe(true);
  await page.getByLabel('Ajustar líneas').check();
  expect(await desborda()).toBe(false);
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});

test('guía de Fiji como panel desde Resultado', async ({ page }) => {
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  await page.getByRole('button', { name: 'Cómo lanzarlo en Fiji' }).click();
  const panel = page.getByRole('dialog');
  await expect(panel.getByText('D. Lanzarlo')).toBeVisible();
  await expect(panel.getByText('Pulsa el botón Run')).toBeVisible();
  await panel.getByRole('button', { name: 'Cerrar' }).click();
  await expect(panel).toBeHidden();
});

test('texto para Métodos: copiar y cambiar idioma', async ({ page }) => {
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  await page.getByRole('button', { name: 'Texto para Métodos' }).click();
  const panel = page.getByRole('dialog');
  await expect(panel.getByText('Revisa el texto y adáptalo al estilo de tu tesis.')).toBeVisible();
  await expect(panel.getByText(/circularidad ≥ 0,4/)).toBeVisible();
  await panel.getByRole('button', { name: 'Cambiar idioma' }).click();
  await expect(panel.getByText(/circularity ≥ 0\.4/)).toBeVisible();
  await panel.getByRole('button', { name: 'Copiar', exact: true }).click();
  await expect(page.getByText('Texto copiado')).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toContain('Mammosphere images were analysed in Fiji');
  expect(copiado).toContain('Nature Methods, 9(7), 676–682');
});

test('el idioma por defecto de Métodos sale de Ajustes', async ({ page }) => {
  await page.goto('/#/ajustes');
  await page.getByRole('radio', { name: 'Inglés' }).check();
  await guardarPlantilla(page, 'mamosferas-campo-claro');
  await page.getByRole('button', { name: 'Texto para Métodos' }).click();
  await expect(page.getByRole('dialog').getByText(/Mammosphere images/)).toBeVisible();
});

test('vista previa del macro en vivo en escritorio', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/receteta/nueva?plantilla=mamosferas-campo-claro');
  const lateral = page.getByRole('complementary', { name: 'Vista previa' });
  await expect(lateral.locator('pre')).toContainText('size=1963.50-Infinity');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByLabel('Diámetro mínimo (µm)').fill('60');
  await expect(lateral.locator('pre')).toContainText('size=2827.43-Infinity');
  // Con un error, la vista previa espera
  await page.getByLabel('Diámetro mínimo (µm)').fill('5');
  await expect(lateral.getByText('Corrige los campos marcados')).toBeVisible();
});

test('instrucciones: pasos plegables, huecos de captura y errores comunes', async ({ page }) => {
  await page.goto('/#/fiji');
  await expect(page.getByText('A. Si aún no tienes Fiji')).toBeVisible();
  await page.getByText('C. Abrir el macro en Fiji (elige una)').click();
  await expect(page.getByText(/Language › IJ1 Macro\. Este paso es imprescindible/)).toBeVisible();
  await expect(page.getByRole('img', { name: /Editor de scripts de Fiji/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Errores comunes' })).toBeVisible();
  await expect(page.getByText('Edit › Options › Memory & Threads', { exact: false })).toBeVisible();
});
