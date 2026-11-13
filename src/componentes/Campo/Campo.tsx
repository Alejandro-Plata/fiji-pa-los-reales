import { useId, useState, type ReactNode } from 'react';
import { t } from '../../textos/es';
import estilos from './Campo.module.css';

export interface PropsCampoBase {
  etiqueta: string;
  ayuda?: string;
  /** Texto del valor recomendado, p. ej. "50". Para opciones, se marca en la propia opción. */
  recomendado?: string;
  error?: string | null;
  pista?: string;
}

export interface PropsControl {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

interface Props extends PropsCampoBase {
  /** fieldset + legend para grupos de opciones; label para un control único. */
  grupo?: boolean;
  children: (control: PropsControl) => ReactNode;
}

/**
 * Envoltorio de campo: etiqueta, «Recomendado», botón «¿Qué es esto?» (se abre con toque o
 * teclado, nunca con hover), pista y mensaje de error en vivo bajo el campo.
 */
export function Campo({ etiqueta, ayuda, recomendado, error, pista, grupo, children }: Props) {
  const id = useId();
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const idPista = `${id}-pista`;
  const describe =
    [ayudaAbierta && ayuda ? idAyuda : '', pista ? idPista : '', error ? idError : '']
      .filter(Boolean)
      .join(' ') || undefined;

  const cabecera = (
    <span className={estilos.etiquetaTexto}>
      {etiqueta}
      {recomendado !== undefined && (
        <span className={estilos.recomendado}>
          {t.campo.recomendado}: {recomendado}
        </span>
      )}
    </span>
  );

  const botonAyuda = ayuda ? (
    <button
      type="button"
      className={estilos.botonAyuda}
      aria-expanded={ayudaAbierta}
      aria-controls={idAyuda}
      onClick={() => setAyudaAbierta((a) => !a)}
    >
      {ayudaAbierta ? t.campo.ocultarAyuda : t.campo.queEsEsto}
    </button>
  ) : null;

  const cuerpo = (
    <>
      {ayuda && (
        <p id={idAyuda} className={estilos.ayuda} hidden={!ayudaAbierta}>
          {ayuda}
        </p>
      )}
      {children({ id, 'aria-describedby': describe, 'aria-invalid': error ? true : undefined })}
      {pista && (
        <p id={idPista} className={estilos.pista}>
          {pista}
        </p>
      )}
      {error && (
        <p id={idError} className={estilos.error} role="alert">
          {error}
        </p>
      )}
    </>
  );

  if (grupo) {
    return (
      <fieldset className={estilos.campo} data-error={!!error}>
        <div className={estilos.cabecera}>
          <legend className={estilos.etiqueta}>{cabecera}</legend>
          {botonAyuda}
        </div>
        {cuerpo}
      </fieldset>
    );
  }

  return (
    <div className={estilos.campo} data-error={!!error}>
      <div className={estilos.cabecera}>
        <label htmlFor={id} className={estilos.etiqueta}>
          {cabecera}
        </label>
        {botonAyuda}
      </div>
      {cuerpo}
    </div>
  );
}
