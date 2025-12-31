<template>
  <v-card elevation="2">
    <v-card-title class="bg-success text-white">
      <v-icon class="mr-2">mdi-star</v-icon>
      Top 15 Productos Más Vendidos
    </v-card-title>
    <v-card-text class="pa-3" style="max-height: 500px; overflow-y: auto;">
      <!-- Estado de carga -->
      <v-row v-if="cargando">
        <v-col cols="12" class="text-center py-8">
          <v-progress-circular indeterminate color="success" size="48" />
          <p class="mt-3 text-caption">Cargando productos...</p>
        </v-col>
      </v-row>

      <!-- Estado vacío -->
      <v-row v-else-if="productos.length === 0">
        <v-col cols="12" class="text-center py-6">
          <v-icon size="48" color="grey">mdi-package-variant</v-icon>
          <p class="mt-3 text-grey text-caption">No hay productos vendidos</p>
        </v-col>
      </v-row>

      <!-- Lista de productos -->
      <v-row v-else dense>
        <v-col
          v-for="(producto, index) in productos"
          :key="producto.producto_id"
          cols="12"
          sm="6"
        >
          <v-card
            elevation="1"
            hover
            @click="seleccionarProducto(producto)"
            class="cursor-pointer"
          >
            <v-card-text class="pa-2">
              <div class="d-flex align-center gap-2">
                <!-- Avatar con imagen o icono -->
                <v-avatar
                  size="40"
                  :color="producto.imagen_url ? 'transparent' : 'grey-lighten-3'"
                >
                  <v-img v-if="producto.imagen_url" :src="producto.imagen_url" cover />
                  <v-icon v-else size="24" color="grey">mdi-package-variant</v-icon>
                </v-avatar>

                <!-- Información del producto -->
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-center gap-1">
                    <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">
                      #{{ index + 1 }}
                    </v-chip>
                    <span class="text-body-2 font-weight-medium text-truncate" style="max-width: 150px;">
                      {{ producto.producto_nombre }}
                    </span>
                  </div>
                  <div class="text-caption text-grey">{{ producto.categoria_nombre }}</div>
                  <div class="d-flex align-center justify-space-between mt-1">
                    <span class="text-success font-weight-bold">Q{{ producto.precio_unitario }}</span>
                    <span class="text-caption">• {{ producto.total_vendido }} vendidos</span>
                  </div>
                </div>

                <!-- Botón agregar -->
                <v-btn
                  icon="mdi-cart-plus"
                  color="success"
                  size="small"
                  variant="tonal"
                  @click.stop="seleccionarProducto(producto)"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
/**
 * Componente para mostrar los productos más vendidos (Top 15)
 * Permite seleccionar productos para agregarlos al carrito
 */

// Props
const props = defineProps({
  productos: {
    type: Array,
    default: () => []
  },
  cargando: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['producto-seleccionado']);

/**
 * Emitir evento cuando se selecciona un producto
 */
const seleccionarProducto = (producto) => {
  emit('producto-seleccionado', producto);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
}
</style>
