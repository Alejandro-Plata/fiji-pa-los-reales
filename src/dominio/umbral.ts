/**
 * «Calcular umbral» (spec §9): a partir del objetos.csv de un control negativo, propone como
 * umbral de positividad un percentil (99 por defecto) de la intensidad del marcador.
 */

/** Lee un CSV de Fiji (separador coma, punto decimal, comillas opcionales). */
export function leerCsv(texto: string): { columnas: string[]; filas: string[][] } {
  const lineas = texto.replace(new RegExp('^' + String.fromCharCode(0xfeff)), '').split(/\r?\n/).filter((l) => l.trim() !== '');
  const partir = (l: string) => {
    const out: string[] = [];
    let actual = '';
    let comillas = false;
    for (const ch of l) {
      if (ch === '"') comillas = !comillas;
      else if (ch === ',' && !comillas) {
        out.push(actual.trim());
        actual = '';
      } else actual += ch;
    }
    out.push(actual.trim());
    return out;
  };
  const [cab, ...resto] = lineas;
  if (!cab) return { columnas: [], filas: [] };
  return { columnas: partir(cab), filas: resto.map(partir) };
}

/** Columnas de intensidad de marcadores que genera el macro (…_media o …_integrada). */
export function columnasDeMarcador(columnas: string[]): string[] {
  return columnas.filter((c) => /_(media|integrada)$/.test(c));
}

/** Valores numéricos de una columna (descarta vacíos y no numéricos). */
export function valoresColumna(csv: ReturnType<typeof leerCsv>, columna: string): number[] {
  const i = csv.columnas.indexOf(columna);
  if (i < 0) return [];
  return csv.filas
    .map((f) => Number(f[i]))
    .filter((v) => Number.isFinite(v));
}

/** Percentil con interpolación lineal (como numpy.percentile por defecto). */
export function percentil(valores: number[], p: number): number {
  if (valores.length === 0) throw new Error('Sin valores');
  if (p < 0 || p > 100) throw new Error('Percentil fuera de rango');
  const v = [...valores].sort((a, b) => a - b);
  const pos = ((v.length - 1) * p) / 100;
  const bajo = Math.floor(pos);
  const alto = Math.ceil(pos);
  return v[bajo]! + (v[alto]! - v[bajo]!) * (pos - bajo);
}

/** Redondeo legible para proponer el umbral (3 cifras significativas). */
export function redondear(x: number): number {
  if (x === 0) return 0;
  const d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(x))));
  return Number(x.toFixed(d));
}
