/** Lectura de TIFF con UTIF.js (única dependencia permitida en el análisis rápido, spec §13). */
import UTIF from 'utif';
import { aGris, normalizar16 } from './procesar';

export interface ImagenGris {
  gris: Float32Array;
  ancho: number;
  alto: number;
  /** µm por píxel si el TIFF lo trae (formato ImageJ: resolución + unit=micron/um). */
  micrasPorPixel: number | null;
}

function escalaDesdeIfd(ifd: Record<string, unknown>): number | null {
  // t282 = XResolution (píxeles por unidad); t270 = ImageDescription de ImageJ con unit=
  const res = ifd.t282 as number[] | undefined;
  const desc = String((ifd.t270 as string[] | undefined)?.[0] ?? '');
  const unidad = /unit=([^\n]+)/.exec(desc)?.[1]?.trim().toLowerCase() ?? '';
  const micras = ['micron', 'microns', 'um', 'µm', '\\u00b5m'].includes(unidad);
  if (!res?.[0] || !micras) return null;
  return 1 / res[0];
}

export function leerTiff(buffer: ArrayBuffer): ImagenGris {
  const ifds = UTIF.decode(buffer);
  const ifd = ifds[0];
  if (!ifd) throw new Error('TIFF vacío');
  UTIF.decodeImage(buffer, ifd);
  const ancho = ifd.width;
  const alto = ifd.height;
  const n = ancho * alto;
  const bps = (ifd.t258 as number[] | undefined)?.[0] ?? 8;
  const spp = (ifd.t277 as number[] | undefined)?.[0] ?? 1;
  const micrasPorPixel = escalaDesdeIfd(ifd as unknown as Record<string, unknown>);

  if (spp === 1 && bps === 16) {
    const bytes = ifd.data as Uint8Array;
    const littleEndian = new Uint8Array(buffer, 0, 1)[0] === 0x49; // «II»
    const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const v = new Uint16Array(n);
    for (let i = 0; i < n; i++) v[i] = vista.getUint16(i * 2, littleEndian);
    return { gris: normalizar16(v), ancho, alto, micrasPorPixel };
  }
  if (spp === 1 && bps === 8) {
    const d = ifd.data as Uint8Array;
    const g = new Float32Array(n);
    for (let i = 0; i < n; i++) g[i] = d[i]!;
    return { gris: g, ancho, alto, micrasPorPixel };
  }
  const rgba = UTIF.toRGBA8(ifd);
  return { gris: aGris(rgba, n), ancho, alto, micrasPorPixel };
}
