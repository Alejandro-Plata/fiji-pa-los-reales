/**
 * Macro semiinteractivo de western blot (spec §10): la usuaria marca las bandas y el macro
 * comprueba la saturación, corrige, mide, numera los carriles y guarda.
 * Variante de prueba: con argumento "imagen|rois.zip|carpeta_salida" no espera a la usuaria.
 */
import type { RecetetaDe } from '../recetetas/tipos';
import { cabecera, type Contexto, NOMBRE_APP } from './comun';
import { cadena, num, texto } from './formato';
import { nombreColumna } from './fluorescencia';

export function macroWestern(r: RecetetaDe<'western'>, ctx: Contexto): string {
  const p = r.parametros;
  const proteina = p.nombreProteina ? nombreColumna(p.nombreProteina, 0) : '';
  const sufijo = proteina ? `_${proteina}` : '';

  const l: string[] = [
    ...cabecera(r, ctx),
    '// --- 1. Imagen: la elige la usuaria (o llega por argumento en las pruebas)',
    'run("Close All");',
    '// El gestor de ROI se reinicia ANTES del modo silencioso (si no, Fiji crea otro gestor aparte)',
    'roiManager("reset");',
    'args = getArgument();',
    'modoPrueba = (args != "");',
    'if (modoPrueba) {',
    '    partes = split(args, "|");',
    '    ruta = partes[0];',
    '    rutaRois = partes[1];',
    '    dirSalida = partes[2];',
    '    if (!endsWith(dirSalida, File.separator)) dirSalida = dirSalida + File.separator;',
    '    setBatchMode(true);',
    '} else {',
    `    ruta = File.openDialog(${texto('Imagen del western blot (TIFF)')});`,
    '    dirSalida = File.getDirectory(ruta);',
    '}',
    'open(ruta);',
    'base = File.getNameWithoutExtension(ruta);',
    'idImagen = getImageID();',
    '',
    '// Una imagen RGB (JPG o captura de pantalla) no sirve para cuantificar: avisamos',
    'if (bitDepth() == 24) {',
    `    aviso = ${texto('La imagen es RGB (JPG o captura). La cuantificación no es fiable: se requiere el TIFF original del equipo.')};`,
    '    print(aviso);',
    `    if (!modoPrueba) showMessage(${texto('Atención')}, aviso);`,
    '    run("8-bit");',
    '}',
    'run("Set Measurements...", "area mean min integrated display redirect=None decimal=3");',
    '',
  ];

  if (p.avisarSaturacion) {
    l.push(
      '// --- 2. Comprobamos si hay píxeles saturados (negro puro o blanco puro)',
      'getRawStatistics(nPix, media, minimo, maximo);',
      'maxPosible = pow(2, bitDepth()) - 1;',
      'if (bitDepth() != 32) {',
      '    if (minimo == 0 || maximo == maxPosible) {',
      `        aviso = ${texto('La imagen tiene píxeles saturados.\nLa cuantificación de esas bandas puede no ser fiable: se recomienda una exposición más corta.')};`,
      `        print(${texto('AVISO: ')} + aviso);`,
      `        if (!modoPrueba) showMessage(${texto('Atención')}, aviso);`,
      '    }',
      '}',
      '',
    );
  }

  l.push(
    '// Copia sin procesar para la imagen de control',
    'run("Duplicate...", "title=control");',
    'idControl = getImageID();',
    'selectImage(idImagen);',
    '',
  );
  if (p.bandasOscuras) {
    l.push(
      '// --- 3. Bandas oscuras sobre fondo claro: invertimos para que más señal = valor más alto',
      'run("Invert");',
    );
  }
  if (p.fondo === 'rollingBall') {
    l.push(
      `// Restamos el fondo de la membrana (radio ${num(p.radioFondo)} px, mayor que la altura de una banda)`,
      `run("Subtract Background...", "rolling=${num(p.radioFondo)}");`,
    );
  }
  l.push(
    '',
    '// --- 4. La usuaria marca las bandas con el MISMO rectángulo',
    'if (modoPrueba) {',
    '    roiManager("Open", rutaRois);',
    '} else {',
    '    setTool("rectangle");',
    `    waitForUser(${texto('Selección de bandas')},`,
    `        ${texto('1. Dibujar un rectángulo que abarque la banda más grande.\n')} +`,
    `        ${texto('2. Tecla T para añadirla a la lista.\n')} +`,
    `        ${texto('3. Desplazar el MISMO rectángulo a la siguiente banda y pulsar T.\n')} +`,
    `        ${texto('4. Repetir de izquierda a derecha.\n')} +`,
    `        ${texto('5. Al terminar, pulsar OK.')});`,
    '}',
    'n = roiManager("count");',
    `if (n == 0) exit(${texto('No has marcado ninguna banda.')});`,
    '',
    '// --- 5. Medimos y numeramos los carriles en el orden en que se marcaron',
    '// (ROI a ROI: Measure añade siempre una fila al final)',
    'selectImage(idImagen);',
    'rename(base);',
    'run("Clear Results");',
    'for (k = 0; k < n; k++) {',
    '    roiManager("select", k);',
    '    run("Measure");',
    '    setResult("Carril", nResults - 1, k + 1);',
    '}',
    'run("Select None");',
    'updateResults();',
    `saveAs("Results", dirSalida + base + ${cadena(`${sufijo}_bandas.csv`)});`,
    `roiManager("Save", dirSalida + base + ${cadena(`${sufijo}_bandas.zip`)});`,
    '',
    '// Imagen de control con los rectángulos numerados sobre la imagen original',
    'selectImage(idControl);',
    'roiManager("Deselect");',
    'roiManager("Set Color", "yellow");',
    'roiManager("Set Line Width", 2);',
    'run("From ROI Manager");',
    'Overlay.drawLabels(true);',
    'run("Flatten");',
    `saveAs("Jpeg", dirSalida + base + ${cadena(`${sufijo}_control.jpg`)});`,
    '',
    '// La expresión empieza por "" : si empieza por un número, IJ1 no concatena y da NaN',
    `mensaje = "" + n + ${texto(' bandas medidas. Valor de referencia: columna RawIntDen.\nResultados junto a la imagen original.')};`,
    'print(mensaje);',
    'if (modoPrueba) {',
    '    setBatchMode(false);',
    '    selectWindow("Log");',
    '    saveAs("Text", dirSalida + "log.txt");',
    '} else {',
    `    showMessage(${cadena(NOMBRE_APP)}, mensaje);`,
    '}',
    '',
  );
  return l.join('\n');
}
