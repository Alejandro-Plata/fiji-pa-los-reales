import { useState } from 'react';
import { leerNumero, mostrarNumero } from '../../dominio/recetetas/numeros';
import { t } from '../../textos/es';
import { Campo, type PropsCampoBase } from './Campo';
import estilos from './Campo.module.css';

// ---------- Número ----------
interface PropsNumero extends PropsCampoBase {
  valor: number | null;
  onCambio: (n: number | null) => void;
  entero?: boolean;
  /** Si es true, el campo vacío vale null. */
  permiteVacio?: boolean;
  placeholder?: string;
}

/**
 * Campo numérico: acepta coma o punto («0,65» → 0.65). Muestra coma decimal.
 * Teclado numérico adecuado en el móvil (spec §4.5).
 */
export function CampoNumero({
  valor,
  onCambio,
  entero,
  permiteVacio,
  placeholder,
  error,
  ...campo
}: PropsNumero) {
  const aTexto = (n: number | null) => (n === null || !Number.isFinite(n) ? '' : mostrarNumero(n));
  const [texto, setTexto] = useState(() => aTexto(valor));
  const [valorPrevio, setValorPrevio] = useState(valor);
  const [noEsNumero, setNoEsNumero] = useState(false);

  // Si el valor cambia desde fuera (p. ej. «Empezar de cero»), se actualiza el texto
  if (!Object.is(valor, valorPrevio)) {
    setValorPrevio(valor);
    if (!Object.is(leerNumero(texto), valor)) {
      setTexto(aTexto(valor));
      setNoEsNumero(false);
    }
  }

  const cambiar = (nuevo: string) => {
    setTexto(nuevo);
    if (nuevo.trim() === '') {
      setNoEsNumero(!permiteVacio);
      if (permiteVacio) {
        setValorPrevio(null);
        onCambio(null);
      }
      return;
    }
    const n = leerNumero(nuevo);
    setNoEsNumero(n === null);
    if (n !== null) {
      setValorPrevio(n);
      onCambio(n);
    }
  };

  return (
    <Campo {...campo} error={noEsNumero ? t.campo.noEsNumero : error}>
      {(c) => (
        <input
          {...c}
          className={`${estilos.entrada} ${estilos.entradaCorta}`}
          type="text"
          inputMode={entero ? 'numeric' : 'decimal'}
          autoComplete="off"
          placeholder={placeholder}
          value={texto}
          onChange={(e) => cambiar(e.target.value)}
        />
      )}
    </Campo>
  );
}

// ---------- Texto ----------
interface PropsTexto extends PropsCampoBase {
  valor: string;
  onCambio: (v: string) => void;
  multilinea?: boolean;
  maximo?: number;
}

export function CampoTexto({ valor, onCambio, multilinea, maximo, ...campo }: PropsTexto) {
  return (
    <Campo {...campo}>
      {(c) =>
        multilinea ? (
          <textarea
            {...c}
            className={`${estilos.entrada} ${estilos.area}`}
            value={valor}
            maxLength={maximo}
            onChange={(e) => onCambio(e.target.value)}
          />
        ) : (
          <input
            {...c}
            className={estilos.entrada}
            type="text"
            value={valor}
            maxLength={maximo}
            onChange={(e) => onCambio(e.target.value)}
          />
        )
      }
    </Campo>
  );
}

// ---------- Lista desplegable ----------
interface PropsLista<T extends string> extends PropsCampoBase {
  valor: T;
  opciones: readonly T[];
  onCambio: (v: T) => void;
  /** Valor recomendado: se marca en la opción. */
  valorRecomendado?: T;
}

export function CampoLista<T extends string>({
  valor,
  opciones,
  onCambio,
  valorRecomendado,
  ...campo
}: PropsLista<T>) {
  return (
    <Campo {...campo} recomendado={valorRecomendado}>
      {(c) => (
        <select
          {...c}
          className={`${estilos.entrada} ${estilos.lista} ${estilos.entradaCorta}`}
          value={valor}
          onChange={(e) => onCambio(e.target.value as T)}
        >
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </Campo>
  );
}
