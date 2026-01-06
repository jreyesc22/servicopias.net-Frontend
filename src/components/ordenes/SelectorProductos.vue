<template>
  <v-card elevation="2" class="selector-productos">
    <!-- Header con gradiente -->
    <v-card-title 
      class="header-card d-flex align-center" 
      :style="{ background: headerConfig.gradiente }"
    >
      <v-icon class="mr-3">{{ headerConfig.icono }}</v-icon>
      <span>{{ headerConfig.titulo }}</span>
      <v-spacer />
      <v-chip color="white" variant="outlined" size="small">
        {{ headerConfig.contadorTexto }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Filtros mejorados -->
      <v-row dense align="center" class="mb-4">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="busqueda"
            label="Buscar por nombre o servicio"
            density="compact"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-magnify"
            @update:modelValue="watchBusqueda"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            block
            color="grey-darken-1"
            variant="text"
            prepend-icon="mdi-filter-off"
            @click="limpiarFiltros"
          >
            Limpiar Filtros
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filtro de categorías con iconos -->
      <v-row dense class="mb-4">
        <v-col cols="12">
          <div class="filter-label mb-2">Filtrar por categoría:</div>
          <div class="chips-horizontal-scroll">
            <v-chip-group
              v-model="categoriaSeleccionada"
              selected-class="chip-selected"
              @update:modelValue="watchCategoria"
            >
              <v-chip
                v-for="cat in categoriasDisponibles"
                :key="cat"
                :value="cat"
                :prepend-icon="getCategoriaIcon(cat)"
                variant="outlined"
                filter
                class="filter-chip"
              >
                {{ cat }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-col>
      </v-row>

      <!-- Loading state -->
      <div v-if="cargando" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">Cargando productos...</p>
      </div>

      <!-- Error state -->
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Empty state -->
      <v-alert v-else-if="filtrados.length === 0" :type="emptyConfig.color" variant="tonal" class="mb-4">
        <v-icon start>{{ emptyConfig.icono }}</v-icon>
        {{ emptyConfig.mensaje }}
      </v-alert>

      <!-- Tabla de productos -->
      <v-table v-else density="comfortable" class="elevation-1">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Agregar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginados" :key="item.id" class="producto-row">
            <td>
              <div class="d-flex align-center">
                <v-avatar 
                  v-if="item.imagen_url" 
                  size="32" 
                  class="mr-2"
                  rounded="sm"
                >
                  <v-img :src="resolveMediaUrl(item.imagen_url)" :alt="item.nombre" cover />
                </v-avatar>
                <v-icon v-else class="mr-2" color="grey-lighten-1" size="32">
                  mdi-image-off-outline
                </v-icon>
                <span class="font-weight-medium">{{ item.nombre }}</span>
              </div>
            </td>
            <td class="font-weight-bold text-primary">
              Q {{ Number(item.precio).toFixed(2) }}
            </td>
            <td>
              <v-chip 
                v-if="item.tipo === 'producto'"
                :color="getStockColor(item.stock)" 
                size="small" 
                variant="tonal"
              >
                {{ item.stock }}
              </v-chip>
              <span v-else class="text-grey">-</span>
            </td>
            <td class="text-center">
              <v-text-field
                v-model.number="cantidades[item.id]"
                type="number"
                min="1"
                :max="item.tipo === 'servicio' ? 999 : item.stock"
                hide-details
                density="compact"
                variant="outlined"
                class="campo-cantidad"
                style="width: 90px; margin: 0 auto;"
              />
            </td>
            <td class="text-center">
              <v-tooltip text="Agregar a la orden">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    v-bind="props"
                    @click="agregar(item)"
                    :disabled="item.tipo === 'producto' && item.stock <= 0"
                  >
                    <v-icon size="small">mdi-cart-plus</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Paginación -->
      <div v-if="filtrados.length > 0" class="d-flex justify-space-between align-center mt-4">
        <div class="text-caption text-grey">
          {{ paginacionInfo.texto }}
        </div>
        <div class="d-flex align-center">
          <v-btn 
            icon 
            size="small" 
            @click="cambiarPagina(pagina - 1)" 
            :disabled="pagina <= 1"
            variant="text"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <span class="mx-3 text-body-2">
            Página {{ paginacionInfo.paginaActual }} / {{ paginacionInfo.totalPaginas }}
          </span>
          <v-btn 
            icon 
            size="small" 
            @click="cambiarPagina(pagina + 1)" 
            :disabled="pagina >= totalPaginas"
            variant="text"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- Snackbar de confirmación -->
    <v-snackbar v-model="mensajeVisible" :timeout="2000" color="success" location="top">
      <v-icon start>mdi-check-circle</v-icon>
      {{ mensaje }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useProductosSelector } from '../composables/useProductosSelector'
import { useCardUI } from '../composables/useCardUI'
import { resolveMediaUrl } from '@/utils/mediaUrl'

// Composable de productos
const {
  items,
  busqueda,
  categoriaSeleccionada,
  pagina,
  porPagina,
  cargando,
  error,
  categoriasDisponibles,
  filtrados,
  paginados,
  totalPaginas,
  cargarItems,
  cambiarPagina,
  limpiarFiltros,
  getTipoColor,
  getTipoIcon,
  getStockColor,
  watchBusqueda,
  watchCategoria
} = useProductosSelector()

// Composable de UI
const {
  getHeaderConfig,
  getIcono,
  formatearMoneda,
  getPaginacionTexto,
  getEmptyStateConfig
} = useCardUI()

// Configuración del header
const headerConfig = computed(() => getHeaderConfig({
  tipo: 'primary',
  icono: 'carrito',
  titulo: 'Seleccionar Productos',
  contador: filtrados.value.length,
  contadorTexto: `${filtrados.value.length} disponibles`
}))

// Config de paginación
const paginacionInfo = computed(() => 
  getPaginacionTexto(pagina.value, porPagina.value, filtrados.value.length)
)

// Config empty state
const emptyConfig = getEmptyStateConfig('noResultados')

// Función para obtener icono de categoría basado en el nombre real
function getCategoriaIcon(categoria) {
  if (!categoria) return 'mdi-shape'
  
  const nombre = categoria.toLowerCase()
  
  // Mapeo basado en palabras clave del nombre de la categoría
  if (nombre.includes('impresión') || nombre.includes('impresion') || nombre.includes('imprimir')) {
    return 'mdi-printer'
  }
  if (nombre.includes('encuadernado') || nombre.includes('encuadernar') || nombre.includes('enc')) {
    return 'mdi-book-open-page-variant'
  }
  if (nombre.includes('fotocopia') || nombre.includes('copia')) {
    return 'mdi-content-copy'
  }
  if (nombre.includes('ampliación') || nombre.includes('ampliacion') || nombre.includes('ampliar')) {
    return 'mdi-image-size-select-large'
  }
  if (nombre.includes('laminado') || nombre.includes('laminar')) {
    return 'mdi-rectangle-outline'
  }
  if (nombre.includes('etiqueta') || nombre.includes('sticker')) {
    return 'mdi-label'
  }
  if (nombre.includes('papelería') || nombre.includes('papeleria')) {
    return 'mdi-notebook'
  }
  if (nombre.includes('diseño') || nombre.includes('diseno') || nombre.includes('gráfico')) {
    return 'mdi-palette'
  }
  
  // Icono por defecto
  return 'mdi-shape'
}

// Props & Emits
const emit = defineEmits(['agregar'])

// Estado local
const cantidades = ref({})
const mensaje = ref('')
const mensajeVisible = ref(false)

// Inicializar cantidades cuando se cargan los items
watch(items, (newItems) => {
  newItems.forEach(i => {
    if (!cantidades.value[i.id]) {
      cantidades.value[i.id] = 1
    }
  })
}, { immediate: true })

// Métodos
function agregar(item) {
  const cantidad = cantidades.value[item.id] || 1

  if (cantidad < 1) {
    mostrarMensaje(" Cantidad inválida", false)
    return
  }

  if (item.tipo === 'producto' && cantidad > item.stock) {
    mostrarMensaje(" La cantidad supera el stock disponible", false)
    return
  }

  emit('agregar', {
    itemId: item.id,
    nombre: item.nombre,
    cantidad,
    precio_unitario: parseFloat(item.precio),
    subtotal: cantidad * parseFloat(item.precio)
  })

  mostrarMensaje(`✓ ${item.nombre} agregado`)
  cantidades.value[item.id] = 1
}

function mostrarMensaje(msg) {
  mensaje.value = msg
  mensajeVisible.value = true
}

// Lifecycle
onMounted(() => {
  cargarItems()
})
</script>

<style scoped>
.selector-productos {
  margin-top: var(--spacing-md);
}

/* Estilos de UI compartidos con design-system */
.text-white {
  color: var(--color-white) !important;
}

.v-table {
  font-size: var(--font-size-base);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-small);
}

.v-table thead tr th {
  background-color: var(--color-grey-50);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
}

.producto-row {
  transition: background-color var(--transition-fast);
}

.producto-row:hover {
  background-color: var(--color-grey-50);
}

/* Estilos específicos del componente */
.campo-cantidad :deep(input) {
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 767px) {
  .v-table {
    font-size: var(--font-size-sm);
  }
}
</style>
