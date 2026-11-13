import { describe, expect, it } from 'vitest';
import { leerNumero } from './numeros';
import {
  esquemaParametrosEsferas,
  esquemaParametrosFluorescencia,
  esquemaReceteta,
} from './esquemas';
import { crearReceteta, duplicar, nombreUnico } from './crear';
import { PLANTILLAS } from './plantillas';
import { codificarReceteta, decodificarReceteta, EnlaceNoValido } from './compartir';
import { importarJson, exportarJson } from './almacenamiento';
import { desdeCompartida } from './crear';

describe('leerNumero', () => {
  it('acepta coma y punto', () => {
    expect(leerNumero('0,65')).toBe(0.65);
    expect(leerNumero('0.65')).toBe(0.65);
    expect(leerNumero(' 50 ')).toBe(50);
    expect(leerNumero(',5')).toBe(0.5);
  });
  it('rechaza textos que no son números', () => {
    expect(leerNumero('')).toBeNull();
    expect(leerNumero('abc')).toBeNull();
    expect(leerNumero('1,2,3')).toBeNull();
    expect(leerNumero('1e5')).toBeNull();
  });
});

describe('esquemas', () => {
  it('valores por defecto de esferas (spec §8)', () => {
    const p = esquemaParametrosEsferas.parse({});
    expect(p).toMatchObject({
      canal: 1,
      metodo: 'bordes',
      suavizado: 2,
      radioBordes: 4,
      restarFondo: { activo: true, radio: 50 },
      metodoUmbral: 'Otsu',
      rellenarHuecos: true,
      limpiarRuido: true,
      separarTocandose: false,
      diametroMin: 50,
      diametroMax: null,
      circularidadMin: 0.4,
      excluirBordes: true,
      celulasSembradas: null,
      salidas: { objetos: true, resumen: true, control: true, rois: true },
    });
  });

  it('valores por defecto de fluorescencia (spec §9)', () => {
    const p = esquemaParametrosFluorescencia.parse({});
    expect(p).toMatchObject({
      canalNucleos: 1,
      marcadores: [],
      deteccion: 'umbral',
      restarFondoRadio: 50,
      probabilidadStardist: 0.5,
      solapamientoStardist: 0.4,
      areaNucleoMin: 20,
      areaNucleoMax: 500,
      medida: 'media',
    });
  });

  it('mínimo < máximo con mensaje en español', () => {
    const r = esquemaParametrosEsferas.safeParse({ diametroMin: 100, diametroMax: 80 });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe('El diámetro mínimo debe ser menor que el máximo');
    expect(r.error?.issues[0]?.path).toEqual(['diametroMax']);
  });

  it('rangos con mensaje en español', () => {
    const r = esquemaParametrosEsferas.safeParse({ circularidadMin: 1.5 });
    expect(r.error?.issues[0]?.message).toBe('Debe estar entre 0 y 1');
    const c = esquemaParametrosEsferas.safeParse({ canal: 2.5 });
    expect(c.error?.issues[0]?.message).toBe('Debe ser un número entero');
  });

  it('marcador en el canal de núcleos se rechaza', () => {
    const r = esquemaParametrosFluorescencia.safeParse({
      marcadores: [{ nombre: 'CD44', canal: 1 }],
    });
    expect(r.error?.issues[0]?.message).toMatch(/mismo canal/);
  });

  it('más de 3 marcadores se rechaza', () => {
    const m = (n: number) => ({ nombre: `M${n}`, canal: n + 1 });
    const r = esquemaParametrosFluorescencia.safeParse({ marcadores: [m(1), m(2), m(3), m(4)] });
    expect(r.success).toBe(false);
  });

  it('las plantillas son válidas', () => {
    expect(PLANTILLAS).toHaveLength(5);
    for (const p of PLANTILLAS) {
      const r = esquemaReceteta.safeParse(desdeCompartida(p.receteta, 'plantilla'));
      expect(r.success, p.clave).toBe(true);
    }
  });
});

describe('crear y duplicar', () => {
  it('crea con valores por defecto y nombre vacío', () => {
    const r = crearReceteta('esferas');
    expect(r.nombre).toBe('');
    expect(r.esquema).toBe(1);
    expect(r.imagenes.escala).toEqual({ modo: 'archivo' });
  });
  it('nombreUnico propone "Nombre (2)"', () => {
    expect(nombreUnico('A', ['B'])).toBe('A');
    expect(nombreUnico('A', ['a'])).toBe('A (2)');
    expect(nombreUnico('A', ['A', 'A (2)'])).toBe('A (3)');
  });
  it('crear desde plantilla no comparte objetos con la plantilla', () => {
    const r = desdeCompartida(PLANTILLAS[0]!.receteta, 'plantilla');
    (r.parametros as { canal: number }).canal = 7;
    expect((PLANTILLAS[0]!.receteta.parametros as { canal: number }).canal).toBe(1);
  });
  it('duplicar cambia id y nombre', () => {
    const r = { ...crearReceteta('western'), nombre: 'WB' };
    const d = duplicar(r, ['WB']);
    expect(d.id).not.toBe(r.id);
    expect(d.nombre).toBe('WB (copia)');
  });
});

describe('compartir por enlace', () => {
  it('codificar y decodificar devuelve la misma receteta', async () => {
    for (const p of PLANTILLAS) {
      const r = desdeCompartida(p.receteta, 'plantilla');
      const datos = await codificarReceteta(r);
      expect(datos).toMatch(/^z[A-Za-z0-9_-]+$/);
      expect(await decodificarReceteta(datos)).toEqual(p.receteta);
    }
  });

  it('un enlace manipulado se rechaza con un mensaje claro', async () => {
    const r = desdeCompartida(PLANTILLAS[0]!.receteta, 'plantilla');
    const datos = await codificarReceteta(r);
    const roto = datos.slice(0, -6) + 'AAAAAA';
    await expect(decodificarReceteta(roto)).rejects.toBeInstanceOf(EnlaceNoValido);
    await expect(decodificarReceteta('x!!')).rejects.toThrow(/incompleto o dañado/);
    // JSON válido pero receteta inválida
    const malo = 'j' + btoa(JSON.stringify({ esquema: 1, tipo: 'esferas', nombre: '' }));
    await expect(decodificarReceteta(malo.replace(/=+$/, ''))).rejects.toThrow(
      /no contiene una receteta válida/,
    );
  });
});

describe('copia de seguridad .json', () => {
  it('exportar e importar devuelve las mismas recetetas', () => {
    const lista = PLANTILLAS.map((p) => desdeCompartida(p.receteta, 'plantilla'));
    const r = importarJson(exportarJson(lista, '1.0.0'));
    expect(r.validas).toEqual(lista);
    expect(r.rechazadas).toBe(0);
  });
  it('cuenta las rechazadas', () => {
    const r = importarJson(JSON.stringify([{ basura: true }]));
    expect(r.rechazadas).toBe(1);
  });
  it('un archivo que no es JSON da error en español', () => {
    expect(() => importarJson('hola')).toThrow('El archivo no es un JSON válido.');
  });
});
