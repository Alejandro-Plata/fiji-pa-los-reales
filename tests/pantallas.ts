import type { Page } from '@playwright/test';

/** Pantallas y anchos que deben pasar las comprobaciones responsive (spec §4.12). */
export const ANCHOS = [320, 375, 414, 768, 1024, 1440] as const;

export const PANTALLAS = [
  { nombre: 'inicio', ruta: '/#/' },
  { nombre: 'asistente-tipo', ruta: '/#/receteta/nueva' },
  { nombre: 'asistente', ruta: '/#/receteta/nueva?plantilla=nucleos-dapi-marcador' },
  { nombre: 'asistente-esferas', ruta: '/#/receteta/demo' },
  { nombre: 'resultado', ruta: '/#/receteta/demo/macro' },
  { nombre: 'tutorial', ruta: '/#/tutorial' },
  { nombre: 'tutorial-final', ruta: '/#/tutorial?paso=8' },
  { nombre: 'instrucciones', ruta: '/#/fiji' },
  { nombre: 'ajustes', ruta: '/#/ajustes' },
  { nombre: 'rapido', ruta: '/#/rapido' },
  { nombre: 'importar', ruta: '/#/importar?r=zroto' },
  { nombre: 'umbral', ruta: '/#/umbral' },
] as const;

/** Guarda una receteta de demostración (id «demo») antes de cargar la página. */
export async function prepararDatos(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem('recetetas:v1')) return;
    const ahora = '2026-10-22T10:00:00.000Z';
    localStorage.setItem(
      'recetetas:v1',
      JSON.stringify([
        {
          id: 'demo',
          esquema: 1,
          nombre: 'Mamosferas MCF7 · día 7 con un nombre bastante largo',
          tipo: 'esferas',
          creada: ahora,
          modificada: ahora,
          parametros: { celulasSembradas: 1000 },
        },
      ]),
    );
  });
}
