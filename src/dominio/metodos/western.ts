import type { RecetetaDe } from '../recetetas/tipos';
import { REFERENCIAS, type Idioma, type TextoMetodos } from './index';
import { n } from './formato';

/** Debe describir exactamente lo que hace macros/western.ts. */
export function metodosWestern(r: RecetetaDe<'western'>, idioma: Idioma): TextoMetodos {
  const p = r.parametros;
  const es = idioma === 'es';
  const proteina = p.nombreProteina || (es ? '[proteína]' : '[protein]');
  const f: string[] = [];

  f.push(
    es
      ? 'Las bandas de western blot se cuantificaron por densitometría en Fiji ([versión de Fiji]; Schindelin et al., 2012) mediante un macro personalizado, a partir de las imágenes originales del equipo de adquisición en formato TIFF ([profundidad de bits]).'
      : 'Western blot bands were quantified by densitometry in Fiji ([Fiji version]; Schindelin et al., 2012) using a custom macro, from the original TIFF images exported by the acquisition system ([bit depth]).',
  );
  if (p.avisarSaturacion) {
    f.push(
      es
        ? 'Se comprobó la ausencia de píxeles saturados antes de la cuantificación.'
        : 'The absence of saturated pixels was verified before quantification.',
    );
  }
  const pasos: string[] = [];
  if (p.bandasOscuras) {
    pasos.push(
      es
        ? 'se invirtieron para que una mayor señal correspondiera a valores más altos'
        : 'were inverted so that higher signal corresponded to higher values',
    );
  }
  if (p.fondo === 'rollingBall') {
    pasos.push(
      es
        ? `se les restó el fondo con el algoritmo rolling ball (radio = ${n(p.radioFondo, idioma)} píxeles)`
        : `were background-subtracted with the rolling-ball algorithm (radius = ${n(p.radioFondo, idioma)} pixels)`,
    );
  }
  if (pasos.length) {
    f.push(es ? `Las imágenes ${pasos.join(' y ')}.` : `Images ${pasos.join(' and ')}.`);
  }
  f.push(
    es
      ? 'Cada banda se delimitó manualmente con un rectángulo de tamaño idéntico para todos los carriles y se midió su densidad integrada (RawIntDen).'
      : 'Each band was manually enclosed with a rectangle of identical size for all lanes, and its integrated density (RawIntDen) was measured.',
  );
  f.push(
    es
      ? `La señal de ${proteina} se normalizó respecto al control de carga ([control de carga]) y, después, respecto a la condición control.`
      : `${proteina} signal was normalised to the loading control ([loading control]) and then to the control condition.`,
  );
  return { parrafo: f.join(' '), referencias: [REFERENCIAS.fiji[idioma]] };
}
