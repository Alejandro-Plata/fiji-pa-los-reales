// Mide el análisis rápido de una foto de 12 MP en el móvil real, dentro de la app Android.
// Requisitos: móvil conectado con depuración USB autorizada y la app (debug) instalada.
// Uso: node scripts/medir-movil.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const adb = join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const run = (...a) => execFileSync(adb, a, { encoding: 'utf8' }).trim();

run('shell', 'am', 'force-stop', 'es.fijipalosreales.app');
run('shell', 'am', 'start', '-n', 'es.fijipalosreales.app/.MainActivity');
await new Promise((r) => setTimeout(r, 4000));
const pid = run('shell', 'pidof', 'es.fijipalosreales.app');
run('forward', 'tcp:9223', `localabstract:webview_devtools_remote_${pid}`);

const navegador = await chromium.connectOverCDP('http://localhost:9223');
const pagina = navegador.contexts()[0].pages()[0];
await pagina.evaluate(() => (location.hash = '#/rapido'));
await pagina.getByText('Hacer foto o elegir imagen').waitFor();

const foto = readFileSync('scripts/sinteticas/rapido/esferas_12mp.jpg').toString('base64');
await pagina.evaluate(async (b64) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const dt = new DataTransfer();
  dt.items.add(new File([bytes], 'esferas_12mp.jpg', { type: 'image/jpeg' }));
  const input = document.querySelector('input[type=file]');
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}, foto);

const t0 = Date.now();
await pagina.getByLabel('Micras por píxel (µm/píxel)').fill('0,26', { timeout: 60_000 });
await pagina.getByTestId('recuento').waitFor({ timeout: 60_000 });
const total = Date.now() - t0;
console.log('Recuento:', await pagina.getByTestId('recuento').textContent());
console.log('Procesado (worker):', await pagina.getByText(/Procesado en/).textContent());
console.log(`Desde elegir la foto hasta ver el resultado: ${(total / 1000).toFixed(2)} s`);
await navegador.close();
