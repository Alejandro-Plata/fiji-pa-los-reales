import { useParams } from 'react-router-dom';
import { Boton } from '../../componentes/Boton/Boton';
import { BarraInferior } from '../../componentes/BarraInferior/BarraInferior';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { t } from '../../textos/es';

export function Asistente() {
  const { id } = useParams();
  const titulo = id ? t.pantallas.asistente.titulo : t.pantallas.asistente.tituloNueva;
  return (
    <Pantalla titulo={titulo}>
      <p>{t.provisional.enConstruccion}</p>
      <BarraInferior>
        <Boton variante="secundario" disabled>
          {t.barraInferior.atras}
        </Boton>
        <Boton variante="primario" disabled>
          {t.barraInferior.siguiente}
        </Boton>
      </BarraInferior>
    </Pantalla>
  );
}
