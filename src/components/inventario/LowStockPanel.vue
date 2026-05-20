<template>
  <v-card class="lowstock-card" elevation="2">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon class="mr-3" color="warning">mdi-alert-circle</v-icon>
        <span>Productos con Stock Bajo</span>
      </div>
      <v-text-field
        v-model.number="threshold"
        type="number"
        label="Umbral"
        density="compact"
        style="max-width:120px"
        @change="handleThresholdChange"
      />
    </v-card-title>

    <!-- COMPONENTE DE FILTROS -->
    <LowStockFilterSection 
      :filtros="filtros"
      :result-count="itemsFiltrados.length"
      @update:agotado="filtros.agotado = $event"
      @update:critico="filtros.critico = $event"
      @update:tipo="handleUpdateTipo"
      @reset-filtros="handleResetFiltros"
    />

    <!-- COMPONENTE DE TABLA -->
    <LowStockTable 
      :items="itemsFiltrados"
      :threshold="threshold"
      :empty-message="items.length === 0 ? 'No se encontraron items con stock bajo' : 'No hay items que coincidan con los filtros seleccionados'"
    />

    <!-- COMPONENTE DE ACCIONES -->
    <LowStockActionsBar 
      @reload="handleThresholdChange"
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

// Composables
const {
  items,
  threshold,
  cargarItems
} = useLowStockData()

const { filtros, itemsFiltrados, resetFiltros } = useLowStockFilters(items, threshold)

// Handlers
const handleThresholdChange = () => {
  cargarItems()
}

const handleUpdateTipo = ({ tipo, valor }) => {
  filtros.tipo[tipo] = valor
}

const handleResetFiltros = () => {
  resetFiltros()
}

// Lifecycle
onMounted(() => {
  cargarItems()
})
</script>

<style scoped>
.lowstock-card {
  border-radius: var(--border-radius-lg, 16px);
  box-shadow: var(--shadow-sm);
}

.d-flex {
  display: flex;
  align-items: center;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

.mr-3 {
  margin-right: var(--spacing-md, 12px);
}
</style>
