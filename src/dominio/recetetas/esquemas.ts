/**
 * Esquemas Zod: ÚNICA fuente de verdad de las recetetas (spec §6).
 * De aquí salen la validación del formulario, la de importación y los valores por defecto.
 * Los mensajes de error están en español porque se muestran tal cual bajo cada campo.
 */
import { z } from 'zod';

// ---------- Ayudantes ----------
const numero = (min: number, max: number) =>
  z
    .number({ error: 'Escribe un número' })
    .refine((n) => Number.isFinite(n), { error: 'Escribe un número' })
    .refine((n) => n >= min && n <= max, {
      error: `Debe estar entre ${fmt(min)} y ${fmt(max)}`,
    });

const entero = (min: number, max: number) =>
  z
    .number({ error: 'Escribe un número entero' })
    .refine((n) => Number.isInteger(n), { error: 'Debe ser un número entero' })
    .refine((n) => n >= min && n <= max, {
      error: `Debe estar entre ${fmt(min)} y ${fmt(max)}`,
    });

function fmt(n: number): string {
  return String(n).replace('.', ',');
}

export const METODOS_UMBRAL = [
  'Otsu',
  'Default',
  'Huang',
  'Li',
  'Triangle',
  'Mean',
  'MaxEntropy',
  'Yen',
] as const;

export const EXTENSIONES = ['.tif', '.tiff', '.jpg', '.jpeg', '.png', '.czi', '.lif', '.nd2', '.lsm', '.oib'] as const;

// ---------- Imágenes (comunes) ----------
export const esquemaEscala = z.discriminatedUnion('modo', [
  z.object({ modo: z.literal('archivo') }),
  z.object({ modo: z.literal('manual'), micrasPorPixel: numero(0.0001, 100) }),
]);

export const esquemaImagenes = z.object({
  extensiones: z
    .array(z.enum([...EXTENSIONES, '*']))
    .min(1, { error: 'Elige al menos un formato de imagen' })
    .default(['.tif', '.tiff']),
  escala: esquemaEscala.default({ modo: 'archivo' }),
  proyeccionZ: z.enum(['ninguna', 'maxima', 'media']).default('maxima'),
});

// ---------- Mamosferas (spec §8) ----------
export const esquemaParametrosEsferas = z
  .object({
    canal: entero(1, 8).default(1),
    metodo: z.enum(['bordes', 'umbral']).default('bordes'),
    suavizado: numero(0, 10).default(2),
    radioBordes: numero(1, 15).default(4),
    restarFondo: z
      .object({
        activo: z.boolean().default(true),
        radio: numero(10, 500).default(50),
      })
      .prefault({}),
    metodoUmbral: z.enum(METODOS_UMBRAL).default('Otsu'),
    rellenarHuecos: z.boolean().default(true),
    limpiarRuido: z.boolean().default(true),
    separarTocandose: z.boolean().default(false),
    diametroMin: numero(10, 500).default(50),
    diametroMax: numero(10, 5000).nullable().default(null),
    circularidadMin: numero(0, 1).default(0.4),
    excluirBordes: z.boolean().default(true),
    celulasSembradas: entero(1, 10_000_000).nullable().default(null),
    salidas: z
      .object({
        objetos: z.boolean().default(true),
        resumen: z.boolean().default(true),
        control: z.boolean().default(true),
        rois: z.boolean().default(true),
      })
      .prefault({}),
  })
  .superRefine((p, ctx) => {
    if (p.diametroMax !== null && p.diametroMax <= p.diametroMin) {
      ctx.addIssue({
        code: 'custom',
        path: ['diametroMax'],
        message: 'El diámetro mínimo debe ser menor que el máximo',
      });
    }
  });

// ---------- Fluorescencia (spec §9) ----------
export const esquemaMarcador = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: 'Escribe el nombre del marcador' })
    .max(30, { error: 'Máximo 30 caracteres' })
    .regex(/^[\p{L}\p{N} ._+-]+$/u, {
      error: 'Usa solo letras, números, espacios y . _ + -',
    }),
  canal: entero(1, 8),
  umbralPositivo: numero(0, 1e12).nullable().default(null),
});

export const esquemaParametrosFluorescencia = z
  .object({
    canalNucleos: entero(1, 8).default(1),
    marcadores: z.array(esquemaMarcador).max(3, { error: 'Máximo 3 marcadores' }).default([]),
    deteccion: z.enum(['umbral', 'stardist']).default('umbral'),
    metodoUmbral: z.enum(METODOS_UMBRAL).default('Otsu'),
    restarFondoRadio: numero(0, 500).default(50),
    separarNucleos: z.boolean().default(true),
    probabilidadStardist: numero(0, 1).default(0.5),
    solapamientoStardist: numero(0, 1).default(0.4),
    areaNucleoMin: numero(0, 100_000).default(20),
    areaNucleoMax: numero(0, 1_000_000).default(500),
    excluirBordes: z.boolean().default(true),
    medida: z.enum(['media', 'integrada']).default('media'),
  })
  .superRefine((p, ctx) => {
    if (p.areaNucleoMin >= p.areaNucleoMax) {
      ctx.addIssue({
        code: 'custom',
        path: ['areaNucleoMax'],
        message: 'El área mínima debe ser menor que la máxima',
      });
    }
    p.marcadores.forEach((m, i) => {
      if (m.canal === p.canalNucleos) {
        ctx.addIssue({
          code: 'custom',
          path: ['marcadores', i, 'canal'],
          message: 'El marcador no puede estar en el mismo canal que los núcleos',
        });
      }
    });
    const nombres = p.marcadores.map((m) => m.nombre.toLowerCase());
    nombres.forEach((n, i) => {
      if (nombres.indexOf(n) !== i) {
        ctx.addIssue({
          code: 'custom',
          path: ['marcadores', i, 'nombre'],
          message: 'Ya hay otro marcador con este nombre',
        });
      }
    });
  });

// ---------- Western blot (spec §10) ----------
export const esquemaParametrosWestern = z.object({
  bandasOscuras: z.boolean().default(true),
  fondo: z.enum(['rollingBall', 'ninguno']).default('rollingBall'),
  radioFondo: numero(1, 1000).default(50),
  nombreProteina: z
    .string()
    .trim()
    .max(40, { error: 'Máximo 40 caracteres' })
    .regex(/^[\p{L}\p{N} ._+-]*$/u, { error: 'Usa solo letras, números, espacios y . _ + -' })
    .default(''),
  avisarSaturacion: z.boolean().default(true),
});

// ---------- Receteta ----------
const camposBase = {
  id: z.string().min(1),
  esquema: z.literal(1),
  nombre: z
    .string()
    .trim()
    .min(1, { error: 'Ponle un nombre a la receteta' })
    .max(60, { error: 'Máximo 60 caracteres' }),
  descripcion: z.string().max(300, { error: 'Máximo 300 caracteres' }).optional(),
  etiquetas: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  favorita: z.boolean().default(false),
  creada: z.iso.datetime(),
  modificada: z.iso.datetime(),
  origen: z.enum(['plantilla', 'importada', 'enlace']).optional(),
  imagenes: esquemaImagenes.prefault({}),
};

export const esquemaReceteta = z.discriminatedUnion('tipo', [
  z.object({ ...camposBase, tipo: z.literal('esferas'), parametros: esquemaParametrosEsferas.prefault({}) }),
  z.object({
    ...camposBase,
    tipo: z.literal('fluorescencia'),
    parametros: esquemaParametrosFluorescencia.prefault({}),
  }),
  z.object({ ...camposBase, tipo: z.literal('western'), parametros: esquemaParametrosWestern.prefault({}) }),
]);

/** Lo que viaja en un enlace o en un .json exportado sin metadatos locales. */
export const esquemaRecetetaCompartida = z.discriminatedUnion('tipo', [
  z.object({
    esquema: z.literal(1),
    nombre: camposBase.nombre,
    descripcion: camposBase.descripcion,
    etiquetas: camposBase.etiquetas,
    imagenes: camposBase.imagenes,
    tipo: z.literal('esferas'),
    parametros: esquemaParametrosEsferas.prefault({}),
  }),
  z.object({
    esquema: z.literal(1),
    nombre: camposBase.nombre,
    descripcion: camposBase.descripcion,
    etiquetas: camposBase.etiquetas,
    imagenes: camposBase.imagenes,
    tipo: z.literal('fluorescencia'),
    parametros: esquemaParametrosFluorescencia.prefault({}),
  }),
  z.object({
    esquema: z.literal(1),
    nombre: camposBase.nombre,
    descripcion: camposBase.descripcion,
    etiquetas: camposBase.etiquetas,
    imagenes: camposBase.imagenes,
    tipo: z.literal('western'),
    parametros: esquemaParametrosWestern.prefault({}),
  }),
]);
