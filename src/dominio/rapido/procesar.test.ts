/**
 * Prueba del análisis rápido con las sintéticas (spec §13/§14):
 * el recuento del navegador debe coincidir con el de Fiji (8 esferas) en ± 5 %.
 * Requiere las sintéticas: npm run sinteticas
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { apertura, filtrar, normalizar16, procesar, reescalar, rellenarHuecos } from './procesar';
import { leerTiff } from './tiff';
import { esquemaParametrosEsferas } from '../recetetas/esquemas';

const SINT = resolve(import.meta.dirname, '../../../scripts/sinteticas');
const hay = existsSync(join(SINT, 'esferas', 'esferas.tif'));

function cargar(ruta: string) {
  const b = readFileSync(ruta);
  return leerTiff(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
}

describe('operaciones básicas', () => {
  it('rellenar huecos', () => {
    // anillo 5×5 con hueco en el centro
    const m = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    ]);
    rellenarHuecos(m, 5, 5);
    expect(m[12]).toBe(1);
    expect(m[0]).toBe(0);
  });
  it('la apertura quita un píxel suelto', () => {
    const m = new Uint8Array(25);
    m[12] = 1;
    expect(apertura(m, 5, 5).every((v) => v === 0)).toBe(true);
  });
  it('normalizar 16 bits por percentiles', () => {
    const v = new Uint16Array(1000).map((_, i) => i * 60);
    const g = normalizar16(v);
    expect(g[0]).toBe(0);
    expect(g[999]).toBe(255);
  });
  it('reescala a 2048 px en el lado largo', () => {
    const r = reescalar(new Float32Array(4000 * 3000), 4000, 3000);
    expect(r.ancho).toBe(2048);
    expect(r.factor).toBeCloseTo(4000 / 2048);
  });
});

describe.runIf(hay)('coincide con Fiji en las sintéticas', () => {
  const PARAM = esquemaParametrosEsferas.parse({});
  const filtros = (umpp: number, p = PARAM) => ({
    micrasPorPixel: umpp,
    diametroMin: p.diametroMin,
    diametroMax: p.diametroMax,
    circularidadMin: p.circularidadMin,
    excluirBordes: p.excluirBordes,
  });

  it('lee la escala del TIFF de ImageJ', () => {
    expect(cargar(join(SINT, 'esferas', 'esferas.tif')).micrasPorPixel).toBeCloseTo(0.65, 4);
    expect(cargar(join(SINT, 'esferas', 'esferas_sin_escala.tif')).micrasPorPixel).toBeNull();
  });

  it('por bordes: 8 esferas (Fiji: 8)', () => {
    const img = cargar(join(SINT, 'esferas', 'esferas.tif'));
    const r = procesar(img.gris, img.ancho, img.alto, PARAM);
    expect(filtrar(r.objetos, filtros(0.65))).toHaveLength(8);
  });

  it('por contraste: 8 esferas (Fiji: 8)', () => {
    const img = cargar(join(SINT, 'esferas', 'esferas.tif'));
    const p = esquemaParametrosEsferas.parse({ metodo: 'umbral' });
    const r = procesar(img.gris, img.ancho, img.alto, p);
    expect(filtrar(r.objetos, filtros(0.65, p))).toHaveLength(8);
  });

  it('una foto de 12 MP reescalada da el mismo recuento y tarda menos de 3 s', () => {
    const img = cargar(join(SINT, 'esferas', 'esferas.tif'));
    // Ampliamos ×2,5 (4000 × 3000 = 12 MP) por vecino más cercano
    const W = 4000;
    const H = 3000;
    const grande = new Float32Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        grande[y * W + x] = img.gris[Math.floor(y / 2.5) * img.ancho + Math.floor(x / 2.5)]!;
    const t0 = performance.now();
    const rs = reescalar(grande, W, H);
    const r = procesar(rs.gris, rs.ancho, rs.alto, PARAM);
    const ms = performance.now() - t0;
    const umpp = (0.65 / 2.5) * rs.factor;
    expect(filtrar(r.objetos, filtros(umpp))).toHaveLength(8);
    expect(ms).toBeLessThan(3000);
  });
});
