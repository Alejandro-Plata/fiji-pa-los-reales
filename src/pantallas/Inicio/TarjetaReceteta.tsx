import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boton, BotonEnlace } from '../../componentes/Boton/Boton';
import type { Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import estilos from './Inicio.module.css';

interface Props {
  receteta: Receteta;
  onFavorita: () => void;
  onDuplicar: () => void;
  onRenombrar: () => void;
  onCompartir: () => void;
  onBorrar: () => void;
}

const fecha = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export function TarjetaReceteta({
  receteta: r,
  onFavorita,
  onDuplicar,
  onRenombrar,
  onCompartir,
  onBorrar,
}: Props) {
  const tx = t.inicio;
  const [acciones, setAcciones] = useState(false);
  const idAcciones = useId();

  return (
    <article className={estilos.tarjeta} data-favorita={r.favorita}>
      <div className={estilos.tarjetaCabecera}>
        <p className={`eyebrow ${estilos.tipo}`}>{t.tipos[r.tipo].nombre}</p>
        <button
          type="button"
          className={estilos.favorita}
          aria-pressed={r.favorita}
          aria-label={tx.marcarFavorita(r.nombre)}
          onClick={onFavorita}
        >
          <span aria-hidden="true">{r.favorita ? '★' : '☆'}</span>
        </button>
      </div>
      <h3 className={estilos.nombre}>
        <Link to={`/receteta/${r.id}`} className={estilos.enlaceNombre}>
          {r.nombre}
        </Link>
      </h3>
      <p className={estilos.fecha}>{tx.modificada(fecha.format(new Date(r.modificada)))}</p>
      {r.favorita && <p className={estilos.chipFavorita}>{tx.favorita}</p>}

      <div className={estilos.tarjetaAcciones}>
        <BotonEnlace to={`/receteta/${r.id}/macro`} variante="primario">
          {tx.verMacro}
        </BotonEnlace>
        <BotonEnlace to={`/receteta/${r.id}`} variante="secundario">
          {tx.abrir}
        </BotonEnlace>
        <Boton
          variante="secundario"
          aria-expanded={acciones}
          aria-controls={idAcciones}
          aria-label={tx.acciones(r.nombre)}
          onClick={() => setAcciones((a) => !a)}
        >
          <span aria-hidden="true">···</span>
        </Boton>
      </div>

      <div id={idAcciones} hidden={!acciones} className={estilos.masAcciones}>
        <Boton variante="secundario" onClick={onDuplicar}>
          {tx.duplicar}
        </Boton>
        <Boton variante="secundario" onClick={onRenombrar}>
          {tx.renombrar}
        </Boton>
        <Boton variante="secundario" onClick={onCompartir}>
          {tx.compartir}
        </Boton>
        <Boton variante="secundario" onClick={onBorrar}>
          {tx.borrar}
        </Boton>
      </div>
    </article>
  );
}
