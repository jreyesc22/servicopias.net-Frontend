<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6">Lista de Productos</v-card-title>

    <!-- Barra de búsqueda -->
    <v-row dense align="center" class="mb-2">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="busqueda"
          label="Buscar por nombre o tipo"
          density="compact"
          variant="outlined"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Tabla con control total -->
    <v-table density="comfortable" class="elevation-1">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Categoría</th>
          <th>Código</th>
          <th>Imagen</th>
          <th>PDF</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginados" :key="item.id">
          <td>{{ item.nombre }}</td>
          <td>{{ item.tipo }}</td>
          <td>Q {{ Number(item.precio).toFixed(2) }}</td>
          <td>{{ item.stock ?? '-' }}</td>
          <td>{{ item.categoria?.nombre || '-' }}</td>
          <td>{{ item.codigo_barras || '-' }}</td>
          <td>
            <a v-if="item.imagen_url" :href="item.imagen_url" target="_blank"></a>
          </td>
          <td>
            <a v-if="item.pdf_url" :href="item.pdf_url" target="_blank"></a>
          </td>
          <td>
            <v-tooltip text="Editar">
              <template #activator="{ props }">
                <v-btn icon v-bind="props" @click="$emit('editar', item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Eliminar">
              <template #activator="{ props }">
                <v-btn
                  icon
                  color="error"
                  v-bind="props"
                  @click="confirmarEliminar(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- paginación manual -->
    <div class="d-flex justify-end align-center mt-2">
      <v-btn icon @click="pagina--" :disabled="pagina <= 1">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <span class="mx-2">Página {{ pagina }} / {{ totalPaginas }}</span>
      <v-btn icon @click="pagina++" :disabled="pagina >= totalPaginas">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- Diálogo confirmación eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro que desea eliminar <strong>{{ productoAEliminar?.nombre }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="grey" @click="dialogEliminar = false">Cancelar</v-btn>
          <v-btn color="error" @click="eliminarConfirmado">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  name: 'ListaProductos',
  props: {
    items: Array
  },
  data() {
    return {
      busqueda: '',
      pagina: 1,
      porPagina: 5,
      dialogEliminar: false,
      productoAEliminar: null
    }
  },
  computed: {
    filtrados() {
      if (!this.busqueda.trim()) return this.items
      const b = this.busqueda.toLowerCase()
      return this.items.filter(
        item =>
          item.nombre.toLowerCase().includes(b) ||
          item.tipo.toLowerCase().includes(b)
      )
    },
    paginados() {
      const ini = (this.pagina - 1) * this.porPagina
      return this.filtrados.slice(ini, ini + this.porPagina)
    },
    totalPaginas() {
      return Math.ceil(this.filtrados.length / this.porPagina)
    }
  },
  watch: {
    busqueda() {
      this.pagina = 1
    },
    items() {
      this.pagina = 1
    }
  },
  methods: {
    confirmarEliminar(item) {
      this.productoAEliminar = item
      this.dialogEliminar = true
    },
    eliminarConfirmado() {
      this.$emit('eliminar', this.productoAEliminar.id)
      this.dialogEliminar = false
      this.productoAEliminar = null
    }
  }
}
</script>

<style scoped>
.v-table {
  font-size: 14px;
}
</style>
