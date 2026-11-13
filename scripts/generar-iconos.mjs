// Genera iconos PNG PROVISIONALES (la diseñadora aportará los definitivos).
// Fondo {colors.primary} con un cuadrado {colors.accent-lime} centrado. Sin dependencias.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const FONDO = [0x15, 0x0f, 0x23];
const ACENTO = [0xc2, 0xef, 0x4e];

const tablaCrc = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = tablaCrc[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const trozo = (tipo, datos) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length);
  const td = Buffer.concat([Buffer.from(tipo), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(tam, proporcionAcento) {
  const filas = [];
  const lado = Math.round(tam * proporcionAcento);
  const ini = Math.round((tam - lado) / 2);
  for (let y = 0; y < tam; y++) {
    const fila = Buffer.alloc(1 + tam * 3);
    for (let x = 0; x < tam; x++) {
      const dentro = x >= ini && x < ini + lado && y >= ini && y < ini + lado;
      const [r, g, b] = dentro ? ACENTO : FONDO;
      fila[1 + x * 3] = r;
      fila[2 + x * 3] = g;
      fila[3 + x * 3] = b;
    }
    filas.push(fila);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tam, 0);
  ihdr.writeUInt32BE(tam, 4);
  ihdr[8] = 8; // profundidad
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(Buffer.concat(filas))),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/iconos', { recursive: true });
writeFileSync('public/iconos/icono-192.png', png(192, 0.4));
writeFileSync('public/iconos/icono-512.png', png(512, 0.4));
// Maskable: el acento dentro de la zona segura (80 %)
writeFileSync('public/iconos/icono-maskable-512.png', png(512, 0.3));
writeFileSync(
  'public/icono.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#150f23"/><rect x="19" y="19" width="26" height="26" rx="4" fill="#c2ef4e"/></svg>\n`,
);
console.log('Iconos provisionales generados en public/');
