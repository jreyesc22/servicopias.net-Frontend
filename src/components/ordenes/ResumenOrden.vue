<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="headline">Resumen de la Orden</v-card-title>

    <v-card-text>
      <!-- Datos del Cliente -->
      <div class="mb-3">
        <div class="text-h6 font-weight-bold text-primary mb-0">
          {{ orden.cliente_nombre || 'CONSUMIDOR FINAL' }}
        </div>
        <div class="d-flex flex-wrap gap-4 text-body-2 text-medium-emphasis">
          <div class="mr-4">
            <v-icon size="x-small" start>mdi-card-account-details</v-icon>
            <strong>NIT:</strong> {{ orden.cliente_nit || 'CF' }}
          </div>
          <div>
            <v-icon size="x-small" start>mdi-phone</v-icon>
            <strong>Tel:</strong> {{ orden.cliente_telefono || 'N/A' }}
          </div>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- Estado de la orden -->
      <div class="d-flex align-center justify-space-between py-2">
        <v-switch
          v-model="ventaDirecta"
          color="success"
          inset
          density="compact"
          hide-details
          class="ma-0"
          @change="actualizarEstadoOrden"
        >
          <template v-slot:label>
            <span class="text-body-1 font-weight-medium ml-2">
              Venta Directa (Entregar inmediatamente)
            </span>
          </template>
        </v-switch>

        <v-chip 
          :color="estadoSeleccionado === 'entregado' ? 'success' : 'warning'" 
          variant="tonal"
          class="font-weight-bold"
        >
          {{ estadoSeleccionado === 'entregado' ? 'ENTREGADO' : 'PENDIENTE' }}
        </v-chip>
      </div>
      
      <div class="text-caption text-grey mb-4 ml-10">
        {{ estadoSeleccionado === 'entregado' 
          ? 'La orden se marcará como entregada y lista para cobro.' 
          : 'La orden se enviará al taller para su producción.' 
        }}
      </div>

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
      ventaDirecta: true, // Activo por defecto
      estadoSeleccionado: 'entregado' // Valor por defecto
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
