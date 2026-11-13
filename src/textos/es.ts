/**
 * TODOS los textos visibles de la interfaz (español de España).
 * Ningún componente escribe texto a mano: siempre `t.seccion.clave`.
 *
 * Registro: profesional e impersonal. Sin tuteo ni fórmulas coloquiales; las instrucciones van
 * en infinitivo («Seleccionar la carpeta») y las explicaciones en forma impersonal («se calcula»).
 */
export const t = {
  app: {
    nombre: 'Fiji pa los reales',
    lema: 'Macros de Fiji sin escribir código',
    saltarAlContenido: 'Saltar al contenido',
    version: (v: string) => `Versión ${v}`,
    avisoSinAlmacenamiento: 'Este navegador no permite guardar recetetas.',
    corruptas: (n: number) =>
      n === 1
        ? 'Una receteta guardada estaba dañada y se ha apartado. Disponible para descarga en Ajustes.'
        : `${n} recetetas guardadas estaban dañadas y se han apartado. Disponibles para descarga en Ajustes.`,
    cargando: 'Cargando…',
    cerrar: 'Cerrar',
    cancelar: 'Cancelar',
    aceptar: 'Aceptar',
    deshacer: 'Deshacer',
  },

  nav: {
    principal: 'Navegación principal',
    abrirMenu: 'Abrir menú',
    cerrarMenu: 'Cerrar menú',
    inicio: 'Inicio',
    tutorial: 'Tutorial',
    fiji: 'Uso en Fiji',
    rapido: 'Análisis rápido',
    ajustes: 'Ajustes',
    nuevaReceteta: 'Nueva receteta',
  },

  barraInferior: {
    atras: 'Atrás',
    siguiente: 'Siguiente',
    acciones: 'Acciones del asistente',
  },

  tipos: {
    esferas: {
      nombre: 'Mamosferas',
      frase: 'Recuento y tamaño de esferas en campo claro y eficiencia de formación (SFE).',
    },
    fluorescencia: {
      nombre: 'Fluorescencia',
      frase: 'Recuento de núcleos y porcentaje de células positivas para hasta tres marcadores.',
    },
    western: {
      nombre: 'Western blot',
      frase: 'Densitometría de bandas: selección manual de bandas, corrección de fondo y medida.',
    },
  },

  campo: {
    queEsEsto: 'Información',
    ocultarAyuda: 'Ocultar información',
    recomendado: 'Recomendado',
    si: 'Sí',
    no: 'No',
    vacioSinLimite: 'Vacío = sin límite',
    noEsNumero: 'Introducir un número',
    opcional: 'Opcional',
  },

  inicio: {
    titulo: 'Recetetas',
    eyebrow: 'Fiji pa los reales',
    heroAntes: 'Macros de Fiji',
    heroClave: 'sin',
    heroDespues: 'programar',
    heroTexto:
      'Configuración del análisis mediante opciones y generación de un macro listo para Fiji. El mismo criterio para todas las imágenes de una carpeta.',
    verTutorial: 'Ver tutorial',
    vacio: 'No hay recetetas guardadas. Las plantillas ofrecen un punto de partida.',
    plantillas: 'Plantillas',
    plantillasTexto: 'Recetetas de ejemplo. Al abrir una se crea una copia editable.',
    usarPlantilla: 'Usar plantilla',
    buscar: 'Buscar por nombre',
    filtrarTipo: 'Filtrar por tipo',
    todos: 'Todos',
    sinResultados: 'Ninguna receteta coincide con la búsqueda.',
    modificada: (f: string) => `Modificada el ${f}`,
    favorita: 'Favorita',
    marcarFavorita: (n: string) => `Marcar «${n}» como favorita`,
    abrir: 'Abrir',
    verMacro: 'Ver macro',
    acciones: (n: string) => `Más acciones para «${n}»`,
    duplicar: 'Duplicar',
    renombrar: 'Renombrar',
    compartir: 'Compartir',
    borrar: 'Borrar',
    duplicada: (n: string) => `Creada «${n}»`,
    borrada: (n: string) => `«${n}» borrada`,
    confirmarBorrar: (n: string) => `¿Borrar «${n}»?`,
    confirmarBorrarTexto: 'La acción puede deshacerse durante unos segundos.',
    renombrarTitulo: 'Renombrar receteta',
    nuevoNombre: 'Nuevo nombre',
    guardarNombre: 'Guardar nombre',
    accesos: 'Accesos',
  },

  compartir: {
    titulo: (n: string) => `Receteta «${n}»`,
    texto: 'Enlace para importar la receteta en Fiji pa los reales desde otro dispositivo.',
    enlaceCopiado: 'Enlace copiado.',
    enlaceNoCopiado: 'No se ha podido copiar el enlace. Puede copiarse manualmente:',
    demasiadoLargo:
      'La receteta es demasiado grande para un enlace. Se proporciona el archivo .json, que puede importarse desde Ajustes en el otro dispositivo.',
    sinUrlPublica:
      'La app no dispone aún de una dirección web pública para generar enlaces. Se proporciona el archivo .json, que puede importarse desde Ajustes en el otro dispositivo.',
    jsonGuardado: (donde?: string) =>
      donde ? `Archivo guardado en ${donde}` : 'Archivo .json descargado',
    error: 'No se ha podido compartir la receteta.',
  },

  asistente: {
    tituloNueva: 'Nueva receteta',
    tituloEditar: 'Editar receteta',
    elegirTipo: 'Tipo de análisis',
    elegirTipoTexto: 'Cada opción puede ajustarse en los pasos siguientes.',
    progreso: (n: number, total: number) => `Paso ${n} de ${total}`,
    pasos: 'Pasos de la receteta',
    pasoOculto: 'Paso ',
    avanzadas: 'Opciones avanzadas',
    guardar: 'Guardar receteta',
    guardarCambios: 'Guardar cambios',
    guardada: 'Receteta guardada',
    hayErrores: 'Hay campos con errores.',
    borradorRecuperado: 'Se ha recuperado un borrador sin guardar.',
    empezarDeCero: 'Empezar de cero',
    avisoPlantilla: 'La escala y el tamaño mínimo dependen del microscopio y del objetivo utilizados.',
    salirTitulo: '¿Salir sin guardar?',
    salirTexto:
      'Hay cambios sin guardar. El borrador se conserva en este dispositivo.',
    salir: 'Salir',
    seguirEditando: 'Seguir editando',
    vistaPrevia: 'Vista previa',
    vistaPreviaTexto: 'Receteta con las opciones actuales.',
    noEncontrada: 'La receteta no existe o se ha borrado.',
    nombresPasos: {
      imagenes: 'Imágenes',
      deteccion: 'Detección',
      filtros: 'Filtros',
      resultados: 'Resultados',
      marcadores: 'Marcadores y resultados',
      procesado: 'Procesado',
      nombre: 'Nombre y guardar',
    },
  },

  campos: {
    imagenes: {
      extensiones: {
        etiqueta: 'Formato de las imágenes',
        ayuda:
          'Solo se procesan los archivos con estas extensiones. Los .czi, .lif, .nd2, .lsm y .oib se abren con Bio-Formats.',
        todas: 'Todas las compatibles',
        avisoSeries:
          'En archivos .lif y .czi con varias series solo se abre la primera. Para analizarlas todas, deben exportarse antes como TIFF.',
      },
      escala: {
        etiqueta: 'Escala (tamaño del píxel)',
        ayuda:
          'Necesaria para medir en micras. Los TIFF de microscopio suelen incluirla; los JPG y las capturas de pantalla, no.',
        archivo: 'Incluida en el archivo',
        archivoTexto: 'Las imágenes sin escala se registran en el Log y se omiten.',
        manual: 'Escala manual',
        manualTexto: 'Micras por píxel del objetivo, introducidas a mano.',
      },
      micrasPorPixel: {
        etiqueta: 'Micras por píxel (µm/píxel)',
        ayuda:
          'Depende del microscopio, la cámara y el objetivo. Figura en los metadatos de la imagen o se calcula a partir de una barra de escala.',
      },
      proyeccionZ: {
        etiqueta: 'Pilas Z',
        ayuda:
          'Combinación de los planos de enfoque en una sola imagen. La proyección máxima conserva el valor más brillante de cada píxel.',
        ninguna: 'No combinar',
        maxima: 'Proyección máxima',
        media: 'Proyección media',
      },
      avisoRgb:
        'Las imágenes RGB (JPG de cámara, capturas) no tienen canales separados y no son válidas para este análisis. Deben usarse los archivos originales del microscopio.',
    },

    esferas: {
      canal: {
        etiqueta: 'Canal analizado',
        ayuda: 'Canal que se analiza en imágenes multicanal. En campo claro suele ser el 1.',
      },
      metodo: {
        etiqueta: 'Método de detección',
        ayuda:
          'Por bordes: detecta el contorno de cada esfera; adecuado para campo claro con halo. Por contraste: separa objeto y fondo por intensidad; adecuado para fondos uniformes.',
        bordes: 'Por bordes',
        bordesTexto: 'Campo claro con halo alrededor de las esferas.',
        umbral: 'Por contraste',
        umbralTexto: 'Fondos uniformes y limpios.',
      },
      suavizado: {
        etiqueta: 'Suavizado (píxeles)',
        ayuda: 'Filtro gaussiano previo para reducir el ruido. 0 = sin suavizado.',
      },
      radioBordes: {
        etiqueta: 'Grosor del contorno (píxeles)',
        ayuda: 'Solo en detección por bordes. Valores mayores unen contornos discontinuos.',
      },
      restarFondo: {
        etiqueta: 'Corregir iluminación desigual',
        ayuda:
          'Solo en detección por contraste. Resta de fondo (rolling ball); el radio debe superar el de la esfera más grande, en píxeles.',
      },
      restarFondoRadio: {
        etiqueta: 'Radio de corrección (píxeles)',
        ayuda: 'Mayor que la esfera más grande, en píxeles.',
      },
      metodoUmbral: {
        etiqueta: 'Método de umbral automático',
        ayuda:
          'Criterio para separar objeto y fondo. Otsu es adecuado en la mayoría de los casos; Triangle detecta mejor las esferas poco contrastadas.',
      },
      rellenarHuecos: {
        etiqueta: 'Rellenar huecos',
        ayuda: 'Rellena el interior de las esferas cuando es tan claro como el fondo.',
      },
      limpiarRuido: {
        etiqueta: 'Limpiar ruido',
        ayuda: 'Elimina puntos y bordes finos aislados (operación «Open»).',
      },
      separarTocandose: {
        etiqueta: 'Separar esferas en contacto',
        ayuda:
          'Separación por Watershed. Puede dividir esferas irregulares y aumentar el recuento; conviene comprobarlo en las imágenes de control.',
      },
      diametroMin: {
        etiqueta: 'Diámetro mínimo (µm)',
        ayuda:
          'Tamaño mínimo para considerar un objeto como esfera. 50 µm es el criterio más habitual en la bibliografía.',
      },
      diametroMax: {
        etiqueta: 'Diámetro máximo (µm)',
        ayuda: 'Permite descartar agregados. Vacío = sin límite.',
      },
      circularidadMin: {
        etiqueta: 'Circularidad mínima (0–1)',
        ayuda:
          '1 corresponde a un círculo perfecto. Valores menores admiten esferas irregulares; valores mayores excluyen restos alargados.',
      },
      excluirBordes: {
        etiqueta: 'Excluir esferas del borde',
        ayuda: 'No se cuentan las esferas cortadas por el borde de la imagen.',
      },
      celulasSembradas: {
        etiqueta: 'Células sembradas por pocillo',
        ayuda:
          'Necesario para calcular la SFE. Solo es válido si la imagen abarca el pocillo completo.',
      },
      salidas: {
        etiqueta: 'Archivos de salida',
        ayuda: 'Archivos que se guardan en la carpeta de resultados.',
        objetos: 'objetos.csv: una fila por esfera',
        resumen: 'resumen.csv: una fila por imagen',
        control: 'Imágenes de control (.jpg)',
        rois: 'Selecciones (ROI, .zip)',
      },
    },

    fluorescencia: {
      canalNucleos: {
        etiqueta: 'Canal de los núcleos',
        ayuda: 'Canal de la tinción nuclear (DAPI o Hoechst).',
      },
      marcadores: {
        etiqueta: 'Marcadores',
        ayuda:
          'Nombre (p. ej. «CD44»), canal y, opcionalmente, intensidad a partir de la cual una célula se considera positiva.',
        anadir: 'Añadir marcador',
        quitar: (n: string) => `Quitar ${n || 'marcador'}`,
        nombre: 'Nombre',
        canal: 'Canal',
        umbral: 'Umbral de positividad',
        umbralAyuda: 'Vacío = solo exportar intensidades.',
        ninguno: 'Sin marcadores: solo se cuentan núcleos.',
        maximo: 'Máximo 3 marcadores.',
        avisoUmbral:
          'El umbral debe establecerse con controles negativos (sin anticuerpo primario o isotipo) analizados con esta misma receteta y en las mismas condiciones de adquisición.',
        titulo: (n: number) => `Marcador ${n}`,
      },
      deteccion: {
        etiqueta: 'Método de detección de núcleos',
        ayuda:
          'Umbral: no requiere instalación. StarDist: segmentación por aprendizaje profundo, más precisa con núcleos en contacto; requiere el plugin (ver «Uso en Fiji»).',
        umbral: 'Umbral',
        umbralTexto: 'Sin instalación adicional.',
        stardist: 'StarDist',
        stardistTexto: 'Mejor separación de núcleos en contacto. Requiere el plugin.',
      },
      metodoUmbral: {
        etiqueta: 'Método de umbral automático',
        ayuda: 'Solo con detección por umbral. Otsu es adecuado en la mayoría de los casos.',
      },
      restarFondoRadio: {
        etiqueta: 'Radio de resta de fondo (píxeles)',
        ayuda: 'Corrección del fondo de fluorescencia. 0 = sin corrección. Debe ser bastante mayor que un núcleo.',
      },
      separarNucleos: {
        etiqueta: 'Separar núcleos en contacto',
        ayuda: 'Solo con detección por umbral. Separación por Watershed.',
      },
      probabilidadStardist: {
        etiqueta: 'Probabilidad mínima (StarDist)',
        ayuda: 'Valores más altos descartan detecciones dudosas.',
      },
      solapamientoStardist: {
        etiqueta: 'Solapamiento admitido (StarDist)',
        ayuda: 'Valores más altos admiten núcleos más solapados.',
      },
      areaNucleoMin: {
        etiqueta: 'Área mínima del núcleo (µm²)',
        ayuda:
          'Descarta restos pequeños. Un núcleo de célula mamaria en cultivo ocupa, en general, entre unas decenas y unos cientos de µm².',
      },
      areaNucleoMax: {
        etiqueta: 'Área máxima del núcleo (µm²)',
        ayuda: 'Descarta grupos de núcleos no separados.',
      },
      excluirBordes: {
        etiqueta: 'Excluir núcleos del borde',
        ayuda: 'No se cuentan los núcleos cortados por el borde.',
      },
      medida: {
        etiqueta: 'Intensidad medida',
        ayuda:
          'Media: brillo medio dentro del núcleo (recomendada para clasificar positivas y negativas). Integrada: brillo total, dependiente del tamaño.',
        media: 'Media',
        mediaTexto: 'Brillo medio dentro del núcleo.',
        integrada: 'Integrada',
        integradaTexto: 'Brillo total; depende del tamaño.',
      },
    },

    western: {
      avisos: [
        'Debe usarse la imagen original del equipo de adquisición en TIFF (preferiblemente de 16 bits), no un JPG ni una captura de pantalla.',
        'La proteína de interés y el control de carga se miden con la misma receteta; la normalización se hace después (señal / control de carga y, a continuación, respecto a la condición control).',
        'Todas las bandas se miden con el mismo rectángulo.',
      ],
      bandasOscuras: {
        etiqueta: 'Bandas oscuras sobre fondo claro',
        ayuda:
          'Habitual en quimioluminiscencia exportada. El macro invierte la imagen para que una señal mayor corresponda a un valor mayor.',
      },
      fondo: {
        etiqueta: 'Corrección del fondo',
        ayuda: 'Método de resta del fondo de la membrana.',
        rollingBall: 'Rolling ball',
        rollingBallTexto: 'Resta el fondo irregular de la membrana.',
        ninguno: 'Ninguna',
        ningunoTexto: 'Sin corrección de fondo.',
      },
      radioFondo: {
        etiqueta: 'Radio del fondo (píxeles)',
        ayuda: 'Mayor que la altura de una banda.',
      },
      nombreProteina: {
        etiqueta: 'Proteína',
        ayuda: 'Se incluye en el nombre del archivo de resultados (p. ej. «SOX2», «β-actina»).',
      },
      avisarSaturacion: {
        etiqueta: 'Avisar si hay saturación',
        ayuda:
          'Con píxeles saturados la cuantificación no es fiable; se requiere una exposición más corta.',
      },
      columna: 'Valor de referencia: columna RawIntDen (señal total de la banda).',
    },

    nombre: {
      nombre: { etiqueta: 'Nombre de la receteta', ayuda: 'Entre 1 y 60 caracteres.' },
      descripcion: {
        etiqueta: 'Descripción',
        ayuda: 'Opcional, máximo 300 caracteres (experimento, objetivo, condiciones…).',
      },
      etiquetas: {
        etiqueta: 'Etiquetas',
        ayuda: 'Opcional. Separadas por comas (p. ej. «MCF7, día 7»).',
      },
    },
  },

  importar: {
    titulo: 'Importar receteta',
    pregunta: '¿Guardar esta receteta?',
    guardar: 'Guardar receteta',
    descartar: 'No guardar',
    sinDatos: 'El enlace no contiene ninguna receteta.',
    nombreExiste: (n: string) => `Ya existe una receteta con ese nombre. Se guardará como «${n}».`,
    guardada: 'Receteta guardada',
    leyendo: 'Leyendo el enlace…',
  },

  ajustes: {
    titulo: 'Ajustes',
    copia: 'Copia de seguridad',
    copiaTexto:
      'Exporta todas las recetetas a un archivo .json, como copia de seguridad o para trasladarlas a otro dispositivo.',
    exportar: 'Exportar recetetas',
    importar: 'Importar archivo .json',
    exportado: (donde?: string) =>
      donde ? `Copia guardada en ${donde}` : 'Copia de seguridad descargada',
    nadaQueExportar: 'No hay recetetas que exportar.',
    importadas: (n: number, rechazadas: number) =>
      `${n === 1 ? 'Importada 1 receteta' : `Importadas ${n} recetetas`}` +
      (rechazadas ? `. ${rechazadas} no eran válidas y se han ignorado.` : '.'),
    errorImportar: 'No se ha podido leer el archivo.',
    corruptas: 'Recetetas dañadas',
    corruptasTexto: (n: number) =>
      `${n === 1 ? 'Hay 1 receteta apartada' : `Hay ${n} recetetas apartadas`} por no poder leerse. Pueden descargarse para intentar recuperarlas.`,
    descargarCorruptas: 'Descargar recetetas dañadas',
    idioma: 'Idioma del texto de Métodos',
    idiomaTexto: 'Idioma inicial del texto para Materiales y Métodos.',
    espanol: 'Español',
    ingles: 'Inglés',
    borrarTodo: 'Borrar todos los datos',
    borrarTodoTexto: 'Elimina todas las recetetas, el borrador y los ajustes de este dispositivo.',
    borrarConfirmar1: '¿Borrar todos los datos?',
    borrarConfirmar1Texto: 'Se eliminarán todas las recetetas de este dispositivo.',
    borrarConfirmar2: 'Esta acción no se puede deshacer',
    borrarConfirmar2Texto: 'Sin una copia de seguridad, las recetetas se perderán definitivamente.',
    borrarSi: 'Sí, borrar',
    borrarDefinitivo: 'Borrar definitivamente',
    borrado: 'Se han borrado todos los datos.',
    acerca: 'Acerca de',
    actualizaciones: {
      titulo: 'Actualizaciones',
      instalada: (v: string) => `Versión instalada: ${v}`,
      buscar: 'Buscar actualizaciones',
      buscando: 'Buscando actualizaciones…',
      alDia: 'La aplicación está actualizada.',
      disponible: (v: string) => `Versión ${v} disponible`,
      publicada: (f: string, tam?: string) => `Publicada el ${f}${tam ? ` · ${tam}` : ''}`,
      novedades: 'Novedades',
      instalar: 'Descargar e instalar',
      descargando: (pct: number) => `Descargando… ${pct} %`,
      instalador:
        'Instalador de Android abierto. Al confirmar, la aplicación se actualiza conservando las recetetas.',
      sinPermiso:
        'Android requiere autorizar a Fiji pa los reales para instalar aplicaciones. Tras conceder el permiso, volver a esta pantalla y repetir la descarga.',
      concederPermiso: 'Conceder permiso',
      sinPublicacion: 'No hay ninguna versión publicada.',
      error: 'No se ha podido consultar el servidor de actualizaciones. Comprobar la conexión a internet.',
      errorDescarga: 'No se ha podido descargar la actualización.',
      aviso: (v: string) => `Versión ${v} disponible`,
      ver: 'Ver',
      // Web (PWA): se actualiza sola; se ofrece la app de Android
      web: 'La versión web se actualiza automáticamente.',
      android: 'Aplicación para Android',
      descargarApk: (v: string) => `Descargar APK ${v}`,
      androidTexto:
        'Al abrir el archivo descargado, Android solicita autorización para instalar aplicaciones de esta fuente. Las siguientes actualizaciones pueden instalarse desde Ajustes, dentro de la propia app.',
    },
    instalar: 'Instalación en el móvil',
    instalarPasos: [
      'iPhone: abrir la app en Safari, seleccionar Compartir y después «Añadir a pantalla de inicio».',
      'Android: abrir la app en Chrome, abrir el menú ⋮ y seleccionar «Instalar aplicación» o «Añadir a pantalla de inicio».',
      'Una vez instalada, funciona sin conexión.',
    ],
  },

  resumen: {
    titulo: 'Resumen',
    formatos: (f: string) => `Imágenes ${f}`,
    todas: 'de todos los formatos compatibles',
    escalaArchivo: 'escala leída del archivo',
    escalaManual: (n: string) => `escala manual de ${n} µm/píxel`,
    proyeccion: { ninguna: 'sin combinar pilas Z', maxima: 'pilas Z por proyección máxima', media: 'pilas Z por proyección media' },
    canal: (n: number) => `analiza el canal ${n}`,
    bordes: (s: string, r: string) => `Detecta las esferas por bordes (suavizado ${s} px, contorno ${r} px)`,
    contraste: (u: string, fondo: string | null) =>
      `Detecta las esferas por contraste (umbral ${u}${fondo ? `, corrección de iluminación de ${fondo} px` : ''})`,
    limpieza: (rellenar: boolean, limpiar: boolean, separar: boolean) =>
      [
        rellenar ? 'rellena huecos' : 'no rellena huecos',
        limpiar ? 'limpia ruido' : 'no limpia ruido',
        separar ? 'separa esferas en contacto' : 'no separa esferas en contacto',
      ].join(', '),
    tamano: (min: string, max: string | null, circ: string, bordes: boolean) =>
      `Cuenta esferas de ${min} µm o más${max ? ` y hasta ${max} µm` : ''}, circularidad ≥ ${circ}${bordes ? ', sin las cortadas por el borde' : ''}`,
    sfe: (n: string) => `Calcula la SFE con ${n} células sembradas por pocillo`,
    sinSfe: 'No calcula la SFE (faltan las células sembradas)',
    nucleosUmbral: (c: number, u: string, separar: boolean) =>
      `Núcleos en el canal ${c} por umbral ${u}${separar ? ', separando núcleos en contacto' : ''}`,
    nucleosStardist: (c: number, p: string, s: string) =>
      `Núcleos en el canal ${c} con StarDist (probabilidad ${p}, solapamiento ${s})`,
    areaNucleos: (min: string, max: string, bordes: boolean) =>
      `Núcleos de ${min} a ${max} µm²${bordes ? ', sin los cortados por el borde' : ''}`,
    fondoFluo: (r: string | null) => (r ? `Resta el fondo con radio ${r} px` : 'No resta el fondo'),
    marcador: (n: string, c: number, u: string | null) =>
      `${n} en el canal ${c}: ${u ? `positivas por encima de ${u}` : 'se exportan las intensidades'}`,
    sinMarcadores: 'Sin marcadores: solo cuenta núcleos',
    medida: { media: 'Mide la intensidad media', integrada: 'Mide la intensidad integrada' },
    westernOscuras: 'Bandas oscuras sobre fondo claro: se invierte la imagen',
    westernClaras: 'Bandas claras sobre fondo oscuro: no se invierte',
    westernFondo: (r: string | null) => (r ? `Resta el fondo con rolling ball de ${r} px` : 'No resta el fondo'),
    westernSaturacion: (s: boolean) => (s ? 'Avisa si hay píxeles saturados' : 'No comprueba la saturación'),
    westernProteina: (p: string) => (p ? `Proteína: ${p}` : 'Sin nombre de proteína'),
    westernColumna: 'Valor de referencia: columna RawIntDen (señal total de la banda)',
  },

  resultado: {
    titulo: 'Macro',
    copiar: 'Copiar macro',
    copiado: 'Macro copiado',
    pulsaCtrlC: 'No se ha podido copiar automáticamente. El macro está seleccionado: Ctrl+C (Cmd+C en Mac) para copiarlo.',
    descargar: 'Descargar .ijm',
    descargado: (donde?: string) => (donde ? `Macro guardado en ${donde}` : 'Macro descargado'),
    enviar: 'Enviar al ordenador',
    metodos: 'Texto para Métodos',
    comoLanzar: 'Ejecución en Fiji',
    editar: 'Editar receteta',
    codigo: 'Código del macro',
    ajustarLineas: 'Ajustar líneas',
    lineas: (n: number) => `${n} líneas`,
    noDisponible: 'El macro de este tipo de análisis no está disponible todavía.',
    invalida: 'La receteta contiene errores. Deben corregirse para generar el macro.',
    vistaPreviaMacro: 'Macro en vivo',
    vistaPreviaPendiente: 'Corregir los campos marcados para ver el macro.',
    avisoSeries: 'En archivos .lif y .czi con varias series solo se analiza la primera.',
    errorDescarga: 'No se ha podido guardar el archivo.',
  },

  rapido: {
    titulo: 'Análisis rápido',
    aviso: 'Resultado orientativo. Para datos publicables, debe usarse el macro en Fiji.',
    receteta: 'Ajustes de partida',
    porDefecto: 'Valores por defecto',
    elegirImagen: 'Hacer foto o elegir imagen',
    formatos: 'JPG, PNG o TIFF.',
    procesando: 'Analizando la imagen…',
    errorImagen: 'No se ha podido leer la imagen. Formatos admitidos: JPG, PNG o TIFF.',
    escala: 'Escala',
    escalaArchivo: (n: string) => `Escala leída del archivo: ${n} µm/píxel.`,
    micrasPorPixel: {
      etiqueta: 'Micras por píxel (µm/píxel)',
      ayuda:
        'Tamaño de un píxel de la imagen original. Si se desconoce, puede calibrarse con la barra de escala.',
    },
    calibrar: 'Calibrar con la barra de escala',
    calibrarPasos: 'Marcar los dos extremos de la barra de escala en la imagen.',
    calibrarPuntos: (n: number) => `Puntos marcados: ${n} de 2`,
    calibrarLongitud: {
      etiqueta: 'Longitud de la barra (µm)',
      ayuda: 'Valor indicado junto a la barra de escala (p. ej. 100 µm).',
    },
    aplicarCalibracion: 'Aplicar calibración',
    cancelarCalibracion: 'Cancelar',
    calibrado: (n: string) => `Calibrado: ${n} µm/píxel`,
    sinEscala: 'Se necesita la escala para medir en micras.',
    resultadoTitulo: 'Resultado',
    esferas: (n: number) => (n === 1 ? '1 esfera' : `${n} esferas`),
    diametroMedio: (d: string) => `Diámetro equivalente medio: ${d} µm`,
    tiempo: (ms: number) => `Procesado en ${(ms / 1000).toFixed(1).replace('.', ',')} s`,
    sinWatershed: 'La separación de esferas en contacto solo se aplica en Fiji.',
    umbralSustituido: (m: string) => `El método de umbral ${m} solo está disponible en Fiji; aquí se usa Otsu.`,
    fondoAprox: 'La corrección de fondo es una aproximación de la de Fiji.',
    deslizadores: 'Ajustes en vivo',
    diametroMin: (d: string) => `Diámetro mínimo: ${d} µm`,
    circularidadMin: (c: string) => `Circularidad mínima: ${c}`,
    zoomMas: 'Ampliar',
    zoomMenos: 'Reducir',
    zoomReset: 'Ver entera',
    lienzo: 'Imagen analizada: contornos detectados en lima (contados) y rosa (descartados)',
    usarEnReceteta: 'Usar estos ajustes en la receteta',
    guardarEscala: 'Guardar también la escala en la receteta',
    destino: 'Receteta de destino',
    sinRecetetas: 'No hay recetetas de mamosferas. Se necesita una para guardar estos ajustes.',
    guardado: (n: string) => `Ajustes guardados en «${n}»`,
  },

  umbral: {
    titulo: 'Calcular umbral',
    enlace: 'Calcular el umbral con un control negativo',
    intro:
      'A partir del objetos.csv de un control negativo (sin anticuerpo primario o isotipo) analizado con la misma receteta, se propone como umbral un percentil alto de la intensidad del marcador.',
    elegir: 'Seleccionar objetos.csv',
    archivo: (n: string, filas: number) => `${n}: ${filas} núcleos`,
    sinColumnas:
      'El archivo no contiene columnas de marcador (terminadas en _media o _integrada). Se requiere el objetos.csv de una receteta de fluorescencia.',
    errorLeer: 'No se ha podido leer el archivo.',
    columna: 'Marcador',
    percentil: {
      etiqueta: 'Percentil',
      ayuda:
        'Porcentaje de células del control negativo que queda por debajo del umbral. Con 99, solo el 1 % del control resultaría positivo.',
    },
    resultado: 'Umbral propuesto',
    estadisticas: (n: number, min: string, mediana: string, max: string) =>
      `${n} núcleos · mínimo ${min} · mediana ${mediana} · máximo ${max}`,
    pocos: 'Número de núcleos insuficiente: el percentil es poco fiable. Se recomienda usar más imágenes del control.',
    aplicar: 'Usar en una receteta',
    receteta: 'Receteta',
    marcador: 'Marcador de la receteta',
    sinRecetetas: 'No hay recetetas de fluorescencia con marcadores.',
    guardar: 'Guardar umbral en la receteta',
    guardado: (m: string, r: string) => `Umbral guardado para ${m} en «${r}»`,
  },

  metodos: {
    titulo: 'Texto para Métodos',
    nota: 'Texto de partida; debe revisarse y adaptarse al estilo del documento.',
    corchetes: 'Los datos entre corchetes deben completarse manualmente.',
    copiar: 'Copiar',
    copiado: 'Texto copiado',
    noCopiado: 'No se ha podido copiar. El texto puede seleccionarse y copiarse manualmente.',
    cambiarIdioma: 'Cambiar idioma',
    idioma: { es: 'Español', en: 'Inglés' },
    referencias: 'Referencias',
    texto: 'Párrafo de Materiales y Métodos',
  },

  tutorial: {
    titulo: 'Tutorial',
    eyebrow: 'Funcionamiento',
    diapositiva: (n: number, total: number) => `${n} de ${total}`,
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    irA: (n: number, titulo: string) => `Ir a ${n}: ${titulo}`,
    indice: 'Secciones del tutorial',
    empezar: 'Crear una receteta',
    volver: 'Volver al inicio',
    diapositivas: [
      {
        id: 'que-es',
        titulo: 'Macros de Fiji sin programar',
        texto:
          'Fiji pa los reales traduce opciones de análisis en un macro de Fiji (ImageJ). El macro procesa una carpeta completa de imágenes con un criterio idéntico y documentado.',
        puntos: ['Sin escribir código', 'Mismo criterio para todas las imágenes', 'Parámetros registrados en la cabecera del macro'],
      },
      {
        id: 'tipos',
        titulo: 'Tres tipos de análisis',
        texto:
          'Cada receteta corresponde a un tipo de experimento. Las plantillas proporcionan valores de partida validados que pueden ajustarse.',
        puntos: [
          'Mamosferas: recuento, diámetro y SFE',
          'Fluorescencia: núcleos y porcentaje de positivas',
          'Western blot: densitometría de bandas',
        ],
      },
      {
        id: 'asistente',
        titulo: 'Configuración paso a paso',
        texto:
          'El asistente agrupa las opciones en pasos: imágenes, detección, filtros y resultados. Cada campo incluye información sobre su efecto y los valores recomendados.',
        puntos: ['Validación inmediata de cada campo', 'Vista previa del macro en vivo', 'Borrador guardado automáticamente'],
      },
      {
        id: 'macro',
        titulo: 'Macro listo para usar',
        texto:
          'El resultado es un archivo .ijm que puede copiarse, descargarse o enviarse al ordenador del laboratorio. Incluye además un párrafo para Materiales y Métodos con sus referencias.',
        puntos: ['Copiar, descargar o enviar', 'Texto para Métodos en español o inglés', 'Receteta compartible mediante enlace'],
      },
      {
        id: 'fiji',
        titulo: 'Ejecución en Fiji',
        texto:
          'En Fiji, el macro solicita la carpeta de imágenes y la de resultados. Al terminar genera tablas CSV, imágenes de control y selecciones para revisar cada detección.',
        puntos: ['resumen.csv y objetos.csv', 'Imágenes de control con lo detectado', 'Registro de imágenes omitidas y motivo'],
      },
      {
        id: 'rapido',
        titulo: 'Análisis rápido en el móvil',
        texto:
          'Una foto del microscopio basta para obtener un recuento orientativo de esferas en segundos, sin conexión. Los ajustes obtenidos pueden trasladarse a una receteta.',
        puntos: ['Cámara o galería', 'Calibración con barra de escala', 'Ajuste de filtros en vivo'],
      },
      {
        id: 'umbral',
        titulo: 'Umbral desde un control negativo',
        texto:
          'Con el objetos.csv de un control negativo, la app propone un umbral de positividad basado en un percentil y lo guarda en la receteta de fluorescencia.',
        puntos: ['Percentil configurable', 'Estadísticas del control', 'Aplicación directa a la receteta'],
      },
      {
        id: 'compartir',
        titulo: 'Compartir y conservar',
        texto:
          'Las recetetas pueden compartirse mediante enlace con otros miembros del laboratorio y exportarse en formato .json como copia de seguridad. La app funciona sin conexión.',
        puntos: ['Enlace de importación', 'Copia de seguridad en .json', 'Funcionamiento sin conexión'],
      },
    ],
    figuras: {
      opciones: 'Opciones',
      macro: 'macro.ijm',
      carpeta: 'Imágenes',
      resultados: 'Resultados',
      recuento: (n: number) => `${n} esferas`,
      umbral: 'Umbral',
      dispositivo: 'Dispositivo',
      pasos: ['Imágenes', 'Detección', 'Filtros', 'Resultados'],
      archivos: ['resumen.csv', 'objetos.csv', 'control/', 'rois/'],
      copiado: 'Copiado',
    },
  },

  guia: {
    titulo: 'Uso en Fiji',
    intro: 'Pasos que se realizan en el ordenador donde está instalado Fiji.',
    hueco: 'Captura pendiente',
    pasos: [
      {
        id: 'instalar',
        titulo: 'A. Instalación de Fiji',
        lista: 'ol',
        items: [
          'Descargar Fiji desde imagej.net/software/fiji/downloads para el sistema correspondiente.',
          'Descomprimir la carpeta en una ubicación con permisos de escritura (por ejemplo, Documentos). En Windows no debe ubicarse en «Archivos de programa», ya que Fiji no podría actualizarse.',
          'En Mac, si aparece el aviso de desarrollador no verificado: clic derecho sobre Fiji › Abrir.',
        ],
        captura: { archivo: 'a-descarga.png', alt: 'Página de descargas de Fiji con los botones para Windows, Mac y Linux.' },
      },
      {
        id: 'llevar',
        titulo: 'B. Transferencia del macro al ordenador',
        lista: 'ul',
        items: [
          'Opción 1: «Descargar .ijm» o «Enviar al ordenador» desde la app y abrir el archivo en el ordenador.',
          'Opción 2: abrir el enlace de la receteta en el ordenador y seleccionar «Copiar macro».',
        ],
        captura: { archivo: 'b-enviar.png', alt: 'Pantalla del macro en la app con los botones Copiar, Descargar y Enviar al ordenador.' },
      },
      {
        id: 'abrir',
        titulo: 'C. Apertura del macro en Fiji',
        lista: 'ul',
        items: [
          'Archivo .ijm: arrastrarlo sobre la ventana principal de Fiji (la barra de herramientas). Se abre en el editor de scripts.',
          'Texto copiado: 1) File › New › Script… 2) En el editor, Language › IJ1 Macro. Este paso es imprescindible: con otro lenguaje el macro genera errores. 3) Pegar con Ctrl+V (Cmd+V en Mac).',
        ],
        captura: { archivo: 'c-editor.png', alt: 'Editor de scripts de Fiji con el menú Language abierto y la opción IJ1 Macro marcada.' },
      },
      {
        id: 'lanzar',
        titulo: 'D. Ejecución',
        lista: 'ol',
        items: [
          'Botón Run, en la parte inferior izquierda del editor, o Ctrl+R (Cmd+R en Mac).',
          'Fiji solicita la carpeta de imágenes: debe seleccionarse la carpeta, no una imagen.',
          'A continuación solicita la carpeta de resultados: se recomienda una carpeta vacía, distinta de la de imágenes.',
          'El progreso se muestra en la barra de Fiji y cada imagen procesada, en la ventana Log.',
          'Al finalizar aparece el mensaje «Terminado» con el número de imágenes.',
        ],
        nota: 'En western blot el macro solicita una sola imagen y se detiene para la selección de bandas, según las instrucciones de la ventana emergente.',
        captura: { archivo: 'd-run.png', alt: 'Botón Run en la parte inferior izquierda del editor de scripts de Fiji.' },
      },
      {
        id: 'resultados',
        titulo: 'E. Resultados',
        lista: 'ul',
        items: [
          'resumen.csv: una fila por imagen (recuento, tamaños medios, SFE o porcentaje de positivas). Compatible con Excel.',
          'objetos.csv: una fila por esfera o núcleo, con todas las medidas.',
          'Carpeta control: cada imagen con las detecciones marcadas. Su revisión es la forma de validar la receteta.',
          'Carpeta rois: selecciones que pueden abrirse en Fiji (arrastrando el .zip sobre Fiji con la imagen abierta) para revisarlas o corregirlas.',
          'log.txt: registro de la ejecución, con las imágenes omitidas y el motivo.',
        ],
        nota: 'Si Excel muestra los datos en una sola columna o con decimales incorrectos: Datos › Desde texto/CSV, separador coma y punto como separador decimal.',
        captura: { archivo: 'e-resultados.png', alt: 'Carpeta de resultados con resumen.csv, objetos.csv y las carpetas control y rois.' },
      },
      {
        id: 'guardar',
        titulo: 'F. Reutilización del macro',
        lista: 'ul',
        items: [
          'En el editor: File › Save As…, con un nombre terminado en .ijm.',
          'Para incluirlo en el menú de Fiji: guardarlo en la carpeta de Fiji, en scripts/Plugins/Recetetas/, y reiniciar Fiji. Aparecerá en Plugins › Recetetas.',
        ],
        captura: { archivo: 'f-menu.png', alt: 'Menú Plugins de Fiji con el submenú Recetetas.' },
      },
      {
        id: 'stardist',
        titulo: 'G. Instalación de StarDist (solo recetetas que lo usan)',
        lista: 'ol',
        items: [
          'Help › Update…',
          'Botón Manage update sites.',
          'Activar CSBDeep y StarDist.',
          'Apply and Close y, después, Apply changes.',
          'Reiniciar Fiji.',
        ],
        captura: { archivo: 'g-update-sites.png', alt: 'Ventana Manage update sites con CSBDeep y StarDist marcados.' },
      },
      {
        id: 'validar',
        titulo: 'H. Validación antes de su uso en datos definitivos',
        lista: 'ol',
        items: [
          'Ejecutar la receteta sobre 5–10 imágenes representativas, incluidas las más difíciles.',
          'Contar manualmente esas mismas imágenes y comparar.',
          'Ajustar la receteta hasta obtener una concordancia razonable, revisando las imágenes de control.',
          'No modificar la receteta a mitad de un experimento: todas las condiciones se analizan con la misma.',
          'Archivar el .ijm junto a los datos: la cabecera documenta todos los parámetros.',
        ],
        captura: { archivo: 'h-control.png', alt: 'Imagen de control con las esferas detectadas marcadas en amarillo.' },
      },
    ],
    errores: {
      titulo: 'Errores frecuentes',
      columnas: ['Síntoma', 'Causa probable', 'Solución'],
      filas: [
        ['«Statement cannot begin with…» u otro error en la primera línea', 'El editor no está en IJ1 Macro', 'Language › IJ1 Macro y volver a ejecutar'],
        ['«Esta receteta usa StarDist, que no está instalado»', 'Falta el plugin', 'Paso G'],
        ['«No se ha encontrado ninguna imagen válida»', 'Extensión distinta de la indicada en la receteta', 'Comprobar el formato en el paso Imágenes de la receteta'],
        ['En el Log: «no tiene escala en micras. Se omite»', 'La imagen no incluye el tamaño de píxel (habitual en JPG o TIFF exportados)', 'Seleccionar «Escala manual» en la receteta e introducir las micras por píxel'],
        ['El macro se detiene con «File is not in a supported format» o similar', 'Archivo dañado o de otro tipo en la carpeta (el lenguaje de macros no permite capturar este error)', 'Retirar el archivo de la carpeta y volver a ejecutar'],
        ['Recuento excesivo de esferas o núcleos', 'Ruido o restos detectados', 'Aumentar el tamaño mínimo o la circularidad; activar «Limpiar ruido»'],
        ['Recuento insuficiente', 'Umbral demasiado estricto o esferas poco contrastadas', 'Probar otro método de umbral (Triangle, Li) o la detección por bordes'],
        ['Esferas divididas en varios fragmentos', 'Watershed activado o contornos discontinuos', 'Desactivar «Separar esferas en contacto» o aumentar el grosor del contorno'],
        ['Fiji muy lento o error de memoria', 'Imágenes muy grandes', 'Edit › Options › Memory & Threads: asignar más memoria (hasta un 75 % de la RAM)'],
        ['Resultados en píxeles', 'Escala no aplicada', 'Comprobar el paso de escala de la receteta'],
        ['Acentos incorrectos en los comentarios («imÃ¡genes»)', 'El archivo se abrió con otra codificación', 'No afecta al análisis; los mensajes del macro están protegidos'],
      ],
    },
    alternativaGels: 'Para western blot existe también el método clásico de Fiji, Analyze › Gels (Select First Lane, Select Next Lane, Plot Lanes), que esta app no genera.',
  },

  pantallas: {
    resultado: { titulo: 'Macro' },
    instrucciones: { titulo: 'Uso en Fiji' },
    rapido: { titulo: 'Análisis rápido' },
    noEncontrada: {
      titulo: 'Página no encontrada',
      volver: 'Volver al inicio',
    },
  },

  provisional: {
    enConstruccion: 'Pantalla no disponible todavía.',
  },
} as const;

export type Textos = typeof t;
