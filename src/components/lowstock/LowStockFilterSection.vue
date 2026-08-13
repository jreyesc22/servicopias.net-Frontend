<template>
  <!-- Sección de filtros — usa clases globales filter-section, filter-group, filter-label del design-system -->
  <div class="filter-section">
    <v-row dense>

      <!-- Filtro por Estado -->
      <v-col cols="12" md="4">
        <div class="filter-group">
          <h4 class="filter-label mb-2">
            <v-icon size="14" class="mr-1">mdi-circle-slice-8</v-icon>
            Por Estado
          </h4>
          <v-checkbox
            :model-value="filtros.agotado"
            label="Agotados (Stock = 0)"
            density="compact"
            hide-details
            class="mb-1"
            color="error"
            @update:model-value="$emit('update:agotado', $event)"
          />
          <v-checkbox
            :model-value="filtros.critico"
            label="Críticos (Stock ≤ Umbral)"
            density="compact"
            hide-details
            color="warning"
            @update:model-value="$emit('update:critico', $event)"
          />
        </div>
      </v-col>

      <!-- Filtro por Tipo -->
      <v-col cols="12" md="4">
        <div class="filter-group">
          <h4 class="filter-label mb-2">
            <v-icon size="14" class="mr-1">mdi-tag-multiple</v-icon>
            Por Tipo
          </h4>
          <v-checkbox
            :model-value="filtros.tipo.producto"
            label="Productos"
            density="compact"
            hide-details
            class="mb-1"
            color="primary"
            @update:model-value="$emit('update:tipo', { tipo: 'producto', valor: $event })"
          />
          <v-checkbox
            :model-value="filtros.tipo.insumo"
            label="Insumos"
            density="compact"
            hide-details
            class="mb-1"
            color="secondary"
            @update:model-value="$emit('update:tipo', { tipo: 'insumo', valor: $event })"
          />
          <v-checkbox
            :model-value="filtros.tipo.servicio"
            label="Servicios c/ insumos"
            density="compact"
            hide-details
            color="success"
            @update:model-value="$emit('update:tipo', { tipo: 'servicio', valor: $event })"
          />
        </div>
      </v-col>

      <!-- Resultados y acciones -->
      <v-col cols="12" md="4">
        <div class="filter-group d-flex flex-column justify-space-between h-100">
          <h4 class="filter-label mb-3">
            <v-icon size="14" class="mr-1">mdi-filter-check</v-icon>
            Resultados
          </h4>
          <!-- result-badge: clase global del design-system -->
          <div class="result-badge mb-3">
            <span class="result-badge__count">{{ resultCount }}</span>
            <span class="result-badge__label">item(s) coinciden</span>
          </div>
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-filter-remove"
            class="btn-smooth"
            @click="$emit('reset-filtros')"
          >
            Limpiar Filtros
          </v-btn>
        </div>
      </v-col>

    </v-row>
  </div>
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

<!-- Sin <style scoped>: todo el diseño viene del design-system global -->
