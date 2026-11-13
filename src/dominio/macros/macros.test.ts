/**
 * Instantáneas del macro (spec §14). Solo se actualizan revisando el cambio a mano:
 *   npx vitest run -u   y explicar en el commit por qué cambió el macro.
 */
import { describe, expect, it } from 'vitest';
import { generarMacro } from './index';
import { desdeCompartida } from '../recetetas/crear';
import { plantillaPorClave } from '../recetetas/plantillas';
import type { RecetetaDe } from '../recetetas/tipos';

const CTX = { versionApp: '1.0.0', fecha: '2026-10-22' };

function esferas(clave: string, cambios?: (r: RecetetaDe<'esferas'>) => void) {
  const r = desdeCompartida(plantillaPorClave(clave)!.receteta, 'plantilla') as RecetetaDe<'esferas'>;
  cambios?.(r);
  return r;
}

const CASOS: [string, RecetetaDe<'esferas'>][] = [
  ['mamosferas-campo-claro', esferas('mamosferas-campo-claro')],
  ['mamosferas-contraste', esferas('mamosferas-contraste')],
  [
    'esferas-sfe-escala-manual',
    esferas('mamosferas-campo-claro', (r) => {
      r.parametros.celulasSembradas = 1000;
      r.imagenes.escala = { modo: 'manual', micrasPorPixel: 0.65 };
    }),
  ],
  [
    'esferas-todo-activado-max-diametro-todas-ext',
    esferas('mamosferas-contraste', (r) => {
      r.parametros.separarTocandose = true;
      r.parametros.diametroMax = 300;
      r.parametros.suavizado = 0;
      r.parametros.restarFondo.activo = false;
      r.parametros.excluirBordes = false;
      r.imagenes.extensiones = ['*'];
      r.imagenes.proyeccionZ = 'ninguna';
    }),
  ],
  [
    'esferas-sin-salidas-opcionales',
    esferas('mamosferas-campo-claro', (r) => {
      r.parametros.salidas = { objetos: false, resumen: true, control: false, rois: false };
      r.parametros.rellenarHuecos = false;
      r.parametros.limpiarRuido = false;
      r.imagenes.proyeccionZ = 'media';
    }),
  ],
];

describe('instantáneas de macros de esferas', () => {
  for (const [nombre, r] of CASOS) {
    it(nombre, async () => {
      await expect(generarMacro(r, CTX)).toMatchFileSnapshot(`./__snapshots__/${nombre}.ijm`);
    });
  }
});

describe('reglas del generador', () => {
  const todos = CASOS.map(([, r]) => generarMacro(r, CTX));

  it('es determinista: misma receteta y contexto → mismo macro', () => {
    const r = CASOS[0]![1];
    expect(generarMacro(r, CTX)).toBe(generarMacro(structuredClone(r), CTX));
  });

  it('nunca escribe una coma decimal en el código', () => {
    for (const m of todos) {
      const codigo = m
        .split('\n')
        .filter((l) => !l.trim().startsWith('//'))
        .join('\n');
      expect(codigo).not.toMatch(/\d,\d/);
    }
  });

  it('las cadenas del código son ASCII (los acentos van con fromCharCode)', () => {
    for (const m of todos) {
      const codigo = m
        .split('\n')
        .filter((l) => !l.trim().startsWith('//'))
        .map((l) => l.replace(/\/\/.*$/, ''));
      for (const l of codigo) expect(l, l).toMatch(/^[\x20-\x7e]*$/);
    }
  });

  it('no incluye rutas: las carpetas se piden al ejecutar', () => {
    for (const m of todos) {
      expect(m).toContain('getDirectory(');
      expect(m).not.toMatch(/[A-Z]:\\\\|\/Users\/|\/home\//);
    }
  });

  it('reinicia el gestor de ROI antes del modo silencioso', () => {
    for (const m of todos) {
      expect(m.indexOf('roiManager("reset");')).toBeLessThan(m.indexOf('setBatchMode(true);'));
    }
  });

  it('no usa nChannels (no existe en el lenguaje de macros)', () => {
    for (const m of todos) expect(m).not.toMatch(/\bnChannels\b/);
  });

  it('50 µm se escribe como área 1963.50', () => {
    expect(todos[0]).toContain('size=1963.50-Infinity circularity=0.40-1.00');
  });

  it('el nombre de la receteta no puede romper el comentario de cabecera', () => {
    const r = esferas('mamosferas-campo-claro', (x) => {
      x.nombre = 'Malo */ run("Quit");\nexit();';
    });
    const m = generarMacro(r, CTX);
    const cabecera = m.split('\n').find((l) => l.startsWith('// Receteta:'))!;
    expect(cabecera).toBe('// Receteta: Malo * / run("Quit"); exit();');
    expect(m.split('\n').filter((l) => l.includes('run("Quit")'))).toHaveLength(1);
  });

  it('la cabecera documenta todos los parámetros en una línea JSON', () => {
    const linea = todos[0]!.split('\n').find((l) => l.startsWith('// Parámetros: '))!;
    const json = JSON.parse(linea.replace('// Parámetros: ', ''));
    expect(json.parametros.diametroMin).toBe(50);
    expect(json.imagenes.escala.modo).toBe('archivo');
  });
});
