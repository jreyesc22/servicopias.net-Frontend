<template>
  <div class="tabla-scroll mt-4">
    <v-data-table
      :headers="headers"
      :items="items"
      density="compact"
      class="mt-2"
      hide-default-footer
    >
      <template #item.precio_unitario="{ item }">
        Q {{ item.precio_unitario.toFixed(2) }}
      </template>
      <template #item.subtotal="{ item }">
        Q {{ item.subtotal.toFixed(2) }}
      </template>
      <template #item.accion="{ index }">
        <v-btn icon color="error" @click="$emit('quitar', index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    items: Array
  },
  data() {
    return {
      headers: [
        { text: 'Producto', value: 'nombre' },
        { text: 'Cantidad', value: 'cantidad' },
        { text: 'Precio Unitario', value: 'precio_unitario' },
        { text: 'Subtotal', value: 'subtotal' },
        { text: 'Acción', value: 'accion', sortable: false }
      ]
    };
  }
}
</script>