/**
 * Avisos emergentes (toasts) con acción opcional, p. ej. «Deshacer» durante 5 s (spec §5).
 * Región aria-live para lectores de pantalla.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { t } from '../textos/es';
import estilos from './Avisos.module.css';

interface Aviso {
  id: number;
  texto: string;
  accion?: { texto: string; alPulsar: () => void };
}

type Mostrar = (texto: string, opciones?: { accion?: Aviso['accion']; duracion?: number }) => void;

const Contexto = createContext<Mostrar>(() => {});

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(1);

  const quitar = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const mostrar = useCallback<Mostrar>(
    (texto, opciones) => {
      const id = siguiente.current++;
      setAvisos((a) => [...a.slice(-2), { id, texto, accion: opciones?.accion }]);
      setTimeout(() => quitar(id), opciones?.duracion ?? (opciones?.accion ? 5000 : 4000));
    },
    [quitar],
  );

  return (
    <Contexto.Provider value={mostrar}>
      {children}
      <div className={estilos.region} role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={estilos.aviso}>
            <span className={estilos.texto}>{a.texto}</span>
            {a.accion && (
              <button
                type="button"
                className={estilos.accion}
                onClick={() => {
                  a.accion?.alPulsar();
                  quitar(a.id);
                }}
              >
                {a.accion.texto}
              </button>
            )}
            <button
              type="button"
              className={estilos.cerrar}
              aria-label={t.app.cerrar}
              onClick={() => quitar(a.id)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useAvisos(): Mostrar {
  return useContext(Contexto);
}
