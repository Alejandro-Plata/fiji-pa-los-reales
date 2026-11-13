import { useRef, useState } from 'react';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton } from '../../componentes/Boton/Boton';
import { Dialogo } from '../../componentes/Dialogo/Dialogo';
import { Plegable } from '../../componentes/Plegable/Plegable';
import { Selector } from '../../componentes/Selector/Selector';
import { Nota } from '../../componentes/Nota/Nota';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import { guardarArchivo } from '../../app/plataforma';
import {
  contarCorruptas,
  exportarJson,
  guardarAjustes,
  importarJson,
  leerAjustes,
  leerCorruptas,
  type Ajustes as TipoAjustes,
} from '../../dominio/recetetas/almacenamiento';
import { t } from '../../textos/es';
import { Actualizaciones } from './Actualizaciones';
import estilos from './Ajustes.module.css';

export function Ajustes() {
  const tx = t.ajustes;
  const avisar = useAvisos();
  const { recetetas, importar, borrarTodo } = useRecetetas();
  const [ajustes, setAjustes] = useState<TipoAjustes>(leerAjustes);
  const [corruptas, setCorruptas] = useState(contarCorruptas);
  const [confirmacion, setConfirmacion] = useState<0 | 1 | 2>(0);
  const entrada = useRef<HTMLInputElement>(null);

  const hoy = new Date().toISOString().slice(0, 10);

  const exportar = async () => {
    if (recetetas.length === 0) return avisar(tx.nadaQueExportar);
    const g = await guardarArchivo(
      `recetetas-${hoy}.json`,
      exportarJson(recetetas, __VERSION_APP__),
      'application/json',
    );
    avisar(g.ok ? tx.exportado(g.donde) : tx.errorImportar);
  };

  const alElegirArchivo = async (f: File | undefined) => {
    if (!f) return;
    try {
      const { validas, rechazadas } = importarJson(await f.text());
      importar(validas.map((r) => ({ ...r, origen: 'importada' as const })));
      avisar(tx.importadas(validas.length, rechazadas), { duracion: 6000 });
    } catch (e) {
      avisar(e instanceof Error ? e.message : tx.errorImportar);
    } finally {
      if (entrada.current) entrada.current.value = '';
    }
  };

  const descargarCorruptas = () =>
    void guardarArchivo(`recetetas-danadas-${hoy}.json`, leerCorruptas(), 'application/json');

  const cambiarIdioma = (idiomaMetodos: 'es' | 'en') => {
    const nuevos = { ...ajustes, idiomaMetodos };
    setAjustes(nuevos);
    guardarAjustes(nuevos);
  };

  const borrarDefinitivo = () => {
    borrarTodo();
    setConfirmacion(0);
    setCorruptas(0);
    setAjustes(leerAjustes());
    avisar(tx.borrado);
  };

  return (
    <Pantalla titulo={tx.titulo}>
      <section className={estilos.seccion} aria-labelledby="aj-copia">
        <h2 id="aj-copia">{tx.copia}</h2>
        <p>{tx.copiaTexto}</p>
        <div className="fila">
          <Boton onClick={() => void exportar()}>{tx.exportar}</Boton>
          <Boton variante="secundario" onClick={() => entrada.current?.click()}>
            {tx.importar}
          </Boton>
          <input
            ref={entrada}
            type="file"
            accept=".json,application/json"
            hidden
            aria-label={tx.importar}
            onChange={(e) => void alElegirArchivo(e.target.files?.[0])}
          />
        </div>
      </section>

      {corruptas > 0 && (
        <section className={estilos.seccion} aria-labelledby="aj-corruptas">
          <h2 id="aj-corruptas">{tx.corruptas}</h2>
          <Nota tipo="aviso">{tx.corruptasTexto(corruptas)}</Nota>
          <div>
            <Boton variante="secundario" onClick={descargarCorruptas}>
              {tx.descargarCorruptas}
            </Boton>
          </div>
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="aj-idioma">
        <h2 id="aj-idioma" className="visualmente-oculto">
          {tx.idioma}
        </h2>
        <Selector
          etiqueta={tx.idioma}
          pista={tx.idiomaTexto}
          compacto
          valor={ajustes.idiomaMetodos}
          opciones={[
            { valor: 'es', etiqueta: tx.espanol },
            { valor: 'en', etiqueta: tx.ingles },
          ]}
          onCambio={cambiarIdioma}
        />
      </section>

      <section className={estilos.seccion} aria-labelledby="aj-borrar">
        <h2 id="aj-borrar">{tx.borrarTodo}</h2>
        <p>{tx.borrarTodoTexto}</p>
        <div>
          <Boton variante="secundario" onClick={() => setConfirmacion(1)}>
            {tx.borrarTodo}
          </Boton>
        </div>
      </section>

      <Actualizaciones />

      <section className={estilos.seccion} aria-labelledby="aj-acerca">
        <h2 id="aj-acerca">{tx.acerca}</h2>
        <p>
          {t.app.nombre} · {t.app.version(__VERSION_APP__)}
        </p>
        <Plegable titulo={tx.instalar} id="instalar">
          <ol className={estilos.lista}>
            {tx.instalarPasos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </Plegable>
      </section>

      <Dialogo
        abierto={confirmacion === 1}
        titulo={tx.borrarConfirmar1}
        texto={tx.borrarConfirmar1Texto}
        onCerrar={() => setConfirmacion(0)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setConfirmacion(0)}>
              {t.app.cancelar}
            </Boton>
            <Boton onClick={() => setConfirmacion(2)}>{tx.borrarSi}</Boton>
          </>
        }
      />
      <Dialogo
        abierto={confirmacion === 2}
        titulo={tx.borrarConfirmar2}
        texto={tx.borrarConfirmar2Texto}
        onCerrar={() => setConfirmacion(0)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setConfirmacion(0)}>
              {t.app.cancelar}
            </Boton>
            <Boton onClick={borrarDefinitivo}>{tx.borrarDefinitivo}</Boton>
          </>
        }
      />
    </Pantalla>
  );
}
