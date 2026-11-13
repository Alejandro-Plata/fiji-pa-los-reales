import { useMemo } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Nota } from '../../componentes/Nota/Nota';
import { BotonEnlace } from '../../componentes/Boton/Boton';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { leerBorrador } from '../../dominio/recetetas/almacenamiento';
import { crearReceteta, desdeCompartida } from '../../dominio/recetetas/crear';
import { plantillaPorClave } from '../../dominio/recetetas/plantillas';
import { esTipoAnalisis, TIPOS, type Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import { Editor, type InicioEditor } from './Editor';
import estilos from './Asistente.module.css';

/**
 * Asistente (spec §5):
 *   /receteta/nueva                 → paso 0: elegir tipo
 *   /receteta/nueva?plantilla=clave → copia de una plantilla
 *   /receteta/nueva/:tipo           → receteta nueva (recupera el borrador si lo hay)
 *   /receteta/:id                   → editar una receteta guardada
 */
export function Asistente() {
  const { id, tipo } = useParams();
  const [busqueda] = useSearchParams();
  const { key } = useLocation();
  const { obtener } = useRecetetas();
  const clavePlantilla = busqueda.get('plantilla');

  const inicial = useMemo((): InicioEditor | 'elegir' | 'no-encontrada' => {
    const borrador = leerBorrador();

    if (id) {
      const guardada = obtener(id);
      if (!guardada) return 'no-encontrada';
      if (borrador && borrador.editando === id) {
        return { ...borrador, base: guardada, recuperado: true };
      }
      return { receteta: guardada, base: guardada, editando: id, paso: 0, visitados: [0], recuperado: false };
    }

    if (clavePlantilla) {
      const p = plantillaPorClave(clavePlantilla);
      if (p) {
        const r = desdeCompartida(p.receteta, 'plantilla');
        return { receteta: r, base: r, editando: null, paso: 0, visitados: [0], recuperado: false };
      }
    }

    if (esTipoAnalisis(tipo)) {
      const base = crearReceteta(tipo);
      if (borrador && borrador.editando === null && borrador.receteta.tipo === tipo) {
        return { ...borrador, base, recuperado: true };
      }
      return { receteta: base, base, editando: null, paso: 0, visitados: [0], recuperado: false };
    }

    return 'elegir';
    // `key` cambia en cada navegación: se recalcula al volver a entrar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tipo, clavePlantilla, key]);

  if (inicial === 'no-encontrada') {
    return (
      <Pantalla titulo={t.asistente.tituloEditar}>
        <Nota tipo="error">{t.asistente.noEncontrada}</Nota>
        <div>
          <BotonEnlace to="/">{t.pantallas.noEncontrada.volver}</BotonEnlace>
        </div>
      </Pantalla>
    );
  }

  if (inicial === 'elegir') return <ElegirTipo />;

  return <Editor key={`${id}|${tipo}|${clavePlantilla}`} inicial={inicial} />;
}

function ElegirTipo() {
  const tx = t.asistente;
  const borrador = leerBorrador();
  const pendiente: Receteta | null = borrador && borrador.editando === null ? borrador.receteta : null;

  return (
    <Pantalla titulo={tx.tituloNueva}>
      <div className={estilos.bloque}>
        <h2>{tx.elegirTipo}</h2>
        <p className="texto-suave">{tx.elegirTipoTexto}</p>
      </div>
      {pendiente && (
        <Nota tipo="aviso">
          <p>{tx.borradorRecuperado}</p>
          <div>
            <BotonEnlace to={`/receteta/nueva/${pendiente.tipo}`} variante="secundario">
              {`${t.tipos[pendiente.tipo].nombre}${pendiente.nombre ? ` · ${pendiente.nombre}` : ''}`}
            </BotonEnlace>
          </div>
        </Nota>
      )}
      <ul className={estilos.tipos}>
        {TIPOS.map((tipo) => (
          <li key={tipo}>
            <Link to={`/receteta/nueva/${tipo}`} className={estilos.tarjetaTipo}>
              <span className={estilos.tarjetaTipoNombre}>{t.tipos[tipo].nombre}</span>
              <span className={estilos.tarjetaTipoFrase}>{t.tipos[tipo].frase}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Pantalla>
  );
}
