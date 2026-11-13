import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function Rapido() {
  return (
    <Pantalla titulo={t.pantallas.rapido.titulo}>
      <p>{t.provisional.enConstruccion}</p>
    </Pantalla>
  );
}
