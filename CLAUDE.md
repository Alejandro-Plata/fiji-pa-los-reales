# Fiji pa los reales — guía para Claude Code

La especificación completa está en `spec.md`. El diseño visual manda según `DESIGN.md`
(decisión de la usuaria: donde la spec y DESIGN.md chocan, se combinan según `DISEÑO.md`).

## Reglas
- Trabajar por fases (spec §15). Cada fase termina con pruebas pasadas.
- Commits pequeños, mensajes en español. No añadir dependencias sin justificarlas en el commit.
  Nada de librerías de componentes con estilo propio.
- El generador de macros es el corazón: todo cambio lleva prueba (spec §14). Comandos de Fiji
  verificados con Fiji real (WSL + xvfb-run).
- Nada se sube a ningún servidor. Todo ocurre en el dispositivo.
- Toda la interfaz en español de España, todos los textos en `src/textos/es.ts`.
  Registro profesional e impersonal: sin tuteo, instrucciones en infinitivo, sin coletillas
  orientativas. También en los mensajes de los macros.
- Estilos: solo `var(--token)` de `src/estilos/tokens.css`. Mobile-first, sin scroll horizontal
  desde 320 px, objetivos táctiles ≥ 44 px, campos ≥ 16 px.
- Nombre de la app: **Fiji pa los reales**.

## Lenguaje de macros IJ1: comprobado en Fiji 1.54p (no repetir estos errores)
- `nChannels` NO existe: usar `getDimensions(ancho, alto, canales, planos, tiempos)`.
- `roiManager("reset")` ANTES de `setBatchMode(true)`; si no, las ROI van a otro gestor.
- Cadenas con tildes: `texto()` (fromCharCode). Con `-macro` el .ijm se lee en cp1252.
- Una expresión que empieza por número no concatena: `"" + n + " bandas"`, nunca `n + " bandas"`.
- No depender de los índices de Results tras Analyze Particles + Measure: tabla propia
  («Objetos») con `getValue()` y `Table.set()`.
- Con ninguna imagen analizable, guardar log.txt antes de `exit()`.

## Pruebas con Fiji real
- `npm run sinteticas` (Python + numpy + tifffile + Pillow) y `npm run validar:fiji`.
- En Windows se usa Fiji con interfaz minimizada (WSL2 no disponible: virtualización desactivada).
- Fiji funciona como instancia única: `scripts/fiji.ts` mata el árbol de procesos entre pruebas.
- StarDist: pendiente de validar (TensorFlow 1.15 se bloquea con el Java 21 de Fiji 2.18 aquí).
  Activar con `FIJI_STARDIST=1` donde funcione.

## Enlaces de receteta desde la app Android
La app nativa necesita la dirección pública de la PWA: `VITE_URL_PUBLICA=https://…` al compilar.
Sin ella, «Compartir» ofrece el archivo .json.
Repositorio: github.com/Alejandro-Plata/fiji-pa-los-reales. Web oficial: https://fiji-pa-los-reales.vercel.app
(Vercel recompila con cada push a main; `vercel.json`). APK e instalador: GitHub Releases.
Netlify (dirección anterior) solo hace de puente: version.json para apps ≤ 1.1.2 y redirección a Vercel.

## Publicar una versión (web + APK + actualizaciones en la app)
1. Subir `version` en package.json (el versionCode de Android se deriva de ella).
2. Añadir sus novedades en `scripts/novedades.json`.
3. `npm run publicar` (requiere `gh auth login`): pruebas, compilación con `VITE_URL_PUBLICA`
   (Vercel), APK firmado e instalador → release `vX.Y.Z` en GitHub → `public/descargas/version.json`
   con esas direcciones, commit y push (Vercel la sirve) → puente en Netlify para apps ≤ 1.1.2.

## App de Windows (Electron)
`escritorio/main.cjs` sirve `dist/` por el protocolo seguro `app://fplr/` (con file:// no funcionan
los workers). `escritorio/preload.cjs` expone solo `window.fplrEscritorio` (abrir https en el
navegador). Sin service worker: se actualiza desde Ajustes, que abre el instalador publicado.
- `npm run windows` → `release/` (instalador NSIS y portátil). `npm run escritorio` abre `dist/`.
- Prueba de humo del paquete: `node tests/escritorio/humo.mjs`.
- `npm run publicar` incluye el instalador en `descargas/` (`--sin-windows` para omitirlo).
- Si falta el binario de Electron (npm bloquea scripts de instalación):
  `node node_modules/electron/install.js`.
- Sin certificado de firma de código: SmartScreen muestra aviso la primera vez.

## Firma del APK
Clave propia FUERA del repositorio: `~/.fiji-pa-los-reales/firma/` (`fiji-pa-los-reales.jks` +
`firma.properties` con contraseña y alias; otra ruta con la variable `FPLR_FIRMA`). La usa
`assembleRelease`; sin ella no se genera APK firmado y `npm run publicar` se detiene.
Certificado SHA-256: c57f5fd10e529407886f2b5e1217259f3a4222b5e7c0175b3e6d04a124469085.
Si se pierde la clave, las actualizaciones dejan de instalarse: hay que desinstalar la app.
Nunca subir la clave ni su contraseña al repositorio.

## Comandos
- `npm run dev` · `npm run build` · `npm test` (Vitest) · `npm run e2e` (Playwright) · `npm run lint`
- Android: `npm run android` y después `cd android && gradlew assembleDebug`
  (JDK 21 en `JAVA_HOME`, SDK en `%LOCALAPPDATA%\Android\Sdk`).
