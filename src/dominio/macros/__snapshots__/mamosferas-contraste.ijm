// ==============================================================
// Receteta: Mamosferas · contraste simple
// Tipo: mamosferas · Fiji pa los reales v1.0.0 · 2026-10-22
// Parámetros: {"imagenes":{"extensiones":[".tif",".tiff"],"escala":{"modo":"archivo"},"proyeccionZ":"maxima"},"parametros":{"canal":1,"metodo":"umbral","suavizado":2,"radioBordes":4,"restarFondo":{"activo":true,"radio":50},"metodoUmbral":"Otsu","rellenarHuecos":true,"limpiarRuido":true,"separarTocandose":false,"diametroMin":50,"diametroMax":null,"circularidadMin":0.4,"excluirBordes":true,"celulasSembradas":null,"salidas":{"objetos":true,"resumen":true,"control":true,"rois":true}}}
// Uso: en Fiji, File > New > Script..., menú Language > IJ1 Macro,
// pegar este texto y ejecutar con Run.
// ==============================================================
requires("1.54f");

// Variables globales: se usan dentro de las funciones
var dirSalida = "";
var fila = 0;
var extensiones;

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

// --- 2. Preparación: cerramos todo y elegimos las medidas
run("Close All");
// El gestor de ROI se reinicia ANTES del modo silencioso (si no, Fiji crea otro gestor aparte)
roiManager("reset");
run("Clear Results");
print("\\Clear");
setBatchMode(true);
setOption("BlackBackground", true);
run("Set Measurements...", "area centroid perimeter shape feret's display redirect=None decimal=3");
Table.create("Resumen");
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
if (nResults > 0) saveAs("Results", dirSalida + "objetos.csv");
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

// Abre la imagen; los formatos de microscopio se abren con Bio-Formats (solo la primera serie)
function abrirImagen(ruta) {
    r = toLowerCase(ruta);
    if (endsWith(r, ".czi") || endsWith(r, ".lif") || endsWith(r, ".nd2") || endsWith(r, ".lsm") || endsWith(r, ".oib")) {
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
    print("  AVISO: " + nombre + " no tiene escala en micras (" + unidad + "). Se omite.");
    print("  Soluci" + fromCharCode(243) + "n: seleccionar 'Escala manual' en la receteta e introducir las micras por p" + fromCharCode(237) + "xel.");
    return false;
}

// Analiza una imagen: detecta, mide y cuenta las esferas
function analizar(nombre) {
    base = File.getNameWithoutExtension(nombre);
    idOriginal = getImageID();

    // Canal 1: si la imagen tiene varios canales, nos quedamos con ese
    getDimensions(ancho, alto, canales, planos, tiempos);
    if (1 > canales) {
        print("  AVISO: " + nombre + " tiene " + canales + " canal(es) y la receteta usa el 1. Se omite.");
        return false;
    }
    if (canales > 1) {
        run("Duplicate...", "title=trabajo duplicate channels=1");
    } else {
        run("Duplicate...", "title=trabajo duplicate");
    }
    idTrabajo = getImageID();
    getDimensions(ancho, alto, canales, planos, tiempos);
    // Pila Z: combinamos los planos en uno (proyección máxima)
    if (planos > 1) {
        run("Z Project...", "projection=[Max Intensity]");
        idProyeccion = getImageID();
        selectImage(idTrabajo);
        close();
        selectImage(idProyeccion);
        idTrabajo = idProyeccion;
    }

    // Copia para la imagen de control, antes de procesar
    run("Duplicate...", "title=control");
    idControl = getImageID();

    // Copia de trabajo: le damos el nombre del archivo para que aparezca en la tabla
    selectImage(idTrabajo);
    rename(base);
    run("8-bit");

    // Separamos las esferas (oscuras) del fondo (claro) (método «por contraste»)
    // Quitamos el fondo irregular de la iluminación
    run("Subtract Background...", "rolling=50 light");
    // Suavizamos un poco para que el ruido no se confunda con esferas
    run("Gaussian Blur...", "sigma=2");
    // Umbral automático sin «dark»: los objetos son los píxeles oscuros
    setAutoThreshold("Otsu");
    run("Convert to Mask");

    // Limpiamos la máscara
    run("Fill Holes");            // rellenamos el interior de las esferas
    run("Open");                  // quitamos puntitos y bordes finos sueltos

    // Contamos y medimos: diámetro mínimo 50 µm (área 1963.50 µm²), circularidad >= 0.40
    inicio = nResults;
    roiManager("reset");
    run("Analyze Particles...", "size=1963.50-Infinity circularity=0.40-1.00 show=Nothing display exclude add");
    n = nResults - inicio;

    // Resumen de esta imagen (el diámetro es el de Feret, en micras)
    sumaDiam = 0;
    sumaArea = 0;
    for (j = inicio; j < nResults; j++) {
        sumaDiam = sumaDiam + getResult("Feret", j);
        sumaArea = sumaArea + getResult("Area", j);
    }
    Table.set("Imagen", fila, base, "Resumen");
    Table.set("Esferas", fila, n, "Resumen");
    if (n > 0) {
        Table.set("Diametro_medio_um", fila, sumaDiam / n, "Resumen");
        Table.set("Area_media_um2", fila, sumaArea / n, "Resumen");
    } else {
        Table.set("Diametro_medio_um", fila, 0, "Resumen");
        Table.set("Area_media_um2", fila, 0, "Resumen");
    }
    fila++;
    print("  Esferas: " + n);

    // Guardamos las selecciones para revisarlas o corregirlas a mano en Fiji
    if (n > 0) roiManager("Save", dirSalida + "rois" + File.separator + base + ".zip");

    // Imagen de control: la original con las esferas detectadas en amarillo
    selectImage(idControl);
    if (n > 0) {
        roiManager("Deselect");
        roiManager("Set Color", "yellow");
        roiManager("Set Line Width", 2);
        run("From ROI Manager");
    }
    run("Flatten");
    saveAs("Jpeg", dirSalida + "control" + File.separator + base + "_control.jpg");
    return true;
}
