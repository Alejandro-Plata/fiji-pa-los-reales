import { Boton } from '../../componentes/Boton/Boton';
import { Dialogo } from '../../componentes/Dialogo/Dialogo';
import { Nota } from '../../componentes/Nota/Nota';
import type { Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';

/** Texto para Materiales y Métodos (fase 3). */
export function PanelMetodos({
  abierto,
  onCerrar,
}: {
  receteta: Receteta;
  abierto: boolean;
  onCerrar: () => void;
}) {
  return (
    <Dialogo
      abierto={abierto}
      titulo={t.resultado.metodos}
      onCerrar={onCerrar}
      acciones={<Boton onClick={onCerrar}>{t.app.cerrar}</Boton>}
    >
      <Nota>{t.provisional.enConstruccion}</Nota>
    </Dialogo>
  );
}
