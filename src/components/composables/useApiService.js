// composables/useApiService.js
export function useApiService() {
  const API_URL = process.env.VUE_APP_API_URL

  const handleResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  const subirArchivos = async (archivos) => {
    if (!archivos.imagen && !archivos.pdf) {
      return {} // No hay archivos que subir
    }

    try {
      const formData = new FormData()
      if (archivos.imagen) {
        formData.append('imagen', archivos.imagen)
      }
      if (archivos.pdf) {
        formData.append('pdf', archivos.pdf)
      }

      const response = await fetch(`${API_URL}/items/upload`, {
        method: 'POST',
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
      const response = await fetch(`${API_URL}/categorias/list`)
      const data = await handleResponse(response)
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido')
      }
      
      return data
    } catch (error) {
      console.error('Error cargando categorías:', error)
      throw new Error('Error al cargar categorías')
    }
  }

  const cargarInsumos = async () => {
    try {
      const response = await fetch(`${API_URL}/items/all?tipo=insumo`)
      const data = await handleResponse(response)

      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido')
      }

      return data
    } catch (error) {
      console.error('Error cargando insumos:', error)
      throw new Error('Error al cargar insumos')
    }
  }
  const guardarItem = async (item, isEdit = false) => {
    try {
      const url = isEdit 
        ? `${API_URL}/items/${item.id}`
        : `${API_URL}/items/create`
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      return await handleResponse(response)
    } catch (error) {
      console.error('Error guardando item:', error)
      throw new Error(`Error al guardar: ${error.message}`)
    }
  }

  const validarItem = async (item) => {
    try {
      const response = await fetch(`${API_URL}/items/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: item.nombre,
          precio: item.precio,
          id: item.id || null,
          codigo_barras: item.codigo_barras || null
        })
      })

      const data = await handleResponse(response)
      
      if (!data.valido) {
        throw new Error(data.mensaje || 'Item duplicado')
      }
      
      return true
    } catch (error) {
      console.error('Error validando item:', error)
      throw error
    }
  }

  const validarNombre = async (nombre, itemId = null) => {
    try {
      const response = await fetch(`${API_URL}/items/validar-nombre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          id: itemId
        })
      })

      if (!response.ok) return { valido: true }

      const data = await response.json()
      return data
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