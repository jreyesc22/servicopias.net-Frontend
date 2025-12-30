import { computed } from 'vue'

/**
 * Composable para estilos y configuración visual de Cards
 * Proporciona diseño consistente sin afectar la lógica de negocio
 */
export function useCardUI() {
  // Configuración de gradientes
  const gradientes = {
    primary: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    success: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
    info: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    warning: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
    error: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
    purple: 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)'
  }

  // Configuración de colores para chips
  const chipColors = {
    producto: 'blue',
    servicio: 'green',
    pendiente: 'warning',
    'en proceso': 'blue',
    'en produccion': 'purple',
    finalizado: 'success',
    entregado: 'success',
    cancelado: 'error',
    pagado: 'success',
    parcial: 'warning'
  }

  // Configuración de iconos
  const iconos = {
    producto: 'mdi-package',
    servicio: 'mdi-tools',
    carrito: 'mdi-cart-plus',
    carritoCheck: 'mdi-cart-check',
    cliente: 'mdi-account',
    telefono: 'mdi-phone',
    nit: 'mdi-card-account-details',
    buscar: 'mdi-magnify',
    filtro: 'mdi-shape',
    limpiar: 'mdi-filter-off',
    editar: 'mdi-pencil',
    eliminar: 'mdi-delete',
    agregar: 'mdi-plus',
    imagen: 'mdi-image',
    pdf: 'mdi-file-pdf-box',
    check: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    info: 'mdi-information'
  }

  /**
   * Genera configuración de header para v-card-title
   * @param {Object} config - Configuración del header
   * @param {string} config.tipo - Tipo de gradiente (primary, success, etc)
   * @param {string} config.icono - Nombre del icono mdi
   * @param {string} config.titulo - Texto del título
   * @param {number} config.contador - Número para el chip contador (opcional)
   * @param {string} config.contadorTexto - Texto personalizado del contador (opcional)
   */
  function getHeaderConfig(config) {
    const { tipo = 'primary', icono, titulo, contador, contadorTexto } = config
    
    return {
      gradiente: gradientes[tipo],
      icono: icono.startsWith('mdi-') ? icono : iconos[icono],
      titulo,
      mostrarContador: contador !== undefined,
      contadorValor: contador,
      contadorTexto: contadorTexto || `${contador || 0} items`
    }
  }

  /**
   * Obtiene color para chip según su tipo/estado
   */
  function getChipColor(tipo) {
    return chipColors[tipo?.toLowerCase()] || 'grey'
  }

  /**
   * Obtiene icono según tipo
   */
  function getIcono(tipo) {
    return iconos[tipo] || 'mdi-help-circle'
  }

  /**
   * Estilos CSS como strings para usar en <style scoped>
   */
  const estilosGlobales = {
    // Clases de gradiente
    gradients: Object.keys(gradientes).map(key => `
.bg-gradient-${key} {
  background: ${gradientes[key]};
}
    `).join('\n'),

    // Estilos de tabla
    table: `
.v-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.v-table thead tr th {
  background-color: #f5f5f5;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.producto-row:hover,
.item-row:hover {
  background-color: #f9f9f9;
}
    `,

    // Estilos de texto
    text: `
.text-white {
  color: white !important;
}

.text-primary {
  color: #1976d2 !important;
}

.text-success {
  color: #2e7d32 !important;
}

.text-grey {
  color: #9e9e9e !important;
}
    `,

    // Estilos de contenedores
    containers: `
.totales-container {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.info-section {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
}
    `,

    // Responsive
    responsive: `
@media (max-width: 767px) {
  .v-table {
    font-size: 12px;
  }
}
    `
  }

  /**
   * Retorna todos los estilos como un string para copiar en <style scoped>
   */
  const todosLosEstilos = computed(() => {
    return Object.values(estilosGlobales).join('\n')
  })

  /**
   * Helper para crear chip de estado
   */
  function crearChipEstado(estado, opciones = {}) {
    return {
      color: opciones.color || getChipColor(estado),
      size: opciones.size || 'small',
      variant: opciones.variant || 'tonal',
      texto: opciones.texto || estado
    }
  }

  /**
   * Helper para formatear moneda
   */
  function formatearMoneda(valor, simbolo = 'Q') {
    return `${simbolo} ${Number(valor).toFixed(2)}`
  }

  /**
   * Configuración de alertas/estados vacíos
   */
  function getEmptyStateConfig(tipo) {
    const configs = {
      carrito: {
        icono: 'mdi-cart-outline',
        titulo: 'El carrito está vacío',
        mensaje: 'Agrega productos desde la tabla de arriba',
        color: 'grey-lighten-1'
      },
      noResultados: {
        icono: 'mdi-information',
        titulo: 'No se encontraron resultados',
        mensaje: 'Intenta ajustar los filtros de búsqueda',
        color: 'info'
      },
      error: {
        icono: 'mdi-alert-circle',
        titulo: 'Error al cargar datos',
        mensaje: 'Por favor, intenta nuevamente',
        color: 'error'
      },
      cargando: {
        icono: 'mdi-loading',
        titulo: 'Cargando...',
        mensaje: 'Por favor espera',
        color: 'primary'
      }
    }

    return configs[tipo] || configs.noResultados
  }

  /**
   * Configuración de paginación
   */
  function getPaginacionTexto(pagina, porPagina, total) {
    const inicio = (pagina - 1) * porPagina + 1
    const fin = Math.min(pagina * porPagina, total)
    return {
      rango: `${inicio} - ${fin}`,
      total,
      texto: `Mostrando ${inicio} - ${fin} de ${total}`,
      paginaActual: pagina,
      totalPaginas: Math.ceil(total / porPagina)
    }
  }

  return {
    // Configuraciones
    gradientes,
    chipColors,
    iconos,
    
    // Helpers principales
    getHeaderConfig,
    getChipColor,
    getIcono,
    crearChipEstado,
    formatearMoneda,
    getEmptyStateConfig,
    getPaginacionTexto,
    
    // Estilos
    estilosGlobales,
    todosLosEstilos
  }
}
