import { BotonEnlace } from '../../componentes/Boton/Boton';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function NoEncontrada() {
  return (
    <Pantalla titulo={t.pantallas.noEncontrada.titulo}>
      <div>
        <BotonEnlace to="/">{t.pantallas.noEncontrada.volver}</BotonEnlace>
      </div>
    </Pantalla>
  );
}
