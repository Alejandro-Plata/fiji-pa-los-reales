/**
 * Validación de los macros con imágenes REALES de bancos públicos (scripts/bancos/LEEME.md).
 * Solo se ejecuta si existen los datos (DATOS_PRUEBA o C:\Users\<usuario>\datos-prueba-fplr) y su
 * verdad.json (py -I scripts/bancos/verdad.py <carpeta>).
 *   npx vitest run --config vitest.fiji.config.ts scripts/bancos
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generarMacro } from '../../src/dominio/macros';
import { desdeCompartida } from '../../src/dominio/recetetas/crear';
import { plantillaPorClave } from '../../src/dominio/recetetas/plantillas';
import type { Receteta } from '../../src/dominio/recetetas/tipos';
import { ejecutarMacro, leerCsv, SALIDAS } from '../fiji';

const DATOS = process.env.DATOS_PRUEBA ?? join(homedir(), 'datos-prueba-fplr');
const hayDatos = existsSync(join(DATOS, 'verdad.json'));
const CTX = { versionApp: 'bancos', fecha: '2026-11-14' };
const informe: Record<string, unknown> = {};

const mediana = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? (s[(s.length - 1) >> 1]! + s[s.length >> 1]!) / 2 : NaN;
};
const r2 = (n: number) => Math.round(n * 100) / 100;

function plantilla<T extends Receteta['tipo']>(clave: string): Extract<Receteta, { tipo: T }> {
  const p = plantillaPorClave(clave);
  if (!p) throw new Error(clave);
  return desdeCompartida(p.receteta, 'plantilla') as Extract<Receteta, { tipo: T }>;
}

/** Copia todas las imágenes (de subcarpetas) a una carpeta plana: el macro procesa una carpeta. */
function aplanar(origen: string, destino: string, patron: RegExp): number {
  rmSync(destino, { recursive: true, force: true });
  mkdirSync(destino, { recursive: true });
  let n = 0;
  const recorrer = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const ruta = join(d, e.name);
      if (e.isDirectory()) recorrer(ruta);
      else if (patron.test(e.name)) {
        copyFileSync(ruta, join(destino, e.name));
        n++;
      }
    }
  };
  recorrer(origen);
  return n;
}

async function lanzar(r: Receteta, entrada: string, nombre: string) {
  const salida = join(SALIDAS, 'bancos', nombre);
  rmSync(salida, { recursive: true, force: true });
  mkdirSync(salida, { recursive: true });
  const res = await ejecutarMacro(generarMacro(r, CTX), `${entrada}|${salida}`, { tiempoMs: 900_000 });
  const log = existsSync(join(salida, 'log.txt')) ? readFileSync(join(salida, 'log.txt'), 'utf8') : '';
  if (res.agotado || !existsSync(join(salida, 'resumen.csv'))) {
    throw new Error(`Fiji no terminó (${nombre}).\n${res.salida.slice(-2000)}\nLog:\n${log.slice(-2000)}`);
  }
  return {
    log,
    resumen: leerCsv(join(salida, 'resumen.csv')),
    objetos: existsSync(join(salida, 'objetos.csv')) ? leerCsv(join(salida, 'objetos.csv')) : [],
  };
}

const sinExtension = (s: string) => s.replace(/\.ome$/i, '').replace(/\.(ome\.)?tiff?$/i, '');

describe.runIf(hayDatos)('bancos públicos con Fiji real', () => {
  const verdad = hayDatos ? JSON.parse(readFileSync(join(DATOS, 'verdad.json'), 'utf8')) : {};

  // Variantes de receteta para esferoides grandes (~400 µm). Por defecto, la plantilla tal cual.
  type Ajuste = (r: Extract<Receteta, { tipo: 'esferas' }>) => void;
  const VARIANTES: Record<string, [string, Ajuste]> = {
    plantilla: ['mamosferas-campo-claro', () => {}],
    'bordes-grandes': ['mamosferas-campo-claro', (r) => {
      r.parametros.suavizado = 4;
      r.parametros.radioBordes = 8;
      r.parametros.diametroMin = 100;
    }],
    'contraste-sin-fondo': ['mamosferas-contraste', (r) => {
      r.parametros.restarFondo = { activo: false, radio: 50 };
      r.parametros.diametroMin = 100;
    }],
    'contraste-fondo-300': ['mamosferas-contraste', (r) => {
      r.parametros.restarFondo = { activo: true, radio: 300 };
      r.parametros.diametroMin = 100;
    }],
  };
  const variantes = (process.env.VARIANTES ?? 'plantilla').split(',');

  for (const banco of ['slimia-olympus', 'slimia-operaphenix'] as const)
  for (const variante of variantes) {
    it(`${banco} (${variante}): esferoides en campo claro frente a la segmentación manual`, async () => {
      const entrada = join(SALIDAS, 'bancos', `entrada-${banco}`);
      const n = aplanar(join(DATOS, banco), entrada, /\.ome\.tiff$/i);
      const [clave, ajustar] = VARIANTES[variante]!;
      const r = plantilla<'esferas'>(clave);
      r.imagenes.extensiones = ['.tiff'];
      r.parametros.excluirBordes = false; // la referencia incluye los que tocan el borde
      ajustar(r);
      const { log, objetos } = await lanzar(r, entrada, `${banco}-${variante}`);

      const gt = verdad[banco] as Record<string, { areaUm2: number; diametroUm: number }>;
      const porImagen = new Map<string, number[]>();
      for (const o of objetos) {
        const k = sinExtension(o.Label ?? '');
        porImagen.set(k, [...(porImagen.get(k) ?? []), Number(o.Area)]);
      }
      const errores: number[] = [];
      let sinDeteccion = 0;
      for (const [nombre, g] of Object.entries(gt)) {
        const areas = porImagen.get(nombre);
        if (!areas?.length) {
          sinDeteccion++;
          continue;
        }
        errores.push(Math.abs(Math.max(...areas) - g.areaUm2) / g.areaUm2);
      }
      const omitidas = (log.match(/Se omite/g) ?? []).length;
      informe[`${banco}-${variante}`] = {
        imagenes: n,
        omitidasPorEscala: omitidas,
        sinDeteccion,
        errorAreaMediano: r2(mediana(errores) * 100) + ' %',
        dentroDel20: `${errores.filter((e) => e <= 0.2).length}/${errores.length}`,
        objetosPorImagenMediana: mediana([...porImagen.values()].map((v) => v.length)),
      };
      console.log(banco, variante, informe[`${banco}-${variante}`]);
      expect(omitidas).toBe(0); // la escala de los OME-TIFF se lee bien
      expect(errores.length).toBeGreaterThan(0);
    });
  }

  it('bbbc039: recuento de núcleos (Hoechst) frente a la segmentación de referencia', async () => {
    const entrada = join(DATOS, 'bbbc039', 'images', 'images');
    const r = plantilla<'fluorescencia'>('nucleos-dapi-marcador');
    r.parametros.marcadores = [];
    r.parametros.excluirBordes = false;
    r.parametros.areaNucleoMin = 20;
    r.parametros.areaNucleoMax = 1500;
    // Sin escala en los TIFF: tamaño de píxel del cribado de origen (BBBC022, objetivo 20×)
    r.imagenes.escala = { modo: 'manual', micrasPorPixel: 0.656 };
    const { resumen } = await lanzar(r, entrada, 'bbbc039');

    const gt = verdad.bbbc039 as Record<string, { nucleos: number }>;
    const columna = Object.keys(resumen[0] ?? {}).find((c) => /n[uú]cleos/i.test(c)) ?? '';
    const pares = resumen
      .map((f) => [Number(f[columna]), gt[sinExtension(f.Imagen ?? '')]?.nucleos] as const)
      .filter((p): p is readonly [number, number] => p[1] !== undefined && p[1] > 0);
    const errores = pares.map(([f, g]) => Math.abs(f - g) / g);
    const totalFiji = pares.reduce((s, p) => s + p[0], 0);
    const totalRef = pares.reduce((s, p) => s + p[1], 0);
    informe.bbbc039 = {
      imagenes: pares.length,
      columna,
      nucleosFiji: totalFiji,
      nucleosReferencia: totalRef,
      errorRecuentoMediano: r2(mediana(errores) * 100) + ' %',
      dentroDel10: `${errores.filter((e) => e <= 0.1).length}/${errores.length}`,
    };
    console.log('bbbc039', informe.bbbc039);
    writeFileSync(join(SALIDAS, 'bancos', 'informe.json'), JSON.stringify(informe, null, 2));
    expect(pares.length).toBeGreaterThan(150);
  });
});
