/**
 * Actualizaciones de la app Android desde la propia app.
 *
 * Cada publicación (scripts/publicar.mjs) sube a la web:
 *   descargas/version.json                 → { version, apk, tamano, publicada, novedades[] }
 *   descargas/fiji-pa-los-reales-X.Y.Z.apk
 * La app compara su versión con version.json y, si hay una más nueva, descarga el APK y abre el
 * instalador de Android (plugin nativo «Actualizador», android/app/.../ActualizadorPlugin.java).
 * La versión web (PWA) no lo necesita: se actualiza sola con el service worker.
 */
import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { z } from 'zod';
import { esAppNativa, esEscritorio } from './plataforma';

const esquemaPublicacion = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  apk: z.string().min(1),
  tamano: z.number().nonnegative().optional(),
  publicada: z.string(),
  novedades: z.array(z.string()).default([]),
  /** Instalador de Windows de la misma versión (opcional). */
  windows: z.object({ instalador: z.string().min(1), tamano: z.number().nonnegative().optional() }).optional(),
});

export type Publicacion = z.infer<typeof esquemaPublicacion>;

/** -1 si a < b, 0 si son iguales, 1 si a > b (versiones X.Y.Z). */
export function compararVersiones(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

export function leerPublicacion(datos: unknown): Publicacion | null {
  const r = esquemaPublicacion.safeParse(datos);
  return r.success ? r.data : null;
}

/** Carpeta pública de descargas: la web publicada (en Android, VITE_URL_PUBLICA). */
export function urlDescargas(): string | null {
  const configurada = import.meta.env.VITE_URL_PUBLICA as string | undefined;
  const base =
    configurada || (esAppNativa() || esEscritorio() ? null : `${location.origin}${location.pathname}`);
  if (!base) return null;
  return new URL('descargas/', base.endsWith('/') ? base : `${base}/`).href;
}

export type Comprobacion =
  | { estado: 'al-dia'; publicacion: Publicacion }
  | { estado: 'disponible'; publicacion: Publicacion; urlApk: string; urlWindows: string | null }
  | { estado: 'sin-publicacion' }
  | { estado: 'error' };

/** Consulta version.json. Nunca lanza: los fallos de red se devuelven como «error». */
export async function comprobarActualizacion(versionActual = __VERSION_APP__): Promise<Comprobacion> {
  const carpeta = urlDescargas();
  if (!carpeta) return { estado: 'sin-publicacion' };
  try {
    const r = await fetch(`${carpeta}version.json`, { cache: 'no-store' });
    if (r.status === 404) return { estado: 'sin-publicacion' };
    if (!r.ok) return { estado: 'error' };
    const publicacion = leerPublicacion(await r.json());
    if (!publicacion) return { estado: 'error' };
    const urlApk = new URL(publicacion.apk, carpeta).href;
    const urlWindows = publicacion.windows ? new URL(publicacion.windows.instalador, carpeta).href : null;
    return compararVersiones(publicacion.version, versionActual) > 0
      ? { estado: 'disponible', publicacion, urlApk, urlWindows }
      : { estado: 'al-dia', publicacion };
  } catch {
    return { estado: 'error' };
  }
}

interface ActualizadorNativo {
  permisoInstalar(): Promise<{ concedido: boolean }>;
  abrirAjustesPermiso(): Promise<void>;
  descargarEInstalar(o: { url: string }): Promise<void>;
  addListener(
    evento: 'progreso',
    f: (e: { porcentaje: number }) => void,
  ): Promise<PluginListenerHandle>;
}

const Actualizador = registerPlugin<ActualizadorNativo>('Actualizador');

export const permisoInstalar = async () => (await Actualizador.permisoInstalar()).concedido;
export const abrirAjustesPermiso = () => Actualizador.abrirAjustesPermiso();

/** Descarga el APK informando del progreso (0–100) y abre el instalador de Android. */
export async function descargarEInstalar(url: string, alProgresar: (pct: number) => void) {
  const escucha = await Actualizador.addListener('progreso', (e) => alProgresar(e.porcentaje));
  try {
    await Actualizador.descargarEInstalar({ url });
  } finally {
    await escucha.remove();
  }
}

/** Tamaño legible en MB (español). */
export const megas = (bytes: number) => `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB`;
