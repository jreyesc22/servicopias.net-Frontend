<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title 
      class="text-white d-flex align-center" 
      :style="{ background: headerConfig.gradiente }"
    >
      <v-icon class="mr-3">{{ headerConfig.icono }}</v-icon>
      <span>{{ headerConfig.titulo }}</span>
    </v-card-title>

    <v-card-text>
      <!-- Datos del Cliente -->
      <div class="mb-3">
        <div class="text-h6 font-weight-bold text-primary mb-0">
          {{ orden.cliente_nombre || 'CONSUMIDOR FINAL' }}
        </div>
        <div class="d-flex flex-wrap gap-4 text-body-2 text-medium-emphasis">
          <div class="mr-4">
            <v-icon size="x-small" start>{{ getIcono('nit') }}</v-icon>
            <strong>NIT:</strong> {{ orden.cliente_nit || 'CF' }}
          </div>
          <div>
            <v-icon size="x-small" start>{{ getIcono('telefono') }}</v-icon>
            <strong>Tel:</strong> {{ orden.cliente_telefono || 'N/A' }}
          </div>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- Estado de la orden -->
      <div class="d-flex align-center justify-space-between py-2">
        <v-switch
          v-model="ventaDirecta"
          color="success"
          inset
          density="compact"
          hide-details
          class="ma-0"
          @change="actualizarEstadoOrden"
        >
          <template v-slot:label>
            <span class="text-body-1 font-weight-medium ml-2">
              Venta Directa (Entregar inmediatamente)
            </span>
          </template>
        </v-switch>

        <v-chip 
          :color="estadoChip.color" 
          variant="tonal"
          class="font-weight-bold"
        >
          {{ estadoChip.texto }}
        </v-chip>
      </div>
      
      <div class="text-caption text-grey mb-4 ml-10">
        {{ estadoSeleccionado === 'entregado' 
          ? 'La orden se marcará como entregada y lista para cobro.' 
          : 'La orden se enviará al taller para su producción.' 
        }}
      </div>

      <v-table density="comfortable" class="mt-4">
        <thead>
          <tr>
            <th class="text-left">Producto</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Precio Unitario</th>
            <th class="text-center">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orden.items" :key="item.itemId" class="item-row">
            <td>{{ item.nombre }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-center">{{ formatearMoneda(item.precio_unitario) }}</td>
            <td class="text-center">{{ formatearMoneda(item.subtotal) }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="text-end mt-4">
        <h4>Total: <strong>{{ formatearMoneda(total) }}</strong></h4>
      </div>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        :disabled="botonDeshabilitado"
        color="green darken-1"
        variant="elevated"
        @click="confirmarConRetraso"
      >
        Confirmar
      </v-btn>
      <v-btn color="red darken-1" variant="outlined" @click="$emit('cancelar')">
        Cancelar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCardUI } from '../composables/useCardUI'

// Props
const props = defineProps({
  orden: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['confirmar', 'cancelar'])

// Composable de UI
const {
  getHeaderConfig,
  getIcono,
  formatearMoneda,
  crearChipEstado
} = useCardUI()

// Estado local
const botonDeshabilitado = ref(false)
const ventaDirecta = ref(true) // Activo por defecto
const estadoSeleccionado = ref('entregado') // Valor por defecto

// Configuración del header
const headerConfig = computed(() => getHeaderConfig({
  tipo: 'info',
  icono: 'mdi-file-document-check',
  titulo: 'Resumen de la Orden'
}))

// Chip de estado dinámico
const estadoChip = computed(() => {
  const estado = estadoSeleccionado.value
  return crearChipEstado(estado, {
    color: estado === 'entregado' ? 'success' : 'warning',
    texto: estado === 'entregado' ? 'ENTREGADO' : 'PENDIENTE'
  })
})

// Total calculado
const total = computed(() => {
  return props.orden.items.reduce((acc, item) => acc + item.subtotal, 0)
})

// Métodos
function actualizarEstadoOrden() {
  estadoSeleccionado.value = ventaDirecta.value ? 'entregado' : 'pendiente'
}

function confirmarConRetraso() {
  if (botonDeshabilitado.value) return

  botonDeshabilitado.value = true
  
  // Emitir la orden con el estado seleccionado
  emit('confirmar', {
    ...props.orden,
    estado: estadoSeleccionado.value
  })

  setTimeout(() => {
    botonDeshabilitado.value = false
  }, 2000) // 2 segundos de espera
}
</script>

<style scoped>
/* Estilos de UI compartidos con design-system */
.text-white {
  color: var(--color-white) !important;
}

.text-primary {
  color: var(--color-primary) !important;
}

.v-table {
  font-size: var(--font-size-base);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-small);
}

.v-table thead tr th {
  background-color: var(--color-grey-50);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
}

.item-row {
  transition: background-color var(--transition-fast);
}

.item-row:hover {
  background-color: var(--color-grey-50);
}

/* Estilos específicos del componente */
.d-flex.align-center {
  align-items: center;
}

.flex-grow-1 {
  flex: 1;
}

.ml-4 {
  margin-left: var(--spacing-md);
}

.me-1 {
  margin-right: var(--spacing-xs);
}

@media (max-width: 767px) {
  .v-table {
    font-size: var(--font-size-sm);
  }
}
</style>
