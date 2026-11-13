/** Pantallas y anchos que deben pasar las comprobaciones responsive (spec §4.12). */
export const ANCHOS = [320, 375, 414, 768, 1024, 1440] as const;

export const PANTALLAS = [
  { nombre: 'inicio', ruta: '/#/' },
  { nombre: 'asistente-tipo', ruta: '/#/receteta/nueva' },
  { nombre: 'asistente', ruta: '/#/receteta/nueva?plantilla=nucleos-dapi-marcador' },
  { nombre: 'importar', ruta: '/#/importar?r=zroto' },
  { nombre: 'resultado', ruta: '/#/receteta/prueba/macro' },
  { nombre: 'instrucciones', ruta: '/#/fiji' },
  { nombre: 'ajustes', ruta: '/#/ajustes' },
  { nombre: 'rapido', ruta: '/#/rapido' },
] as const;
