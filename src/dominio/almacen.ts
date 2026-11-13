/**
 * Acceso seguro a localStorage (spec §6): toda lectura y escritura dentro de try/catch.
 * Si el navegador no deja guardar, la app sigue funcionando en memoria.
 */
const memoria = new Map<string, string>();
let disponible: boolean | null = null;

export function almacenamientoDisponible(): boolean {
  if (disponible !== null) return disponible;
  try {
    const clave = '__prueba__';
    window.localStorage.setItem(clave, '1');
    window.localStorage.removeItem(clave);
    disponible = true;
  } catch {
    disponible = false;
  }
  return disponible;
}

export function leer(clave: string): string | null {
  try {
    if (almacenamientoDisponible()) return window.localStorage.getItem(clave);
  } catch {
    /* sigue en memoria */
  }
  return memoria.get(clave) ?? null;
}

export function escribir(clave: string, valor: string): boolean {
  memoria.set(clave, valor);
  try {
    if (almacenamientoDisponible()) {
      window.localStorage.setItem(clave, valor);
      return true;
    }
  } catch {
    /* cuota llena o bloqueado: queda en memoria */
  }
  return false;
}

export function borrar(clave: string): void {
  memoria.delete(clave);
  try {
    if (almacenamientoDisponible()) window.localStorage.removeItem(clave);
  } catch {
    /* nada */
  }
}
