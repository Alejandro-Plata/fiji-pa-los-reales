/** Resumen legible de una receteta, en frases cortas (spec §5, Resultado). */
import { t } from '../../textos/es';
import { mostrarNumero as n } from './numeros';
import type { Receteta } from './tipos';

export function resumirReceteta(r: Receteta): string[] {
  const tx = t.resumen;
  const frases: string[] = [];
  const img = r.imagenes;

  if (r.tipo !== 'western') {
    const formatos = img.extensiones.includes('*') ? tx.todas : img.extensiones.join(', ');
    const escala =
      img.escala.modo === 'manual' ? tx.escalaManual(n(img.escala.micrasPorPixel)) : tx.escalaArchivo;
    frases.push(`${tx.formatos(formatos)}, ${escala}, ${tx.proyeccion[img.proyeccionZ]}.`);
  }

  if (r.tipo === 'esferas') {
    const p = r.parametros;
    frases.push(`${capital(tx.canal(p.canal))}.`);
    frases.push(
      (p.metodo === 'bordes'
        ? tx.bordes(n(p.suavizado), n(p.radioBordes))
        : tx.contraste(p.metodoUmbral, p.restarFondo.activo ? n(p.restarFondo.radio) : null)) + '.',
    );
    frases.push(`${capital(tx.limpieza(p.rellenarHuecos, p.limpiarRuido, p.separarTocandose))}.`);
    frases.push(
      tx.tamano(
        n(p.diametroMin),
        p.diametroMax === null ? null : n(p.diametroMax),
        n(p.circularidadMin),
        p.excluirBordes,
      ) + '.',
    );
    frases.push(
      (p.celulasSembradas ? tx.sfe(n(p.celulasSembradas)) : tx.sinSfe) + '.',
    );
  }

  if (r.tipo === 'fluorescencia') {
    const p = r.parametros;
    frases.push(
      (p.deteccion === 'umbral'
        ? tx.nucleosUmbral(p.canalNucleos, p.metodoUmbral, p.separarNucleos)
        : tx.nucleosStardist(
            p.canalNucleos,
            n(p.probabilidadStardist),
            n(p.solapamientoStardist),
          )) + '.',
    );
    frases.push(tx.fondoFluo(p.restarFondoRadio > 0 ? n(p.restarFondoRadio) : null) + '.');
    frases.push(tx.areaNucleos(n(p.areaNucleoMin), n(p.areaNucleoMax), p.excluirBordes) + '.');
    if (p.marcadores.length === 0) frases.push(tx.sinMarcadores + '.');
    for (const m of p.marcadores) {
      frases.push(
        tx.marcador(m.nombre, m.canal, m.umbralPositivo === null ? null : n(m.umbralPositivo)) + '.',
      );
    }
    frases.push(tx.medida[p.medida] + '.');
  }

  if (r.tipo === 'western') {
    const p = r.parametros;
    frases.push((p.bandasOscuras ? tx.westernOscuras : tx.westernClaras) + '.');
    frases.push(tx.westernFondo(p.fondo === 'rollingBall' ? n(p.radioFondo) : null) + '.');
    frases.push(tx.westernSaturacion(p.avisarSaturacion) + '.');
    frases.push(tx.westernProteina(p.nombreProteina) + '.');
    frases.push(tx.westernColumna + '.');
  }

  return frases;
}

function capital(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
