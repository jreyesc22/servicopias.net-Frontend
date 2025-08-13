<template>
  <v-container class="py-6">
    <h2 class="text-h5 font-weight-bold mb-4">Dashboard de Ventas</h2>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-date-range-picker
          v-model="rangoFechas"
          color="primary"
          elevation="2"
          show-adjacent-months
          :max="new Date().toISOString().split('T')[0]"
          @update:model-value="onRangoChange"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="periodoTendencia"
          :items="['semanal', 'mensual', 'trimestral']"
          label="Periodo de tendencias"
          density="comfortable"
          @update:model-value="cargarTendencia"
        />
      </v-col>
    </v-row>

    <!-- Gráficos en 4 apartados (2x2) -->
    <v-row>
      <!-- Línea de ventas diarias -->
      <v-col cols="12" md="6" class="mt-4">
        <v-card outlined class="pa-4">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </v-card>
      </v-col>

      <!-- Barras de órdenes diarias -->
      <v-col cols="12" md="6" class="mt-4">
        <v-card outlined class="pa-4">
          <Bar :data="barChartData" :options="barChartOptions" />
        </v-card>
      </v-col>

      <!-- Línea de tendencias por periodo -->
      <v-col cols="12" md="6" class="mt-4">
        <v-card outlined class="pa-4">
          <Line :data="tendenciaChartData" :options="tendenciaChartOptions" />
        </v-card>
      </v-col>

      <!-- Dona de estados de orden -->
      <v-col cols="12" md="6" class="mt-4">
        <v-card outlined class="pa-4">
          <Doughnut :data="pieChartData" :options="pieChartOptions" />
        </v-card>
      </v-col>
    </v-row>




    <!-- KPIs por rango -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="pa-4 kpi-card" outlined>
          <div class="kpi-title">Ventas Totales</div>
          <div class="kpi-value">
            Q {{ kpis.ventasTotales.toLocaleString() }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 kpi-card" outlined>
          <div class="kpi-title">Ticket Promedio</div>
          <div class="kpi-value">
            Q {{ kpis.ticketPromedio.toFixed(2) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 kpi-card" outlined>
          <div class="kpi-title">Total Órdenes</div>
          <div class="kpi-value">
            {{ kpis.totalOrdenes }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPIs globales -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="pa-4 kpi-card" outlined>
          <div class="kpi-title">Ventas Históricas</div>
          <div class="kpi-value">
            Q {{ globalStats.ventasHistoricas.toLocaleString() }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 kpi-card" outlined>
          <div class="kpi-title">Órdenes Totales</div>
          <div class="kpi-value">
            {{ globalStats.ordenesTotales }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 kpi-card" outlined>
          <div class="kpi-title">Ticket Promedio Global</div>
          <div class="kpi-value">
            Q {{ globalStats.ticketPromedioGlobal.toFixed(2) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
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
import { Bar, Line, Doughnut } from 'vue-chartjs'
import ApiService from '@/services/api.service.js'

// Registro global de Chart.js
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

function debounce(fn, delay) {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default {
  name: 'Dashboard',
  components: { Bar, Line, Doughnut },
  data() {
    return {
      rangoFechas: { start: null, end: null },
      periodoTendencia: 'semanal',

      // KPIs
      kpis: { ventasTotales: 0, ticketPromedio: 0, totalOrdenes: 0 },
      globalStats: {
        ventasHistoricas: 0,
        ordenesTotales: 0,
        ticketPromedioGlobal: 0
      },

      // Datos de gráficos
      lineChartData: { labels: [], datasets: [] },
      pieChartData: { labels: [], datasets: [] },
      barChartData: { labels: [], datasets: [] },
      tendenciaChartData: { labels: [], datasets: [] },

      // Opciones de gráficos con animaciones personalizadas
     lineChartOptions: {
  responsive: true,
  animations: {
    tension: {
      duration: 1000,
      easing: 'linear',
      from: 1,
      to: 0,
      loop: true
    }
  },
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.dataset.label}: Q ${ctx.parsed.y.toLocaleString()}`
      }
    }
  },
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      min: 0,
      // max: 100 // solo si lo deseas fijo; si no, Chart.js lo ajusta dinámicamente
    }
  }
},

      barChartOptions: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Órdenes: ${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutExpo',
          delay: ctx => ctx.dataIndex * 150
        }
      },

      pieChartOptions: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.parsed.toLocaleString()} órdenes`
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutCirc',
          delay: ctx => ctx.dataIndex * 150
        }
      },

      tendenciaChartOptions: {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.dataset.label}: Q ${ctx.parsed.y.toLocaleString()}`
      }
    }
  },
  interaction: { mode: 'index', intersect: false },
  animations: {
    tension: {
      duration: 1000,
      easing: 'linear',
      from: 1,
      to: 0,
      loop: true
    }
  },
  scales: {
    y: {
      beginAtZero: true
      
      // Puedes agregar min/max si quieres forzar un rango fijo
    }
  }
}

    }
  },
  created() {
    this.cargarDashboardDebounced = debounce(this.cargarDashboard, 300)
  },
  async mounted() {
    const hoy = new Date()
    const hace7dias = new Date()
    hace7dias.setDate(hace7dias.getDate() - 7)

    this.rangoFechas = {
      start: hace7dias.toISOString().split('T')[0],
      end: hoy.toISOString().split('T')[0]
    }

    await this.cargarDashboard()
    await this.cargarTendencia()
    await this.cargarEstadisticasGlobales()
  },
  methods: {
    async cargarDashboard() {
      try {
        const { start, end } = this.rangoFechas
        if (!start || !end) return

        const resumen = await ApiService.getResumenByDateRange(start, end)

        this.kpis = {
          ventasTotales: resumen.estadisticas?.ventasTotales || 0,
          ticketPromedio: resumen.estadisticas?.ticketPromedio || 0,
          totalOrdenes: resumen.estadisticas?.totalOrdenes || 0
        }

        this.lineChartData = {
          labels: resumen.ventasPorDia.map(d => d.fecha),
          datasets: [{
            label: 'Ventas diarias',
            data: resumen.ventasPorDia.map(d => d.ventas),
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66,165,245,0.3)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 8
          }]
        }

        this.barChartData = {
          labels: resumen.ventasPorDia.map(d => d.fecha),
          datasets: [{
            label: 'Órdenes diarias',
            data: resumen.ventasPorDia.map(d => d.ordenes),
            backgroundColor: '#66bb6a'
          }]
        }

        const estados = resumen.estadisticas?.estadosOrden || {}
        this.pieChartData = {
          labels: Object.keys(estados),
          datasets: [{
            data: Object.values(estados),
            backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350'],
            hoverOffset: 10
          }]
        }
      } catch (error) {
        console.error('Error cargando dashboard:', error)
      }
    },

    async cargarTendencia() {
      try {
        const resumen = await ApiService.getTendenciasVentas(this.periodoTendencia)

        this.tendenciaChartData = {
          labels: resumen.ventasPorDia.map(d => d.fecha),
          datasets: [{
            label: `Ventas (${this.periodoTendencia})`,
            data: resumen.ventasPorDia.map(d => d.ventas),
            borderColor: '#ab47bc',
            backgroundColor: 'rgba(171,71,188,0.2)',
            fill: true,
            tension: 0.3
          }]
        }
      } catch (error) {
        console.error('Error al cargar tendencia:', error)
      }
    },

    async cargarEstadisticasGlobales() {
      try {
        const data = await ApiService.getEstadisticasGenerales()
        this.globalStats = {
          ventasHistoricas: data.ventasHistoricas || 0,
          ordenesTotales: data.ordenesTotales || 0,
          ticketPromedioGlobal: data.ticketPromedioGlobal || 0
        }
      } catch (error) {
        console.error('Error al cargar estadísticas globales:', error)
      }
    },

    onRangoChange() {
      if (this.rangoFechas.start && this.rangoFechas.end) {
        this.cargarDashboardDebounced()
      }
    }
  }
}
</script>

<style scoped>
.kpi-card {
  border: 2px solid #1976d2 !important;
  background-color: #e3f2fd;
  border-radius: 8px;
  transition: transform 0.3s ease;
}
.kpi-card:hover {
  transform: scale(1.05);
}
.kpi-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #424242;
  margin-bottom: 0.5rem;
}
.kpi-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212121;
}
</style>

