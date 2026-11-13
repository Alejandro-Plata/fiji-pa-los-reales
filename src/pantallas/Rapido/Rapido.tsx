import { useEffect, useRef, useState } from 'react';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton } from '../../componentes/Boton/Boton';
import { Nota } from '../../componentes/Nota/Nota';
import { CampoNumero } from '../../componentes/Campo/Controles';
import { Selector } from '../../componentes/Selector/Selector';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import { esquemaParametrosEsferas } from '../../dominio/recetetas/esquemas';
import { mostrarNumero } from '../../dominio/recetetas/numeros';
import type { RecetetaDe } from '../../dominio/recetetas/tipos';
import {
  diametroEquivalente,
  filtrar,
  type ParametrosRapido,
  type ResultadoRapido,
} from '../../dominio/rapido/procesar';
import type { MensajeEntrada, MensajeSalida } from '../../dominio/rapido/worker';
import { t } from '../../textos/es';
import { Lienzo, type Punto } from './Lienzo';
import estilos from './Rapido.module.css';

const MAXIMO = 2048;
const DEF = esquemaParametrosEsferas.parse({});

interface Imagen {
  gris: Float32Array;
  ancho: number;
  alto: number;
  factor: number;
  foto: ImageBitmap | null;
  micrasArchivo: number | null;
}

function parametrosDe(r: RecetetaDe<'esferas'> | undefined): ParametrosRapido {
  const p = r?.parametros ?? DEF;
  return {
    metodo: p.metodo,
    suavizado: p.suavizado,
    radioBordes: p.radioBordes,
    restarFondo: p.restarFondo,
    metodoUmbral: p.metodoUmbral,
    rellenarHuecos: p.rellenarHuecos,
    limpiarRuido: p.limpiarRuido,
  };
}

/** Recuento rápido y orientativo de esferas en el propio dispositivo (spec §13). */
export function Rapido() {
  const tx = t.rapido;
  const avisar = useAvisos();
  const { recetetas, guardar } = useRecetetas();
  const esferas = recetetas.filter((r): r is RecetetaDe<'esferas'> => r.tipo === 'esferas');

  const [idReceteta, setIdReceteta] = useState('');
  const receteta = esferas.find((r) => r.id === idReceteta);
  const params = parametrosDe(receteta);
  const base = receteta?.parametros ?? DEF;

  const [diametroMin, setDiametroMin] = useState(base.diametroMin);
  const [circMin, setCircMin] = useState(base.circularidadMin);
  const [imagen, setImagen] = useState<Imagen | null>(null);
  const [resultado, setResultado] = useState<ResultadoRapido | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [umppManual, setUmppManual] = useState<number | null>(
    receteta?.imagenes.escala.modo === 'manual' ? receteta.imagenes.escala.micrasPorPixel : null,
  );
  const [calibrando, setCalibrando] = useState(false);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [destino, setDestino] = useState('');
  const [guardarEscala, setGuardarEscala] = useState(false);
  const worker = useRef<Worker | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  // Worker: se crea al usar la pantalla y se cierra al salir
  useEffect(() => {
    const w = new Worker(new URL('../../dominio/rapido/worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (e: MessageEvent<MensajeSalida>) => {
      const m = e.data;
      if (m.tipo === 'imagen') {
        setImagen((prev) => ({
          gris: m.gris,
          ancho: m.ancho,
          alto: m.alto,
          factor: m.factor,
          foto: prev?.foto ?? null,
          micrasArchivo: m.micrasPorPixelArchivo,
        }));
      } else if (m.tipo === 'resultado') {
        setResultado(m.resultado);
        setProcesando(false);
      } else {
        setProcesando(false);
        avisar(tx.errorImagen);
      }
    };
    worker.current = w;
    return () => w.terminate();
  }, [avisar, tx.errorImagen]);

  const enviar = (m: MensajeEntrada, transfer: Transferable[] = []) => {
    setProcesando(true);
    worker.current?.postMessage(m, transfer);
  };

  const cambiarReceteta = (id: string) => {
    setIdReceteta(id);
    const r = esferas.find((x) => x.id === id);
    const p = r?.parametros ?? DEF;
    setDiametroMin(p.diametroMin);
    setCircMin(p.circularidadMin);
    if (r?.imagenes.escala.modo === 'manual') setUmppManual(r.imagenes.escala.micrasPorPixel);
    if (imagen) enviar({ tipo: 'reprocesar', params: parametrosDe(r) });
  };

  const alElegir = async (f: File | undefined) => {
    if (!f) return;
    setResultado(null);
    setPuntos([]);
    setCalibrando(false);
    try {
      if (/\.tiff?$/i.test(f.name) || f.type === 'image/tiff') {
        setImagen((prev) => (prev ? { ...prev, foto: null } : null));
        const buffer = await f.arrayBuffer();
        enviar({ tipo: 'tiff', buffer, params }, [buffer]);
        return;
      }
      const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
      const factor = Math.max(1, Math.max(bmp.width, bmp.height) / MAXIMO);
      const ancho = Math.round(bmp.width / factor);
      const alto = Math.round(bmp.height / factor);
      const c = document.createElement('canvas');
      c.width = ancho;
      c.height = alto;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('canvas');
      ctx.drawImage(bmp, 0, 0, ancho, alto);
      bmp.close();
      const foto = await createImageBitmap(c);
      const rgba = ctx.getImageData(0, 0, ancho, alto).data;
      setImagen({ gris: new Float32Array(0), ancho, alto, factor, foto, micrasArchivo: null });
      enviar({ tipo: 'rgba', rgba, ancho, alto, factor, params }, [rgba.buffer]);
    } catch {
      setProcesando(false);
      avisar(tx.errorImagen);
    } finally {
      if (entrada.current) entrada.current.value = '';
    }
  };

  // Escala en píxeles de la imagen original → en píxeles de la imagen procesada
  const umppOriginal = umppManual ?? imagen?.micrasArchivo ?? null;
  const umppProcesada = umppOriginal !== null && imagen ? umppOriginal * imagen.factor : null;

  // Filtrar es barato (cientos de objetos): se recalcula en cada render
  const aceptados =
    resultado && umppProcesada !== null
      ? filtrar(resultado.objetos, {
          micrasPorPixel: umppProcesada,
          diametroMin,
          diametroMax: base.diametroMax,
          circularidadMin: circMin,
          excluirBordes: base.excluirBordes,
        })
      : [];
  const idsAceptados = new Set(aceptados.map((o) => o.id));
  const diametroMedio =
    aceptados.length && umppProcesada
      ? aceptados.reduce((s, o) => s + diametroEquivalente(o, umppProcesada), 0) / aceptados.length
      : null;

  const aplicarCalibracion = () => {
    if (puntos.length !== 2 || !longitud || !imagen) return;
    const d = Math.hypot(puntos[0]!.x - puntos[1]!.x, puntos[0]!.y - puntos[1]!.y);
    if (d <= 0) return;
    const umpp = longitud / d / imagen.factor;
    setUmppManual(Number(umpp.toPrecision(4)));
    setGuardarEscala(true);
    setCalibrando(false);
    setPuntos([]);
    avisar(tx.calibrado(mostrarNumero(Number(umpp.toPrecision(4)))));
  };

  const destinoReceteta = esferas.find((r) => r.id === (destino || idReceteta)) ?? esferas[0];
  const usarAjustes = () => {
    if (!destinoReceteta) return;
    const copia = structuredClone(destinoReceteta);
    copia.parametros.diametroMin = diametroMin;
    copia.parametros.circularidadMin = circMin;
    if (guardarEscala && umppManual !== null) {
      copia.imagenes.escala = { modo: 'manual', micrasPorPixel: umppManual };
    }
    guardar(copia);
    avisar(tx.guardado(copia.nombre));
  };

  return (
    <Pantalla titulo={tx.titulo} eyebrow={t.tipos.esferas.nombre}>
      <Nota tipo="aviso">
        <strong>{tx.aviso}</strong>
      </Nota>

      {/* Solo tiene sentido elegir si hay recetetas de mamosferas: con una única opción no hace nada */}
      {esferas.length > 0 && (
        <Selector
          etiqueta={tx.receteta}
          pista={tx.recetetaPista}
          compacto
          valor={idReceteta}
          opciones={[{ valor: '', etiqueta: tx.porDefecto }, ...esferas.map((r) => ({ valor: r.id, etiqueta: r.nombre }))]}
          onCambio={cambiarReceteta}
        />
      )}

      <div className={estilos.bloque}>
        <div>
          <Boton onClick={() => entrada.current?.click()}>{tx.elegirImagen}</Boton>
        </div>
        <p className="caption texto-suave">{tx.formatos}</p>
        <input
          ref={entrada}
          type="file"
          accept="image/*,.tif,.tiff"
          capture="environment"
          hidden
          aria-label={tx.elegirImagen}
          onChange={(e) => void alElegir(e.target.files?.[0])}
        />
        {procesando && (
          <p role="status" className={estilos.estado}>
            {tx.procesando}
          </p>
        )}
      </div>

      {imagen && imagen.gris.length > 0 && (
        <>
          <section className={estilos.bloque} aria-labelledby="rapido-escala">
            <h2 id="rapido-escala">{tx.escala}</h2>
            {imagen.micrasArchivo !== null && umppManual === null && (
              <p>{tx.escalaArchivo(mostrarNumero(imagen.micrasArchivo))}</p>
            )}
            <CampoNumero
              etiqueta={tx.micrasPorPixel.etiqueta}
              ayuda={tx.micrasPorPixel.ayuda}
              permiteVacio
              valor={umppManual}
              onCambio={setUmppManual}
            />
            {!calibrando ? (
              <div>
                <Boton variante="secundario" onClick={() => setCalibrando(true)}>
                  {tx.calibrar}
                </Boton>
              </div>
            ) : (
              <Nota>
                <p>{tx.calibrarPasos}</p>
                <p role="status">{tx.calibrarPuntos(puntos.length)}</p>
                {puntos.length === 2 && (
                  <CampoNumero
                    etiqueta={tx.calibrarLongitud.etiqueta}
                    ayuda={tx.calibrarLongitud.ayuda}
                    permiteVacio
                    valor={longitud}
                    onCambio={setLongitud}
                  />
                )}
                <div className="fila">
                  <Boton disabled={puntos.length !== 2 || !longitud} onClick={aplicarCalibracion}>
                    {tx.aplicarCalibracion}
                  </Boton>
                  <Boton
                    variante="secundario"
                    onClick={() => {
                      setCalibrando(false);
                      setPuntos([]);
                    }}
                  >
                    {tx.cancelarCalibracion}
                  </Boton>
                </div>
              </Nota>
            )}
          </section>

          <Lienzo
            gris={imagen.gris}
            ancho={imagen.ancho}
            alto={imagen.alto}
            foto={imagen.foto}
            objetos={resultado?.objetos ?? []}
            aceptados={idsAceptados}
            calibrando={calibrando}
            puntos={puntos}
            onPunto={(p) => setPuntos((ps) => (ps.length >= 2 ? [p] : [...ps, p]))}
          />
        </>
      )}

      {resultado && (
        <section className={estilos.bloque} aria-labelledby="rapido-resultado" aria-live="polite">
          <h2 id="rapido-resultado">{tx.resultadoTitulo}</h2>
          {umppProcesada === null ? (
            <Nota tipo="aviso">{tx.sinEscala}</Nota>
          ) : (
            <div className={estilos.resultado}>
              <p className={estilos.cifra} data-testid="recuento">
                {tx.esferas(aceptados.length)}
              </p>
              {diametroMedio !== null && <p>{tx.diametroMedio(mostrarNumero(diametroMedio, 1))}</p>}
              <p className="caption">{tx.tiempo(resultado.milisegundos)}</p>
            </div>
          )}
          {receteta?.parametros.separarTocandose && <Nota>{tx.sinWatershed}</Nota>}
          {resultado.umbralUsado !== params.metodoUmbral && (
            <Nota>{tx.umbralSustituido(params.metodoUmbral)}</Nota>
          )}
          {params.metodo === 'umbral' && params.restarFondo.activo && <Nota>{tx.fondoAprox}</Nota>}

          <fieldset className={estilos.deslizadores}>
            <legend className={estilos.leyenda}>{tx.deslizadores}</legend>
            <label className={estilos.deslizador}>
              <span>{tx.diametroMin(mostrarNumero(diametroMin))}</span>
              <input
                type="range"
                min={10}
                max={500}
                step={1}
                value={diametroMin}
                onChange={(e) => setDiametroMin(Number(e.target.value))}
              />
            </label>
            <label className={estilos.deslizador}>
              <span>{tx.circularidadMin(mostrarNumero(circMin, 2))}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={circMin}
                onChange={(e) => setCircMin(Number(e.target.value))}
              />
            </label>
          </fieldset>

          <section className={estilos.bloque} aria-labelledby="rapido-usar">
            <h2 id="rapido-usar">{tx.usarEnReceteta}</h2>
            {!destinoReceteta ? (
              <p className="texto-suave">{tx.sinRecetetas}</p>
            ) : (
              <>
                <Selector
                  etiqueta={tx.destino}
                  compacto
                  valor={destinoReceteta.id}
                  opciones={esferas.map((r) => ({ valor: r.id, etiqueta: r.nombre }))}
                  onCambio={setDestino}
                />
                {umppManual !== null && (
                  <label className={estilos.casilla}>
                    <input
                      type="checkbox"
                      checked={guardarEscala}
                      onChange={(e) => setGuardarEscala(e.target.checked)}
                    />
                    {tx.guardarEscala}
                  </label>
                )}
                <div>
                  <Boton onClick={usarAjustes}>{tx.usarEnReceteta}</Boton>
                </div>
              </>
            )}
          </section>
        </section>
      )}
    </Pantalla>
  );
}
