/**
 * generarMetodos(): párrafo de Materiales y Métodos (spec §12). Función pura.
 * - Solo menciona los pasos activos, en el mismo orden que el macro.
 * - Números con la convención del idioma: coma en español (0,4), punto en inglés (0.4).
 * - Entre corchetes lo que la app no sabe: [versión de Fiji], [aumento del objetivo]…
 * Referencias verificadas:
 *   Schindelin J. et al. (2012) Fiji: an open-source platform for biological-image analysis.
 *     Nature Methods 9(7):676–682. doi:10.1038/nmeth.2019
 *   Schmidt U., Weigert M., Broaddus C., Myers G. (2018) Cell Detection with Star-Convex
 *     Polygons. MICCAI 2018, LNCS 11071:265–273. doi:10.1007/978-3-030-00934-2_30
 */
import type { Receteta } from '../recetetas/tipos';
import { metodosEsferas } from './esferas';
import { metodosFluorescencia } from './fluorescencia';
import { metodosWestern } from './western';

export type Idioma = 'es' | 'en';

export const REFERENCIAS = {
  fiji: {
    es: 'Schindelin, J. et al. (2012). Fiji: an open-source platform for biological-image analysis. Nature Methods, 9(7), 676–682. https://doi.org/10.1038/nmeth.2019',
    en: 'Schindelin, J. et al. (2012). Fiji: an open-source platform for biological-image analysis. Nature Methods, 9(7), 676–682. https://doi.org/10.1038/nmeth.2019',
  },
  stardist: {
    es: 'Schmidt, U., Weigert, M., Broaddus, C. y Myers, G. (2018). Cell Detection with Star-Convex Polygons. MICCAI 2018, LNCS 11071, 265–273. https://doi.org/10.1007/978-3-030-00934-2_30',
    en: 'Schmidt, U., Weigert, M., Broaddus, C. and Myers, G. (2018). Cell Detection with Star-Convex Polygons. MICCAI 2018, LNCS 11071, 265–273. https://doi.org/10.1007/978-3-030-00934-2_30',
  },
} as const;

export interface TextoMetodos {
  parrafo: string;
  referencias: string[];
}

export function generarMetodos(r: Receteta, idioma: Idioma): TextoMetodos {
  switch (r.tipo) {
    case 'esferas':
      return metodosEsferas(r, idioma);
    case 'fluorescencia':
      return metodosFluorescencia(r, idioma);
    case 'western':
      return metodosWestern(r, idioma);
  }
}
