import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { GuiaFiji } from '../../componentes/GuiaFiji/GuiaFiji';
import { t } from '../../textos/es';

export function Instrucciones() {
  return (
    <Pantalla titulo={t.guia.titulo}>
      <GuiaFiji />
    </Pantalla>
  );
}
