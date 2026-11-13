import { describe, expect, it } from 'vitest';
import { generarMetodos } from './index';
import { desdeCompartida } from '../recetetas/crear';
import { PLANTILLAS, plantillaPorClave } from '../recetetas/plantillas';
import type { Receteta, RecetetaDe } from '../recetetas/tipos';

function de(clave: string): Receteta {
  return desdeCompartida(plantillaPorClave(clave)!.receteta, 'plantilla');
}

describe('texto de Métodos', () => {
  const campoClaro = de('mamosferas-campo-claro') as RecetetaDe<'esferas'>;
  campoClaro.parametros.celulasSembradas = 1000;

  it('reproduce el ejemplo de la spec en español', () => {
    expect(generarMetodos(campoClaro, 'es').parrafo).toBe(
      'Las imágenes de mamosferas se analizaron en Fiji ([versión de Fiji]; Schindelin et al., 2012) mediante un macro personalizado aplicado por igual a todas las condiciones. Las imágenes se convirtieron a 8 bits y se suavizaron con un filtro gaussiano (σ = 2 píxeles). Los contornos de las esferas se detectaron con un filtro de varianza (radio = 4 píxeles) seguido de un umbral automático por el método de Otsu; las máscaras resultantes se rellenaron y se depuraron mediante una apertura morfológica. Se consideraron esferas los objetos con un diámetro equivalente ≥ 50 µm y una circularidad ≥ 0,4, excluyendo los que tocaban el borde de la imagen. La eficiencia de formación de esferas (SFE) se calculó como el número de esferas dividido entre el número de células sembradas (1000 por pocillo) × 100.',
    );
  });

  it('reproduce el ejemplo de la spec en inglés', () => {
    expect(generarMetodos(campoClaro, 'en').parrafo).toBe(
      'Mammosphere images were analysed in Fiji ([Fiji version]; Schindelin et al., 2012) using a custom macro applied identically to all conditions. Images were converted to 8-bit and smoothed with a Gaussian filter (σ = 2 pixels). Sphere outlines were detected with a variance filter (radius = 4 pixels) followed by automatic Otsu thresholding; the resulting masks were hole-filled and cleaned by morphological opening. Objects with an equivalent diameter ≥ 50 µm and circularity ≥ 0.4 were scored as spheres, excluding those touching the image border. Sphere-forming efficiency (SFE) was calculated as the number of spheres divided by the number of seeded cells (1,000 per well) × 100.',
    );
  });

  it('coma decimal en español y punto en inglés', () => {
    const r = de('mamosferas-campo-claro') as RecetetaDe<'esferas'>;
    r.imagenes.escala = { modo: 'manual', micrasPorPixel: 0.65 };
    r.parametros.circularidadMin = 0.55;
    expect(generarMetodos(r, 'es').parrafo).toContain('0,65 µm/píxel ([aumento del objetivo])');
    expect(generarMetodos(r, 'es').parrafo).toContain('circularidad ≥ 0,55');
    expect(generarMetodos(r, 'en').parrafo).toContain('0.65 µm/pixel');
    expect(generarMetodos(r, 'en').parrafo).toContain('circularity ≥ 0.55');
  });

  it('solo menciona los pasos activos', () => {
    const r = de('mamosferas-contraste') as RecetetaDe<'esferas'>;
    r.parametros.limpiarRuido = false;
    r.parametros.rellenarHuecos = false;
    const t = generarMetodos(r, 'es').parrafo;
    expect(t).not.toContain('apertura');
    expect(t).not.toContain('SFE');
    expect(t).toContain('rolling ball (radio = 50 píxeles)');
  });

  it('cita StarDist solo cuando se usa', () => {
    const umbral = generarMetodos(de('nucleos-dapi-marcador'), 'es');
    const sd = generarMetodos(de('nucleos-stardist'), 'es');
    expect(umbral.referencias).toHaveLength(1);
    expect(sd.parrafo).toContain('StarDist (Schmidt et al., 2018)');
    expect(sd.referencias[1]).toContain('Cell Detection with Star-Convex Polygons');
  });

  it('western: RawIntDen y marcador de proteína pendiente', () => {
    const t = generarMetodos(de('western-densitometria'), 'es').parrafo;
    expect(t).toContain('RawIntDen');
    expect(t).toContain('[proteína]');
  });

  it('instantáneas de todas las plantillas en los dos idiomas', () => {
    for (const p of PLANTILLAS) {
      for (const idioma of ['es', 'en'] as const) {
        expect(
          generarMetodos(desdeCompartida(p.receteta, 'plantilla'), idioma),
        ).toMatchSnapshot(`${p.clave}-${idioma}`);
      }
    }
  });
});
