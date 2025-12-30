import { ref, computed, onMounted } from 'vue'

/**
 * Composable para gestionar la selección de productos/servicios
 * Reutilizable en diferentes contextos (órdenes, ventas, etc.)
 */
export function useProductosSelector() {
  // Estado reactivo
  const items = ref([])
  const busqueda = ref('')
  const categoriaSeleccionada = ref(null)
  const pagina = ref(1)
  const porPagina = ref(8)
  const cargando = ref(false)
  const error = ref(null)

  // Computadas
  const categoriasDisponibles = computed(() => {
    const nombres = items.value
      .map(i => i.categoria?.nombre)
      .filter(Boolean)
    return [...new Set(nombres)]
  })

  const filtrados = computed(() => {
    let resultado = items.value

    // Filtro por búsqueda
    if (busqueda.value?.trim()) {
      const texto = busqueda.value.toLowerCase()
      resultado = resultado.filter(i =>
        i.nombre.toLowerCase().includes(texto) ||
        i.tipo.toLowerCase().includes(texto) ||
        (i.codigo_barras && i.codigo_barras.toLowerCase().includes(texto)) ||
        (i.categoria?.nombre && i.categoria.nombre.toLowerCase().includes(texto))
      )
    }

    // Filtro por categoría
    if (categoriaSeleccionada.value) {
      resultado = resultado.filter(i => 
        i.categoria?.nombre === categoriaSeleccionada.value
      )
    }

    return resultado
  })

  const paginados = computed(() => {
    const ini = (pagina.value - 1) * porPagina.value
    return filtrados.value.slice(ini, ini + porPagina.value)
  })

  const totalPaginas = computed(() => {
    return Math.ceil(filtrados.value.length / porPagina.value)
  })

  // Métodos
  async function cargarItems() {
    try {
      cargando.value = true
      error.value = null
      const apiBase = process.env.VUE_APP_API_URL
      const res = await fetch(`${apiBase}/items/all`)
      
      if (!res.ok) {
        throw new Error('Error al cargar productos')
      }
      
      const data = await res.json()
      items.value = data
    } catch (err) {
      console.error('Error al cargar items:', err)
      error.value = err.message
    } finally {
      cargando.value = false
    }
  }

  function cambiarPagina(nuevaPagina) {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
      pagina.value = nuevaPagina
    }
  }

  function limpiarFiltros() {
    busqueda.value = ''
    categoriaSeleccionada.value = null
    pagina.value = 1
  }

  function getTipoColor(tipo) {
    return tipo === 'producto' ? 'blue' : 'green'
  }

  function getTipoIcon(tipo) {
    return tipo === 'producto' ? 'mdi-package' : 'mdi-tools'
  }

  function getStockColor(stock) {
    if (stock === null || stock === undefined) return 'grey'
    if (stock <= 0) return 'error'
    if (stock < 10) return 'warning'
    return 'success'
  }

  // Watchers
  function watchBusqueda() {
    pagina.value = 1
  }

  function watchCategoria() {
    pagina.value = 1
  }

  return {
    // Estado
    items,
    busqueda,
    categoriaSeleccionada,
    pagina,
    porPagina,
    cargando,
    error,

    // Computadas
    categoriasDisponibles,
    filtrados,
    paginados,
    totalPaginas,

    // Métodos
    cargarItems,
    cambiarPagina,
    limpiarFiltros,
    getTipoColor,
    getTipoIcon,
    getStockColor,
    watchBusqueda,
    watchCategoria
  }
}
