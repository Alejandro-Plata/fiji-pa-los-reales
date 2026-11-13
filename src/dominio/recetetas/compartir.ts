/**
 * Compartir por enlace (spec §6):
 *   #/importar?r=<datos>
 * <datos> = JSON de la receteta (sin id, fechas ni favorita), comprimido con
 * CompressionStream('deflate-raw') y codificado en base64url.
 * Se antepone una letra para saber cómo decodificar: "z" comprimido, "j" sin comprimir
 * (navegadores sin CompressionStream).
 */
import { aCompartida } from './crear';
import { esquemaRecetetaCompartida } from './esquemas';
import { migrar } from './almacenamiento';
import type { Receteta, RecetetaCompartida } from './tipos';

export const LIMITE_ENLACE = 2000;

function aBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(texto: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(texto)) throw new Error('caracteres no válidos');
  const b64 = texto.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((texto.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function transformar(bytes: Uint8Array, flujo: CompressionStream | DecompressionStream) {
  const salida = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(flujo as unknown as TransformStream<Uint8Array, Uint8Array>);
  return new Uint8Array(await new Response(salida).arrayBuffer());
}

const hayCompresion = () => typeof CompressionStream !== 'undefined';

export async function codificarReceteta(r: Receteta): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(aCompartida(r)));
  if (hayCompresion()) {
    const comprimido = await transformar(json, new CompressionStream('deflate-raw'));
    return 'z' + aBase64Url(comprimido);
  }
  return 'j' + aBase64Url(json);
}

export class EnlaceNoValido extends Error {}

export async function decodificarReceteta(datos: string): Promise<RecetetaCompartida> {
  let json: unknown;
  try {
    const modo = datos[0];
    const bytes = deBase64Url(datos.slice(1));
    let texto: Uint8Array;
    if (modo === 'z') {
      if (typeof DecompressionStream === 'undefined') {
        throw new EnlaceNoValido(
          'Este navegador no puede abrir enlaces comprimidos. Puede usarse otro navegador o el archivo .json.',
        );
      }
      texto = await transformar(bytes, new DecompressionStream('deflate-raw'));
    } else if (modo === 'j') {
      texto = bytes;
    } else {
      throw new Error('formato desconocido');
    }
    json = JSON.parse(new TextDecoder().decode(texto));
  } catch (e) {
    if (e instanceof EnlaceNoValido) throw e;
    throw new EnlaceNoValido('El enlace está incompleto o dañado. Debe solicitarse de nuevo.');
  }
  const r = esquemaRecetetaCompartida.safeParse(migrar(json));
  if (!r.success) {
    throw new EnlaceNoValido(
      'El enlace no contiene una receteta válida. Puede haberse modificado o proceder de otra versión de la app.',
    );
  }
  return r.data;
}

/** URL completa para compartir. `base` es la dirección pública de la app. */
export function construirEnlace(base: string, datos: string): string {
  const limpia = base.replace(/#.*$/, '');
  return `${limpia}#/importar?r=${datos}`;
}
