<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon class="mr-3" color="primary">mdi-shape</v-icon>
        <span>Ingresos por Categoría</span>
      </div>
      <div class="d-flex" style="gap:8px;">
        <v-btn small variant="tonal" color="primary" @click="exportCsv" :disabled="!items || items.length===0">
          <v-icon left>mdi-download</v-icon>
          Exportar CSV
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-row align="center" class="mb-4">
        <v-col cols="12" md="6">
          <div class="text-subtitle-1">Periodo: {{ periodoLabel }}</div>
        </v-col>
        <v-col cols="12" md="6" class="text-right">
          <div class="text-subtitle-1">Total Ingresos: <strong>Q. {{ formatMoney(totalIngresos) }}</strong></div>
        </v-col>
      </v-row>

      <v-data-table
        :items="items"
        :loading="loading"
        :headers="headers"
        item-key="categoria_id"
        class="elevation-1"
        dense
        disable-pagination
        hide-default-footer
      >
        <template #item.categoria_nombre="{ item }">
          <div>
            <v-chip small color="grey lighten-3" text-color="black">{{ item.categoria_nombre || 'Sin categoría' }}</v-chip>
          </div>
        </template>

        <template #item.ingresos_totales="{ item }">
          <div class="text-right">Q. {{ formatMoney(item.ingresos_totales || item.total || 0) }}</div>
        </template>

        <template #no-data>
          <v-alert type="info" border="left">No hay datos para el periodo seleccionado.</v-alert>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  periodoLabel: { type: String, default: '' }
})

const headers = [
  { title: 'Categoría', key: 'categoria_nombre', value: 'categoria_nombre', sortable: false },
  { title: 'Ingresos', key: 'ingresos_totales', value: 'ingresos_totales', sortable: true, align: 'end' }
]

const totalIngresos = computed(() => {
  return (props.items || []).reduce((sum, it) => sum + parseFloat(it.ingresos_totales || it.total || 0), 0)
})

function formatMoney(v) {
  const n = Number(v || 0)
  return n.toFixed(2)
}

function exportCsv() {
  const rows = (props.items || []).map(i => ({
    categoria_id: i.categoria_id || '',
    categoria_nombre: i.categoria_nombre || i.nombre || 'Sin categoría',
    ingresos: i.ingresos_totales || i.total || 0
  }))

  if (rows.length === 0) return

  const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ingresos_por_categoria_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
