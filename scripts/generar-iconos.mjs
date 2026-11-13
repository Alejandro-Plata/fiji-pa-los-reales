// Genera los iconos PNG (PWA y Android) a partir de public/logo.svg, renderizándolo con el
// Chromium de Playwright (ya instalado para las pruebas: no añade dependencias).
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const svg = readFileSync('public/logo.svg', 'utf8');
// Versión a sangre (maskable / adaptativa de Android): fondo completo y motivo en la zona segura
const sangre = svg
  .replace('<rect width="512" height="512" rx="112" fill="#150f23"/>', '<rect width="512" height="512" fill="#150f23"/><g transform="translate(64 64) scale(0.75)">')
  .replace('</svg>', '</g></svg>');
// Solo el motivo, sin fondo (primer plano del icono adaptativo de Android)
const motivo = sangre.replace('<rect width="512" height="512" fill="#150f23"/>', '');

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
