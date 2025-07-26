<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="headline">🧾 Resumen de la Orden</v-card-title>
     
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
      <v-btn color="green darken-1" variant="elevated" @click="$emit('confirmar')">
        ✅ Confirmar
      </v-btn>
      <v-btn color="red darken-1" variant="outlined" @click="$emit('cancelar')">
        ❌ Cancelar
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
  computed: {
    total() {
      return this.orden.items.reduce((acc, item) => acc + item.subtotal, 0)
    }
  }
}
</script>