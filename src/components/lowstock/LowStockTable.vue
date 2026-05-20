<template>
  <v-card-text>
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

      <!-- Celda de Tipo con badge -->
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
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-chip 
                v-bind="props" 
                color="info" 
                variant="flat"
                size="small"
              >
                {{ item.insumos.length }} insumo(s)
              </v-chip>
            </template>
            <div style="max-width: 300px">
              <div class="text-white">
                <div v-for="ins in item.insumos" :key="ins.id" style="font-size: 12px; margin-bottom: 4px">
                  <strong>{{ ins.nombre }}</strong> (cant: {{ ins.ItemComponentes?.cantidad || '-' }})
                </div>
              </div>
            </div>
          </v-tooltip>
        </div>
        <div v-else class="text-caption text-grey">
          -
        </div>
      </template>

      <!-- Estado vacío -->
      <template #no-data>
        <div class="pa-8 text-center">
          <v-icon size="48" class="mb-4 text-grey">mdi-database-search</v-icon>
          <p class="text-body1 text-grey-darken-1">{{ emptyMessage }}</p>
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
.lowstock-table {
  border-radius: var(--border-radius, 12px);
}

/* Row styling por estado */
:deep(tbody tr) {
  transition: background-color var(--transition-base, 0.3s);
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04);
}

.text-grey {
  color: rgba(0, 0, 0, 0.54);
}

.text-grey-darken-1 {
  color: rgba(0, 0, 0, 0.72);
}

.text-white {
  color: white;
}

.text-caption {
  font-size: 0.75rem;
}

.pa-8 {
  padding: var(--spacing-2xl, 32px);
}

.mb-4 {
  margin-bottom: var(--spacing-lg, 24px);
}

.pa-4 {
  padding: var(--spacing-lg, 24px);
}
</style>
