/**
 * Almacenamiento de recetetas en localStorage (spec §6).
 * - `recetetas:v1`: array de recetetas.
 * - `recetetas:borrador`: borrador del asistente en curso.
 * - `recetetas:corruptas`: recetetas que no pasan la validación. Nunca se borran en silencio.
 */
import { escribir, leer, borrar } from '../almacen';
import { esquemaReceteta } from './esquemas';
import type { Receteta } from './tipos';

export const CLAVE_RECETETAS = 'recetetas:v1';
export const CLAVE_BORRADOR = 'recetetas:borrador';
export const CLAVE_CORRUPTAS = 'recetetas:corruptas';
export const CLAVE_AJUSTES = 'ajustes:v1';

/**
 * Lleva cualquier versión anterior del esquema a la actual.
 * Hoy solo existe la versión 1; aquí se añadirán los pasos de migración futuros.
 */
export function migrar(json: unknown): unknown {
  if (json && typeof json === 'object' && !('esquema' in json)) {
    return { ...json, esquema: 1 };
  }
  return json;
}

export interface ResultadoCarga {
  recetetas: Receteta[];
  corruptasNuevas: number;
}

function leerJson(clave: string): unknown {
  const texto = leer(clave);
  if (texto === null) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return undefined; // texto ilegible
  }
}

export function cargarRecetetas(): ResultadoCarga {
  const crudo = leerJson(CLAVE_RECETETAS);
  if (crudo === null) return { recetetas: [], corruptasNuevas: 0 };

  const lista: unknown[] = Array.isArray(crudo) ? crudo : [crudo];
  const validas: Receteta[] = [];
  const invalidas: unknown[] = [];
  for (const item of lista) {
    const r = esquemaReceteta.safeParse(migrar(item));
    if (r.success) validas.push(r.data);
    else invalidas.push(item);
  }

  if (invalidas.length > 0) {
    const previas = leerJson(CLAVE_CORRUPTAS);
    const acumuladas = [...(Array.isArray(previas) ? previas : []), ...invalidas];
    escribir(CLAVE_CORRUPTAS, JSON.stringify(acumuladas));
    guardarRecetetas(validas);
  }
  return { recetetas: validas, corruptasNuevas: invalidas.length };
}

export function guardarRecetetas(recetetas: Receteta[]): boolean {
  return escribir(CLAVE_RECETETAS, JSON.stringify(recetetas));
}

export function contarCorruptas(): number {
  const c = leerJson(CLAVE_CORRUPTAS);
  return Array.isArray(c) ? c.length : 0;
}

export function leerCorruptas(): string {
  return leer(CLAVE_CORRUPTAS) ?? '[]';
}

// ---------- Borrador ----------
export interface Borrador {
  receteta: Receteta;
  paso: number;
  visitados: number[];
  /** id de la receteta guardada que se está editando; null si es nueva. */
  editando: string | null;
}

export function leerBorrador(): Borrador | null {
  const b = leerJson(CLAVE_BORRADOR) as Borrador | null | undefined;
  if (!b || typeof b !== 'object' || !b.receteta) return null;
  // El borrador puede estar incompleto (p. ej. sin nombre): solo se comprueba la forma básica.
  const r = esquemaReceteta.safeParse({ ...b.receteta, nombre: b.receteta.nombre || 'x' });
  if (!r.success && !esIncompletoPeroRecuperable(b.receteta)) return null;
  return b;
}

function esIncompletoPeroRecuperable(r: unknown): boolean {
  return !!r && typeof r === 'object' && 'tipo' in r && 'parametros' in r && 'id' in r;
}

export function guardarBorrador(b: Borrador): void {
  escribir(CLAVE_BORRADOR, JSON.stringify(b));
}

export function borrarBorrador(): void {
  borrar(CLAVE_BORRADOR);
}

// ---------- Ajustes ----------
export interface Ajustes {
  idiomaMetodos: 'es' | 'en';
}

export function leerAjustes(): Ajustes {
  const a = leerJson(CLAVE_AJUSTES) as Partial<Ajustes> | null | undefined;
  return { idiomaMetodos: a?.idiomaMetodos === 'en' ? 'en' : 'es' };
}

export function guardarAjustes(a: Ajustes): void {
  escribir(CLAVE_AJUSTES, JSON.stringify(a));
}

/** Borra todos los datos de la app (Ajustes › Borrar todos los datos). */
export function borrarTodo(): void {
  [CLAVE_RECETETAS, CLAVE_BORRADOR, CLAVE_CORRUPTAS, CLAVE_AJUSTES].forEach(borrar);
}

// ---------- Copia de seguridad (.json) ----------
export function exportarJson(recetetas: Receteta[], version: string): string {
  return JSON.stringify(
    { app: 'Fiji pa los reales', version, exportado: new Date().toISOString(), recetetas },
    null,
    2,
  );
}

export interface ResultadoImportacion {
  validas: Receteta[];
  rechazadas: number;
}

/** Acepta una copia de seguridad, un array de recetetas o una sola receteta. */
export function importarJson(texto: string): ResultadoImportacion {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  const lista: unknown[] = Array.isArray(datos)
    ? datos
    : datos && typeof datos === 'object' && Array.isArray((datos as { recetetas?: unknown }).recetetas)
      ? (datos as { recetetas: unknown[] }).recetetas
      : [datos];
  const validas: Receteta[] = [];
  let rechazadas = 0;
  for (const item of lista) {
    const r = esquemaReceteta.safeParse(migrar(item));
    if (r.success) validas.push(r.data);
    else rechazadas++;
  }
  return { validas, rechazadas };
}
