<template>
  <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" max-width="800px" persistent scrollable>
    <v-card>
      <v-card-title class="text-h6">
        Items de la Orden #{{ orden?.id }}
        <v-spacer></v-spacer>
        <v-chip :color="estadoColor" text-color="white" small>
          {{ orden?.estado }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <!-- Información básica de la orden -->
        <v-row class="mb-4">
          <v-col cols="6">
            <div class="text-subtitle2 text-grey-darken-1">Cliente:</div>
            <div class="text-body-1">{{ orden?.cliente_nombre || 'No especificado' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-subtitle2 text-grey-darken-1">Fecha:</div>
            <div class="text-body-1">{{ orden?.fecha ? new Date(orden.fecha).toLocaleDateString() : '-' }}</div>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <!-- Lista de items -->
        <div class="text-h6 mb-3">Items de la orden:</div>
        
        <v-card v-for="(item, index) in orden?.items" :key="index" class="mb-3" outlined>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="6">
                <div class="text-subtitle1 font-weight-bold">
                  {{ item.item?.nombre || 'Producto sin nombre' }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  ID: {{ item.item?.id || '-' }}
                </div>
              </v-col>
              
              <v-col cols="6" md="3">
                <div class="text-subtitle2 text-grey-darken-1">Cantidad:</div>
                <div class="text-body-1">{{ item.cantidad }}</div>
              </v-col>
              
              <v-col cols="6" md="3" class="text-center">
                <!-- Verificar si tiene archivo PDF -->
                <div v-if="tienePDF(item)" class="d-flex flex-column align-center">
                  <v-icon 
                    :color="estaImpreso(item) ? 'green' : 'red'" 
                    size="large" 
                    class="mb-1"
                  >
                    {{ estaImpreso(item) ? 'mdi-file-pdf-box-outline' : 'mdi-file-pdf-box' }}
                  </v-icon>
                  <v-btn 
                    size="small" 
                    :color="estaImpreso(item) ? 'green' : 'red'"
                    :variant="estaImpreso(item) ? 'flat' : 'outlined'"
                    @click="descargarPDF(item)"
                    :loading="descargandoPDF[item.id]"
                  >
                    <v-icon start>
                      {{ estaImpreso(item) ? 'mdi-check' : 'mdi-download' }}
                    </v-icon>
                    {{ estaImpreso(item) ? 'Impreso' : 'PDF' }}
                  </v-btn>
                  <!-- Botón para marcar/desmarcar como impreso -->
                  <v-btn
                    size="x-small"
                    :color="estaImpreso(item) ? 'orange' : 'success'"
                    variant="text"
                    @click="toggleImpreso(item)"
                    class="mt-1"
                  >
                    <v-icon size="16">
                      {{ estaImpreso(item) ? 'mdi-undo' : 'mdi-check-circle' }}
                    </v-icon>
                  </v-btn>
                </div>
                <div v-else class="d-flex flex-column align-center">
                  <v-icon color="grey" size="large" class="mb-1">mdi-file-question</v-icon>
                  <v-chip size="small" color="grey" variant="outlined">
                    Sin PDF
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <!-- Información adicional si existe -->
            <v-row v-if="item.descripcion || item.observaciones" class="mt-2">
              <v-col cols="12">
                <v-divider class="mb-2"></v-divider>
                <div v-if="item.descripcion" class="mb-1">
                  <span class="text-subtitle2 text-grey-darken-1">Descripción:</span>
                  {{ item.descripcion }}
                </div>
                <div v-if="item.observaciones">
                  <span class="text-subtitle2 text-grey-darken-1">Observaciones:</span>
                  {{ item.observaciones }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn 
          color="primary" 
          @click="imprimirTodosLosPDF"
          :disabled="!hayPDFs"
          :loading="imprimiendoTodos"
          prepend-icon="mdi-printer-multiple"
        >
          Imprimir todos los PDFs ({{ pdfsNoImpresos.length }})
        </v-btn>
        <v-btn 
          color="warning" 
          @click="resetearTodosLosImpresos"
          :disabled="pdfsImpresos.size === 0"
          prepend-icon="mdi-refresh"
          variant="outlined"
        >
          Resetear estado
        </v-btn>
        <v-btn color="grey" @click="cerrar">
          <v-icon start>mdi-close</v-icon> Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.mostrar"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.mensaje }}
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.mostrar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script>
import { resolveMediaUrl } from '@/utils/mediaUrl'

export default {
  name: 'OrdenItemsModal',
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    orden: {
      type: Object,
      default: null
    }
  },
  emits: ['update:dialog', 'pdf-descargado'],
  data() {
    return {
      descargandoPDF: {}, // Track loading state per item
      imprimiendoTodos: false,
      pdfsImpresos: new Set(), // Track de PDFs impresos localmente
      snackbar: {
        mostrar: false,
        mensaje: '',
        color: 'info'
      }
    }
  },
  mounted() {
    this.cargarPDFsImpresos()
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.cargarPDFsImpresos()
      }
    }
  },
  computed: {
    estadoColor() {
      switch ((this.orden?.estado || '').toLowerCase()) {
        case 'cancelado': return 'red'
        case 'entregado': return 'green'
        case 'en proceso': return 'orange'
        case 'pendiente': return 'grey'
        case 'finalizado': return 'teal'
        case 'en produccion': return 'blue'
        default: return 'purple'
      }
    },
    hayPDFs() {
      return this.orden?.items?.some(item => this.tienePDF(item)) || false
    },
    pdfsNoImpresos() {
      return this.orden?.items?.filter(item => 
        this.tienePDF(item) && !this.estaImpreso(item)
      ) || []
    }
  },
  methods: {
    tienePDF(item) {
      // Ajustar según tu estructura de base de datos
      // Posibles campos donde podrías almacenar info del PDF:
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
             // También podríamos verificar por tipo de producto
             (item.item && item.item.categoria && 
              ['diseño', 'impresion', 'grafico'].includes(item.item.categoria.toLowerCase()))
    },

    obtenerURLPDF(item) {
      // Construir la URL del PDF según tu estructura
      if (item.archivo_pdf) return resolveMediaUrl(item.archivo_pdf)
      if (item.pdf_url) return resolveMediaUrl(item.pdf_url)
      if (item.ruta_pdf) return resolveMediaUrl(item.ruta_pdf)
      if (item.item && item.item.archivo_pdf) return resolveMediaUrl(item.item.archivo_pdf)
      if (item.item && item.item.pdf_url) return resolveMediaUrl(item.item.pdf_url)
      
      // URL por defecto basada en tu API
      return `${process.env.VUE_APP_API_URL}/files/items/${item.id}/archivo.pdf`
    },

    async descargarPDF(item) {
      if (!this.tienePDF(item)) {
        this.mostrarSnackbar('Este item no tiene PDF disponible', 'warning')
        return
      }

      this.descargandoPDF[item.id] = true

      try {
        const pdfUrl = this.obtenerURLPDF(item)
        
        // Verificar si el archivo existe antes de intentar descargarlo
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

        this.mostrarSnackbar('PDF descargado exitosamente', 'success')
        this.$emit('pdf-descargado', { success: true, filename: link.download })
        
        // Marcar como impreso automáticamente al descargar
        this.marcarComoImpreso(item)

      } catch (error) {
        console.error('Error al descargar PDF:', error)
        this.mostrarSnackbar('Error al descargar el PDF: ' + error.message, 'error')
        this.$emit('pdf-descargado', { success: false, error: error.message })
      } finally {
        this.descargandoPDF[item.id] = false
      }
    },

    async imprimirTodosLosPDF() {
      if (!this.hayPDFs) return

      this.imprimiendoTodos = true

      try {
        const itemsConPDF = this.pdfsNoImpresos
        
        if (itemsConPDF.length === 0) {
          this.mostrarSnackbar('Todos los PDFs ya han sido impresos', 'info')
          return
        }
        
        for (const item of itemsConPDF) {
          await this.descargarPDF(item)
          // Pequeña pausa entre descargas
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        this.mostrarSnackbar(`Se descargaron ${itemsConPDF.length} archivos PDF`, 'success')

      } catch (error) {
        console.error('Error al imprimir todos los PDFs:', error)
        this.mostrarSnackbar('Error al descargar algunos PDFs', 'error')
      } finally {
        this.imprimiendoTodos = false
      }
    },

    // Nuevos métodos para manejar estado de impresión
    generarIdItem(item) {
      // Generar un ID único para el item basado en orden + item
      return `orden_${this.orden?.id}_item_${item.id}`
    },

    estaImpreso(item) {
      const itemId = this.generarIdItem(item)
      return this.pdfsImpresos.has(itemId)
    },

    marcarComoImpreso(item) {
      const itemId = this.generarIdItem(item)
      this.pdfsImpresos.add(itemId)
      this.guardarPDFsImpresos()
    },

    desmarcarComoImpreso(item) {
      const itemId = this.generarIdItem(item)
      this.pdfsImpresos.delete(itemId)
      this.guardarPDFsImpresos()
    },

    toggleImpreso(item) {
      if (this.estaImpreso(item)) {
        this.desmarcarComoImpreso(item)
        this.mostrarSnackbar('Marcado como no impreso', 'warning')
      } else {
        this.marcarComoImpreso(item)
        this.mostrarSnackbar('Marcado como impreso', 'success')
      }
    },

    cargarPDFsImpresos() {
      try {
        const guardados = localStorage.getItem('pdfs_impresos')
        if (guardados) {
          this.pdfsImpresos = new Set(JSON.parse(guardados))
        }
      } catch (error) {
        console.error('Error al cargar PDFs impresos:', error)
        this.pdfsImpresos = new Set()
      }
    },

    guardarPDFsImpresos() {
      try {
        localStorage.setItem('pdfs_impresos', JSON.stringify([...this.pdfsImpresos]))
      } catch (error) {
        console.error('Error al guardar PDFs impresos:', error)
      }
    },

    resetearTodosLosImpresos() {
      if (confirm('¿Estás seguro de que quieres resetear el estado de todos los PDFs impresos?')) {
        this.pdfsImpresos.clear()
        this.guardarPDFsImpresos()
        this.mostrarSnackbar('Estado de impresión reseteado', 'info')
      }
    },

    cerrar() {
      this.$emit('update:dialog', false)
    },

    mostrarSnackbar(mensaje, color = 'info') {
      this.snackbar.mensaje = mensaje
      this.snackbar.color = color
      this.snackbar.mostrar = true
    }
  }
}
</script>

<style scoped>
.text-subtitle2 {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>