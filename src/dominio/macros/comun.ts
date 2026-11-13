/**
 * Piezas comunes de los macros por lotes (spec §7): cabecera, carpetas, preparación,
 * bucle de archivos, abrir, escala y cierre.
 *
 * Comprobado en Fiji 1.54p (Windows):
 * - roiManager("reset") debe ir ANTES de setBatchMode(true). Si el gestor de ROI se crea dentro
 *   del modo silencioso, Analyze Particles añade las ROI a otro gestor y roiManager("count") da 0.
 * - Las cadenas con tildes se escriben con fromCharCode() (ver texto() en formato.ts).
 * - No se usa && con llamadas a funciones: se encadenan if para no depender de la evaluación.
 */
import type { Receteta } from '../recetetas/tipos';
import { EXTENSIONES } from '../recetetas/esquemas';
import { cadena, comentario, num, texto } from './formato';

export interface Contexto {
  versionApp: string;
  fecha: string; // AAAA-MM-DD
}

export const NOMBRE_APP = 'Fiji pa los reales';

const BIOFORMATS = ['.czi', '.lif', '.nd2', '.lsm', '.oib'];

const NOMBRE_TIPO: Record<Receteta['tipo'], string> = {
  esferas: 'mamosferas',
  fluorescencia: 'fluorescencia',
  western: 'western blot',
};

/** Indenta un bloque de líneas. */
export function sangrar(lineas: string[], nivel = 1): string[] {
  const s = '    '.repeat(nivel);
  return lineas.map((l) => (l === '' ? '' : s + l));
}

export function cabecera(r: Receteta, ctx: Contexto): string[] {
  const parametros = JSON.stringify({ imagenes: r.imagenes, parametros: r.parametros });
  return [
    '// ==============================================================',
    `// Receteta: ${comentario(r.nombre)}`,
    `// Tipo: ${NOMBRE_TIPO[r.tipo]} · ${NOMBRE_APP} v${ctx.versionApp} · ${ctx.fecha}`,
    `// Parámetros: ${comentario(parametros)}`,
    '// Cómo usarlo: en Fiji, File > New > Script..., menú Language > IJ1 Macro,',
    '// pega este texto y pulsa Run.',
    '// ==============================================================',
    'requires("1.54f");',
    '',
  ];
}

export interface PiezasLote {
  /** Declaraciones globales extra (además de dirSalida, fila y extensiones). */
  globales?: string[];
  /** Comprobaciones previas (plugins necesarios…), tras elegir carpetas. */
  comprobaciones?: string[];
  /** Subcarpetas de resultados. */
  subcarpetas: string[];
  /** Opciones de Analyze › Set Measurements. */
  medidas: string;
  /** true: objetos.csv sale de la tabla Results; 'tabla': de una tabla propia «Objetos». */
  guardarObjetos: boolean | 'tabla';
  guardarResumen: boolean;
  /** Líneas completas de `function analizar(nombre) { … }`; devuelve true si la imagen se analizó. */
  funcionAnalizar: string[];
}

export function macroLote(r: Receteta, ctx: Contexto, p: PiezasLote): string {
  const exts = r.imagenes.extensiones.includes('*') ? [...EXTENSIONES] : r.imagenes.extensiones;
  const usaBioformats = exts.some((e) => BIOFORMATS.includes(e));

  const l: string[] = [
    ...cabecera(r, ctx),
    '// Variables globales: se usan dentro de las funciones',
    'var dirSalida = "";',
    'var fila = 0;',
    'var extensiones;',
    ...(p.globales ?? []),
    '',
    '// --- 1. Carpetas: de dónde se leen las imágenes y dónde se guardan los resultados',
    'args = getArgument();',
    'if (args != "") {',
    '    partes = split(args, "|");',
    '    dirEntrada = partes[0];',
    '    dirSalida = partes[1];',
    '} else {',
    `    dirEntrada = getDirectory(${texto('Elige la carpeta con las imágenes')});`,
    `    dirSalida = getDirectory(${texto('Elige la carpeta donde guardar los resultados (vacía)')});`,
    '}',
    'if (!endsWith(dirEntrada, File.separator)) dirEntrada = dirEntrada + File.separator;',
    'if (!endsWith(dirSalida, File.separator)) dirSalida = dirSalida + File.separator;',
    `if (dirEntrada == dirSalida) exit(${texto('La carpeta de resultados debe ser distinta de la carpeta de imágenes.')});`,
    'File.makeDirectory(dirSalida);',
    ...p.subcarpetas.map((s) => `File.makeDirectory(dirSalida + ${cadena(s)});`),
    '',
  ];

  const comprobaciones = [...(p.comprobaciones ?? [])];
  if (usaBioformats) {
    comprobaciones.push(
      '// Los formatos de microscopio (.czi, .lif, .nd2…) se abren con Bio-Formats',
      'List.setCommands;',
      `if (List.get("Bio-Formats Importer") == "") exit(${texto(
        'Esta receteta necesita Bio-Formats para abrir tus archivos y no está instalado.\nEn Fiji: Help > Update... y acepta las actualizaciones.',
      )});`,
    );
  }
  if (comprobaciones.length) l.push(...comprobaciones, '');

  l.push(
    '// --- 2. Preparación: cerramos todo y elegimos las medidas',
    'run("Close All");',
    '// El gestor de ROI se reinicia ANTES del modo silencioso (si no, Fiji crea otro gestor aparte)',
    'roiManager("reset");',
    'run("Clear Results");',
    'print("\\\\Clear");',
    'setBatchMode(true);',
    'setOption("BlackBackground", true);',
    `run("Set Measurements...", ${cadena(p.medidas)});`,
    'Table.create("Resumen");',
    ...(p.guardarObjetos === 'tabla' ? ['Table.create("Objetos");'] : []),
    `extensiones = newArray(${exts.map(cadena).join(', ')});`,
    '',
    '// --- 3. Recorremos todas las imágenes de la carpeta',
    'lista = getFileList(dirEntrada);',
    'procesadas = 0;',
    'omitidas = 0;',
    'for (i = 0; i < lista.length; i++) {',
    '    nombre = lista[i];',
    '    if (endsWith(nombre, "/")) continue;          // es una subcarpeta',
    '    if (startsWith(nombre, ".")) continue;        // archivo oculto del sistema',
    '    if (!extensionValida(nombre)) continue;',
    '    showProgress(i, lista.length);',
    '    print("Procesando: " + nombre);',
    '    abrirImagen(dirEntrada + nombre);',
    '    analizada = false;',
    '    if (aplicarEscala(nombre)) {',
    '        if (analizar(nombre)) analizada = true;',
    '    }',
    '    if (analizada) procesadas++;',
    '    else omitidas++;',
    '    run("Close All");',
    '    roiManager("reset");',
    '}',
    '',
    '// --- 4. Guardamos las tablas',
    'setBatchMode(false);',
    'if (procesadas == 0) {',
    `    if (omitidas > 0) mensaje = ${texto('No se ha podido analizar ninguna imagen. En la ventana Log verás el motivo de cada una.')};`,
    `    else mensaje = ${texto('No se ha encontrado ninguna imagen válida en:\n')} + dirEntrada + ${texto('\nRevisa el formato de imagen elegido en la receteta.')};`,
    '    print(mensaje);',
    '    selectWindow("Log");',
    '    saveAs("Text", dirSalida + "log.txt");',
    '    if (args == "") exit(mensaje);',
    '    exit();',
    '}',
  );
  if (p.guardarObjetos === 'tabla') {
    l.push(
      'if (Table.size("Objetos") > 0) Table.save(dirSalida + "objetos.csv", "Objetos");',
      `else print(${texto('No se ha detectado ningún objeto: no se guarda objetos.csv.')});`,
    );
  } else if (p.guardarObjetos) {
    l.push(
      'if (nResults > 0) saveAs("Results", dirSalida + "objetos.csv");',
      `else print(${texto('No se ha detectado ningún objeto: no se guarda objetos.csv.')});`,
    );
  }
  if (p.guardarResumen) l.push('Table.save(dirSalida + "resumen.csv", "Resumen");');
  l.push(
    `print(${texto('Terminado: ')} + procesadas + ${texto(' imágenes analizadas, ')} + omitidas + " omitidas.");`,
    '// Guardamos también el registro (Log): documenta qué imágenes se omitieron y por qué',
    'selectWindow("Log");',
    'saveAs("Text", dirSalida + "log.txt");',
    `if (args == "") showMessage(${cadena(NOMBRE_APP)}, ${texto('Terminado: ')} + procesadas + ${texto(' imágenes.\nResultados en:\n')} + dirSalida);`,
    '',
    '// --- Funciones auxiliares',
    '',
    '// ¿El archivo tiene una de las extensiones elegidas en la receteta?',
    'function extensionValida(n) {',
    '    n = toLowerCase(n);',
    '    for (k = 0; k < extensiones.length; k++) {',
    '        if (endsWith(n, extensiones[k])) return true;',
    '    }',
    '    return false;',
    '}',
    '',
    '// Abre la imagen; los formatos de microscopio se abren con Bio-Formats (solo la primera serie)',
    'function abrirImagen(ruta) {',
    '    r = toLowerCase(ruta);',
    `    if (${BIOFORMATS.map((e) => `endsWith(r, "${e}")`).join(' || ')}) {`,
    '        run("Bio-Formats Importer", "open=[" + ruta + "] autoscale color_mode=Default view=Hyperstack stack_order=XYCZT series_1");',
    '    } else {',
    '        open(ruta);',
    '    }',
    '}',
    '',
    ...funcionEscala(r),
    '',
    ...p.funcionAnalizar,
    '',
  );
  return l.join('\n');
}

function funcionEscala(r: Receteta): string[] {
  const e = r.imagenes.escala;
  if (e.modo === 'manual') {
    return [
      `// Escala manual de la receteta: ${num(e.micrasPorPixel)} micras por píxel`,
      'function aplicarEscala(nombre) {',
      `    run("Set Scale...", "distance=1 known=${num(e.micrasPorPixel)} unit=micron");`,
      '    return true;',
      '}',
    ];
  }
  return [
    '// Escala leída del archivo: si la imagen no la tiene en micras, se avisa y se omite',
    'function aplicarEscala(nombre) {',
    '    getPixelSize(unidad, pw, ph);',
    '    u = toLowerCase(unidad);',
    '    if (u == "micron" || u == "microns" || u == "um") return true;',
    '    if (u == fromCharCode(181) + "m" || u == fromCharCode(956) + "m") return true;',
    `    print(${texto('  AVISO: ')} + nombre + ${texto(' no tiene escala en micras (')} + unidad + ${texto('). Se omite.')});`,
    `    print(${texto("  Solución: en la receteta, elige 'Escala manual' e introduce las micras por píxel.")});`,
    '    return false;',
    '}',
  ];
}

/**
 * Prepara la imagen de trabajo: el canal elegido y, si es una pila Z, su proyección.
 * Deja seleccionada la imagen de trabajo y guarda su id en `idTrabajo`.
 */
export function bloqueCanalYProyeccion(
  canal: number,
  proyeccion: Receteta['imagenes']['proyeccionZ'],
): string[] {
  // Nota: nChannels NO existe en el lenguaje de macros (verificado en Fiji 1.54p): getDimensions()
  const l = [
    `// Canal ${canal}: si la imagen tiene varios canales, nos quedamos con ese`,
    'getDimensions(ancho, alto, canales, planos, tiempos);',
    `if (${canal} > canales) {`,
    `    print(${texto('  AVISO: ')} + nombre + ${texto(' tiene ')} + canales + ${texto(` canal(es) y la receteta usa el ${canal}. Se omite.`)});`,
    '    return false;',
    '}',
    'if (canales > 1) {',
    `    run("Duplicate...", "title=trabajo duplicate channels=${canal}");`,
    '} else {',
    '    run("Duplicate...", "title=trabajo duplicate");',
    '}',
    'idTrabajo = getImageID();',
    'getDimensions(ancho, alto, canales, planos, tiempos);',
  ];
  if (proyeccion === 'ninguna') {
    l.push(
      '// Pila Z: la receteta no combina planos; se usa solo el plano actual',
      'if (planos > 1) {',
      `    print(${texto('  AVISO: ')} + nombre + ${texto(' es una pila Z; se usa solo el primer plano.')});`,
      '    setSlice(1);',
      '    run("Duplicate...", "title=plano");',
      '    idPlano = getImageID();',
      '    selectImage(idTrabajo);',
      '    close();',
      '    selectImage(idPlano);',
      '    idTrabajo = idPlano;',
      '}',
    );
  } else {
    const tipo = proyeccion === 'maxima' ? 'Max Intensity' : 'Average Intensity';
    l.push(
      `// Pila Z: combinamos los planos en uno (proyección ${proyeccion === 'maxima' ? 'máxima' : 'media'})`,
      'if (planos > 1) {',
      `    run("Z Project...", "projection=[${tipo}]");`,
      '    idProyeccion = getImageID();',
      '    selectImage(idTrabajo);',
      '    close();',
      '    selectImage(idProyeccion);',
      '    idTrabajo = idProyeccion;',
      '}',
    );
  }
  return l;
}
