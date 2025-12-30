<template>
  <v-row>
    <v-col cols="12">
      <h3 class="text-h6 font-weight-bold mb-3">
        Estadísticas Históricas (Todos los tiempos)
      </h3>
    </v-col>
    
    <v-col cols="12" md="4">
      <v-card class="pa-4 kpi-card-global elevation-4" color="indigo-lighten-5">
        <div class="d-flex align-center">
          <v-icon size="50" color="indigo-darken-2">mdi-currency-usd</v-icon>
          <div class="ml-3">
            <div class="kpi-title">Ventas Históricas</div>
            <div class="kpi-value text-indigo-darken-2">
              Q {{ formatearMoneda(globalStats.ventasTotales) }}
            </div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card class="pa-4 kpi-card-global elevation-4" color="teal-lighten-5">
        <div class="d-flex align-center">
          <v-icon size="50" color="teal-darken-2">mdi-shopping</v-icon>
          <div class="ml-3">
            <div class="kpi-title">Órdenes Totales</div>
            <div class="kpi-value text-teal-darken-2">
              {{ globalStats.totalOrdenes }}
            </div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card class="pa-4 kpi-card-global elevation-4" color="amber-lighten-5">
        <div class="d-flex align-center">
          <v-icon size="50" color="amber-darken-2">mdi-chart-line-variant</v-icon>
          <div class="ml-3">
            <div class="kpi-title">Ticket Promedio Global</div>
            <div class="kpi-value text-amber-darken-2">
              Q {{ formatearMoneda(globalStats.ticketPromedio) }}
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'DashboardGlobalStats',

  props: {
    globalStats: {
      type: Object,
      required: true
    }
  },

  methods: {
    formatearMoneda(valor) {
      if (!valor) return '0.00'
      return parseFloat(valor).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
.kpi-card-global {
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kpi-card-global:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.kpi-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #616161;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 4px;
}

@media (max-width: 960px) {
  .kpi-value {
    font-size: 1.5rem;
  }
  
  .kpi-title {
    font-size: 0.75rem;
  }
}
</style>
