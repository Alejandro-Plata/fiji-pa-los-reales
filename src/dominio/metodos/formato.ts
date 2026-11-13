import type { Idioma } from './index';

/** Número con la convención del idioma: 0,4 / 0.4; 1000 / 1,000 (RAE: sin separador en 4 cifras). */
export function n(x: number, idioma: Idioma): string {
  return new Intl.NumberFormat(idioma === 'es' ? 'es-ES' : 'en-GB', {
    maximumFractionDigits: 4,
    // Español (RAE): sin separador en números de 4 cifras («1000»); a partir de 5, sí («10.000»)
    useGrouping: idioma === 'en' || Math.abs(x) >= 10_000,
  }).format(x);
}

/** Une frases de una lista: «a, b y c» / «a, b and c». */
export function lista(items: string[], idioma: Idioma): string {
  if (items.length <= 1) return items.join('');
  const y = idioma === 'es' ? ' y ' : ' and ';
  return items.slice(0, -1).join(', ') + y + items[items.length - 1];
}
