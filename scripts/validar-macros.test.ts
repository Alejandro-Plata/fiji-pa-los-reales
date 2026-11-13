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

  it('dos imágenes: 16 filas en objetos.csv y 2 en resumen.csv', async () => {
    const { salida, resumen } = await lanzar(
      plantilla('mamosferas-campo-claro'),
      join(SINTETICAS, 'esferas_doble'),
      'esferas-doble',
    );
    expect(resumen.map((f) => Number(f.Esferas))).toEqual([8, 8]);
    const objetos = leerCsv(join(salida, 'objetos.csv'));
    expect(objetos).toHaveLength(16);
    expect(objetos.filter((o) => o.Label.startsWith('esferas_b'))).toHaveLength(8);
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

  it('JPG RGB de cámara con escala manual 0,65 µm/píxel y SFE (esferas)', async () => {
    const r = plantilla('mamosferas-campo-claro') as Extract<Receteta, { tipo: 'esferas' }>;
    r.imagenes = { ...r.imagenes, extensiones: ['.jpg'], escala: { modo: 'manual', micrasPorPixel: 0.65 } };
    r.parametros.celulasSembradas = 1000;
    const { resumen, salida } = await lanzar(r, join(SINTETICAS, 'esferas_rgb'), 'rgb-manual');
    expect(Number(resumen[0]!.Esferas)).toBe(8);
    expect(Number(resumen[0]!.SFE_porcentaje)).toBeCloseTo(0.8, 5);
    expect(readdirSync(join(salida, 'control'))).toEqual(['esferas_camara_control.jpg']);
  });
});

describe('western blot en Fiji real (variante de prueba sin waitForUser)', () => {
  async function lanzarWestern(r: Receteta, imagen: string, nombre: string) {
    const salida = carpetaSalida(nombre);
    const rois = join(SINTETICAS, 'western', 'bandas.zip');
    const res = await ejecutarMacro(generarMacro(r, CTX), `${imagen}|${rois}|${salida}`, {
      tiempoMs: 120_000,
    });
    const log = existsSync(join(salida, 'log.txt')) ? readFileSync(join(salida, 'log.txt'), 'utf8') : '';
    return { salida, log, res };
  }

  it('abre, invierte, mide las ROI de ejemplo y numera los carriles', async () => {
    const r = plantilla('western-densitometria') as Extract<Receteta, { tipo: 'western' }>;
    r.parametros.nombreProteina = 'SOX2';
    const { salida, log } = await lanzarWestern(r, join(SINTETICAS, 'western', 'blot.tif'), 'western');
    const filas = leerCsv(join(salida, 'blot_SOX2_bandas.csv'));
    expect(filas.map((f) => Number(f.Carril))).toEqual([1, 2, 3, 4, 5, 6]);
    const senal = filas.map((f) => Number(f.RawIntDen));
    // Más profundidad de banda = más señal tras invertir
    for (let i = 1; i < senal.length; i++) expect(senal[i]).toBeGreaterThan(senal[i - 1]!);
    expect(senal[0]).toBeGreaterThan(0);
    expect(log).toContain('6 bandas medidas');
    expect(log).not.toContain('saturados');
    expect(existsSync(join(salida, 'blot_SOX2_control.jpg'))).toBe(true);
    expect(existsSync(join(salida, 'blot_SOX2_bandas.zip'))).toBe(true);
  });

  it('avisa de la saturación con una imagen saturada', async () => {
    const r = plantilla('western-densitometria');
    const { log } = await lanzarWestern(
      r,
      join(SINTETICAS, 'western_saturado', 'blot_saturado.tif'),
      'western-saturado',
    );
    expect(log).toContain('La imagen tiene píxeles saturados.');
  });
});

type Fluo = Extract<Receteta, { tipo: 'fluorescencia' }>;

function fluo(clave: string, umbral: number | null = 1200): Fluo {
  const r = plantilla(clave) as Fluo;
  r.parametros.marcadores = [{ nombre: 'CD44', canal: 2, umbralPositivo: umbral }];
  return r;
}

describe('fluorescencia en Fiji real', () => {
  it('umbral + watershed: 40 núcleos y 25 % positivas', async () => {
    const { salida, resumen } = await lanzar(
      fluo('nucleos-dapi-marcador'),
      join(SINTETICAS, 'fluorescencia'),
      'fluo-umbral',
    );
    expect(resumen[0]!.Imagen).toBe('fluo');
    expect(Number(resumen[0]!.Nucleos)).toBe(40);
    expect(Number(resumen[0]!.CD44_positivos)).toBe(10);
    expect(Number(resumen[0]!.CD44_porcentaje)).toBeCloseTo(25, 5);
    const objetos = leerCsv(join(salida, 'objetos.csv'));
    expect(objetos).toHaveLength(40);
    expect(objetos.filter((o) => o.CD44_positivo === '1')).toHaveLength(10);
    expect(existsSync(join(salida, 'control', 'fluo_control.jpg'))).toBe(true);
    expect(existsSync(join(salida, 'rois', 'fluo.zip'))).toBe(true);
  });

  it('dos imágenes: 80 filas en objetos.csv y 2 en resumen.csv', async () => {
    const { salida, resumen } = await lanzar(
      fluo('nucleos-dapi-marcador'),
      join(SINTETICAS, 'fluorescencia_doble'),
      'fluo-doble',
    );
    expect(resumen.map((f) => f.Imagen)).toEqual(['fluo_a', 'fluo_b']);
    expect(resumen.map((f) => Number(f.CD44_porcentaje))).toEqual([25, 25]);
    const objetos = leerCsv(join(salida, 'objetos.csv'));
    expect(objetos).toHaveLength(80);
    expect(objetos.filter((o) => o.Imagen === 'fluo_b')).toHaveLength(40);
  });

  it('sin umbral: exporta intensidades por núcleo', async () => {
    const { salida, resumen } = await lanzar(
      fluo('nucleos-dapi-marcador', null),
      join(SINTETICAS, 'fluorescencia'),
      'fluo-intensidades',
    );
    expect(Number(resumen[0]!.Nucleos)).toBe(40);
    expect(resumen[0]!.CD44_positivos).toBeUndefined();
    const intensidades = leerCsv(join(salida, 'objetos.csv')).map((o) => Number(o.CD44_media));
    expect(intensidades.filter((v) => v > 1200)).toHaveLength(10);
    expect(intensidades.filter((v) => v < 800)).toHaveLength(30);
  });

  // PENDIENTE (spec §14.6): StarDist 0.3.0 + CSBDeep 0.6.0 se instalan en la Fiji de pruebas,
  // pero Fiji se bloquea al cargar TensorFlow 1.15 (Java 21 de Fiji 2.18, Windows; marca
  // lib/win64/.crashed). No se da por buena sin ejecutarla. Activar con FIJI_STARDIST=1 en un
  // equipo donde StarDist funcione en Fiji.
  it.runIf(process.env.FIJI_STARDIST === '1')('StarDist: 40 núcleos y 25 % positivas', async () => {
    const { resumen } = await lanzar(
      fluo('nucleos-stardist'),
      join(SINTETICAS, 'fluorescencia'),
      'fluo-stardist',
    );
    expect(Number(resumen[0]!.Nucleos)).toBe(40);
    expect(Number(resumen[0]!.CD44_porcentaje)).toBeCloseTo(25, 5);
  });

  it('una imagen RGB se omite con un aviso claro', async () => {
    const r = fluo('nucleos-dapi-marcador');
    r.imagenes = { ...r.imagenes, extensiones: ['.jpg'], escala: { modo: 'manual', micrasPorPixel: 0.65 } };
    const salida = carpetaSalida('fluo-rgb');
    await ejecutarMacro(generarMacro(r, CTX), `${join(SINTETICAS, 'esferas_rgb')}|${salida}`, {
      tiempoMs: 90_000,
    });
    const log = readFileSync(join(salida, 'log.txt'), 'utf8');
    expect(log).toContain('es una imagen RGB (sin canales separados). Se omite.');
  });
});
