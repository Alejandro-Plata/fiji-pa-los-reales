import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boton, BotonEnlace } from '../../componentes/Boton/Boton';
import { Dialogo } from '../../componentes/Dialogo/Dialogo';
import { CampoTexto } from '../../componentes/Campo/Controles';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import { useCompartirReceteta } from '../../app/useCompartirReceteta';
import { PLANTILLAS } from '../../dominio/recetetas/plantillas';
import { TIPOS, type Receteta, type TipoAnalisis } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import { TarjetaReceteta } from './TarjetaReceteta';
import estilos from './Inicio.module.css';
import estilosCampo from '../../componentes/Campo/Campo.module.css';

const UMBRAL_BUSQUEDA = 6;

export function Inicio() {
  const tx = t.inicio;
  const navegar = useNavigate();
  const avisar = useAvisos();
  const { recetetas, borrar, restaurar, duplicar, renombrar, alternarFavorita } = useRecetetas();
  const { compartirReceteta, dialogo: dialogoCompartir } = useCompartirReceteta();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<TipoAnalisis | null>(null);
  const [aBorrar, setABorrar] = useState<Receteta | null>(null);
  const [aRenombrar, setARenombrar] = useState<Receteta | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  useEffect(() => {
    document.title = t.app.nombre;
  }, []);

  const conBusqueda = recetetas.length > UMBRAL_BUSQUEDA;
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return [...recetetas]
      .filter((r) => !conBusqueda || !filtro || r.tipo === filtro)
      .filter((r) => !conBusqueda || !q || r.nombre.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(b.favorita) - Number(a.favorita) || b.modificada.localeCompare(a.modificada),
      );
  }, [recetetas, busqueda, filtro, conBusqueda]);

  const confirmarBorrado = () => {
    if (!aBorrar) return;
    const quitada = borrar(aBorrar.id);
    setABorrar(null);
    if (quitada) {
      avisar(tx.borrada(quitada.receteta.nombre), {
        accion: { texto: t.app.deshacer, alPulsar: () => restaurar(quitada.receteta, quitada.indice) },
        duracion: 5000,
      });
    }
  };

  const nombreValido = nuevoNombre.trim().length >= 1 && nuevoNombre.trim().length <= 60;
  const confirmarRenombre = () => {
    if (!aRenombrar || !nombreValido) return;
    renombrar(aRenombrar.id, nuevoNombre);
    setARenombrar(null);
  };

  return (
    <>
      {/* Banda de portada en lienzo oscuro (DESIGN.md: polaridad oscura para portada) */}
      <section className={estilos.banda} aria-labelledby="titulo-inicio">
        <div className={`contenedor ${estilos.bandaContenido}`}>
          <p className={`eyebrow ${estilos.eyebrow}`}>{tx.eyebrow}</p>
          <h1 id="titulo-inicio" className={estilos.titular}>
            {tx.heroAntes} <span className={estilos.chipLima}>{tx.heroClave}</span>{' '}
            {tx.heroDespues}
          </h1>
          <p className={estilos.textoBanda}>{tx.heroTexto}</p>
          <div className="fila">
            <BotonEnlace to="/receteta/nueva" variante="invertido">
              {t.nav.nuevaReceteta}
            </BotonEnlace>
            <BotonEnlace to="/tutorial" variante="fantasma">
              {tx.verTutorial}
            </BotonEnlace>
          </div>
        </div>
      </section>

      <div className={`contenedor ${estilos.cuerpo}`}>
        <section className={estilos.seccion} aria-labelledby="titulo-recetetas">
          <h2 id="titulo-recetetas">{tx.titulo}</h2>

          {conBusqueda && (
            <div className={estilos.herramientas}>
              <label className="visualmente-oculto" htmlFor="buscar">
                {tx.buscar}
              </label>
              <input
                id="buscar"
                type="search"
                className={estilosCampo.entrada}
                placeholder={tx.buscar}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <div className="fila" role="group" aria-label={tx.filtrarTipo}>
                <Boton variante="token" aria-pressed={filtro === null} onClick={() => setFiltro(null)}>
                  {tx.todos}
                </Boton>
                {TIPOS.map((tipo) => (
                  <Boton
                    key={tipo}
                    variante="token"
                    aria-pressed={filtro === tipo}
                    onClick={() => setFiltro(filtro === tipo ? null : tipo)}
                  >
                    {t.tipos[tipo].nombre}
                  </Boton>
                ))}
              </div>
            </div>
          )}

          {recetetas.length === 0 ? (
            <p className={estilos.vacio}>{tx.vacio}</p>
          ) : visibles.length === 0 ? (
            <p className={estilos.vacio}>{tx.sinResultados}</p>
          ) : (
            <ul className={estilos.rejilla}>
              {visibles.map((r) => (
                <li key={r.id}>
                  <TarjetaReceteta
                    receteta={r}
                    onFavorita={() => alternarFavorita(r.id)}
                    onDuplicar={() => {
                      const c = duplicar(r.id);
                      if (c) avisar(tx.duplicada(c.nombre));
                    }}
                    onRenombrar={() => {
                      setNuevoNombre(r.nombre);
                      setARenombrar(r);
                    }}
                    onCompartir={() => void compartirReceteta(r)}
                    onBorrar={() => setABorrar(r)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={estilos.seccion} aria-labelledby="titulo-plantillas">
          <h2 id="titulo-plantillas">{tx.plantillas}</h2>
          <p className="texto-suave">{tx.plantillasTexto}</p>
          <ul className={estilos.rejilla}>
            {PLANTILLAS.map((p) => (
              <li key={p.clave} className={estilos.plantilla}>
                <p className={`eyebrow ${estilos.tipo}`}>{t.tipos[p.receteta.tipo].nombre}</p>
                <h3>{p.receteta.nombre}</h3>
                <p className={estilos.descripcion}>{p.receteta.descripcion}</p>
                <Boton
                  variante="secundario"
                  onClick={() => navegar(`/receteta/nueva?plantilla=${p.clave}`)}
                  aria-label={`${tx.usarPlantilla}: ${p.receteta.nombre}`}
                >
                  {tx.usarPlantilla}
                </Boton>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Dialogo
        abierto={aBorrar !== null}
        titulo={aBorrar ? tx.confirmarBorrar(aBorrar.nombre) : ''}
        texto={tx.confirmarBorrarTexto}
        onCerrar={() => setABorrar(null)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setABorrar(null)}>
              {t.app.cancelar}
            </Boton>
            <Boton onClick={confirmarBorrado}>{tx.borrar}</Boton>
          </>
        }
      />

      <Dialogo
        abierto={aRenombrar !== null}
        titulo={tx.renombrarTitulo}
        onCerrar={() => setARenombrar(null)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setARenombrar(null)}>
              {t.app.cancelar}
            </Boton>
            <Boton onClick={confirmarRenombre} disabled={!nombreValido}>
              {tx.guardarNombre}
            </Boton>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmarRenombre();
          }}
        >
          <CampoTexto
            etiqueta={tx.nuevoNombre}
            valor={nuevoNombre}
            onCambio={setNuevoNombre}
            maximo={60}
            error={nombreValido ? null : t.campos.nombre.nombre.ayuda}
          />
        </form>
      </Dialogo>

      {dialogoCompartir}
    </>
  );
}
