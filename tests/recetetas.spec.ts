import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

async function crearDesdePlantilla(page: Page, plantilla: string, nombre: string) {
  await page.goto('/#/');
  await page.getByRole('button', { name: `Usar plantilla: ${plantilla}` }).click();
  await expect(page.getByText('Revisa la escala y el tamaño mínimo')).toBeVisible();
  // Recorre los pasos con «Siguiente» hasta el último
  for (let i = 0; i < 6; i++) {
    const sig = page.getByRole('button', { name: 'Siguiente', exact: true });
    if (!(await sig.isVisible())) break;
    await sig.click();
  }
  const campoNombre = page.getByLabel('Nombre de la receteta');
  await campoNombre.fill(nombre);
  await page.getByRole('button', { name: 'Guardar receteta' }).click();
  await expect(page).toHaveURL(/#\/receteta\/[^/]+\/macro$/);
}

test('crear desde plantilla, ajustar con coma decimal y guardar', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('button', { name: 'Usar plantilla: Mamosferas · campo claro' }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click(); // Detección
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click(); // Filtros

  // Validación en vivo: mínimo < máximo
  await page.getByLabel('Diámetro máximo (µm)').fill('40');
  await expect(page.getByText('El diámetro mínimo debe ser menor que el máximo')).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Filtros' })).toBeVisible(); // no avanza
  await page.getByLabel('Diámetro máximo (µm)').fill('');

  // Coma decimal
  await page.getByLabel('Circularidad mínima (0–1)').fill('0,55');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click(); // Resultados
  await page.getByLabel('Células sembradas por pocillo').fill('1000');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click(); // Nombre

  // El nombre de la plantilla viene relleno
  await expect(page.getByLabel('Nombre de la receteta')).toHaveValue('Mamosferas · campo claro');
  await page.getByLabel('Nombre de la receteta').fill('MCF7 día 7');
  await page.getByRole('button', { name: 'Guardar receteta' }).click();

  await expect(page.getByText('Receteta guardada')).toBeVisible();
  await expect(page.getByText(/circularidad ≥ 0,55/)).toBeVisible();
  await expect(page.getByText(/SFE con 1000 células/)).toBeVisible();

  await page.goto('/#/');
  await expect(page.getByRole('link', { name: 'MCF7 día 7' })).toBeVisible();
});

test('elegir tipo, borrador automático y aviso al salir sin guardar', async ({ page }) => {
  await page.goto('/#/receteta/nueva');
  await page.getByRole('link', { name: /Fluorescencia/ }).click();
  await expect(page.getByText('Paso 1 de 5')).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('radio', { name: /StarDist/ }).check();

  // Salir: aparece el aviso
  await page.getByRole('link', { name: 'Fiji pa los reales' }).first().click();
  await expect(page.getByRole('heading', { name: '¿Salir sin guardar?' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(page.getByText('Paso 2 de 5')).toBeVisible();

  // Recarga: se recupera el borrador
  await page.reload();
  await expect(page.getByText('Hemos recuperado el borrador')).toBeVisible();
  await expect(page.getByRole('radio', { name: /StarDist/ })).toBeChecked();
  await page.getByRole('button', { name: 'Empezar de cero' }).click();
  await expect(page.getByText('Paso 1 de 5')).toBeVisible();
});

test('ayuda «¿Qué es esto?» se abre con toque o teclado', async ({ page }) => {
  await page.goto('/#/receteta/nueva/esferas');
  const ayuda = page.getByText(/^Si la imagen tiene varios canales/);
  await expect(ayuda).toBeHidden();
  const boton = page.getByRole('button', { name: '¿Qué es esto?' }).nth(2);
  await boton.focus();
  await page.keyboard.press('Enter');
  await expect(ayuda).toBeVisible();
});

test('editar, duplicar, renombrar y borrar con deshacer', async ({ page }) => {
  await crearDesdePlantilla(page, 'Western blot · densitometría', 'WB SOX2');
  await page.goto('/#/');

  const tarjeta = () => page.getByRole('article').filter({ hasText: 'WB SOX2' }).first();

  // Duplicar
  await tarjeta().getByRole('button', { name: 'Más acciones para «WB SOX2»' }).click();
  await tarjeta().getByRole('button', { name: 'Duplicar' }).click();
  await expect(page.getByRole('link', { name: 'WB SOX2 (copia)' })).toBeVisible();

  // Renombrar la copia
  const copia = page.getByRole('article').filter({ hasText: 'WB SOX2 (copia)' });
  await copia.getByRole('button', { name: /Más acciones/ }).click();
  await copia.getByRole('button', { name: 'Renombrar' }).click();
  await page.getByLabel('Nuevo nombre').fill('WB β-actina');
  await page.getByRole('button', { name: 'Guardar nombre' }).click();
  await expect(page.getByRole('link', { name: 'WB β-actina' })).toBeVisible();

  // Editar
  await page.getByRole('link', { name: 'WB β-actina' }).click();
  await expect(page.getByRole('heading', { name: 'Editar receteta' })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByLabel('Proteína').fill('ACTB');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Proteína: ACTB')).toBeVisible();

  // Borrar y deshacer
  await page.goto('/#/');
  const wb = page.getByRole('article').filter({ hasText: 'WB β-actina' });
  await wb.getByRole('button', { name: /Más acciones/ }).click();
  await wb.getByRole('button', { name: 'Borrar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Borrar' }).click();
  await expect(page.getByRole('link', { name: 'WB β-actina' })).toBeHidden();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByRole('link', { name: 'WB β-actina' })).toBeVisible();
});

test('favorita: se marca y sube arriba', async ({ page }) => {
  await crearDesdePlantilla(page, 'Mamosferas · contraste simple', 'Primera');
  await crearDesdePlantilla(page, 'Mamosferas · contraste simple', 'Segunda');
  await page.goto('/#/');
  await page.getByRole('button', { name: 'Marcar «Primera» como favorita' }).click();
  await expect(page.getByRole('article').first()).toContainText('Primera');
});

// El portapapeles del navegador se comparte entre pruebas: las que lo usan van en serie
test.describe.configure({ mode: 'serial' });

test('compartir por enlace y abrirlo en otro navegador recupera la receteta idéntica', async ({
  page,
  browser,
}) => {
  await crearDesdePlantilla(page, 'Núcleos DAPI + marcador', 'DAPI CD44');
  await page.getByRole('button', { name: 'Compartir' }).click();
  await expect(page.getByText('Enlace copiado')).toBeVisible();
  const enlace = await page.evaluate(() => navigator.clipboard.readText());
  expect(enlace).toMatch(/#\/importar\?r=z/);
  const original = await page.evaluate(() => JSON.parse(localStorage.getItem('recetetas:v1')!)[0]);

  // Otro navegador (contexto limpio)
  const otro = await browser.newContext();
  const p2 = await otro.newPage();
  await p2.goto(enlace);
  await expect(p2.getByRole('heading', { name: '¿Guardar esta receteta?' })).toBeVisible();
  await p2.getByRole('button', { name: 'Guardar receteta' }).click();
  await expect(p2).toHaveURL(/macro$/);
  const importada = await p2.evaluate(() => JSON.parse(localStorage.getItem('recetetas:v1')!)[0]);
  const sinMeta = ({ id, creada, modificada, favorita, origen, ...r }: Record<string, unknown>) => {
    void [id, creada, modificada, favorita, origen];
    return r;
  };
  expect(sinMeta(importada)).toEqual(sinMeta(original));
  await otro.close();
});

test('un enlace manipulado se rechaza con un mensaje claro', async ({ page }) => {
  await page.goto('/#/importar?r=zESTOnoESunaRECETETA');
  await expect(page.getByText('El enlace está incompleto o dañado')).toBeVisible();
});

test('si el nombre existe propone «Nombre (2)» al importar', async ({ page }) => {
  await crearDesdePlantilla(page, 'Mamosferas · campo claro', 'Repetida');
  await page.getByRole('button', { name: 'Compartir' }).click();
  await expect(page.getByText('Enlace copiado')).toBeVisible();
  const enlace = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto(enlace);
  await expect(page.getByText('Se guardará como «Repetida (2)»')).toBeVisible();
});

test('exportar e importar .json desde Ajustes', async ({ page }) => {
  await crearDesdePlantilla(page, 'Mamosferas · campo claro', 'Para copia');
  await page.goto('/#/ajustes');
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar recetetas' }).click();
  const archivo = await (await descarga).path();
  const contenido = readFileSync(archivo, 'utf8');
  expect(JSON.parse(contenido).recetetas).toHaveLength(1);

  // Borrar todo con doble confirmación
  await page.getByRole('button', { name: 'Borrar todos los datos' }).click();
  await page.getByRole('button', { name: 'Sí, borrar' }).click();
  await page.getByRole('button', { name: 'Borrar definitivamente' }).click();
  await expect(page.getByText('Se han borrado todos los datos.')).toBeVisible();

  await page.locator('input[type=file]').setInputFiles(archivo);
  await expect(page.getByText('Importada 1 receteta.')).toBeVisible();
  await page.goto('/#/');
  await expect(page.getByRole('link', { name: 'Para copia' })).toBeVisible();
});

test('recetetas corruptas se apartan sin perder las demás', async ({ page }) => {
  await crearDesdePlantilla(page, 'Mamosferas · campo claro', 'Buena');
  await page.evaluate(() => {
    const lista = JSON.parse(localStorage.getItem('recetetas:v1')!);
    lista.push({ id: 'x', tipo: 'esferas', nombre: '', esquema: 1 });
    localStorage.setItem('recetetas:v1', JSON.stringify(lista));
  });
  await page.goto('/#/');
  await page.reload();
  await expect(page.getByText(/Una receteta guardada estaba dañada/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buena' })).toBeVisible();
  const apartadas = await page.evaluate(() => JSON.parse(localStorage.getItem('recetetas:corruptas')!));
  expect(apartadas).toHaveLength(1);
  await page.goto('/#/ajustes');
  await expect(page.getByRole('button', { name: 'Descargar recetetas dañadas' })).toBeVisible();
});

test('buscar y filtrar con más de 6 recetetas', async ({ page }) => {
  await page.goto('/#/');
  await page.evaluate(() => {
    const ahora = new Date().toISOString();
    const lista = Array.from({ length: 7 }, (_, i) => ({
      id: `id-${i}`,
      esquema: 1,
      nombre: i === 6 ? 'Western especial' : `Esferas ${i}`,
      tipo: i === 6 ? 'western' : 'esferas',
      creada: ahora,
      modificada: ahora,
    }));
    localStorage.setItem('recetetas:v1', JSON.stringify(lista));
  });
  await page.reload();
  await page.getByPlaceholder('Buscar por nombre').fill('especial');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByPlaceholder('Buscar por nombre').fill('');
  await page.getByRole('button', { name: 'Western blot', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
});
