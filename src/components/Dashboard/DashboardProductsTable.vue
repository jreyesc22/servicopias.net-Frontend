<template>
  <v-card elevation="4">
    <v-card-title class="bg-success text-white">
      <v-icon left>mdi-trophy</v-icon>
      Top {{ limit }} Productos Más Vendidos
    </v-card-title>
    <v-card-text class="pa-0">
      <v-data-table
        :headers="headers"
        :items="productos"
        :loading="loading"
        :items-per-page="limit"
        density="comfortable"
        class="elevation-1"
      >
        <template v-slot:item.index="{ index }">
          <v-chip 
            :color="getMedalColor(index)"
            size="small"
            label
          >
            #{{ index + 1 }}
          </v-chip>
        </template>
        
        <template v-slot:item.producto_nombre="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <v-img 
                v-if="item.imagen_url" 
                :src="resolveMediaUrl(item.imagen_url)"
                cover
              />
              <v-icon v-else>mdi-package</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.producto_nombre }}</div>
              <div class="text-caption text-grey">{{ item.categoria_nombre }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.total_vendido="{ item }">
          <v-chip color="blue" variant="outlined">
            {{ item.total_vendido }} unidades
          </v-chip>
        </template>

        <template v-slot:item.ingresos_generados="{ item }">
          <span class="font-weight-bold text-success">
            Q {{ formatearMoneda(item.ingresos_generados) }}
          </span>
        </template>

        <template v-slot:item.ordenes_count="{ item }">
          {{ item.ordenes_count }} órdenes
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import { resolveMediaUrl } from '@/utils/mediaUrl'

export default {
  name: 'DashboardProductsTable',

  props: {
    productos: {
      type: Array,
      required: true
    },
    limit: {
      type: Number,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      headers: [
        { title: 'Pos.', key: 'index', sortable: false, width: '80px' },
        { title: 'Producto', key: 'producto_nombre', sortable: true },
        { title: 'Unidades Vendidas', key: 'total_vendido', sortable: true },
        { title: 'Ingresos', key: 'ingresos_generados', sortable: true },
        { title: 'Órdenes', key: 'ordenes_count', sortable: true }
      ]
    }
  },

  methods: {
    resolveMediaUrl,
    formatearMoneda(valor) {
      if (!valor) return '0.00'
      return parseFloat(valor).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    getMedalColor(index) {
      if (index === 0) return 'yellow-darken-2'
      if (index === 1) return 'grey-lighten-1'
      if (index === 2) return 'orange-darken-3'
      return 'grey-lighten-2'
    }
  }
}
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-data-table >>> .v-data-table__wrapper {
  border-radius: 8px;
}
</style>
