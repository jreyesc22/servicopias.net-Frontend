<template>
  <v-card elevation="2" class="populares-card">
    <v-card-title class="bg-gradient-success text-white d-flex align-center">
      <v-icon class="mr-2" color="white">mdi-star</v-icon>
      Top 15 Productos Más Vendidos
    </v-card-title>
    <v-card-text class="pa-3" style="max-height: 500px; overflow-y: auto;">
      <!-- Skeleton Loaders -->
      <v-row v-if="cargando" dense>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6">
          <pos-product-card-skeleton />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-else-if="productos.length === 0">
        <v-col cols="12" class="text-center py-6">
          <v-icon size="48" color="grey">mdi-package-variant</v-icon>
          <p class="mt-3 text-grey text-caption">No hay productos vendidos</p>
        </v-col>
      </v-row>

      <!-- Product List -->
      <v-row v-else dense>
        <v-col
          v-for="producto in productos"
          :key="producto.id || producto.producto_id"
          cols="12"
          sm="6"
        >
          <pos-product-card
            :product="producto"
            @seleccionar="seleccionarProducto"
            @agregar="seleccionarProducto"
          >
            <template #info="{ product }">
              <div class="d-flex align-center justify-space-between" style="width: 100%;">
                <span class="text-success font-weight-bold">Q{{ product.precio_unitario }}</span>
                <span class="text-caption">• {{ product.total_vendido }} vendidos</span>
              </div>
            </template>
          </pos-product-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import PosProductCard from './PosProductCard.vue';
import PosProductCardSkeleton from './PosProductCardSkeleton.vue';

defineProps({
  productos: {
    type: Array,
    default: () => []
  },
  cargando: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['producto-seleccionado']);

const seleccionarProducto = (producto) => {
  emit('producto-seleccionado', producto);
};
</script>

<style scoped>
.populares-card {
  border-radius: var(--border-radius-lg) !important;
}

/* Scrollbar usando variables del design-system */
:deep(.v-card-text::-webkit-scrollbar) {
  width: 8px;
}

:deep(.v-card-text::-webkit-scrollbar-track) {
  background: var(--background-light);
  border-radius: var(--border-radius-sm);
}

:deep(.v-card-text::-webkit-scrollbar-thumb) {
  background: var(--primary-light);
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-base);
}

:deep(.v-card-text::-webkit-scrollbar-thumb:hover) {
  background: var(--primary-color);
}
</style>
