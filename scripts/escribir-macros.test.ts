/** Escribe el macro de cada plantilla en scripts/salida/macros/ para probarlos a mano en Fiji. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { it } from 'vitest';
import { generarMacro, TipoSinMacro } from '../src/dominio/macros';
import { desdeCompartida } from '../src/dominio/recetetas/crear';
import { PLANTILLAS } from '../src/dominio/recetetas/plantillas';
import { SALIDAS } from './fiji';

it('escribe los macros de las plantillas', () => {
  const dir = join(SALIDAS, 'macros');
  mkdirSync(dir, { recursive: true });
  for (const p of PLANTILLAS) {
    try {
      const m = generarMacro(desdeCompartida(p.receteta, 'plantilla'), {
        versionApp: 'prueba',
        fecha: '2026-01-01',
      });
      writeFileSync(join(dir, `${p.clave}.ijm`), m, 'utf8');
    } catch (e) {
      if (!(e instanceof TipoSinMacro)) throw e;
    }
  }
});
