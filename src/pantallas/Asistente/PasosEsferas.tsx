import { CampoLista, CampoNumero } from '../../componentes/Campo/Controles';
import { Casillas, Selector, SiNo } from '../../componentes/Selector/Selector';
import { Plegable } from '../../componentes/Plegable/Plegable';
import { esquemaParametrosEsferas, METODOS_UMBRAL } from '../../dominio/recetetas/esquemas';
import { mostrarNumero } from '../../dominio/recetetas/numeros';
import type { RecetetaDe } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import type { ClavePaso } from './pasos';
import { PasoImagenes, type PropsPaso } from './PasosComunes';

const DEF = esquemaParametrosEsferas.parse({});
const tx = t.campos.esferas;
type Props = PropsPaso<RecetetaDe<'esferas'>>;

export function PasoEsferas({ paso, ...props }: Props & { paso: ClavePaso }) {
  switch (paso) {
    case 'imagenes':
      return <Imagenes {...props} />;
    case 'deteccion':
      return <Deteccion {...props} />;
    case 'filtros':
      return <Filtros {...props} />;
    case 'resultados':
      return <Resultados {...props} />;
    default:
      return null;
  }
}

function Imagenes(props: Props) {
  const { r, editar, e } = props;
  return (
    <PasoImagenes {...(props as PropsPaso)}>
      <CampoNumero
        etiqueta={tx.canal.etiqueta}
        ayuda={tx.canal.ayuda}
        recomendado={String(DEF.canal)}
        entero
        valor={r.parametros.canal}
        error={e('parametros.canal')}
        onCambio={(n) => editar((x) => void (x.parametros.canal = n ?? NaN))}
      />
    </PasoImagenes>
  );
}

function Deteccion({ r, editar, e }: Props) {
  const p = r.parametros;
  return (
    <>
      <Selector
        etiqueta={tx.metodo.etiqueta}
        ayuda={tx.metodo.ayuda}
        valor={p.metodo}
        valorRecomendado={DEF.metodo}
        opciones={[
          { valor: 'bordes', etiqueta: tx.metodo.bordes, texto: tx.metodo.bordesTexto },
          { valor: 'umbral', etiqueta: tx.metodo.umbral, texto: tx.metodo.umbralTexto },
        ]}
        onCambio={(v) => editar((x) => void (x.parametros.metodo = v))}
      />
      <CampoLista
        etiqueta={tx.metodoUmbral.etiqueta}
        ayuda={tx.metodoUmbral.ayuda}
        valor={p.metodoUmbral}
        opciones={METODOS_UMBRAL}
        valorRecomendado={DEF.metodoUmbral}
        onCambio={(v) => editar((x) => void (x.parametros.metodoUmbral = v))}
      />
      <SiNo
        etiqueta={tx.rellenarHuecos.etiqueta}
        ayuda={tx.rellenarHuecos.ayuda}
        valor={p.rellenarHuecos}
        valorRecomendado={DEF.rellenarHuecos}
        onCambio={(v) => editar((x) => void (x.parametros.rellenarHuecos = v))}
      />
      <SiNo
        etiqueta={tx.separarTocandose.etiqueta}
        ayuda={tx.separarTocandose.ayuda}
        valor={p.separarTocandose}
        valorRecomendado={DEF.separarTocandose}
        onCambio={(v) => editar((x) => void (x.parametros.separarTocandose = v))}
      />

      <Plegable titulo={t.asistente.avanzadas}>
        <CampoNumero
          etiqueta={tx.suavizado.etiqueta}
          ayuda={tx.suavizado.ayuda}
          recomendado={mostrarNumero(DEF.suavizado)}
          valor={p.suavizado}
          error={e('parametros.suavizado')}
          onCambio={(n) => editar((x) => void (x.parametros.suavizado = n ?? NaN))}
        />
        {p.metodo === 'bordes' && (
          <CampoNumero
            etiqueta={tx.radioBordes.etiqueta}
            ayuda={tx.radioBordes.ayuda}
            recomendado={mostrarNumero(DEF.radioBordes)}
            valor={p.radioBordes}
            error={e('parametros.radioBordes')}
            onCambio={(n) => editar((x) => void (x.parametros.radioBordes = n ?? NaN))}
          />
        )}
        {p.metodo === 'umbral' && (
          <>
            <SiNo
              etiqueta={tx.restarFondo.etiqueta}
              ayuda={tx.restarFondo.ayuda}
              valor={p.restarFondo.activo}
              valorRecomendado={DEF.restarFondo.activo}
              onCambio={(v) => editar((x) => void (x.parametros.restarFondo.activo = v))}
            />
            {p.restarFondo.activo && (
              <CampoNumero
                etiqueta={tx.restarFondoRadio.etiqueta}
                ayuda={tx.restarFondoRadio.ayuda}
                recomendado={mostrarNumero(DEF.restarFondo.radio)}
                valor={p.restarFondo.radio}
                error={e('parametros.restarFondo.radio')}
                onCambio={(n) => editar((x) => void (x.parametros.restarFondo.radio = n ?? NaN))}
              />
            )}
          </>
        )}
        <SiNo
          etiqueta={tx.limpiarRuido.etiqueta}
          ayuda={tx.limpiarRuido.ayuda}
          valor={p.limpiarRuido}
          valorRecomendado={DEF.limpiarRuido}
          onCambio={(v) => editar((x) => void (x.parametros.limpiarRuido = v))}
        />
      </Plegable>
    </>
  );
}

function Filtros({ r, editar, e }: Props) {
  const p = r.parametros;
  return (
    <>
      <CampoNumero
        etiqueta={tx.diametroMin.etiqueta}
        ayuda={tx.diametroMin.ayuda}
        recomendado={mostrarNumero(DEF.diametroMin)}
        valor={p.diametroMin}
        error={e('parametros.diametroMin')}
        onCambio={(n) => editar((x) => void (x.parametros.diametroMin = n ?? NaN))}
      />
      <CampoNumero
        etiqueta={tx.diametroMax.etiqueta}
        ayuda={tx.diametroMax.ayuda}
        pista={t.campo.vacioSinLimite}
        permiteVacio
        valor={p.diametroMax}
        error={e('parametros.diametroMax')}
        onCambio={(n) => editar((x) => void (x.parametros.diametroMax = n))}
      />
      <CampoNumero
        etiqueta={tx.circularidadMin.etiqueta}
        ayuda={tx.circularidadMin.ayuda}
        recomendado={mostrarNumero(DEF.circularidadMin)}
        valor={p.circularidadMin}
        error={e('parametros.circularidadMin')}
        onCambio={(n) => editar((x) => void (x.parametros.circularidadMin = n ?? NaN))}
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

type Salida = 'objetos' | 'resumen' | 'control' | 'rois';
const SALIDAS: Salida[] = ['resumen', 'objetos', 'control', 'rois'];

function Resultados({ r, editar, e }: Props) {
  const p = r.parametros;
  return (
    <>
      <CampoNumero
        etiqueta={tx.celulasSembradas.etiqueta}
        ayuda={tx.celulasSembradas.ayuda}
        pista={t.campo.opcional}
        entero
        permiteVacio
        valor={p.celulasSembradas}
        error={e('parametros.celulasSembradas')}
        onCambio={(n) => editar((x) => void (x.parametros.celulasSembradas = n))}
      />
      <Casillas<Salida>
        etiqueta={tx.salidas.etiqueta}
        ayuda={tx.salidas.ayuda}
        valores={SALIDAS.filter((s) => p.salidas[s])}
        opciones={SALIDAS.map((s) => ({ valor: s, etiqueta: tx.salidas[s] }))}
        onCambio={(v) =>
          editar((x) => {
            for (const s of SALIDAS) x.parametros.salidas[s] = v.includes(s);
          })
        }
      />
    </>
  );
}
