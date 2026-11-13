import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton } from '../../componentes/Boton/Boton';
import { BarraInferior } from '../../componentes/BarraInferior/BarraInferior';
import { Dialogo } from '../../componentes/Dialogo/Dialogo';
import { Nota } from '../../componentes/Nota/Nota';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import {
  borrarBorrador,
  guardarBorrador,
  type Borrador,
} from '../../dominio/recetetas/almacenamiento';
import { esquemaReceteta } from '../../dominio/recetetas/esquemas';
import { resumirReceteta } from '../../dominio/recetetas/resumen';
import type { Receteta, RecetetaDe } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import { BloqueCodigo } from '../../componentes/BloqueCodigo/BloqueCodigo';
import { contextoActual, generarMacro, TipoSinMacro } from '../../dominio/macros';
import { useEsEscritorio } from '../../app/useEsEscritorio';
import { erroresDePaso, PASOS, type Errores } from './pasos';
import { PasoNombre, type PropsPaso } from './PasosComunes';
import { PasoEsferas } from './PasosEsferas';
import { PasoFluorescencia } from './PasosFluorescencia';
import { PasoWestern } from './PasosWestern';
import estilos from './Asistente.module.css';

export interface InicioEditor extends Borrador {
  /** Estado al que vuelve «Empezar de cero». */
  base: Receteta;
  recuperado: boolean;
}

export function validar(r: Receteta): Errores {
  const res = esquemaReceteta.safeParse(r);
  const errores: Errores = {};
  if (!res.success) {
    for (const i of res.error.issues) {
      const k = i.path.join('.');
      errores[k] ??= i.message;
    }
  }
  return errores;
}

interface Props {
  inicial: InicioEditor;
  /** Contenido extra de la columna derecha en escritorio (vista previa del macro, fase 2). */
  vistaPrevia?: (r: Receteta, valida: boolean) => ReactNode;
}

export function Editor({ inicial, vistaPrevia }: Props) {
  const tx = t.asistente;
  const navegar = useNavigate();
  const avisar = useAvisos();
  const { guardar } = useRecetetas();

  const [r, setR] = useState<Receteta>(inicial.receteta);
  const [paso, setPaso] = useState(Math.min(inicial.paso, PASOS[inicial.receteta.tipo].length - 1));
  const [visitados, setVisitados] = useState<number[]>(inicial.visitados);
  const [sucio, setSucio] = useState(inicial.recuperado);
  const [recuperado, setRecuperado] = useState(inicial.recuperado);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const saliendo = useRef(false);
  const cabeceraPaso = useRef<HTMLHeadingElement>(null);

  const pasos = PASOS[r.tipo];
  const pasoActual = pasos[paso]!;
  const ultimo = paso === pasos.length - 1;
  const errores = useMemo(() => validar(r), [r]);
  const valida = Object.keys(errores).length === 0;

  // Vista previa del macro en vivo (solo se ve en escritorio). El nombre puede faltar aún.
  const esEscritorio = useEsEscritorio();
  const macroEnVivo = useMemo((): string | 'pendiente' | null => {
    if (!esEscritorio) return null;
    if (Object.keys(errores).some((k) => k !== 'nombre')) return 'pendiente';
    try {
      return generarMacro(
        { ...r, nombre: r.nombre.trim() || tx.tituloNueva },
        contextoActual(__VERSION_APP__),
      );
    } catch (e) {
      if (e instanceof TipoSinMacro) return null;
      throw e;
    }
  }, [r, errores, esEscritorio, tx.tituloNueva]);

  const editar = useCallback((fn: (x: Receteta) => void) => {
    setR((prev) => {
      const copia = structuredClone(prev);
      fn(copia);
      return copia;
    });
    setSucio(true);
  }, []);

  // Guardado automático del borrador en cada cambio (spec §5)
  useEffect(() => {
    if (!sucio) return;
    guardarBorrador({ receteta: r, paso, visitados, editando: inicial.editando });
  }, [r, paso, visitados, sucio, inicial.editando]);

  // Aviso al salir sin guardar: navegación interna…
  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      sucio && !saliendo.current && currentLocation.pathname !== nextLocation.pathname,
  );
  // …y cierre o recarga de la pestaña
  useEffect(() => {
    if (!sucio) return;
    const aviso = (ev: BeforeUnloadEvent) => ev.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [sucio]);

  const irA = (n: number) => {
    setPaso(n);
    setVisitados((v) => (v.includes(n) ? v : [...v, n]));
    setMostrarErrores(false);
    requestAnimationFrame(() => {
      cabeceraPaso.current?.focus();
      window.scrollTo(0, 0);
    });
  };

  const enfocarPrimerError = () =>
    requestAnimationFrame(() => {
      const campo = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      campo?.focus();
      campo?.scrollIntoView({ block: 'center' });
    });

  const siguiente = () => {
    if (erroresDePaso(pasoActual, errores).length > 0) {
      setMostrarErrores(true);
      avisar(tx.hayErrores);
      enfocarPrimerError();
      return;
    }
    irA(paso + 1);
  };

  const guardarReceteta = () => {
    if (!valida) {
      const conError = pasos.findIndex((p) => erroresDePaso(p, errores).length > 0);
      if (conError !== paso) irA(conError);
      setMostrarErrores(true);
      avisar(tx.hayErrores);
      enfocarPrimerError();
      return;
    }
    const guardada = guardar({ ...r, nombre: r.nombre.trim() });
    borrarBorrador();
    saliendo.current = true;
    setSucio(false);
    avisar(tx.guardada);
    navegar(`/receteta/${guardada.id}/macro`);
  };

  const empezarDeCero = () => {
    setR(inicial.base);
    setPaso(0);
    setVisitados([0]);
    setSucio(false);
    setRecuperado(false);
    borrarBorrador();
  };

  const propsPaso: PropsPaso = {
    r,
    editar,
    e: (ruta) => errores[ruta],
  };

  const contenidoPaso = (() => {
    const k = pasoActual.clave;
    if (k === 'nombre') return <PasoNombre {...propsPaso} mostrarErrores={mostrarErrores} />;
    switch (r.tipo) {
      case 'esferas':
        return <PasoEsferas {...(propsPaso as PropsPaso<RecetetaDe<'esferas'>>)} paso={k} />;
      case 'fluorescencia':
        return (
          <PasoFluorescencia {...(propsPaso as PropsPaso<RecetetaDe<'fluorescencia'>>)} paso={k} />
        );
      case 'western':
        return <PasoWestern {...(propsPaso as PropsPaso<RecetetaDe<'western'>>)} paso={k} />;
    }
  })();

  return (
    <Pantalla
      titulo={inicial.editando ? tx.tituloEditar : tx.tituloNueva}
      eyebrow={t.tipos[r.tipo].nombre}
    >
      {recuperado && (
        <Nota tipo="aviso">
          <p>{tx.borradorRecuperado}</p>
          <div>
            <Boton variante="secundario" onClick={empezarDeCero}>
              {tx.empezarDeCero}
            </Boton>
          </div>
        </Nota>
      )}

      <nav aria-label={tx.pasos} className={estilos.pasos}>
        <ol className={estilos.listaPasos}>
          {pasos.map((p, i) => (
            <li key={p.clave}>
              <button
                type="button"
                className={estilos.botonPaso}
                aria-current={i === paso ? 'step' : undefined}
                disabled={!visitados.includes(i)}
                onClick={() => irA(i)}
              >
                <span className="visualmente-oculto">{tx.pasoOculto}</span>
                <span className={estilos.numeroPaso}>{i + 1}</span>
                <span className={estilos.nombrePaso}>{p.nombre}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className={estilos.columnas}>
        <section className={estilos.formulario} aria-labelledby="titulo-paso">
          <div className={estilos.cabeceraPaso}>
            <p className={`eyebrow ${estilos.progreso}`}>{tx.progreso(paso + 1, pasos.length)}</p>
            <h2 id="titulo-paso" ref={cabeceraPaso} tabIndex={-1}>
              {pasoActual.nombre}
            </h2>
          </div>

          {paso === 0 && r.origen === 'plantilla' && <Nota tipo="aviso">{tx.avisoPlantilla}</Nota>}

          <form
            className={estilos.campos}
            noValidate
            onSubmit={(ev) => {
              ev.preventDefault();
              if (ultimo) guardarReceteta();
              else siguiente();
            }}
          >
            {contenidoPaso}
            <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
          </form>

          <BarraInferior>
            <Boton variante="secundario" disabled={paso === 0} onClick={() => irA(paso - 1)}>
              {t.barraInferior.atras}
            </Boton>
            {ultimo ? (
              <Boton onClick={guardarReceteta}>
                {inicial.editando ? tx.guardarCambios : tx.guardar}
              </Boton>
            ) : (
              <Boton onClick={siguiente}>{t.barraInferior.siguiente}</Boton>
            )}
          </BarraInferior>
        </section>

        <aside className={estilos.lateral} aria-label={tx.vistaPrevia}>
          <div className={estilos.lateralFijo}>
            {vistaPrevia ? (
              vistaPrevia(r, valida)
            ) : (
              <>
                <h2 className={estilos.lateralTitulo}>{tx.vistaPrevia}</h2>
                <ul className={estilos.resumen}>
                  {resumirReceteta(r).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {macroEnVivo !== null &&
                  (macroEnVivo === 'pendiente' ? (
                    <p className="texto-suave caption">{t.resultado.vistaPreviaPendiente}</p>
                  ) : (
                    <BloqueCodigo codigo={macroEnVivo} etiqueta={t.resultado.vistaPreviaMacro} compacto />
                  ))}
              </>
            )}
          </div>
        </aside>
      </div>

      <Dialogo
        abierto={bloqueo.state === 'blocked'}
        titulo={tx.salirTitulo}
        texto={tx.salirTexto}
        onCerrar={() => bloqueo.reset?.()}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => bloqueo.proceed?.()}>
              {tx.salir}
            </Boton>
            <Boton onClick={() => bloqueo.reset?.()}>{tx.seguirEditando}</Boton>
          </>
        }
      />
    </Pantalla>
  );
}
