import { useEffect, useState } from 'react';
import { Boton } from '../../componentes/Boton/Boton';
import { Nota } from '../../componentes/Nota/Nota';
import { escritorio, esAppNativa, esEscritorio } from '../../app/plataforma';
import {
  abrirAjustesPermiso,
  comprobarActualizacion,
  descargarEInstalar,
  megas,
  permisoInstalar,
  type Comprobacion,
} from '../../app/actualizaciones';
import { t } from '../../textos/es';
import estilos from './Ajustes.module.css';

const tx = t.ajustes.actualizaciones;

type Fase =
  | { tipo: 'inicial' }
  | { tipo: 'buscando' }
  | { tipo: 'resultado'; r: Comprobacion }
  | { tipo: 'descargando'; pct: number; r: Extract<Comprobacion, { estado: 'disponible' }> }
  | { tipo: 'instalador' }
  | { tipo: 'sin-permiso'; r: Extract<Comprobacion, { estado: 'disponible' }> }
  | { tipo: 'error-descarga'; r: Extract<Comprobacion, { estado: 'disponible' }> };

const fecha = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-ES', { dateStyle: 'long' });
};

function Novedades({ r }: { r: Extract<Comprobacion, { estado: 'disponible' }> }) {
  const p = r.publicacion;
  return (
    <div className={estilos.novedades}>
      <p className={estilos.disponible}>{tx.disponible(p.version)}</p>
      <p className="caption texto-suave">{tx.publicada(fecha(p.publicada), p.tamano ? megas(p.tamano) : undefined)}</p>
      {p.novedades.length > 0 && (
        <>
          <h3 className={estilos.subtitulo}>{tx.novedades}</h3>
          <ul className={estilos.lista}>
            {p.novedades.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** App Android: buscar, descargar e instalar actualizaciones. */
function ActualizacionesNativas() {
  const [fase, setFase] = useState<Fase>({ tipo: 'inicial' });

  const buscar = async () => {
    setFase({ tipo: 'buscando' });
    setFase({ tipo: 'resultado', r: await comprobarActualizacion() });
  };

  // Al abrir Ajustes se comprueba automáticamente una vez
  useEffect(() => {
    let vivo = true;
    void comprobarActualizacion().then((r) => {
      if (vivo) setFase({ tipo: 'resultado', r });
    });
    return () => {
      vivo = false;
    };
  }, []);

  const instalar = async (r: Extract<Comprobacion, { estado: 'disponible' }>) => {
    if (!(await permisoInstalar())) return setFase({ tipo: 'sin-permiso', r });
    setFase({ tipo: 'descargando', pct: 0, r });
    try {
      await descargarEInstalar(r.urlApk, (pct) => setFase({ tipo: 'descargando', pct, r }));
      setFase({ tipo: 'instalador' });
    } catch (e) {
      setFase(String(e).includes('SIN_PERMISO') ? { tipo: 'sin-permiso', r } : { tipo: 'error-descarga', r });
    }
  };

  const disponible =
    fase.tipo === 'resultado' && fase.r.estado === 'disponible'
      ? fase.r
      : fase.tipo === 'descargando' || fase.tipo === 'sin-permiso' || fase.tipo === 'error-descarga'
        ? fase.r
        : null;

  return (
    <>
      <p>{tx.instalada(__VERSION_APP__)}</p>

      <div aria-live="polite" className={estilos.estadoActualizacion}>
        {(fase.tipo === 'inicial' || fase.tipo === 'buscando') && <p className="texto-suave">{tx.buscando}</p>}
        {fase.tipo === 'resultado' && fase.r.estado === 'al-dia' && <Nota tipo="exito">{tx.alDia}</Nota>}
        {fase.tipo === 'resultado' && fase.r.estado === 'sin-publicacion' && <p>{tx.sinPublicacion}</p>}
        {fase.tipo === 'resultado' && fase.r.estado === 'error' && <Nota tipo="aviso">{tx.error}</Nota>}
        {disponible && <Novedades r={disponible} />}
        {fase.tipo === 'descargando' && (
          <div className={estilos.progreso}>
            <progress max={100} value={fase.pct} aria-label={tx.descargando(fase.pct)} />
            <p className="caption">{tx.descargando(fase.pct)}</p>
          </div>
        )}
        {fase.tipo === 'sin-permiso' && <Nota tipo="aviso">{tx.sinPermiso}</Nota>}
        {fase.tipo === 'error-descarga' && <Nota tipo="error">{tx.errorDescarga}</Nota>}
        {fase.tipo === 'instalador' && <Nota tipo="info">{tx.instalador}</Nota>}
      </div>

      <div className="fila">
        {disponible && fase.tipo !== 'descargando' && (
          <Boton onClick={() => void instalar(disponible)}>{tx.instalar}</Boton>
        )}
        {fase.tipo === 'sin-permiso' && (
          <Boton variante="secundario" onClick={() => void abrirAjustesPermiso()}>
            {tx.concederPermiso}
          </Boton>
        )}
        {!disponible && (
          <Boton
            variante="secundario"
            onClick={() => void buscar()}
            disabled={fase.tipo === 'buscando' || fase.tipo === 'inicial'}
          >
            {tx.buscar}
          </Boton>
        )}
      </div>
    </>
  );
}

/** App de Windows: avisa de versiones nuevas y abre el instalador en el navegador. */
function ActualizacionesEscritorio() {
  const [r, setR] = useState<Comprobacion | null>(null);
  const [descargando, setDescargando] = useState(false);
  const buscar = async () => {
    setR(null);
    setDescargando(false);
    setR(await comprobarActualizacion());
  };
  useEffect(() => {
    let vivo = true;
    void comprobarActualizacion().then((x) => {
      if (vivo) setR(x);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <>
      <p>{tx.instalada(__VERSION_APP__)}</p>
      <div aria-live="polite" className={estilos.estadoActualizacion}>
        {r === null && <p className="texto-suave">{tx.buscando}</p>}
        {r?.estado === 'al-dia' && <Nota tipo="exito">{tx.alDia}</Nota>}
        {r?.estado === 'sin-publicacion' && <p>{tx.sinPublicacion}</p>}
        {r?.estado === 'error' && <Nota tipo="aviso">{tx.error}</Nota>}
        {r?.estado === 'disponible' && <Novedades r={r} />}
        {r?.estado === 'disponible' && !r.urlWindows && <p>{tx.sinInstaladorWindows}</p>}
        {descargando && <Nota tipo="info">{tx.windowsDescarga}</Nota>}
      </div>
      <div className="fila">
        {r?.estado === 'disponible' && r.urlWindows && (
          <Boton
            onClick={() => {
              setDescargando(true);
              void escritorio()?.abrirEnNavegador(r.urlWindows!);
            }}
          >
            {tx.instalarWindows}
          </Boton>
        )}
        {r?.estado !== 'disponible' && (
          <Boton variante="secundario" onClick={() => void buscar()} disabled={r === null}>
            {tx.buscar}
          </Boton>
        )}
      </div>
    </>
  );
}

/** Web (PWA): se actualiza sola; ofrece descargar las apps de Android y Windows publicadas. */
function ActualizacionesWeb() {
  const [r, setR] = useState<Comprobacion | null>(null);
  useEffect(() => {
    let vivo = true;
    // Versión 0.0.0: cualquier APK publicado cuenta como «disponible» y trae su dirección
    void comprobarActualizacion('0.0.0').then((x) => {
      if (vivo) setR(x);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <>
      <p>{tx.web}</p>
      {r?.estado === 'disponible' && (
        <div className={estilos.novedades}>
          <h3 className={estilos.subtitulo}>{tx.android}</h3>
          <p className="caption texto-suave">{tx.androidTexto}</p>
          <div>
            <a className={estilos.enlaceBoton} href={r.urlApk} download>
              {tx.descargarApk(r.publicacion.version)}
              {r.publicacion.tamano ? ` · ${megas(r.publicacion.tamano)}` : ''}
            </a>
          </div>
        </div>
      )}
      {r?.estado === 'disponible' && r.urlWindows && (
        <div className={estilos.novedades}>
          <h3 className={estilos.subtitulo}>{tx.windows}</h3>
          <p className="caption texto-suave">{tx.windowsTexto}</p>
          <div>
            <a className={estilos.enlaceBoton} href={r.urlWindows} download>
              {tx.descargarWindows(r.publicacion.version)}
              {r.publicacion.windows?.tamano ? ` · ${megas(r.publicacion.windows.tamano)}` : ''}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export function Actualizaciones() {
  return (
    <section className={estilos.seccion} aria-labelledby="aj-actualizaciones" id="actualizaciones">
      <h2 id="aj-actualizaciones">{tx.titulo}</h2>
      {esAppNativa() ? (
        <ActualizacionesNativas />
      ) : esEscritorio() ? (
        <ActualizacionesEscritorio />
      ) : (
        <ActualizacionesWeb />
      )}
    </section>
  );
}
