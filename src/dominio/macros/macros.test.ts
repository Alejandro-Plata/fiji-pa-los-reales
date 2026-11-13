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

function fluo(clave: string, cambios?: (r: RecetetaDe<'fluorescencia'>) => void) {
  const r = desdeCompartida(plantillaPorClave(clave)!.receteta, 'plantilla') as RecetetaDe<'fluorescencia'>;
  cambios?.(r);
  return r;
}

const CASOS_FLUO: [string, RecetetaDe<'fluorescencia'>][] = [
  ['nucleos-dapi-marcador', fluo('nucleos-dapi-marcador')],
  ['nucleos-stardist', fluo('nucleos-stardist')],
  [
    'fluo-tres-marcadores-umbral-integrada',
    fluo('nucleos-dapi-marcador', (r) => {
      r.parametros.marcadores = [
        { nombre: 'CD44', canal: 2, umbralPositivo: 850 },
        { nombre: 'β-actina', canal: 3, umbralPositivo: null },
        { nombre: 'Ki-67', canal: 4, umbralPositivo: 1200.5 },
      ];
      r.parametros.medida = 'integrada';
      r.parametros.restarFondoRadio = 0;
      r.parametros.separarNucleos = false;
      r.imagenes.proyeccionZ = 'ninguna';
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

describe('instantáneas de macros de fluorescencia', () => {
  for (const [nombre, r] of CASOS_FLUO) {
    it(nombre, async () => {
      await expect(generarMacro(r, CTX)).toMatchFileSnapshot(`./__snapshots__/${nombre}.ijm`);
    });
  }

  it('StarDist: comprueba que está instalado y para con un mensaje claro', () => {
    const m = generarMacro(CASOS_FLUO[1]![1], CTX);
    expect(m).toContain('if (List.get("StarDist 2D") == "" || List.get("Command From Macro") == "") exit(');
    expect(m).toContain('Esta receteta usa StarDist, que no est');
    expect(m.indexOf('List.get("StarDist 2D")')).toBeLessThan(m.indexOf('lista = getFileList'));
  });

  it('nombres de marcador seguros en columnas y variables', () => {
    const m = generarMacro(CASOS_FLUO[2]![1], CTX);
    expect(m).toContain('"b_actina_integrada"');
    expect(m).toContain('positivos_Ki_67');
    expect(m).toContain('if (v > 1200.5)');
  });
});

function western(cambios?: (r: RecetetaDe<'western'>) => void) {
  const r = desdeCompartida(plantillaPorClave('western-densitometria')!.receteta, 'plantilla') as RecetetaDe<'western'>;
  cambios?.(r);
  return r;
}

describe('instantáneas de macros de western blot', () => {
  it('western-densitometria', async () => {
    await expect(generarMacro(western(), CTX)).toMatchFileSnapshot('./__snapshots__/western-densitometria.ijm');
  });
  it('western-claras-sin-fondo-beta-actina', async () => {
    const m = generarMacro(
      western((r) => {
        r.parametros.bandasOscuras = false;
        r.parametros.fondo = 'ninguno';
        r.parametros.avisarSaturacion = false;
        r.parametros.nombreProteina = 'β-actina';
      }),
      CTX,
    );
    expect(m).not.toContain('run("Invert");');
    expect(m).not.toContain('Subtract Background');
    expect(m).toContain('"_b_actina_bandas.csv"');
    await expect(m).toMatchFileSnapshot('./__snapshots__/western-claras-sin-fondo.ijm');
  });
  it('el mensaje final empieza por cadena (si empieza por número, IJ1 da NaN)', () => {
    expect(generarMacro(western(), CTX)).toContain('mensaje = "" + n + ');
  });
});

describe('reglas del generador', () => {
  const todos = [...CASOS, ...CASOS_FLUO].map(([, r]) => generarMacro(r, CTX));

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

  it('ninguna línea de código usa caracteres no ASCII (también nombres de marcador)', () => {
    for (const m of todos) {
      for (const l of m.split('\n')) {
        const codigo = l.replace(/\/\/.*$/, '');
        expect(codigo, l).toMatch(/^[\x20-\x7e]*$/);
      }
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
