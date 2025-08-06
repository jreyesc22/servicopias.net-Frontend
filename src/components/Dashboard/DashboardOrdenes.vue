<template>
  <v-container class="py-6">
    <h2 class="text-h5 font-weight-bold mb-4">Dashboard de Ventas</h2>

    <!-- Selector de rango de fechas con Vuetify 3 -->
    <v-row class="mb-6">
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
    </v-row>

    <!-- KPIs -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <div class="text-h6">Ventas Totales</div>
          <div class="text-h4 font-weight-bold">
            Q {{ kpis.ventasTotales.toLocaleString() }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <div class="text-h6">Ticket Promedio</div>
          <div class="text-h4 font-weight-bold">
            Q {{ kpis.ticketPromedio.toFixed(2) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <div class="text-h6">Total Órdenes</div>
          <div class="text-h4 font-weight-bold">
            {{ kpis.totalOrdenes }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row>
      <v-col cols="12" md="8">
        <Line :data="lineChartData" :options="chartOptions" />
      </v-col>

      <v-col cols="12" md="4">
        <Doughnut :data="pieChartData" :options="chartOptions" />
      </v-col>

      <v-col cols="12" class="mt-6">
        <Bar :data="barChartData" :options="chartOptions" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, ArcElement } from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import ApiService from '@/services/api.service.js'

// Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, ArcElement)

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
      kpis: { ventasTotales: 0, ticketPromedio: 0, totalOrdenes: 0 },
      lineChartData: { labels: [], datasets: [] },
      pieChartData: { labels: [], datasets: [] },
      barChartData: { labels: [], datasets: [] },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || ''
                if (context.parsed.y !== undefined) {
                  label += `: Q ${context.parsed.y.toLocaleString()}`
                } else if (context.parsed !== undefined) {
                  label += `: ${context.parsed.toLocaleString()}`
                }
                return label
              }
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
        hover: { mode: 'nearest', intersect: true },
        animation: { duration: 800, easing: 'easeOutQuart' }
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
          datasets: [
            {
              label: 'Ventas diarias',
              data: resumen.ventasPorDia.map(d => d.ventas),
              borderColor: '#42a5f5',
              backgroundColor: 'rgba(66,165,245,0.3)',
              fill: true,
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 8
            }
          ]
        }

        const estados = resumen.estadisticas?.estadosOrden || {}
        this.pieChartData = {
          labels: Object.keys(estados),
          datasets: [
            {
              data: Object.values(estados),
              backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350'],
              hoverOffset: 10
            }
          ]
        }

        this.barChartData = {
          labels: resumen.ventasPorDia.map(d => d.fecha),
          datasets: [
            {
              label: 'Órdenes diarias',
              data: resumen.ventasPorDia.map(d => d.ordenes),
              backgroundColor: '#66bb6a'
            }
          ]
        }
      } catch (error) {
        console.error('Error cargando dashboard:', error)
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
