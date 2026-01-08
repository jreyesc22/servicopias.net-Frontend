<template>
  <v-dialog 
    :model-value="dialog" 
    @update:model-value="$emit('update:dialog', $event)" 
    max-width="800px" 
    persistent 
    scrollable
  >
    <v-card>
      <!-- Header -->
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
        
        <!-- Usar el sub-componente OrdenItemRow para cada item -->
        <OrdenItemRow
          v-for="(item, index) in orden?.items"
          :key="index"
          :item="item"
          :tiene-p-d-f="tienePDF(item)"
          :esta-impreso="estaImpreso(item)"
          :descargando="descargandoPDF[item.id]"
          @descargar="descargarPDF(item)"
          @toggle-impreso="toggleImpreso(item)"
        />
      </v-card-text>

      <!-- Actions -->
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

<script setup>
import { computed, toRef, watch, onMounted } from 'vue'
import { usePdfGestion } from '@/composables/usePdfGestion'
import OrdenItemRow from './OrdenItemRow.vue'

// ==================== Props & Emits ====================

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false
  },
  orden: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:dialog', 'pdf-descargado'])

// ==================== Composable ====================

const ordenRef = toRef(props, 'orden')
const {
  // Estado
  descargandoPDF,
  imprimiendoTodos,
  pdfsImpresos,
  snackbar,
  
  // Validaciones
  tienePDF,
  
  // Estado de impresión
  estaImpreso,
  toggleImpreso,
  
  // Persistencia
  cargarPDFsImpresos,
  resetearTodosLosImpresos,
  
  // Descarga
  descargarPDF: descargarPDFComposable,
  imprimirTodosLosPDF,
  
  // Computed
  hayPDFs,
  pdfsNoImpresos
} = usePdfGestion(ordenRef)

// ==================== Computed ====================

const estadoColor = computed(() => {
  switch ((props.orden?.estado || '').toLowerCase()) {
    case 'cancelado': return 'red'
    case 'entregado': return 'green'
    case 'en proceso': return 'orange'
    case 'pendiente': return 'grey'
    case 'finalizado': return 'teal'
    case 'en produccion': return 'blue'
    default: return 'purple'
  }
})

// ==================== Métodos ====================

const descargarPDF = async (item) => {
  const resultado = await descargarPDFComposable(item)
  if (resultado) {
    emit('pdf-descargado', resultado)
  }
}

const cerrar = () => {
  emit('update:dialog', false)
}

// ==================== Lifecycle ====================

onMounted(() => {
  cargarPDFsImpresos()
})

watch(() => props.dialog, (newVal) => {
  if (newVal) {
    cargarPDFsImpresos()
  }
})
</script>

<style scoped>
.text-subtitle2 {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>