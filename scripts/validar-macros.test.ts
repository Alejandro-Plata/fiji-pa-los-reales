/**
 * Validación de los macros con Fiji real (spec §14).
 * Ejecutar con: npm run validar:fiji   (requiere Fiji en .fiji/ y las sintéticas generadas)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { generarMacro } from '../src/dominio/macros';
import { desdeCompartida } from '../src/dominio/recetetas/crear';
import { plantillaPorClave } from '../src/dominio/recetetas/plantillas';
import type { Receteta } from '../src/dominio/recetetas/tipos';
import { ejecutarMacro, leerCsv, SALIDAS, SINTETICAS } from './fiji';

const CTX = { versionApp: 'prueba', fecha: '2026-01-01' };

function plantilla(clave: string): Receteta {
  const p = plantillaPorClave(clave);
  if (!p) throw new Error(clave);
  return desdeCompartida(p.receteta, 'plantilla');
}

function carpetaSalida(nombre: string): string {
  const d = join(SALIDAS, nombre);
  rmSync(d, { recursive: true, force: true });
  mkdirSync(d, { recursive: true });
  return d;
}

async function lanzar(r: Receteta, entrada: string, nombre: string) {
  const salida = carpetaSalida(nombre);
  const res = await ejecutarMacro(generarMacro(r, CTX), `${entrada}|${salida}`);
  const log = existsSync(join(salida, 'log.txt')) ? readFileSync(join(salida, 'log.txt'), 'utf8') : '';
  if (res.agotado || !existsSync(join(salida, 'resumen.csv'))) {
    throw new Error(`Fiji no terminó bien (${nombre}).\nSalida:\n${res.salida}\nLog:\n${log}`);
  }
  return { salida, log, resumen: leerCsv(join(salida, 'resumen.csv')) };
}

beforeAll(() => {
  if (!existsSync(join(SINTETICAS, 'esperado.json'))) {
    throw new Error('Faltan las sintéticas: py -I scripts/generar-sinteticas.py');
  }
});

describe('mamosferas en Fiji real', () => {
  it('plantilla «campo claro»: 8 esferas y la imagen sin escala se omite con aviso', async () => {
    const { salida, log, resumen } = await lanzar(
      plantilla('mamosferas-campo-claro'),
      join(SINTETICAS, 'esferas'),
      'campo-claro',
    );
    expect(resumen).toHaveLength(1);
    expect(resumen[0]!.Imagen).toBe('esferas');
    expect(Number(resumen[0]!.Esferas)).toBe(8);
    expect(log).toMatch(/esferas_sin_escala\.tif no tiene escala en micras/);
    expect(log).toContain('Terminado: 1 imágenes analizadas, 1 omitidas.');

    // objetos.csv: una fila por esfera, con el nombre del archivo y medidas en micras
    const objetos = leerCsv(join(salida, 'objetos.csv'));
    expect(objetos).toHaveLength(8);
    expect(objetos[0]!.Label).toMatch(/^esferas/);
    const ferets = objetos.map((o) => Number(o.Feret));
    expect(Math.min(...ferets)).toBeGreaterThanOrEqual(50);
    expect(Math.max(...ferets)).toBeLessThan(130);

    expect(existsSync(join(salida, 'control', 'esferas_control.jpg'))).toBe(true);
    expect(existsSync(join(salida, 'rois', 'esferas.zip'))).toBe(true);
  });

  it('plantilla «contraste simple»: 8 esferas', async () => {
    const { resumen } = await lanzar(
      plantilla('mamosferas-contraste'),
      join(SINTETICAS, 'esferas'),
      'contraste',
    );
    expect(Number(resumen[0]!.Esferas)).toBe(8);
  });

  it('hiperpila de 2 canales y 3 planos: canal 2 y proyección máxima', async () => {
    const r = plantilla('mamosferas-campo-claro') as Extract<Receteta, { tipo: 'esferas' }>;
    r.parametros.canal = 2;
    const { resumen } = await lanzar(r, join(SINTETICAS, 'esferas_hiper'), 'hiper');
    expect(Number(resumen[0]!.Esferas)).toBe(8);
  });

  it('canal inexistente: se omite con aviso y no rompe', async () => {
    const r = plantilla('mamosferas-campo-claro') as Extract<Receteta, { tipo: 'esferas' }>;
    r.parametros.canal = 3;
    const salida = carpetaSalida('canal-inexistente');
    await ejecutarMacro(generarMacro(r, CTX), `${join(SINTETICAS, 'esferas_hiper')}|${salida}`, {
      tiempoMs: 90_000,
    });
    const log = readFileSync(join(salida, 'log.txt'), 'utf8');
    expect(log).toContain('tiene 2 canal(es) y la receteta usa el 3. Se omite.');
  });

  it('la cadena de Bio-Formats Importer del generador abre una imagen', async () => {
    const salida = carpetaSalida('bioformats');
    const ruta = join(SINTETICAS, 'esferas', 'esferas.tif');
    const macro = [
      'args = split(getArgument(), "|");',
      'setBatchMode(true);',
      'run("Bio-Formats Importer", "open=[" + args[0] + "] autoscale color_mode=Default view=Hyperstack stack_order=XYCZT series_1");',
      'getPixelSize(u, pw, ph);',
      'File.saveString("" + nImages + "|" + getWidth() + "|" + u, args[1] + "bf.txt");',
    ].join('\n');
    await ejecutarMacro(macro, `${ruta}|${salida}\\`, { tiempoMs: 120_000 });
    const [imagenes, ancho, unidad] = readFileSync(join(salida, 'bf.txt'), 'utf8').split('|');
    expect(imagenes).toBe('1');
    expect(ancho).toBe('1600');
    expect(unidad).toMatch(/micron|µm/);
  });

  it('JPG RGB de cámara con escala manual 0,65 µm/píxel y SFE', async () => {
    const r = plantilla('mamosferas-campo-claro') as Extract<Receteta, { tipo: 'esferas' }>;
    r.imagenes = { ...r.imagenes, extensiones: ['.jpg'], escala: { modo: 'manual', micrasPorPixel: 0.65 } };
    r.parametros.celulasSembradas = 1000;
    const { resumen, salida } = await lanzar(r, join(SINTETICAS, 'esferas_rgb'), 'rgb-manual');
    expect(Number(resumen[0]!.Esferas)).toBe(8);
    expect(Number(resumen[0]!.SFE_porcentaje)).toBeCloseTo(0.8, 5);
    expect(readdirSync(join(salida, 'control'))).toEqual(['esferas_camara_control.jpg']);
  });
});
