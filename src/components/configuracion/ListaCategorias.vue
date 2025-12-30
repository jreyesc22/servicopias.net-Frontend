<template>
  <v-card class="lista-categorias-card" elevation="2">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon icon="mdi-format-list-bulleted" class="mr-2" color="primary"></v-icon>
        <span>Categorías Registradas</span>
        <v-chip class="ml-2" size="small" color="primary" variant="tonal">
          {{ totalCategorias }}
        </v-chip>
      </div>

      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        @click="$emit('recargar')"
        :loading="cargando"
      ></v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Búsqueda -->
      <v-text-field
        v-model="busqueda"
        prepend-inner-icon="mdi-magnify"
        label="Buscar categoría"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="mb-4"
      />

      <!-- Estado de carga -->
      <div v-if="cargando" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="text-body-2 text-grey mt-2">Cargando categorías...</p>
      </div>

      <!-- Sin resultados -->
      <v-alert
        v-else-if="!cargando && categoriasFiltradas.length === 0 && !busqueda"
        type="info"
        variant="tonal"
        class="my-4"
      >
        <div class="d-flex align-center">
          <v-icon start>mdi-information</v-icon>
          No hay categorías registradas. Crea la primera categoría arriba.
        </div>
      </v-alert>

      <v-alert
        v-else-if="!cargando && categoriasFiltradas.length === 0 && busqueda"
        type="warning"
        variant="tonal"
        class="my-4"
      >
        <div class="d-flex align-center">
          <v-icon start>mdi-alert</v-icon>
          No se encontraron categorías con "{{ busqueda }}"
        </div>
      </v-alert>

      <!-- Lista de categorías -->
      <v-list v-else lines="two" class="categoria-list">
        <v-list-item
          v-for="categoria in categoriasFiltradas"
          :key="categoria.id"
          class="categoria-item"
        >
          <template #prepend>
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-tag</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ categoria.nombre }}
          </v-list-item-title>

          <v-list-item-subtitle v-if="categoria.descripcion">
            {{ categoria.descripcion }}
          </v-list-item-subtitle>

          <v-list-item-subtitle v-else class="text-grey-lighten-1">
            Sin descripción
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="primary"
                @click="$emit('editar', categoria)"
                :disabled="cargando"
              ></v-btn>

              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="confirmarEliminar(categoria)"
                :disabled="cargando"
              ></v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- Dialog de confirmación -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="warning" start>mdi-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>

        <v-card-text>
          <p>¿Estás seguro de que deseas eliminar la categoría?</p>
          <v-alert type="warning" variant="tonal" class="mt-2">
            <strong>{{ categoriaEliminar?.nombre }}</strong>
          </v-alert>
          <p class="text-caption text-grey mt-2">
            Esta acción no se puede deshacer.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="dialogEliminar = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="eliminarCategoria"
            :loading="eliminando"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  categorias: {
    type: Array,
    required: true,
    default: () => []
  },
  cargando: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['editar', 'eliminar', 'recargar']);

// Refs
const busqueda = ref('');
const dialogEliminar = ref(false);
const categoriaEliminar = ref(null);
const eliminando = ref(false);

// Computed
const totalCategorias = computed(() => props.categorias.length);

const categoriasFiltradas = computed(() => {
  if (!busqueda.value || !busqueda.value.trim()) {
    return props.categorias;
  }

  const termino = busqueda.value.toLowerCase().trim();
  return props.categorias.filter(categoria => 
    categoria.nombre?.toLowerCase().includes(termino) ||
    categoria.descripcion?.toLowerCase().includes(termino)
  );
});

// Métodos
const confirmarEliminar = (categoria) => {
  categoriaEliminar.value = categoria;
  dialogEliminar.value = true;
};

const eliminarCategoria = async () => {
  if (!categoriaEliminar.value) return;

  eliminando.value = true;

  try {
    emit('eliminar', categoriaEliminar.value.id);
    dialogEliminar.value = false;
    categoriaEliminar.value = null;
  } catch (error) {
    console.error('Error al eliminar:', error);
  } finally {
    eliminando.value = false;
  }
};
</script>

<style scoped>
.lista-categorias-card {
  margin-top: 16px;
}

.categoria-list {
  background: transparent;
}

.categoria-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.categoria-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.categoria-item:last-child {
  border-bottom: none;
}

.gap-1 {
  gap: 4px;
}
</style>
