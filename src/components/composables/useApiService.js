// composables/useApiService.js
import apiService from '@/services/api.service'

export function useApiService() {
  const API_URL = process.env.VUE_APP_API_URL || ''

  const handleResponse = async (response) => {
    // Manejo robusto según content-type y códigos HTTP
    const contentType = response.headers?.get?.('content-type') || ''
    if (!response.ok) {
      let errorBody = null
      if (contentType.includes('application/json')) {
        errorBody = await response.json().catch(() => ({}))
      } else {
        errorBody = await response.text().catch(() => null)
      }
      const message = (errorBody && errorBody.message) || errorBody || `HTTP error! status: ${response.status}`
      const err = new Error(message)
      err.status = response.status
      err.body = errorBody
      throw err
    }

    // No content
    if (response.status === 204) return {}

    if (contentType.includes('application/json')) {
      return await response.json().catch(() => ({}))
    }

    // Fallback a texto
    return await response.text().catch(() => ({}))
  }

  const subirArchivos = async (archivos) => {
    if (!archivos?.imagen && !archivos?.pdf) return {}

    try {
      const formData = new FormData()
      if (archivos.imagen) formData.append('imagen', archivos.imagen)
      if (archivos.pdf) formData.append('pdf', archivos.pdf)

      const token = apiService.getAuthToken()

      const response = await fetch(`${API_URL.replace(/\/+$/, '')}/items/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      })

      return await handleResponse(response)
    } catch (error) {
      console.error('Error subiendo archivos:', error)
      throw new Error(`Error al subir archivos: ${error.message}`)
    }
  }

  const cargarCategorias = async () => {
    try {
      const data = await apiService.get('/categorias/list')
      // apiService.get ya devuelve JSON parsed
      if (!Array.isArray(data)) throw new Error('Formato de respuesta inválido')
      return data
    } catch (error) {
      console.error('Error cargando categorías:', error)
      throw new Error('Error al cargar categorías')
    }
  }

  const cargarInsumos = async () => {
    try {
      const data = await apiService.get('/items/all', { tipo: 'insumo' })
      if (!Array.isArray(data)) throw new Error('Formato de respuesta inválido')
      return data
    } catch (error) {
      console.error('Error cargando insumos:', error)
      throw new Error('Error al cargar insumos')
    }
  }

  const guardarItem = async (item, isEdit = false) => {
    try {
      const endpoint = isEdit ? `/items/${item.id}` : '/items/create'
      if (isEdit) return await apiService.put(endpoint, item)
      return await apiService.post(endpoint, item)
    } catch (error) {
      console.error('Error guardando item:', error)
      throw new Error(`Error al guardar: ${error.message}`)
    }
  }

  const validarItem = async (item) => {
    try {
      const data = await apiService.post('/items/validar', {
        nombre: item.nombre,
        precio: item.precio,
        id: item.id || null,
        codigo_barras: item.codigo_barras || null
      })

      if (!data || data.valido === false) {
        throw new Error(data?.mensaje || 'Item duplicado')
      }

      return true
    } catch (error) {
      console.error('Error validando item:', error)
      throw error
    }
  }

  const validarNombre = async (nombre, itemId = null) => {
    try {
      const data = await apiService.post('/items/validar-nombre', { nombre, id: itemId })
      return data || { valido: true }
    } catch (error) {
      console.error('Error validando nombre:', error)
      return { valido: true }
    }
  }

  return {
    subirArchivos,
    cargarCategorias,
    cargarInsumos,
    guardarItem,
    validarItem,
    validarNombre
  }
}