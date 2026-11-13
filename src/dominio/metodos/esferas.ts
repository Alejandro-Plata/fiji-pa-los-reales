import type { RecetetaDe } from '../recetetas/tipos';
import { REFERENCIAS, type Idioma, type TextoMetodos } from './index';
import { lista, n } from './formato';

export function metodosEsferas(r: RecetetaDe<'esferas'>, idioma: Idioma): TextoMetodos {
  const p = r.parametros;
  const es = idioma === 'es';
  const f: string[] = [];

  f.push(
    es
      ? 'Las imágenes de mamosferas se analizaron en Fiji ([versión de Fiji]; Schindelin et al., 2012) mediante un macro personalizado aplicado por igual a todas las condiciones.'
      : 'Mammosphere images were analysed in Fiji ([Fiji version]; Schindelin et al., 2012) using a custom macro applied identically to all conditions.',
  );

  if (r.imagenes.escala.modo === 'manual') {
    const e = n(r.imagenes.escala.micrasPorPixel, idioma);
    f.push(
      es
        ? `La escala espacial se fijó en ${e} µm/píxel ([aumento del objetivo]).`
        : `Spatial calibration was set to ${e} µm/pixel ([objective magnification]).`,
    );
  }
  if (p.canal > 1) {
    f.push(es ? `Se analizó el canal ${p.canal}.` : `Channel ${p.canal} was analysed.`);
  }

  // Preprocesado, en el orden del macro
  const pre: string[] = [];
  if (p.metodo === 'umbral' && p.restarFondo.activo) {
    pre.push(
      es
        ? `se les restó el fondo con el algoritmo rolling ball (radio = ${n(p.restarFondo.radio, idioma)} píxeles)`
        : `background-subtracted with the rolling-ball algorithm (radius = ${n(p.restarFondo.radio, idioma)} pixels)`,
    );
  }
  if (p.suavizado > 0) {
    pre.push(
      es
        ? `se suavizaron con un filtro gaussiano (σ = ${n(p.suavizado, idioma)} píxeles)`
        : `smoothed with a Gaussian filter (σ = ${n(p.suavizado, idioma)} pixels)`,
    );
  }
  f.push(
    es
      ? `Las imágenes se convirtieron a 8 bits${pre.length ? (pre.length === 1 ? ' y ' : ', ') + lista(pre, idioma) : ''}.`
      : `Images were converted to 8-bit${pre.length ? (pre.length === 1 ? ' and ' : ', ') + lista(pre, idioma) : ''}.`,
  );

  // Segmentación y limpieza de la máscara
  const deteccion =
    p.metodo === 'bordes'
      ? es
        ? `Los contornos de las esferas se detectaron con un filtro de varianza (radio = ${n(p.radioBordes, idioma)} píxeles) seguido de un umbral automático por el método de ${p.metodoUmbral}`
        : `Sphere outlines were detected with a variance filter (radius = ${n(p.radioBordes, idioma)} pixels) followed by automatic ${p.metodoUmbral} thresholding`
      : es
        ? `Las esferas se segmentaron mediante un umbral automático por el método de ${p.metodoUmbral}`
        : `Spheres were segmented by automatic ${p.metodoUmbral} thresholding`;

  const limpieza: string[] = [];
  if (p.rellenarHuecos) limpieza.push(es ? 'se rellenaron' : 'hole-filled');
  if (p.limpiarRuido) limpieza.push(es ? 'se depuraron mediante una apertura morfológica' : 'cleaned by morphological opening');
  let frase = deteccion;
  if (limpieza.length) {
    frase += es
      ? `; las máscaras resultantes ${lista(limpieza, idioma)}`
      : `; the resulting masks were ${lista(limpieza, idioma)}`;
  }
  if (p.separarTocandose) {
    frase += es
      ? ', y las esferas en contacto se separaron mediante watershed'
      : ', and touching spheres were separated by watershed segmentation';
  }
  f.push(frase + '.');

  // Criterios de recuento
  const diam =
    p.diametroMax === null
      ? es
        ? `un diámetro equivalente ≥ ${n(p.diametroMin, idioma)} µm`
        : `an equivalent diameter ≥ ${n(p.diametroMin, idioma)} µm`
      : es
        ? `un diámetro equivalente de entre ${n(p.diametroMin, idioma)} y ${n(p.diametroMax, idioma)} µm`
        : `an equivalent diameter between ${n(p.diametroMin, idioma)} and ${n(p.diametroMax, idioma)} µm`;
  const circ = n(p.circularidadMin, idioma);
  f.push(
    es
      ? `Se consideraron esferas los objetos con ${diam} y una circularidad ≥ ${circ}${p.excluirBordes ? ', excluyendo los que tocaban el borde de la imagen' : ''}.`
      : `Objects with ${diam} and circularity ≥ ${circ} were scored as spheres${p.excluirBordes ? ', excluding those touching the image border' : ''}.`,
  );

  if (p.celulasSembradas) {
    const c = n(p.celulasSembradas, idioma);
    f.push(
      es
        ? `La eficiencia de formación de esferas (SFE) se calculó como el número de esferas dividido entre el número de células sembradas (${c} por pocillo) × 100.`
        : `Sphere-forming efficiency (SFE) was calculated as the number of spheres divided by the number of seeded cells (${c} per well) × 100.`,
    );
  }

  return { parrafo: f.join(' '), referencias: [REFERENCIAS.fiji[idioma]] };
}
