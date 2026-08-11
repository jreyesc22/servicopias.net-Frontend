<template>
  <v-card elevation="0" border>
    <v-card-title class="d-flex align-center bg-grey-lighten-4 py-3">
      <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
      Detalle de Ventas
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-inner-icon="mdi-magnify"
        label="Buscar orden..."
        single-line
        hide-details
        variant="outlined"
        density="compact"
        style="max-width: 300px"
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="ordenes"
      :search="search"
      :loading="loading"
      hover
    >
      <template v-slot:item.fecha="{ item }">
        {{ formatDate(item.fecha) }}
      </template>
      <template v-slot:item.id="{ item }">
        <strong>#ORD-{{ String(item.id).padStart(5, '0') }}</strong>
      </template>
      <template v-slot:item.estado_pago="{ item }">
        <v-chip :color="getColorPago(item.estado_pago)" size="small">
          {{ item.estado_pago?.toUpperCase() }}
        </v-chip>
      </template>
      <template v-slot:item.total="{ item }">
        Q{{ formatMoney(item.total) }}
      </template>
      <template v-slot:item.acciones="{ item }">
        <v-btn icon="mdi-eye" size="small" variant="text" color="primary" @click="emit('verDetalle', item)"></v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  headers: {
    type: Array,
    required: true
  },
  ordenes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['verDetalle']);
const search = ref('');

// Helper functions are now local to this component
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

const getColorPago = (estado) => {
  if (estado === 'pagado') return 'success';
  if (estado === 'parcial') return 'warning';
  return 'error';
};
</script>
