<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <!-- Encabezado -->
        <div class="d-flex align-center mb-6">
          <v-icon icon="mdi-tag-multiple" size="32" color="primary" class="mr-3"></v-icon>
          <div>
            <h1 class="text-h5 font-weight-bold">Gestión de Categorías</h1>
            <p class="text-subtitle-1 text-grey">Crea, edita y administra las categorías del inventario</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Formulario de crear/editar -->
      <v-col cols="12" md="5">
        <FormCategoria
          ref="formCategoriaRef"
          :categoriaEditar="categoriaSeleccionada"
          @categoria-creada="handleCategoriaCreada"
          @categoria-actualizada="handleCategoriaActualizada"
          @cancelar="handleCancelar"
          @notificacion="mostrarNotificacion"
        />
      </v-col>

      <!-- Lista de categorías -->
      <v-col cols="12" md="7">
        <ListaCategorias
          :categorias="categoriasOrdenadas"
          :cargando="loading"
          @editar="handleEditar"
          @eliminar="handleEliminar"
          @recargar="recargarCategorias"
        />
      </v-col>
    </v-row>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
      {{ snackbar.mensaje }}
      
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FormCategoria from '@/components/configuracion/FormCategoria.vue';
import ListaCategorias from '@/components/configuracion/ListaCategorias.vue';
import { useCategorias } from '@/components/composables/useCategorias';

// Composable
const {
  categoriasOrdenadas,
  loading,
  error,
  fetchCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  recargarCategorias,
  limpiarError
} = useCategorias();

// Refs locales
const formCategoriaRef = ref(null);
const categoriaSeleccionada = ref(null);
const snackbar = ref({
  show: false,
  mensaje: '',
  color: 'success',
  icon: 'mdi-check-circle'
});

// Cargar categorías al montar
onMounted(async () => {
  await fetchCategorias();
});

// Handlers
const handleCategoriaCreada = async (nuevaCategoria) => {
  try {
    const resultado = await crearCategoria(nuevaCategoria);
    
    if (resultado) {
      // Formulario ya se limpia automáticamente en modo creación
    }
  } catch (error) {
    mostrarNotificacion(
      error.message || 'Error al crear categoría', 
      'error', 
      'mdi-alert-circle'
    );
  }
};

const handleCategoriaActualizada = async (categoriaActualizada) => {
  if (!categoriaSeleccionada.value) return;
  
  try {
    const resultado = await actualizarCategoria(
      categoriaActualizada.id, 
      categoriaActualizada
    );
    
    if (resultado) {
      mostrarNotificacion('Categoría actualizada exitosamente', 'success', 'mdi-check-circle');
      categoriaSeleccionada.value = null;
      // Limpiar formulario después de editar
      formCategoriaRef.value?.limpiarFormulario();
    }
  } catch (error) {
    mostrarNotificacion(
      error.message || 'Error al actualizar categoría', 
      'error', 
      'mdi-alert-circle'
    );
  }
};

const handleEditar = (categoria) => {
  categoriaSeleccionada.value = { ...categoria };
  limpiarError();
};

const handleEliminar = async (categoriaId) => {
  try {
    await eliminarCategoria(categoriaId);
    mostrarNotificacion('Categoría eliminada exitosamente', 'success', 'mdi-check-circle');
  } catch (error) {
    mostrarNotificacion(
      error.message || 'Error al eliminar categoría', 
      'error', 
      'mdi-alert-circle'
    );
  }
};

const handleCancelar = () => {
  categoriaSeleccionada.value = null;
  limpiarError();
};

const mostrarNotificacion = (mensaje, color, icon) => {
  snackbar.value = {
    show: true,
    mensaje,
    color,
    icon
  };
};

</script>
