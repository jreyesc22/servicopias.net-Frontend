<template>
  <v-card elevation="1" hover class="product-card" @click="emit('seleccionar', product)">
    <v-card-text class="pa-2">
      <div class="d-flex align-center gap-2">
        <v-avatar size="40" :color="product.imagen_url ? 'transparent' : 'grey-lighten-3'">
          <v-img v-if="product.imagen_url" :src="resolveMediaUrl(product.imagen_url)" cover>
            <template #placeholder>
              <v-skeleton-loader type="avatar"></v-skeleton-loader>
            </template>
          </v-img>
          <v-icon v-else size="24" color="grey">mdi-package-variant</v-icon>
        </v-avatar>

        <div class="flex-grow-1" style="min-width: 0;">
          <div class="d-flex align-center gap-1">
            <span class="text-body-2 font-weight-medium text-truncate" style="max-width: 180px;">
              {{ product.nombre }}
            </span>
          </div>
          <div class="text-caption text-grey">{{ product.categoria_nombre || 'Sin categoría' }}</div>
          
          <!-- Slot for extra information -->
          <div class="d-flex align-center justify-space-between mt-1">
            <slot name="info" :product="product">
              <!-- Default content if not provided -->
              <span class="text-success font-weight-bold">
                Q{{ formatMoney(product.precio_venta || 0) }}
              </span>
            </slot>
          </div>
        </div>

        <!-- Slot for action button -->
        <slot name="action" :product="product">
          <!-- Default action button -->
          <v-btn icon color="success" size="small" variant="tonal" @click.stop="emit('agregar', product)">
            <v-icon>mdi-cart-plus</v-icon>
          </v-btn>
        </slot>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { resolveMediaUrl } from '@/utils/mediaUrl';

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (value) => {
      const hasBaseInfo = value && typeof value.nombre === 'string';
      // Allows for flexibility, can be a purchase price, sale price, etc.
      const hasPrice = value.precio_venta !== undefined || value.precio_compra !== undefined || value.precio !== undefined;
      return hasBaseInfo && hasPrice;
    }
  }
});

const emit = defineEmits(['seleccionar', 'agregar']);

const formatMoney = (value) => parseFloat(value || 0).toFixed(2);
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 8px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
