/**
 * Pasos del asistente por tipo de análisis (spec §5) y qué campos valida cada uno.
 * `campos` son prefijos de ruta de los errores de Zod (p. ej. "parametros.diametroMax").
 */
import type { TipoAnalisis } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';

export type ClavePaso =
  | 'imagenes'
  | 'deteccion'
  | 'filtros'
  | 'resultados'
  | 'marcadores'
  | 'procesado'
  | 'nombre';

export interface DefPaso {
  clave: ClavePaso;
  nombre: string;
  campos: string[];
}

const NOMBRE: DefPaso = {
  clave: 'nombre',
  nombre: t.asistente.nombresPasos.nombre,
  campos: ['nombre', 'descripcion', 'etiquetas'],
};

const p = (clave: ClavePaso, campos: string[]): DefPaso => ({
  clave,
  nombre: t.asistente.nombresPasos[clave],
  campos,
});

export const PASOS: Record<TipoAnalisis, DefPaso[]> = {
  esferas: [
    p('imagenes', ['imagenes', 'parametros.canal']),
    p('deteccion', [
      'parametros.metodo',
      'parametros.suavizado',
      'parametros.radioBordes',
      'parametros.restarFondo',
      'parametros.metodoUmbral',
      'parametros.rellenarHuecos',
      'parametros.limpiarRuido',
      'parametros.separarTocandose',
    ]),
    p('filtros', [
      'parametros.diametroMin',
      'parametros.diametroMax',
      'parametros.circularidadMin',
      'parametros.excluirBordes',
    ]),
    p('resultados', ['parametros.celulasSembradas', 'parametros.salidas']),
    NOMBRE,
  ],
  fluorescencia: [
    p('imagenes', ['imagenes']),
    p('deteccion', [
      'parametros.canalNucleos',
      'parametros.deteccion',
      'parametros.metodoUmbral',
      'parametros.restarFondoRadio',
      'parametros.separarNucleos',
      'parametros.probabilidadStardist',
      'parametros.solapamientoStardist',
    ]),
    p('filtros', ['parametros.areaNucleoMin', 'parametros.areaNucleoMax', 'parametros.excluirBordes']),
    p('marcadores', ['parametros.marcadores', 'parametros.medida']),
    NOMBRE,
  ],
  western: [
    p('procesado', [
      'parametros.bandasOscuras',
      'parametros.fondo',
      'parametros.radioFondo',
      'parametros.avisarSaturacion',
    ]),
    p('resultados', ['parametros.nombreProteina']),
    NOMBRE,
  ],
};

export type Errores = Record<string, string>;

export function erroresDePaso(paso: DefPaso, errores: Errores): string[] {
  return Object.keys(errores).filter((k) =>
    paso.campos.some((c) => k === c || k.startsWith(c + '.')),
  );
}
