<template>
  <div>
    <v-row dense>
      <v-col
        v-for="(item, index) in items"
        :key="item.id || item.producto_id || index"
        cols="12"
        sm="6"
      >
        <v-card elevation="1" hover class="cursor-pointer" @click="seleccionar(item)">
          <v-card-text class="pa-2">
            <div class="d-flex align-center gap-2">
              <v-avatar size="40" :color="item.imagen_url ? 'transparent' : 'grey-lighten-3'">
                <v-img v-if="item.imagen_url" :src="resolveMediaUrl(item.imagen_url)" cover />
                <v-icon v-else size="24" color="grey">mdi-package-variant</v-icon>
              </v-avatar>

              <div class="flex-grow-1" style="min-width: 0;">
                <div class="d-flex align-center gap-1">
                  <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">#{{ index + 1 }}</v-chip>
                  <span class="text-body-2 font-weight-medium text-truncate" style="max-width: 180px;">{{ item.nombre || item.producto_nombre }}</span>
                </div>
                <div class="text-caption text-grey">{{ item.categoria_nombre || item.categoria || '' }}</div>
                <div class="d-flex align-center justify-space-between mt-1">
                  <span class="text-success font-weight-bold">Q{{ formatMoney(item.precio_unitario || item.precio || item.precio_venta || 0) }}</span>
                </div>
              </div>

              <v-btn icon color="success" size="small" variant="tonal" @click.stop="emit('agregar', item)">
                <v-icon>mdi-cart-plus</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!items || items.length === 0" class="text-center pa-4">
      <v-icon size="48" color="grey">mdi-package-variant</v-icon>
      <div class="mt-2 text-caption text-grey">No se encontraron resultados</div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const { items } = toRefs(props)

const emit = defineEmits(['agregar', 'seleccionar'])

const formatMoney = (v) => parseFloat(v || 0).toFixed(2)

const seleccionar = (item) => {
  // Emitir evento genérico para selección (puede usarse para ver detalles o añadir)
  emit('seleccionar', item)
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: var(--border-radius);
}
.cursor-pointer:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-light);
}
</style>
