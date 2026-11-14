// Genera las capturas del README en docs/capturas/ a partir de la app compilada.
// Uso: npm run build && npm run sinteticas && node scripts/capturas-readme.mjs
// (levanta vite preview en el puerto 4174 y lo cierra al terminar).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4174/';
const SALIDA = 'docs/capturas';
mkdirSync(SALIDA, { recursive: true });

const servidor = spawn('npx', ['vite', 'preview', '--port', '4174', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {
    /* aún arrancando */
  }
  await new Promise((r) => setTimeout(r, 500));
}

const ahora = '2026-11-10T10:00:00.000Z';
const recetetas = [
  {
    id: 'demo',
    esquema: 1,
    nombre: 'Mamosferas MCF7 · día 7',
    descripcion: 'Campo claro, objetivo 4×. Criterio ≥ 50 µm.',
    tipo: 'esferas',
    favorita: true,
    creada: ahora,
    modificada: ahora,
    parametros: { celulasSembradas: 1000, escala: 'manual', micrasPorPixel: 1.6 },
  },
  {
    id: 'fluo',
    esquema: 1,
    nombre: 'DAPI + CD44 · confocal 20×',
    tipo: 'fluorescencia',
    creada: ahora,
    modificada: '2026-11-08T10:00:00.000Z',
    parametros: { marcadores: [{ nombre: 'CD44', canal: 2, umbralPositivo: 42 }] },
  },
  {
    id: 'wb',
    esquema: 1,
    nombre: 'WB SOX2 / β-actina',
    tipo: 'western',
    creada: ahora,
    modificada: '2026-11-05T10:00:00.000Z',
    parametros: { nombreProteina: 'SOX2' },
  },
];

const navegador = await chromium.launch();
const nuevaPagina = async (ancho, alto, escala = 1) => {
  const ctx = await navegador.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: escala,
    locale: 'es-ES',
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript((r) => {
    if (!localStorage.getItem('recetetas:v1')) localStorage.setItem('recetetas:v1', JSON.stringify(r));
  }, recetetas);
  // Ajustes › Actualizaciones: la publicación real
  await ctx.route('**/descargas/version.json', async (ruta) => {
    try {
      const r = await fetch('https://fiji-pa-los-reales.vercel.app/descargas/version.json');
      await ruta.fulfill({ json: await r.json() });
    } catch {
      await ruta.fulfill({ status: 404, body: '' });
    }
  });
  return ctx.newPage();
};
const ir = async (p, hash) => {
  await p.goto(`${BASE}#${hash}`);
  await p.locator('main h1').first().waitFor();
  await p.waitForTimeout(400);
};
const foto = (p, nombre, opciones = {}) => p.screenshot({ path: `${SALIDA}/${nombre}.png`, ...opciones });

try {
  // ---------- Escritorio ----------
  const p = await nuevaPagina(1280, 800);

  await ir(p, '/');
  await foto(p, '01-inicio');
  await foto(p, '02-inicio-recetetas', { fullPage: true, clip: { x: 0, y: 560, width: 1280, height: 760 } });

  await ir(p, '/tutorial?paso=1');
  await foto(p, '03-tutorial');

  await ir(p, '/receteta/nueva');
  await foto(p, '04-asistente-tipo');

  await ir(p, '/receteta/demo');
  await p.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'Información' }).first().click();
  await foto(p, '05-asistente-deteccion');

  await ir(p, '/receteta/demo/macro');
  await foto(p, '06-macro');
  await p.getByRole('button', { name: 'Texto para Métodos' }).click();
  await p.getByRole('dialog').waitFor();
  await p.waitForTimeout(300);
  await foto(p, '07-metodos');
  await p.keyboard.press('Escape');

  await ir(p, '/fiji');
  await p.getByText('D. Ejecución').click();
  await p.waitForTimeout(300);
  await foto(p, '08-uso-en-fiji');

  if (existsSync('scripts/sinteticas/esferas/esferas.tif')) {
    await ir(p, '/rapido');
    await p.locator('input[type=file]').setInputFiles('scripts/sinteticas/esferas/esferas.tif');
    await p.getByTestId('recuento').waitFor({ timeout: 30_000 });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    await foto(p, '09-analisis-rapido', { fullPage: true });
  }

  await ir(p, '/umbral');
  // Control negativo simulado: 300 núcleos con brillo de fondo (aprox. normal, media 30)
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  const filas = Array.from({ length: 300 }, (_, i) => {
    const g = Array.from({ length: 6 }, azar).reduce((a, b) => a + b, 0) - 3;
    return `ctrl_${1 + Math.floor(i / 100)}.tif,${(i % 100) + 1},${(30 + g * 6).toFixed(2)},${(120 + g * 15).toFixed(1)},${(80 + g * 20).toFixed(1)}`;
  });
  await p.locator('input[type=file]').setInputFiles({
    name: 'objetos.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(['Imagen,Nucleo,CD44_media,DAPI_media,Area_um2', ...filas].join('\n')),
  });
  await p.getByTestId('umbral-propuesto').waitFor();
  await p.waitForTimeout(300);
  await foto(p, '10-umbral', { fullPage: true });

  await ir(p, '/ajustes');
  await p.getByRole('link', { name: /Descargar APK/ }).waitFor({ timeout: 10_000 }).catch(() => {});
  await p.waitForTimeout(400);
  await foto(p, '11-ajustes', { fullPage: true });

  // ---------- Móvil ----------
  const m = await nuevaPagina(390, 844, 2);
  await ir(m, '/');
  await foto(m, '12-movil-inicio');
  await ir(m, '/receteta/demo');
  await foto(m, '13-movil-asistente');
  if (existsSync('scripts/sinteticas/esferas/esferas.tif')) {
    await ir(m, '/rapido');
    await m.locator('input[type=file]').setInputFiles('scripts/sinteticas/esferas/esferas.tif');
    await m.getByTestId('recuento').waitFor({ timeout: 30_000 });
    await m.locator('canvas').first().scrollIntoViewIfNeeded();
    await m.waitForTimeout(400);
    await foto(m, '14-movil-rapido');
  }

  // ---------- Resultados reales de Fiji (validaciones de scripts/validar-macros.test.ts) ----------
  const control = [
    ['scripts/salida/campo-claro/control/esferas_control.jpg', '15-fiji-control-esferas.jpg'],
    ['scripts/salida/fluo-intensidades/control/fluo_control.jpg', '16-fiji-control-fluorescencia.jpg'],
  ];
  for (const [origen, destino] of control) if (existsSync(origen)) copyFileSync(origen, `${SALIDA}/${destino}`);
} finally {
  await navegador.close();
  if (process.platform === 'win32') spawn('taskkill', ['/PID', String(servidor.pid), '/T', '/F']);
  else servidor.kill();
}
console.log(`Capturas en ${SALIDA}/`);
