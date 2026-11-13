# Recetetas para Fiji — especificación para Claude Code

Oct 22, 2026 · @Alex

## 1. Cómo usar este documento con Claude Code

Este documento es la especificación completa de una app web instalable (PWA) que genera macros de Fiji a partir de opciones elegidas con botones. Pásaselo a Claude Code entero y trabaja fase a fase (sección 15).

Reglas de trabajo para Claude Code:

- Guarda este documento en la raíz del repositorio como `spec.md` y crea un `CLAUDE.md` que lo referencie y resuma las reglas anteriores.
- Haz commits pequeños por funcionalidad, con mensajes en español.
- No añadas dependencias sin justificarlas en el commit. Ninguna librería de componentes con estilo propio (Material, Bootstrap, Chakra…).
- Los macros generados son el corazón del producto: cada cambio en el generador lleva prueba (sección 14).
- Nunca se suben imágenes ni datos a ningún servidor. Todo ocurre en el dispositivo.

## 2. Visión del producto

"Recetetas para Fiji" convierte opciones elegidas con botones en un macro de Fiji listo para pegar, sin que la usuaria sepa programar. La usuaria es una bióloga que hace la tesis doctoral sobre células madre y cáncer de mama. Usa Fiji, pero no escribe macros.

Problema que resuelve: analizar imágenes a mano (umbral, medir, copiar a Excel) imagen por imagen es lento y poco reproducible. Un macro procesa una carpeta entera con el mismo criterio, pero escribirlo exige programar.

Qué hace la app:

- Un asistente paso a paso con opciones explicadas en lenguaje sencillo.
- Genera el macro (lenguaje IJ1 Macro, archivo `.ijm`) con comentarios en español.
- Guarda las combinaciones de opciones como **recetetas** reutilizables, con nombre.
- Explica con detalle cómo pegar y lanzar el macro en Fiji, y cómo resolver errores comunes.
- Genera el párrafo de Materiales y Métodos que describe el análisis.
- Fase final: un recuento rápido y orientativo en el propio móvil.

Tres tipos de análisis, por orden de prioridad:

1. Mamosferas en campo claro: recuento, tamaño y eficiencia de formación de esferas (SFE).
2. Fluorescencia: recuento de núcleos y porcentaje de células positivas para un marcador.
3. Western blot: densitometría semiautomática de bandas.

Qué no es:

- No ejecuta Fiji ni lo controla en remoto. Fiji se ejecuta en el ordenador del laboratorio.
- No es un cuaderno de laboratorio ni un gestor de datos.
- No tiene servidor, cuentas ni analítica. Todo vive en el dispositivo.

Uso típico: prepara la receteta en el móvil (en el metro, en casa) y la abre en el ordenador del laboratorio mediante un enlace o un archivo `.ijm` para lanzarla en Fiji.

## 3. Stack técnico, estructura y separación con el diseño

La app es estática: Vite + React + TypeScript, sin backend, publicada como PWA instalable en la pantalla de inicio del móvil.

| Pieza | Elección | Motivo |
| --- | --- | --- |
| Framework | React 18+ con TypeScript estricto | Ecosistema amplio, fácil de mantener |
| Bundler | Vite | Rápido, PWA con un plugin |
| Enrutado | React Router, rutas con hash (`/#/…`) | Funciona en cualquier hosting estático |
| Estado | `useReducer` + contexto; nada de Redux | La app es pequeña |
| Validación | Zod para el esquema de recetetas | Validar importaciones y enlaces |
| Persistencia | `localStorage` envuelto en `try/catch` | Sin servidor |
| PWA | `vite-plugin-pwa` (manifest + service worker) | Instalable y usable sin conexión |
| Estilos | CSS Modules + variables CSS en `tokens.css` | El diseño lo aporta otra persona |
| Pruebas | Vitest (unidad), Playwright (e2e y viewports) | Sección 14 |
| Despliegue | GitHub Pages o Netlify, HTTPS obligatorio | El portapapeles exige HTTPS |

Estructura de carpetas:

```text
src/
  app/            # rutas, layout general, proveedores
  pantallas/      # una carpeta por pantalla (Inicio, Asistente, Resultado, Instrucciones, Ajustes, Rapido)
  componentes/    # piezas reutilizables sin estilo propio (Campo, Selector, Paso, BloqueCodigo…)
  dominio/
    recetetas/    # tipos, esquema Zod, plantillas, almacenamiento, compartir por enlace
    macros/       # generador de macros (funciones puras), un archivo por tipo de análisis
    metodos/      # generador del texto de Materiales y Métodos
  textos/es.ts    # TODOS los textos visibles de la interfaz
  estilos/
    tokens.css    # colores, tipografía, espacios, radios, sombras (valores neutros provisionales)
    base.css      # reset, tipografía base, utilidades de layout
scripts/          # pruebas con Fiji headless (sección 14)
tests/            # e2e de Playwright
```

Separación con el diseño (la diseñadora es quien te pasa este documento):

- Claude Code no decide colores, tipografías ni iconografía. Usa valores neutros provisionales (grises, fuente del sistema) definidos solo en `tokens.css`.
- Ningún componente lleva colores, tamaños de fuente ni espacios escritos a mano: siempre `var(--token)`.
- Nombres de tokens semánticos: `--color-fondo`, `--color-superficie`, `--color-texto`, `--color-texto-suave`, `--color-acento`, `--color-error`, `--color-aviso`, `--color-exito`, `--espacio-1` a `--espacio-8`, `--radio-s/m/l`, `--fuente-base`, `--fuente-codigo`, `--texto-s/m/l/xl`.
- HTML semántico y clases estables y descriptivas (CSS Modules con nombres legibles), para que la diseñadora pueda tocar estilos sin entender la lógica.
- Separar lógica y presentación: los componentes de pantalla reciben datos y callbacks; la lógica vive en `dominio/` y en hooks.
- Crear `DISEÑO.md` con la lista de componentes, sus estados (normal, foco, deshabilitado, error, cargando, vacío) y dónde se aplica cada token.
- Dejar en cada pantalla un hueco marcado para capturas de Fiji en las instrucciones (`/public/capturas/`), con texto alternativo.
- Modo claro y oscuro preparados con `prefers-color-scheme`, aunque los valores definitivos los ponga la diseñadora.

## 4. Requisitos responsive desde el inicio

El diseño es mobile-first: se escribe primero para 320 px de ancho y se amplía con `min-width`. Ninguna pantalla se da por terminada sin pasar las comprobaciones de esta sección.

Puntos de corte (definidos como tokens y usados siempre igual):

| Nombre | Ancho | Disposición |
| --- | --- | --- |
| Móvil | 0–599 px | Una columna. Asistente: un paso por pantalla y barra inferior fija con "Atrás" y "Siguiente" |
| Tableta | 600–1023 px | Una columna más ancha (máx. 720 px). Recetetas en rejilla de 2 |
| Escritorio | ≥ 1024 px | Asistente a dos columnas: formulario a la izquierda y vista previa del macro en vivo a la derecha, fija al hacer scroll. Recetetas en rejilla de 3 |

Reglas obligatorias:

1. Sin scroll horizontal de página en ningún ancho desde 320 px. Los bloques de código hacen scroll horizontal dentro de su propio contenedor (`overflow-x: auto`), con opción "Ajustar líneas".
2. Objetivos táctiles de al menos 44 × 44 px, con 8 px de separación entre ellos.
3. Nada depende de `hover`: toda la ayuda ("¿Qué es esto?") se abre con toque o teclado.
4. Campos de texto con `font-size` ≥ 16 px para evitar el zoom automático de iOS.
5. Teclado adecuado en cada campo: `inputmode="decimal"` para números con decimales, `inputmode="numeric"` para enteros.
6. Usar `100dvh` en vez de `100vh` y respetar `env(safe-area-inset-*)` en la barra inferior fija (notch y barra de gestos).
7. La barra inferior fija no debe tapar el campo activo cuando se abre el teclado. Probar en Safari iOS y Chrome Android.
8. Funciona en vertical y horizontal.
9. Imágenes y lienzos (análisis rápido) se adaptan al ancho con `max-width: 100%`.
10. Tipografía fluida con `clamp()` en los tokens de tamaño de texto.
11. Respetar `prefers-reduced-motion` y mantener siempre visible el foco de teclado.
12. Pruebas automáticas de Playwright en 320, 375, 414, 768, 1024 y 1440 px que comprueban que `document.documentElement.scrollWidth <= window.innerWidth` en cada pantalla.

## 5. Pantallas y flujos de usuario

La app tiene seis pantallas. El flujo principal es: elegir o crear receteta → ajustar opciones → obtener el macro → llevarlo al ordenador → lanzarlo en Fiji.

&#91;embedded content: flujo principal · del móvil a Fiji y vuelta\]

La receteta se prepara donde sea; el análisis siempre corre en Fiji, y las imágenes de control deciden si la receteta vale o hay que ajustarla.

**Inicio** (`/#/`)

- Lista de recetetas guardadas en tarjetas: nombre, tipo de análisis, fecha de modificación, favorita.
- Botón principal "Nueva receteta".
- Sección "Plantillas" con las recetetas de ejemplo (sección 6).
- Accesos a "Cómo usarlo en Fiji" y a "Análisis rápido" (cuando exista).
- Estado vacío con una frase que invite a empezar por una plantilla.
- Buscar por nombre y filtrar por tipo cuando haya más de 6 recetetas.
- Acciones por tarjeta: abrir, duplicar, renombrar, compartir, borrar (con confirmación y opción "Deshacer" durante 5 s).

**Asistente** (`/#/receteta/nueva/:tipo` y `/#/receteta/:id`)

- Paso 0 (solo al crear): elegir tipo de análisis con tres tarjetas grandes y una frase cada una.
- Pasos siguientes según el tipo (secciones 8, 9 y 10). Pasos comunes: Imágenes → Detección → Filtros → Resultados → Nombre y guardar.
- Cada opción tiene: etiqueta clara, valor recomendado marcado como "Recomendado", y un botón "¿Qué es esto?" que despliega una explicación de 2–4 frases.
- Las opciones avanzadas van plegadas bajo "Opciones avanzadas".
- Indicador de progreso ("Paso 2 de 5") y navegación libre entre pasos ya visitados.
- Validación en vivo con mensajes en español debajo del campo ("El diámetro mínimo debe ser menor que el máximo").
- Guardado automático del borrador cada vez que cambia una opción; al salir sin guardar, aviso.
- En escritorio, vista previa del macro actualizada en vivo.

**Resultado** (`/#/receteta/:id/macro`)

- El macro completo en un bloque de código con fuente monoespaciada y números de línea.
- Botones, en este orden: "Copiar macro", "Descargar .ijm", "Enviar al ordenador" (Web Share API; si no existe, copiar enlace), "Texto para Métodos", "Cómo lanzarlo en Fiji".
- Un resumen legible de la receteta encima del código ("Detecta esferas de 50 µm o más, circularidad ≥ 0,4…").
- Confirmación visible al copiar ("Macro copiado") y alternativa si el portapapeles falla: seleccionar todo el texto automáticamente e indicar "Pulsa Ctrl+C".

**Instrucciones** (`/#/fiji`): guía de la sección 11, con pasos numerados, capturas y apartado de errores comunes. Accesible también como panel desde Resultado.

**Ajustes** (`/#/ajustes`)

- Exportar todas las recetetas a un archivo `.json` (copia de seguridad) e importarlo.
- Borrar todos los datos (con doble confirmación).
- Idioma del texto de Métodos por defecto: español o inglés.
- Versión de la app y enlace a "Cómo instalar la app en el móvil".

**Análisis rápido** (`/#/rapido`, fase final): sección 13.

Cómo llega la receteta del móvil al ordenador del laboratorio (las tres vías deben funcionar):

1. Enlace de receteta: la receteta va codificada en la URL (sección 6). Se envía por correo, Telegram o WhatsApp y se abre en el ordenador.
2. Archivo `.ijm`: se comparte con la hoja de compartir del móvil y se abre directamente en Fiji.
3. Exportar e importar `.json` desde Ajustes.

## 6. Recetetas: modelo de datos, almacenamiento, plantillas y compartir

Una receteta es un objeto JSON con nombre, tipo de análisis y sus parámetros. El macro nunca se guarda: se regenera siempre desde la receteta, así un arreglo en el generador mejora todas las recetetas.

Tipos en `src/dominio/recetetas/tipos.ts`:

```ts
export type TipoAnalisis = 'esferas' | 'fluorescencia' | 'western';

export interface RecetetaBase {
  id: string;              // crypto.randomUUID()
  esquema: 1;              // versión del esquema, para migraciones
  nombre: string;          // 1–60 caracteres, obligatorio
  descripcion?: string;    // máx. 300 caracteres
  etiquetas: string[];
  favorita: boolean;
  creada: string;          // ISO 8601
  modificada: string;      // ISO 8601
  origen?: 'plantilla' | 'importada' | 'enlace';
}

export interface ImagenesComunes {
  extensiones: string[];          // p. ej. ['.tif', '.tiff'] o ['*'] para todas las compatibles
  escala: { modo: 'archivo' } | { modo: 'manual'; micrasPorPixel: number };
  proyeccionZ: 'ninguna' | 'maxima' | 'media';  // si hay pilas Z
}

export type Receteta =
  | (RecetetaBase & { tipo: 'esferas'; imagenes: ImagenesComunes; parametros: ParametrosEsferas })
  | (RecetetaBase & { tipo: 'fluorescencia'; imagenes: ImagenesComunes; parametros: ParametrosFluorescencia })
  | (RecetetaBase & { tipo: 'western'; imagenes: ImagenesComunes; parametros: ParametrosWestern });
```

Los tipos de parámetros de cada análisis se definen en las secciones 8, 9 y 10. Cada tipo tiene su esquema Zod con rangos y valores por defecto. Un esquema Zod es la única fuente de verdad: de él salen la validación del formulario, la de importación y los valores por defecto.

Almacenamiento:

- Clave `recetetas:v1` en `localStorage`, con un array de recetetas.
- Clave `recetetas:borrador` para el borrador del asistente en curso.
- Toda lectura y escritura dentro de `try/catch`. Si `localStorage` falla (modo privado), la app sigue funcionando en memoria y muestra un aviso discreto: "No se pueden guardar recetetas en este navegador".
- Al cargar, cada receteta se valida con Zod; las inválidas se apartan a `recetetas:corruptas` y se avisa, nunca se borran en silencio.
- Función de migración `migrar(json): Receteta` preparada para futuras versiones del esquema.

Plantillas incluidas (solo lectura; al abrirlas se duplican como receteta nueva):

| Nombre | Tipo | Resumen |
| --- | --- | --- |
| Mamosferas · campo claro | esferas | Detección por bordes, diámetro ≥ 50 µm, circularidad ≥ 0,4, rellenar huecos, sin separar esferas pegadas |
| Mamosferas · contraste simple | esferas | Umbral Otsu sobre fondo claro, para imágenes muy limpias |
| Núcleos DAPI + marcador | fluorescencia | Núcleos en canal 1 por umbral + watershed, marcador en canal 2, exportar intensidades |
| Núcleos con StarDist | fluorescencia | Igual que la anterior, pero detectando núcleos con StarDist (requiere instalar el plugin) |
| Western blot · densitometría | western | Bandas oscuras sobre fondo claro, rectángulo de tamaño fijo, fondo restado por rectángulo vecino |

Todas las plantillas muestran un aviso: "Revisa la escala y el tamaño mínimo: dependen de tu microscopio y tu objetivo".

Compartir por enlace:

- Formato: `https://<dominio>/#/importar?r=<datos>`, donde `<datos>` es el JSON de la receteta (sin `id`, fechas ni favorita) comprimido con `CompressionStream('deflate-raw')` y codificado en base64url. Si el navegador no soporta `CompressionStream`, usar base64url sin comprimir.
- Al abrir el enlace: validar con Zod, mostrar resumen y preguntar "¿Guardar esta receteta?". Nunca se guarda sola.
- Si ya existe una receteta con el mismo nombre, proponer "Nombre (2)".
- Límite: si el enlace supera 2000 caracteres, ofrecer en su lugar el archivo `.json`.

## 7. Generador de macros: arquitectura y esqueleto común

El generador es una función pura `generarMacro(receteta, contexto): string` que une fragmentos de texto. Misma receteta y mismo contexto dan siempre el mismo macro, byte a byte, lo que permite pruebas de instantánea.

Arquitectura (`src/dominio/macros/`):

```text
index.ts            generarMacro(): elige el generador por tipo y ensambla
comun.ts            cabecera, carpetas, preparación, bucle de archivos, abrir, escala, cierre
esferas.ts          función analizar() para mamosferas
fluorescencia.ts    función analizar() para fluorescencia
western.ts          macro semiinteractivo de western blot
formato.ts          num(), cadena(), comentario(): formateo seguro
```

`contexto` = `{ versionApp: string; fecha: string }`. En las pruebas se pasa una fecha fija.

Reglas del generador (todas con prueba):

1. **Números siempre con punto decimal.** La usuaria escribe "0,65" en el móvil en español: el formulario acepta coma o punto y guarda `0.65`. El generador usa `num()`, que nunca usa `toLocaleString`. Un "0,65" dentro del macro rompe Fiji.
2. **Cadenas escapadas.** `cadena()` escapa `\` y `"`. `comentario()` elimina saltos de línea y la secuencia `*/` del nombre de la receteta.
3. **Rutas nunca dentro del macro.** Las carpetas se piden al ejecutar (`getDirectory`) o llegan por `getArgument()` en las pruebas.
4. **Comentarios en español** antes de cada bloque, explicando en lenguaje sencillo qué hace ("// Quitamos el fondo irregular de la iluminación"). Son parte de la documentación de la tesis.
5. **Cabecera reproducible:** nombre de la receteta, tipo, versión de la app, fecha y todos los parámetros en una línea JSON. Permite reconstruir el análisis meses después.
6. **Sin interacción en mitad del lote** (salvo western blot): el macro corre con `setBatchMode(true)` y no muestra ventanas hasta el final.
7. **Fallar con mensajes claros.** Imágenes sin escala, carpetas vacías o plugins ausentes producen un mensaje en español, nunca un error críptico.
8. **Comandos de Fiji verificados.** Cada `run("…")` debe comprobarse grabándolo con la grabadora de macros de Fiji (Plugins › Macros › Record…) y ejecutándolo en las pruebas headless (sección 14).

Esqueleto común del macro generado (referencia; Claude Code debe verificarlo en Fiji):

```javascript
// ==============================================================
// Receteta: Mamosferas · campo claro
// Tipo: esferas · Recetetas para Fiji v1.0.0 · 2026-10-22
// Parámetros: {"extensiones":[".tif"],"escala":{"modo":"archivo"},...}
// ==============================================================
requires("1.54f");

// --- 1. Carpetas: de dónde se leen las imágenes y dónde se guardan los resultados
args = getArgument();
if (args != "") {
    partes = split(args, "|");
    dirEntrada = partes[0];
    dirSalida = partes[1];
} else {
    dirEntrada = getDirectory("Elige la carpeta con las imágenes");
    dirSalida = getDirectory("Elige la carpeta donde guardar los resultados");
}
if (!endsWith(dirEntrada, File.separator)) dirEntrada = dirEntrada + File.separator;
if (!endsWith(dirSalida, File.separator)) dirSalida = dirSalida + File.separator;
File.makeDirectory(dirSalida + "control");
File.makeDirectory(dirSalida + "rois");

// --- 2. Preparación: modo silencioso y medidas que queremos
setBatchMode(true);
run("Close All");
roiManager("reset");
run("Clear Results");
setOption("BlackBackground", true);
run("Set Measurements...", "area mean min centroid perimeter shape feret's integrated display redirect=None decimal=3");
Table.create("Resumen");
extensiones = newArray(".tif", ".tiff");

// --- 3. Recorremos todas las imágenes de la carpeta
lista = getFileList(dirEntrada);
procesadas = 0;
for (i = 0; i < lista.length; i++) {
    nombre = lista[i];
    if (endsWith(nombre, "/")) continue;          // es una subcarpeta
    if (!extensionValida(nombre)) continue;
    showProgress(i, lista.length);
    print("Procesando: " + nombre);
    abrirImagen(dirEntrada + nombre);
    if (!aplicarEscala(nombre)) { run("Close All"); continue; }
    analizar(nombre);                              // específica de cada tipo
    run("Close All");
    roiManager("reset");
    procesadas++;
}

// --- 4. Guardamos las tablas
if (procesadas == 0) exit("No se ha encontrado ninguna imagen válida en:\n" + dirEntrada);
saveAs("Results", dirSalida + "objetos.csv");
Table.save(dirSalida + "resumen.csv", "Resumen");
setBatchMode(false);
if (args == "") showMessage("Recetetas", "Terminado: " + procesadas + " imágenes.\nResultados en:\n" + dirSalida);
else print("Terminado: " + procesadas + " imágenes");

// --- Funciones auxiliares
function extensionValida(n) {
    n = toLowerCase(n);
    for (k = 0; k < extensiones.length; k++) if (endsWith(n, extensiones[k])) return true;
    return false;
}

function abrirImagen(ruta) {
    r = toLowerCase(ruta);
    if (endsWith(r, ".czi") || endsWith(r, ".lif") || endsWith(r, ".nd2") || endsWith(r, ".lsm") || endsWith(r, ".oib")) {
        run("Bio-Formats Importer", "open=[" + ruta + "] autoscale color_mode=Default view=Hyperstack stack_order=XYCZT series_1");
    } else {
        open(ruta);
    }
}

function aplicarEscala(nombre) {
    // Variante modo "manual": run("Set Scale...", "distance=1 known=0.65 unit=micron"); return true;
    getPixelSize(unidad, pw, ph);
    if (unidad == "micron" || unidad == "microns" || unidad == "µm" || unidad == "um") return true;
    print("  AVISO: " + nombre + " no tiene escala en micras (" + unidad + "). Se omite.");
    print("  Solución: en la receteta, elige 'Escala manual' e introduce las micras por píxel.");
    return false;
}
```

Notas para Claude Code sobre el esqueleto:

- En el lenguaje de macros de ImageJ las variables globales usadas dentro de funciones deben declararse con `var` al principio del macro (p. ej. `var extensiones;`). Verifica el ámbito de `extensiones`, `dirSalida` y `fila` y usa `var` donde haga falta.
- `open()` aborta el macro si el archivo está dañado; no hay `try/catch` en este lenguaje. Documéntalo en errores comunes (sección 11).
- Los archivos `.lif` y `.czi` con varias series: en la versión 1 solo se abre la primera (`series_1`) y se avisa en la interfaz. Abrir todas las series queda para una versión posterior.
- El `print()` sale en la ventana Log de Fiji, que la usuaria verá al terminar.

## 8. Análisis de mamosferas

Es el análisis prioritario: cuenta esferas por imagen, mide su tamaño y calcula la eficiencia de formación de esferas (SFE). Se asume una imagen por pocillo en la versión 1.

Parámetros (`ParametrosEsferas`), con el texto de ayuda que mostrará "¿Qué es esto?":

| Campo | Tipo y valor por defecto | Rango | Texto de ayuda |
| --- | --- | --- | --- |
| `canal` | entero, 1 | 1–8 | Si la imagen tiene varios canales, cuál se analiza. En campo claro suele ser el 1. |
| `metodo` | `'bordes'` \| `'umbral'`, `'bordes'` | — | "Por bordes" detecta el contorno de cada esfera; funciona mejor en campo claro con halo. "Por contraste" separa oscuro de claro; solo para fondos muy uniformes. |
| `suavizado` | número, 2 | 0–10 px | Difumina un poco la imagen para que el ruido no se confunda con esferas. 0 = sin suavizado. |
| `radioBordes` | número, 4 | 1–15 px | Solo "por bordes". Grosor del contorno que se busca. Súbelo si las esferas salen partidas. |
| `restarFondo` | `{ activo: true, radio: 50 }` | 10–500 px | Solo "por contraste". Corrige la iluminación desigual. El radio debe ser mayor que la esfera más grande, en píxeles. |
| `metodoUmbral` | lista, `'Otsu'` | Otsu, Default, Huang, Li, Triangle, Mean, MaxEntropy, Yen | Regla automática para decidir qué es objeto y qué fondo. Otsu funciona en la mayoría de casos; prueba Triangle si se pierden esferas pálidas. |
| `rellenarHuecos` | sí/no, sí | — | Rellena el interior de las esferas, que en campo claro a veces es claro como el fondo. |
| `limpiarRuido` | sí/no, sí | — | Elimina puntitos y bordes finos sueltos (operación "Open"). |
| `separarTocandose` | sí/no, no | — | Separa esferas pegadas (Watershed). Cuidado: puede partir en dos esferas irregulares y aumentar el recuento. Revisa las imágenes de control. |
| `diametroMin` | número, 50 | 10–500 µm | Tamaño mínimo para contar como esfera. 50 µm es el criterio más habitual en la bibliografía; usa el de tu laboratorio. |
| `diametroMax` | número o vacío, vacío | > mínimo | Tamaño máximo. Útil para descartar agregados enormes. Vacío = sin límite. |
| `circularidadMin` | número, 0,4 | 0–1 | 1 es un círculo perfecto. Bájalo si se pierden esferas irregulares; súbelo si se cuelan restos alargados. |
| `excluirBordes` | sí/no, sí | — | No cuenta las esferas cortadas por el borde de la imagen. |
| `celulasSembradas` | entero o vacío, vacío | ≥ 1 | Células sembradas por pocillo. Si lo rellenas, se calcula la SFE. Solo tiene sentido si la imagen abarca el pocillo entero. |
| `salidas` | objetos, resumen, control, rois: todos sí | — | Qué archivos guardar. |

Conversión del tamaño: Fiji filtra por área, no por diámetro. El generador convierte con el área de un círculo equivalente, área = π × (d/2)². Para 50 µm, 1963,50 µm². En el macro se escribe con punto: `size=1963.50-Infinity`.

Cálculo de la SFE:

```latex
\mathrm{SFE}\,(\%) = \frac{\text{esferas contadas}}{\text{células sembradas}} \times 100
```

Función `analizar()` de referencia para el método "por bordes" (Claude Code genera las variantes según los parámetros y las verifica en Fiji):

```javascript
var fila = 0;  // al principio del macro, junto al resto de globales

function analizar(nombre) {
    base = File.getNameWithoutExtension(nombre);
    // Proyección Z si es una pila (según la receteta)
    if (nSlices > 1 && nChannels == 1) run("Z Project...", "projection=[Max Intensity]");
    if (nChannels > 1) Stack.setChannel(1);
    idOriginal = getImageID();

    // Copia de trabajo: le damos el nombre del archivo para que aparezca en la tabla
    run("Duplicate...", "title=copia");
    rename(base);
    run("8-bit");

    // Buscamos los contornos de las esferas
    run("Gaussian Blur...", "sigma=2");
    run("32-bit");
    run("Variance...", "radius=4");
    setAutoThreshold("Otsu dark");
    run("Convert to Mask");

    // Limpiamos la máscara
    run("Fill Holes");
    run("Open");

    // Contamos y medimos: diámetro mínimo 50 µm (área 1963.50 µm²), circularidad ≥ 0.4
    inicio = nResults;
    roiManager("reset");
    run("Analyze Particles...", "size=1963.50-Infinity circularity=0.40-1.00 show=Nothing display exclude add");
    n = nResults - inicio;

    // Resumen de esta imagen
    sumaDiam = 0; sumaArea = 0;
    for (j = inicio; j < nResults; j++) {
        sumaDiam += getResult("Feret", j);
        sumaArea += getResult("Area", j);
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
    // Solo si la receteta tiene células sembradas (p. ej. 1000):
    Table.set("SFE_porcentaje", fila, n / 1000 * 100, "Resumen");
    fila++;

    // Imagen de control: la original con las esferas detectadas en amarillo
    selectImage(idOriginal);
    if (n > 0) {
        roiManager("Set Color", "yellow");
        roiManager("Set Line Width", 2);
        run("From ROI Manager");
        roiManager("Save", dirSalida + "rois" + File.separator + base + ".zip");
    }
    run("Flatten");
    saveAs("Jpeg", dirSalida + "control" + File.separator + base + "_control.jpg");
}
```

Variante "por contraste": sustituir el bloque de contornos por

```javascript
run("Subtract Background...", "rolling=50 light");
run("Gaussian Blur...", "sigma=2");
setAutoThreshold("Otsu");   // sin "dark": objetos oscuros sobre fondo claro
run("Convert to Mask");
```

Puntos a verificar en Fiji: que la columna `Label` de `objetos.csv` lleve el nombre del archivo; que `From ROI Manager` y `Flatten` funcionen en modo batch; que `Feret` esté en micras; que imágenes RGB (JPG de cámara) pasen bien a 8 bits.

Archivos de salida: `resumen.csv` (una fila por imagen), `objetos.csv` (una fila por esfera, con área, perímetro, Feret, circularidad), `control/*.jpg` y `rois/*.zip` (se pueden abrir en Fiji para revisar o corregir a mano).

## 9. Análisis de fluorescencia

Cuenta núcleos en un canal y mide, núcleo a núcleo, la intensidad de hasta tres marcadores en otros canales. Si se da un umbral, calcula el porcentaje de células positivas; si no, exporta las intensidades para decidir el umbral después.

Parámetros (`ParametrosFluorescencia`):

| Campo | Tipo y valor por defecto | Rango | Texto de ayuda |
| --- | --- | --- | --- |
| `canalNucleos` | entero, 1 | 1–8 | Canal de la tinción nuclear (DAPI o Hoechst). |
| `marcadores` | lista de `{ nombre, canal, umbralPositivo }`, vacía | 0–3 elementos | Cada marcador que quieres medir: su nombre (p. ej. "CD44"), su canal y, opcionalmente, la intensidad a partir de la cual una célula es positiva. |
| `deteccion` | `'umbral'` \| `'stardist'`, `'umbral'` | — | "Umbral" funciona sin instalar nada. "StarDist" usa inteligencia artificial y separa mucho mejor los núcleos pegados, pero hay que instalar el plugin (ver instrucciones). |
| `metodoUmbral` | lista, `'Otsu'` | igual que en esferas | Solo con "umbral". |
| `restarFondoRadio` | número, 50 | 0–500 px | Corrige el fondo de la fluorescencia. 0 = no corregir. Debe ser bastante mayor que un núcleo. |
| `separarNucleos` | sí/no, sí | — | Solo con "umbral". Separa núcleos pegados (Watershed). |
| `probabilidadStardist` | número, 0,5 | 0–1 | Solo StarDist. Más alto = menos núcleos dudosos. |
| `solapamientoStardist` | número, 0,4 | 0–1 | Solo StarDist. Más alto = admite núcleos más solapados. |
| `areaNucleoMin` / `areaNucleoMax` | números, 20 y 500 | µm² | Descarta restos pequeños y grupos grandes. Un núcleo típico de célula de mama en cultivo ocupa unas decenas a pocos cientos de µm²; ajústalo mirando las imágenes de control. |
| `excluirBordes` | sí/no, sí | — | No cuenta núcleos cortados por el borde. |
| `medida` | `'media'` \| `'integrada'`, `'media'` | — | "Media": brillo medio dentro del núcleo (recomendado para decidir positivo/negativo). "Integrada": brillo total, depende del tamaño. |

Aviso que debe mostrar la interfaz junto al umbral: "Decide el umbral con tus controles negativos (sin anticuerpo primario o isotipo) analizados con esta misma receteta. Usa siempre las mismas condiciones de adquisición."

Ayuda adicional (fase 2 de este análisis): una pantalla "Calcular umbral" donde se importa el `objetos.csv` de un control negativo y la app propone como umbral el percentil 99 (configurable) de la intensidad del marcador.

Esquema de `analizar()` (Claude Code lo escribe completo y lo verifica en Fiji):

```javascript
function analizar(nombre) {
    base = File.getNameWithoutExtension(nombre);
    if (nChannels < 2) { print("  AVISO: " + nombre + " solo tiene un canal. Se omite."); return; }
    if (nSlices > 1) run("Z Project...", "projection=[Max Intensity]");  // si la receteta lo pide
    idOriginal = getImageID();

    // 1. Núcleos (canal 1)
    run("Duplicate...", "title=nucleos duplicate channels=1");
    run("Subtract Background...", "rolling=50");
    run("Gaussian Blur...", "sigma=1");
    setAutoThreshold("Otsu dark");
    run("Convert to Mask");
    run("Fill Holes");
    run("Watershed");
    roiManager("reset");
    run("Analyze Particles...", "size=20-500 show=Nothing exclude add");
    nNuc = roiManager("count");

    // 2. Una fila por núcleo: medimos área y posición en el canal nuclear
    selectImage(idOriginal);
    run("Duplicate...", "title=dapi duplicate channels=1");
    rename(base);
    inicio = nResults;
    roiManager("Measure");

    // 3. Para cada marcador, su intensidad en cada núcleo (ejemplo: CD44 en canal 2, umbral 850)
    selectImage(idOriginal);
    run("Duplicate...", "title=marcador_CD44 duplicate channels=2");
    run("Subtract Background...", "rolling=50");
    positivos = 0;
    for (k = 0; k < nNuc; k++) {
        roiManager("select", k);
        getStatistics(area, media);
        setResult("CD44_media", inicio + k, media);
        if (media > 850) { positivos++; setResult("CD44_positivo", inicio + k, 1); }
        else setResult("CD44_positivo", inicio + k, 0);
    }
    updateResults();

    // 4. Resumen de la imagen
    Table.set("Imagen", fila, base, "Resumen");
    Table.set("Nucleos", fila, nNuc, "Resumen");
    Table.set("CD44_positivos", fila, positivos, "Resumen");
    if (nNuc > 0) Table.set("CD44_porcentaje", fila, positivos / nNuc * 100, "Resumen");
    fila++;

    // 5. Imagen de control: positivos en verde, negativos en magenta, sobre el compuesto
    // (colorear cada ROI con roiManager("select", k); roiManager("Set Color", "green"|"magenta"))
}
```

StarDist: comprobar primero que está instalado y, si no, parar con un mensaje claro.

```javascript
List.setCommands;
if (List.get("StarDist 2D") == "") exit("Esta receteta usa StarDist, que no está instalado.\nEn Fiji: Help > Update... > Manage update sites > marca CSBDeep y StarDist > Apply and Close > Apply changes, y reinicia Fiji.");

// Detección de núcleos con StarDist (sustituye al bloque de umbral)
selectImage("nucleos");
run("Command From Macro", "command=[de.csbdresden.stardist.StarDist2D], args=['input':'nucleos', 'modelChoice':'Versatile (fluorescent nuclei)', 'normalizeInput':'true', 'percentileBottom':'1.0', 'percentileTop':'99.8', 'probThresh':'0.5', 'nmsThresh':'0.4', 'outputType':'ROI Manager', 'nTiles':'1', 'excludeBoundary':'2', 'roiPosition':'Automatic', 'verbose':'false', 'showCsbdeepProgress':'false', 'showProbAndDist':'false'], process=[false]");
// StarDist no filtra por tamaño: recorrer el ROI Manager hacia atrás y borrar los ROI fuera del rango de área
```

La cadena exacta de StarDist depende de la versión del plugin: Claude Code debe grabarla con la grabadora de macros sobre una instalación real y ajustar el generador a lo que salga. Las imágenes RGB (sin canales separados) no son válidas para este análisis; la app debe advertirlo en el paso de imágenes.

## 10. Western blot semiautomático

El western blot no se automatiza del todo: la usuaria marca las bandas con el ratón y el macro hace el resto (corregir, medir, comprobar saturación y guardar). Es el único macro interactivo y procesa una imagen cada vez.

Parámetros (`ParametrosWestern`):

| Campo | Tipo y valor por defecto | Texto de ayuda |
| --- | --- | --- |
| `bandasOscuras` | sí/no, sí | Bandas oscuras sobre fondo claro (lo normal en quimioluminiscencia exportada). El macro invierte la imagen para que más señal = número más alto. |
| `fondo` | `'rollingBall'` \| `'ninguno'`, `'rollingBall'` | Cómo se resta el fondo de la membrana. |
| `radioFondo` | número, 50 px | Debe ser mayor que la altura de una banda. |
| `nombreProteina` | texto, vacío | Aparece en el nombre del archivo de resultados (p. ej. "SOX2", "β-actina"). |
| `avisarSaturacion` | sí/no, sí | Avisa si hay píxeles saturados: en ese caso la cuantificación no es fiable y hay que usar una exposición más corta. |

Avisos fijos en la interfaz de este análisis:

- Usa la imagen original del equipo de adquisición en TIFF (idealmente de 16 bits), nunca un JPG ni una captura de pantalla.
- Mide la proteína de interés y el control de carga con la misma receteta y normaliza después: señal / control de carga, y luego respecto a la condición control.
- Mide todas las bandas con el mismo rectángulo.

Esquema del macro (completo en el generador; verificar en Fiji):

```javascript
requires("1.54f");
ruta = File.openDialog("Elige la imagen del western blot (TIFF)");
open(ruta);
base = File.getNameWithoutExtension(ruta);
dirSalida = File.getDirectory(ruta);
if (bitDepth() == 24) run("8-bit");
run("Set Measurements...", "area mean min integrated display redirect=None decimal=3");

// Comprobamos si hay píxeles saturados (negro puro o blanco puro)
getRawStatistics(nPix, media, minimo, maximo);
maxPosible = pow(2, bitDepth()) - 1;
if (minimo == 0 || maximo == maxPosible)
    showMessage("Atención", "La imagen tiene píxeles saturados.\nLa cuantificación de esas bandas puede no ser fiable.");

// Bandas oscuras sobre fondo claro: invertimos para que más señal = valor más alto
run("Invert");
run("Subtract Background...", "rolling=50");

// La usuaria marca las bandas
roiManager("reset");
setTool("rectangle");
waitForUser("Marca las bandas",
    "1. Dibuja un rectángulo que abarque la banda más grande.\n" +
    "2. Pulsa la tecla T para añadirla a la lista.\n" +
    "3. Arrastra ese MISMO rectángulo a la siguiente banda y pulsa T.\n" +
    "4. Repite de izquierda a derecha.\n" +
    "5. Cuando termines, pulsa OK.");
n = roiManager("count");
if (n == 0) exit("No has marcado ninguna banda.");

// Medimos y numeramos los carriles
run("Clear Results");
roiManager("Measure");
for (k = 0; k < n; k++) setResult("Carril", k, k + 1);
updateResults();
saveAs("Results", dirSalida + base + "_SOX2_bandas.csv");

// Imagen de control con los rectángulos numerados
roiManager("Show All with labels");
run("Flatten");
saveAs("Jpeg", dirSalida + base + "_SOX2_control.jpg");
showMessage("Recetetas", n + " bandas medidas.\nResultados junto a la imagen original.");
```

La columna a usar es `RawIntDen` (señal total de la banda). La interfaz debe decirlo en el resumen de la receteta. Como alternativa, las instrucciones mencionan el método clásico de Fiji (Analyze › Gels), sin generarlo.

## 11. Instrucciones dentro de la app: cómo pegar y lanzar el macro en Fiji

Esta guía se muestra en la pantalla Instrucciones y en un panel desde Resultado. El texto siguiente es el contenido final de la interfaz: Claude Code lo copia a `textos/es.ts` tal cual, dividido en pasos plegables, con un hueco para captura en cada paso. Claude Code debe comprobar cada ruta de menú en la versión actual de Fiji y corregir lo que haya cambiado.

**A. Si aún no tienes Fiji**

1. Descarga Fiji desde imagej.net/software/fiji/downloads (elige tu sistema).
2. Descomprime la carpeta en un sitio donde tengas permisos de escritura, por ejemplo en Documentos. En Windows, no la pongas en "Archivos de programa": Fiji no podría actualizarse.
3. En Mac, si al abrirla dice que no se puede verificar el desarrollador, haz clic derecho sobre Fiji › Abrir.

**B. Lleva el macro al ordenador donde está Fiji** (elige una)

- Opción 1: en la app, pulsa "Descargar .ijm" o "Enviar al ordenador" y abre el archivo en el ordenador.
- Opción 2: envíate el enlace de la receteta, ábrelo en el ordenador y pulsa "Copiar macro".

**C. Abrir el macro en Fiji** (elige una)

- Con archivo `.ijm`: arrastra el archivo sobre la ventana principal de Fiji (la barra de herramientas). Se abre en el editor de scripts.
- Pegando el texto:
  1. En Fiji, ve a File › New › Script…
  2. En el editor que se abre, menú Language › IJ1 Macro. Este paso es imprescindible: si el lenguaje es otro, el macro dará errores.
  3. Haz clic dentro del editor y pega con Ctrl+V (Cmd+V en Mac).

**D. Lanzarlo**

1. Pulsa el botón Run, abajo a la izquierda del editor, o Ctrl+R (Cmd+R en Mac).
2. Fiji te pedirá la carpeta con las imágenes. Elige la carpeta (no una imagen suelta).
3. Después te pedirá dónde guardar los resultados. Usa una carpeta vacía y distinta de la de las imágenes.
4. Espera. En la barra de Fiji verás el progreso y en la ventana Log, cada imagen procesada.
5. Al terminar aparece el mensaje "Terminado" con el número de imágenes.

En western blot el macro te pide una sola imagen y se detiene para que marques las bandas: sigue las instrucciones de la ventana emergente.

**E. Revisa los resultados**

- `resumen.csv`: una fila por imagen (recuento, tamaños medios, SFE o porcentaje de positivas). Se abre con Excel.
- `objetos.csv`: una fila por esfera o núcleo, con todas las medidas.
- Carpeta `control`: cada imagen con lo detectado marcado. **Mírala siempre**: es la forma de saber si la receteta funciona.
- Carpeta `rois`: las selecciones, que puedes abrir en Fiji (arrastra el `.zip` sobre Fiji con la imagen abierta) para revisar o corregir.

Si Excel muestra los números mal (todo en una columna o decimales raros), impórtalo con Datos › Desde texto/CSV, separador coma y punto como separador decimal.

**F. Guardar el macro para usarlo más veces**

- En el editor: File › Save As… y nombre terminado en `.ijm`.
- Para tenerlo en el menú de Fiji: guárdalo dentro de la carpeta de Fiji en `scripts/Plugins/Recetetas/` y reinicia Fiji. Aparecerá en Plugins › Recetetas.

**G. Instalar StarDist (solo para recetetas que lo usan)**

1. Help › Update…
2. Botón Manage update sites.
3. Marca CSBDeep y StarDist.
4. Apply and Close, después Apply changes.
5. Reinicia Fiji.

**H. Antes de usar una receteta para datos de la tesis**

1. Lánzala sobre 5–10 imágenes representativas, incluidas las más difíciles.
2. Cuenta a mano esas mismas imágenes y compara.
3. Ajusta la receteta hasta que coincidan razonablemente y mira las imágenes de control.
4. A partir de ahí, no cambies la receteta en mitad de un experimento: todas las condiciones se analizan con la misma.
5. Guarda el `.ijm` junto a los datos: la cabecera documenta todos los parámetros.

**Errores comunes**

| Qué ves | Causa probable | Solución |
| --- | --- | --- |
| "Statement cannot begin with…" u otro error en la primera línea | El editor no está en IJ1 Macro | Language › IJ1 Macro y vuelve a pulsar Run |
| "Esta receteta usa StarDist, que no está instalado" | Falta el plugin | Paso G |
| "No se ha encontrado ninguna imagen válida" | Extensión distinta de la elegida en la receteta | Revisa el formato de tus archivos en el paso Imágenes de la receteta |
| En el Log: "no tiene escala en micras. Se omite" | La imagen no guarda el tamaño de píxel (típico en JPG o TIFF exportados) | Elige "Escala manual" en la receteta e introduce las micras por píxel de tu objetivo |
| El macro se para con "File is not in a supported format" o similar | Un archivo dañado o de otro tipo en la carpeta | Sácalo de la carpeta y vuelve a lanzar |
| Cuenta demasiadas esferas o núcleos | Ruido o restos detectados | Sube el tamaño mínimo o la circularidad; activa limpiar ruido |
| Cuenta muy pocas | Umbral demasiado estricto o esferas pálidas | Prueba otro método de umbral (Triangle, Li) o el método por bordes |
| Esferas partidas en varios trozos | Watershed activado o contornos discontinuos | Desactiva "Separar esferas pegadas" o sube el radio de bordes |
| Fiji va muy lento o da error de memoria | Imágenes muy grandes | Edit › Options › Memory & Threads y asigna más memoria (hasta un 75 % de la RAM) |
| Los resultados parecen en píxeles | Escala no aplicada | Revisa el paso de escala de la receteta |

## 12. Texto automático para Materiales y Métodos

Cada receteta genera un párrafo de Materiales y Métodos, en español o en inglés, que describe exactamente el análisis. Es una función pura `generarMetodos(receteta, idioma): string` en `src/dominio/metodos/`, con pruebas de instantánea como el macro.

Reglas:

- Solo menciona los pasos activos en la receteta, en el mismo orden que el macro.
- Los números siguen la convención del idioma: coma decimal en español (0,4), punto en inglés (0.4).
- Deja entre corchetes lo que la app no sabe y la usuaria debe completar: `[versión de Fiji]`, `[aumento del objetivo]`, `[n.º de pocillos por condición]`.
- Cita Fiji con la referencia estándar (Schindelin et al., 2012, Nature Methods) y StarDist cuando se use (Schmidt et al., 2018, MICCAI). Claude Code debe verificar estas referencias antes de incluirlas.
- Botones: "Copiar", "Cambiar idioma" y una nota: "Revisa el texto y adáptalo al estilo de tu tesis".

Ejemplo de salida para la plantilla "Mamosferas · campo claro" con 1000 células sembradas:

> Las imágenes de mamosferas se analizaron en Fiji (\[versión de Fiji\]; Schindelin et al., 2012) mediante un macro personalizado aplicado por igual a todas las condiciones. Las imágenes se convirtieron a 8 bits y se suavizaron con un filtro gaussiano (σ = 2 píxeles). Los contornos de las esferas se detectaron con un filtro de varianza (radio = 4 píxeles) seguido de un umbral automático por el método de Otsu; las máscaras resultantes se rellenaron y se depuraron mediante una apertura morfológica. Se consideraron esferas los objetos con un diámetro equivalente ≥ 50 µm y una circularidad ≥ 0,4, excluyendo los que tocaban el borde de la imagen. La eficiencia de formación de esferas (SFE) se calculó como el número de esferas dividido entre el número de células sembradas (1000 por pocillo) × 100.

> Mammosphere images were analysed in Fiji (\[Fiji version\]; Schindelin et al., 2012) using a custom macro applied identically to all conditions. Images were converted to 8-bit and smoothed with a Gaussian filter (σ = 2 pixels). Sphere outlines were detected with a variance filter (radius = 4 pixels) followed by automatic Otsu thresholding; the resulting masks were hole-filled and cleaned by morphological opening. Objects with an equivalent diameter ≥ 50 µm and circularity ≥ 0.4 were scored as spheres, excluding those touching the image border. Sphere-forming efficiency (SFE) was calculated as the number of spheres divided by the number of seeded cells (1,000 per well) × 100.

## 13. Análisis rápido en el navegador (fase final)

Es un recuento orientativo de esferas en el propio móvil, a partir de una foto o un archivo, usando los parámetros de una receteta de esferas. No sustituye a Fiji para los datos de la tesis, y la pantalla debe decirlo siempre de forma visible: "Resultado orientativo. Para la tesis, usa el macro en Fiji".

Flujo:

1. Elegir una receteta de esferas (o los valores por defecto).
2. Hacer una foto (`<input type="file" accept="image/*" capture="environment">`) o subir JPG, PNG o TIFF.
3. Fijar la escala: escribir micras por píxel o **calibrar con la barra de escala**: la usuaria toca los dos extremos de la barra de escala de la imagen y escribe cuántas µm mide. La app calcula µm/píxel y ofrece guardarlo en la receteta.
4. Ver el resultado: la imagen con los contornos detectados superpuestos, el número de esferas y el diámetro medio. Deslizadores en vivo para tamaño mínimo y circularidad.
5. Botón "Usar estos ajustes en la receteta".

Implementación:

- Procesado en un Web Worker para no bloquear la interfaz, en TypeScript sin librerías pesadas.
- Reescalar a un máximo de 2048 px en el lado largo antes de procesar, ajustando la escala en proporción.
- Pipeline equivalente al de Fiji: escala de grises → desenfoque gaussiano → (bordes: varianza local | contraste: umbral de Otsu) → rellenar huecos → apertura morfológica → etiquetado de componentes conexas → filtros de área, circularidad (4π·área/perímetro²) y borde.
- TIFF con la librería UTIF.js (única dependencia permitida aquí). Si el TIFF es de 16 bits, normalizar a 8 bits por percentiles 0,1–99,9.
- Mostrar el resultado en un `<canvas>` que se adapta al ancho y permite ampliar con pellizco.
- Nada sale del dispositivo; la imagen no se guarda.
- Prueba: con las imágenes sintéticas de la sección 14, el recuento del navegador debe coincidir con el de Fiji en ± 5 %.

## 14. Pruebas, incluida la validación con Fiji real

Un macro que no se ha ejecutado en Fiji no está terminado. Claude Code descarga Fiji en su entorno, genera imágenes sintéticas con resultado conocido y comprueba que cada plantilla da el número correcto.

**Pruebas unitarias (Vitest)**

- `num()`: "0,65" y "0.65" producen `0.65`; nunca sale una coma en el macro.
- `cadena()` y `comentario()`: comillas, barras invertidas, saltos de línea y `*/` en el nombre de la receteta.
- Conversión diámetro → área: 50 µm → `1963.50`.
- Esquemas Zod: valores por defecto, rangos, mínimo < máximo, errores en español.
- Compartir por enlace: codificar y decodificar devuelve la misma receteta; un enlace manipulado se rechaza con un mensaje claro.
- Texto de Métodos: coma decimal en español y punto en inglés.

**Instantáneas del macro**

- Un snapshot por plantilla y por combinación relevante de opciones (bordes/contraste, con y sin SFE, umbral/StarDist, escala archivo/manual).
- Los snapshots solo se actualizan revisando el cambio a mano; el commit explica por qué cambió el macro.

**Validación en Fiji (scripts en `scripts/`)**

1. `scripts/instalar-fiji.sh`: descarga la última versión de Fiji para Linux desde imagej.net y la descomprime en `.fiji/` (ignorado por git). Comprobar el nombre actual del ejecutable de la versión descargada.
2. `scripts/generar-sinteticas.py` (numpy + tifffile): crea imágenes con resultado conocido y escala guardada en metadatos (0,65 µm/píxel, unidad micra):
   - Esferas: fondo claro con ruido, 12 discos oscuros con borde más oscuro, de los que 8 miden ≥ 50 µm, 3 miden menos y 1 toca el borde. Esperado: 8.
   - Fluorescencia: 2 canales, 40 núcleos en el canal 1, de los que 10 son brillantes en el canal 2. Esperado: 40 núcleos y 25 % positivas con el umbral de la prueba.
   - Una copia sin escala para comprobar el aviso, y un JPG RGB.
3. `scripts/validar-macros.ts`: para cada plantilla, genera el `.ijm`, lo ejecuta con Fiji pasando las carpetas por argumento (`"entrada|salida"`) y compara `resumen.csv` con lo esperado (recuento exacto en sintéticas).
4. Ejecutar Fiji con pantalla virtual (`xvfb-run`) en lugar de `--headless`: el ROI Manager y `Flatten` pueden fallar sin pantalla.
5. El western blot es interactivo: probar solo que el macro abre, invierte y mide unas ROI cargadas desde un `.zip` de prueba (variante de test que salta `waitForUser` cuando hay argumento).
6. StarDist: instalar los update sites CSBDeep y StarDist en la Fiji de pruebas. Si no es posible en el entorno, marcar la prueba como pendiente y avisar a la usuaria; nunca darla por buena sin ejecutarla.

**Pruebas de interfaz (Playwright)**

- Flujos: crear desde plantilla → ajustar → guardar → copiar macro; editar y duplicar; importar enlace; exportar e importar `.json`; borrar con deshacer.
- Responsive: cada pantalla en 320, 375, 414, 768, 1024 y 1440 px sin scroll horizontal (sección 4), y capturas de cada una guardadas como artefacto para que la diseñadora las revise.
- Sin conexión: tras la primera visita, la app carga y genera macros en modo offline.
- Accesibilidad básica con `@axe-core/playwright`: sin errores críticos.

**Comprobación manual antes de entregar**

- [ ] Instalar la PWA en un iPhone (Safari › Compartir › Añadir a pantalla de inicio) y en un Android (Chrome).
- [ ] Crear una receteta en el móvil, enviarla al ordenador por enlace y por `.ijm`, y lanzarla en Fiji en Windows y Mac.
- [ ] Probar con 5–10 imágenes reales de la usuaria y comparar con su recuento manual.
- [ ] Comprobar que el teclado no tapa campos ni la barra inferior.

## 15. Fases de desarrollo y criterios de aceptación

Siete fases. Al terminar la fase 2 ya hay una app útil que regalar: mamosferas de principio a fin. Antes de seguir, la usuaria la prueba con sus imágenes reales y se ajusta.

**Fase 0 · Base del proyecto**

- Vite + React + TypeScript estricto, ESLint y Prettier, Vitest y Playwright configurados.
- PWA instalable con iconos provisionales, rutas con hash, layout responsive con barra inferior fija en móvil.
- `tokens.css`, `base.css`, `textos/es.ts`, `CLAUDE.md`, `DISEÑO.md` y `spec.md`.
- Criterios: `npm run build` sin errores; las 6 pantallas (vacías) navegables; prueba de Playwright sin scroll horizontal en los 6 anchos; la app se instala y abre sin conexión.

**Fase 1 · Recetetas**

- Tipos, esquemas Zod, almacenamiento con migración, plantillas, pantalla Inicio, asistente con pasos y ayudas "¿Qué es esto?", Ajustes (exportar, importar, borrar), compartir por enlace.
- Criterios: crear, editar, duplicar, renombrar, borrar con deshacer y compartir funcionan en móvil y escritorio; un enlace abierto en otro navegador recupera la receteta idéntica; recetetas corruptas apartadas sin perder las demás.

**Fase 2 · Mamosferas, Resultado e Instrucciones (primera entrega)**

- Generador común + esferas (secciones 7 y 8), pantalla Resultado con copiar, descargar `.ijm` y compartir, vista previa en vivo en escritorio, pantalla Instrucciones (sección 11).
- Criterios: snapshots de las dos plantillas de esferas; en Fiji real, las sintéticas dan exactamente 8 esferas; la imagen sin escala genera el aviso y no rompe el lote; el macro copiado desde un móvil y pegado en Fiji en Windows y Mac funciona.
- **Puerta:** prueba con imágenes reales de la usuaria. No se empieza la fase 3 hasta tener su visto bueno.

**Fase 3 · Texto para Métodos**

- Generador en español e inglés (sección 12) para esferas, preparado para los otros tipos.
- Criterios: snapshots en los dos idiomas; los números siguen la convención de cada idioma; referencias verificadas.

**Fase 4 · Fluorescencia**

- Generador con umbral y con StarDist, hasta 3 marcadores, pantalla "Calcular umbral" desde un control negativo.
- Criterios: sintéticas con 40 núcleos y 25 % de positivas; aviso claro si falta StarDist; texto de Métodos para fluorescencia.

**Fase 5 · Western blot**

- Macro semiinteractivo (sección 10) con comprobación de saturación.
- Criterios: la variante de prueba mide las ROI de ejemplo y numera los carriles; el aviso de saturación aparece con una imagen saturada.

**Fase 6 · Análisis rápido en el navegador**

- Sección 13, incluida la calibración con barra de escala.
- Criterios: diferencia con Fiji ≤ 5 % en las sintéticas; procesa una foto de 12 MP en menos de 3 s en un móvil de gama media; la interfaz no se bloquea durante el procesado.

Pendiente de decidir con la usuaria antes de la fase 2: qué microscopio y objetivo usa (para la escala por defecto), en qué formato guarda las imágenes y cuántas células siembra por pocillo.
