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

  resultado: {
    titulo: 'Tu macro',
    copiar: 'Copiar macro',
    copiado: 'Macro copiado',
    pulsaCtrlC: 'No se ha podido copiar automáticamente. El macro está seleccionado: pulsa Ctrl+C (Cmd+C en Mac).',
    descargar: 'Descargar .ijm',
    descargado: (donde?: string) => (donde ? `Macro guardado en ${donde}` : 'Macro descargado'),
    enviar: 'Enviar al ordenador',
    metodos: 'Texto para Métodos',
    comoLanzar: 'Cómo lanzarlo en Fiji',
    editar: 'Editar receteta',
    codigo: 'Código del macro',
    ajustarLineas: 'Ajustar líneas',
    lineas: (n: number) => `${n} líneas`,
    noDisponible: 'El macro de este tipo de análisis llega en una fase posterior de la app.',
    invalida: 'La receteta tiene errores. Ábrela y corrígelos para generar el macro.',
    vistaPreviaMacro: 'Macro en vivo',
    vistaPreviaPendiente: 'Corrige los campos marcados para ver el macro.',
    avisoSeries: 'Los archivos .lif y .czi con varias series: solo se analiza la primera.',
    errorDescarga: 'No se ha podido guardar el archivo.',
  },

  guia: {
    titulo: 'Cómo usarlo en Fiji',
    intro: 'Sigue estos pasos en el ordenador donde está Fiji. Toca cada paso para desplegarlo.',
    hueco: 'Captura pendiente',
    pasos: [
      {
        id: 'instalar',
        titulo: 'A. Si aún no tienes Fiji',
        lista: 'ol',
        items: [
          'Descarga Fiji desde imagej.net/software/fiji/downloads (elige tu sistema).',
          'Descomprime la carpeta en un sitio donde tengas permisos de escritura, por ejemplo en Documentos. En Windows, no la pongas en "Archivos de programa": Fiji no podría actualizarse.',
          'En Mac, si al abrirla dice que no se puede verificar el desarrollador, haz clic derecho sobre Fiji › Abrir.',
        ],
        captura: { archivo: 'a-descarga.png', alt: 'Página de descargas de Fiji con los botones para Windows, Mac y Linux.' },
      },
      {
        id: 'llevar',
        titulo: 'B. Lleva el macro al ordenador donde está Fiji (elige una)',
        lista: 'ul',
        items: [
          'Opción 1: en la app, pulsa "Descargar .ijm" o "Enviar al ordenador" y abre el archivo en el ordenador.',
          'Opción 2: envíate el enlace de la receteta, ábrelo en el ordenador y pulsa "Copiar macro".',
        ],
        captura: { archivo: 'b-enviar.png', alt: 'Pantalla del macro en la app con los botones Copiar, Descargar y Enviar al ordenador.' },
      },
      {
        id: 'abrir',
        titulo: 'C. Abrir el macro en Fiji (elige una)',
        lista: 'ul',
        items: [
          'Con archivo .ijm: arrastra el archivo sobre la ventana principal de Fiji (la barra de herramientas). Se abre en el editor de scripts.',
          'Pegando el texto: 1) En Fiji, ve a File › New › Script… 2) En el editor que se abre, menú Language › IJ1 Macro. Este paso es imprescindible: si el lenguaje es otro, el macro dará errores. 3) Haz clic dentro del editor y pega con Ctrl+V (Cmd+V en Mac).',
        ],
        captura: { archivo: 'c-editor.png', alt: 'Editor de scripts de Fiji con el menú Language abierto y la opción IJ1 Macro marcada.' },
      },
      {
        id: 'lanzar',
        titulo: 'D. Lanzarlo',
        lista: 'ol',
        items: [
          'Pulsa el botón Run, abajo a la izquierda del editor, o Ctrl+R (Cmd+R en Mac).',
          'Fiji te pedirá la carpeta con las imágenes. Elige la carpeta (no una imagen suelta).',
          'Después te pedirá dónde guardar los resultados. Usa una carpeta vacía y distinta de la de las imágenes.',
          'Espera. En la barra de Fiji verás el progreso y en la ventana Log, cada imagen procesada.',
          'Al terminar aparece el mensaje "Terminado" con el número de imágenes.',
        ],
        nota: 'En western blot el macro te pide una sola imagen y se detiene para que marques las bandas: sigue las instrucciones de la ventana emergente.',
        captura: { archivo: 'd-run.png', alt: 'Botón Run en la parte inferior izquierda del editor de scripts de Fiji.' },
      },
      {
        id: 'resultados',
        titulo: 'E. Revisa los resultados',
        lista: 'ul',
        items: [
          'resumen.csv: una fila por imagen (recuento, tamaños medios, SFE o porcentaje de positivas). Se abre con Excel.',
          'objetos.csv: una fila por esfera o núcleo, con todas las medidas.',
          'Carpeta control: cada imagen con lo detectado marcado. Mírala siempre: es la forma de saber si la receteta funciona.',
          'Carpeta rois: las selecciones, que puedes abrir en Fiji (arrastra el .zip sobre Fiji con la imagen abierta) para revisar o corregir.',
          'log.txt: el registro de la ejecución, con las imágenes omitidas y el motivo.',
        ],
        nota: 'Si Excel muestra los números mal (todo en una columna o decimales raros), impórtalo con Datos › Desde texto/CSV, separador coma y punto como separador decimal.',
        captura: { archivo: 'e-resultados.png', alt: 'Carpeta de resultados con resumen.csv, objetos.csv y las carpetas control y rois.' },
      },
      {
        id: 'guardar',
        titulo: 'F. Guardar el macro para usarlo más veces',
        lista: 'ul',
        items: [
          'En el editor: File › Save As… y nombre terminado en .ijm.',
          'Para tenerlo en el menú de Fiji: guárdalo dentro de la carpeta de Fiji en scripts/Plugins/Recetetas/ y reinicia Fiji. Aparecerá en Plugins › Recetetas.',
        ],
        captura: { archivo: 'f-menu.png', alt: 'Menú Plugins de Fiji con el submenú Recetetas.' },
      },
      {
        id: 'stardist',
        titulo: 'G. Instalar StarDist (solo para recetetas que lo usan)',
        lista: 'ol',
        items: [
          'Help › Update…',
          'Botón Manage update sites.',
          'Marca CSBDeep y StarDist.',
          'Apply and Close, después Apply changes.',
          'Reinicia Fiji.',
        ],
        captura: { archivo: 'g-update-sites.png', alt: 'Ventana Manage update sites con CSBDeep y StarDist marcados.' },
      },
      {
        id: 'validar',
        titulo: 'H. Antes de usar una receteta para datos de la tesis',
        lista: 'ol',
        items: [
          'Lánzala sobre 5–10 imágenes representativas, incluidas las más difíciles.',
          'Cuenta a mano esas mismas imágenes y compara.',
          'Ajusta la receteta hasta que coincidan razonablemente y mira las imágenes de control.',
          'A partir de ahí, no cambies la receteta en mitad de un experimento: todas las condiciones se analizan con la misma.',
          'Guarda el .ijm junto a los datos: la cabecera documenta todos los parámetros.',
        ],
        captura: { archivo: 'h-control.png', alt: 'Imagen de control con las esferas detectadas marcadas en amarillo.' },
      },
    ],
    errores: {
      titulo: 'Errores comunes',
      columnas: ['Qué ves', 'Causa probable', 'Solución'],
      filas: [
        ['"Statement cannot begin with…" u otro error en la primera línea', 'El editor no está en IJ1 Macro', 'Language › IJ1 Macro y vuelve a pulsar Run'],
        ['"Esta receteta usa StarDist, que no está instalado"', 'Falta el plugin', 'Paso G'],
        ['"No se ha encontrado ninguna imagen válida"', 'Extensión distinta de la elegida en la receteta', 'Revisa el formato de tus archivos en el paso Imágenes de la receteta'],
        ['En el Log: "no tiene escala en micras. Se omite"', 'La imagen no guarda el tamaño de píxel (típico en JPG o TIFF exportados)', 'Elige "Escala manual" en la receteta e introduce las micras por píxel de tu objetivo'],
        ['El macro se para con "File is not in a supported format" o similar', 'Un archivo dañado o de otro tipo en la carpeta (Fiji no puede saltárselo: el lenguaje de macros no permite capturar ese error)', 'Sácalo de la carpeta y vuelve a lanzar'],
        ['Cuenta demasiadas esferas o núcleos', 'Ruido o restos detectados', 'Sube el tamaño mínimo o la circularidad; activa limpiar ruido'],
        ['Cuenta muy pocas', 'Umbral demasiado estricto o esferas pálidas', 'Prueba otro método de umbral (Triangle, Li) o el método por bordes'],
        ['Esferas partidas en varios trozos', 'Watershed activado o contornos discontinuos', 'Desactiva "Separar esferas pegadas" o sube el radio de bordes'],
        ['Fiji va muy lento o da error de memoria', 'Imágenes muy grandes', 'Edit › Options › Memory & Threads y asigna más memoria (hasta un 75 % de la RAM)'],
        ['Los resultados parecen en píxeles', 'Escala no aplicada', 'Revisa el paso de escala de la receteta'],
        ['Los acentos salen raros en los mensajes ("imÃ¡genes")', 'Solo en comentarios: el archivo se abrió con otra codificación', 'No afecta al análisis. Los mensajes del macro ya están protegidos'],
      ],
    },
    alternativaGels: 'Para western blot también existe el método clásico de Fiji: Analyze › Gels (Select First Lane, Select Next Lane, Plot Lanes). Esta app no lo genera, pero puedes usarlo si lo prefieres.',
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
