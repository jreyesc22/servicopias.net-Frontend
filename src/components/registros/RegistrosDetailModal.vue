<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600">
    <v-card v-if="orden">
      <v-card-title class="bg-primary text-white d-flex align-center">
        Detalle Orden #ORD-{{ String(orden.id).padStart(5, '0') }}
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" color="white"></v-btn>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="6">
            <div class="text-caption text-grey">Cliente</div>
            <div class="text-body-1">{{ orden.cliente_nombre || 'Mostrador' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey">Fecha</div>
            <div class="text-body-1">{{ formatDate(orden.fecha) }}</div>
          </v-col>
        </v-row>
        <v-divider class="my-4"></v-divider>
        <h3 class="text-h6 mb-3">Productos</h3>
        <v-table density="compact">
          <thead>
            <tr>
              <th>Cant</th>
              <th>Producto</th>
              <th class="text-right">Precio</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orden.items" :key="item.item.id">
              <td>{{ item.cantidad }}</td>
              <td>{{ item.item.nombre }}</td>
              <td class="text-right">Q{{ formatMoney(item.precio_unitario) }}</td>
              <td class="text-right">Q{{ formatMoney(item.subtotal) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right font-weight-bold">Total:</td>
              <td class="text-right font-weight-bold">Q{{ formatMoney(orden.total) }}</td>
            </tr>
          </tfoot>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="closeDialog">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: { // for v-model
    type: Boolean,
    default: false
  },
  orden: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const closeDialog = () => {
  emit('update:modelValue', false);
};

// Helper functions copied for encapsulation
const formatMoney = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (val) => {
  if (!val) return '';
  const date = new Date(val);
  return date.toLocaleString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>
