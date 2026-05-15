<template>
  <div class="form-section">
    <!-- Buscador Superior -->
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Buscar Insumos..."
      variant="outlined"
      density="comfortable"
      hide-details
      class="mb-6"
      clearable
    ></v-text-field>

    <!-- Grid de Tarjetas Visuales -->
    <v-row v-if="!loadingInsumos">
      <v-col 
        v-for="insumo in insumosFiltrados" 
        :key="insumo.id" 
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card 
          class="insumo-card h-100 d-flex flex-column" 
          :class="{ 'selected-card': cantidadEnReceta(insumo.id) > 0 }"
          elevation="2"
        >
          <!-- Imagen del Insumo -->
          <v-img
            :src="getImagen(insumo.imagen_url)"
            height="120"
            cover
            class="bg-grey-lighten-2 position-relative"
          >
            <div 
              v-if="cantidadEnReceta(insumo.id) > 0" 
              class="badge-cantidad position-absolute top-0 right-0 ma-2 bg-primary text-white px-2 py-1 rounded"
            >
              x{{ cantidadEnReceta(insumo.id) }}
            </div>
          </v-img>

          <v-card-text class="flex-grow-1 pa-3 text-center">
            <h4 class="text-subtitle-1 font-weight-bold mb-1 text-truncate" :title="insumo.nombre">
              {{ insumo.nombre }}
            </h4>
            <div class="d-flex justify-space-between align-center px-2 mt-2">
              <span class="text-caption text-grey-darken-1">Stock: {{ insumo.stock || 0 }}</span>
              <span class="text-subtitle-2 text-primary font-weight-bold">Q{{ Number(insumo.precio).toFixed(2) }}</span>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Controles de Cantidad -->
          <v-card-actions class="pa-2 justify-center bg-grey-lighten-4">
            <template v-if="cantidadEnReceta(insumo.id) > 0">
              <v-btn icon="mdi-minus" size="small" color="error" variant="text" @click="decrementarInsumo(insumo)"></v-btn>
              <span class="mx-3 font-weight-bold">{{ cantidadEnReceta(insumo.id) }}</span>
              <v-btn icon="mdi-plus" size="small" color="success" variant="text" @click="incrementarInsumo(insumo)"></v-btn>
            </template>
            <template v-else>
              <v-btn 
                block 
                color="primary" 
                variant="tonal" 
                prepend-icon="mdi-plus"
                @click="incrementarInsumo(insumo)"
              >
                Agregar
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <div v-else class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-alert v-if="!loadingInsumos && insumosFiltrados.length === 0" type="info" variant="tonal" density="compact" class="mt-4">
      No se encontraron insumos.
    </v-alert>

    <!-- Resumen Inferior -->
    <v-card class="mt-6 bg-blue-grey-lighten-5" variant="outlined" v-if="insumosAgregados.length > 0">
      <v-card-text class="d-flex justify-space-between align-center">
        <div>
          <strong>Insumos seleccionados:</strong> {{ insumosAgregados.length }}
        </div>
        <div class="text-h6 text-primary">
          Costo Total: Q{{ costoTotalInsumos }}
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useApiService } from '../composables/useApiService'

export default {
  name: 'InsumosSection',
  props: {
    localItem: { type: Object, required: true }
  },
  setup(props) {
    const { cargarInsumos } = useApiService()
    
    const loadingInsumos = ref(false)
    const insumosDisponibles = ref([])
    const searchQuery = ref('')
    const apiUrl = process.env.VUE_APP_API_URL

    const getImagen = (url) => {
      if (url && url !== '') {
        return url.startsWith('http') ? url : `${apiUrl?.replace('/api', '') || ''}${url}`
      }
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23eeeeee%22%2F%3E%3Cpath%20d%3D%22M100%2060l40%2080H60z%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'
    }

    const loadInsumos = async () => {
      loadingInsumos.value = true
      try {
        // useApiService.js filtrará por insumos
        insumosDisponibles.value = await cargarInsumos()
      } catch (error) {
        console.error("Error al cargar insumos", error)
      } finally {
        loadingInsumos.value = false
      }
    }

    const insumosFiltrados = computed(() => {
      if (!searchQuery.value) return insumosDisponibles.value
      const query = searchQuery.value.toLowerCase()
      return insumosDisponibles.value.filter(i => 
        i.nombre.toLowerCase().includes(query)
      )
    })

    const insumosAgregados = computed(() => {
      return props.localItem.insumos || []
    })

    const costoTotalInsumos = computed(() => {
      let total = 0
      for (const insumo of insumosAgregados.value) {
        // Encontrar el precio actual en la lista de disponibles
        const infoInsumo = insumosDisponibles.value.find(i => i.id === (insumo.insumo_id || insumo.id))
        const precio = infoInsumo ? Number(infoInsumo.precio) : Number(insumo.precio || 0)
        total += precio * Number(insumo.cantidad)
      }
      return total.toFixed(2)
    })

    const cantidadEnReceta = (insumoId) => {
      if (!props.localItem.insumos) return 0
      const item = props.localItem.insumos.find(i => (i.insumo_id || i.id) === insumoId)
      return item ? Number(item.cantidad) : 0
    }

    const incrementarInsumo = (insumo) => {
      if (!props.localItem.insumos) {
        props.localItem.insumos = []
      }
      
      const existe = props.localItem.insumos.find(i => (i.insumo_id || i.id) === insumo.id)
      if (existe) {
        existe.cantidad += 1
      } else {
        props.localItem.insumos.push({
          id: insumo.id,
          insumo_id: insumo.id,
          nombre: insumo.nombre,
          precio: insumo.precio,
          cantidad: 1
        })
      }
    }

    const decrementarInsumo = (insumo) => {
      if (!props.localItem.insumos) return
      
      const index = props.localItem.insumos.findIndex(i => (i.insumo_id || i.id) === insumo.id)
      if (index !== -1) {
        if (props.localItem.insumos[index].cantidad > 1) {
          props.localItem.insumos[index].cantidad -= 1
        } else {
          props.localItem.insumos.splice(index, 1)
        }
      }
    }

    onMounted(() => {
      loadInsumos()
    })

    return {
      loadingInsumos,
      searchQuery,
      insumosFiltrados,
      insumosAgregados,
      costoTotalInsumos,
      getImagen,
      cantidadEnReceta,
      incrementarInsumo,
      decrementarInsumo
    }
  }
}
</script>

<style scoped>
.insumo-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}
.insumo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
}
.selected-card {
  border-color: var(--v-primary-base, #1976D2);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2) !important;
}
.badge-cantidad {
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>
