import { useParams } from 'react-router-dom';
import { Pantalla } from '../../componentes/Pantalla/Pantalla';
import { Boton, BotonEnlace } from '../../componentes/Boton/Boton';
import { Nota } from '../../componentes/Nota/Nota';
import { useRecetetas } from '../../app/EstadoRecetetas';
import { useCompartirReceteta } from '../../app/useCompartirReceteta';
import { resumirReceteta } from '../../dominio/recetetas/resumen';
import { t } from '../../textos/es';

export function Resultado() {
  const { id = '' } = useParams();
  const { obtener } = useRecetetas();
  const { compartirReceteta, dialogo } = useCompartirReceteta();
  const r = obtener(id);

  if (!r) {
    return (
      <Pantalla titulo={t.pantallas.resultado.titulo}>
        <Nota tipo="error">{t.asistente.noEncontrada}</Nota>
        <div>
          <BotonEnlace to="/">{t.pantallas.noEncontrada.volver}</BotonEnlace>
        </div>
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo={r.nombre} eyebrow={t.tipos[r.tipo].nombre}>
      <ul>
        {resumirReceteta(r).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p>{t.provisional.enConstruccion}</p>
      <div className="fila">
        <BotonEnlace to={`/receteta/${r.id}`} variante="secundario">
          {t.inicio.abrir}
        </BotonEnlace>
        <Boton variante="secundario" onClick={() => void compartirReceteta(r)}>
          {t.inicio.compartir}
        </Boton>
      </div>
      {dialogo}
    </Pantalla>
  );
}
