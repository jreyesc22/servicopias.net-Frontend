<template>
  <v-card-subtitle class="bg-surface-elevated pa-4">
    <v-row dense>
      <!-- Filtro por Estado -->
      <v-col cols="12" md="4">
        <div class="filter-group">
          <h4 class="filter-label mb-2">Por Estado</h4>
          <div class="filter-options">
            <v-checkbox 
              :model-value="filtros.agotado" 
              @update:model-value="$emit('update:agotado', $event)" 
              label="Agotados (Stock = 0)" 
              dense 
              hide-details 
              class="mb-2" 
            />
            <v-checkbox 
              :model-value="filtros.critico" 
              @update:model-value="$emit('update:critico', $event)" 
              label="Críticos (Stock ≤ Umbral)" 
              dense 
              hide-details 
            />
          </div>
        </div>
      </v-col>

      <!-- Filtro por Tipo -->
      <v-col cols="12" md="4">
        <div class="filter-group">
          <h4 class="filter-label mb-2">Por Tipo</h4>
          <div class="filter-options">
            <v-checkbox 
              :model-value="filtros.tipo.producto" 
              @update:model-value="$emit('update:tipo', { tipo: 'producto', valor: $event })" 
              label="Productos" 
              dense 
              hide-details 
              class="mb-2" 
            />
            <v-checkbox 
              :model-value="filtros.tipo.insumo" 
              @update:model-value="$emit('update:tipo', { tipo: 'insumo', valor: $event })" 
              label="Insumos" 
              dense 
              hide-details 
              class="mb-2" 
            />
            <v-checkbox 
              :model-value="filtros.tipo.servicio" 
              @update:model-value="$emit('update:tipo', { tipo: 'servicio', valor: $event })" 
              label="Servicios c/ insumos" 
              dense 
              hide-details 
            />
          </div>
        </div>
      </v-col>

      <!-- Botones de acción -->
      <v-col cols="12" md="4">
        <div class="filter-group">
          <h4 class="filter-label mb-2">Acciones</h4>
          <div class="d-flex gap-2">
            <v-btn color="primary" size="small" @click="$emit('reset-filtros')">Limpiar Filtros</v-btn>
            <v-chip color="info" label>{{ resultCount }} resultado(s)</v-chip>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-card-subtitle>
</template>

<script setup>
defineProps({
  filtros: {
    type: Object,
    required: true
  },
  resultCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['update:agotado', 'update:critico', 'update:tipo', 'reset-filtros'])
</script>

<style scoped>
.filter-group {
  padding: var(--spacing-sm, 8px);
  border-radius: var(--border-radius, 12px);
  background: var(--surface-color);
}

.filter-label {
  font-size: var(--text-sm, 0.875rem);
  font-weight: 600;
  color: var(--primary-color, #1976D2);
  margin: 0;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
}

.gap-2 {
  gap: var(--spacing-sm, 8px);
  display: flex;
  flex-wrap: wrap;
}

.bg-surface-elevated {
  background: var(--surface-elevated, #F8FAFC) !important;
  border-radius: var(--border-radius, 12px);
}

.pa-4 {
  padding: var(--spacing-lg, 24px);
}

.mb-2 {
  margin-bottom: var(--spacing-sm, 8px);
}
</style>
