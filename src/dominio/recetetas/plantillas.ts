/**
 * Plantillas incluidas (spec §6). Solo lectura: al abrirlas se duplican como receteta nueva.
 */
import { esquemaRecetetaCompartida } from './esquemas';
import type { RecetetaCompartida } from './tipos';

export interface Plantilla {
  clave: string;
  receteta: RecetetaCompartida;
}

const p = (clave: string, datos: unknown): Plantilla => ({
  clave,
  receteta: esquemaRecetetaCompartida.parse(datos),
});

export const PLANTILLAS: Plantilla[] = [
  p('mamosferas-campo-claro', {
    esquema: 1,
    tipo: 'esferas',
    nombre: 'Mamosferas · campo claro',
    descripcion:
      'Detección por bordes, diámetro ≥ 50 µm, circularidad ≥ 0,4, rellenar huecos, sin separar esferas en contacto.',
    parametros: {
      metodo: 'bordes',
      diametroMin: 50,
      circularidadMin: 0.4,
      rellenarHuecos: true,
      separarTocandose: false,
    },
  }),
  p('mamosferas-contraste', {
    esquema: 1,
    tipo: 'esferas',
    nombre: 'Mamosferas · contraste simple',
    descripcion: 'Umbral Otsu sobre fondo claro, para imágenes muy limpias.',
    parametros: {
      metodo: 'umbral',
      metodoUmbral: 'Otsu',
      restarFondo: { activo: true, radio: 50 },
    },
  }),
  p('nucleos-dapi-marcador', {
    esquema: 1,
    tipo: 'fluorescencia',
    nombre: 'Núcleos DAPI + marcador',
    descripcion:
      'Núcleos en canal 1 por umbral + watershed, marcador en canal 2, exportar intensidades.',
    parametros: {
      canalNucleos: 1,
      deteccion: 'umbral',
      separarNucleos: true,
      marcadores: [{ nombre: 'Marcador', canal: 2, umbralPositivo: null }],
    },
  }),
  p('nucleos-stardist', {
    esquema: 1,
    tipo: 'fluorescencia',
    nombre: 'Núcleos con StarDist',
    descripcion:
      'Igual que la anterior, pero detectando núcleos con StarDist (requiere instalar el plugin).',
    parametros: {
      canalNucleos: 1,
      deteccion: 'stardist',
      marcadores: [{ nombre: 'Marcador', canal: 2, umbralPositivo: null }],
    },
  }),
  p('western-densitometria', {
    esquema: 1,
    tipo: 'western',
    nombre: 'Western blot · densitometría',
    descripcion:
      'Bandas oscuras sobre fondo claro, rectángulo de tamaño fijo, fondo restado por rolling ball.',
    parametros: { bandasOscuras: true, fondo: 'rollingBall', radioFondo: 50 },
  }),
];

export function plantillaPorClave(clave: string): Plantilla | undefined {
  return PLANTILLAS.find((x) => x.clave === clave);
}
