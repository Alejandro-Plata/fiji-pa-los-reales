import { describe, expect, it } from 'vitest';
import { areaDesdeDiametro, cadena, comentario, num, texto } from './formato';
import { leerNumero } from '../recetetas/numeros';

describe('num()', () => {
  it('"0,65" y "0.65" producen 0.65', () => {
    expect(num(leerNumero('0,65')!)).toBe('0.65');
    expect(num(leerNumero('0.65')!)).toBe('0.65');
  });
  it('nunca sale una coma ni notación científica', () => {
    for (const n of [0.1, 1e-7, 1234567.891, 0.000123, 1e21 / 1e10, 5, -3.25]) {
      const s = num(n);
      expect(s).not.toMatch(/[,eE]/);
      expect(Number(s)).toBeCloseTo(n, 6);
    }
  });
  it('respeta los decimales pedidos', () => {
    expect(num(0.4, 2)).toBe('0.40');
    expect(num(1963.4954, 2)).toBe('1963.50');
  });
  it('rechaza NaN e infinito', () => {
    expect(() => num(NaN)).toThrow();
    expect(() => num(Infinity)).toThrow();
  });
});

describe('cadena()', () => {
  it('escapa comillas, barras invertidas y saltos de línea', () => {
    expect(cadena('a"b')).toBe('"a\\"b"');
    expect(cadena('C:\\datos')).toBe('"C:\\\\datos"');
    expect(cadena('línea 1\nlínea 2')).toBe('"línea 1\\nlínea 2"');
  });
});

describe('texto()', () => {
  it('deja el ASCII tal cual', () => {
    expect(texto('Hola "mundo"')).toBe('"Hola \\"mundo\\""');
    expect(texto('')).toBe('""');
  });
  it('escribe tildes, µ y β con fromCharCode', () => {
    expect(texto('imágenes')).toBe('"im" + fromCharCode(225) + "genes"');
    expect(texto('µm')).toBe('fromCharCode(181) + "m"');
    expect(texto('β-actina')).toBe('fromCharCode(946) + "-actina"');
  });
  it('mantiene los saltos de línea como \\n', () => {
    expect(texto('a\nb')).toBe('"a\\nb"');
  });
});

describe('comentario()', () => {
  it('elimina saltos de línea y */', () => {
    expect(comentario('Mi receteta */ run("x")\n// otra')).toBe('Mi receteta * / run("x") // otra');
    expect(comentario('a\r\nb')).toBe('a b');
  });
});

describe('diámetro → área', () => {
  it('50 µm → 1963.50 µm²', () => {
    expect(num(areaDesdeDiametro(50), 2)).toBe('1963.50');
  });
});
