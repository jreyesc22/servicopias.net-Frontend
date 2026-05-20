import { ref } from 'vue'
import axios from 'axios'

/**
 * Hook para gestionar carga de items con stock bajo
 * Maneja estado de datos y carga desde API
 */
export function useLowStockData(apiBase = null) {
  const items = ref([])
  const threshold = ref(5)
  const loading = ref(false)
  const error = ref(null)

  const finalApiBase = apiBase || `${process.env.VUE_APP_API_URL}/items`

  const cargarItems = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${finalApiBase}/low-stock`, {
        params: { threshold: threshold.value }
      })
      items.value = res.data.items || []
    } catch (err) {
      console.error('Error cargar low stock', err)
      error.value = err.message || 'Error al cargar items'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    threshold,
    loading,
    error,
    cargarItems
  }
}
