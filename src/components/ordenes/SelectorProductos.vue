<template>
  <div class="selector-productos">
    <!-- Filtros: búsqueda y categoría -->
    <div class="filtros mb-4">
      <v-text-field
        v-model="busqueda"
        label="Buscar producto o servicio"
        prepend-inner-icon="mdi-magnify"
        clearable
        density="compact"
        variant="outlined"
        class="flex-grow-1"
        @input="categoriaSeleccionada = null"
      />

      <v-select
        v-model="categoriaSeleccionada"
        :items="categoriasDisponibles"
        label="Filtrar por categoría"
        prepend-inner-icon="mdi-shape"
        clearable
        density="compact"
        variant="outlined"
        class="flex-grow-1"
        @update:modelValue="busqueda = ''"
      />
    </div>

    <!-- Tabla de productos -->
    <v-data-table
      :headers="headers"
      :items="filtrados"
      item-value="id"
      dense
      class="elevation-1"
      :items-per-page="5"
      :items-per-page-options="[5, 10, 15, { value: -1, title: 'Todos' }]"
    >
      <template #item.precio="{ item }">
        Q {{ Number(item.precio).toFixed(2) }}
      </template>

      <template #item.categoria="{ item }">
        {{ item.categoria?.nombre || '-' }}
      </template>

      <template #item.cantidad="{ item }">
        <v-text-field
          v-model.number="cantidades[item.id]"
          type="number"
          min="1"
          :max="item.tipo === 'servicio' ? null : item.stock"
          dense
          hide-details
          style="width: 60px"
        />
      </template>

      <template #item.accion="{ item }">
        <v-btn
          icon
          @click="agregar(item)"
          :disabled="item.tipo !== 'servicio' && item.stock <= 0"
          color="primary"
        >
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Snackbar de confirmación -->
    <v-snackbar v-model="mensajeVisible" :timeout="3000" color="success">
      {{ mensaje }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'SelectorProductos',
  data() {
    return {
      busqueda: '',
      categoriaSeleccionada: null,
      items: [],
      cantidades: [],
      mensaje: '',
      mensajeVisible: false,
      headers: [
        { text: 'Nombre', value: 'nombre' },
        { text: 'Tipo', value: 'tipo' },
        { text: 'Precio', value: 'precio' },
        { text: 'Stock', value: 'stock' },
        { text: 'Categoría', value: 'categoria' },
        { text: 'Cantidad', value: 'cantidad', sortable: false },
        { text: 'Agregar', value: 'accion', sortable: false }
      ]
    }
  },
  computed: {
    categoriasDisponibles() {
      const nombres = this.items
        .map(i => i.categoria?.nombre)
        .filter(Boolean)
      return [...new Set(nombres)]
    },
    filtrados() {
      const texto = this.busqueda.toLowerCase()
      return this.items.filter(i => {
        const coincideTexto =
          !this.busqueda ||
          i.nombre.toLowerCase().includes(texto) ||
          i.tipo.toLowerCase().includes(texto)

        const coincideCategoria =
          !this.categoriaSeleccionada ||
          i.categoria?.nombre === this.categoriaSeleccionada

        return coincideTexto && coincideCategoria
      })
    }
  },
  methods: {
    async cargarItems() {
      try {
        const apiBase = process.env.VUE_APP_API_URL
        const res = await fetch(`${apiBase}/items/all`)
        const data = await res.json()
        this.items = data
        this.items.forEach(i => (this.cantidades[i.id] = 1))
      } catch (err) {
        console.error('Error al cargar items', err)
      }
    },
    agregar(item) {
      const cantidad = this.cantidades[item.id] || 1

      if (cantidad < 1) {
        this.mostrarMensaje("Cantidad inválida", true)
        return
      }

      if (item.tipo !== 'servicio' && cantidad > item.stock) {
        this.mostrarMensaje("La cantidad supera el stock disponible", true)
        return
      }

      this.$emit('agregar', {
        itemId: item.id,
        nombre: item.nombre,
        cantidad,
        precio_unitario: parseFloat(item.precio),
        subtotal: cantidad * parseFloat(item.precio)
      })

      this.mostrarMensaje("Producto agregado a la orden")
      this.cantidades[item.id] = 1
    },
    mostrarMensaje(msg) {
      this.mensaje = msg
      this.mensajeVisible = true
    }
  },
  mounted() {
    this.cargarItems()
  }
}
</script>

<style scoped>
.selector-productos {
  margin-top: 16px;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flex-grow-1 {
  flex: 1 1 300px;
  min-width: 200px;
}
</style>
