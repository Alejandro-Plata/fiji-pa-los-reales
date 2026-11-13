/**
 * TODOS los textos visibles de la interfaz (español de España).
 * Ningún componente escribe texto a mano: siempre `t.seccion.clave`.
 */
export const t = {
  app: {
    nombre: 'Fiji pa los reales',
    lema: 'Macros de Fiji sin escribir código',
    saltarAlContenido: 'Saltar al contenido',
    version: (v: string) => `Versión ${v}`,
    avisoSinAlmacenamiento: 'No se pueden guardar recetetas en este navegador',
    cargando: 'Cargando…',
  },

  nav: {
    principal: 'Navegación principal',
    abrirMenu: 'Abrir menú',
    cerrarMenu: 'Cerrar menú',
    inicio: 'Inicio',
    fiji: 'Cómo usarlo en Fiji',
    rapido: 'Análisis rápido',
    ajustes: 'Ajustes',
    nuevaReceteta: 'Nueva receteta',
  },

  pie: {
    privacidad: 'Todo ocurre en tu dispositivo: no se sube ninguna imagen ni dato a ningún servidor.',
  },

  barraInferior: {
    atras: 'Atrás',
    siguiente: 'Siguiente',
    acciones: 'Acciones del asistente',
  },

  pantallas: {
    inicio: {
      titulo: 'Tus recetetas',
      eyebrow: 'Fiji pa los reales',
      heroAntes: 'Macros de Fiji',
      heroClave: 'sin',
      heroDespues: 'programar',
      heroTexto:
        'Elige opciones con botones y llévate un macro listo para pegar en Fiji. Un mismo criterio para toda la carpeta.',
      vacio: 'Aún no tienes recetetas. Empieza por una plantilla: luego la ajustas a tus imágenes.',
    },
    asistente: { titulo: 'Asistente', tituloNueva: 'Nueva receteta' },
    resultado: { titulo: 'Tu macro' },
    instrucciones: { titulo: 'Cómo usarlo en Fiji' },
    ajustes: { titulo: 'Ajustes' },
    rapido: { titulo: 'Análisis rápido' },
    importar: { titulo: 'Importar receteta' },
    noEncontrada: {
      titulo: 'No encontramos esta página',
      volver: 'Volver al inicio',
    },
  },

  provisional: {
    enConstruccion: 'Esta pantalla se completa en una fase posterior.',
  },
} as const;

export type Textos = typeof t;
