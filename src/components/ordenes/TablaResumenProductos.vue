<template>
  <v-card elevation="2" class="mt-4">
    <!-- Header con gradiente -->
    <v-card-title 
      class="text-white d-flex align-center" 
      :style="{ background: headerConfig.gradiente }"
    >
      <v-icon class="mr-3">{{ headerConfig.icono }}</v-icon>
      <span>{{ headerConfig.titulo }}</span>
      <v-spacer />
      <v-chip color="white" variant="outlined" size="small">
        {{ headerConfig.contadorTexto }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Empty state -->
      <div v-if="items.length === 0" class="text-center py-8">
        <v-icon size="64" :color="emptyConfig.color">{{ emptyConfig.icono }}</v-icon>
        <p class="text-h6 text-grey mt-4">{{ emptyConfig.titulo }}</p>
        <p class="text-caption text-grey">{{ emptyConfig.mensaje }}</p>
      </div>

      <!-- Tabla de resumen -->
      <v-table v-else density="comfortable" class="elevation-1">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th class="text-center">Cantidad</th>
            <th class="text-right">Precio Unit.</th>
            <th class="text-right">Subtotal</th>
            <th class="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index" class="producto-row">
            <td class="text-caption text-grey">{{ index + 1 }}</td>
            <td>
              <span class="font-weight-medium">{{ item.nombre }}</span>
            </td>
            <td class="text-center">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.cantidad }}
              </v-chip>
            </td>
            <td class="text-right font-weight-medium">
              Q {{ item.precio_unitario.toFixed(2) }}
            </td>
            <td class="text-right">
              <span class="font-weight-bold text-primary">
                Q {{ item.subtotal.toFixed(2) }}
              </span>
            </td>
            <td class="text-center">
              <v-tooltip text="Quitar del carrito">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="error"
                    v-bind="props"
                    @click="$emit('quitar', index)"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Totales -->
      <v-divider v-if="items.length > 0" class="my-4" />
      
      <div v-if="items.length > 0" class="totales-container">
        <v-row dense>
          <v-col cols="6" class="text-right">
            <span class="text-body-1 text-grey">Total Items:</span>
          </v-col>
          <v-col cols="6" class="text-right">
            <span class="text-body-1 font-weight-medium">{{ totalItems }}</span>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="6" class="text-right">
            <span class="text-h6 font-weight-bold">Total:</span>
          </v-col>
          <v-col cols="6" class="text-right">
            <span class="text-h5 font-weight-bold text-primary">
              Q {{ totalGeneral.toFixed(2) }}
            </span>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useCardUI } from '../composables/useCardUI'

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['quitar'])

// Composable de UI
const {
  getHeaderConfig,
  formatearMoneda,
  getEmptyStateConfig
} = useCardUI()

// Configuración del header
const headerConfig = computed(() => getHeaderConfig({
  tipo: 'success',
  icono: 'carritoCheck',
  titulo: 'Carrito de Compra',
  contador: props.items.length,
  contadorTexto: `${props.items.length} ${props.items.length === 1 ? 'item' : 'items'}`
}))

// Config empty state
const emptyConfig = getEmptyStateConfig('carrito')

// Computadas
const totalItems = computed(() => {
  return props.items.reduce((sum, item) => sum + item.cantidad, 0)
})

const totalGeneral = computed(() => {
  return props.items.reduce((sum, item) => sum + item.subtotal, 0)
})
</script>

<style scoped>
/* Estilos de UI compartidos */
.text-white {
  color: white !important;
}

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

.producto-row:hover {
  background-color: #f9f9f9;
}

.totales-container {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

@media (max-width: 767px) {
  .v-table {
    font-size: 12px;
  }
}
</style>