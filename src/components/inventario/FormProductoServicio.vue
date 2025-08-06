<template>
  <v-container fluid class="form-container">
    <v-card class="form-card" elevation="3">
      <!-- Header -->
      <FormHeader 
        :item="item" 
        :tipo="localItem.tipo" 
      />

      <v-divider />

      <v-card-text class="form-content">
        <v-form ref="form" v-model="formValido" @submit.prevent="guardar">
          
          <!-- Información Básica -->
          <BasicInfoSection
            :local-item="localItem"
            :categorias="categorias"
            :loading="loading"
            :loading-categorias="loadingCategorias"
            :duplicado-error="duplicadoError"
            :rules="validationRules"
            @validate-name="handleValidateName"
          />

          <!-- Detalles Adicionales -->
          <DetailsSection
            :local-item="localItem"
            :loading="loading"
          />

          <!-- Archivos -->
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

          <!-- Botones -->
          <ActionButtons
            :loading="loading"
            :form-valido="formValido"
            :duplicado-error="duplicadoError"
            @save="guardar"
            @cancel="$emit('cerrar')"
          />
        </v-form>
      </v-card-text>

      <!-- Snackbars -->
      <NotificationSnackbars :snackbar="snackbar" />
    </v-card>
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
import FormHeader from './FormHeader.vue'
import BasicInfoSection from './BasicInfoSection.vue'
import DetailsSection from './detailsSection.vue'  // ← CAMBIO AQUÍ
import FileUploadSection from './FileUploadSection.vue'
import ActionButtons from './ActionButtons.vue'
import NotificationSnackbars from './NotificationSnackbars.vue'

export default {
  name: 'FormProductoServicio',
  components: {
    FormHeader,
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
      codigo_barras: '',
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
        codigo_barras: '',
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
/* Solo los estilos específicos del componente principal */
.form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

.form-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 12px !important;
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #afec08 0%, #2ed156 100%);
  color: white !important;
  padding: 1.5rem 2rem;
}

.form-header .v-icon {
  color: white !important;
}

.form-content {
  padding: 2rem;
  background: #fafafa;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.section-title {
  color: #2b4968;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e3f2fd;
}

/* Responsive */
@media (max-width: 767px) {
  .form-container {
    padding: 1rem 0.5rem;
  }
  
  .form-header {
    padding: 1rem;
    text-align: center;
  }
  
  .form-header .text-h5 {
    font-size: 1.1rem !important;
  }
  
  .form-content {
    padding: 1rem;
  }
  
  .form-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-size: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>