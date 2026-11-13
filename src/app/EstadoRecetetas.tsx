/**
 * Estado global de recetetas: useReducer + contexto (spec §3). Persiste en localStorage.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import {
  cargarRecetetas,
  guardarRecetetas,
  borrarTodo as borrarTodoAlmacen,
} from '../dominio/recetetas/almacenamiento';
import { ahora, duplicar as duplicarReceteta, nombreUnico, nuevoId } from '../dominio/recetetas/crear';
import type { Receteta } from '../dominio/recetetas/tipos';

interface Estado {
  recetetas: Receteta[];
  corruptasNuevas: number;
}

type Accion =
  | { tipo: 'guardar'; receteta: Receteta }
  | { tipo: 'borrar'; id: string }
  | { tipo: 'restaurar'; receteta: Receteta; indice: number }
  | { tipo: 'importar'; recetetas: Receteta[] }
  | { tipo: 'vaciar' }
  | { tipo: 'avisoCorruptasVisto' };

function reductor(estado: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'guardar': {
      const i = estado.recetetas.findIndex((r) => r.id === a.receteta.id);
      const recetetas = [...estado.recetetas];
      if (i >= 0) recetetas[i] = a.receteta;
      else recetetas.unshift(a.receteta);
      return { ...estado, recetetas };
    }
    case 'borrar':
      return { ...estado, recetetas: estado.recetetas.filter((r) => r.id !== a.id) };
    case 'restaurar': {
      const recetetas = [...estado.recetetas];
      recetetas.splice(Math.min(a.indice, recetetas.length), 0, a.receteta);
      return { ...estado, recetetas };
    }
    case 'importar':
      return { ...estado, recetetas: [...a.recetetas, ...estado.recetetas] };
    case 'vaciar':
      return { ...estado, recetetas: [] };
    case 'avisoCorruptasVisto':
      return { ...estado, corruptasNuevas: 0 };
  }
}

interface Api {
  recetetas: Receteta[];
  corruptasNuevas: number;
  obtener: (id: string) => Receteta | undefined;
  guardar: (r: Receteta) => Receteta;
  borrar: (id: string) => { receteta: Receteta; indice: number } | null;
  restaurar: (r: Receteta, indice: number) => void;
  duplicar: (id: string) => Receteta | null;
  renombrar: (id: string, nombre: string) => void;
  alternarFavorita: (id: string) => void;
  /** Importa asignando nombres únicos. Devuelve las recetetas añadidas. */
  importar: (lista: Receteta[]) => Receteta[];
  borrarTodo: () => void;
  avisoCorruptasVisto: () => void;
}

const Contexto = createContext<Api | null>(null);

export function ProveedorRecetetas({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reductor, undefined, () => cargarRecetetas());
  const ref = useRef(estado);
  useLayoutEffect(() => {
    ref.current = estado;
  }, [estado]);

  // Persistencia: cada cambio se guarda
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    guardarRecetetas(estado.recetetas);
  }, [estado.recetetas]);

  const obtener = useCallback((id: string) => ref.current.recetetas.find((r) => r.id === id), []);

  const guardar = useCallback((r: Receteta) => {
    const actualizada = { ...r, modificada: ahora() };
    despachar({ tipo: 'guardar', receteta: actualizada });
    return actualizada;
  }, []);

  const borrar = useCallback((id: string) => {
    const indice = ref.current.recetetas.findIndex((r) => r.id === id);
    const receteta = ref.current.recetetas[indice];
    if (!receteta) return null;
    despachar({ tipo: 'borrar', id });
    return { receteta, indice };
  }, []);

  const restaurar = useCallback(
    (receteta: Receteta, indice: number) => despachar({ tipo: 'restaurar', receteta, indice }),
    [],
  );

  const duplicar = useCallback((id: string) => {
    const r = ref.current.recetetas.find((x) => x.id === id);
    if (!r) return null;
    const copia = duplicarReceteta(
      r,
      ref.current.recetetas.map((x) => x.nombre),
    );
    despachar({ tipo: 'guardar', receteta: copia });
    return copia;
  }, []);

  const renombrar = useCallback((id: string, nombre: string) => {
    const r = ref.current.recetetas.find((x) => x.id === id);
    if (!r) return;
    despachar({ tipo: 'guardar', receteta: { ...r, nombre: nombre.trim(), modificada: ahora() } });
  }, []);

  const alternarFavorita = useCallback((id: string) => {
    const r = ref.current.recetetas.find((x) => x.id === id);
    if (!r) return;
    despachar({ tipo: 'guardar', receteta: { ...r, favorita: !r.favorita } });
  }, []);

  const importar = useCallback((lista: Receteta[]) => {
    const nombres = ref.current.recetetas.map((r) => r.nombre);
    const ids = new Set(ref.current.recetetas.map((r) => r.id));
    const añadidas: Receteta[] = [];
    for (const r of lista) {
      const nombre = nombreUnico(r.nombre, nombres);
      nombres.push(nombre);
      const id = ids.has(r.id) ? nuevoId() : r.id;
      ids.add(id);
      añadidas.push({ ...r, id, nombre });
    }
    despachar({ tipo: 'importar', recetetas: añadidas });
    return añadidas;
  }, []);

  const borrarTodo = useCallback(() => {
    borrarTodoAlmacen();
    despachar({ tipo: 'vaciar' });
  }, []);

  const avisoCorruptasVisto = useCallback(() => despachar({ tipo: 'avisoCorruptasVisto' }), []);

  const api = useMemo<Api>(
    () => ({
      recetetas: estado.recetetas,
      corruptasNuevas: estado.corruptasNuevas,
      obtener,
      guardar,
      borrar,
      restaurar,
      duplicar,
      renombrar,
      alternarFavorita,
      importar,
      borrarTodo,
      avisoCorruptasVisto,
    }),
    [
      estado,
      obtener,
      guardar,
      borrar,
      restaurar,
      duplicar,
      renombrar,
      alternarFavorita,
      importar,
      borrarTodo,
      avisoCorruptasVisto,
    ],
  );

  return <Contexto.Provider value={api}>{children}</Contexto.Provider>;
}

export function useRecetetas(): Api {
  const c = useContext(Contexto);
  if (!c) throw new Error('useRecetetas fuera de ProveedorRecetetas');
  return c;
}
