class ApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'http://192.168.1.10:3000/api'
    this.timeout = 10000
  }

  // Método base para hacer peticiones HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    }

    // Agregar token de autorización si existe
    const token = this.getAuthToken()
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return await response.text()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      console.error('API Request Error:', error)
      throw error
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    
    return this.request(url, {
      method: 'GET'
    })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }

  // Gestión de token de autenticación
  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  setAuthToken(token, persistent = false) {
    if (persistent) {
      localStorage.setItem('auth_token', token)
    } else {
      sessionStorage.setItem('auth_token', token)
    }
  }

  removeAuthToken() {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
  }

  // === MÉTODOS ESPECÍFICOS DE ÓRDENES ===

  // Obtener órdenes por rango de fechas (usa findByDateRange)
  async getOrdenesByDateRange(fechaInicio, fechaFin, filtros = {}) {
    const params = {
      fechaInicio,
      fechaFin,
      ...filtros
    }
    
    return this.get('/ordenes/dashboard/range', params)
  }

  // Obtener resumen por rango de fechas (usa getResumenByDateRange)
  async getResumenByDateRange(fechaInicio, fechaFin) {
    const params = {
      fechaInicio,
      fechaFin
    }
    
    return this.get('/ordenes/dashboard/resumen', params)
  }

  // Obtener órdenes del mes actual
  async getOrdenesDelMes() {
    const fechaInicio = new Date()
    fechaInicio.setDate(1) // Primer día del mes
    
    const fechaFin = new Date()
    fechaFin.setMonth(fechaFin.getMonth() + 1, 0) // Último día del mes
    
    return this.getResumenByDateRange(
      this.formatDate(fechaInicio),
      this.formatDate(fechaFin)
    )
  }

  // Obtener órdenes de los últimos N días
  async getOrdenesUltimosDias(dias = 7) {
    const fechaFin = new Date()
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - dias)
    
    return this.getResumenByDateRange(
      this.formatDate(fechaInicio),
      this.formatDate(fechaFin)
    )
  }

  // Obtener órdenes de hoy
  async getOrdenesHoy() {
    const hoy = this.formatDate(new Date())
    return this.getOrdenesByDateRange(hoy, hoy)
  }

  // Método utilitario para formatear fechas
  formatDate(date) {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  // Obtener datos para gráfico de tendencias
  async getTendenciasVentas(periodo = 'mensual') {
    let fechaInicio, fechaFin
    
    switch (periodo) {
      case 'semanal':
        fechaInicio = new Date()
        fechaInicio.setDate(fechaInicio.getDate() - 7)
        fechaFin = new Date()
        break
        
      case 'mensual':
        fechaInicio = new Date()
        fechaInicio.setMonth(fechaInicio.getMonth() - 1)
        fechaFin = new Date()
        break
        
      case 'trimestral':
        fechaInicio = new Date()
        fechaInicio.setMonth(fechaInicio.getMonth() - 3)
        fechaFin = new Date()
        break
        
      default:
        fechaInicio = new Date()
        fechaInicio.setMonth(fechaInicio.getMonth() - 1)
        fechaFin = new Date()
    }
    
    return this.getResumenByDateRange(
      this.formatDate(fechaInicio),
      this.formatDate(fechaFin)
    )
  }

  // === MÉTODOS ADICIONALES DE ÓRDENES ===

  // Obtener una orden específica por ID
  async getOrdenById(id) {
    return this.get(`/ordenes/${id}`)
  }

  // Crear nueva orden
  async crearOrden(datosOrden) {
    return this.post('/ordenes', datosOrden)
  }

  // Actualizar orden existente
  async actualizarOrden(id, datosOrden) {
    return this.put(`/ordenes/${id}`, datosOrden)
  }

  // Eliminar orden
  async eliminarOrden(id) {
    return this.delete(`/ordenes/${id}`)
  }

  // Cambiar estado de orden
  async cambiarEstadoOrden(id, nuevoEstado) {
    return this.put(`/ordenes/${id}/estado`, { estado: nuevoEstado })
  }

  // Obtener estadísticas generales
  async getEstadisticasGenerales() {
    return this.get('/ordenes/estadisticas')
  }

  // Exportar órdenes
  async exportarOrdenes(formato = 'excel', filtros = {}) {
    const params = {
      formato,
      ...filtros
    }
    
    return this.get('/ordenes/exportar', params)
  }

  // === MÉTODOS DE UTILIDAD ===

  // Manejar errores de forma consistente
  handleError(error, customMessage = null) {
    console.error('API Error:', error)
    
    let message = customMessage || 'Ha ocurrido un error inesperado'
    
    if (error.message) {
      if (error.message.includes('401')) {
        message = 'No autorizado. Por favor, inicia sesión nuevamente.'
        this.removeAuthToken()
      } else if (error.message.includes('403')) {
        message = 'No tienes permisos para realizar esta acción.'
      } else if (error.message.includes('404')) {
        message = 'El recurso solicitado no fue encontrado.'
      } else if (error.message.includes('500')) {
        message = 'Error interno del servidor. Intenta nuevamente.'
      } else if (error.message.includes('timeout')) {
        message = 'La petición tardó demasiado. Verifica tu conexión.'
      }
    }
    
    return {
      error: true,
      message,
      originalError: error
    }
  }

  // Verificar conectividad
  async checkConnection() {
    try {
      await this.get('/health')
      return true
    } catch (error) {
      return false
    }
  }

  // Reintentar petición con backoff exponencial
  async retryRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
}

export default new ApiService()