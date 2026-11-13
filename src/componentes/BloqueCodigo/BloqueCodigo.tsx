import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import { t } from '../../textos/es';
import estilos from './BloqueCodigo.module.css';

export interface BloqueCodigoRef {
  /** Selecciona todo el código (alternativa cuando el portapapeles falla). */
  seleccionarTodo: () => void;
}

interface Props {
  codigo: string;
  etiqueta: string;
  /** Altura máxima con scroll vertical propio (vista previa lateral). */
  compacto?: boolean;
}

/**
 * Código con fuente monoespaciada y números de línea (no seleccionables).
 * Scroll horizontal dentro de su propio contenedor; opción «Ajustar líneas» (spec §4.1).
 */
export const BloqueCodigo = forwardRef<BloqueCodigoRef, Props>(function BloqueCodigo(
  { codigo, etiqueta, compacto },
  ref,
) {
  const [ajustar, setAjustar] = useState(false);
  const codigoRef = useRef<HTMLElement>(null);
  const id = useId();
  const lineas = codigo.replace(/\n$/, '').split('\n');

  useImperativeHandle(ref, () => ({
    seleccionarTodo: () => {
      const el = codigoRef.current;
      if (!el) return;
      const rango = document.createRange();
      rango.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(rango);
      el.closest('pre')?.focus();
    },
  }));

  return (
    <figure className={estilos.figura} aria-labelledby={`${id}-titulo`}>
      <figcaption className={estilos.barra}>
        <span id={`${id}-titulo`} className={estilos.titulo}>
          {etiqueta} · {t.resultado.lineas(lineas.length)}
        </span>
        <label className={estilos.ajustar}>
          <input type="checkbox" checked={ajustar} onChange={(e) => setAjustar(e.target.checked)} />
          {t.resultado.ajustarLineas}
        </label>
      </figcaption>
      <pre
        className={estilos.pre}
        data-ajustar={ajustar}
        data-compacto={compacto}
        tabIndex={0}
        aria-labelledby={`${id}-titulo`}
      >
        <code ref={codigoRef} className={estilos.codigo}>
          {lineas.map((l, i) => (
            <span key={i} className={estilos.linea}>
              {l}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
});
