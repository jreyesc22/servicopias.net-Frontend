<template>
  <v-card elevation="0" border>
    <v-card-title class="d-flex align-center bg-grey-lighten-4 py-3">
      <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
      Detalle de Ventas
      <v-spacer />
      <v-text-field
        v-model="search"
        append-inner-icon="mdi-magnify"
        label="Buscar orden..."
        single-line
        hide-details
        variant="outlined"
        density="compact"
        style="max-width: 300px"
      />
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
        <v-btn
          icon="mdi-eye"
          size="small"
          variant="text"
          color="primary"
          @click="emit('verDetalle', item)"
        />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRegistrosFormatters } from '@/components/composables/useRegistrosFormatters';

defineProps({
  headers: { type: Array,   required: true    },
  ordenes: { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false    },
});

const emit   = defineEmits(['verDetalle']);
const search = ref('');

// Formatters centralizados — eliminado código duplicado
const { formatMoney, formatDate, getColorPago } = useRegistrosFormatters();
</script>
