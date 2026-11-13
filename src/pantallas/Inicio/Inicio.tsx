import { useEffect } from 'react';
import { BotonEnlace } from '../../componentes/Boton/Boton';
import { t } from '../../textos/es';
import estilos from './Inicio.module.css';

export function Inicio() {
  const tx = t.pantallas.inicio;
  useEffect(() => {
    document.title = t.app.nombre;
  }, []);

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
            <BotonEnlace to="/fiji" variante="fantasma">
              {t.nav.fiji}
            </BotonEnlace>
          </div>
        </div>
      </section>

      <div className={`contenedor ${estilos.cuerpo}`}>
        <h2>{tx.titulo}</h2>
        <p className={estilos.vacio}>{tx.vacio}</p>
      </div>
    </>
  );
}
