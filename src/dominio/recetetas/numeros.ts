/**
 * Lee un número escrito por la usuaria: acepta coma o punto decimal ("0,65" o "0.65").
 * Devuelve null si el texto no es un número válido.
 */
export function leerNumero(texto: string): number | null {
  const limpio = texto.trim().replace(/\s/g, '').replace(',', '.');
  if (limpio === '' || !/^-?(\d+\.?\d*|\.\d+)$/.test(limpio)) return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/** Muestra un número con la convención española (coma decimal) para la interfaz. */
export function mostrarNumero(n: number, decimales?: number): string {
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: decimales ?? 4,
    minimumFractionDigits: decimales ?? 0,
    useGrouping: false,
  }).format(n);
}
