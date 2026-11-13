import { describe, expect, it } from 'vitest';
import { almacenamientoDisponible, borrar, escribir, leer } from './almacen';

describe('almacen sin localStorage', () => {
  it('sigue funcionando en memoria', () => {
    expect(almacenamientoDisponible()).toBe(false);
    expect(escribir('a', '1')).toBe(false);
    expect(leer('a')).toBe('1');
    borrar('a');
    expect(leer('a')).toBeNull();
  });
});
