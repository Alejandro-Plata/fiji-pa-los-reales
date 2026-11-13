/**
 * Compartir una receteta (spec §5 y §6):
 *  1. Enlace con la receteta codificada → hoja de compartir del sistema.
 *  2. Sin hoja de compartir → se copia el enlace.
 *  3. Si el portapapeles falla → diálogo con el enlace seleccionado.
 *  4. Enlace > 2000 caracteres o sin dirección pública (app Android sin web publicada) → archivo .json.
 */
import { useCallback, useState } from 'react';
import { Boton } from '../componentes/Boton/Boton';
import { Dialogo } from '../componentes/Dialogo/Dialogo';
import { exportarJson } from '../dominio/recetetas/almacenamiento';
import { codificarReceteta, construirEnlace, LIMITE_ENLACE } from '../dominio/recetetas/compartir';
import type { Receteta } from '../dominio/recetetas/tipos';
import { t } from '../textos/es';
import { useAvisos } from './Avisos';
import { compartir, copiarTexto, guardarArchivo, urlPublica } from './plataforma';
import estilosCampo from '../componentes/Campo/Campo.module.css';

export function nombreArchivo(nombre: string, extension: string): string {
  const base =
    nombre
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50) || 'receteta';
  return `${base}${extension}`;
}

export function useCompartirReceteta() {
  const avisar = useAvisos();
  const [enlaceManual, setEnlaceManual] = useState<string | null>(null);

  const enviarJson = useCallback(
    async (r: Receteta, motivo: string) => {
      const contenido = exportarJson([r], __VERSION_APP__);
      const archivo = { nombre: nombreArchivo(r.nombre, '.json'), contenido, tipo: 'application/json' };
      const res = await compartir({ titulo: t.compartir.titulo(r.nombre), archivo });
      if (res === 'compartido') {
        avisar(motivo);
        return;
      }
      if (res === 'cancelado') return;
      const g = await guardarArchivo(archivo.nombre, contenido, archivo.tipo);
      avisar(g.ok ? `${motivo} ${t.compartir.jsonGuardado(g.donde)}` : t.compartir.error, {
        duracion: 8000,
      });
    },
    [avisar],
  );

  const compartirReceteta = useCallback(
    async (r: Receteta) => {
      const base = urlPublica();
      if (!base) return enviarJson(r, t.compartir.sinUrlPublica);
      const enlace = construirEnlace(base, await codificarReceteta(r));
      if (enlace.length > LIMITE_ENLACE) return enviarJson(r, t.compartir.demasiadoLargo);

      const res = await compartir({ titulo: t.compartir.titulo(r.nombre), texto: t.compartir.texto, url: enlace });
      if (res !== 'no-disponible') return;
      if (await copiarTexto(enlace)) avisar(t.compartir.enlaceCopiado);
      else setEnlaceManual(enlace);
    },
    [avisar, enviarJson],
  );

  const dialogo = (
    <Dialogo
      abierto={enlaceManual !== null}
      titulo={t.inicio.compartir}
      texto={t.compartir.enlaceNoCopiado}
      onCerrar={() => setEnlaceManual(null)}
      acciones={<Boton onClick={() => setEnlaceManual(null)}>{t.app.cerrar}</Boton>}
    >
      <textarea
        className={`${estilosCampo.entrada} ${estilosCampo.area}`}
        readOnly
        value={enlaceManual ?? ''}
        aria-label={t.inicio.compartir}
        onFocus={(e) => e.currentTarget.select()}
        autoFocus
      />
    </Dialogo>
  );

  return { compartirReceteta, dialogo };
}
