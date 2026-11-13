import type { CSSProperties, JSX, ReactNode } from 'react';
import { t } from '../../textos/es';
import e from './Figuras.module.css';

/**
 * Ilustraciones animadas del tutorial (SVG + CSS). Decorativas: el texto de cada diapositiva
 * explica lo mismo. Con «reducir movimiento» las animaciones saltan a su estado final, que
 * siempre muestra la figura completa.
 */
const f = t.tutorial.figuras;

function Lienzo({ children }: { children: ReactNode }) {
  return (
    <svg className={e.svg} viewBox="0 0 320 200" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const retraso = (s: number) => ({ animationDelay: `${s}s` }) as CSSProperties;

/** 1. Opciones → macro */
function QueEs() {
  return (
    <Lienzo>
      <text x="20" y="34" className={e.etiqueta}>{f.opciones}</text>
      {[0, 1, 2].map((i) => (
        <g key={i} className={e.aparece} style={retraso(0.2 + i * 0.25)}>
          <rect x="20" y={48 + i * 40} width="104" height="28" rx="6" className={e.tarjetaClara} />
          <rect x="30" y={58 + i * 40} width="44" height="8" rx="4" className={e.lineaOscura} />
          <rect x="92" y={55 + i * 40} width="24" height="14" rx="7" className={e.interruptor} />
          <circle cx="109" cy={62 + i * 40} r="5" className={e.mando} style={retraso(0.4 + i * 0.25)} />
        </g>
      ))}
      <path d="M138 110 H 170" className={`${e.flecha} ${e.dibuja}`} style={retraso(1)} />
      <path d="M162 102 L 172 110 L 162 118" className={`${e.flecha} ${e.dibuja}`} style={retraso(1.2)} />
      <g className={e.aparece} style={retraso(1.2)}>
        <rect x="186" y="40" width="116" height="140" rx="8" className={e.codigo} />
        <text x="198" y="60" className={e.etiquetaClara}>{f.macro}</text>
      </g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={198 + (i % 3 === 1 ? 10 : 0)}
          y={74 + i * 14}
          width={[70, 56, 82, 40, 64, 76, 48][i]}
          height="6"
          rx="3"
          className={`${i === 3 ? e.lineaLima : e.lineaCodigo} ${e.escribe}`}
          style={retraso(1.5 + i * 0.18)}
        />
      ))}
    </Lienzo>
  );
}

/** 2. Tres tipos de análisis */
function Tipos() {
  return (
    <Lienzo>
      {[0, 1, 2].map((i) => (
        <g key={i} className={e.sube} style={retraso(0.15 + i * 0.25)}>
          <g className={e.flota} style={retraso(1.2 + i * 0.4)}>
            <rect x={14 + i * 102} y="36" width="88" height="128" rx="12" className={i === 1 ? e.tarjetaDestacada : e.tarjetaClara} />
          </g>
        </g>
      ))}
      {/* Mamosferas */}
      <g className={e.sube} style={retraso(0.15)}>
        <circle cx="52" cy="92" r="22" className={e.esfera} />
        <circle cx="76" cy="76" r="11" className={e.esfera} />
        <circle cx="74" cy="112" r="7" className={e.esferaRosa} />
        <rect x="30" y="134" width="44" height="8" rx="4" className={e.lineaOscura} />
      </g>
      {/* Fluorescencia */}
      <g className={e.sube} style={retraso(0.4)}>
        {[
          [146, 80],
          [172, 84],
          [158, 104],
          [182, 108],
          [140, 110],
        ].map(([x, y], j) => (
          <g key={j}>
            <circle cx={x} cy={y} r="10" className={j % 2 ? e.nucleoPositivo : e.nucleo} />
            <circle cx={x} cy={y} r="3" className={e.nucleoInterior} />
          </g>
        ))}
        <rect x="132" y="134" width="44" height="8" rx="4" className={e.lineaClara} />
      </g>
      {/* Western */}
      <g className={e.sube} style={retraso(0.65)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={234 + j * 14} y="90" width="10" height={4 + j * 2} rx="2" className={e.banda} />
        ))}
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={234 + j * 14} y="112" width="10" height="4" rx="2" className={e.bandaSuave} />
        ))}
        <rect x="234" y="134" width="44" height="8" rx="4" className={e.lineaOscura} />
      </g>
    </Lienzo>
  );
}

/** 3. Asistente por pasos */
function Asistente() {
  return (
    <Lienzo>
      <path d="M40 50 H 280" className={e.pista} />
      <path d="M40 50 H 280" className={`${e.pistaLlena} ${e.dibujaLento}`} style={retraso(0.3)} />
      {f.pasos.map((p, i) => (
        <g key={p}>
          <circle cx={40 + i * 80} cy="50" r="14" className={e.paso} />
          <circle cx={40 + i * 80} cy="50" r="14" className={`${e.pasoHecho} ${e.aparece}`} style={retraso(0.3 + i * 0.6)} />
          <text x={40 + i * 80} y="86" textAnchor="middle" className={e.etiquetaPequena}>
            {p}
          </text>
        </g>
      ))}
      <g className={e.aparece} style={retraso(0.6)}>
        <rect x="24" y="108" width="272" height="72" rx="12" className={e.tarjetaClara} />
        <rect x="40" y="124" width="88" height="8" rx="4" className={e.lineaOscura} />
        <rect x="236" y="120" width="40" height="18" rx="9" className={e.interruptor} />
        <circle cx="247" cy="129" r="7" className={`${e.mando} ${e.desliza}`} style={retraso(1.2)} />
        <rect x="40" y="156" width="236" height="4" rx="2" className={e.pista2} />
        <circle cx="90" cy="158" r="8" className={`${e.mandoLima} ${e.deslizaLargo}`} style={retraso(1.6)} />
      </g>
    </Lienzo>
  );
}

/** 4. Macro listo para usar */
function Macro() {
  return (
    <Lienzo>
      <rect x="40" y="20" width="240" height="160" rx="10" className={e.codigo} />
      <circle cx="56" cy="36" r="4" className={e.puntoRosa} />
      <circle cx="70" cy="36" r="4" className={e.puntoLima} />
      <text x="88" y="40" className={e.etiquetaClara}>{f.macro}</text>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect x="56" y={58 + i * 14} width="10" height="6" rx="2" className={e.numeroLinea} />
          <rect
            x={76 + (i > 1 && i < 6 ? 12 : 0)}
            y={58 + i * 14}
            width={[120, 90, 140, 70, 110, 96, 60, 130][i]}
            height="6"
            rx="3"
            className={`${i === 4 ? e.lineaLima : i === 2 ? e.lineaRosa : e.lineaCodigo} ${e.escribe}`}
            style={retraso(0.2 + i * 0.2)}
          />
        </g>
      ))}
      <g className={e.salta} style={retraso(2)}>
        <rect x="178" y="146" width="92" height="24" rx="12" className={e.pildoraLima} />
        <path d="M188 158 l5 5 l9 -10" className={e.check} />
        <text x="208" y="162" className={e.etiquetaOscura}>{f.copiado}</text>
      </g>
    </Lienzo>
  );
}

/** 5. Ejecución en Fiji: carpeta → proceso → resultados */
function Fiji() {
  return (
    <Lienzo>
      <text x="20" y="40" className={e.etiqueta}>{f.carpeta}</text>
      <path d="M20 58 h28 l8 8 h44 v68 h-80 z" className={e.carpeta} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={30 + i * 22} y="86" width="16" height="16" rx="3" className={e.miniatura} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="96"
          y="92"
          width="12"
          height="12"
          rx="2"
          className={`${e.miniaturaLima} ${e.viaja}`}
          style={retraso(0.4 + i * 0.5)}
        />
      ))}
      <g className={e.gira}>
        <circle cx="160" cy="98" r="22" className={e.engranaje} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="155" y="68" width="10" height="12" rx="2" className={e.diente} transform={`rotate(${a} 160 98)`} />
        ))}
        <circle cx="160" cy="98" r="8" className={e.engranajeCentro} />
      </g>
      <text x="206" y="40" className={e.etiqueta}>{f.resultados}</text>
      {f.archivos.map((a, i) => (
        <g key={a} className={e.entraDerecha} style={retraso(1.2 + i * 0.35)}>
          <rect x="206" y={54 + i * 30} width="98" height="24" rx="6" className={i < 2 ? e.tarjetaClara : e.tarjetaDestacada} />
          <text x="216" y={70 + i * 30} className={i < 2 ? e.etiquetaPequena : e.etiquetaPequenaClara}>
            {a}
          </text>
        </g>
      ))}
    </Lienzo>
  );
}

const ESFERAS: [number, number, number][] = [
  [120, 70, 14],
  [160, 58, 10],
  [196, 82, 16],
  [140, 112, 12],
  [184, 124, 11],
  [122, 148, 9],
  [204, 150, 13],
  [160, 156, 8],
];

/** 6. Análisis rápido en el móvil */
function Rapido() {
  return (
    <Lienzo>
      <rect x="92" y="10" width="136" height="180" rx="18" className={e.movil} />
      <rect x="102" y="30" width="116" height="140" rx="8" className={e.pantallaMovil} />
      {ESFERAS.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} className={e.esferaGris} />
          <circle cx={x} cy={y} r={r + 3} className={`${e.contorno} ${e.traza}`} style={retraso(0.4 + i * 0.22)} />
        </g>
      ))}
      <circle cx="108" cy="96" r="3" className={e.restoGris} />
      <circle cx="108" cy="96" r="6" className={`${e.contornoRosa} ${e.traza}`} style={retraso(2.2)} />
      <g className={e.salta} style={retraso(2.4)}>
        <rect x="236" y="76" width="76" height="44" rx="10" className={e.tarjetaDestacada} />
        <text x="274" y="104" textAnchor="middle" className={e.cifra}>
          {f.recuento(8)}
        </text>
      </g>
      <g className={e.aparece} style={retraso(0.2)}>
        <rect x="14" y="150" width="62" height="4" rx="2" className={e.pista2} />
        <rect x="14" y="146" width="2" height="12" className={e.marcaEscala} />
        <rect x="74" y="146" width="2" height="12" className={e.marcaEscala} />
        <text x="45" y="140" textAnchor="middle" className={e.etiquetaPequena}>100 µm</text>
      </g>
    </Lienzo>
  );
}

const BARRAS = [6, 14, 30, 52, 70, 64, 44, 28, 18, 12, 8, 6, 5, 4];

/** 7. Umbral desde un control negativo */
function Umbral() {
  return (
    <Lienzo>
      <path d="M24 172 H 296" className={e.eje} />
      {BARRAS.map((h, i) => (
        <rect
          key={i}
          x={30 + i * 19}
          y={172 - h * 2}
          width="14"
          height={h * 2}
          rx="2"
          className={`${i >= 10 ? e.barraLima : e.barra} ${e.crece}`}
          style={retraso(0.1 + i * 0.07)}
        />
      ))}
      <g className={e.umbralLinea}>
        <path d="M218 24 V 172" className={e.lineaUmbral} />
        <rect x="196" y="10" width="44" height="18" rx="9" className={e.pildoraRosa} />
        <text x="218" y="23" textAnchor="middle" className={e.etiquetaOscuraPequena}>
          {f.umbral}
        </text>
      </g>
    </Lienzo>
  );
}

/** 8. Compartir y conservar */
function Compartir() {
  return (
    <Lienzo>
      <rect x="24" y="52" width="64" height="112" rx="12" className={e.movil} />
      <rect x="32" y="66" width="48" height="80" rx="4" className={e.pantallaMovil} />
      <rect x="40" y="78" width="32" height="6" rx="3" className={e.lineaLima} />
      <rect x="40" y="92" width="24" height="6" rx="3" className={e.lineaCodigo} />
      <rect x="196" y="48" width="104" height="72" rx="8" className={e.movil} />
      <rect x="204" y="56" width="88" height="56" rx="4" className={e.pantallaMovil} />
      <path d="M184 128 H 312 l-10 10 H 194 z" className={e.movil} />
      <path d="M96 100 C 130 60, 160 60, 190 84" className={e.camino} />
      <g className={e.recorre}>
        <rect x="-14" y="-9" width="28" height="18" rx="9" className={e.pildoraLima} />
        <path d="M-6 0 h12 M-2 -4 l-4 4 l4 4 M2 -4 l4 4 l-4 4" className={e.check} />
      </g>
      <g className={e.salta} style={retraso(1.6)}>
        <rect x="228" y="70" width="40" height="30" rx="4" className={e.tarjetaClara} />
        <text x="248" y="90" textAnchor="middle" className={e.etiquetaPequena}>.json</text>
      </g>
      <g className={e.aparece} style={retraso(2)}>
        <path d="M120 150 h48 v28 h-48 z" className={e.caja} />
        <path d="M144 132 v14 M138 140 l6 6 l6 -6" className={e.flecha} />
      </g>
    </Lienzo>
  );
}

type IdDiapositiva = (typeof t.tutorial.diapositivas)[number]['id'];

export const FIGURAS: Record<IdDiapositiva, () => JSX.Element> = {
  'que-es': QueEs,
  tipos: Tipos,
  asistente: Asistente,
  macro: Macro,
  fiji: Fiji,
  rapido: Rapido,
  umbral: Umbral,
  compartir: Compartir,
};
