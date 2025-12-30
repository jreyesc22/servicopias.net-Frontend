<template>
  <div class="form-section">
    <v-row>
      <!-- Código de Barras con Toggle -->
      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-2">
          <v-switch
            v-model="codigoBarrasActivo"
            color="primary"
            density="compact"
            hide-details
            :disabled="loading"
            @update:model-value="toggleCodigoBarras"
          >
            <template v-slot:label>
              <span class="text-body-2 font-weight-medium">
                <v-icon size="small" class="mr-1">mdi-barcode</v-icon>
                Usar Código de Barras
              </span>
            </template>
          </v-switch>
        </div>
        
        <v-text-field
          v-if="codigoBarrasActivo"
          v-model="localItem.codigo_barras"
          label="Código de Barras"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-barcode"
          placeholder="Ingrese el código de barras"
        />
        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          Código de barras desactivado
        </v-alert>
      </v-col>

      <v-col cols="12" md="6">
        <div class="d-flex align-center justify-center h-100">
          <v-chip-group>
            <v-chip 
              v-if="codigoBarrasActivo && localItem.codigo_barras" 
              color="success" 
              variant="tonal"
            >
              <v-icon start>mdi-check-circle</v-icon>
              Código configurado
            </v-chip>
            <v-chip 
              v-else-if="codigoBarrasActivo && !localItem.codigo_barras"
              color="warning" 
              variant="tonal"
            >
              <v-icon start>mdi-alert</v-icon>
              Pendiente de configurar
            </v-chip>
            <v-chip v-else color="grey" variant="tonal">
              <v-icon start>mdi-barcode-off</v-icon>
              Sin código de barras
            </v-chip>
          </v-chip-group>
        </div>
      </v-col>

      <!-- Descripción -->
      <v-col cols="12">
        <!-- Sugerencia para Material Didáctico -->
        <v-alert
          v-if="esMaterialDidactico"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div class="d-flex align-center">
            <v-icon color="purple" class="mr-2">mdi-school</v-icon>
            <div>
              <div class="font-weight-bold mb-1">Material Didáctico</div>
              <div class="text-caption">
                Sugerencia de formato: <strong>Centro de Estudio, Carrera, Grado, Sección, Docente, Bimestre</strong>
              </div>
            </div>
          </div>
        </v-alert>

        <!-- Textarea de Descripción -->
        <v-textarea
          v-model="localItem.descripcion"
          label="Descripción"
          rows="3"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-text"
          auto-grow
          :placeholder="esMaterialDidactico ? 'Ej: USAC, Ingeniería, 4to, A, Ing. Juan Pérez, Primer Bimestre' : 'Ingrese una descripción detallada del producto o servicio'"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'DetailsSection',
  props: {
    localItem: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    categorias: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const codigoBarrasActivo = ref(false)

    // Computed para verificar si es Material Didáctico
    const esMaterialDidactico = computed(() => {
      if (!props.categorias || props.categorias.length === 0) return false
      
      const categoriaSeleccionada = props.categorias.find(
        cat => cat.id === props.localItem.categoriaId
      )
      
      return categoriaSeleccionada?.nombre === 'Material Didáctico'
    })

    // Toggle del código de barras
    const toggleCodigoBarras = (valor) => {
      if (!valor) {
        props.localItem.codigo_barras = null
      }
    }

    // Inicializar al montar
    onMounted(() => {
      // Verificar si hay código de barras
      codigoBarrasActivo.value = !!props.localItem.codigo_barras
    })

    return {
      codigoBarrasActivo,
      esMaterialDidactico,
      toggleCodigoBarras
    }
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 0;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Roboto Mono', monospace;
  background: transparent;
  margin: 0;
  padding: 0;
}

.v-switch {
  margin-bottom: 0.5rem;
}

@media (max-width: 767px) {
  .form-section {
    padding: 0;
  }
}
</style>