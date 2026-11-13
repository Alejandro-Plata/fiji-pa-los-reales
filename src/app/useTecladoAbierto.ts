import { useEffect, useState } from 'react';

/**
 * Detecta si el teclado virtual está abierto: el visualViewport encoge bastante
 * respecto a la ventana y hay un campo de texto con el foco.
 * Se usa para que la barra inferior fija no tape el campo activo (spec §4.7).
 */
export function useTecladoAbierto(): boolean {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const comprobar = () => {
      const activo = document.activeElement;
      const esCampo =
        activo instanceof HTMLInputElement ||
        activo instanceof HTMLTextAreaElement ||
        activo instanceof HTMLSelectElement;
      setAbierto(esCampo && window.innerHeight - vv.height > 150);
    };
    vv.addEventListener('resize', comprobar);
    document.addEventListener('focusin', comprobar);
    document.addEventListener('focusout', comprobar);
    return () => {
      vv.removeEventListener('resize', comprobar);
      document.removeEventListener('focusin', comprobar);
      document.removeEventListener('focusout', comprobar);
    };
  }, []);

  return abierto;
}
