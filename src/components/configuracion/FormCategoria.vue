<template>
  <v-card class="crear-categoria-card" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-plus-circle" class="mr-2" color="primary"></v-icon>
      <span>{{ modoEdicion ? 'Editar Categoría' : 'Nueva Categoría' }}</span>
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="formData.nombre"
          label="Nombre de la categoría"
          prepend-inner-icon="mdi-tag"
          :rules="[rules.required, rules.maxLength]"
          :disabled="procesando"
          variant="outlined"
          density="comfortable"
          placeholder="Ej. Papelería"
          counter="50"
          clearable
        />

        <v-textarea
          v-model="formData.descripcion"
          label="Descripción (opcional)"
          prepend-inner-icon="mdi-text"
          :disabled="procesando"
          variant="outlined"
          density="comfortable"
          placeholder="Descripción de la categoría..."
          rows="3"
          counter="200"
          clearable
        />

        <v-alert
          v-if="mensajeError"
          type="error"
          variant="tonal"
          closable
          @click:close="mensajeError = ''"
          class="mb-4"
        >
          {{ mensajeError }}
        </v-alert>

        <v-alert
          v-if="mensajeExito"
          type="success"
          variant="tonal"
          closable
          @click:close="mensajeExito = ''"
          class="mb-4"
        >
          {{ mensajeExito }}
        </v-alert>

        <div class="d-flex justify-end gap-2">
          <v-btn
            v-if="modoEdicion"
            color="grey"
            variant="text"
            @click="cancelarEdicion"
            :disabled="procesando"
          >
            Cancelar
          </v-btn>

          <v-btn
            type="submit"
            color="primary"
            :loading="procesando"
            :disabled="!formValido"
          >
            <v-icon start>{{ modoEdicion ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
            {{ modoEdicion ? 'Guardar Cambios' : 'Crear Categoría' }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  categoriaEditar: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['categoria-creada', 'categoria-actualizada', 'cancelar']);

// Refs
const formRef = ref(null);
const procesando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

// Form data
const formData = ref({
  nombre: '',
  descripcion: ''
});

// Modo edición
const modoEdicion = computed(() => !!props.categoriaEditar);

// Reglas de validación
const rules = {
  required: value => !!value?.trim() || 'Este campo es requerido',
  maxLength: value => !value || value.length <= 50 || 'Máximo 50 caracteres'
};

// Computed para validación del formulario
const formValido = computed(() => {
  return formData.value.nombre?.trim().length > 0 &&
         formData.value.nombre.length <= 50;
});

// Watch para cargar datos cuando se edita
watch(() => props.categoriaEditar, (nuevaCategoria) => {
  if (nuevaCategoria) {
    formData.value = {
      nombre: nuevaCategoria.nombre || '',
      descripcion: nuevaCategoria.descripcion || ''
    };
    mensajeError.value = '';
    mensajeExito.value = '';
  }
}, { immediate: true });

// Métodos
const handleSubmit = async () => {
  // Validar formulario
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  procesando.value = true;
  mensajeError.value = '';
  mensajeExito.value = '';

  try {
    const datosCategoria = {
      nombre: formData.value.nombre.trim(),
      descripcion: formData.value.descripcion?.trim() || ''
    };

    if (modoEdicion.value) {
      // Emitir evento para actualizar
      emit('categoria-actualizada', {
        id: props.categoriaEditar.id,
        ...datosCategoria
      });
      mensajeExito.value = 'Categoría actualizada correctamente';
    } else {
      // Emitir evento para crear
      emit('categoria-creada', datosCategoria);
      mensajeExito.value = 'Categoría creada correctamente';
      
      // Limpiar formulario solo si es creación
      limpiarFormulario();
    }

    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      mensajeExito.value = '';
    }, 3000);

  } catch (error) {
    console.error('Error en formulario:', error);
    mensajeError.value = error.message || 'Error al procesar la categoría';
  } finally {
    procesando.value = false;
  }
};

const limpiarFormulario = () => {
  formData.value = {
    nombre: '',
    descripcion: ''
  };
  formRef.value?.resetValidation();
  mensajeError.value = '';
};

const cancelarEdicion = () => {
  limpiarFormulario();
  emit('cancelar');
};

// Exponer métodos para uso externo
defineExpose({
  limpiarFormulario,
  mostrarError: (mensaje) => { mensajeError.value = mensaje; },
  mostrarExito: (mensaje) => { mensajeExito.value = mensaje; }
});
</script>

<style scoped>
.crear-categoria-card {
  margin-bottom: 16px;
}

.gap-2 {
  gap: 8px;
}
</style>
