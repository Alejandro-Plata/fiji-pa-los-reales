# DISEÑO.md — componentes, estados y tokens

Fuente de verdad visual: `DESIGN.md`. Todos los valores viven en `src/estilos/tokens.css`:
primero los tokens de DESIGN.md con sus nombres, después los alias semánticos de la spec
(`--color-fondo`, `--espacio-1…8`, `--radio-s/m/l`, `--texto-s/m/l/xl`…).

## Decisiones al combinar la spec con DESIGN.md (aprobadas por la usuaria)
| Tema | Decisión |
| --- | --- |
| Polaridad | Lienzo claro en pantallas de trabajo; banda oscura solo en la portada de Inicio. Sin modo oscuro automático. |
| Puntos de corte | Disposición: 600 y 1024 px (spec). Tipografía y márgenes: escalera de DESIGN.md. Menú hamburguesa < 768 px. |
| Tipografía | `clamp()` entre los valores de DESIGN.md. Display: Space Grotesk (sustituto). UI: Rubik. Ambas autoalojadas. Código: Monaco, Menlo, Ubuntu Mono, monospace. |
| Código | Scroll horizontal por defecto; opción «Ajustar líneas». 16 px en todos los anchos. |
| Foco | Anillo `--ring-focus` (#9dc1f5) de 3 px en todo elemento interactivo. |
| Colores con dos valores en DESIGN.md | Se usan los hex de la cabecera YAML. |
| Estados error/aviso/éxito | DESIGN.md no los define: rosa, violeta medio y lima como marcas (bordes y fondos), nunca como texto. |
| Ilustraciones | Mascotas y fondo de estrellas: huecos pendientes de recursos. Solo se dibuja el garabato lima del pie (SVG). |
| Botón deshabilitado | Tal cual DESIGN.md (contraste bajo aceptado en deshabilitados). |

## Componentes
| Componente | Archivo | Tokens DESIGN.md | Estados |
| --- | --- | --- | --- |
| Botón primario | `componentes/Boton` (`primario`) | button-primary / -pressed | normal, pulsado (`:active`), foco, deshabilitado |
| Botón invertido | `invertido` | button-inverted / -pressed, elevation-1/4 | normal, pulsado, foco, deshabilitado |
| Botón secundario | `secundario` | surface-canvas-light, hairline-cool, button-cap-light | normal, pulsado, foco, deshabilitado |
| Botón fantasma | `fantasma` | button-ghost-on-dark | normal, pulsado, foco |
| Botón etiqueta | `token` | button-violet-token | normal, seleccionado (`aria-pressed`), foco |
| Barra superior | `app/Layout` | nav-bar-light | menú abierto/cerrado, enlace activo |
| Pie | `app/Layout` | footer-light + garabato lima | — |
| Barra inferior | `componentes/BarraInferior` | surface-canvas-light, hairline-cloud | fija (móvil), integrada (escritorio), oculta con teclado |
| Pantalla | `componentes/Pantalla` | heading-xl, eyebrow | — |
| Banda portada | `pantallas/Inicio` | surface-canvas-dark, display-large, chip-lime-keyword, body-lg | — |
| Aviso | `app/AvisoAlmacenamiento` | surface-press-light, borde `--color-aviso`, caption | visible/oculto |
| Campo (etiqueta, «Recomendado», «¿Qué es esto?», pista, error) | `componentes/Campo` | body-strong, pill-neutral-dark, caption, borde rosa en error | normal, foco (inset), error, ayuda abierta/cerrada |
| Entrada de texto / número / lista | `componentes/Campo/Controles` | text-input / text-input-focused (hairline-cool, rounded-sm) | normal, foco, error, vacío |
| Selector de opciones (tarjetas / Sí-No / casillas) | `componentes/Selector` | card con hairline-cool; marcada invertida a surface-night (card-pricing-featured) | normal, pulsado, marcado, foco |
| Plegable | `componentes/Plegable` | hairline-cloud, rounded-xl, heading-sm | abierto, cerrado, foco |
| Diálogo | `componentes/Dialogo` | surface-canvas-light, rounded-xl, elevation-2, velo `--color-velo` | abierto, cerrado; ancho normal/amplio |
| Nota | `componentes/Nota` | surface-press-light + marca lateral (info/aviso/error/éxito) | — |
| Avisos emergentes | `app/Avisos` | surface-night, acción button-inverted | visible, con acción («Deshacer»), cerrado |
| Bloque de código | `componentes/BloqueCodigo` | code-block (surface-night, Monaco 16 px, rounded-md), números on-dark-muted | normal, ajustar líneas, compacto (altura máx.), seleccionado |
| Guía de Fiji | `componentes/GuiaFiji` | plegables + huecos rounded-xxl para capturas; tabla densa (tarjetas en móvil) | — |
| Tarjeta de receteta | `pantallas/Inicio/TarjetaReceteta` | card-pricing; favorita invertida | normal, favorita, más acciones abiertas |
| Indicador de pasos | `pantallas/Asistente` | rounded-xl; actual invertido a surface-night | actual, visitado, no visitado (deshabilitado, borde discontinuo) |
| Resultado destacado (umbral, recuento) | `pantallas/Umbral`, `pantallas/Rapido` | card-pricing-featured + display-large | — |
| Lienzo del análisis rápido | `pantallas/Rapido/Lienzo` | rounded-xxl, surface-night; contornos lima (contados) y rosa (descartados) | normal, calibrando (borde lima), con zoom |

## Logo
`public/logo.svg`: mamosfera «cani» en `{colors.accent-lime}` con gorra ladeada
`{colors.accent-violet-deep}` y las iniciales **FPLR** (trazos, no texto), cadena con medallón y
esfera compañera en `{colors.accent-pink}`. Sin fondo: el contorno blanco de pegatina la separa de
cualquier superficie. Único color fuera de DESIGN.md: el oro de la cadena (`#f2c230`), solo en el
logo. `npm run iconos` genera los iconos de la PWA (192 y 512 transparentes; maskable con fondo
blanco) y los de Android (clásicos y redondos transparentes; adaptativos con capa de fondo blanca).

## Tutorial
`pantallas/Tutorial`: ocho diapositivas (`?paso=n`) con ilustraciones SVG animadas en CSS sobre
escenario `surface-canvas-dark` + `rounded-xxl`. Navegación con botones, índice de puntos
(44 px), flechas del teclado y deslizamiento. Todas las animaciones terminan en la figura completa,
de modo que con «reducir movimiento» se ve la ilustración final sin movimiento.

## Registro de los textos
Profesional e impersonal: sin tuteo, instrucciones en infinitivo («Seleccionar la carpeta»),
explicaciones en forma impersonal. Aplica también a los mensajes que muestran los macros en Fiji.

## Huecos para recursos de la diseñadora
- `public/capturas/` — capturas de Fiji de las instrucciones (con texto alternativo).
- Mascotas y fondo de estrellas: sin implementar hasta que haya archivos.
