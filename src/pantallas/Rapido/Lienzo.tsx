import { useEffect, useRef, useState } from 'react';
import type { Objeto } from '../../dominio/rapido/procesar';
import { Boton } from '../../componentes/Boton/Boton';
import { t } from '../../textos/es';
import estilos from './Rapido.module.css';

export interface Punto {
  x: number;
  y: number;
}

interface Props {
  gris: Float32Array;
  ancho: number;
  alto: number;
  /** Foto original reescalada (en color); si no hay, se pinta la imagen en grises. */
  foto: ImageBitmap | null;
  objetos: Objeto[];
  aceptados: Set<number>;
  calibrando: boolean;
  puntos: Punto[];
  onPunto: (p: Punto) => void;
}

function colorToken(nombre: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  const m = /^#?([0-9a-f]{6})$/i.exec(v);
  const hex = m?.[1] ?? 'ffffff';
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * Lienzo que se adapta al ancho (max-width: 100 %) y permite ampliar con pellizco
 * (o con los botones, sin depender de gestos). Un toque marca un punto al calibrar.
 */
export function Lienzo({ gris, ancho, alto, foto, objetos, aceptados, calibrando, puntos, onPunto }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef<{ dist: number; s: number; movido: boolean; inicio: { x: number; y: number } } | null>(null);
  const huboArrastre = useRef(false);

  // Dibujo: imagen + contornos (lima = contados, rosa = descartados) + calibración
  useEffect(() => {
    const c = lienzo.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    c.width = ancho;
    c.height = alto;
    if (foto) ctx.drawImage(foto, 0, 0, ancho, alto);
    else {
      const img = ctx.createImageData(ancho, alto);
      for (let i = 0, j = 0; i < gris.length; i++, j += 4) {
        const v = gris[i]!;
        img.data[j] = v;
        img.data[j + 1] = v;
        img.data[j + 2] = v;
        img.data[j + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    const datos = ctx.getImageData(0, 0, ancho, alto);
    const si = colorToken('--accent-lime');
    const no = colorToken('--accent-pink');
    for (const o of objetos) {
      const [r, g, b] = aceptados.has(o.id) ? si : no;
      for (const i of o.contorno) {
        // Contorno de 2 px para que se vea en el móvil
        for (const j of [i, i + 1, i + ancho]) {
          if (j >= gris.length) continue;
          datos.data[j * 4] = r;
          datos.data[j * 4 + 1] = g;
          datos.data[j * 4 + 2] = b;
        }
      }
    }
    ctx.putImageData(datos, 0, 0);
    if (puntos.length) {
      const [r, g, b] = si;
      ctx.strokeStyle = `rgb(${r} ${g} ${b})`;
      ctx.fillStyle = `rgb(${r} ${g} ${b})`;
      ctx.lineWidth = Math.max(2, ancho / 400);
      ctx.beginPath();
      puntos.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      for (const p of puntos) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(4, ancho / 200), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [gris, ancho, alto, foto, objetos, aceptados, puntos]);

  const aImagen = (clientX: number, clientY: number): Punto | null => {
    const c = lienzo.current;
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * ancho, y: ((clientY - r.top) / r.height) * alto };
  };

  const alBajar = (e: React.PointerEvent) => {
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    huboArrastre.current = false;
    const ps = [...punteros.current.values()];
    gesto.current = {
      dist: ps.length === 2 ? Math.hypot(ps[0]!.x - ps[1]!.x, ps[0]!.y - ps[1]!.y) : 0,
      s: zoom.s,
      movido: ps.length > 1,
      inicio: { x: e.clientX, y: e.clientY },
    };
  };

  const alMover = (e: React.PointerEvent) => {
    const prev = punteros.current.get(e.pointerId);
    if (!prev || !gesto.current) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...punteros.current.values()];
    if (ps.length === 2 && gesto.current.dist > 0) {
      const d = Math.hypot(ps[0]!.x - ps[1]!.x, ps[0]!.y - ps[1]!.y);
      const s = Math.min(8, Math.max(1, (gesto.current.s * d) / gesto.current.dist));
      setZoom((z) => ({ ...z, s }));
      gesto.current.movido = true;
    } else if (ps.length === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (Math.hypot(e.clientX - gesto.current.inicio.x, e.clientY - gesto.current.inicio.y) > 6) {
        gesto.current.movido = true;
      }
      if (zoom.s > 1) setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }));
    }
  };

  const alSubir = (e: React.PointerEvent) => {
    if (gesto.current?.movido) huboArrastre.current = true;
    punteros.current.delete(e.pointerId);
    if (punteros.current.size === 0) gesto.current = null;
  };

  // Un toque (sin arrastre ni pellizco) marca un punto de la barra de escala
  const alTocar = (e: React.MouseEvent) => {
    if (!calibrando || huboArrastre.current) return;
    const p = aImagen(e.clientX, e.clientY);
    if (p) onPunto(p);
  };

  return (
    <div className={estilos.lienzoMarco}>
      <div
        className={estilos.lienzoVentana}
        data-calibrando={calibrando}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSubir}
        onPointerCancel={alSubir}
        onClick={alTocar}
      >
        <canvas
          ref={lienzo}
          className={estilos.lienzo}
          role="img"
          aria-label={t.rapido.lienzo}
          style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})` }}
        />
      </div>
      <div className="fila">
        <Boton variante="secundario" onClick={() => setZoom((z) => ({ ...z, s: Math.min(8, z.s * 1.5) }))}>
          {t.rapido.zoomMas}
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => setZoom((z) => (z.s / 1.5 <= 1 ? { s: 1, x: 0, y: 0 } : { ...z, s: z.s / 1.5 }))}
        >
          {t.rapido.zoomMenos}
        </Boton>
        <Boton variante="secundario" onClick={() => setZoom({ s: 1, x: 0, y: 0 })}>
          {t.rapido.zoomReset}
        </Boton>
      </div>
    </div>
  );
}
