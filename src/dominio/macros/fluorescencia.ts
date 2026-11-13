/** Macro de fluorescencia: núcleos + hasta 3 marcadores (spec §9). */
import type { RecetetaDe } from '../recetetas/tipos';
import { macroLote, sangrar, type Contexto } from './comun';
import { cadena, num, texto } from './formato';

/** Nombre seguro para columnas y archivos: sin tildes ni símbolos («β-actina» → «b_actina»). */
export function nombreColumna(nombre: string, i: number): string {
  const griegas: Record<string, string> = { α: 'a', β: 'b', γ: 'g', δ: 'd', κ: 'k', μ: 'u' };
  const s = nombre
    .replace(/[αβγδκμ]/g, (c) => griegas[c] ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return s || `M${i + 1}`;
}

export function macroFluorescencia(r: RecetetaDe<'fluorescencia'>, ctx: Contexto): string {
  const p = r.parametros;
  const comprobaciones: string[] = [];
  if (p.deteccion === 'stardist') {
    comprobaciones.push(
      '// StarDist: comprobamos que está instalado antes de empezar',
      'List.setCommands;',
      `if (List.get("StarDist 2D") == "" || List.get("Command From Macro") == "") exit(${texto(
        'Esta receteta usa StarDist, que no está instalado.\nInstalación en Fiji: Help > Update... > Manage update sites > CSBDeep y StarDist > Apply and Close > Apply changes; después, reiniciar Fiji.',
      )});`,
    );
  }
  return macroLote(r, ctx, {
    subcarpetas: ['control', 'rois'],
    comprobaciones,
    medidas: 'area mean integrated centroid shape display redirect=None decimal=3',
    guardarObjetos: 'tabla',
    guardarResumen: true,
    funcionAnalizar: funcionAnalizar(r),
  });
}

function funcionAnalizar(r: RecetetaDe<'fluorescencia'>): string[] {
  const p = r.parametros;
  const cn = p.canalNucleos;
  const necesarios = Math.max(cn, ...p.marcadores.map((m) => m.canal));
  const rad = p.restarFondoRadio;
  const restarFondo = rad > 0 ? [`run("Subtract Background...", "rolling=${num(rad)}");`] : [];
  const sufijo = p.medida === 'media' ? 'media' : 'integrada';
  const medida = p.medida === 'media' ? 'Mean' : 'RawIntDen';
  const marcadoConUmbral = p.marcadores.findIndex((m) => m.umbralPositivo !== null);

  const c: string[] = [
    'base = File.getNameWithoutExtension(nombre);',
    '',
    '// Las imágenes RGB no tienen canales separados: no sirven para este análisis',
    'if (bitDepth() == 24) {',
    `    print(${texto('  AVISO: ')} + nombre + ${texto(' es una imagen RGB (sin canales separados). Se omite.')});`,
    '    return false;',
    '}',
    'getDimensions(ancho, alto, canales, planos, tiempos);',
    `if (canales < ${necesarios}) {`,
    `    print(${texto('  AVISO: ')} + nombre + ${texto(' tiene ')} + canales + ${texto(` canal(es) y la receteta necesita ${necesarios}. Se omite.`)});`,
    '    return false;',
    '}',
  ];

  if (r.imagenes.proyeccionZ !== 'ninguna') {
    const tipo = r.imagenes.proyeccionZ === 'maxima' ? 'Max Intensity' : 'Average Intensity';
    c.push(
      '// Pila Z: combinamos los planos de todos los canales en uno',
      'if (planos > 1) {',
      `    run("Z Project...", "projection=[${tipo}]");`,
      '}',
    );
  } else {
    c.push(
      'if (planos > 1) {',
      `    print(${texto('  AVISO: ')} + nombre + ${texto(' es una pila Z; se usa solo el primer plano.')});`,
      '    Stack.setSlice(1);',
      '    run("Duplicate...", "title=plano duplicate slices=1");',
      '}',
    );
  }
  c.push(
    'idOriginal = getImageID();',
    '',
    `// Copia del canal de núcleos (${cn}) para la imagen de control`,
    `run("Duplicate...", "title=control duplicate channels=${cn}");`,
    'idControl = getImageID();',
    '',
    `// 1. Núcleos (canal ${cn})`,
    'selectImage(idOriginal);',
    `run("Duplicate...", "title=nucleos duplicate channels=${cn}");`,
    'idNucleos = getImageID();',
    ...(rad > 0 ? ['// Corregimos el fondo de la fluorescencia', ...restarFondo] : []),
    'roiManager("reset");',
  );

  if (p.deteccion === 'umbral') {
    c.push(
      '// Detectamos los núcleos con un umbral automático sobre una copia suavizada',
      'run("Duplicate...", "title=mascara");',
      'run("Gaussian Blur...", "sigma=1");',
      `setAutoThreshold("${p.metodoUmbral} dark");`,
      'run("Convert to Mask");',
      'run("Fill Holes");',
      ...(p.separarNucleos ? ['run("Watershed");             // separamos núcleos pegados'] : []),
      `run("Analyze Particles...", "size=${num(p.areaNucleoMin)}-${num(p.areaNucleoMax)} show=Nothing${p.excluirBordes ? ' exclude' : ''} add");`,
      'close();',
    );
  } else {
    const args = [
      "'input':'nucleos'",
      "'modelChoice':'Versatile (fluorescent nuclei)'",
      "'normalizeInput':'true'",
      "'percentileBottom':'1.0'",
      "'percentileTop':'99.8'",
      `'probThresh':'${num(p.probabilidadStardist)}'`,
      `'nmsThresh':'${num(p.solapamientoStardist)}'`,
      "'outputType':'ROI Manager'",
      "'nTiles':'1'",
      `'excludeBoundary':'${p.excluirBordes ? 2 : 0}'`,
      "'roiPosition':'Automatic'",
      "'verbose':'false'",
      "'showCsbdeepProgress':'false'",
      "'showProbAndDist':'false'",
    ].join(', ');
    c.push(
      '// Detectamos los núcleos con StarDist (modelo «Versatile (fluorescent nuclei)»)',
      'selectImage(idNucleos);',
      'rename("nucleos");',
      `run("Command From Macro", ${cadena(`command=[de.csbdresden.stardist.StarDist2D], args=[${args}], process=[false]`)});`,
      `// StarDist no filtra por tamaño: quitamos los núcleos fuera de ${num(p.areaNucleoMin)}-${num(p.areaNucleoMax)} µm²`,
      'selectImage(idNucleos);',
      'for (k = roiManager("count") - 1; k >= 0; k--) {',
      '    roiManager("select", k);',
      '    a = getValue("Area");',
      `    if (a < ${num(p.areaNucleoMin)} || a > ${num(p.areaNucleoMax)}) roiManager("delete");`,
      '}',
      'run("Select None");',
    );
  }

  c.push(
    'nNuc = roiManager("count");',
    '',
    '// 2. Una fila por núcleo en la tabla «Objetos»: área, posición y brillo en el canal nuclear',
    '// (tabla propia: Analyze Particles y Measure reutilizan Results y se perderían filas;',
    '// comprobado en Fiji 1.54p)',
    'selectImage(idNucleos);',
    'inicio = Table.size("Objetos");',
    'for (k = 0; k < nNuc; k++) {',
    '    roiManager("select", k);',
    '    fo = inicio + k;',
    '    Table.set("Imagen", fo, base, "Objetos");',
    '    Table.set("Nucleo", fo, k + 1, "Objetos");',
    '    Table.set("Area_um2", fo, getValue("Area"), "Objetos");',
    '    Table.set("X_um", fo, getValue("X"), "Objetos");',
    '    Table.set("Y_um", fo, getValue("Y"), "Objetos");',
    '    Table.set("Circularidad", fo, getValue("Circ."), "Objetos");',
    '    Table.set("Brillo_nuclear", fo, getValue("Mean"), "Objetos");',
    '}',
    'run("Select None");',
  );

  // 3. Marcadores
  p.marcadores.forEach((m, i) => {
    const col = nombreColumna(m.nombre, i);
    c.push(
      '',
      `// 3.${i + 1} Marcador ${m.nombre} (canal ${m.canal}): intensidad ${sufijo} en cada núcleo`,
      'selectImage(idOriginal);',
      `run("Duplicate...", "title=marcador_${col} duplicate channels=${m.canal}");`,
      ...restarFondo,
      `positivos_${col} = 0;`,
      `suma_${col} = 0;`,
      'for (k = 0; k < nNuc; k++) {',
      '    roiManager("select", k);',
      `    v = getValue("${medida}");`,
      `    suma_${col} = suma_${col} + v;`,
      `    Table.set("${col}_${sufijo}", inicio + k, v, "Objetos");`,
    );
    if (m.umbralPositivo !== null) {
      c.push(
        `    if (v > ${num(m.umbralPositivo)}) {`,
        `        positivos_${col}++;`,
        `        Table.set("${col}_positivo", inicio + k, 1, "Objetos");`,
        '    } else {',
        `        Table.set("${col}_positivo", inicio + k, 0, "Objetos");`,
        '    }',
      );
    }
    c.push('}', 'run("Select None");', 'close();');
  });

  c.push(
    '',
    '// 4. Resumen de la imagen',
    'Table.set("Imagen", fila, base, "Resumen");',
    'Table.set("Nucleos", fila, nNuc, "Resumen");',
  );
  p.marcadores.forEach((m, i) => {
    const col = nombreColumna(m.nombre, i);
    c.push(
      `if (nNuc > 0) Table.set("${col}_${sufijo}_promedio", fila, suma_${col} / nNuc, "Resumen");`,
      `else Table.set("${col}_${sufijo}_promedio", fila, 0, "Resumen");`,
    );
    if (m.umbralPositivo !== null) {
      c.push(
        `Table.set("${col}_positivos", fila, positivos_${col}, "Resumen");`,
        `if (nNuc > 0) Table.set("${col}_porcentaje", fila, positivos_${col} / nNuc * 100, "Resumen");`,
        `else Table.set("${col}_porcentaje", fila, 0, "Resumen");`,
      );
    }
  });
  c.push('fila++;', `print(${texto('  Núcleos: ')} + nNuc);`);

  // 5. ROI y control
  const colorPos = marcadoConUmbral >= 0 ? nombreColumna(p.marcadores[marcadoConUmbral]!.nombre, marcadoConUmbral) : null;
  c.push(
    '',
    '// Guardamos las selecciones para revisarlas o corregirlas a mano en Fiji',
    'if (nNuc > 0) roiManager("Save", dirSalida + "rois" + File.separator + base + ".zip");',
    '',
    colorPos
      ? `// Imagen de control: positivos para ${p.marcadores[marcadoConUmbral]!.nombre} en verde, negativos en magenta`
      : '// Imagen de control: el canal de núcleos con los núcleos detectados en amarillo',
    'selectImage(idControl);',
    'if (nNuc > 0) {',
  );
  if (colorPos) {
    c.push(
      '    for (k = 0; k < nNuc; k++) {',
      '        roiManager("select", k);',
      `        if (Table.get("${colorPos}_positivo", inicio + k, "Objetos") == 1) roiManager("Set Color", "green");`,
      '        else roiManager("Set Color", "magenta");',
      '    }',
      '    roiManager("Deselect");',
      '    roiManager("Set Line Width", 2);',
    );
  } else {
    c.push(
      '    roiManager("Deselect");',
      '    roiManager("Set Color", "yellow");',
      '    roiManager("Set Line Width", 2);',
    );
  }
  c.push(
    '    run("From ROI Manager");',
    '}',
    'run("Flatten");',
    'saveAs("Jpeg", dirSalida + "control" + File.separator + base + "_control.jpg");',
    'return true;',
  );

  return [
    '// Analiza una imagen: cuenta núcleos y mide los marcadores en cada uno',
    'function analizar(nombre) {',
    ...sangrar(c),
    '}',
  ];
}
