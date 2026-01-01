<template>
  <div class="kpi-section">
    <!-- Header con período -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-calendar-range</v-icon>
          <h3 class="text-h6 font-weight-bold text-primary">
            {{ rangoFechasTexto }}
          </h3>
        </div>
        <v-divider class="mt-2" />
      </v-col>
    </v-row>

    <!-- KPIs Grid con animación escalonada -->
    <v-row class="kpi-grid-row">
      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Ventas Totales"
          :value="kpis.ventasTotales"
          icon="mdi-cash-multiple"
          variant="success"
          format-as-currency
          :subtitle="calcularCambio(kpis.ventasTotales, kpis.ventasAnteriores)"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Total Órdenes"
          :value="kpis.totalOrdenes"
          icon="mdi-receipt-text"
          variant="primary"
          :subtitle="`${kpis.ordenesCompletadas || 0} completadas`"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Ticket Promedio"
          :value="kpis.ticketPromedio"
          icon="mdi-calculator"
          variant="info"
          format-as-currency
          subtitle="Por orden"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Total Unidades"
          :value="kpis.totalUnidades || 0"
          icon="mdi-package-variant"
          variant="purple"
          :subtitle="`${kpis.productosUnicos || 0} productos diferentes`"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DashboardKPICard from './DashboardKPICard.vue'

/**
 * Sección de KPIs para Dashboard
 * Muestra métricas clave del período seleccionado
 */

const props = defineProps({
  kpis: {
    type: Object,
    required: true,
    default: () => ({
      ventasTotales: 0,
      totalOrdenes: 0,
      ticketPromedio: 0,
      totalUnidades: 0,
      ventasAnteriores: 0,
      ordenesCompletadas: 0,
      productosUnicos: 0
    })
  },
  rangoFechasTexto: {
    type: String,
    required: true
  }
})

/**
 * Calcular cambio porcentual vs período anterior
 */
const calcularCambio = (actual, anterior) => {
  if (!anterior || anterior === 0) return ''
  
  const cambio = ((actual - anterior) / anterior) * 100
  const signo = cambio > 0 ? '↑' : cambio < 0 ? '↓' : '→'
  const color = cambio > 0 ? 'success' : cambio < 0 ? 'error' : 'grey'
  
  return `${signo} ${Math.abs(cambio).toFixed(1)}% vs anterior`
}
</script>

<style scoped>
.kpi-section {
  animation: fadeIn var(--transition-smooth) ease-out;
}

.kpi-grid-row {
  gap: var(--spacing-md);
}

/* Animación escalonada para KPIs */
.kpi-grid-row > .v-col:nth-child(1) {
  animation: fadeInUp var(--transition-smooth) ease-out;
  animation-delay: 0s;
}

.kpi-grid-row > .v-col:nth-child(2) {
  animation: fadeInUp var(--transition-smooth) ease-out;
  animation-delay: 0.1s;
}

.kpi-grid-row > .v-col:nth-child(3) {
  animation: fadeInUp var(--transition-smooth) ease-out;
  animation-delay: 0.2s;
}

.kpi-grid-row > .v-col:nth-child(4) {
  animation: fadeInUp var(--transition-smooth) ease-out;
  animation-delay: 0.3s;
}
</style>
