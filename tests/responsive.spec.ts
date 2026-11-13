import { expect, test } from '@playwright/test';
import { ANCHOS, PANTALLAS } from './pantallas';

for (const ancho of ANCHOS) {
  for (const p of PANTALLAS) {
    test(`${p.nombre} a ${ancho}px: sin scroll horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto(p.ruta);
      await page.locator('main h1').first().waitFor();
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
      // Captura para que la diseñadora la revise
      await page.screenshot({ path: `tests/capturas/${p.nombre}-${ancho}.png`, fullPage: true });
    });
  }
}

test('objetivos táctiles de al menos 44 × 44 px en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const p of PANTALLAS) {
    await page.goto(p.ruta);
    await page.locator('main h1').first().waitFor();
    const pequenos = await page.$$eval('a, button, input, select, textarea', (els) =>
      els
        .filter((e) => {
          const r = e.getBoundingClientRect();
          const visible = r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
          const enLinea = e.tagName === 'A' && e.closest('p, li') && !e.className;
          return visible && !enLinea && (r.width < 44 || r.height < 44);
        })
        .map((e) => `${e.tagName} "${e.textContent?.trim()}"`),
    );
    expect(pequenos, `${p.nombre}`).toEqual([]);
  }
});
