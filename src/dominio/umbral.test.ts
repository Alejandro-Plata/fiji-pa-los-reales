import { describe, expect, it } from 'vitest';
import { columnasDeMarcador, leerCsv, percentil, redondear, valoresColumna } from './umbral';

const CSV = ` ,Label,Area,Mean,CD44_media,CD44_positivo
1,"ctrl:0001-0010",113.2,3000.5,301.2,0
2,"ctrl:0002-0130",110.9,2999.1,280.4,0
3,ctrl:0003,112.0,3001.0,320.0,0
`;

describe('calcular umbral', () => {
  it('lee el CSV de Fiji con comillas', () => {
    const c = leerCsv(CSV);
    expect(c.columnas).toEqual([' '.trim(), 'Label', 'Area', 'Mean', 'CD44_media', 'CD44_positivo']);
    expect(c.filas).toHaveLength(3);
    expect(c.filas[0]![1]).toBe('ctrl:0001-0010');
  });
  it('detecta las columnas de marcador', () => {
    expect(columnasDeMarcador(leerCsv(CSV).columnas)).toEqual(['CD44_media']);
  });
  it('percentil con interpolación lineal', () => {
    expect(percentil([1, 2, 3, 4], 50)).toBe(2.5);
    expect(percentil([10], 99)).toBe(10);
    const v = Array.from({ length: 101 }, (_, i) => i);
    expect(percentil(v, 99)).toBe(99);
    expect(percentil(valoresColumna(leerCsv(CSV), 'CD44_media'), 100)).toBe(320);
  });
  it('redondea a 3 cifras significativas', () => {
    expect(redondear(1234.567)).toBe(1235);
    expect(redondear(12.3456)).toBe(12.3);
    expect(redondear(0.012345)).toBe(0.0123);
  });
});
