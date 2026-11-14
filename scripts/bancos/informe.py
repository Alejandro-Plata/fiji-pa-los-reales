"""Resume las ejecuciones de scripts/bancos/validar-bancos.test.ts frente a la verdad de referencia.

Uso: py -I scripts/bancos/informe.py <carpeta de datos> <carpeta scripts/salida/bancos>
"""
import csv
import json
import os
import statistics
import sys

sys.stdout.reconfigure(encoding='utf-8')
datos, salidas = sys.argv[1], sys.argv[2]
verdad = json.load(open(os.path.join(datos, 'verdad.json'), encoding='utf8'))


def base(n):
    for suf in ('.ome.tiff', '.ome.tif', '.tiff', '.tif', '.ome'):
        if n.lower().endswith(suf):
            return n[: -len(suf)]
    return n


filas = []
for carpeta in sorted(os.listdir(salidas)):
    ruta = os.path.join(salidas, carpeta)
    if not carpeta.startswith('slimia-') or not os.path.isdir(ruta):
        continue
    banco = '-'.join(carpeta.split('-')[:2])
    variante = '-'.join(carpeta.split('-')[2:]) or 'plantilla'
    gt = verdad[banco]
    areas = {}
    objetos = os.path.join(ruta, 'objetos.csv')
    if os.path.exists(objetos):
        for f in csv.DictReader(open(objetos, encoding='utf8', errors='replace')):
            areas.setdefault(base(f['Label']), []).append(float(f['Area']))
    errores = []
    for nombre, g in gt.items():
        if nombre in areas:
            errores.append(abs(max(areas[nombre]) - g['areaUm2']) / g['areaUm2'])
    detectadas = len(errores)
    filas.append((banco, variante, len(gt), detectadas,
                  round(statistics.median(errores) * 100, 1) if errores else None,
                  sum(e <= 0.2 for e in errores)))

print(f"{'banco':20} {'variante':22} {'imágenes':>8} {'con detección':>13} {'error área mediano':>18} {'error ≤ 20 %':>12}")
for b, v, n, d, e, ok in filas:
    print(f"{b:20} {v:22} {n:8} {d:13} {str(e) + ' %':>18} {ok:12}")
