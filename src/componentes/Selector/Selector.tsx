import { useId } from 'react';
import { t } from '../../textos/es';
import { Campo, type PropsCampoBase } from '../Campo/Campo';
import estilos from './Selector.module.css';

export interface Opcion<T> {
  valor: T;
  etiqueta: string;
  texto?: string;
}

interface Props<T> extends Omit<PropsCampoBase, 'recomendado'> {
  valor: T;
  opciones: Opcion<T>[];
  onCambio: (v: T) => void;
  valorRecomendado?: T;
  /** Opciones grandes con descripción (tarjetas) o compactas en fila. */
  compacto?: boolean;
}

/** Grupo de opciones excluyentes con botones de radio nativos (accesibles con teclado). */
export function Selector<T extends string | number | boolean>({
  valor,
  opciones,
  onCambio,
  valorRecomendado,
  compacto,
  ...campo
}: Props<T>) {
  const nombre = useId();
  return (
    <Campo {...campo} grupo>
      {(c) => (
        <div
          className={compacto ? estilos.compacto : estilos.tarjetas}
          aria-describedby={c['aria-describedby']}
        >
          {opciones.map((o) => {
            const marcado = o.valor === valor;
            return (
              <label key={String(o.valor)} className={estilos.opcion} data-marcado={marcado}>
                <input
                  type="radio"
                  className={estilos.radio}
                  name={nombre}
                  checked={marcado}
                  onChange={() => onCambio(o.valor)}
                />
                <span className={estilos.etiqueta}>
                  {o.etiqueta}
                  {valorRecomendado === o.valor && (
                    <span className={estilos.recomendado}>{t.campo.recomendado}</span>
                  )}
                </span>
                {o.texto && <span className={estilos.texto}>{o.texto}</span>}
              </label>
            );
          })}
        </div>
      )}
    </Campo>
  );
}

/** Sí / No, con el recomendado marcado. */
export function SiNo(
  props: Omit<Props<boolean>, 'opciones' | 'compacto'> & { valorRecomendado?: boolean },
) {
  return (
    <Selector
      {...props}
      compacto
      opciones={[
        { valor: true, etiqueta: t.campo.si },
        { valor: false, etiqueta: t.campo.no },
      ]}
    />
  );
}

// ---------- Casillas (selección múltiple) ----------
interface PropsCasillas<T extends string> extends Omit<PropsCampoBase, 'recomendado'> {
  valores: T[];
  opciones: Opcion<T>[];
  onCambio: (v: T[]) => void;
}

export function Casillas<T extends string>({ valores, opciones, onCambio, ...campo }: PropsCasillas<T>) {
  const alternar = (v: T) =>
    onCambio(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v]);
  return (
    <Campo {...campo} grupo>
      {(c) => (
        <div className={estilos.compacto} aria-describedby={c['aria-describedby']}>
          {opciones.map((o) => {
            const marcado = valores.includes(o.valor);
            return (
              <label key={o.valor} className={estilos.opcion} data-marcado={marcado}>
                <input
                  type="checkbox"
                  className={estilos.radio}
                  checked={marcado}
                  onChange={() => alternar(o.valor)}
                />
                <span className={estilos.etiqueta}>{o.etiqueta}</span>
              </label>
            );
          })}
        </div>
      )}
    </Campo>
  );
}
