<template>
  <v-card-text class="pa-0">
    <!-- Barra de progreso durante carga -->
    <v-progress-linear
      :active="loading"
      indeterminate
      color="warning"
      height="3"
    />

    <v-data-table-virtual
      :headers="headers"
      :items="items"
      density="compact"
      hover
      :items-per-page="10"
      class="lowstock-table"
    >
      <!-- Celda de Stock con color según estado -->
      <template #item.stock="{ item }">
        <v-chip
          :color="item.stock === 0 ? 'error' : item.stock <= threshold ? 'warning' : 'success'"
          variant="flat"
          label
          size="small"
        >
          <strong>{{ item.stock }}</strong>
        </v-chip>
      </template>

      <!-- Celda de Tipo -->
      <template #item.tipo="{ item }">
        <v-chip
          :color="getTipoColor(item.tipo)"
          variant="outlined"
          size="small"
          label
        >
          {{ item.tipo }}
        </v-chip>
      </template>

      <!-- Celda de Insumos con tooltip -->
      <template #item.insumos="{ item }">
        <div v-if="item.insumos && item.insumos.length > 0">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-chip v-bind="props" color="info" variant="flat" size="small">
                {{ item.insumos.length }} insumo(s)
              </v-chip>
            </template>
            <!-- tooltip-content y tooltip-item: clases globales del design-system -->
            <div class="tooltip-content">
              <div
                v-for="ins in item.insumos"
                :key="ins.id"
                class="tooltip-item"
              >
                <strong>{{ ins.nombre }}</strong>
                <span class="tooltip-item__secondary">
                  (cant: {{ ins.ItemComponentes?.cantidad || '-' }})
                </span>
              </div>
            </div>
          </v-tooltip>
        </div>
        <span v-else class="text-caption text-disabled">—</span>
      </template>

      <!-- Estado vacío — usa clases globales empty-state del design-system -->
      <template #no-data>
        <div class="empty-state">
          <v-icon size="52" class="empty-state__icon">mdi-database-search</v-icon>
          <p class="empty-state__title">Sin resultados</p>
          <p class="empty-state__message">{{ emptyMessage }}</p>
        </div>
      </template>
    </v-data-table-virtual>
  </v-card-text>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  },
  threshold: {
    type: Number,
    default: 5
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No se encontraron items'
  }
})

const headers = [
  { title: 'ID', key: 'id', width: '60px' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Categoría', key: 'categoria.nombre' },
  { title: 'Tipo', key: 'tipo', width: '100px' },
  { title: 'Stock', key: 'stock', width: '100px', align: 'center' },
  { title: 'Stock Mínimo', key: 'stock_minimo', width: '120px', align: 'center' },
  { title: 'Insumos', key: 'insumos', width: '140px' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Precio', key: 'precio', width: '100px', align: 'right' }
]

const getTipoColor = (tipo) => {
  const colors = {
    producto: 'primary',
    insumo: 'secondary',
    servicio: 'success'
  }
  return colors[tipo] || 'grey'
}
</script>

<style scoped>
/* Solo el border-radius de la tabla es específico de este componente */
.lowstock-table {
  border-radius: 0;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(245, 124, 0, 0.04);
}
</style>
