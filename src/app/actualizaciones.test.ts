import { describe, expect, it } from 'vitest';
import { compararVersiones, leerPublicacion, megas } from './actualizaciones';

describe('actualizaciones', () => {
  it('compara versiones numéricamente, no como texto', () => {
    expect(compararVersiones('1.10.0', '1.9.0')).toBe(1);
    expect(compararVersiones('1.1.0', '1.1.0')).toBe(0);
    expect(compararVersiones('1.0.9', '1.1.0')).toBe(-1);
    expect(compararVersiones('2.0.0', '1.99.99')).toBe(1);
  });

  it('valida version.json', () => {
    const ok = leerPublicacion({
      version: '1.1.0',
      apk: 'fiji-pa-los-reales-1.1.0.apk',
      tamano: 5_000_000,
      publicada: '2026-11-14',
      novedades: ['Tutorial'],
    });
    expect(ok?.version).toBe('1.1.0');
    expect(leerPublicacion({ version: '1.1', apk: 'x.apk', publicada: 'hoy' })).toBeNull();
    expect(leerPublicacion({ version: '1.1.0' })).toBeNull();
    expect(leerPublicacion({ version: '1.1.0', apk: 'a.apk', publicada: 'h' })?.novedades).toEqual([]);
  });

  it('formatea el tamaño en MB con coma', () => {
    expect(megas(5_452_595)).toBe('5,2 MB');
  });
});
