<template>
  <v-container fluid class="py-6">
    <!-- Header con título y botones de acción -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <h2 class="text-h4 font-weight-bold mb-2">Tablero de Información</h2>
        <p class="text-subtitle-1 text-grey-darken-1">
          Análisis completo de ventas y estadísticas del negocio
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn 
          color="primary" 
          variant="outlined" 
          prepend-icon="mdi-refresh"
          @click="recargarDatos"
          :loading="cargando"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Alerta de error -->
    <v-alert 
      v-if="error" 
      type="error" 
      variant="tonal" 
      closable 
      class="mb-4"
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Filtros -->
    <DashboardFilters
      v-model:rango-fechas="rangoFechas"
      v-model:periodo-tendencia="periodoTendencia"
      v-model:limit-productos="limitProductos"
      @update:rango-fechas="onRangoChange"
      @update:periodo-tendencia="cargarTendencia"
      @update:limit-productos="cargarProductosMasVendidos"
    />

    <!-- Gráficos principales (2x2) -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <DashboardChartCard
          title="Ventas Diarias (Q)"
          icon="mdi-chart-line"
          icon-color="blue"
          chart-type="line"
          :data="lineChartData"
          :options="lineOptions"
        />
      </v-col>

      <v-col cols="12" md="6">
        <DashboardChartCard
          title="Órdenes Diarias"
          icon="mdi-chart-bar"
          icon-color="green"
          chart-type="bar"
          :data="barChartData"
          :options="barOptions"
        />
      </v-col>

      <v-col cols="12" md="6">
        <DashboardChartCard
          :title="`Tendencia ${periodoTendencia}`"
          icon="mdi-chart-timeline-variant"
          icon-color="purple"
          chart-type="line"
          :data="tendenciaChartData"
          :options="tendenciaOptions"
        />
      </v-col>

      <v-col cols="12" md="6">
        <DashboardChartCard
          title="Estados de Órdenes"
          icon="mdi-chart-donut"
          icon-color="orange"
          chart-type="doughnut"
          :data="pieChartData"
          :options="pieOptions"
        />
      </v-col>
    </v-row>

    <!-- Productos más vendidos -->
    <v-row class="mb-6">
      <v-col cols="12">
        <DashboardProductsTable
          :productos="productosMasVendidos"
          :limit="limitProductos"
          :loading="cargandoProductos"
        />
      </v-col>
    </v-row>

    <!-- KPIs del rango seleccionado -->
    <DashboardKPISection
      :kpis="kpis"
      :rango-fechas-texto="rangoFechasTexto"
    />

    <!-- KPIs globales (históricos) -->
    <DashboardGlobalStats :global-stats="globalStats" />
  </v-container>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement
} from 'chart.js'
import DashboardFilters from './DashboardFilters.vue'
import DashboardChartCard from './DashboardChartCard.vue'
import DashboardProductsTable from './DashboardProductsTable.vue'
import DashboardKPISection from './DashboardKPISection.vue'
import DashboardGlobalStats from './DashboardGlobalStats.vue'
import { useDashboardData } from './useDashboardData.js'
import {
  lineChartOptions,
  barChartOptions,
  pieChartOptions,
  tendenciaChartOptions
} from './chartOptions.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement
)

export default {
  name: 'DashboardOrdenes',
  
  components: {
    DashboardFilters,
    DashboardChartCard,
    DashboardProductsTable,
    DashboardKPISection,
    DashboardGlobalStats
  },
  
  setup() {
    const {
      // Estado
      cargando,
      cargandoProductos,
      error,
      
      // Filtros
      rangoFechas,
      periodoTendencia,
      limitProductos,
      
      // Datos
      kpis,
      globalStats,
      productosMasVendidos,
      lineChartData,
      barChartData,
      pieChartData,
      tendenciaChartData,
      
      // Computed
      rangoFechasTexto,
      
      // Métodos
      cargarDashboard,
      cargarTendencia,
      cargarEstadisticasGlobales,
      cargarProductosMasVendidos,
      recargarDatos,
      inicializarFechas,
      onRangoChange
    } = useDashboardData()

    return {
      // Estado
      cargando,
      cargandoProductos,
      error,
      
      // Filtros
      rangoFechas,
      periodoTendencia,
      limitProductos,
      
      // Datos
      kpis,
      globalStats,
      productosMasVendidos,
      lineChartData,
      barChartData,
      pieChartData,
      tendenciaChartData,
      
      // Computed
      rangoFechasTexto,
      
      // Métodos
      cargarDashboard,
      cargarTendencia,
      cargarEstadisticasGlobales,
      cargarProductosMasVendidos,
      recargarDatos,
      inicializarFechas,
      onRangoChange,
      
      // Opciones de gráficos
      lineOptions: lineChartOptions,
      barOptions: barChartOptions,
      pieOptions: pieChartOptions,
      tendenciaOptions: tendenciaChartOptions
    }
  },

  mounted() {
    this.inicializarFechas()
    this.cargarDashboard()
    this.cargarEstadisticasGlobales()
    this.cargarProductosMasVendidos()
  }
}
</script>

<style scoped>
/* Animaciones suaves */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>

