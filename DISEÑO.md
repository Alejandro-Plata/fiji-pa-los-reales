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

Los componentes de las fases siguientes se añaden a esta tabla al crearlos.

## Huecos para recursos de la diseñadora
- `public/capturas/` — capturas de Fiji de las instrucciones (con texto alternativo).
- `public/iconos/` — iconos provisionales generados por `npm run iconos`.
- Mascotas y fondo de estrellas: sin implementar hasta que haya archivos.
