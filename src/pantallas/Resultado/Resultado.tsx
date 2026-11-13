import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function Resultado() {
  return (
    <Pantalla titulo={t.pantallas.resultado.titulo}>
      <p>{t.provisional.enConstruccion}</p>
    </Pantalla>
  );
}
