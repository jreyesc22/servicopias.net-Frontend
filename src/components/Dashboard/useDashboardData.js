import { ref, computed } from 'vue'
import ApiService from '@/services/api.service.js'

// Utilidad de debounce
const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function useDashboardData() {
  // Estados reactivos
  const cargando = ref(false)
  const cargandoProductos = ref(false)
  const error = ref(null)

  // Filtros
  const rangoFechas = ref({ start: null, end: null })
  const periodoTendencia = ref('mensual')
  const limitProductos = ref(10)

  // KPIs del periodo
  const kpis = ref({
    ventasTotales: 0,
    ticketPromedio: 0,
    
    totalOrdenes: 0,
    totalUnidades: 0
  })

  // KPIs globales
  const globalStats = ref({
    ventasTotales: 0,
    totalOrdenes: 0,
    ticketPromedio: 0
  })

  // Productos más vendidos
  const productosMasVendidos = ref([])

  // Datos de gráficos
  const lineChartData = ref({ labels: [], datasets: [] })
  const barChartData = ref({ labels: [], datasets: [] })
  const pieChartData = ref({ labels: [], datasets: [] })
  const tendenciaChartData = ref({ labels: [], datasets: [] })

  // Computed
  const rangoFechasTexto = computed(() => {
    if (!rangoFechas.value.start || !rangoFechas.value.end) return 'Selecciona un periodo'
    const start = new Date(rangoFechas.value.start).toLocaleDateString('es-GT')
    const end = new Date(rangoFechas.value.end).toLocaleDateString('es-GT')
    return `${start} - ${end}`
  })

  // Calcular fechas según periodo de tendencia
  const calcularFechasPorPeriodo = (periodo) => {
    const hoy = new Date()
    const inicio = new Date()

    switch(periodo) {
      case 'semanal':
        inicio.setDate(hoy.getDate() - 7)
        break
      case 'mensual':
        inicio.setMonth(hoy.getMonth() - 1)
        break
      case 'trimestral':
        inicio.setMonth(hoy.getMonth() - 3)
        break
      case 'semestral':
        inicio.setMonth(hoy.getMonth() - 6)
        break
      case 'anual':
        inicio.setFullYear(hoy.getFullYear() - 1)
        break
      default:
        inicio.setMonth(hoy.getMonth() - 1)
    }

    return {
      start: inicio.toISOString().split('T')[0],
      end: hoy.toISOString().split('T')[0]
    }
  }

  // Métodos
  const cargarDashboard = async () => {
    if (!rangoFechas.value.start || !rangoFechas.value.end) return

    cargando.value = true
    error.value = null

    try {
      const params = {
        inicio: rangoFechas.value.start,
        fin: rangoFechas.value.end
      }

      const resumen = await ApiService.getResumenByDateRange(params)

      // Actualizar KPIs
      kpis.value = {
        ventasTotales: resumen.estadisticas?.ventasTotales || 0,
        ticketPromedio: resumen.estadisticas?.ticketPromedio || 0,
        totalOrdenes: resumen.estadisticas?.totalOrdenes || 0,
        totalUnidades: resumen.estadisticas?.totalUnidades || 0
      }

      // Configurar gráficos
      configurarGraficos(resumen)
      
      // Cargar tendencias
      await cargarTendencia()
    } catch (err) {
      console.error('Error cargando dashboard:', err)
      error.value = 'Error al cargar las estadísticas. Por favor, intenta nuevamente.'
    } finally {
      cargando.value = false
    }
  }

  const configurarGraficos = (resumen) => {
    // Gráfico de línea: Ventas por día
    if (resumen.ventasPorDia && resumen.ventasPorDia.length > 0) {
      lineChartData.value = {
        labels: resumen.ventasPorDia.map(d => new Date(d.fecha).toLocaleDateString('es-GT')),
        datasets: [{
          label: 'Ventas Diarias',
          data: resumen.ventasPorDia.map(d => parseFloat(d.ventas) || 0),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          // Configuración elástica
        tension: 0, // 0.4 es el balance ideal entre curva y precisión
        pointRadius: 2,
        pointHoverRadius: 7,
        borderWidth: 2,
        pointBackgroundColor: '#1976d2'
       

        }]
      }

      // Gráfico de barras: Órdenes por día
      barChartData.value = {
        labels: resumen.ventasPorDia.map(d => new Date(d.fecha).toLocaleDateString('es-GT')),
        datasets: [{
          label: 'Órdenes',
          data: resumen.ventasPorDia.map(d => parseInt(d.ordenes) || 0),
          backgroundColor: ['#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb', '#9966ff', '#c9cbcf']
        }]
      }
    }

    // Gráfico circular: Distribución por estado
    if (resumen.estadisticas?.estadosOrden && Object.keys(resumen.estadisticas.estadosOrden).length > 0) {
      const estados = resumen.estadisticas.estadosOrden
      pieChartData.value = {
        labels: Object.keys(estados).map(e => e.charAt(0).toUpperCase() + e.slice(1)),
        datasets: [{
          data: Object.values(estados),
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350'],
          hoverOffset: 10
        }]
      }
    }
  }

  const cargarTendencia = async () => {
    try {
      const resumen = await ApiService.getTendenciasVentas(periodoTendencia.value)

      if (resumen.ventasPorDia && resumen.ventasPorDia.length > 0) {
        tendenciaChartData.value = {
          labels: resumen.ventasPorDia.map(d => new Date(d.fecha).toLocaleDateString('es-GT')),
          datasets: [{
            label: `Ventas (${periodoTendencia.value})`,
            data: resumen.ventasPorDia.map(d => parseFloat(d.ventas) || 0),
            borderColor: '#ab47bc',
            backgroundColor: 'rgba(171, 71, 188, 0.2)',
            fill: true,
            tension: 0.4
          }]
        }
      }

      // Actualizar rango de fechas según el periodo de tendencia
      const fechasPeriodo = calcularFechasPorPeriodo(periodoTendencia.value)
      rangoFechas.value = fechasPeriodo

      // Recargar productos más vendidos con el nuevo periodo
      await cargarProductosMasVendidos()
    } catch (err) {
      console.error('Error al cargar tendencia:', err)
    }
  }

  const cargarEstadisticasGlobales = async () => {
    try {
      const data = await ApiService.getEstadisticasGenerales()
      
      globalStats.value = {
        ventasTotales: data.estadisticas?.ventasTotales || 0,
        totalOrdenes: data.estadisticas?.totalOrdenes || 0,
        ticketPromedio: data.estadisticas?.ticketPromedio || 0
      }
    } catch (err) {
      console.error('Error al cargar estadísticas globales:', err)
    }
  }

  const cargarProductosMasVendidos = async () => {
    cargandoProductos.value = true
    try {
      const params = {
        inicio: rangoFechas.value.start,
        fin: rangoFechas.value.end,
        limit: limitProductos.value
      }

      const data = await ApiService.getProductosMasVendidos(params)
      productosMasVendidos.value = data.productos || []
    } catch (err) {
      console.error('Error al cargar productos más vendidos:', err)
      error.value = 'Error al cargar productos más vendidos.'
    } finally {
      cargandoProductos.value = false
    }
  }

  const recargarDatos = () => {
    cargarDashboard()
    cargarEstadisticasGlobales()
    cargarProductosMasVendidos()
  }

  const inicializarFechas = () => {
    const hoy = new Date()
    const hace7dias = new Date()
    hace7dias.setDate(hace7dias.getDate() - 7)
    
    rangoFechas.value = {
      start: hace7dias.toISOString().split('T')[0],
      end: hoy.toISOString().split('T')[0]
    }
  }

  // Debounced para cambio de rango
  const onRangoChange = debounce(() => {
    if (rangoFechas.value.start && rangoFechas.value.end) {
      cargarDashboard()
      cargarProductosMasVendidos()
    }
  }, 500)

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
    onRangoChange
  }
}
