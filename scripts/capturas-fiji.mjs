// Genera las capturas de «Uso en Fiji» (public/capturas/) sin capturar la pantalla:
//  - Ventanas de Fiji: se pintan a sí mismas en PNG desde un script BeanShell (scripts/capturas-fiji/).
//  - Página de descargas de Fiji y pantallas de la app: navegador automatizado (Playwright).
// Uso: node scripts/capturas-fiji.mjs   (requiere Fiji en .fiji/ y `npm run build`)
import { execSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');
const FIJI = join(RAIZ, '.fiji', 'Fiji', 'fiji-windows-x64.exe');
export const TEMPORAL = mkdtempSync(join(tmpdir(), 'fplr-capturas-'));
const barra = (p) => p.replace(/\\/g, '/');

function matarFiji() {
  try {
    execSync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like '${join(RAIZ, '.fiji')}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`,
      { stdio: 'ignore' },
    );
  } catch {
    /* nada que cerrar */
  }
}

/** Ejecuta un script BeanShell dentro de Fiji (con interfaz) y espera a que Fiji se cierre. */
export function ejecutarBsh(script, lineasArgs, tiempoMs = 180_000) {
  matarFiji();
  const args = join(TEMPORAL, 'args.txt');
  writeFileSync(args, lineasArgs.join('\n'), 'utf8');
  const envoltorio = join(TEMPORAL, 'envoltorio.ijm');
  writeFileSync(
    envoltorio,
    [
      `call("java.lang.System.setProperty", "fplr.args", "${barra(args)}");`,
      `eval("bsh", File.openAsString("${barra(join(RAIZ, 'scripts', 'capturas-fiji', script))}"));`,
      // El script trabaja en su propio hilo y escribe fin.txt al terminar
      `while (!File.exists("${barra(join(lineasArgs[0], 'fin.txt'))}")) wait(500);`,
      'run("Quit");',
    ].join('\n'),
    'utf8',
  );
  return new Promise((ok) => {
    const p = spawn(FIJI, ['--console', '-macro', envoltorio], { windowsHide: false });
    let salida = '';
    p.stdout.on('data', (d) => (salida += d));
    p.stderr.on('data', (d) => (salida += d));
    const t = setTimeout(() => {
      matarFiji();
      ok({ salida, agotado: true });
    }, tiempoMs);
    p.on('close', () => {
      clearTimeout(t);
      ok({ salida, agotado: false });
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  mkdirSync(join(RAIZ, 'public', 'capturas'), { recursive: true });
  // Macro real de la plantilla «campo claro», con la versión actual en la cabecera
  const { version } = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'));
  const macro = join(TEMPORAL, 'Mamosferas_campo_claro.ijm');
  writeFileSync(
    macro,
    readFileSync(join(RAIZ, 'src', 'dominio', 'macros', '__snapshots__', 'mamosferas-campo-claro.ijm'), 'utf8')
      .replace(/Fiji pa los reales v[\d.]+ · [\d-]+/, `Fiji pa los reales v${version}`),
  );
  // 1. Editor de scripts (con el menú Language desplegado y sin él)
  await comprobar('editor', await ejecutarBsh('editor.bsh', [TEMPORAL, macro]), ['editor-completo.png', 'editor-lenguaje.png']);
  rmSync(join(TEMPORAL, 'fin.txt'), { force: true });

  // 2. Buscador de comandos (con recetetas instaladas en Plugins › Recetetas) y «Manage update sites»
  const recetetas = join(RAIZ, '.fiji', 'Fiji', 'scripts', 'Plugins', 'Recetetas');
  mkdirSync(recetetas, { recursive: true });
  const ejemplos = { 'mamosferas-campo-claro': 'Mamosferas_campo_claro', 'nucleos-dapi-marcador': 'Nucleos_DAPI_CD44', 'western-densitometria': 'WB_SOX2' };
  for (const [origen, destino] of Object.entries(ejemplos)) {
    copyFileSync(join(RAIZ, 'src', 'dominio', 'macros', '__snapshots__', `${origen}.ijm`), join(recetetas, `${destino}.ijm`));
  }
  try {
    await comprobar('ventanas', await ejecutarBsh('ventanas.bsh', [TEMPORAL], 300_000), ['buscador.png', 'sitios-csbdeep.png', 'sitios-stardist.png']);
  } finally {
    rmSync(recetetas, { recursive: true, force: true });
  }

  // 3. Composición final (recortes, resaltados, página de Fiji y pantallas de la app)
  await componer();
  console.log('Capturas en public/capturas/');
}

async function comprobar(nombre, r, esperados) {
  const faltan = esperados.filter((f) => !existsSync(join(TEMPORAL, f)));
  const errores = readdirSync(TEMPORAL).filter((f) => f.startsWith('error'));
  if (r.agotado || faltan.length) {
    const detalle = errores.map((f) => readFileSync(join(TEMPORAL, f), 'utf8').split('\n').slice(0, 6).join('\n')).join('\n');
    throw new Error(`Fiji (${nombre}): ${r.agotado ? 'tiempo agotado' : ''} faltan ${faltan.join(', ')}\n${detalle}`);
  }
}

/** Recorta, resalta y escribe las capturas finales en public/capturas/ (Playwright + canvas). */
async function componer() {
  const { chromium } = await import('@playwright/test');
  const destino = join(RAIZ, 'public', 'capturas');
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 800 }, locale: 'es-ES' });
  const datos = (f) => `data:image/${f.endsWith('.jpg') ? 'jpeg' : 'png'};base64,${readFileSync(f).toString('base64')}`;

  /** Dibuja piezas de imágenes en un lienzo y lo guarda como PNG. */
  const lienzo = async (archivo, ancho, alto, piezas) => {
    const b64 = await pagina.evaluate(
      async ({ ancho, alto, piezas, jpg }) => {
        const c = document.createElement('canvas');
        c.width = ancho;
        c.height = alto;
        const g = c.getContext('2d');
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, ancho, alto);
        for (const p of piezas) {
          if (p.img) {
            const im = new Image();
            im.src = p.img;
            await im.decode();
            const [sx, sy, sw, sh] = p.origen ?? [0, 0, im.width, im.height];
            const [dx, dy, dw, dh] = p.destino ?? [0, 0, sw, sh];
            g.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
          }
          if (p.resaltar) {
            const [x, y, w, h] = p.resaltar;
            g.strokeStyle = '#c2ef4e';
            g.lineWidth = 5;
            g.beginPath();
            g.roundRect(x, y, w, h, 8);
            g.stroke();
            g.strokeStyle = '#1f1633';
            g.lineWidth = 1.5;
            g.beginPath();
            g.roundRect(x - 3, y - 3, w + 6, h + 6, 10);
            g.stroke();
          }
        }
        return (jpg ? c.toDataURL('image/jpeg', 0.88) : c.toDataURL('image/png')).split(',')[1];
      },
      { ancho, alto, piezas, jpg: archivo.endsWith('.jpg') },
    );
    writeFileSync(join(destino, archivo), Buffer.from(b64, 'base64'));
  };

  // a. Página oficial de descargas de Fiji
  await pagina.goto('https://imagej.net/software/fiji/downloads', { waitUntil: 'load', timeout: 60_000 });
  await pagina.waitForTimeout(3000);
  await pagina.screenshot({ path: join(destino, 'a-descarga.png') });

  // b. Pantalla del macro en la app: resumen y botones para llevarlo a Fiji
  await lienzo('b-enviar.png', 1180, 470, [
    { img: datos(join(RAIZ, 'docs', 'capturas', '06-macro.png')), origen: [50, 90, 1180, 470] },
  ]);

  // c. Editor de scripts con Language › ImageJ Macro
  await lienzo('c-editor.png', 1164, 520, [{ img: datos(join(TEMPORAL, 'editor-lenguaje.png')), origen: [0, 0, 1164, 520] }]);

  // d. Botón Run (abajo a la izquierda del editor), resaltado
  const [rx, ry, rw, rh] = readFileSync(join(TEMPORAL, 'run.txt'), 'utf8').split('\n')[0].split(',').map(Number);
  await lienzo('d-run.png', 760, 330, [
    { img: datos(join(TEMPORAL, 'editor-completo.png')), origen: [0, 440, 760, 330] },
    { resaltar: [rx + 2, ry - 440 + 1, rw - 4, rh - 2] },
  ]);

  // f. Macros guardados en Plugins › Recetetas (buscador de comandos de Fiji)
  copyFileSync(join(TEMPORAL, 'buscador.png'), join(destino, 'f-menu.png'));

  // g. Manage update sites: CSBDeep y StarDist activados (dos búsquedas del mismo diálogo)
  const ancho = 964;
  await lienzo('g-update-sites.png', ancho, 2 * 210 + 16, [
    { img: datos(join(TEMPORAL, 'sitios-csbdeep.png')), origen: [0, 0, ancho, 210] },
    { img: datos(join(TEMPORAL, 'sitios-stardist.png')), origen: [0, 0, ancho, 210], destino: [0, 226, ancho, 210] },
  ]);

  // h. Imagen de control real generada por Fiji (validación con imágenes sintéticas)
  await lienzo('h-control.jpg', 960, 720, [
    { img: datos(join(RAIZ, 'scripts', 'salida', 'campo-claro', 'control', 'esferas_control.jpg')), destino: [0, 0, 960, 720] },
  ]);

  // e. Carpeta de resultados real (scripts/salida/campo-claro) con resumen.csv y miniatura de control
  const salida = join(RAIZ, 'scripts', 'salida', 'campo-claro');
  const resumen = readFileSync(join(salida, 'resumen.csv'), 'utf8').trim().split(/\r?\n/).map((l) => l.split(','));
  const fila = (celdas, tag) => `<tr>${celdas.map((c) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
  await pagina.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    body{margin:0;background:#fff;font:15px/1.5 "Segoe UI",system-ui,sans-serif;color:#1f1633}
    .marco{display:grid;grid-template-columns:330px 1fr;gap:24px;padding:28px;width:1124px}
    h2{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#79628c;margin:0 0 10px}
    ul{list-style:none;margin:0;padding:0;border:1px solid #cfcfdb;border-radius:12px}
    li{display:flex;justify-content:space-between;padding:9px 14px;border-top:1px solid #e5e7eb;font-family:Consolas,Menlo,monospace;font-size:14px}
    li:first-child{border-top:0} li span{color:#79628c;font-family:"Segoe UI",sans-serif;font-size:13px}
    li.sub{padding-left:34px}
    table{border-collapse:collapse;width:100%;font-family:Consolas,Menlo,monospace;font-size:14px;margin-bottom:18px}
    th,td{border:1px solid #cfcfdb;padding:6px 10px;text-align:left} th{background:#f0f0f0}
    img{width:100%;border-radius:12px;border:1px solid #cfcfdb}
  </style></head><body><div class="marco">
    <div><h2>Carpeta de resultados</h2><ul>
      <li>resumen.csv<span>una fila por imagen</span></li>
      <li>objetos.csv<span>una fila por esfera</span></li>
      <li>log.txt<span>registro</span></li>
      <li>control/<span>imágenes de control</span></li>
      <li class="sub">esferas_control.jpg</li>
      <li>rois/<span>selecciones</span></li>
      <li class="sub">esferas.zip</li>
    </ul></div>
    <div><h2>resumen.csv</h2><table>${fila(resumen[0], 'th')}${resumen.slice(1).map((r) => fila(r, 'td')).join('')}</table>
    <h2>control/esferas_control.jpg</h2><img src="${datos(join(salida, 'control', 'esferas_control.jpg'))}" alt=""></div>
  </div></body></html>`);
  await pagina.locator('.marco').screenshot({ path: join(destino, 'e-resultados.png') });

  await navegador.close();
}
