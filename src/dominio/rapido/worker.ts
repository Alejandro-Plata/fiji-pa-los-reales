/// <reference lib="webworker" />
/** Web Worker del análisis rápido: el procesado no bloquea la interfaz (spec §13). */
import { aGris, procesar, reescalar, type ParametrosRapido, type ResultadoRapido } from './procesar';
import { leerTiff } from './tiff';

export type MensajeEntrada =
  | { tipo: 'rgba'; rgba: Uint8ClampedArray; ancho: number; alto: number; factor: number; params: ParametrosRapido }
  | { tipo: 'tiff'; buffer: ArrayBuffer; params: ParametrosRapido }
  | { tipo: 'reprocesar'; params: ParametrosRapido };

export type MensajeSalida =
  | {
      tipo: 'imagen';
      gris: Float32Array;
      ancho: number;
      alto: number;
      factor: number;
      micrasPorPixelArchivo: number | null;
    }
  | { tipo: 'resultado'; resultado: ResultadoRapido }
  | { tipo: 'error'; mensaje: string };

let ultima: { gris: Float32Array; ancho: number; alto: number } | null = null;

function responder(m: MensajeSalida, transfer: Transferable[] = []) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(m, transfer);
}

function analizar(params: ParametrosRapido) {
  if (!ultima) return;
  const resultado = procesar(ultima.gris, ultima.ancho, ultima.alto, params);
  responder({ tipo: 'resultado', resultado });
}

self.onmessage = (e: MessageEvent<MensajeEntrada>) => {
  try {
    const m = e.data;
    if (m.tipo === 'rgba') {
      ultima = { gris: aGris(m.rgba, m.ancho * m.alto), ancho: m.ancho, alto: m.alto };
      responder({
        tipo: 'imagen',
        gris: ultima.gris.slice(),
        ancho: m.ancho,
        alto: m.alto,
        factor: m.factor,
        micrasPorPixelArchivo: null,
      });
      analizar(m.params);
    } else if (m.tipo === 'tiff') {
      const t = leerTiff(m.buffer);
      const r = reescalar(t.gris, t.ancho, t.alto);
      ultima = { gris: r.gris, ancho: r.ancho, alto: r.alto };
      responder({
        tipo: 'imagen',
        gris: r.gris.slice(),
        ancho: r.ancho,
        alto: r.alto,
        factor: r.factor,
        micrasPorPixelArchivo: t.micrasPorPixel,
      });
      analizar(m.params);
    } else {
      analizar(m.params);
    }
  } catch (err) {
    responder({ tipo: 'error', mensaje: err instanceof Error ? err.message : String(err) });
  }
};
