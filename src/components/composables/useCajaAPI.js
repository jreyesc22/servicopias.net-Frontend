// composables/useCajaAPI.js
import { ref } from 'vue'

export function useCajaAPI() {
  const loading = ref(false)
  const error = ref(null)
  
  // Configuración base de la API usando variables de entorno
  const API_BASE_URL = `${process.env.VUE_APP_API_URL}/caja`
  
  // Función helper para hacer peticiones HTTP
  const fetchAPI = async (url, options = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      }
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
      
    } catch (err) {
      error.value = err.message
      console.error('Error en API:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  //  Obtener movimientos de hoy
  const obtenerMovimientosHoy = async () => {
    return await fetchAPI(`${API_BASE_URL}/today/movimientos`)
  }

  // Obtener movimientos por fecha específica
  const obtenerMovimientosPorFecha = async (fecha) => {
    return await fetchAPI(`${API_BASE_URL}/fecha/${fecha}/movimientos`)
  }

  // Obtener todos los movimientos
  const obtenerTodosMovimientos = async () => {
    return await fetchAPI(`${API_BASE_URL}/all`)
  }

  // Obtener movimiento por ID
  const obtenerMovimientoPorId = async (id) => {
    return await fetchAPI(`${API_BASE_URL}/${id}`)
  }

  // Crear nuevo movimiento
  const crearMovimiento = async (datosMovimiento) => {
    return await fetchAPI(`${API_BASE_URL}/create`, {
      method: 'POST',
      body: JSON.stringify(datosMovimiento)
    })
  }

  //  Actualizar movimiento (si implementas esta funcionalidad)
  const actualizarMovimiento = async (id, datosMovimiento) => {
    return await fetchAPI(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosMovimiento)
    })
  }

  // Eliminar movimiento
  const eliminarMovimiento = async (id) => {
    return await fetchAPI(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    })
  }

  // Obtener movimientos por empleado
  const obtenerMovimientosPorEmpleado = async (empleadoId) => {
    return await fetchAPI(`${API_BASE_URL}/empleado/${empleadoId}`)
  }

  // Obtener resumen de pagos de una orden
  const obtenerResumenPagosOrden = async (ordenId) => {
    return await fetchAPI(`${API_BASE_URL}/orden/${ordenId}/resumen`)
  }

  // Obtener estadísticas de caja (función adicional)
  const obtenerEstadisticasCaja = async (fechaInicio, fechaFin) => {
    const params = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })
    return await fetchAPI(`${API_BASE_URL}/estadisticas?${params}`)
  }

  // Obtener balance actual de caja
  const obtenerBalanceActual = async () => {
    try {
      const movimientosHoy = await obtenerMovimientosHoy()
      const resumen = movimientosHoy.resumen || {}
      
      return {
        total_ingresos: resumen.total_ingresos || 0,
        total_egresos: resumen.total_egresos || 0,
        balance: resumen.balance_del_dia || 0,
        movimientos_count: resumen.total_movimientos || 0
      }
    } catch (err) {
      console.error('Error al obtener balance:', err)
      return {
        total_ingresos: 0,
        total_egresos: 0,
        balance: 0,
        movimientos_count: 0
      }
    }
  }

  // Buscar movimientos con filtros
  const buscarMovimientos = async (filtros = {}) => {
    const params = new URLSearchParams()
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key])
      }
    })
    
    return await fetchAPI(`${API_BASE_URL}/buscar?${params}`)
  }

  // Exportar movimientos (si implementas esta funcionalidad)
  const exportarMovimientos = async (formato = 'excel', filtros = {}) => {
    const params = new URLSearchParams({
      formato,
      ...filtros
    })
    
    try {
      const response = await fetch(`${API_BASE_URL}/exportar?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al exportar')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movimientos_caja_${new Date().toISOString().split('T')[0]}.${formato}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      console.error('Error al exportar:', err)
      throw err
    }
  }

  // Recalcular estado de pago de una orden
  const recalcularEstadoPagoOrden = async (ordenId) => {
    return await fetchAPI(`${API_BASE_URL}/orden/${ordenId}/recalcular`, {
      method: 'POST'
    })
  }

  return {
    // Estados
    loading,
    error,
    
    // Métodos principales
    obtenerMovimientosHoy,
    obtenerMovimientosPorFecha,
    obtenerTodosMovimientos,
    obtenerMovimientoPorId,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
    
    // Métodos por entidad
    obtenerMovimientosPorEmpleado,
    obtenerResumenPagosOrden,
    
    // Métodos de análisis
    obtenerEstadisticasCaja,
    obtenerBalanceActual,
    buscarMovimientos,
    
    // Utilidades
    exportarMovimientos,
    recalcularEstadoPagoOrden
  }
}

// Composable adicional para empleados (si necesitas)
export function useEmpleadosAPI() {
  const obtenerEmpleados = async () => {
    try {
      const response = await fetch(`${process.env.VUE_APP_API_URL}/empleados/all`)
      if (!response.ok) throw new Error('Error al obtener empleados')
      return await response.json()
    } catch (error) {
      console.error('Error:', error)
      // Datos de fallback
      return [
        { id: 1, nombre: 'Osman Reyes', puesto: 'Atención al Cliente' }
      ]
    }
  }

  return {
    obtenerEmpleados
  }
}

// Composable adicional para tipos de pago (si necesitas)
export function useTiposPagoAPI() {
  const obtenerTiposPago = async () => {
    try {
      const response = await fetch(`${process.env.VUE_APP_API_URL}/tipos_pago/all`)
      if (!response.ok) throw new Error('Error al obtener tipos de pago')
      return await response.json()
    } catch (error) {
      console.error('Error:', error)
      // Datos de fallback
      return [
        { id: 1, nombre: 'Efectivo' },
        { id: 2, nombre: 'Tarjeta de Débito' },
        { id: 3, nombre: 'Tarjeta de Crédito' },
        { id: 4, nombre: 'Transferencia Bancaria' }
      ]
    }
  }

  return {
    obtenerTiposPago
  }
}