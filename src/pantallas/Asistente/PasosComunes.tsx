import { useState } from 'react';
import { CampoNumero, CampoTexto } from '../../componentes/Campo/Controles';
import { Casillas, Selector } from '../../componentes/Selector/Selector';
import { Nota } from '../../componentes/Nota/Nota';
import { Plegable } from '../../componentes/Plegable/Plegable';
import { EXTENSIONES } from '../../dominio/recetetas/esquemas';
import type { Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';

export interface PropsPaso<R extends Receteta = Receteta> {
  r: R;
  editar: (fn: (r: R) => void) => void;
  /** Mensaje de error de una ruta ("parametros.diametroMax"), si lo hay. */
  e: (ruta: string) => string | undefined;
}

type Ext = (typeof EXTENSIONES)[number] | '*';

export function PasoImagenes({ r, editar, e, children }: PropsPaso & { children?: React.ReactNode }) {
  const tx = t.campos.imagenes;
  const img = r.imagenes;
  const conSeries = img.extensiones.some((x) => x === '*' || x === '.lif' || x === '.czi');

  return (
    <>
      <Casillas<Ext>
        etiqueta={tx.extensiones.etiqueta}
        ayuda={tx.extensiones.ayuda}
        error={e('imagenes.extensiones')}
        valores={img.extensiones}
        opciones={[
          ...EXTENSIONES.map((x) => ({ valor: x as Ext, etiqueta: x })),
          { valor: '*' as Ext, etiqueta: tx.extensiones.todas },
        ]}
        onCambio={(v) =>
          editar((x) => {
            // «Todas» excluye al resto y viceversa
            const recienTodas = v.includes('*') && !x.imagenes.extensiones.includes('*');
            x.imagenes.extensiones = recienTodas ? ['*'] : v.filter((y) => y !== '*' || v.length === 1);
          })
        }
      />
      {conSeries && <Nota tipo="aviso">{tx.extensiones.avisoSeries}</Nota>}
      {r.tipo === 'fluorescencia' && <Nota tipo="aviso">{tx.avisoRgb}</Nota>}

      <Selector
        etiqueta={tx.escala.etiqueta}
        ayuda={tx.escala.ayuda}
        valor={img.escala.modo}
        valorRecomendado="archivo"
        opciones={[
          { valor: 'archivo', etiqueta: tx.escala.archivo, texto: tx.escala.archivoTexto },
          { valor: 'manual', etiqueta: tx.escala.manual, texto: tx.escala.manualTexto },
        ]}
        onCambio={(modo) =>
          editar((x) => {
            x.imagenes.escala = modo === 'manual' ? { modo, micrasPorPixel: NaN } : { modo };
          })
        }
      />
      {img.escala.modo === 'manual' && (
        <CampoNumero
          etiqueta={tx.micrasPorPixel.etiqueta}
          ayuda={tx.micrasPorPixel.ayuda}
          error={e('imagenes.escala.micrasPorPixel')}
          valor={img.escala.micrasPorPixel}
          onCambio={(n) =>
            editar((x) => {
              x.imagenes.escala = { modo: 'manual', micrasPorPixel: n ?? NaN };
            })
          }
        />
      )}

      {children}

      <Plegable titulo={t.asistente.avanzadas}>
        <Selector
          etiqueta={tx.proyeccionZ.etiqueta}
          ayuda={tx.proyeccionZ.ayuda}
          valor={img.proyeccionZ}
          valorRecomendado="maxima"
          compacto
          opciones={[
            { valor: 'maxima', etiqueta: tx.proyeccionZ.maxima },
            { valor: 'media', etiqueta: tx.proyeccionZ.media },
            { valor: 'ninguna', etiqueta: tx.proyeccionZ.ninguna },
          ]}
          onCambio={(v) =>
            editar((x) => {
              x.imagenes.proyeccionZ = v;
            })
          }
        />
      </Plegable>
    </>
  );
}

export function PasoNombre({ r, editar, e, mostrarErrores }: PropsPaso & { mostrarErrores: boolean }) {
  const tx = t.campos.nombre;
  const [etiquetas, setEtiquetas] = useState(r.etiquetas.join(', '));
  return (
    <>
      <CampoTexto
        etiqueta={tx.nombre.etiqueta}
        ayuda={tx.nombre.ayuda}
        valor={r.nombre}
        maximo={60}
        error={mostrarErrores || r.nombre ? e('nombre') : undefined}
        onCambio={(v) =>
          editar((x) => {
            x.nombre = v;
          })
        }
      />
      <CampoTexto
        etiqueta={tx.descripcion.etiqueta}
        ayuda={tx.descripcion.ayuda}
        pista={t.campo.opcional}
        multilinea
        maximo={300}
        valor={r.descripcion ?? ''}
        error={e('descripcion')}
        onCambio={(v) =>
          editar((x) => {
            x.descripcion = v || undefined;
          })
        }
      />
      <CampoTexto
        etiqueta={tx.etiquetas.etiqueta}
        ayuda={tx.etiquetas.ayuda}
        pista={t.campo.opcional}
        valor={etiquetas}
        error={e('etiquetas')}
        onCambio={(v) => {
          setEtiquetas(v);
          editar((x) => {
            x.etiquetas = v
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => s.slice(0, 30))
              .slice(0, 10);
          });
        }}
      />
    </>
  );
}
