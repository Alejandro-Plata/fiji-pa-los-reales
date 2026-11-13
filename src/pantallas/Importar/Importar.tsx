import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton } from '../../componentes/Boton/Boton';
import { Nota } from '../../componentes/Nota/Nota';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import { decodificarReceteta, EnlaceNoValido } from '../../dominio/recetetas/compartir';
import { desdeCompartida, nombreUnico } from '../../dominio/recetetas/crear';
import { resumirReceteta } from '../../dominio/recetetas/resumen';
import type { Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import estilos from './Importar.module.css';

type Estado =
  | { fase: 'leyendo' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'lista'; receteta: Receteta };

/** Abre un enlace de receteta: valida, resume y pregunta antes de guardar (spec §6). */
export function Importar() {
  const tx = t.importar;
  const [busqueda] = useSearchParams();
  const navegar = useNavigate();
  const avisar = useAvisos();
  const { recetetas, importar } = useRecetetas();
  const datos = busqueda.get('r');
  const [estado, setEstado] = useState<Estado>(
    datos ? { fase: 'leyendo' } : { fase: 'error', mensaje: tx.sinDatos },
  );

  useEffect(() => {
    if (!datos) return;
    let vigente = true;
    decodificarReceteta(datos)
      .then((c) => vigente && setEstado({ fase: 'lista', receteta: desdeCompartida(c, 'enlace') }))
      .catch(
        (e: unknown) =>
          vigente &&
          setEstado({
            fase: 'error',
            mensaje: e instanceof EnlaceNoValido ? e.message : tx.sinDatos,
          }),
      );
    return () => {
      vigente = false;
    };
  }, [datos, tx.sinDatos]);

  if (estado.fase !== 'lista') {
    return (
      <Pantalla titulo={tx.titulo}>
        {estado.fase === 'leyendo' ? (
          <p role="status">{tx.leyendo}</p>
        ) : (
          <Nota tipo="error">{estado.mensaje}</Nota>
        )}
      </Pantalla>
    );
  }

  const r = estado.receteta;
  const nombreFinal = nombreUnico(
    r.nombre,
    recetetas.map((x) => x.nombre),
  );

  const guardar = () => {
    const [guardada] = importar([r]);
    avisar(tx.guardada);
    navegar(guardada ? `/receteta/${guardada.id}/macro` : '/', { replace: true });
  };

  return (
    <Pantalla titulo={tx.titulo} eyebrow={t.tipos[r.tipo].nombre}>
      <article className={estilos.tarjeta}>
        <h2>{r.nombre}</h2>
        {r.descripcion && <p className="texto-suave">{r.descripcion}</p>}
        <ul className={estilos.resumen}>
          {resumirReceteta(r).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </article>
      {nombreFinal !== r.nombre && <Nota tipo="aviso">{tx.nombreExiste(nombreFinal)}</Nota>}
      <h2 className={estilos.pregunta}>{tx.pregunta}</h2>
      <div className="fila">
        <Boton onClick={guardar}>{tx.guardar}</Boton>
        <Boton variante="secundario" onClick={() => navegar('/', { replace: true })}>
          {tx.descartar}
        </Boton>
      </div>
    </Pantalla>
  );
}
