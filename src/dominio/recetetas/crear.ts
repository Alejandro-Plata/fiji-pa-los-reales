import { esquemaReceteta } from './esquemas';
import type { Receteta, RecetetaCompartida, TipoAnalisis } from './tipos';

export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      /* contexto no seguro: se usa la alternativa */
    }
  }
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function ahora(): string {
  return new Date().toISOString();
}

/** Receteta nueva con todos los valores por defecto del esquema. */
export function crearReceteta(tipo: TipoAnalisis, nombre = ''): Receteta {
  const fecha = ahora();
  // El nombre vacío no pasa la validación: se rellena después en el asistente.
  const r = esquemaReceteta.parse({
    id: nuevoId(),
    esquema: 1,
    nombre: nombre || 'Sin nombre',
    tipo,
    creada: fecha,
    modificada: fecha,
  });
  return { ...r, nombre };
}

/** Convierte una receteta compartida (sin metadatos) en una receteta local nueva. */
export function desdeCompartida(c: RecetetaCompartida, origen: Receteta['origen']): Receteta {
  const fecha = ahora();
  return { ...c, id: nuevoId(), favorita: false, creada: fecha, modificada: fecha, origen } as Receteta;
}

/** Quita los metadatos locales (id, fechas, favorita, origen). */
export function aCompartida(r: Receteta): RecetetaCompartida {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, creada, modificada, favorita, origen, ...resto } = r;
  return resto as RecetetaCompartida;
}

export function duplicar(r: Receteta, nombresExistentes: string[]): Receteta {
  const fecha = ahora();
  return {
    ...structuredClone(r),
    id: nuevoId(),
    nombre: nombreUnico(`${r.nombre} (copia)`, nombresExistentes),
    favorita: false,
    creada: fecha,
    modificada: fecha,
  };
}

/** Si el nombre ya existe, propone "Nombre (2)", "Nombre (3)"… (spec §6). */
export function nombreUnico(nombre: string, existentes: string[]): string {
  const usados = new Set(existentes.map((n) => n.trim().toLowerCase()));
  if (!usados.has(nombre.trim().toLowerCase())) return nombre;
  const base = nombre.replace(/ \(\d+\)$/, '');
  for (let i = 2; ; i++) {
    const candidato = `${base} (${i})`.slice(0, 60);
    if (!usados.has(candidato.toLowerCase())) return candidato;
  }
}
