<template>
  <v-dialog v-model="modelOpen" max-width="800px" persistent scrollable>
    <v-card class="search-modal">
      <!-- Header con gradiente del design-system -->
      <v-card-title class="search-modal__header bg-gradient-primary d-flex align-center pa-4">
        <v-icon color="white" size="24" class="mr-3">mdi-magnify</v-icon>
        <div>
          <div class="text-h6 text-white font-weight-bold">{{ title }}</div>
          <div class="text-caption text-white opacity-80">Busca por nombre, código o descripción</div>
        </div>
        <v-spacer />
        <!-- Contador de resultados -->
        <v-chip
          v-if="items.length > 0"
          color="white"
          variant="outlined"
          size="small"
          class="mr-3"
          prepend-icon="mdi-package-variant-closed"
        >
          {{ items.length }} resultado{{ items.length !== 1 ? 's' : '' }}
        </v-chip>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close" />
      </v-card-title>

      <!-- Barra de búsqueda -->
      <div class="search-modal__searchbar pa-4 pb-3">
        <v-text-field
          v-model="query"
          label="Buscar producto por nombre o código de barras"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          autofocus
          prepend-inner-icon="mdi-barcode-scan"
          append-inner-icon="mdi-magnify"
          @keyup.enter="buscar"
          @click:append-inner="buscar"
          @click:clear="limpiar"
        />
      </div>

      <!-- Barra de progreso de carga (no bloquea la UI) -->
      <v-progress-linear
        :active="loading"
        indeterminate
        color="primary"
        height="3"
        class="search-modal__loader"
      />

      <v-card-text class="search-modal__results pa-3 pt-2">
        <!-- Estado inicial — sin búsqueda -->
        <div v-if="!loading && items.length === 0 && !queryRealizada" class="search-modal__empty text-center py-10">
          <v-icon size="64" color="grey-lighten-2">mdi-text-search</v-icon>
          <div class="text-h6 text-grey mt-3">Ingresa un término para buscar</div>
          <div class="text-caption text-grey-darken-1 mt-1">
            Puedes buscar por nombre del producto o código de barras
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="!loading && queryRealizada && items.length === 0" class="search-modal__empty text-center py-10">
          <v-icon size="64" color="grey-lighten-2">mdi-package-variant-remove</v-icon>
          <div class="text-h6 text-grey mt-3">Sin resultados</div>
          <div class="text-caption text-grey-darken-1 mt-1">
            No se encontraron productos para <strong>"{{ lastQuery }}"</strong>
          </div>
        </div>

        <!-- Lista de productos -->
        <PosItemList v-else :items="items" @agregar="onAgregar" />
      </v-card-text>

      <v-card-actions class="search-modal__footer pa-3 pt-0">
        <v-spacer />
        <v-btn variant="outlined" color="grey-darken-1" prepend-icon="mdi-close" @click="close">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import POSService from '@/services/pos.service';
import PosItemList from './PosItemList.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String,  default: 'Buscar producto' },
});

const emits = defineEmits(['update:modelValue', 'agregar']);

const modelOpen      = ref(props.modelValue);
const query          = ref('');
const lastQuery      = ref('');
const items          = ref([]);
const loading        = ref(false);
const queryRealizada = ref(false);   // saber si se hizo al menos una búsqueda

watch(() => props.modelValue, (v) => {
  modelOpen.value = v;
  // Limpiar al cerrar
  if (!v) {
    query.value          = '';
    items.value          = [];
    queryRealizada.value = false;
  }
});
watch(modelOpen, (v) => emits('update:modelValue', v));

// ─── Métodos (lógica sin cambios) ────────────────────────────────────────────

const buscar = async () => {
  loading.value = true;
  lastQuery.value = query.value;
  try {
    const resultados = await POSService.buscarProductos(query.value || '');
    items.value = Array.isArray(resultados)
      ? resultados
      : (resultados.productos || resultados || []);
  } catch (err) {
    console.error('Error en buscar productos:', err);
    items.value = [];
  } finally {
    loading.value        = false;
    queryRealizada.value = true;
  }
};

const limpiar = () => {
  query.value          = '';
  items.value          = [];
  queryRealizada.value = false;
};

const close = () => { modelOpen.value = false; };

const onAgregar = (item) => { emits('agregar', item); };
</script>

<style scoped>
.search-modal {
  border-radius: var(--border-radius-lg) !important;
  overflow: hidden;
}

.search-modal__header {
  background: var(--gradient-primary);
}

.search-modal__loader {
  margin-top: -2px; /* se pega al borde del header */
}

.search-modal__results {
  min-height: 200px;
  max-height: 55vh;
  overflow-y: auto;
}

.search-modal__empty {
  animation: fadeIn var(--transition-base) ease-out;
}

.search-modal__footer {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
