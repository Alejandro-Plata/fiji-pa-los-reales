/** Macro de mamosferas en campo claro (spec §8). */
import type { RecetetaDe } from '../recetetas/tipos';
import { bloqueCanalYProyeccion, macroLote, sangrar, type Contexto } from './comun';
import { areaDesdeDiametro, num, texto } from './formato';

export function macroEsferas(r: RecetetaDe<'esferas'>, ctx: Contexto): string {
  const p = r.parametros;
  const subcarpetas = [p.salidas.control ? 'control' : '', p.salidas.rois ? 'rois' : ''].filter(
    Boolean,
  );
  return macroLote(r, ctx, {
    subcarpetas,
    // Sin medidas de intensidad: se medirían sobre la máscara (siempre 255) y confundirían
    medidas: "area centroid perimeter shape feret's display redirect=None decimal=3",
    guardarObjetos: p.salidas.objetos,
    guardarResumen: p.salidas.resumen,
    funcionAnalizar: funcionAnalizar(r),
  });
}

function funcionAnalizar(r: RecetetaDe<'esferas'>): string[] {
  const p = r.parametros;
  const areaMin = num(areaDesdeDiametro(p.diametroMin), 2);
  const areaMax = p.diametroMax === null ? 'Infinity' : num(areaDesdeDiametro(p.diametroMax), 2);
  const circ = num(p.circularidadMin, 2);
  const umbral = p.metodoUmbral;

  const deteccion =
    p.metodo === 'bordes'
      ? [
          '// Buscamos los contornos de las esferas (método «por bordes»)',
          ...(p.suavizado > 0
            ? [
                '// Suavizamos un poco para que el ruido no se confunda con esferas',
                `run("Gaussian Blur...", "sigma=${num(p.suavizado)}");`,
              ]
            : []),
          '// El filtro de varianza resalta los bordes: el halo de cada esfera se vuelve brillante',
          'run("32-bit");',
          `run("Variance...", "radius=${num(p.radioBordes)}");`,
          `setAutoThreshold("${umbral} dark");`,
          'run("Convert to Mask");',
        ]
      : [
          '// Separamos las esferas (oscuras) del fondo (claro) (método «por contraste»)',
          ...(p.restarFondo.activo
            ? [
                '// Quitamos el fondo irregular de la iluminación',
                `run("Subtract Background...", "rolling=${num(p.restarFondo.radio)} light");`,
              ]
            : []),
          ...(p.suavizado > 0
            ? [
                '// Suavizamos un poco para que el ruido no se confunda con esferas',
                `run("Gaussian Blur...", "sigma=${num(p.suavizado)}");`,
              ]
            : []),
          '// Umbral automático sin «dark»: los objetos son los píxeles oscuros',
          `setAutoThreshold("${umbral}");`,
          'run("Convert to Mask");',
        ];

  const limpieza = [
    ...(p.rellenarHuecos || p.limpiarRuido || p.separarTocandose ? ['// Limpiamos la máscara'] : []),
    ...(p.rellenarHuecos ? ['run("Fill Holes");            // rellenamos el interior de las esferas'] : []),
    ...(p.limpiarRuido ? ['run("Open");                  // quitamos puntitos y bordes finos sueltos'] : []),
    ...(p.separarTocandose ? ['run("Watershed");             // separamos esferas pegadas'] : []),
  ];

  const descripcionTamano =
    `diámetro mínimo ${num(p.diametroMin)} µm (área ${areaMin} µm²)` +
    (p.diametroMax === null ? '' : `, máximo ${num(p.diametroMax)} µm (área ${areaMax} µm²)`) +
    `, circularidad >= ${circ}`;

  const cuerpo = [
    'base = File.getNameWithoutExtension(nombre);',
    'idOriginal = getImageID();',
    '',
    ...bloqueCanalYProyeccion(p.canal, r.imagenes.proyeccionZ),
    '',
    '// Copia para la imagen de control, antes de procesar',
    'run("Duplicate...", "title=control");',
    'idControl = getImageID();',
    '',
    '// Copia de trabajo: le damos el nombre del archivo para que aparezca en la tabla',
    'selectImage(idTrabajo);',
    'rename(base);',
    'run("8-bit");',
    '',
    ...deteccion,
    '',
    ...limpieza,
    ...(limpieza.length ? [''] : []),
    `// Contamos y medimos: ${descripcionTamano}`,
    'inicio = nResults;',
    'roiManager("reset");',
    `run("Analyze Particles...", "size=${areaMin}-${areaMax} circularity=${circ}-1.00 show=Nothing display${
      p.excluirBordes ? ' exclude' : ''
    } add");`,
    'n = nResults - inicio;',
    '',
    '// Resumen de esta imagen (el diámetro es el de Feret, en micras)',
    'sumaDiam = 0;',
    'sumaArea = 0;',
    'for (j = inicio; j < nResults; j++) {',
    '    sumaDiam = sumaDiam + getResult("Feret", j);',
    '    sumaArea = sumaArea + getResult("Area", j);',
    '}',
    'Table.set("Imagen", fila, base, "Resumen");',
    'Table.set("Esferas", fila, n, "Resumen");',
    'if (n > 0) {',
    '    Table.set("Diametro_medio_um", fila, sumaDiam / n, "Resumen");',
    '    Table.set("Area_media_um2", fila, sumaArea / n, "Resumen");',
    '} else {',
    '    Table.set("Diametro_medio_um", fila, 0, "Resumen");',
    '    Table.set("Area_media_um2", fila, 0, "Resumen");',
    '}',
    ...(p.celulasSembradas
      ? [
          `// Eficiencia de formación de esferas: esferas / células sembradas (${num(p.celulasSembradas)}) × 100`,
          `Table.set("SFE_porcentaje", fila, n / ${num(p.celulasSembradas)} * 100, "Resumen");`,
        ]
      : []),
    'fila++;',
    `print(${texto('  Esferas: ')} + n);`,
  ];

  if (p.salidas.rois) {
    cuerpo.push(
      '',
      '// Guardamos las selecciones para revisarlas o corregirlas a mano en Fiji',
      'if (n > 0) roiManager("Save", dirSalida + "rois" + File.separator + base + ".zip");',
    );
  }
  if (p.salidas.control) {
    cuerpo.push(
      '',
      '// Imagen de control: la original con las esferas detectadas en amarillo',
      'selectImage(idControl);',
      'if (n > 0) {',
      '    roiManager("Deselect");',
      '    roiManager("Set Color", "yellow");',
      '    roiManager("Set Line Width", 2);',
      '    run("From ROI Manager");',
      '}',
      'run("Flatten");',
      'saveAs("Jpeg", dirSalida + "control" + File.separator + base + "_control.jpg");',
    );
  }
  cuerpo.push('return true;');

  return [
    '// Analiza una imagen: detecta, mide y cuenta las esferas',
    'function analizar(nombre) {',
    ...sangrar(cuerpo),
    '}',
  ];
}
