import { Plegable } from '../Plegable/Plegable';
import { Nota } from '../Nota/Nota';
import { t } from '../../textos/es';
import estilos from './GuiaFiji.module.css';

/**
 * Guía de la sección 11: pasos plegables con un hueco para captura de Fiji en cada uno
 * (imágenes en /public/capturas/, las aporta la diseñadora) y tabla de errores comunes.
 */
export function GuiaFiji({ nivelTitulo = 2 }: { nivelTitulo?: 2 | 3 }) {
  const g = t.guia;
  const Titulo = `h${nivelTitulo}` as const;
  return (
    <div className={estilos.guia}>
      <p>{g.intro}</p>
      {g.pasos.map((p, i) => {
        const Lista = p.lista;
        return (
          <Plegable key={p.id} id={`guia-${p.id}`} titulo={p.titulo} abierto={i === 3}>
            <Lista className={estilos.lista}>
              {p.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </Lista>
            {'nota' in p && p.nota && <Nota>{p.nota}</Nota>}
            <figure className={estilos.captura} data-captura={`capturas/${p.captura.archivo}`}>
              <div className={estilos.hueco} role="img" aria-label={p.captura.alt}>
                <span>{g.hueco}</span>
                <code>{`capturas/${p.captura.archivo}`}</code>
              </div>
              <figcaption className="caption texto-suave">{p.captura.alt}</figcaption>
            </figure>
          </Plegable>
        );
      })}

      <section className={estilos.errores} aria-labelledby="guia-errores">
        <Titulo id="guia-errores">{g.errores.titulo}</Titulo>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              {g.errores.columnas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {g.errores.filas.map((f) => (
              <tr key={f[0]}>
                {f.map((celda, i) => (
                  <td key={i} data-columna={g.errores.columnas[i]}>
                    {celda}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Nota>{g.alternativaGels}</Nota>
    </div>
  );
}
