"""
Imágenes sintéticas con resultado conocido para validar los macros en Fiji (spec §14).

Uso:  py -I scripts/generar-sinteticas.py [carpeta_salida]
Por defecto escribe en scripts/sinteticas/ (ignorado por git).

Escala guardada en los metadatos: 0,65 µm/píxel, unidad micra.

Esferas (fondo claro con ruido, discos oscuros con borde más oscuro):
  12 discos: 8 de >= 50 µm, 3 de menos de 50 µm y 1 que toca el borde. Esperado: 8.
Fluorescencia (2 canales):
  40 núcleos en el canal 1; 10 de ellos brillantes en el canal 2. Esperado: 40 y 25 %.
"""
import json
import sys
from pathlib import Path

import numpy as np
import tifffile
from PIL import Image

ESCALA = 0.65  # µm por píxel
RNG = np.random.default_rng(20261113)


def guardar_tif(ruta: Path, datos: np.ndarray, con_escala: bool = True, ejes: str = "YX") -> None:
    kwargs = {"imagej": True, "metadata": {"axes": ejes}}
    if con_escala:
        kwargs["resolution"] = (1 / ESCALA, 1 / ESCALA)
        kwargs["metadata"]["unit"] = "um"
    tifffile.imwrite(ruta, datos, **kwargs)


def disco(img: np.ndarray, cx: float, cy: float, diametro_px: float, interior: float, borde: float, grosor: float = 5) -> None:
    alto, ancho = img.shape
    yy, xx = np.mgrid[0:alto, 0:ancho]
    r = np.hypot(xx - cx, yy - cy)
    radio = diametro_px / 2
    img[r <= radio] = interior
    img[(r <= radio) & (r > radio - grosor)] = borde


def esferas(carpeta: Path) -> dict:
    alto, ancho = 1200, 1600
    img = np.full((alto, ancho), 200.0)
    # (centro x, centro y, diámetro en µm)
    grandes = [60, 70, 80, 90, 100, 110, 75, 65]
    pequenas = [20, 30, 40]
    centros = [(200 + 400 * c, 200 + 400 * f) for f in range(3) for c in range(4)]
    # La celda (200, 600) queda libre para no tocar el disco del borde
    centros.remove((200, 600))
    discos = []
    for (cx, cy), d in zip(centros, grandes + pequenas):
        discos.append((cx, cy, d))
    discos.append((20, 600, 90))  # toca el borde izquierdo
    for cx, cy, d in discos:
        disco(img, cx, cy, d / ESCALA, interior=120, borde=60)
    img += RNG.normal(0, 4, img.shape)
    img = np.clip(img, 0, 255).astype(np.uint8)

    carpeta.mkdir(parents=True, exist_ok=True)
    guardar_tif(carpeta / "esferas.tif", img)
    guardar_tif(carpeta / "esferas_sin_escala.tif", img, con_escala=False)
    doble = carpeta.parent / "esferas_doble"
    doble.mkdir(parents=True, exist_ok=True)
    guardar_tif(doble / "esferas_a.tif", img)
    guardar_tif(doble / "esferas_b.tif", img)

    rgb = carpeta.parent / "esferas_rgb"
    rgb.mkdir(parents=True, exist_ok=True)
    # JPG en color de verdad (tono cálido de cámara): Fiji lo abre como RGB, no como 8 bits
    color = np.stack([img, np.clip(img.astype(int) - 12, 0, 255), np.clip(img.astype(int) - 30, 0, 255)], axis=-1)
    Image.fromarray(color.astype(np.uint8)).save(rgb / "esferas_camara.jpg", quality=95)

    # Hiperpila: 2 canales × 3 planos; las esferas están en el canal 2 (el 1 es solo ruido)
    hiper = carpeta.parent / "esferas_hiper"
    hiper.mkdir(parents=True, exist_ok=True)
    ruido = np.clip(200 + RNG.normal(0, 4, img.shape), 0, 255).astype(np.uint8)
    pila = np.stack([np.stack([ruido, img]) for _ in range(3)])  # Z, C, Y, X
    guardar_tif(hiper / "esferas_hiper.tif", pila, ejes="ZCYX")

    return {"esferas": 8, "omitidas": 1, "discos": len(discos)}


def fluorescencia(carpeta: Path) -> dict:
    alto, ancho = 1024, 1024
    nucleos = np.zeros((alto, ancho))
    marcador = np.zeros((alto, ancho))
    # 40 núcleos en rejilla 8 × 5, diámetro ~12 µm (18 px)
    posiciones = [(80 + 120 * c, 120 + 190 * f) for f in range(5) for c in range(8)]
    positivos = set(range(0, 40, 4))  # 10 positivos
    for i, (cx, cy) in enumerate(posiciones):
        disco(nucleos, cx, cy, 12 / ESCALA, interior=3000, borde=3000)
        disco(marcador, cx, cy, 12 / ESCALA, interior=2500 if i in positivos else 300, borde=2500 if i in positivos else 300)
    nucleos += 200 + RNG.normal(0, 30, nucleos.shape)
    marcador += 200 + RNG.normal(0, 30, marcador.shape)
    pila = np.stack([nucleos, marcador]).clip(0, 65535).astype(np.uint16)

    carpeta.mkdir(parents=True, exist_ok=True)
    guardar_tif(carpeta / "fluo.tif", pila, ejes="CYX")
    # Dos imágenes en la misma carpeta: comprueba que no se pierden filas entre imágenes
    doble = carpeta.parent / "fluorescencia_doble"
    doble.mkdir(parents=True, exist_ok=True)
    guardar_tif(doble / "fluo_a.tif", pila, ejes="CYX")
    guardar_tif(doble / "fluo_b.tif", pila, ejes="CYX")
    return {"nucleos": 40, "positivos": 10, "porcentaje": 25.0, "umbral_prueba": 1200}


if __name__ == "__main__":
    base = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "sinteticas"
    esperado = {
        "esferas": esferas(base / "esferas"),
        "fluorescencia": fluorescencia(base / "fluorescencia"),
    }
    (base / "esperado.json").write_text(json.dumps(esperado, indent=2), encoding="utf-8")
    print(json.dumps(esperado, indent=2))
