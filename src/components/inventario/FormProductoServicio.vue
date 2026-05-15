<template>
  <v-container fluid class="pa-0">
    <v-form ref="form" v-model="formValido" @submit.prevent="guardar">
      
      <!-- Información Básica -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-primary text-white d-flex align-center">
          <v-icon class="mr-3">mdi-information-outline</v-icon>
          <span>Información Básica</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <BasicInfoSection
            :local-item="localItem"
            :categorias="categorias"
            :loading="loading"
            :loading-categorias="loadingCategorias"
            :duplicado-error="duplicadoError"
            :rules="validationRules"
            @validate-name="handleValidateName"
          />

          <v-divider class="my-4"></v-divider>

          <!-- Opciones Adicionales Modales -->
          <div class="d-flex flex-wrap gap-4 justify-center">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  color="info" 
                  icon="mdi-text-box-multiple-outline" 
                  @click="dialogDetalles = true" 
                  variant="tonal"
                  size="large"
                ></v-btn>
              </template>
              <span>Detalles Adicionales</span>
            </v-tooltip>

            <v-tooltip location="top" v-if="localItem.tipo === 'servicio' || localItem.tipo === 'producto'">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  color="warning" 
                  icon="mdi-format-list-bulleted" 
                  @click="dialogInsumos = true" 
                  variant="tonal"
                  size="large"
                ></v-btn>
              </template>
              <span>Insumos Adicionales</span>
            </v-tooltip>

            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  color="success" 
                  icon="mdi-file-upload-outline" 
                  @click="dialogArchivos = true" 
                  variant="tonal"
                  size="large"
                ></v-btn>
              </template>
              <span>Archivos Adjuntos</span>
            </v-tooltip>
          </div>
        </v-card-text>
      </v-card>

      <!-- Card Resumen de Insumos (Mostrar solo si hay insumos agregados) -->
      <v-card v-if="localItem.insumos && localItem.insumos.length > 0" class="mb-4 bg-blue-grey-lighten-5" elevation="2">
        <v-card-title class="bg-warning text-white d-flex align-center">
          <v-icon class="mr-3">mdi-package-multiple-outline</v-icon>
          <span>Insumos Agregados</span>
          <v-spacer></v-spacer>
          <v-chip label size="small" variant="outlined" class="text-white border-white">
            {{ localItem.insumos.length }}
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-4">
          <!-- Lista de insumos en tabla compacta -->
          <v-table density="compact" class="elevation-0">
            <thead>
              <tr class="bg-grey-lighten-3">
                <th>Insumo</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(insumo, index) in localItem.insumos" :key="index">
                <td class="font-weight-medium">{{ insumo.nombre }}</td>
                <td class="text-right">{{ insumo.cantidad }}</td>
                <td class="text-right font-weight-bold text-primary">
                  Q{{ (Number(insumo.precio || 0) * Number(insumo.cantidad)).toFixed(2) }}
                </td>
              </tr>
              <tr class="bg-blue-grey-lighten-3 font-weight-bold">
                <td colspan="2" class="text-right pr-2">
                  <v-icon size="small" class="mr-1">mdi-calculator</v-icon> Costo Total Insumos:
                </td>
                <td class="text-right text-h6 text-success">
                  Q{{ costoTotalInsumos }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Alert de referencia -->
          <v-alert type="success" variant="tonal" density="compact" class="mt-4" icon="mdi-check-circle">
            Los insumos están listos para guardar. Se almacenarán cuando completes el formulario.
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Botones de Acción -->
      <v-card elevation="2">
        <v-card-text class="pa-4">
          <ActionButtons
            :loading="loading"
            :form-valido="formValido"
            :duplicado-error="duplicadoError"
            @save="guardar"
            @cancel="$emit('cerrar')"
          />
        </v-card-text>
      </v-card>
    </v-form>

    <!-- Dialog Detalles Adicionales -->
    <v-dialog v-model="dialogDetalles" max-width="800px" persistent>
      <v-card>
        <v-card-title class="bg-info text-white d-flex align-center">
          <v-icon class="mr-3">mdi-text-box-multiple-outline</v-icon>
          <span>Detalles Adicionales</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogDetalles = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <DetailsSection
            :local-item="localItem"
            :loading="loading"
            :categorias="categorias"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" variant="text" @click="dialogDetalles = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Insumos Adicionales -->
    <v-dialog v-model="dialogInsumos" max-width="800px" persistent>
      <v-card>
        <v-card-title class="bg-warning text-white d-flex align-center">
          <v-icon class="mr-3">mdi-format-list-bulleted</v-icon>
          <span>Insumos Adicionales</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogInsumos = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <InsumosSection
            :local-item="localItem"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="warning" variant="text" @click="dialogInsumos = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Archivos Adjuntos -->
    <v-dialog v-model="dialogArchivos" max-width="800px" persistent>
      <v-card>
        <v-card-title class="bg-success text-white d-flex align-center">
          <v-icon class="mr-3">mdi-file-upload-outline</v-icon>
          <span>Archivos Adjuntos</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogArchivos = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <FileUploadSection
            :local-item="localItem"
            :archivos="archivos"
            :previews="previews"
            :errores-archivos="erroresArchivos"
            :loading="loading"
            @file-upload="handleFileUpload"
            @remove-file="handleRemoveFile"
            @show-message="showMessage"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" variant="text" @click="dialogArchivos = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbars -->
    <NotificationSnackbars :snackbar="snackbar" />
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue'
import { debounce } from 'lodash'

// Importar composables 
import { useFileUpload } from '../composables/useFileUpload'
import { useFormValidation } from '../composables/useFormValidation'
import { useApiService } from '../composables/useApiService'
import { useNotifications } from '../composables/useNotifications'

// Importar componentes 
import BasicInfoSection from './BasicInfoSection.vue'
import DetailsSection from './detailsSection.vue'
import InsumosSection from './InsumosSection.vue'
import FileUploadSection from './FileUploadSection.vue'
import ActionButtons from './ActionButtons.vue'
import NotificationSnackbars from './NotificationSnackbars.vue'

export default {
  name: 'FormProductoServicio',
  components: {
    BasicInfoSection,
    DetailsSection,
    InsumosSection,
    FileUploadSection,
    ActionButtons,
    NotificationSnackbars
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  emits: ['guardar', 'cerrar'],
  setup(props, { emit }) {
    // Composables
    const {
      archivos,
      previews,
      erroresArchivos,
      handleFile,
      eliminarArchivo,
      resetArchivos
    } = useFileUpload()

    const {
      duplicadoError,
      loading,
      validarNombreDebounced,
      validarDuplicados,
      rules: validationRules
    } = useFormValidation()

    const {
      subirArchivos,
      cargarCategorias,
      guardarItem
    } = useApiService()

    const {
      snackbar,
      showMessage,
      mostrarError,
      mostrarExito
    } = useNotifications()

    // Estado del formulario
    const formValido = ref(false)
    const form = ref(null)
    const loadingCategorias = ref(false)
    const categorias = ref([])
    
    // Estado de los Modales
    const dialogDetalles = ref(false)
    const dialogInsumos = ref(false)
    const dialogArchivos = ref(false)

    // Item local
    const localItem = ref({
      nombre: '',
      tipo: 'producto',
      precio: 0,
      stock: 0,
      codigo_barras: null,
      descripcion: '',
      imagen_url: '',
      pdf_url: '',
      categoriaId: '',
      insumos: []
    })

    // Métodos - DEFINIR ANTES DEL WATCHER
    const resetForm = () => {
      localItem.value = {
        nombre: '',
        tipo: 'producto',
        precio: 0,
        stock: 0,
        codigo_barras: null,
        descripcion: '',
        imagen_url: '',
        pdf_url: '',
        categoriaId: '',
        insumos: []
      }
      resetArchivos()
      duplicadoError.value = false
      form.value?.resetValidation()
    }

    // Watchers - DESPUÉS DE DEFINIR LOS MÉTODOS
    watch(() => props.item, (newItem) => {
      if (newItem) {
        localItem.value = { ...newItem }
      } else {
        resetForm()
      }
    }, { immediate: true, deep: true })

    const handleValidateName = (nombre) => {
      validarNombreDebounced(nombre, localItem.value.id)
    }

    const handleFileUpload = (event, tipo) => {
      const result = handleFile(event, tipo)
      if (result?.success) {
        showMessage({ type: 'info', message: result.message })
      }
      return result
    }

    const handleRemoveFile = (tipo) => {
      eliminarArchivo(tipo, localItem.value)
    }

    const loadCategorias = async () => {
      loadingCategorias.value = true
      try {
        categorias.value = await cargarCategorias()
      } catch (error) {
        mostrarError('Error al cargar categorías')
      } finally {
        loadingCategorias.value = false
      }
    }

    const guardar = async () => {
      loading.value = true
      
      try {
        // Validar formulario
        const { valid } = await form.value.validate()
        if (!valid) {
          mostrarError('Por favor complete todos los campos requeridos')
          return
        }

        // Validar duplicados
        await validarDuplicados(localItem.value)

        // Subir archivos
        if (archivos.value.imagen || archivos.value.pdf) {
          const urls = await subirArchivos(archivos.value)
          if (urls.imagen_url) localItem.value.imagen_url = urls.imagen_url
          if (urls.pdf_url) localItem.value.pdf_url = urls.pdf_url
        }

        // Guardar item
        await guardarItem(localItem.value, !!props.item)

        const successMsg = props.item ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
        mostrarExito(successMsg)
        emit('guardar')
        setTimeout(() => emit('cerrar'), 1500)
        
      } catch (error) {
        console.error('Error guardando:', error)
        mostrarError(error.message || 'Error al guardar el item')
      } finally {
        loading.value = false
      }
    }

    // Computed properties
    const costoTotalInsumos = computed(() => {
      if (!localItem.value.insumos || localItem.value.insumos.length === 0) {
        return '0.00'
      }
      const total = localItem.value.insumos.reduce((sum, insumo) => {
        const precio = Number(insumo.precio || 0)
        const cantidad = Number(insumo.cantidad || 1)
        return sum + (precio * cantidad)
      }, 0)
      return total.toFixed(2)
    })

    // Lifecycle
    onMounted(() => {
      loadCategorias()
    })

    return {
      // Estado
      formValido,
      form,
      loading,
      loadingCategorias,
      duplicadoError,
      localItem,
      categorias,
      
      // Modales
      dialogDetalles,
      dialogInsumos,
      dialogArchivos,
      
      // Archivos
      archivos,
      previews,
      erroresArchivos,
      
      // Validación
      validationRules,
      
      // Notificaciones
      snackbar,
      showMessage,
      
      // Computed
      costoTotalInsumos,
      
      // Métodos
      handleValidateName,
      handleFileUpload,
      handleRemoveFile,
      guardar
    }
  }
}
</script>

<style scoped>
/* Estilos consistentes con el resto del frontend */
.v-card {
  border-radius: var(--border-radius-sm, 8px) !important;
  transition: all var(--transition-base, 0.3s ease);
}

.v-card:hover {
  box-shadow: var(--shadow-hover, 0 4px 12px rgba(0, 0, 0, 0.15)) !important;
}

.v-card-title {
  font-size: var(--text-lg, 1.125rem);
  font-weight: 600;
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
}

.v-card-title .v-icon {
  color: var(--surface-color, white) !important;
}

/* Colores de secciones */
.bg-primary {
  background: var(--gradient-primary, linear-gradient(135deg, #1976d2 0%, #1565c0 100%));
}

.bg-info {
  background: var(--gradient-info, linear-gradient(135deg, #0288d1 0%, #01579b 100%));
}

.bg-success {
  background: var(--gradient-success, linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%));
}

.bg-warning {
  background: var(--gradient-warning, linear-gradient(135deg, #f57c00 0%, #e65100 100%));
}

.text-white {
  color: var(--surface-color, white) !important;
}

/* Responsive */
@media (max-width: 767px) {
  .v-card-title {
    font-size: var(--text-base, 0.95rem);
    padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
  }
  
  .v-card-text {
    padding: var(--spacing-md, 1rem) !important;
  }
}
</style>