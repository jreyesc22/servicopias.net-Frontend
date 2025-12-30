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
        </v-card-text>
      </v-card>

      <!-- Detalles Adicionales -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-info text-white d-flex align-center">
          <v-icon class="mr-3">mdi-text-box-multiple-outline</v-icon>
          <span>Detalles Adicionales</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <DetailsSection
            :local-item="localItem"
            :loading="loading"
            :categorias="categorias"
          />
        </v-card-text>
      </v-card>

      <!-- Archivos -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-success text-white d-flex align-center">
          <v-icon class="mr-3">mdi-file-upload-outline</v-icon>
          <span>Archivos Adjuntos</span>
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

    <!-- Snackbars -->
    <NotificationSnackbars :snackbar="snackbar" />
  </v-container>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'

// Importar composables 
import { useFileUpload } from '../composables/useFileUpload'
import { useFormValidation } from '../composables/useFormValidation'
import { useApiService } from '../composables/useApiService'
import { useNotifications } from '../composables/useNotifications'

// Importar componentes 
import BasicInfoSection from './BasicInfoSection.vue'
import DetailsSection from './detailsSection.vue'
import FileUploadSection from './FileUploadSection.vue'
import ActionButtons from './ActionButtons.vue'
import NotificationSnackbars from './NotificationSnackbars.vue'

export default {
  name: 'FormProductoServicio',
  components: {
    BasicInfoSection,
    DetailsSection,
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
      categoriaId: ''
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
        categoriaId: ''
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
      
      // Archivos
      archivos,
      previews,
      erroresArchivos,
      
      // Validación
      validationRules,
      
      // Notificaciones
      snackbar,
      showMessage,
      
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
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.v-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 1.5rem;
}

.v-card-title .v-icon {
  color: white !important;
}

/* Colores de secciones */
.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.bg-info {
  background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
}

.bg-success {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
}

.text-white {
  color: white !important;
}

/* Responsive */
@media (max-width: 767px) {
  .v-card-title {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
  
  .v-card-text {
    padding: 1rem !important;
  }
}
</style>