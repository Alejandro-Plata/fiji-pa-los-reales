import { CampoNumero, CampoTexto } from '../../componentes/Campo/Controles';
import { Selector, SiNo } from '../../componentes/Selector/Selector';
import { Nota } from '../../componentes/Nota/Nota';
import { esquemaParametrosWestern } from '../../dominio/recetetas/esquemas';
import { mostrarNumero } from '../../dominio/recetetas/numeros';
import type { RecetetaDe } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import type { ClavePaso } from './pasos';
import type { PropsPaso } from './PasosComunes';

const DEF = esquemaParametrosWestern.parse({});
const tx = t.campos.western;
type Props = PropsPaso<RecetetaDe<'western'>>;

export function PasoWestern({ paso, ...props }: Props & { paso: ClavePaso }) {
  if (paso === 'procesado') return <Procesado {...props} />;
  if (paso === 'resultados') return <Resultados {...props} />;
  return null;
}

function Procesado({ r, editar, e }: Props) {
  const p = r.parametros;
  return (
    <>
      <Nota tipo="aviso">
        <ul>
          {tx.avisos.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Nota>
      <SiNo
        etiqueta={tx.bandasOscuras.etiqueta}
        ayuda={tx.bandasOscuras.ayuda}
        valor={p.bandasOscuras}
        valorRecomendado={DEF.bandasOscuras}
        onCambio={(v) => editar((x) => void (x.parametros.bandasOscuras = v))}
      />
      <Selector
        etiqueta={tx.fondo.etiqueta}
        ayuda={tx.fondo.ayuda}
        valor={p.fondo}
        valorRecomendado={DEF.fondo}
        opciones={[
          { valor: 'rollingBall', etiqueta: tx.fondo.rollingBall, texto: tx.fondo.rollingBallTexto },
          { valor: 'ninguno', etiqueta: tx.fondo.ninguno, texto: tx.fondo.ningunoTexto },
        ]}
        onCambio={(v) => editar((x) => void (x.parametros.fondo = v))}
      />
      {p.fondo === 'rollingBall' && (
        <CampoNumero
          etiqueta={tx.radioFondo.etiqueta}
          ayuda={tx.radioFondo.ayuda}
          recomendado={mostrarNumero(DEF.radioFondo)}
          valor={p.radioFondo}
          error={e('parametros.radioFondo')}
          onCambio={(n) => editar((x) => void (x.parametros.radioFondo = n ?? NaN))}
        />
      )}
      <SiNo
        etiqueta={tx.avisarSaturacion.etiqueta}
        ayuda={tx.avisarSaturacion.ayuda}
        valor={p.avisarSaturacion}
        valorRecomendado={DEF.avisarSaturacion}
        onCambio={(v) => editar((x) => void (x.parametros.avisarSaturacion = v))}
      />
    </>
  );
}

function Resultados({ r, editar, e }: Props) {
  return (
    <>
      <CampoTexto
        etiqueta={tx.nombreProteina.etiqueta}
        ayuda={tx.nombreProteina.ayuda}
        pista={t.campo.opcional}
        maximo={40}
        valor={r.parametros.nombreProteina}
        error={e('parametros.nombreProteina')}
        onCambio={(v) => editar((x) => void (x.parametros.nombreProteina = v))}
      />
      <Nota>{tx.columna}</Nota>
    </>
  );
}
