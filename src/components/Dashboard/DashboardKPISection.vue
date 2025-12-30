<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <h3 class="text-h6 font-weight-bold mb-3">
          Periodo Seleccionado: {{ rangoFechasTexto }}
        </h3>
      </v-col>
      
      <v-col cols="12" md="3">
        <DashboardKPICard
          title="Ventas Totales"
          :value="kpis.ventasTotales"
          icon="mdi-cash-multiple"
          color="blue-lighten-5"
          icon-color="blue-darken-2"
          format-as-currency
        />
      </v-col>

      <v-col cols="12" md="3">
        <DashboardKPICard
          title="Total Órdenes"
          :value="kpis.totalOrdenes"
          icon="mdi-receipt-text"
          color="green-lighten-5"
          icon-color="green-darken-2"
        />
      </v-col>

      <v-col cols="12" md="3">
        <DashboardKPICard
          title="Ticket Promedio"
          :value="kpis.ticketPromedio"
          icon="mdi-calculator"
          color="orange-lighten-5"
          icon-color="orange-darken-2"
          format-as-currency
        />
      </v-col>

      <v-col cols="12" md="3">
        <DashboardKPICard
          title="Total Unidades"
          :value="kpis.totalUnidades || 0"
          icon="mdi-package-variant"
          color="purple-lighten-5"
          icon-color="purple-darken-2"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import DashboardKPICard from './DashboardKPICard.vue'

export default {
  name: 'DashboardKPISection',

  components: {
    DashboardKPICard
  },

  props: {
    kpis: {
      type: Object,
      required: true
    },
    rangoFechasTexto: {
      type: String,
      required: true
    }
  }
}
</script>
