import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton, BotonEnlace } from '../../componentes/Boton/Boton';
import { t } from '../../textos/es';
import { FIGURAS } from './Figuras';
import estilos from './Tutorial.module.css';

const tx = t.tutorial;
const DIAPOSITIVAS = tx.diapositivas;
const TOTAL = DIAPOSITIVAS.length;
const UMBRAL_DESLIZ = 50;

/** Tutorial en diapositivas con ilustraciones animadas. La diapositiva actual va en ?paso=n. */
export function Tutorial() {
  const [params, setParams] = useSearchParams();
  const leido = Number(params.get('paso'));
  const indice = Number.isInteger(leido) && leido >= 1 && leido <= TOTAL ? leido - 1 : 0;
  const d = DIAPOSITIVAS[indice] ?? DIAPOSITIVAS[0];
  const Figura = FIGURAS[d.id];
  const inicioToque = useRef<number | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // El foco pasa al título nuevo cuando ya está montado (el cambio de ?paso es asíncrono)
  const enfocarTitulo = useRef(false);
  useEffect(() => {
    if (!enfocarTitulo.current) return;
    enfocarTitulo.current = false;
    titulo.current?.focus();
  }, [indice]);

  const parametros = (n: number) => {
    const i = Math.min(TOTAL - 1, Math.max(0, n));
    return new URLSearchParams(i === 0 ? {} : { paso: String(i + 1) });
  };
  const ir = (i: number, enfocar = false) => {
    enfocarTitulo.current = enfocar;
    setParams(parametros(i), { replace: true });
  };
  // La diapositiva pedida más reciente, aunque la URL aún no se haya actualizado: así dos
  // pulsaciones seguidas de flecha avanzan dos (setSearchParams no encola actualizaciones).
  const pedida = useRef(indice);
  useEffect(() => {
    pedida.current = indice;
  }, [indice]);
  const mover = (delta: number) => {
    const n = Math.min(TOTAL - 1, Math.max(0, pedida.current + delta));
    pedida.current = n;
    ir(n, true);
  };

  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') mover(1);
    else if (e.key === 'ArrowLeft') mover(-1);
  };

  const alSoltar = (e: PointerEvent) => {
    if (inicioToque.current === null) return;
    const dx = e.clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(dx) > UMBRAL_DESLIZ) ir(indice + (dx < 0 ? 1 : -1));
  };

  const ultima = indice === TOTAL - 1;

  return (
    <Pantalla titulo={tx.titulo} eyebrow={tx.eyebrow}>
      <section
        className={estilos.carrusel}
        aria-roledescription="carrusel"
        aria-label={tx.titulo}
        onKeyDown={alTeclado}
      >
        <div
          className={estilos.diapositiva}
          aria-roledescription="diapositiva"
          aria-label={tx.diapositiva(indice + 1, TOTAL)}
          onPointerDown={(e) => (inicioToque.current = e.clientX)}
          onPointerUp={alSoltar}
          onPointerCancel={() => (inicioToque.current = null)}
        >
          {/* key: al cambiar de diapositiva se vuelve a montar y las animaciones empiezan de cero */}
          <div className={estilos.escenario} key={d.id} data-testid="figura-tutorial">
            <Figura />
          </div>

          {/* El h2 no se vuelve a montar: así conserva el foco al cambiar de diapositiva */}
          <div className={estilos.texto}>
            <p className={`eyebrow ${estilos.contador}`}>{tx.diapositiva(indice + 1, TOTAL)}</p>
            <h2 ref={titulo} tabIndex={-1} className={estilos.titulo} aria-live="polite">
              {d.titulo}
            </h2>
            <div className={estilos.cuerpo} key={`${d.id}-texto`}>
              <p className={estilos.parrafo}>{d.texto}</p>
              <ul className={estilos.puntos}>
                {d.puntos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={estilos.controles}>
          <Boton variante="secundario" onClick={() => ir(indice - 1, true)} disabled={indice === 0}>
            {tx.anterior}
          </Boton>

          <ol className={estilos.indice} aria-label={tx.indice}>
            {DIAPOSITIVAS.map((x, i) => (
              <li key={x.id}>
                <button
                  type="button"
                  className={estilos.punto}
                  aria-current={i === indice ? 'step' : undefined}
                  aria-label={tx.irA(i + 1, x.titulo)}
                  onClick={() => ir(i, true)}
                >
                  <span aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>

          {ultima ? (
            <BotonEnlace to="/receteta/nueva">{tx.empezar}</BotonEnlace>
          ) : (
            <Boton onClick={() => ir(indice + 1, true)}>{tx.siguiente}</Boton>
          )}
        </div>

        {ultima && (
          <p className={estilos.volver}>
            <BotonEnlace to="/" variante="secundario">
              {tx.volver}
            </BotonEnlace>
          </p>
        )}
      </section>
    </Pantalla>
  );
}
