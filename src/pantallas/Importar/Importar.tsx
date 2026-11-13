import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function Importar() {
  return (
    <Pantalla titulo={t.pantallas.importar.titulo}>
      <p>{t.provisional.enConstruccion}</p>
    </Pantalla>
  );
}
