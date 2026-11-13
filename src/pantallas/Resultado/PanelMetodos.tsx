import { useState } from 'react';
import { Boton } from '../../componentes/Boton/Boton';
import { Dialogo } from '../../componentes/Dialogo/Dialogo';
import { Nota } from '../../componentes/Nota/Nota';
import { useAvisos } from '../../app/Avisos';
import { copiarTexto } from '../../app/plataforma';
import { leerAjustes } from '../../dominio/recetetas/almacenamiento';
import { generarMetodos, type Idioma } from '../../dominio/metodos';
import type { Receteta } from '../../dominio/recetetas/tipos';
import { t } from '../../textos/es';
import estilos from './Resultado.module.css';

/** Texto para Materiales y Métodos (spec §12): Copiar, Cambiar idioma y nota. */
export function PanelMetodos({
  receteta,
  abierto,
  onCerrar,
}: {
  receteta: Receteta;
  abierto: boolean;
  onCerrar: () => void;
}) {
  const tx = t.metodos;
  const avisar = useAvisos();
  const [idioma, setIdioma] = useState<Idioma>(() => leerAjustes().idiomaMetodos);
  const { parrafo, referencias } = generarMetodos(receteta, idioma);
  const textoCompleto = `${parrafo}\n\n${referencias.join('\n')}`;

  const copiar = async () =>
    avisar((await copiarTexto(textoCompleto)) ? tx.copiado : tx.noCopiado);

  return (
    <Dialogo
      abierto={abierto}
      amplio
      titulo={`${tx.titulo} · ${tx.idioma[idioma]}`}
      onCerrar={onCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            {t.app.cerrar}
          </Boton>
          <Boton variante="secundario" onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}>
            {tx.cambiarIdioma}
          </Boton>
          <Boton onClick={() => void copiar()}>{tx.copiar}</Boton>
        </>
      }
    >
      <Nota tipo="aviso">
        <p>{tx.nota}</p>
        <p>{tx.corchetes}</p>
      </Nota>
      <p className={estilos.metodos} lang={idioma} aria-label={tx.texto}>
        {parrafo}
      </p>
      <h3 className={estilos.subtitulo}>{tx.referencias}</h3>
      <ul className={estilos.frases} lang="en">
        {referencias.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </Dialogo>
  );
}
