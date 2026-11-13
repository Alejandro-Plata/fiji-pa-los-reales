import { useEffect, useId, useRef, type ReactNode } from 'react';
import estilos from './Dialogo.module.css';

interface Props {
  abierto: boolean;
  titulo: string;
  texto?: string;
  onCerrar: () => void;
  /** Panel ancho (guía de Fiji, texto de Métodos). */
  amplio?: boolean;
  children?: ReactNode;
  /** Botones de acción (el primero recibe el foco si no hay campos). */
  acciones: ReactNode;
}

/** Diálogo modal nativo (<dialog>): atrapa el foco y se cierra con Escape. */
export function Dialogo({ abierto, titulo, texto, onCerrar, amplio, children, acciones }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const abiertoRef = useRef(abierto);
  const id = useId();

  useEffect(() => {
    abiertoRef.current = abierto;
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={estilos.dialogo}
      data-amplio={amplio}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={texto ? `${id}-texto` : undefined}
      // Solo avisa si lo cierra la usuaria (no al cerrarlo nosotros porque `abierto` pasó a false)
      onClose={() => {
        if (abiertoRef.current) onCerrar();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
    >
      <div className={estilos.cuerpo}>
        <h2 id={`${id}-titulo`} className={estilos.titulo}>
          {titulo}
        </h2>
        {texto && <p id={`${id}-texto`}>{texto}</p>}
        {/* El contenido solo existe mientras el diálogo está abierto */}
        {abierto && children}
        <div className={estilos.acciones}>{acciones}</div>
      </div>
    </dialog>
  );
}
