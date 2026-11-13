import type { z } from 'zod';
import type {
  esquemaImagenes,
  esquemaMarcador,
  esquemaParametrosEsferas,
  esquemaParametrosFluorescencia,
  esquemaParametrosWestern,
  esquemaReceteta,
  esquemaRecetetaCompartida,
} from './esquemas';

export type TipoAnalisis = 'esferas' | 'fluorescencia' | 'western';
export const TIPOS: TipoAnalisis[] = ['esferas', 'fluorescencia', 'western'];

export type ImagenesComunes = z.output<typeof esquemaImagenes>;
export type ParametrosEsferas = z.output<typeof esquemaParametrosEsferas>;
export type ParametrosFluorescencia = z.output<typeof esquemaParametrosFluorescencia>;
export type ParametrosWestern = z.output<typeof esquemaParametrosWestern>;
export type Marcador = z.output<typeof esquemaMarcador>;
export type Receteta = z.output<typeof esquemaReceteta>;
export type RecetetaCompartida = z.output<typeof esquemaRecetetaCompartida>;

export type RecetetaDe<T extends TipoAnalisis> = Extract<Receteta, { tipo: T }>;

export function esTipoAnalisis(v: unknown): v is TipoAnalisis {
  return v === 'esferas' || v === 'fluorescencia' || v === 'western';
}
