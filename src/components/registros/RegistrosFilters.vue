<template>
  <v-card class="mb-6 pa-4 bg-grey-lighten-4" elevation="0">
    <v-row align="center">
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
        ></v-select>
      </v-col>
       <v-col cols="12" md="4" v-if="vistaActual === 'ingresos_categoria'">
        <v-select
          :model-value="categoriasSeleccionadas"
          @update:model-value="emit('update:categoriasSeleccionadas', $event)"
          :items="categorias"
          item-title="nombre"
          item-value="id"
          label="Seleccionar Categorías"
          variant="outlined"
          density="compact"
          hide-details
          multiple
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" :md="vistaActual === 'ventas_usuario' ? 4 : 6">
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
        ></v-select>
      </v-col>
      <v-col cols="12" :md="vistaActual === 'ventas_usuario' ? 4 : 6" v-if="periodo === 'custom'">
        <div class="d-flex" style="gap: 8px;">
          <v-text-field
            :model-value="fechaInicio"
            @update:model-value="emit('update:fechaInicio', $event)"
            type="date"
            label="Desde"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
          <v-text-field
            :model-value="fechaFin"
            @update:model-value="emit('update:fechaFin', $event)"
            type="date"
            label="Hasta"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </div>
      </v-col>
      <v-col cols="12" md="4" v-else-if="vistaActual === 'ventas_usuario' || vistaActual === 'ingresos_categoria'">
         <v-btn color="primary" block @click="emit('buscar')" :loading="loading" height="40">
           Buscar
         </v-btn>
      </v-col>
      <v-col cols="12" v-if="periodo === 'custom' || vistaActual === 'reporte_general'">
         <v-btn color="primary" block @click="emit('buscar')" :loading="loading" height="40">
           Buscar
         </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
defineProps({
  vistaActual: {
    type: String,
    required: true
  },
  empleados: {
    type: Array,
    default: () => []
  },
  categorias: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  opcionesPeriodo: {
    type: Array,
    required: true
  },
  empleado: [String, Number],
  periodo: String,
  fechaInicio: String,
  fechaFin: String,
  categoriasSeleccionadas: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'update:empleado',
  'update:periodo',
  'update:fechaInicio',
  'update:fechaFin',
  'update:categoriasSeleccionadas',
  'buscar'
]);
</script>
