import { reactive, computed } from 'vue'

/**
 * Hook para gestionar filtros de items con stock bajo
 * Maneja estado de filtros (estado, tipo) y lógica de filtrado
 */
export function useLowStockFilters(items, threshold) {
  const filtros = reactive({
    agotado: true,
    critico: true,
    tipo: {
      producto: true,
      insumo: true,
      servicio: true
    }
  })

  const itemsFiltrados = computed(() => {
    return items.value.filter(item => {
      // Filtro por estado
      const esAgotado = item.stock === 0
      const esCritico = item.stock > 0 && item.stock <= threshold.value
      
      let cumpleEstado = false
      if (filtros.agotado && esAgotado) cumpleEstado = true
      if (filtros.critico && esCritico) cumpleEstado = true
      
      // Si ambos son falsos, mostrar todos los estados
      if (!filtros.agotado && !filtros.critico) cumpleEstado = true
      
      if (!cumpleEstado) return false
      
      // Filtro por tipo
      const tiposSeleccionados = Object.keys(filtros.tipo).filter(t => filtros.tipo[t])
      if (tiposSeleccionados.length === 0) return false
      
      return tiposSeleccionados.includes(item.tipo)
    })
  })

  const resetFiltros = () => {
    filtros.agotado = true
    filtros.critico = true
    filtros.tipo.producto = true
    filtros.tipo.insumo = true
    filtros.tipo.servicio = true
  }

  return {
    filtros,
    itemsFiltrados,
    resetFiltros
  }
}
