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
- Estilos: solo `var(--token)` de `src/estilos/tokens.css`. Mobile-first, sin scroll horizontal
  desde 320 px, objetivos táctiles ≥ 44 px, campos ≥ 16 px.
- Nombre de la app: **Fiji pa los reales**.

## Comandos
- `npm run dev` · `npm run build` · `npm test` (Vitest) · `npm run e2e` (Playwright) · `npm run lint`
- Android: `npm run android` y después `cd android && gradlew assembleDebug`
  (JDK 21 en `JAVA_HOME`, SDK en `%LOCALAPPDATA%\Android\Sdk`).
