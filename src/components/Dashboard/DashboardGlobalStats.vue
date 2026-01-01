<template>
  <v-row>
    <v-col cols="12">
      <h3 class="text-h6 font-weight-bold mb-3">
        Estadísticas Históricas (Todos los tiempos)
      </h3>
    </v-col>
    
    <v-col 
      v-for="(kpi, index) in kpis" 
      :key="index"
      cols="12" 
      md="4"
    >
      <DashboardKPICard
        :variant="kpi.variant"
        :icon="kpi.icon"
        :title="kpi.title"
        :value="kpi.value"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import DashboardKPICard from './DashboardKPICard.vue'

const props = defineProps({
  globalStats: {
    type: Object,
    required: true
  }
})

const formatearMoneda = (valor) => {
  if (!valor) return '0.00'
  return parseFloat(valor).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const kpis = computed(() => [
  {
    variant: 'primary',
    icon: 'mdi-currency-usd',
    title: 'Ventas Históricas',
    value: `Q ${formatearMoneda(props.globalStats.ventasTotales)}`
  },
  {
    variant: 'info',
    icon: 'mdi-shopping',
    title: 'Órdenes Totales',
    value: props.globalStats.totalOrdenes
  },
  {
    variant: 'warning',
    icon: 'mdi-chart-line-variant',
    title: 'Ticket Promedio Global',
    value: `Q ${formatearMoneda(props.globalStats.ticketPromedio)}`
  }
])
</script>


