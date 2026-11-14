# Validación con bancos públicos de imágenes

Comprueba los macros generados por la app con **imágenes reales** y su segmentación de referencia,
ejecutándolos en Fiji. Complementa a `scripts/validar-macros.test.ts` (imágenes sintéticas).

## Datos (no se incluyen en el repositorio)

Descargar en una carpeta (por defecto `~/datos-prueba-fplr`, o la de la variable `DATOS_PRUEBA`):

| Carpeta | Fuente | Licencia | Contenido |
| --- | --- | --- | --- |
| `bbbc039/` | [BBBC039](https://bbbc.broadinstitute.org/BBBC039) (`images.zip`, `masks.zip`) | CC0 | 200 imágenes de núcleos (Hoechst, U2OS) con máscara de 3 clases |
| `slimia-olympus/` | [SLiMIA](https://doi.org/10.6084/m9.figshare.27390411) `OlympusIX05.zip` | CC BY 4.0 | 88 esferoides en campo claro (4×, OME-TIFF) con segmentación manual |
| `slimia-operaphenix/` | [SLiMIA](https://doi.org/10.6084/m9.figshare.27390402) `OperaPhenix.zip` | CC BY 4.0 | 59 esferoides en campo claro (10×, OME-TIFF) con segmentación manual |

Cada `.zip` se descomprime en una subcarpeta con su mismo nombre.

## Ejecución

```bash
py -I scripts/bancos/verdad.py ~/datos-prueba-fplr          # referencia → verdad.json
VARIANTES=plantilla,contraste-fondo-300 npx vitest run --config vitest.fiji.config.ts scripts/bancos
py -I scripts/bancos/informe.py ~/datos-prueba-fplr scripts/salida/bancos
```

## Resultados (Fiji 2.18, noviembre de 2026)

**Núcleos (BBBC039, plantilla «Núcleos DAPI» sin marcadores, 0,656 µm/píxel):**
21.446 núcleos frente a 19.360 de referencia (+11 %); error de recuento mediano por imagen 10 %.
El exceso procede sobre todo de la separación de núcleos en contacto (Watershed).

**Esferoides (SLiMIA):** son agregados de ~400 µm, mucho mayores que una mamosfera.

| Banco | Receteta | Con detección | Error de área mediano | Error ≤ 20 % |
| --- | --- | --- | --- | --- |
| Olympus 4× (88) | Plantilla «campo claro» tal cual | 72 | 86,8 % | 12 |
| | Contraste, corrección de fondo 300 px, Ø ≥ 100 µm | 82 | 3,9 % | 74 |
| Opera Phenix 10× (59) | Plantilla «campo claro» tal cual | 16 | 97,9 % | 0 |
| | Contraste, corrección de fondo 300 px, Ø ≥ 100 µm | 34 | 2,7 % | 20 |

Conclusión: con objetos grandes, el radio de corrección de fondo de la plantilla (50 px) borra el
propio objeto; ajustado como indica la ayuda del campo, el área coincide con la segmentación manual.

Hallazgos corregidos gracias a esta validación: los OME-TIFF abrían el diálogo de Bio-Formats en cada
imagen (ahora se abren con opciones fijas, sin diálogo) y las escalas en mm, cm o nm se omitían
(ahora se convierten a micras).
