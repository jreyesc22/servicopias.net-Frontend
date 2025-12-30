<template>
  <v-card class="mb-6" elevation="2">
    <v-card-title class="bg-primary text-white">
      <v-icon left>mdi-filter</v-icon>
      Filtros de Análisis
    </v-card-title>
    <v-card-text class="pa-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-date-range-picker
            :model-value="rangoFechas"
            color="primary"
            elevation="2"
            show-adjacent-months
            :max="maxDate"
            @update:model-value="$emit('update:rangoFechas', $event)"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            :model-value="periodoTendencia"
            :items="opcionesPeriodo"
            item-title="text"
            item-value="value"
            label="Periodo de tendencias"
            density="comfortable"
            prepend-inner-icon="mdi-calendar-clock"
            @update:model-value="$emit('update:periodoTendencia', $event)"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            :model-value="limitProductos"
            :items="[5, 10, 15, 20]"
            label="Top productos"
            density="comfortable"
            prepend-inner-icon="mdi-trophy"
            @update:model-value="$emit('update:limitProductos', $event)"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardFilters',

  props: {
    rangoFechas: {
      type: Object,
      required: true
    },
    periodoTendencia: {
      type: String,
      required: true
    },
    limitProductos: {
      type: Number,
      required: true
    }
  },

  emits: ['update:rangoFechas', 'update:periodoTendencia', 'update:limitProductos'],

  data() {
    return {
      opcionesPeriodo: [
        { text: 'Última semana', value: 'semanal' },
        { text: 'Último mes', value: 'mensual' },
        { text: 'Últimos 3 meses', value: 'trimestral' },
        { text: 'Últimos 6 meses', value: 'semestral' },
        { text: 'Último año', value: 'anual' }
      ]
    }
  },

  computed: {
    maxDate() {
      return new Date().toISOString().split('T')[0]
    }
  }
}
</script>
