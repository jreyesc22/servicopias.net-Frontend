class ApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL
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

  // Obtener todas las órdenes con paginación
  async getAllOrdenes(page = 1, limit = 100) {
    const params = { page, limit }
    return this.get('/ordenes/all', params)
  }

  // Buscar órdenes por criterios
  async buscarOrdenes(criterios = {}) {
    return this.get('/ordenes/search', criterios)
  }

  // === MÉTODOS DE ESTADÍSTICAS (NUEVO CONTROLADOR) ===

  // Obtener estadísticas generales
  async getEstadisticasGenerales() {
    return this.get('/estadisticas/generales')
  }

  // Obtener órdenes por rango de fechas con estadísticas
  async getOrdenesByDateRange(params = {}) {
    // Normalizar parámetros: aceptar tanto inicio/fin como fechaInicio/fechaFin
    const normalizedParams = {
      fechaInicio: params.inicio || params.fechaInicio,
      fechaFin: params.fin || params.fechaFin,
      ...params
    }
    delete normalizedParams.inicio
    delete normalizedParams.fin
    
    return this.get('/estadisticas/date-range', normalizedParams)
  }

  // Obtener resumen por rango de fechas (solo estadísticas, sin órdenes)
  async getResumenByDateRange(params = {}) {
    // Normalizar parámetros y limpiar undefined
    const normalizedParams = {}
    
    if (params.inicio || params.fechaInicio) {
      normalizedParams.fechaInicio = params.inicio || params.fechaInicio
    }
    
    if (params.fin || params.fechaFin) {
      normalizedParams.fechaFin = params.fin || params.fechaFin
    }
    
    return this.get('/estadisticas/resumen-date-range', normalizedParams)
  }

  // Obtener productos más vendidos
  async getProductosMasVendidos(params = {}) {
    // Normalizar parámetros y limpiar undefined
    const normalizedParams = {
      limit: parseInt(params.limit) || 10
    }
    
    if (params.inicio || params.fechaInicio) {
      normalizedParams.fechaInicio = params.inicio || params.fechaInicio
    }
    
    if (params.fin || params.fechaFin) {
      normalizedParams.fechaFin = params.fin || params.fechaFin
    }
    
    return this.get('/estadisticas/productos-mas-vendidos', normalizedParams)
  }

  // Obtener productos más vendidos por categoría
  async getProductosPorCategoria(params = {}) {
    const normalizedParams = {
      limit: params.limit || 5,
      fechaInicio: params.inicio || params.fechaInicio,
      fechaFin: params.fin || params.fechaFin
    }
    
    return this.get('/estadisticas/productos-por-categoria', normalizedParams)
  }

  // Obtener estadísticas de una categoría específica
  async getEstadisticasCategoria(categoriaId, params = {}) {
    const normalizedParams = {
      limit: params.limit || 10,
      fechaInicio: params.inicio || params.fechaInicio,
      fechaFin: params.fin || params.fechaFin
    }
    
    return this.get(`/estadisticas/categoria/${categoriaId}`, normalizedParams)
  }

  // Obtener órdenes del mes actual
  async getOrdenesDelMes() {
    const fechaInicio = new Date()
    fechaInicio.setDate(1) // Primer día del mes
    
    const fechaFin = new Date()
    fechaFin.setMonth(fechaFin.getMonth() + 1, 0) // Último día del mes
    
    return this.getResumenByDateRange({
      inicio: this.formatDate(fechaInicio),
      fin: this.formatDate(fechaFin)
    })
  }

  // Obtener órdenes de los últimos N días
  async getOrdenesUltimosDias(dias = 7) {
    const fechaFin = new Date()
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - dias)
    
    return this.getResumenByDateRange({
      inicio: this.formatDate(fechaInicio),
      fin: this.formatDate(fechaFin)
    })
  }

  // Obtener órdenes de hoy
  async getOrdenesHoy() {
    const hoy = this.formatDate(new Date())
    return this.getOrdenesByDateRange({ inicio: hoy, fin: hoy })
  }

  // Método utilitario para formatear fechas
  formatDate(date) {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  // Obtener datos para gráfico de tendencias
  async getTendenciasVentas(periodo = 'mensual') {
    const { inicio, fin } = this.calcularRangoPeriodo(periodo)
    return this.getResumenByDateRange({ inicio, fin })
  }

  // Calcular rango de fechas según periodo
  calcularRangoPeriodo(periodo) {
    const fechaFin = new Date()
    const fechaInicio = new Date()
    
    const diasPorPeriodo = {
      'semanal': 7,
      'mensual': 30,
      'trimestral': 90,
      'semestral': 180,
      'anual': 365
    }
    
    const dias = diasPorPeriodo[periodo] || 30
    fechaInicio.setDate(fechaInicio.getDate() - dias)
    
    return {
      inicio: this.formatDate(fechaInicio),
      fin: this.formatDate(fechaFin)
    }
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
    return this.put(`/ordenes/upstado/${id}`, { estado: nuevoEstado })
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