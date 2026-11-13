import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton, BotonEnlace } from '../../componentes/Boton/Boton';
import { Nota } from '../../componentes/Nota/Nota';
import { Dialogo } from '../../componentes/Dialogo/Dialogo';
import { GuiaFiji } from '../../componentes/GuiaFiji/GuiaFiji';
import { BloqueCodigo, type BloqueCodigoRef } from '../../componentes/BloqueCodigo/BloqueCodigo';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useAvisos } from '../../app/Avisos';
import { nombreArchivo, useCompartirReceteta } from '../../app/useCompartirReceteta';
import { compartir, copiarTexto, guardarArchivo } from '../../app/plataforma';
import { contextoActual, generarMacro, TipoSinMacro } from '../../dominio/macros';
import { esquemaReceteta } from '../../dominio/recetetas/esquemas';
import { resumirReceteta } from '../../dominio/recetetas/resumen';
import type { Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import { PanelMetodos } from './PanelMetodos';
import estilos from './Resultado.module.css';

type EstadoMacro = { macro: string } | { error: 'no-disponible' | 'invalida' };

export function macroDe(r: Receteta): EstadoMacro {
  if (!esquemaReceteta.safeParse(r).success) return { error: 'invalida' };
  try {
    return { macro: generarMacro(r, contextoActual(__VERSION_APP__, new Date(r.modificada))) };
  } catch (e) {
    if (e instanceof TipoSinMacro) return { error: 'no-disponible' };
    throw e;
  }
}

export function Resultado() {
  const tx = t.resultado;
  const { id = '' } = useParams();
  const { obtener } = useRecetetas();
  const avisar = useAvisos();
  const { compartirReceteta, dialogo } = useCompartirReceteta();
  const bloque = useRef<BloqueCodigoRef>(null);
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [metodosAbierto, setMetodosAbierto] = useState(false);
  const r = obtener(id);
  const estado = useMemo(() => (r ? macroDe(r) : null), [r]);

  if (!r || !estado) {
    return (
      <Pantalla titulo={tx.titulo}>
        <Nota tipo="error">{t.asistente.noEncontrada}</Nota>
        <div>
          <BotonEnlace to="/">{t.pantallas.noEncontrada.volver}</BotonEnlace>
        </div>
      </Pantalla>
    );
  }

  const macro = 'macro' in estado ? estado.macro : null;
  const archivo = nombreArchivo(r.nombre, '.ijm');

  const copiar = async () => {
    if (!macro) return;
    if (await copiarTexto(macro)) avisar(tx.copiado);
    else {
      bloque.current?.seleccionarTodo();
      avisar(tx.pulsaCtrlC, { duracion: 10000 });
    }
  };

  const descargar = async () => {
    if (!macro) return;
    const g = await guardarArchivo(archivo, macro, 'text/plain');
    avisar(g.ok ? tx.descargado(g.donde) : tx.errorDescarga);
  };

  // Web Share con el .ijm; si no hay hoja de compartir, enlace de receteta (copiado)
  const enviar = async () => {
    if (!macro) return;
    const res = await compartir({
      titulo: t.compartir.titulo(r.nombre),
      archivo: { nombre: archivo, contenido: macro, tipo: 'text/plain' },
    });
    if (res === 'no-disponible') await compartirReceteta(r);
  };

  const conSeries = r.imagenes.extensiones.some((e) => e === '*' || e === '.lif' || e === '.czi');

  return (
    <Pantalla titulo={r.nombre} eyebrow={`${t.tipos[r.tipo].nombre} · ${tx.titulo}`}>
      <section aria-labelledby="titulo-resumen" className={estilos.resumen}>
        <h2 id="titulo-resumen" className={estilos.subtitulo}>
          {t.resumen.titulo}
        </h2>
        <ul className={estilos.frases}>
          {resumirReceteta(r).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {r.tipo !== 'western' && conSeries && <Nota tipo="aviso">{tx.avisoSeries}</Nota>}
      </section>

      {macro ? (
        <>
          <div className={estilos.acciones}>
            <Boton onClick={() => void copiar()}>{tx.copiar}</Boton>
            <Boton variante="secundario" onClick={() => void descargar()}>
              {tx.descargar}
            </Boton>
            <Boton variante="secundario" onClick={() => void enviar()}>
              {tx.enviar}
            </Boton>
            <Boton variante="secundario" onClick={() => setMetodosAbierto(true)}>
              {tx.metodos}
            </Boton>
            <Boton variante="secundario" onClick={() => setGuiaAbierta(true)}>
              {tx.comoLanzar}
            </Boton>
          </div>
          <BloqueCodigo ref={bloque} codigo={macro} etiqueta={archivo} compacto />
        </>
      ) : (
        <Nota tipo={'error' in estado && estado.error === 'invalida' ? 'error' : 'aviso'}>
          {'error' in estado && estado.error === 'invalida' ? tx.invalida : tx.noDisponible}
        </Nota>
      )}

      <div className="fila">
        <BotonEnlace to={`/receteta/${r.id}`} variante="secundario">
          {tx.editar}
        </BotonEnlace>
        <Boton variante="secundario" onClick={() => void compartirReceteta(r)}>
          {t.inicio.compartir}
        </Boton>
      </div>

      <Dialogo
        abierto={guiaAbierta}
        amplio
        titulo={t.guia.titulo}
        onCerrar={() => setGuiaAbierta(false)}
        acciones={<Boton onClick={() => setGuiaAbierta(false)}>{t.app.cerrar}</Boton>}
      >
        <GuiaFiji nivelTitulo={3} />
      </Dialogo>

      <PanelMetodos receteta={r} abierto={metodosAbierto} onCerrar={() => setMetodosAbierto(false)} />

      {dialogo}
    </Pantalla>
  );
}
