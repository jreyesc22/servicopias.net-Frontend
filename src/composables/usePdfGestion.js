/**
 * Composable para gestionar la descarga e impresión de archivos PDF
 * de los items de una orden.
 * 
 * Maneja:
 * - Validación de existencia de PDFs
 * - Descarga de archivos
 * - Estado de impresión (localStorage)
 * - Descarga masiva
 */

import { ref, computed } from 'vue'
import { resolveMediaUrl } from '@/utils/mediaUrl'

export function usePdfGestion(orden) {
  const descargandoPDF = ref({})
  const imprimiendoTodos = ref(false)
  const pdfsImpresos = ref(new Set())
  const snackbar = ref({
    mostrar: false,
    mensaje: '',
    color: 'info'
  })

  // ==================== Validaciones ====================
  
  /**
   * Verifica si un item tiene un archivo PDF asociado
   */
  const tienePDF = (item) => {
    return item.archivo_pdf || 
           item.pdf_url || 
           item.tiene_archivo || 
           item.ruta_pdf ||
           item.pdf_path ||
           (item.item && (
             item.item.archivo_pdf || 
             item.item.pdf_url || 
             item.item.tiene_archivo ||
             item.item.pdf_path
           )) ||
           // También verificar por categoría
           (item.item && item.item.categoria && 
            ['diseño', 'impresion', 'grafico'].includes(item.item.categoria.toLowerCase()))
  }

  /**
   * Construye la URL del PDF según la estructura del item
   */
  const obtenerURLPDF = (item) => {
    if (item.archivo_pdf) return resolveMediaUrl(item.archivo_pdf)
    if (item.pdf_url) return resolveMediaUrl(item.pdf_url)
    if (item.ruta_pdf) return resolveMediaUrl(item.ruta_pdf)
    if (item.item && item.item.archivo_pdf) return resolveMediaUrl(item.item.archivo_pdf)
    if (item.item && item.item.pdf_url) return resolveMediaUrl(item.item.pdf_url)
    
    // URL por defecto basada en la API
    return `${process.env.VUE_APP_API_URL}/files/items/${item.id}/archivo.pdf`
  }

  // ==================== Estado de impresión ====================
  
  /**
   * Genera un ID único para cada item basado en orden + item
   */
  const generarIdItem = (item) => {
    return `orden_${orden.value?.id}_item_${item.id}`
  }

  /**
   * Verifica si un item ya fue marcado como impreso
   */
  const estaImpreso = (item) => {
    const itemId = generarIdItem(item)
    return pdfsImpresos.value.has(itemId)
  }

  /**
   * Marca un item como impreso
   */
  const marcarComoImpreso = (item) => {
    const itemId = generarIdItem(item)
    pdfsImpresos.value.add(itemId)
    guardarPDFsImpresos()
  }

  /**
   * Desmarca un item como impreso
   */
  const desmarcarComoImpreso = (item) => {
    const itemId = generarIdItem(item)
    pdfsImpresos.value.delete(itemId)
    guardarPDFsImpresos()
  }

  /**
   * Alterna el estado de impresión de un item
   */
  const toggleImpreso = (item) => {
    if (estaImpreso(item)) {
      desmarcarComoImpreso(item)
      mostrarSnackbar('Marcado como no impreso', 'warning')
    } else {
      marcarComoImpreso(item)
      mostrarSnackbar('Marcado como impreso', 'success')
    }
  }

  // ==================== Persistencia (localStorage) ====================
  
  /**
   * Carga el estado de PDFs impresos desde localStorage
   */
  const cargarPDFsImpresos = () => {
    try {
      const guardados = localStorage.getItem('pdfs_impresos')
      if (guardados) {
        pdfsImpresos.value = new Set(JSON.parse(guardados))
      }
    } catch (error) {
      console.error('Error al cargar PDFs impresos:', error)
      pdfsImpresos.value = new Set()
    }
  }

  /**
   * Guarda el estado de PDFs impresos en localStorage
   */
  const guardarPDFsImpresos = () => {
    try {
      localStorage.setItem('pdfs_impresos', JSON.stringify([...pdfsImpresos.value]))
    } catch (error) {
      console.error('Error al guardar PDFs impresos:', error)
    }
  }

  /**
   * Resetea todos los estados de impresión
   */
  const resetearTodosLosImpresos = () => {
    if (confirm('¿Estás seguro de que quieres resetear el estado de todos los PDFs impresos?')) {
      pdfsImpresos.value.clear()
      guardarPDFsImpresos()
      mostrarSnackbar('Estado de impresión reseteado', 'info')
    }
  }

  // ==================== Descarga de PDFs ====================
  
  /**
   * Descarga un PDF individual
   */
  const descargarPDF = async (item) => {
    if (!tienePDF(item)) {
      mostrarSnackbar('Este item no tiene PDF disponible', 'warning')
      return false
    }

    descargandoPDF.value[item.id] = true

    try {
      const pdfUrl = obtenerURLPDF(item)
      
      // Verificar si el archivo existe
      const response = await fetch(pdfUrl, { method: 'HEAD' })
      
      if (!response.ok) {
        throw new Error('Archivo PDF no encontrado')
      }
      
      // Crear link de descarga
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${item.item?.nombre || 'item'}_${item.id}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      mostrarSnackbar('PDF descargado exitosamente', 'success')
      
      // Marcar como impreso automáticamente
      marcarComoImpreso(item)
      
      return { success: true, filename: link.download }

    } catch (error) {
      console.error('Error al descargar PDF:', error)
      mostrarSnackbar('Error al descargar el PDF: ' + error.message, 'error')
      return { success: false, error: error.message }
    } finally {
      descargandoPDF.value[item.id] = false
    }
  }

  /**
   * Descarga todos los PDFs de la orden
   */
  const imprimirTodosLosPDF = async () => {
    if (!hayPDFs.value) return

    imprimiendoTodos.value = true

    try {
      const itemsConPDF = pdfsNoImpresos.value
      
      if (itemsConPDF.length === 0) {
        mostrarSnackbar('Todos los PDFs ya han sido impresos', 'info')
        return
      }
      
      for (const item of itemsConPDF) {
        await descargarPDF(item)
        // Pequeña pausa entre descargas
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      mostrarSnackbar(`Se descargaron ${itemsConPDF.length} archivos PDF`, 'success')

    } catch (error) {
      console.error('Error al imprimir todos los PDFs:', error)
      mostrarSnackbar('Error al descargar algunos PDFs', 'error')
    } finally {
      imprimiendoTodos.value = false
    }
  }

  // ==================== Computed properties ====================
  
  const hayPDFs = computed(() => {
    return orden.value?.items?.some(item => tienePDF(item)) || false
  })

  const pdfsNoImpresos = computed(() => {
    return orden.value?.items?.filter(item => 
      tienePDF(item) && !estaImpreso(item)
    ) || []
  })

  // ==================== Utilidades ====================
  
  /**
   * Muestra un mensaje en el snackbar
   */
  const mostrarSnackbar = (mensaje, color = 'info') => {
    snackbar.value.mensaje = mensaje
    snackbar.value.color = color
    snackbar.value.mostrar = true
  }

  // ==================== Return ====================
  
  return {
    // Estado
    descargandoPDF,
    imprimiendoTodos,
    pdfsImpresos,
    snackbar,
    
    // Validaciones
    tienePDF,
    obtenerURLPDF,
    
    // Estado de impresión
    estaImpreso,
    marcarComoImpreso,
    desmarcarComoImpreso,
    toggleImpreso,
    
    // Persistencia
    cargarPDFsImpresos,
    guardarPDFsImpresos,
    resetearTodosLosImpresos,
    
    // Descarga
    descargarPDF,
    imprimirTodosLosPDF,
    
    // Computed
    hayPDFs,
    pdfsNoImpresos,
    
    // Utilidades
    mostrarSnackbar
  }
}
