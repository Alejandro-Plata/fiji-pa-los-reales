import { useMemo, useRef, useState } from 'react';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton } from '../../componentes/Boton/Boton';
import { Nota } from '../../componentes/Nota/Nota';
import { CampoNumero } from '../../componentes/Campo/Controles';
import { Selector } from '../../componentes/Selector/Selector';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import { mostrarNumero } from '../../dominio/recetetas/numeros';
import type { RecetetaDe } from '../../dominio/recetetas/tipos';
import {
  columnasDeMarcador,
  leerCsv,
  percentil,
  redondear,
  valoresColumna,
} from '../../dominio/umbral';
import { t } from '../../textos/es';
import estilos from './Umbral.module.css';

/** Propone un umbral de positividad a partir del objetos.csv de un control negativo (spec §9). */
export function Umbral() {
  const tx = t.umbral;
  const avisar = useAvisos();
  const { recetetas, guardar } = useRecetetas();
  const entrada = useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = useState<{ nombre: string; csv: ReturnType<typeof leerCsv> } | null>(null);
  const [columna, setColumna] = useState('');
  const [p, setP] = useState<number | null>(99);
  const [idReceteta, setIdReceteta] = useState('');
  const [indiceMarcador, setIndiceMarcador] = useState(0);

  const columnas = archivo ? columnasDeMarcador(archivo.csv.columnas) : [];
  const valores = useMemo(
    () => (archivo && columna ? valoresColumna(archivo.csv, columna) : []),
    [archivo, columna],
  );
  const pValido = p !== null && p >= 0 && p <= 100;
  const propuesto = valores.length && pValido ? redondear(percentil(valores, p)) : null;

  const candidatas = recetetas.filter(
    (r): r is RecetetaDe<'fluorescencia'> => r.tipo === 'fluorescencia' && r.parametros.marcadores.length > 0,
  );
  const elegida = candidatas.find((r) => r.id === idReceteta) ?? candidatas[0];

  const alElegir = async (f: File | undefined) => {
    if (!f) return;
    try {
      const csv = leerCsv(await f.text());
      setArchivo({ nombre: f.name, csv });
      const cols = columnasDeMarcador(csv.columnas);
      setColumna(cols[0] ?? '');
    } catch {
      avisar(tx.errorLeer);
    } finally {
      if (entrada.current) entrada.current.value = '';
    }
  };

  const aplicar = () => {
    if (!elegida || propuesto === null) return;
    const copia = structuredClone(elegida);
    const m = copia.parametros.marcadores[indiceMarcador];
    if (!m) return;
    m.umbralPositivo = propuesto;
    guardar(copia);
    avisar(tx.guardado(m.nombre, copia.nombre));
  };

  return (
    <Pantalla titulo={tx.titulo} eyebrow={t.tipos.fluorescencia.nombre}>
      <p>{tx.intro}</p>
      <Nota tipo="aviso">{t.campos.fluorescencia.marcadores.avisoUmbral}</Nota>
      <div className="fila">
        <Boton onClick={() => entrada.current?.click()}>{tx.elegir}</Boton>
        <input
          ref={entrada}
          type="file"
          accept=".csv,text/csv"
          hidden
          aria-label={tx.elegir}
          onChange={(e) => void alElegir(e.target.files?.[0])}
        />
      </div>

      {archivo && (
        <section className={estilos.bloque} aria-live="polite">
          <p className="caption texto-suave">{tx.archivo(archivo.nombre, archivo.csv.filas.length)}</p>
          {columnas.length === 0 ? (
            <Nota tipo="error">{tx.sinColumnas}</Nota>
          ) : (
            <>
              <Selector
                etiqueta={tx.columna}
                compacto
                valor={columna}
                opciones={columnas.map((c) => ({ valor: c, etiqueta: c }))}
                onCambio={setColumna}
              />
              <CampoNumero
                etiqueta={tx.percentil.etiqueta}
                ayuda={tx.percentil.ayuda}
                recomendado="99"
                valor={p}
                onCambio={setP}
                error={pValido ? null : t.campo.noEsNumero}
              />
              {propuesto !== null && (
                <div className={estilos.resultado}>
                  <p className="eyebrow">{tx.resultado}</p>
                  <p className={estilos.cifra} data-testid="umbral-propuesto">
                    {mostrarNumero(propuesto)}
                  </p>
                  <p className="caption">
                    {tx.estadisticas(
                      valores.length,
                      mostrarNumero(redondear(Math.min(...valores))),
                      mostrarNumero(redondear(percentil(valores, 50))),
                      mostrarNumero(redondear(Math.max(...valores))),
                    )}
                  </p>
                </div>
              )}
              {valores.length > 0 && valores.length < 100 && <Nota tipo="aviso">{tx.pocos}</Nota>}
            </>
          )}
        </section>
      )}

      {propuesto !== null && (
        <section className={estilos.bloque} aria-labelledby="umbral-aplicar">
          <h2 id="umbral-aplicar">{tx.aplicar}</h2>
          {!elegida ? (
            <p className="texto-suave">{tx.sinRecetetas}</p>
          ) : (
            <>
              <Selector
                etiqueta={tx.receteta}
                valor={elegida.id}
                opciones={candidatas.map((r) => ({ valor: r.id, etiqueta: r.nombre }))}
                onCambio={(v) => {
                  setIdReceteta(v);
                  setIndiceMarcador(0);
                }}
              />
              <Selector
                etiqueta={tx.marcador}
                compacto
                valor={String(indiceMarcador)}
                opciones={elegida.parametros.marcadores.map((m, i) => ({
                  valor: String(i),
                  etiqueta: m.nombre,
                }))}
                onCambio={(v) => setIndiceMarcador(Number(v))}
              />
              <div>
                <Boton onClick={aplicar}>{tx.guardar}</Boton>
              </div>
            </>
          )}
        </section>
      )}
    </Pantalla>
  );
}
