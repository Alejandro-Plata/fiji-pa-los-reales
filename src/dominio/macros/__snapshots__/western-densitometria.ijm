// ==============================================================
// Receteta: Western blot · densitometría
// Tipo: western blot · Fiji pa los reales v1.0.0 · 2026-10-22
// Parámetros: {"imagenes":{"extensiones":[".tif",".tiff"],"escala":{"modo":"archivo"},"proyeccionZ":"maxima"},"parametros":{"bandasOscuras":true,"fondo":"rollingBall","radioFondo":50,"nombreProteina":"","avisarSaturacion":true}}
// Cómo usarlo: en Fiji, File > New > Script..., menú Language > IJ1 Macro,
// pega este texto y pulsa Run.
// ==============================================================
requires("1.54f");

// --- 1. Imagen: la elige la usuaria (o llega por argumento en las pruebas)
run("Close All");
// El gestor de ROI se reinicia ANTES del modo silencioso (si no, Fiji crea otro gestor aparte)
roiManager("reset");
args = getArgument();
modoPrueba = (args != "");
if (modoPrueba) {
    partes = split(args, "|");
    ruta = partes[0];
    rutaRois = partes[1];
    dirSalida = partes[2];
    if (!endsWith(dirSalida, File.separator)) dirSalida = dirSalida + File.separator;
    setBatchMode(true);
} else {
    ruta = File.openDialog("Elige la imagen del western blot (TIFF)");
    dirSalida = File.getDirectory(ruta);
}
open(ruta);
base = File.getNameWithoutExtension(ruta);
idImagen = getImageID();

// Una imagen RGB (JPG o captura de pantalla) no sirve para cuantificar: avisamos
if (bitDepth() == 24) {
    aviso = "La imagen es RGB (JPG o captura). La cuantificaci" + fromCharCode(243) + "n no es fiable: usa el TIFF original del equipo.";
    print(aviso);
    if (!modoPrueba) showMessage("Atenci" + fromCharCode(243) + "n", aviso);
    run("8-bit");
}
run("Set Measurements...", "area mean min integrated display redirect=None decimal=3");

// --- 2. Comprobamos si hay píxeles saturados (negro puro o blanco puro)
getRawStatistics(nPix, media, minimo, maximo);
maxPosible = pow(2, bitDepth()) - 1;
if (bitDepth() != 32) {
    if (minimo == 0 || maximo == maxPosible) {
        aviso = "La imagen tiene p" + fromCharCode(237) + "xeles saturados.\nLa cuantificaci" + fromCharCode(243) + "n de esas bandas puede no ser fiable: usa una exposici" + fromCharCode(243) + "n m" + fromCharCode(225) + "s corta.";
        print("AVISO: " + aviso);
        if (!modoPrueba) showMessage("Atenci" + fromCharCode(243) + "n", aviso);
    }
}

// Copia sin procesar para la imagen de control
run("Duplicate...", "title=control");
idControl = getImageID();
selectImage(idImagen);

// --- 3. Bandas oscuras sobre fondo claro: invertimos para que más señal = valor más alto
run("Invert");
// Restamos el fondo de la membrana (radio 50 px, mayor que la altura de una banda)
run("Subtract Background...", "rolling=50");

// --- 4. La usuaria marca las bandas con el MISMO rectángulo
if (modoPrueba) {
    roiManager("Open", rutaRois);
} else {
    setTool("rectangle");
    waitForUser("Marca las bandas",
        "1. Dibuja un rect" + fromCharCode(225) + "ngulo que abarque la banda m" + fromCharCode(225) + "s grande.\n" +
        "2. Pulsa la tecla T para a" + fromCharCode(241) + "adirla a la lista.\n" +
        "3. Arrastra ese MISMO rect" + fromCharCode(225) + "ngulo a la siguiente banda y pulsa T.\n" +
        "4. Repite de izquierda a derecha.\n" +
        "5. Cuando termines, pulsa OK.");
}
n = roiManager("count");
if (n == 0) exit("No has marcado ninguna banda.");

// --- 5. Medimos y numeramos los carriles en el orden en que se marcaron
// (ROI a ROI: Measure añade siempre una fila al final)
selectImage(idImagen);
rename(base);
run("Clear Results");
for (k = 0; k < n; k++) {
    roiManager("select", k);
    run("Measure");
    setResult("Carril", nResults - 1, k + 1);
}
run("Select None");
updateResults();
saveAs("Results", dirSalida + base + "_bandas.csv");
roiManager("Save", dirSalida + base + "_bandas.zip");

// Imagen de control con los rectángulos numerados sobre la imagen original
selectImage(idControl);
roiManager("Deselect");
roiManager("Set Color", "yellow");
roiManager("Set Line Width", 2);
run("From ROI Manager");
Overlay.drawLabels(true);
run("Flatten");
saveAs("Jpeg", dirSalida + base + "_control.jpg");

// La expresión empieza por "" : si empieza por un número, IJ1 no concatena y da NaN
mensaje = "" + n + " bandas medidas. Usa la columna RawIntDen.\nResultados junto a la imagen original.";
print(mensaje);
if (modoPrueba) {
    setBatchMode(false);
    selectWindow("Log");
    saveAs("Text", dirSalida + "log.txt");
} else {
    showMessage("Fiji pa los reales", mensaje);
}
