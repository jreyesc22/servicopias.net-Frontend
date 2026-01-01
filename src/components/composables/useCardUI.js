import { computed } from 'vue'

/**
 * ============================================================================
 * useCardUI - Composable de UI para Cards y Componentes
 * ============================================================================
 * 
 * Proporciona helpers de JavaScript para configuración visual de componentes.
 * 
 * INTEGRADO CON SISTEMA DE DISEÑO GLOBAL v2.0
 * 
 * ⚠️ IMPORTANTE:
 * - Los estilos CSS están en design-system.css (no copiar aquí)
 * - Solo usar helpers de JavaScript de este composable
 * - Las clases CSS están disponibles globalmente
 * 
 * ============================================================================
 * 
 * ✅ USO CORRECTO:
 * 
 * import { useCardUI } from '@/components/composables/useCardUI'
 * 
 * const { 
 *   getHeaderConfig,      // Configuración de headers
 *   getChipColor,         // Colores de chips por estado
 *   formatearMoneda,      // Formatear valores
 *   getIcono,             // Obtener iconos
 *   crearChipEstado       // Crear chips de estado
 * } = useCardUI()
 * 
 * <template>
 *   <v-card-title class="bg-gradient-primary text-white">Título</v-card-title>
 *   <div class="totales-container">{{ formatearMoneda(total) }}</div>
 * </template>
 * 
 * ============================================================================
 * 
 * 📚 REFERENCIAS:
 * @see Frontend/DESIGN_SYSTEM_README.md - Sistema de diseño completo
 * @see Frontend/USE_CARD_UI_MIGRATION.md - Guía de migración
 * @see Frontend/src/styles/design-system.css - Estilos globales
 * 
 * ============================================================================
 * 
 * @version 2.0.0
 * @date 2026-01-01
 * @author ServiCopias.net Team
 */
export function useCardUI() {
  // Referencia a gradientes de variables CSS
  // Estos valores se obtienen dinámicamente de :root en design-system.css
  const gradientes = {
    primary: 'var(--gradient-primary)',
    success: 'var(--gradient-success)',
    info: 'var(--gradient-info)',
    warning: 'var(--gradient-warning)',
    error: 'var(--gradient-error)',
    purple: 'var(--gradient-purple)'
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
    getPaginacionTexto
  }
}
