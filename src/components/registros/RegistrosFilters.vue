<template>
  <v-card class="mb-6 pa-4 bg-grey-lighten-4" elevation="0">
    <v-row align="center">
      <!-- Filtro específico: Empleado (solo ventas_usuario) -->
      <v-col cols="12" md="4" v-if="vistaActual === 'ventas_usuario'">
        <v-select
          :model-value="empleado"
          @update:model-value="emit('update:empleado', $event)"
          :items="empleados"
          item-title="nombre"
          item-value="id"
          label="Seleccionar Empleado"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>

      <!-- Selector de Periodo — siempre visible -->
      <v-col cols="12" :md="hasExtraFilter ? 4 : 6">
        <v-select
          :model-value="periodo"
          @update:model-value="emit('update:periodo', $event)"
          :items="opcionesPeriodo"
          item-title="label"
          item-value="value"
          label="Periodo"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-col>

      <!-- Fechas personalizadas — solo cuando periodo === 'custom' -->
      <v-col cols="12" :md="hasExtraFilter ? 4 : 6" v-if="periodo === 'custom'">
        <div class="d-flex" style="gap: 8px;">
          <v-text-field
            :model-value="fechaInicio"
            @update:model-value="emit('update:fechaInicio', $event)"
            type="date"
            label="Desde"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-text-field
            :model-value="fechaFin"
            @update:model-value="emit('update:fechaFin', $event)"
            type="date"
            label="Hasta"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
      </v-col>

      <!-- Botón Buscar — único, siempre en su propia fila -->
      <v-col cols="12">
        <v-btn
          color="primary"
          block
          height="40"
          :loading="loading"
          prepend-icon="mdi-magnify"
          @click="emit('buscar')"
        >
          Buscar
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  vistaActual:     { type: String,  required: true    },
  empleados:       { type: Array,   default: () => [] },
  loading:         { type: Boolean, default: false    },
  opcionesPeriodo: { type: Array,   required: true    },
  empleado:        [String, Number],
  periodo:         String,
  fechaInicio:     String,
  fechaFin:        String,
});

const emit = defineEmits([
  'update:empleado',
  'update:periodo',
  'update:fechaInicio',
  'update:fechaFin',
  'buscar',
]);

// Columna de periodo: más ancha cuando NO hay filtro extra (empleado)
const hasExtraFilter = computed(() =>
  props.vistaActual === 'ventas_usuario'
);
</script>
