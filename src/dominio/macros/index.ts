/**
 * generarMacro(): función pura. Misma receteta y mismo contexto → mismo macro, byte a byte.
 * El macro nunca se guarda: se regenera siempre desde la receteta (spec §6 y §7).
 */
import type { Receteta } from '../recetetas/tipos';
import type { Contexto } from './comun';
import { macroEsferas } from './esferas';
import { macroFluorescencia } from './fluorescencia';
import { macroWestern } from './western';

export type { Contexto } from './comun';

export class TipoSinMacro extends Error {}

export function generarMacro(r: Receteta, ctx: Contexto): string {
  switch (r.tipo) {
    case 'esferas':
      return macroEsferas(r, ctx);
    case 'fluorescencia':
      return macroFluorescencia(r, ctx);
    case 'western':
      return macroWestern(r, ctx);
  }
}

export function contextoActual(versionApp: string, fecha = new Date()): Contexto {
  return { versionApp, fecha: fecha.toISOString().slice(0, 10) };
}
