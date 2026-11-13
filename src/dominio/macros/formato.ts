/**
 * Formateo seguro para el lenguaje de macros de ImageJ (spec §7, reglas 1 y 2).
 * Nunca usa toLocaleString: un «0,65» dentro del macro rompe Fiji.
 */

/** Número con punto decimal, sin notación científica. `decimales` fija los decimales. */
export function num(n: number, decimales?: number): string {
  if (!Number.isFinite(n)) throw new Error(`Número no válido para el macro: ${n}`);
  if (decimales !== undefined) return n.toFixed(decimales);
  if (Number.isInteger(n)) return n.toFixed(0);
  // Hasta 6 decimales, sin ceros sobrantes
  return n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

/** Cadena entre comillas con \ y " escapados; los saltos de línea pasan a \n. */
export function cadena(s: string): string {
  const escapada = s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n|\r|\n/g, '\\n');
  return `"${escapada}"`;
}

/**
 * Cadena segura en cualquier codificación: los caracteres no ASCII (tildes, ñ, µ, β…) se escriben
 * con fromCharCode(). Verificado en Fiji 1.54p: al lanzar un .ijm con -macro o desde
 * Plugins › Macros › Run, el archivo se lee con la codificación del sistema y «imágenes» sale como
 * «imÃ¡genes»; fromCharCode(225) siempre da «á».
 */
export function texto(s: string): string {
  const partes: string[] = [];
  let ascii = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x20 && c < 0x7f) {
      ascii += ch;
      continue;
    }
    if (ch === '\n') {
      ascii += '\n';
      continue;
    }
    if (ascii) partes.push(cadena(ascii));
    ascii = '';
    const unidades = Array.from(ch)
      .flatMap((x) => (x.length === 2 ? [x.charCodeAt(0), x.charCodeAt(1)] : [x.charCodeAt(0)]));
    partes.push(`fromCharCode(${unidades.join(', ')})`);
  }
  if (ascii || partes.length === 0) partes.push(cadena(ascii));
  return partes.join(' + ');
}

/** Texto apto para un comentario de una línea: sin saltos de línea ni «*\/». */
const SEPARADORES = new RegExp(
  `[\\r\\n${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]+`,
  'g',
);

export function comentario(s: string): string {
  return s
    .replace(SEPARADORES, ' ')
    .replace(/\*\//g, '* /')
    .trim();
}

/** Área de un círculo de diámetro d: Fiji filtra por área, no por diámetro (spec §8). */
export function areaDesdeDiametro(d: number): number {
  return Math.PI * (d / 2) ** 2;
}
