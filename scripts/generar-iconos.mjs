// Genera los iconos PNG (PWA y Android) a partir de public/logo.svg, renderizándolo con el
// Chromium de Playwright (ya instalado para las pruebas: no añade dependencias).
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const svg = readFileSync('public/logo.svg', 'utf8');
// El logo no tiene fondo. Donde el sistema exige un icono opaco (maskable de la PWA) se pone
// fondo blanco y el motivo se reduce hasta caber en la zona segura circular.
const reducido = (escala, fondo) => {
  const d = (512 * (1 - escala)) / 2;
  return svg
    .replace('</title>', `</title>${fondo ? `<rect width="512" height="512" fill="${fondo}"/>` : ''}<g transform="translate(${d} ${d}) scale(${escala})">`)
    .replace(/<\/svg>\s*$/, '</g></svg>');
};
// Maskable: zona segura = círculo de radio 40 %
const sangre = reducido(0.72, '#ffffff');
// Primer plano adaptativo de Android: zona segura = círculo de 66/108 dp; el fondo es una capa aparte (blanca)
const motivo = reducido(0.62);

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

async function png(contenido, tam, ruta, transparente = false) {
  await pagina.setViewportSize({ width: tam, height: tam });
  await pagina.setContent(
    `<html><body style="margin:0;background:transparent">${contenido.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body></html>`,
  );
  const buf = await pagina.screenshot({ omitBackground: transparente, clip: { x: 0, y: 0, width: tam, height: tam } });
  mkdirSync(join(ruta, '..'), { recursive: true });
  writeFileSync(ruta, buf);
}

// PWA
await png(svg, 192, 'public/iconos/icono-192.png', true);
await png(svg, 512, 'public/iconos/icono-512.png', true);
await png(sangre, 512, 'public/iconos/icono-maskable-512.png');
writeFileSync('public/icono.svg', svg);

// Windows (Electron): electron-builder genera el .ico desde este PNG de 512 px
await png(svg, 512, 'escritorio/icono.png', true);

// Android (Capacitor): iconos clásicos, redondos y primer plano adaptativo
const densidades = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, f] of Object.entries(densidades)) {
  const res = `android/app/src/main/res/mipmap-${d}`;
  await png(svg, Math.round(48 * f), `${res}/ic_launcher.png`, true);
  await png(svg, Math.round(48 * f), `${res}/ic_launcher_round.png`, true);
  await png(motivo, Math.round(108 * f), `${res}/ic_launcher_foreground.png`, true);
}
await navegador.close();
console.log('Iconos generados desde public/logo.svg');
