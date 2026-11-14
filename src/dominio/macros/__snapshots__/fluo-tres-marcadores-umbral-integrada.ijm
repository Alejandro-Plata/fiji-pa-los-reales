// ==============================================================
// Receteta: Núcleos DAPI + marcador
// Tipo: fluorescencia · Fiji pa los reales v1.0.0 · 2026-10-22
// Parámetros: {"imagenes":{"extensiones":[".tif",".tiff"],"escala":{"modo":"archivo"},"proyeccionZ":"ninguna"},"parametros":{"canalNucleos":1,"marcadores":[{"nombre":"CD44","canal":2,"umbralPositivo":850},{"nombre":"β-actina","canal":3,"umbralPositivo":null},{"nombre":"Ki-67","canal":4,"umbralPositivo":1200.5}],"deteccion":"umbral","metodoUmbral":"Otsu","restarFondoRadio":0,"separarNucleos":false,"probabilidadStardist":0.5,"solapamientoStardist":0.4,"areaNucleoMin":20,"areaNucleoMax":500,"excluirBordes":true,"medida":"integrada"}}
// Uso: en Fiji, File > New > Script..., menú Language > ImageJ Macro,
// pegar este texto y ejecutar con Run.
// ==============================================================
requires("1.54f");

// Variables globales: se usan dentro de las funciones
var dirSalida = "";
var fila = 0;
var extensiones;
var hayBioformats = false;

// --- 1. Carpetas: de dónde se leen las imágenes y dónde se guardan los resultados
args = getArgument();
if (args != "") {
    partes = split(args, "|");
    dirEntrada = partes[0];
    dirSalida = partes[1];
} else {
    dirEntrada = getDirectory("Carpeta de im" + fromCharCode(225) + "genes");
    dirSalida = getDirectory("Carpeta de resultados (vac" + fromCharCode(237) + "a)");
}
if (!endsWith(dirEntrada, File.separator)) dirEntrada = dirEntrada + File.separator;
if (!endsWith(dirSalida, File.separator)) dirSalida = dirSalida + File.separator;
if (dirEntrada == dirSalida) exit("La carpeta de resultados debe ser distinta de la carpeta de im" + fromCharCode(225) + "genes.");
File.makeDirectory(dirSalida);
File.makeDirectory(dirSalida + "control");
File.makeDirectory(dirSalida + "rois");

// ¿Está Bio-Formats? (abre los OME-TIFF sin diálogos y los formatos de microscopio)
List.setCommands;
if (List.get("Bio-Formats Importer") != "") hayBioformats = true;

// --- 2. Preparación: cerramos todo y elegimos las medidas
run("Close All");
// El gestor de ROI se reinicia ANTES del modo silencioso (si no, Fiji crea otro gestor aparte)
roiManager("reset");
run("Clear Results");
print("\\Clear");
setBatchMode(true);
setOption("BlackBackground", true);
run("Set Measurements...", "area mean integrated centroid shape display redirect=None decimal=3");
Table.create("Resumen");
Table.create("Objetos");
extensiones = newArray(".tif", ".tiff");

// --- 3. Recorremos todas las imágenes de la carpeta
lista = getFileList(dirEntrada);
procesadas = 0;
omitidas = 0;
for (i = 0; i < lista.length; i++) {
    nombre = lista[i];
    if (endsWith(nombre, "/")) continue;          // es una subcarpeta
    if (startsWith(nombre, ".")) continue;        // archivo oculto del sistema
    if (!extensionValida(nombre)) continue;
    showProgress(i, lista.length);
    print("Procesando: " + nombre);
    abrirImagen(dirEntrada + nombre);
    analizada = false;
    if (aplicarEscala(nombre)) {
        if (analizar(nombre)) analizada = true;
    }
    if (analizada) procesadas++;
    else omitidas++;
    run("Close All");
    roiManager("reset");
}

// --- 4. Guardamos las tablas
setBatchMode(false);
if (procesadas == 0) {
    if (omitidas > 0) mensaje = "No se ha podido analizar ninguna imagen. En la ventana Log ver" + fromCharCode(225) + "s el motivo de cada una.";
    else mensaje = "No se ha encontrado ninguna imagen v" + fromCharCode(225) + "lida en:\n" + dirEntrada + "\nRevisa el formato de imagen elegido en la receteta.";
    print(mensaje);
    selectWindow("Log");
    saveAs("Text", dirSalida + "log.txt");
    if (args == "") exit(mensaje);
    exit();
}
if (Table.size("Objetos") > 0) Table.save(dirSalida + "objetos.csv", "Objetos");
else print("No se ha detectado ning" + fromCharCode(250) + "n objeto: no se guarda objetos.csv.");
Table.save(dirSalida + "resumen.csv", "Resumen");
print("Terminado: " + procesadas + " im" + fromCharCode(225) + "genes analizadas, " + omitidas + " omitidas.");
// Guardamos también el registro (Log): documenta qué imágenes se omitieron y por qué
selectWindow("Log");
saveAs("Text", dirSalida + "log.txt");
if (args == "") showMessage("Fiji pa los reales", "Terminado: " + procesadas + " im" + fromCharCode(225) + "genes.\nResultados en:\n" + dirSalida);

// --- Funciones auxiliares

// ¿El archivo tiene una de las extensiones elegidas en la receteta?
function extensionValida(n) {
    n = toLowerCase(n);
    for (k = 0; k < extensiones.length; k++) {
        if (endsWith(n, extensiones[k])) return true;
    }
    return false;
}

// Abre la imagen; los formatos de microscopio y los OME-TIFF se abren con Bio-Formats (solo la
// primera serie) y con las opciones escritas aquí: así Bio-Formats no muestra su diálogo
function abrirImagen(ruta) {
    r = toLowerCase(ruta);
    conBioformats = false;
    if (endsWith(r, ".czi") || endsWith(r, ".lif") || endsWith(r, ".nd2") || endsWith(r, ".lsm") || endsWith(r, ".oib")) conBioformats = true;
    if (hayBioformats) {
        if (endsWith(r, ".ome.tif")) conBioformats = true;
        if (endsWith(r, ".ome.tiff")) conBioformats = true;
    }
    if (conBioformats) {
        run("Bio-Formats Importer", "open=[" + ruta + "] autoscale color_mode=Default view=Hyperstack stack_order=XYCZT series_1");
    } else {
        open(ruta);
    }
}

// Escala leída del archivo: si la imagen no la tiene en micras, se avisa y se omite
function aplicarEscala(nombre) {
    getPixelSize(unidad, pw, ph);
    u = toLowerCase(unidad);
    if (u == "micron" || u == "microns" || u == "um") return true;
    if (u == fromCharCode(181) + "m" || u == fromCharCode(956) + "m") return true;
    // Otras unidades de longitud: se convierten a micras (las pulgadas no: suelen ser 72 ppp)
    f = 0;
    if (u == "mm" || u == "millimeter" || u == "millimeters") f = 1000;
    if (u == "cm" || u == "centimeter" || u == "centimeters") f = 10000;
    if (u == "nm" || u == "nanometer" || u == "nanometers") f = 0.001;
    if (f > 0) {
        run("Properties...", "unit=micron pixel_width=" + (pw * f) + " pixel_height=" + (ph * f));
        return true;
    }
    print("  AVISO: " + nombre + " no tiene escala en micras (" + unidad + "). Se omite.");
    print("  Soluci" + fromCharCode(243) + "n: seleccionar 'Escala manual' en la receteta e introducir las micras por p" + fromCharCode(237) + "xel.");
    return false;
}

// Analiza una imagen: cuenta núcleos y mide los marcadores en cada uno
function analizar(nombre) {
    base = File.getNameWithoutExtension(nombre);

    // Las imágenes RGB no tienen canales separados: no sirven para este análisis
    if (bitDepth() == 24) {
        print("  AVISO: " + nombre + " es una imagen RGB (sin canales separados). Se omite.");
        return false;
    }
    getDimensions(ancho, alto, canales, planos, tiempos);
    if (canales < 4) {
        print("  AVISO: " + nombre + " tiene " + canales + " canal(es) y la receteta necesita 4. Se omite.");
        return false;
    }
    if (planos > 1) {
        print("  AVISO: " + nombre + " es una pila Z; se usa solo el primer plano.");
        Stack.setSlice(1);
        run("Duplicate...", "title=plano duplicate slices=1");
    }
    idOriginal = getImageID();

    // Copia del canal de núcleos (1) para la imagen de control
    run("Duplicate...", "title=control duplicate channels=1");
    idControl = getImageID();

    // 1. Núcleos (canal 1)
    selectImage(idOriginal);
    run("Duplicate...", "title=nucleos duplicate channels=1");
    idNucleos = getImageID();
    roiManager("reset");
    // Detectamos los núcleos con un umbral automático sobre una copia suavizada
    run("Duplicate...", "title=mascara");
    run("Gaussian Blur...", "sigma=1");
    setAutoThreshold("Otsu dark");
    run("Convert to Mask");
    run("Fill Holes");
    run("Analyze Particles...", "size=20-500 show=Nothing exclude add");
    close();
    nNuc = roiManager("count");

    // 2. Una fila por núcleo en la tabla «Objetos»: área, posición y brillo en el canal nuclear
    // (tabla propia: Analyze Particles y Measure reutilizan Results y se perderían filas;
    // comprobado en Fiji 1.54p)
    selectImage(idNucleos);
    inicio = Table.size("Objetos");
    for (k = 0; k < nNuc; k++) {
        roiManager("select", k);
        fo = inicio + k;
        Table.set("Imagen", fo, base, "Objetos");
        Table.set("Nucleo", fo, k + 1, "Objetos");
        Table.set("Area_um2", fo, getValue("Area"), "Objetos");
        Table.set("X_um", fo, getValue("X"), "Objetos");
        Table.set("Y_um", fo, getValue("Y"), "Objetos");
        Table.set("Circularidad", fo, getValue("Circ."), "Objetos");
        Table.set("Brillo_nuclear", fo, getValue("Mean"), "Objetos");
    }
    run("Select None");

    // 3.1 Marcador CD44 (canal 2): intensidad integrada en cada núcleo
    selectImage(idOriginal);
    run("Duplicate...", "title=marcador_CD44 duplicate channels=2");
    positivos_CD44 = 0;
    suma_CD44 = 0;
    for (k = 0; k < nNuc; k++) {
        roiManager("select", k);
        v = getValue("RawIntDen");
        suma_CD44 = suma_CD44 + v;
        Table.set("CD44_integrada", inicio + k, v, "Objetos");
        if (v > 850) {
            positivos_CD44++;
            Table.set("CD44_positivo", inicio + k, 1, "Objetos");
        } else {
            Table.set("CD44_positivo", inicio + k, 0, "Objetos");
        }
    }
    run("Select None");
    close();

    // 3.2 Marcador β-actina (canal 3): intensidad integrada en cada núcleo
    selectImage(idOriginal);
    run("Duplicate...", "title=marcador_b_actina duplicate channels=3");
    positivos_b_actina = 0;
    suma_b_actina = 0;
    for (k = 0; k < nNuc; k++) {
        roiManager("select", k);
        v = getValue("RawIntDen");
        suma_b_actina = suma_b_actina + v;
        Table.set("b_actina_integrada", inicio + k, v, "Objetos");
    }
    run("Select None");
    close();

    // 3.3 Marcador Ki-67 (canal 4): intensidad integrada en cada núcleo
    selectImage(idOriginal);
    run("Duplicate...", "title=marcador_Ki_67 duplicate channels=4");
    positivos_Ki_67 = 0;
    suma_Ki_67 = 0;
    for (k = 0; k < nNuc; k++) {
        roiManager("select", k);
        v = getValue("RawIntDen");
        suma_Ki_67 = suma_Ki_67 + v;
        Table.set("Ki_67_integrada", inicio + k, v, "Objetos");
        if (v > 1200.5) {
            positivos_Ki_67++;
            Table.set("Ki_67_positivo", inicio + k, 1, "Objetos");
        } else {
            Table.set("Ki_67_positivo", inicio + k, 0, "Objetos");
        }
    }
    run("Select None");
    close();

    // 4. Resumen de la imagen
    Table.set("Imagen", fila, base, "Resumen");
    Table.set("Nucleos", fila, nNuc, "Resumen");
    if (nNuc > 0) Table.set("CD44_integrada_promedio", fila, suma_CD44 / nNuc, "Resumen");
    else Table.set("CD44_integrada_promedio", fila, 0, "Resumen");
    Table.set("CD44_positivos", fila, positivos_CD44, "Resumen");
    if (nNuc > 0) Table.set("CD44_porcentaje", fila, positivos_CD44 / nNuc * 100, "Resumen");
    else Table.set("CD44_porcentaje", fila, 0, "Resumen");
    if (nNuc > 0) Table.set("b_actina_integrada_promedio", fila, suma_b_actina / nNuc, "Resumen");
    else Table.set("b_actina_integrada_promedio", fila, 0, "Resumen");
    if (nNuc > 0) Table.set("Ki_67_integrada_promedio", fila, suma_Ki_67 / nNuc, "Resumen");
    else Table.set("Ki_67_integrada_promedio", fila, 0, "Resumen");
    Table.set("Ki_67_positivos", fila, positivos_Ki_67, "Resumen");
    if (nNuc > 0) Table.set("Ki_67_porcentaje", fila, positivos_Ki_67 / nNuc * 100, "Resumen");
    else Table.set("Ki_67_porcentaje", fila, 0, "Resumen");
    fila++;
    print("  N" + fromCharCode(250) + "cleos: " + nNuc);

    // Guardamos las selecciones para revisarlas o corregirlas a mano en Fiji
    if (nNuc > 0) roiManager("Save", dirSalida + "rois" + File.separator + base + ".zip");

    // Imagen de control: positivos para CD44 en verde, negativos en magenta
    selectImage(idControl);
    if (nNuc > 0) {
        for (k = 0; k < nNuc; k++) {
            roiManager("select", k);
            if (Table.get("CD44_positivo", inicio + k, "Objetos") == 1) roiManager("Set Color", "green");
            else roiManager("Set Color", "magenta");
        }
        roiManager("Deselect");
        roiManager("Set Line Width", 2);
        run("From ROI Manager");
    }
    run("Flatten");
    saveAs("Jpeg", dirSalida + "control" + File.separator + base + "_control.jpg");
    return true;
}
