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
    corruptas: (n: number) =>
      n === 1
        ? 'Una receteta guardada estaba dañada y se ha apartado. Puedes descargarla desde Ajustes.'
        : `${n} recetetas guardadas estaban dañadas y se han apartado. Puedes descargarlas desde Ajustes.`,
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

  tipos: {
    esferas: {
      nombre: 'Mamosferas',
      frase: 'Cuenta esferas en campo claro, mide su tamaño y calcula la eficiencia de formación (SFE).',
    },
    fluorescencia: {
      nombre: 'Fluorescencia',
      frase: 'Cuenta núcleos y calcula el porcentaje de células positivas para hasta tres marcadores.',
    },
    western: {
      nombre: 'Western blot',
      frase: 'Densitometría de bandas: tú marcas las bandas y el macro corrige, mide y guarda.',
    },
  },

  campo: {
    queEsEsto: '¿Qué es esto?',
    ocultarAyuda: 'Ocultar ayuda',
    recomendado: 'Recomendado',
    si: 'Sí',
    no: 'No',
    vacioSinLimite: 'Vacío = sin límite',
    noEsNumero: 'Escribe un número',
    opcional: 'Opcional',
  },

  inicio: {
    titulo: 'Tus recetetas',
    eyebrow: 'Fiji pa los reales',
    heroAntes: 'Macros de Fiji',
    heroClave: 'sin',
    heroDespues: 'programar',
    heroTexto:
      'Elige opciones con botones y llévate un macro listo para pegar en Fiji. Un mismo criterio para toda la carpeta.',
    vacio: 'Aún no tienes recetetas. Empieza por una plantilla: luego la ajustas a tus imágenes.',
    plantillas: 'Plantillas',
    plantillasTexto: 'Recetetas de ejemplo. Al abrir una se crea una copia tuya que puedes ajustar.',
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
    confirmarBorrarTexto: 'Podrás deshacerlo durante unos segundos.',
    renombrarTitulo: 'Renombrar receteta',
    nuevoNombre: 'Nuevo nombre',
    guardarNombre: 'Guardar nombre',
    accesos: 'Accesos',
  },

  compartir: {
    titulo: (n: string) => `Receteta «${n}»`,
    texto: 'Abre este enlace en el ordenador del laboratorio para importar la receteta en Fiji pa los reales.',
    enlaceCopiado: 'Enlace copiado. Pégalo en un correo o en un mensaje.',
    enlaceNoCopiado: 'No se ha podido copiar. Mantén pulsado el enlace para copiarlo:',
    demasiadoLargo:
      'Esta receteta es demasiado grande para un enlace. Te damos el archivo .json: impórtalo en Ajustes en el otro dispositivo.',
    sinUrlPublica:
      'Desde la app no se pueden crear enlaces porque aún no hay una dirección web publicada. Te damos el archivo .json: impórtalo en Ajustes en el otro dispositivo.',
    jsonGuardado: (donde?: string) =>
      donde ? `Archivo guardado en ${donde}` : 'Archivo .json descargado',
    error: 'No se ha podido compartir la receteta.',
  },

  asistente: {
    tituloNueva: 'Nueva receteta',
    tituloEditar: 'Editar receteta',
    elegirTipo: '¿Qué quieres analizar?',
    elegirTipoTexto: 'Elige el tipo de análisis. Podrás ajustar cada opción en los pasos siguientes.',
    progreso: (n: number, total: number) => `Paso ${n} de ${total}`,
    pasos: 'Pasos de la receteta',
    pasoOculto: 'Paso ',
    avanzadas: 'Opciones avanzadas',
    guardar: 'Guardar receteta',
    guardarCambios: 'Guardar cambios',
    guardada: 'Receteta guardada',
    hayErrores: 'Revisa los campos marcados antes de seguir.',
    borradorRecuperado: 'Hemos recuperado el borrador que dejaste a medias.',
    empezarDeCero: 'Empezar de cero',
    avisoPlantilla: 'Revisa la escala y el tamaño mínimo: dependen de tu microscopio y tu objetivo.',
    salirTitulo: '¿Salir sin guardar?',
    salirTexto:
      'Tienes cambios sin guardar. El borrador se conserva en este dispositivo y podrás seguir más tarde.',
    salir: 'Salir',
    seguirEditando: 'Seguir editando',
    vistaPrevia: 'Vista previa',
    vistaPreviaTexto: 'Así queda la receteta con las opciones actuales.',
    noEncontrada: 'Esta receteta no existe o se ha borrado.',
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
          'Solo se procesan los archivos de la carpeta con estas extensiones. Elige «Todas» si mezclas formatos. Los .czi, .lif, .nd2, .lsm y .oib se abren con Bio-Formats.',
        todas: 'Todas las compatibles',
        avisoSeries:
          'En archivos .lif y .czi con varias series, solo se abre la primera. Si necesitas todas, expórtalas antes como TIFF.',
      },
      escala: {
        etiqueta: 'Escala (tamaño del píxel)',
        ayuda:
          'Para medir en micras, Fiji necesita saber cuánto mide un píxel. Los TIFF del microscopio suelen guardarlo; los JPG o las capturas, no.',
        archivo: 'La guarda el archivo',
        archivoTexto: 'Las imágenes sin escala se avisan en el Log y se saltan.',
        manual: 'Escala manual',
        manualTexto: 'Escribes cuántas micras mide un píxel con tu objetivo.',
      },
      micrasPorPixel: {
        etiqueta: 'Micras por píxel (µm/píxel)',
        ayuda:
          'Depende del microscopio, la cámara y el objetivo. Búscalo en los metadatos de una imagen o calcúlalo con una barra de escala.',
      },
      proyeccionZ: {
        etiqueta: 'Si hay pilas Z',
        ayuda:
          'Si cada imagen tiene varios planos de enfoque, se combinan en uno. «Máxima» conserva lo más brillante de cada plano.',
        ninguna: 'No combinar',
        maxima: 'Proyección máxima',
        media: 'Proyección media',
      },
      avisoRgb:
        'Las imágenes RGB (JPG de cámara, capturas) no tienen canales separados y no sirven para este análisis. Usa los archivos originales del microscopio.',
    },

    esferas: {
      canal: {
        etiqueta: 'Canal que se analiza',
        ayuda: 'Si la imagen tiene varios canales, cuál se analiza. En campo claro suele ser el 1.',
      },
      metodo: {
        etiqueta: 'Cómo se detectan las esferas',
        ayuda:
          '«Por bordes» detecta el contorno de cada esfera; funciona mejor en campo claro con halo. «Por contraste» separa oscuro de claro; solo para fondos muy uniformes.',
        bordes: 'Por bordes',
        bordesTexto: 'Campo claro con halo alrededor de las esferas.',
        umbral: 'Por contraste',
        umbralTexto: 'Fondos muy uniformes y limpios.',
      },
      suavizado: {
        etiqueta: 'Suavizado (píxeles)',
        ayuda:
          'Difumina un poco la imagen para que el ruido no se confunda con esferas. 0 = sin suavizado.',
      },
      radioBordes: {
        etiqueta: 'Grosor del contorno (píxeles)',
        ayuda: 'Solo «por bordes». Grosor del contorno que se busca. Súbelo si las esferas salen partidas.',
      },
      restarFondo: {
        etiqueta: 'Corregir iluminación desigual',
        ayuda:
          'Solo «por contraste». Corrige la iluminación desigual. El radio debe ser mayor que la esfera más grande, en píxeles.',
      },
      restarFondoRadio: {
        etiqueta: 'Radio de corrección (píxeles)',
        ayuda: 'Debe ser mayor que la esfera más grande, en píxeles.',
      },
      metodoUmbral: {
        etiqueta: 'Regla del umbral automático',
        ayuda:
          'Regla automática para decidir qué es objeto y qué fondo. Otsu funciona en la mayoría de casos; prueba Triangle si se pierden esferas pálidas.',
      },
      rellenarHuecos: {
        etiqueta: 'Rellenar huecos',
        ayuda: 'Rellena el interior de las esferas, que en campo claro a veces es claro como el fondo.',
      },
      limpiarRuido: {
        etiqueta: 'Limpiar ruido',
        ayuda: 'Elimina puntitos y bordes finos sueltos (operación «Open»).',
      },
      separarTocandose: {
        etiqueta: 'Separar esferas pegadas',
        ayuda:
          'Separa esferas pegadas (Watershed). Cuidado: puede partir en dos esferas irregulares y aumentar el recuento. Revisa las imágenes de control.',
      },
      diametroMin: {
        etiqueta: 'Diámetro mínimo (µm)',
        ayuda:
          'Tamaño mínimo para contar como esfera. 50 µm es el criterio más habitual en la bibliografía; usa el de tu laboratorio.',
      },
      diametroMax: {
        etiqueta: 'Diámetro máximo (µm)',
        ayuda: 'Tamaño máximo. Útil para descartar agregados enormes. Vacío = sin límite.',
      },
      circularidadMin: {
        etiqueta: 'Circularidad mínima (0–1)',
        ayuda:
          '1 es un círculo perfecto. Bájalo si se pierden esferas irregulares; súbelo si se cuelan restos alargados.',
      },
      excluirBordes: {
        etiqueta: 'Excluir esferas del borde',
        ayuda: 'No cuenta las esferas cortadas por el borde de la imagen.',
      },
      celulasSembradas: {
        etiqueta: 'Células sembradas por pocillo',
        ayuda:
          'Células sembradas por pocillo. Si lo rellenas, se calcula la SFE. Solo tiene sentido si la imagen abarca el pocillo entero.',
      },
      salidas: {
        etiqueta: 'Qué archivos guardar',
        ayuda: 'Qué archivos guardar.',
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
          'Cada marcador que quieres medir: su nombre (p. ej. «CD44»), su canal y, opcionalmente, la intensidad a partir de la cual una célula es positiva.',
        anadir: 'Añadir marcador',
        quitar: (n: string) => `Quitar ${n || 'marcador'}`,
        nombre: 'Nombre',
        canal: 'Canal',
        umbral: 'Umbral de positividad',
        umbralAyuda: 'Vacío = solo exportar intensidades.',
        ninguno: 'Sin marcadores: solo se cuentan núcleos.',
        maximo: 'Máximo 3 marcadores.',
        avisoUmbral:
          'Decide el umbral con tus controles negativos (sin anticuerpo primario o isotipo) analizados con esta misma receteta. Usa siempre las mismas condiciones de adquisición.',
        titulo: (n: number) => `Marcador ${n}`,
      },
      deteccion: {
        etiqueta: 'Cómo se detectan los núcleos',
        ayuda:
          '«Umbral» funciona sin instalar nada. «StarDist» usa inteligencia artificial y separa mucho mejor los núcleos pegados, pero hay que instalar el plugin (ver instrucciones).',
        umbral: 'Umbral',
        umbralTexto: 'Sin instalar nada.',
        stardist: 'StarDist',
        stardistTexto: 'Separa mejor los núcleos pegados. Requiere el plugin.',
      },
      metodoUmbral: {
        etiqueta: 'Regla del umbral automático',
        ayuda: 'Solo con «umbral». Otsu funciona en la mayoría de casos.',
      },
      restarFondoRadio: {
        etiqueta: 'Radio para restar el fondo (píxeles)',
        ayuda:
          'Corrige el fondo de la fluorescencia. 0 = no corregir. Debe ser bastante mayor que un núcleo.',
      },
      separarNucleos: {
        etiqueta: 'Separar núcleos pegados',
        ayuda: 'Solo con «umbral». Separa núcleos pegados (Watershed).',
      },
      probabilidadStardist: {
        etiqueta: 'Probabilidad mínima (StarDist)',
        ayuda: 'Solo StarDist. Más alto = menos núcleos dudosos.',
      },
      solapamientoStardist: {
        etiqueta: 'Solapamiento admitido (StarDist)',
        ayuda: 'Solo StarDist. Más alto = admite núcleos más solapados.',
      },
      areaNucleoMin: {
        etiqueta: 'Área mínima del núcleo (µm²)',
        ayuda:
          'Descarta restos pequeños y grupos grandes. Un núcleo típico de célula de mama en cultivo ocupa unas decenas a pocos cientos de µm²; ajústalo mirando las imágenes de control.',
      },
      areaNucleoMax: {
        etiqueta: 'Área máxima del núcleo (µm²)',
        ayuda:
          'Descarta grupos de núcleos que no se han separado. Ajústalo mirando las imágenes de control.',
      },
      excluirBordes: {
        etiqueta: 'Excluir núcleos del borde',
        ayuda: 'No cuenta núcleos cortados por el borde.',
      },
      medida: {
        etiqueta: 'Qué intensidad se mide',
        ayuda:
          '«Media»: brillo medio dentro del núcleo (recomendado para decidir positivo/negativo). «Integrada»: brillo total, depende del tamaño.',
        media: 'Media',
        mediaTexto: 'Brillo medio dentro del núcleo.',
        integrada: 'Integrada',
        integradaTexto: 'Brillo total; depende del tamaño.',
      },
    },

    western: {
      avisos: [
        'Usa la imagen original del equipo de adquisición en TIFF (idealmente de 16 bits), nunca un JPG ni una captura de pantalla.',
        'Mide la proteína de interés y el control de carga con la misma receteta y normaliza después: señal / control de carga, y luego respecto a la condición control.',
        'Mide todas las bandas con el mismo rectángulo.',
      ],
      bandasOscuras: {
        etiqueta: 'Bandas oscuras sobre fondo claro',
        ayuda:
          'Bandas oscuras sobre fondo claro (lo normal en quimioluminiscencia exportada). El macro invierte la imagen para que más señal = número más alto.',
      },
      fondo: {
        etiqueta: 'Corrección del fondo',
        ayuda: 'Cómo se resta el fondo de la membrana.',
        rollingBall: 'Rolling ball',
        rollingBallTexto: 'Resta el fondo irregular de la membrana.',
        ninguno: 'Ninguna',
        ningunoTexto: 'No se corrige el fondo.',
      },
      radioFondo: {
        etiqueta: 'Radio del fondo (píxeles)',
        ayuda: 'Debe ser mayor que la altura de una banda.',
      },
      nombreProteina: {
        etiqueta: 'Proteína',
        ayuda: 'Aparece en el nombre del archivo de resultados (p. ej. «SOX2», «β-actina»).',
      },
      avisarSaturacion: {
        etiqueta: 'Avisar si hay saturación',
        ayuda:
          'Avisa si hay píxeles saturados: en ese caso la cuantificación no es fiable y hay que usar una exposición más corta.',
      },
      columna: 'Usa la columna RawIntDen (señal total de la banda) de la tabla de resultados.',
    },

    nombre: {
      nombre: { etiqueta: 'Nombre de la receteta', ayuda: 'Entre 1 y 60 caracteres. Te servirá para encontrarla.' },
      descripcion: {
        etiqueta: 'Descripción',
        ayuda: 'Opcional, máximo 300 caracteres. Para qué experimento es, qué objetivo usaste…',
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
    sinDatos: 'Este enlace no contiene ninguna receteta.',
    nombreExiste: (n: string) => `Ya tienes una receteta con ese nombre. Se guardará como «${n}».`,
    guardada: 'Receteta guardada',
    leyendo: 'Leyendo el enlace…',
  },

  ajustes: {
    titulo: 'Ajustes',
    copia: 'Copia de seguridad',
    copiaTexto:
      'Guarda todas tus recetetas en un archivo .json. Sirve para no perderlas y para pasarlas a otro dispositivo.',
    exportar: 'Exportar recetetas',
    importar: 'Importar archivo .json',
    exportado: (donde?: string) =>
      donde ? `Copia guardada en ${donde}` : 'Copia de seguridad descargada',
    nadaQueExportar: 'Aún no tienes recetetas que exportar.',
    importadas: (n: number, rechazadas: number) =>
      `${n === 1 ? 'Importada 1 receteta' : `Importadas ${n} recetetas`}` +
      (rechazadas ? `. ${rechazadas} no eran válidas y se han ignorado.` : '.'),
    errorImportar: 'No se ha podido leer el archivo.',
    corruptas: 'Recetetas dañadas',
    corruptasTexto: (n: number) =>
      `${n === 1 ? 'Hay 1 receteta apartada' : `Hay ${n} recetetas apartadas`} porque no se podían leer. Descárgalas para intentar recuperarlas.`,
    descargarCorruptas: 'Descargar recetetas dañadas',
    idioma: 'Idioma del texto de Métodos',
    idiomaTexto: 'El idioma con el que se abre el texto para Materiales y Métodos.',
    espanol: 'Español',
    ingles: 'Inglés',
    borrarTodo: 'Borrar todos los datos',
    borrarTodoTexto: 'Borra todas las recetetas, el borrador y los ajustes de este dispositivo.',
    borrarConfirmar1: '¿Borrar todos los datos?',
    borrarConfirmar1Texto: 'Se borrarán todas tus recetetas de este dispositivo.',
    borrarConfirmar2: '¿Seguro? Esto no se puede deshacer',
    borrarConfirmar2Texto: 'Si no tienes una copia de seguridad, perderás tus recetetas para siempre.',
    borrarSi: 'Sí, borrar',
    borrarDefinitivo: 'Borrar definitivamente',
    borrado: 'Se han borrado todos los datos.',
    acerca: 'Acerca de',
    instalar: 'Cómo instalar la app en el móvil',
    instalarPasos: [
      'iPhone: abre la app en Safari, pulsa Compartir y después «Añadir a pantalla de inicio».',
      'Android: abre la app en Chrome, pulsa el menú ⋮ y después «Instalar aplicación» o «Añadir a pantalla de inicio».',
      'Una vez instalada funciona sin conexión.',
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
        separar ? 'separa esferas pegadas' : 'no separa esferas pegadas',
      ].join(', '),
    tamano: (min: string, max: string | null, circ: string, bordes: boolean) =>
      `Cuenta esferas de ${min} µm o más${max ? ` y hasta ${max} µm` : ''}, circularidad ≥ ${circ}${bordes ? ', sin las cortadas por el borde' : ''}`,
    sfe: (n: string) => `Calcula la SFE con ${n} células sembradas por pocillo`,
    sinSfe: 'No calcula la SFE (faltan las células sembradas)',
    nucleosUmbral: (c: number, u: string, separar: boolean) =>
      `Núcleos en el canal ${c} por umbral ${u}${separar ? ', separando núcleos pegados' : ''}`,
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
    westernColumna: 'Usa la columna RawIntDen (señal total de la banda)',
  },

  pantallas: {
    resultado: { titulo: 'Tu macro' },
    instrucciones: { titulo: 'Cómo usarlo en Fiji' },
    rapido: { titulo: 'Análisis rápido' },
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
