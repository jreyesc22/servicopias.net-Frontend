<template>
  <div class="form-section">
    <v-row class="align-center mb-4">
      <v-col cols="12" sm="6" md="5">
        <v-autocomplete
          v-model="insumoSeleccionado"
          :items="insumosDisponibles"
          item-title="nombre"
          item-value="id"
          label="Buscar Insumo"
          variant="outlined"
          density="comfortable"
          hide-details
          return-object
          prepend-inner-icon="mdi-magnify"
          :loading="loadingInsumos"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.nombre" :subtitle="`Stock: ${item.raw.stock} | Precio: Q${item.raw.precio}`"></v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" sm="3" md="3">
        <v-text-field
          v-model.number="cantidad"
          label="Cantidad"
          type="number"
          step="0.01"
          min="0.01"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="3" md="4" class="text-right">
        <v-btn 
          color="primary" 
          @click="agregarInsumo" 
          :disabled="!insumoSeleccionado || cantidad <= 0"
          prepend-icon="mdi-plus"
        >
          Agregar
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      v-if="localItem.insumos && localItem.insumos.length > 0"
      :items="localItem.insumos"
      :headers="headers"
      density="compact"
      class="elevation-1"
      hide-default-footer
    >
      <template v-slot:item.cantidad="{ item }">
        <v-text-field
          v-model.number="item.cantidad"
          type="number"
          step="0.01"
          min="0.01"
          density="compact"
          hide-details
          variant="underlined"
          class="centered-input"
          style="width: 80px"
        ></v-text-field>
      </template>
      <template v-slot:item.acciones="{ item, index }">
        <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="quitarInsumo(index)"></v-btn>
      </template>
    </v-data-table>
    
    <v-alert v-else type="info" variant="tonal" density="compact" class="mt-2">
      No hay insumos agregados a la receta de este producto/servicio.
    </v-alert>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
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
    const insumoSeleccionado = ref(null)
    const cantidad = ref(1)

    const headers = [
      { title: 'Insumo', key: 'nombre', sortable: false },
      { title: 'Cantidad', key: 'cantidad', sortable: false, align: 'center' },
      { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' }
    ]

    const loadInsumos = async () => {
      loadingInsumos.value = true
      try {
        insumosDisponibles.value = await cargarInsumos()
      } catch (error) {
        console.error("Error al cargar insumos", error)
      } finally {
        loadingInsumos.value = false
      }
    }

    const agregarInsumo = () => {
      if (!insumoSeleccionado.value || cantidad.value <= 0) return

      if (!props.localItem.insumos) {
        props.localItem.insumos = []
      }

      // Check if already exists
      const existe = props.localItem.insumos.find(i => (i.insumo_id || i.id) === insumoSeleccionado.value.id)
      if (existe) {
        existe.cantidad += Number(cantidad.value)
      } else {
        props.localItem.insumos.push({
          id: insumoSeleccionado.value.id,
          insumo_id: insumoSeleccionado.value.id, // For compatibility
          nombre: insumoSeleccionado.value.nombre,
          cantidad: Number(cantidad.value)
        })
      }

      // Reset fields
      insumoSeleccionado.value = null
      cantidad.value = 1
    }

    const quitarInsumo = (index) => {
      props.localItem.insumos.splice(index, 1)
    }

    onMounted(() => {
      loadInsumos()
    })

    return {
      loadingInsumos,
      insumosDisponibles,
      insumoSeleccionado,
      cantidad,
      headers,
      agregarInsumo,
      quitarInsumo
    }
  }
}
</script>

<style scoped>
.centered-input :deep(input) {
  text-align: center;
}
</style>
