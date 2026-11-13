import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function Ajustes() {
  return (
    <Pantalla titulo={t.pantallas.ajustes.titulo}>
      <p>{t.provisional.enConstruccion}</p>
      <p className="caption texto-suave">{t.app.version(__VERSION_APP__)}</p>
    </Pantalla>
  );
}
