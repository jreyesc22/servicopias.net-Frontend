<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="headline">Resumen de la Orden</v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <strong>Cliente:</strong> {{ orden.cliente_nombre || 'CONSUMIDOR FINAL' }}
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <strong>NIT:</strong> {{ orden.cliente_nit || 'CF' }}
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <strong>Teléfono:</strong> {{ orden.cliente_telefono || 'N/A' }}
        </v-col>
      </v-row>

      <!-- Campo para seleccionar estado inicial con slider -->
      <v-row class="mt-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 mb-2">Estado de la orden</h4>
              <v-switch
                v-model="ventaDirecta"
                label="Venta Directa (Entregar inmediatamente)"
                color="primary"
                inset
                density="comfortable"
                hide-details
                @change="actualizarEstadoOrden"
              />
            </div>
            <v-chip 
              :color="estadoSeleccionado === 'entregado' ? 'success' : 'warning'" 
              size="small" 
              variant="flat"
              class="ml-4"
            >
              {{ estadoSeleccionado === 'entregado' ? 'Entregado' : 'Pendiente' }}
            </v-chip>
          </div>
          
          <div class="text-body-2 text-grey-darken-1 mt-2">
            <v-icon 
              :color="estadoSeleccionado === 'entregado' ? 'success' : 'warning'" 
              size="small" 
              class="me-1"
            >
              {{ estadoSeleccionado === 'entregado' ? 'mdi-check-circle' : 'mdi-clock-outline' }}
            </v-icon>
            {{ estadoSeleccionado === 'entregado' 
              ? 'La orden se marcará como entregada, debe procesar pago.' 
              : 'La orden irá al taller para procesamiento y envío.' 
            }}
          </div>
        </v-col>
      </v-row>

      <v-table density="comfortable" class="mt-4">
        <thead>
          <tr>
            <th class="text-left">Producto</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Precio Unitario</th>
            <th class="text-center">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orden.items" :key="item.itemId">
            <td>{{ item.nombre }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-center">Q {{ item.precio_unitario.toFixed(2) }}</td>
            <td class="text-center">Q {{ item.subtotal.toFixed(2) }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="text-end mt-4">
        <h4>Total: <strong>Q {{ total.toFixed(2) }}</strong></h4>
      </div>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        :disabled="botonDeshabilitado"
        color="green darken-1"
        variant="elevated"
        @click="confirmarConRetraso"
      >
        Confirmar
      </v-btn>
      <v-btn color="red darken-1" variant="outlined" @click="$emit('cancelar')">
        Cancelar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    orden: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      botonDeshabilitado: false,
      ventaDirecta: false, // Nuevo estado para el switch
      estadoSeleccionado: 'pendiente' // Valor por defecto
    };
  },
  computed: {
    total() {
      return this.orden.items.reduce((acc, item) => acc + item.subtotal, 0);
    }
  },
  methods: {
    actualizarEstadoOrden() {
      this.estadoSeleccionado = this.ventaDirecta ? 'entregado' : 'pendiente'
    },
    confirmarConRetraso() {
      if (this.botonDeshabilitado) return;

      this.botonDeshabilitado = true;
      
      // Emitir la orden con el estado seleccionado
      this.$emit('confirmar', {
        ...this.orden,
        estado: this.estadoSeleccionado
      });

      setTimeout(() => {
        this.botonDeshabilitado = false;
      }, 2000); // 2 segundos de espera
    }
  }
};
</script>

<style scoped>
/* Estilos adicionales para el slider */
.d-flex.align-center {
  align-items: center;
}

.flex-grow-1 {
  flex: 1;
}

.ml-4 {
  margin-left: 16px;
}

.me-1 {
  margin-right: 4px;
}
</style>
