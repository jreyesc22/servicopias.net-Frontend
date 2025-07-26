<template>
  <v-card class="pa-4 elevation-1">
    <v-data-table
      :headers="headers"
      :items="movimientos"
      :loading="cargando"
      class="elevation-0"
      loading-text="Cargando movimientos..."
      no-data-text="No hay movimientos para la fecha seleccionada"
      item-value="id"
      item-class="getRowClass"
      :items-per-page="10"
      dense
    >
      <template #item.fecha="{ item }">
        <div>
          <div class="font-weight-bold">{{ formatearFecha(item.fecha) }}</div>
          <div class="text-caption text-grey">{{ formatearHora(item.fecha) }}</div>
        </div>
      </template>

      <template #item.tipo_movimiento="{ item }">
        <v-chip
          :color="item.tipo_movimiento === 'ingreso' ? 'green-lighten-3' : 'red-lighten-3'"
          :text-color="item.tipo_movimiento === 'ingreso' ? 'green-darken-2' : 'red-darken-2'"
          small
        >
          {{ item.tipo_movimiento.toUpperCase() }}
        </v-chip>
      </template>

      <template #item.monto="{ item }">
        <span :class="item.tipo_movimiento === 'ingreso' ? 'text-success' : 'text-error'">
          {{ item.tipo_movimiento === 'ingreso' ? '+' : '-' }}Q{{ parseFloat(item.monto).toFixed(2) }}
        </span>
      </template>

      <template #item.empleado="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.Empleado?.nombre || 'N/A' }}</div>
          <div class="text-caption">{{ item.Empleado?.puesto || '' }}</div>
        </div>
      </template>

      <template #item.tipo_pago="{ item }">
        <v-chip class="text-capitalize" color="blue-lighten-4" text-color="blue-darken-2" small>
          {{ item.TipoPago?.nombre || 'N/A' }}
        </v-chip>
      </template>

      <template #item.orden="{ item }">
        <div v-if="item.Orden">
          <v-btn size="small" variant="text" color="primary" @click="verOrden(item.Orden)">
            #{{ item.Orden.id }}
          </v-btn>
          <div class="text-caption">{{ item.Orden.cliente_nombre }}</div>
        </div>
        <div v-else class="text-grey">—</div>
      </template>

      <template #item.descripcion="{ item }">
        <span>{{ item.descripcion || 'Sin descripción' }}</span>
      </template>

      <template #item.acciones="{ item }">
        <v-btn
          icon
          variant="text"
          size="small"
          color="info"
          @click="$emit('ver-detalle', item)"
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Resumen -->
    <v-divider class="my-4" />
    <div class="d-flex justify-space-around flex-wrap">
      <div><strong>Total movimientos:</strong> {{ movimientos.length }}</div>
      <div class="text-success"><strong>Total ingresos:</strong> +Q{{ calcularTotal('ingreso') }}</div>
      <div class="text-error"><strong>Total egresos:</strong> -Q{{ calcularTotal('egreso') }}</div>
    </div>
  </v-card>
</template>

<script setup>
const props = defineProps({
  movimientos: {
    type: Array,
    default: () => []
  },
  cargando: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['ver-detalle'])

const headers = [
  { text: 'Fecha/Hora', value: 'fecha', sortable: false },
  { text: 'Tipo', value: 'tipo_movimiento', sortable: false },
  { text: 'Monto', value: 'monto', sortable: false },
  { text: 'Empleado', value: 'empleado', sortable: false },
  { text: 'Tipo Pago', value: 'tipo_pago', sortable: false },
  { text: 'Orden', value: 'orden', sortable: false },
  { text: 'Descripción', value: 'descripcion', sortable: false },
  { text: 'Acciones', value: 'acciones', sortable: false, align: 'center' }
]

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatearHora = (fecha) =>
  new Date(fecha).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })

const calcularTotal = (tipo) =>
  props.movimientos
    .filter(m => m.tipo_movimiento === tipo)
    .reduce((total, m) => total + parseFloat(m.monto || 0), 0)
    .toFixed(2)

const verOrden = (orden) => {
  console.log('Ver orden:', orden)
}
</script>
