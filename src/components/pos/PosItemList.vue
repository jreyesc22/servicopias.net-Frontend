<template>
  <div>
    <!-- Skeleton Loaders -->
    <v-row v-if="cargando" dense>
      <v-col v-for="n in 8" :key="n" cols="12" sm="6">
        <pos-product-card-skeleton />
      </v-col>
    </v-row>

    <!-- Product List -->
    <v-row v-else-if="items.length > 0" dense>
      <v-col
        v-for="item in items"
        :key="item.id || item.producto_id"
        cols="12"
        sm="6"
      >
        <pos-product-card 
          :product="item" 
          @seleccionar="seleccionar"
          @agregar="emit('agregar', item)"
        >
          <template #info="{ product }">
            <span class="text-success font-weight-bold">
              Q{{ formatMoney(product.precio_unitario || product.precio || product.precio_venta || 0) }}
            </span>
          </template>

          <template #action="{ product }">
            <v-btn
              icon="mdi-cart-plus"
              color="success"
              size="small"
              variant="tonal"
              @click.stop="emit('agregar', product)"
            />
          </template>
        </pos-product-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <div v-else class="text-center pa-4">
      <v-icon size="48" color="grey">mdi-package-variant</v-icon>
      <div class="mt-2 text-caption text-grey">No se encontraron resultados</div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import PosProductCard from './PosProductCard.vue';
import PosProductCardSkeleton from './PosProductCardSkeleton.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false }
});

const { items } = toRefs(props);

const emit = defineEmits(['agregar', 'seleccionar']);

const formatMoney = (v) => parseFloat(v || 0).toFixed(2);

const seleccionar = (item) => {
  emit('seleccionar', item);
};
</script>

