import { Link } from 'react-router-dom';
import { CampoLista, CampoNumero, CampoTexto } from '../../componentes/Campo/Controles';
import { Selector, SiNo } from '../../componentes/Selector/Selector';
import { Plegable } from '../../componentes/Plegable/Plegable';
import { Nota } from '../../componentes/Nota/Nota';
import { Boton } from '../../componentes/Boton/Boton';
import {
  esquemaParametrosFluorescencia,
  METODOS_UMBRAL,
} from '../../dominio/recetetas/esquemas';
import { mostrarNumero } from '../../dominio/recetetas/numeros';
import type { RecetetaDe } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import type { ClavePaso } from './pasos';
import { PasoImagenes, type PropsPaso } from './PasosComunes';
import estilos from './Asistente.module.css';

const DEF = esquemaParametrosFluorescencia.parse({});
const tx = t.campos.fluorescencia;
type Props = PropsPaso<RecetetaDe<'fluorescencia'>>;

export function PasoFluorescencia({ paso, ...props }: Props & { paso: ClavePaso }) {
  switch (paso) {
    case 'imagenes':
      return <PasoImagenes {...(props as PropsPaso)} />;
    case 'deteccion':
      return <Deteccion {...props} />;
    case 'filtros':
      return <Filtros {...props} />;
    case 'marcadores':
      return <Marcadores {...props} />;
    default:
      return null;
  }
}

function Deteccion({ r, editar, e }: Props) {
  const p = r.parametros;
  return (
    <>
      <CampoNumero
        etiqueta={tx.canalNucleos.etiqueta}
        ayuda={tx.canalNucleos.ayuda}
        recomendado={String(DEF.canalNucleos)}
        entero
        valor={p.canalNucleos}
        error={e('parametros.canalNucleos')}
        onCambio={(n) => editar((x) => void (x.parametros.canalNucleos = n ?? NaN))}
      />
      <Selector
        etiqueta={tx.deteccion.etiqueta}
        ayuda={tx.deteccion.ayuda}
        valor={p.deteccion}
        valorRecomendado={DEF.deteccion}
        opciones={[
          { valor: 'umbral', etiqueta: tx.deteccion.umbral, texto: tx.deteccion.umbralTexto },
          { valor: 'stardist', etiqueta: tx.deteccion.stardist, texto: tx.deteccion.stardistTexto },
        ]}
        onCambio={(v) => editar((x) => void (x.parametros.deteccion = v))}
      />
      {p.deteccion === 'umbral' ? (
        <>
          <CampoLista
            etiqueta={tx.metodoUmbral.etiqueta}
            ayuda={tx.metodoUmbral.ayuda}
            valor={p.metodoUmbral}
            opciones={METODOS_UMBRAL}
            valorRecomendado={DEF.metodoUmbral}
            onCambio={(v) => editar((x) => void (x.parametros.metodoUmbral = v))}
          />
          <SiNo
            etiqueta={tx.separarNucleos.etiqueta}
            ayuda={tx.separarNucleos.ayuda}
            valor={p.separarNucleos}
            valorRecomendado={DEF.separarNucleos}
            onCambio={(v) => editar((x) => void (x.parametros.separarNucleos = v))}
          />
        </>
      ) : null}

      <Plegable titulo={t.asistente.avanzadas}>
        <CampoNumero
          etiqueta={tx.restarFondoRadio.etiqueta}
          ayuda={tx.restarFondoRadio.ayuda}
          recomendado={mostrarNumero(DEF.restarFondoRadio)}
          valor={p.restarFondoRadio}
          error={e('parametros.restarFondoRadio')}
          onCambio={(n) => editar((x) => void (x.parametros.restarFondoRadio = n ?? NaN))}
        />
        {p.deteccion === 'stardist' && (
          <>
            <CampoNumero
              etiqueta={tx.probabilidadStardist.etiqueta}
              ayuda={tx.probabilidadStardist.ayuda}
              recomendado={mostrarNumero(DEF.probabilidadStardist)}
              valor={p.probabilidadStardist}
              error={e('parametros.probabilidadStardist')}
              onCambio={(n) => editar((x) => void (x.parametros.probabilidadStardist = n ?? NaN))}
            />
            <CampoNumero
              etiqueta={tx.solapamientoStardist.etiqueta}
              ayuda={tx.solapamientoStardist.ayuda}
              recomendado={mostrarNumero(DEF.solapamientoStardist)}
              valor={p.solapamientoStardist}
              error={e('parametros.solapamientoStardist')}
              onCambio={(n) => editar((x) => void (x.parametros.solapamientoStardist = n ?? NaN))}
            />
          </>
        )}
      </Plegable>
    </>
  );
}

function Filtros({ r, editar, e }: Props) {
  const p = r.parametros;
  return (
    <>
      <CampoNumero
        etiqueta={tx.areaNucleoMin.etiqueta}
        ayuda={tx.areaNucleoMin.ayuda}
        recomendado={mostrarNumero(DEF.areaNucleoMin)}
        valor={p.areaNucleoMin}
        error={e('parametros.areaNucleoMin')}
        onCambio={(n) => editar((x) => void (x.parametros.areaNucleoMin = n ?? NaN))}
      />
      <CampoNumero
        etiqueta={tx.areaNucleoMax.etiqueta}
        ayuda={tx.areaNucleoMax.ayuda}
        recomendado={mostrarNumero(DEF.areaNucleoMax)}
        valor={p.areaNucleoMax}
        error={e('parametros.areaNucleoMax')}
        onCambio={(n) => editar((x) => void (x.parametros.areaNucleoMax = n ?? NaN))}
      />
      <SiNo
        etiqueta={tx.excluirBordes.etiqueta}
        ayuda={tx.excluirBordes.ayuda}
        valor={p.excluirBordes}
        valorRecomendado={DEF.excluirBordes}
        onCambio={(v) => editar((x) => void (x.parametros.excluirBordes = v))}
      />
    </>
  );
}

function Marcadores({ r, editar, e }: Props) {
  const p = r.parametros;
  const m = tx.marcadores;
  const canalLibre = () => {
    const usados = new Set([p.canalNucleos, ...p.marcadores.map((x) => x.canal)]);
    for (let c = 1; c <= 8; c++) if (!usados.has(c)) return c;
    return 2;
  };

  return (
    <>
      <div className={estilos.bloque}>
        <h3>{m.etiqueta}</h3>
        <p>{m.ayuda}</p>
        {p.marcadores.length === 0 && <p className="texto-suave">{m.ninguno}</p>}
        {e('parametros.marcadores') && <Nota tipo="error">{e('parametros.marcadores')}</Nota>}
      </div>

      {p.marcadores.map((mk, i) => (
        <fieldset key={i} className={estilos.marcador}>
          <legend className={estilos.marcadorTitulo}>{m.titulo(i + 1)}</legend>
          <CampoTexto
            etiqueta={m.nombre}
            maximo={30}
            valor={mk.nombre}
            error={e(`parametros.marcadores.${i}.nombre`)}
            onCambio={(v) => editar((x) => void (x.parametros.marcadores[i]!.nombre = v))}
          />
          <CampoNumero
            etiqueta={m.canal}
            entero
            valor={mk.canal}
            error={e(`parametros.marcadores.${i}.canal`)}
            onCambio={(n) => editar((x) => void (x.parametros.marcadores[i]!.canal = n ?? NaN))}
          />
          <CampoNumero
            etiqueta={m.umbral}
            pista={m.umbralAyuda}
            permiteVacio
            valor={mk.umbralPositivo}
            error={e(`parametros.marcadores.${i}.umbralPositivo`)}
            onCambio={(n) => editar((x) => void (x.parametros.marcadores[i]!.umbralPositivo = n))}
          />
          <div>
            <Boton
              variante="secundario"
              onClick={() => editar((x) => void x.parametros.marcadores.splice(i, 1))}
            >
              {m.quitar(mk.nombre)}
            </Boton>
          </div>
        </fieldset>
      ))}

      {p.marcadores.length < 3 ? (
        <div>
          <Boton
            variante="secundario"
            onClick={() =>
              editar((x) =>
                void x.parametros.marcadores.push({ nombre: '', canal: canalLibre(), umbralPositivo: null }),
              )
            }
          >
            {m.anadir}
          </Boton>
        </div>
      ) : (
        <p className="texto-suave">{m.maximo}</p>
      )}

      {p.marcadores.length > 0 && (
        <Nota tipo="aviso">
          <p>{m.avisoUmbral}</p>
          <p>
            <Link to="/umbral">{t.umbral.enlace}</Link>
          </p>
        </Nota>
      )}

      <Selector
        etiqueta={tx.medida.etiqueta}
        ayuda={tx.medida.ayuda}
        valor={p.medida}
        valorRecomendado={DEF.medida}
        opciones={[
          { valor: 'media', etiqueta: tx.medida.media, texto: tx.medida.mediaTexto },
          { valor: 'integrada', etiqueta: tx.medida.integrada, texto: tx.medida.integradaTexto },
        ]}
        onCambio={(v) => editar((x) => void (x.parametros.medida = v))}
      />
    </>
  );
}
