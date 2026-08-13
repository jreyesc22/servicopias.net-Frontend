<template>
  <v-card class="lowstock-card animate-fade-in-up" elevation="0">

    <!-- HEADER — usa clases globales panel-header del design-system -->
    <div class="panel-header panel-header--warning">
      <div class="d-flex align-center ga-3">
        <div class="panel-header__icon">
          <v-icon size="22" color="white">mdi-alert-circle</v-icon>
        </div>
        <div>
          <h2 class="panel-header__title">Productos con Stock Bajo</h2>
          <p class="panel-header__subtitle">
            {{ itemsFiltrados.length }} item(s) encontrado(s)
          </p>
        </div>
      </div>

      <!-- Control de umbral -->
      <div class="threshold-control">
        <v-text-field
          v-model.number="threshold"
          type="number"
          label="Umbral de stock"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
          class="threshold-input"
          @change="cargarItems"
        >
          <template #prepend-inner>
            <v-icon size="16" color="white">mdi-tune</v-icon>
          </template>
        </v-text-field>
      </div>
    </div>

    <!-- Banner de error -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mx-4 mt-3"
      density="compact"
      closable
    >
      {{ error }}
    </v-alert>

    <!-- FILTROS -->
    <LowStockFilterSection
      :filtros="filtros"
      :result-count="itemsFiltrados.length"
      @update:agotado="filtros.agotado = $event"
      @update:critico="filtros.critico = $event"
      @update:tipo="handleUpdateTipo"
      @reset-filtros="resetFiltros"
    />

    <!-- TABLA -->
    <LowStockTable
      :items="itemsFiltrados"
      :threshold="threshold"
      :loading="loading"
      :empty-message="
        items.length === 0
          ? 'No se encontraron items con stock bajo'
          : 'No hay items que coincidan con los filtros seleccionados'
      "
    />

    <!-- ACCIONES -->
    <LowStockActionsBar
      :loading="loading"
      @reload="cargarItems"
    />
  </v-card>
</template>

<script setup>
import { onMounted } from 'vue'
import LowStockFilterSection from '../lowstock/LowStockFilterSection.vue'
import LowStockActionsBar from '../lowstock/LowStockActionsBar.vue'
import LowStockTable from '../lowstock/LowStockTable.vue'
import { useLowStockData } from '@/hooks/useLowStockData'
import { useLowStockFilters } from '@/hooks/useLowStockFilters'

const {
  items,
  threshold,
  loading,
  error,
  cargarItems
} = useLowStockData()

const { filtros, itemsFiltrados, resetFiltros } = useLowStockFilters(items, threshold)

const handleUpdateTipo = ({ tipo, valor }) => {
  filtros.tipo[tipo] = valor
}

onMounted(() => {
  cargarItems()
})
</script>

<style scoped>
/* Solo estilos que son ÚNICOS de este componente */
.lowstock-card {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  overflow: hidden;
  border: 1px solid rgba(251, 140, 0, 0.15);
}

/* Overrides Vuetify sobre fondo degradado — no se pueden mover a global */
.threshold-control {
  min-width: 160px;
}

.threshold-input :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.6) !important;
}

.threshold-input :deep(.v-label),
.threshold-input :deep(.v-field__input) {
  color: white !important;
}

.threshold-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}
</style>
