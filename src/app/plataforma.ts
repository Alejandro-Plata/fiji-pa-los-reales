/**
 * Diferencias entre la web (PWA) y la app Android (Capacitor):
 * guardar archivos, compartir y copiar al portapapeles.
 */
import { Capacitor } from '@capacitor/core';

export const esAppNativa = () => Capacitor.isNativePlatform();

/** Puente de la app de escritorio (escritorio/preload.cjs). */
interface PuenteEscritorio {
  plataforma: string;
  abrirEnNavegador(url: string): Promise<void>;
}
declare global {
  interface Window {
    fplrEscritorio?: PuenteEscritorio;
  }
}
export const escritorio = (): PuenteEscritorio | undefined =>
  typeof window === 'undefined' ? undefined : window.fplrEscritorio;
export const esEscritorio = () => escritorio() !== undefined;

/**
 * Dirección pública de la app, para los enlaces de receteta.
 * En la web es la propia dirección; en Android y Windows se usa VITE_URL_PUBLICA (la PWA publicada).
 */
export function urlPublica(): string | null {
  const configurada = import.meta.env.VITE_URL_PUBLICA as string | undefined;
  if (esAppNativa() || esEscritorio()) return configurada || null;
  return configurada || `${location.origin}${location.pathname}`;
}

function aBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export type ResultadoGuardar = { ok: true; donde?: string } | { ok: false };

/** Descarga un archivo de texto. En Android lo guarda en Documentos. */
export async function guardarArchivo(
  nombre: string,
  contenido: string,
  tipo: string,
): Promise<ResultadoGuardar> {
  if (esAppNativa()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const ruta = `FijiPaLosReales/${nombre}`;
      await Filesystem.writeFile({
        path: ruta,
        data: aBase64(contenido),
        directory: Directory.Documents,
        recursive: true,
      });
      return { ok: true, donde: `Documentos/${ruta}` };
    } catch {
      return { ok: false };
    }
  }
  try {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export interface DatosCompartir {
  titulo: string;
  texto?: string;
  url?: string;
  archivo?: { nombre: string; contenido: string; tipo: string };
}

export type ResultadoCompartir = 'compartido' | 'cancelado' | 'no-disponible';

/** Hoja de compartir del sistema (Web Share API o la nativa de Android). */
export async function compartir(d: DatosCompartir): Promise<ResultadoCompartir> {
  if (esAppNativa()) {
    try {
      const { Share } = await import('@capacitor/share');
      let files: string[] | undefined;
      if (d.archivo) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const escrito = await Filesystem.writeFile({
          path: d.archivo.nombre,
          data: aBase64(d.archivo.contenido),
          directory: Directory.Cache,
        });
        files = [escrito.uri];
      }
      await Share.share({ title: d.titulo, text: d.texto, url: d.url, files, dialogTitle: d.titulo });
      return 'compartido';
    } catch (e) {
      return String(e).includes('cancel') ? 'cancelado' : 'no-disponible';
    }
  }

  if (typeof navigator.share !== 'function') return 'no-disponible';
  const datos: ShareData = { title: d.titulo, text: d.texto, url: d.url };
  if (d.archivo) {
    const f = new File([d.archivo.contenido], d.archivo.nombre, { type: d.archivo.tipo });
    if (navigator.canShare?.({ files: [f] })) datos.files = [f];
    else if (!d.url && !d.texto) return 'no-disponible';
  }
  try {
    await navigator.share(datos);
    return 'compartido';
  } catch (e) {
    return e instanceof DOMException && e.name === 'AbortError' ? 'cancelado' : 'no-disponible';
  }
}

/** Copia texto al portapapeles. Devuelve false si no se puede (el llamador ofrece Ctrl+C). */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* sigue con la alternativa */
  }
  try {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Lee un archivo elegido por la usuaria como texto. */
export function leerArchivoTexto(f: File): Promise<string> {
  return f.text();
}
