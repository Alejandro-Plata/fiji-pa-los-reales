import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function Instrucciones() {
  return (
    <Pantalla titulo={t.pantallas.instrucciones.titulo}>
      <p>{t.provisional.enConstruccion}</p>
    </Pantalla>
  );
}
