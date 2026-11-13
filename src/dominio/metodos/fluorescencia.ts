import type { RecetetaDe } from '../recetetas/tipos';
import { REFERENCIAS, type Idioma, type TextoMetodos } from './index';
import { lista, n } from './formato';

/** Debe describir exactamente lo que hace macros/fluorescencia.ts. */
export function metodosFluorescencia(
  r: RecetetaDe<'fluorescencia'>,
  idioma: Idioma,
): TextoMetodos {
  const p = r.parametros;
  const es = idioma === 'es';
  const f: string[] = [];
  const stardist = p.deteccion === 'stardist';

  f.push(
    es
      ? 'Las imágenes de inmunofluorescencia se analizaron en Fiji ([versión de Fiji]; Schindelin et al., 2012) mediante un macro personalizado aplicado por igual a todas las condiciones.'
      : 'Immunofluorescence images were analysed in Fiji ([Fiji version]; Schindelin et al., 2012) using a custom macro applied identically to all conditions.',
  );
  if (r.imagenes.escala.modo === 'manual') {
    const e = n(r.imagenes.escala.micrasPorPixel, idioma);
    f.push(
      es
        ? `La escala espacial se fijó en ${e} µm/píxel ([aumento del objetivo]).`
        : `Spatial calibration was set to ${e} µm/pixel ([objective magnification]).`,
    );
  }
  if (r.imagenes.proyeccionZ !== 'ninguna') {
    const tipo =
      r.imagenes.proyeccionZ === 'maxima'
        ? es
          ? 'máxima intensidad'
          : 'maximum-intensity'
        : es
          ? 'intensidad media'
          : 'average-intensity';
    f.push(
      es
        ? `Las pilas Z, cuando las hubo, se combinaron mediante proyección de ${tipo}.`
        : `Z-stacks, when present, were combined by ${tipo} projection.`,
    );
  }
  if (p.restarFondoRadio > 0) {
    const rad = n(p.restarFondoRadio, idioma);
    f.push(
      es
        ? `Se restó el fondo de cada canal con el algoritmo rolling ball (radio = ${rad} píxeles).`
        : `Background was subtracted from each channel with the rolling-ball algorithm (radius = ${rad} pixels).`,
    );
  }

  const canal = p.canalNucleos;
  if (stardist) {
    f.push(
      es
        ? `Los núcleos se segmentaron en el canal ${canal} ([tinción nuclear]) con StarDist (Schmidt et al., 2018) y el modelo preentrenado «Versatile (fluorescent nuclei)» (umbral de probabilidad = ${n(p.probabilidadStardist, idioma)}; umbral de solapamiento = ${n(p.solapamientoStardist, idioma)}).`
        : `Nuclei were segmented in channel ${canal} ([nuclear stain]) with StarDist (Schmidt et al., 2018) using the pretrained "Versatile (fluorescent nuclei)" model (probability threshold = ${n(p.probabilidadStardist, idioma)}; overlap threshold = ${n(p.solapamientoStardist, idioma)}).`,
    );
  } else {
    f.push(
      es
        ? `Los núcleos se segmentaron en el canal ${canal} ([tinción nuclear]) tras un suavizado gaussiano (σ = 1 píxel) mediante un umbral automático por el método de ${p.metodoUmbral}; las máscaras se rellenaron${p.separarNucleos ? ' y los núcleos en contacto se separaron mediante watershed' : ''}.`
        : `Nuclei were segmented in channel ${canal} ([nuclear stain]) after Gaussian smoothing (σ = 1 pixel) by automatic ${p.metodoUmbral} thresholding; masks were hole-filled${p.separarNucleos ? ' and touching nuclei were separated by watershed segmentation' : ''}.`,
    );
  }
  f.push(
    es
      ? `Se consideraron núcleos los objetos con un área de entre ${n(p.areaNucleoMin, idioma)} y ${n(p.areaNucleoMax, idioma)} µm²${p.excluirBordes ? ', excluyendo los que tocaban el borde de la imagen' : ''}.`
      : `Objects with an area between ${n(p.areaNucleoMin, idioma)} and ${n(p.areaNucleoMax, idioma)} µm² were considered nuclei${p.excluirBordes ? ', excluding those touching the image border' : ''}.`,
  );

  if (p.marcadores.length) {
    const medida =
      p.medida === 'media'
        ? es
          ? 'la intensidad media'
          : 'the mean intensity'
        : es
          ? 'la intensidad integrada'
          : 'the integrated intensity';
    const marcadores = p.marcadores.map((m) =>
      es ? `${m.nombre} (canal ${m.canal})` : `${m.nombre} (channel ${m.canal})`,
    );
    f.push(
      es
        ? `En cada núcleo se midió ${medida} de ${lista(marcadores, idioma)}.`
        : `For each nucleus, ${medida} of ${lista(marcadores, idioma)} was measured.`,
    );
    const conUmbral = p.marcadores.filter((m) => m.umbralPositivo !== null);
    for (const m of conUmbral) {
      const u = n(m.umbralPositivo!, idioma);
      f.push(
        es
          ? `Las células se consideraron positivas para ${m.nombre} cuando la intensidad superó ${u} (unidades arbitrarias), umbral establecido con controles negativos ([control negativo]) analizados con el mismo macro y las mismas condiciones de adquisición.`
          : `Cells were considered ${m.nombre}-positive when the intensity exceeded ${u} (arbitrary units), a threshold set using negative controls ([negative control]) analysed with the same macro and identical acquisition settings.`,
      );
    }
    if (conUmbral.length) {
      f.push(
        es
          ? 'El porcentaje de células positivas se calculó como el número de núcleos positivos dividido entre el número total de núcleos × 100.'
          : 'The percentage of positive cells was calculated as the number of positive nuclei divided by the total number of nuclei × 100.',
      );
    }
    if (conUmbral.length < p.marcadores.length) {
      f.push(
        es
          ? 'Las intensidades por núcleo se exportaron para establecer el umbral de positividad a partir de los controles negativos.'
          : 'Per-nucleus intensities were exported to set the positivity threshold from the negative controls.',
      );
    }
  }

  const refs: string[] = [REFERENCIAS.fiji[idioma]];
  if (stardist) refs.push(REFERENCIAS.stardist[idioma]);
  return { parrafo: f.join(' '), referencias: refs };
}
