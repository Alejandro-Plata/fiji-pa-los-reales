"""Verdad de referencia de los bancos públicos de imágenes (scripts/bancos/LEEME.md).

Uso: py -I scripts/bancos/verdad.py <carpeta de datos>
Escribe <carpeta>/verdad.json con, por imagen:
  - SLiMIA (esferoides en campo claro): área y diámetro equivalente de la segmentación manual.
  - BBBC039 (núcleos Hoechst): número de núcleos y área de cada uno (en píxeles).
"""
import glob
import json
import os
import sys

import numpy as np
import tifffile
from PIL import Image


def componentes(binaria):
    """Etiquetado 8-conexo sencillo (sin SciPy)."""
    etiquetas = np.zeros(binaria.shape, np.int32)
    n = 0
    alto, ancho = binaria.shape
    for y, x in zip(*np.nonzero(binaria)):
        if etiquetas[y, x]:
            continue
        n += 1
        pila = [(y, x)]
        etiquetas[y, x] = n
        while pila:
            cy, cx = pila.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < alto and 0 <= nx < ancho and binaria[ny, nx] and not etiquetas[ny, nx]:
                        etiquetas[ny, nx] = n
                        pila.append((ny, nx))
    return etiquetas, n


def tamano_pixel(ruta_ome):
    with tifffile.TiffFile(ruta_ome) as t:
        ome = t.ome_metadata or ''
    i = ome.find('PhysicalSizeX="')
    return float(ome[i + 15:ome.index('"', i + 15)]) if i >= 0 else None


def slimia(carpeta):
    res = {}
    for img in sorted(glob.glob(os.path.join(carpeta, '**', 'Images', '*', '*.ome.tiff'), recursive=True)):
        nombre = os.path.basename(img)[: -len('.ome.tiff')]
        linea = os.path.basename(os.path.dirname(img))
        mascara = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(img))),
                               'Manual segmentations', linea, nombre + '.tiff')
        if not os.path.exists(mascara):
            continue
        m = tifffile.imread(mascara) > 0
        px = tamano_pixel(img)
        etiquetas, n = componentes(m[::2, ::2])  # submuestreo ×2 solo para contar componentes
        area_px = int(m.sum())
        area = area_px * px * px
        res[nombre] = {
            'linea': linea,
            'umPorPixel': px,
            'componentes': n,
            'areaUm2': round(area, 1),
            'diametroUm': round(2 * (area / np.pi) ** 0.5, 1),
            'tocaBorde': bool(m[0].any() or m[-1].any() or m[:, 0].any() or m[:, -1].any()),
        }
    return res


def bbbc039(carpeta):
    res = {}
    for png in sorted(glob.glob(os.path.join(carpeta, 'masks', 'masks', '*.png'))):
        # Máscara de 3 clases (canal rojo): 0 fondo, 1 interior, 2 borde del núcleo, 3 contacto.
        # Cada región conexa de «interior» es un núcleo.
        a = np.array(Image.open(png))[..., 0]
        etiqueta, _ = componentes(a == 1)
        ids, cuentas = np.unique(etiqueta[etiqueta > 0], return_counts=True)
        grandes = cuentas >= 15  # descarta restos de pocos píxeles
        ids, cuentas = ids[grandes], cuentas[grandes]
        borde = set(np.unique(np.concatenate([etiqueta[0], etiqueta[-1], etiqueta[:, 0], etiqueta[:, -1]]))) - {0}
        nombre = os.path.splitext(os.path.basename(png))[0]
        res[nombre] = {
            'nucleos': int(len(ids)),
            'nucleosSinBorde': int(len(set(ids.tolist()) - borde)),
            'areaMedianaPx': float(np.median(cuentas)) if len(cuentas) else 0,
        }
    return res


if __name__ == '__main__':
    raiz = sys.argv[1]
    verdad = {
        'slimia-olympus': slimia(os.path.join(raiz, 'slimia-olympus')),
        'slimia-operaphenix': slimia(os.path.join(raiz, 'slimia-operaphenix')),
        'bbbc039': bbbc039(os.path.join(raiz, 'bbbc039')),
    }
    with open(os.path.join(raiz, 'verdad.json'), 'w', encoding='utf8') as f:
        json.dump(verdad, f, ensure_ascii=False, indent=1)
    for k, v in verdad.items():
        print(k, len(v), 'imágenes')
    s = list(verdad['slimia-olympus'].values())[:3] + list(verdad['slimia-operaphenix'].values())[:2]
    print(json.dumps(s, ensure_ascii=False))
    b = verdad['bbbc039']
    print('BBBC039 núcleos/imagen: min', min(x['nucleos'] for x in b.values()),
          'mediana', float(np.median([x['nucleos'] for x in b.values()])),
          'max', max(x['nucleos'] for x in b.values()),
          '| área mediana px', float(np.median([x['areaMedianaPx'] for x in b.values()])))
