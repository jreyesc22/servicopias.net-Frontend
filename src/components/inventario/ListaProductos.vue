<template>
  <v-card elevation="2">
    <!-- Header con gradiente -->
    <v-card-title class="bg-primary text-white d-flex align-center">
      <v-icon class="mr-3">mdi-package-variant</v-icon>
      <span>Productos y Servicios</span>
      <v-spacer />
      <v-chip color="white" variant="outlined" size="small">
        {{ items.length }} items
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Barra de búsqueda -->
      <v-row dense align="center" class="mb-4">
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="busqueda"
            label="Buscar por nombre o tipo"
            density="compact"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-magnify"
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
            <th class="text-center">Imagen</th>
            <th class="text-center">PDF</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginados" :key="item.id">
            <td class="font-weight-medium">{{ item.nombre }}</td>
            <td>
              <v-chip :color="item.tipo === 'producto' ? 'blue' : 'green'" size="small" variant="tonal">
                <v-icon start size="small">{{ item.tipo === 'producto' ? 'mdi-package' : 'mdi-tools' }}</v-icon>
                {{ item.tipo }}
              </v-chip>
            </td>
            <td class="font-weight-bold">Q {{ Number(item.precio).toFixed(2) }}</td>
            <td>
              <v-chip 
                v-if="item.stock !== null && item.stock !== undefined" 
                :color="item.stock > 0 ? 'success' : 'error'" 
                size="small" 
                variant="tonal"
              >
                {{ item.stock }}
              </v-chip>
              <span v-else class="text-grey">-</span>
            </td>
            <td>
              <v-chip v-if="item.categoria?.nombre" color="purple" size="small" variant="tonal">
                {{ item.categoria.nombre }}
              </v-chip>
              <span v-else class="text-grey">-</span>
            </td>
            <td>
              <code v-if="item.codigo_barras" class="text-caption">{{ item.codigo_barras }}</code>
              <span v-else class="text-grey">-</span>
            </td>
            <td class="text-center">
              <v-tooltip :text="item.imagen_url ? 'Ver imagen' : 'Sin imagen'">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    v-bind="props"
                    :disabled="!item.imagen_url"
                    @click="verImagen(item)"
                  >
                    <v-icon size="small">{{ item.imagen_url ? 'mdi-image' : 'mdi-image-off' }}</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </td>
            <td class="text-center">
              <v-tooltip text="Ver PDF">
                <template #activator="{ props }">
                  <v-btn 
                    v-if="item.pdf_url" 
                    icon 
                    size="small"
                    variant="tonal"
                    color="red"
                    v-bind="props"
                    :href="resolveMediaUrl(item.pdf_url)" 
                    target="_blank"
                  >
                    <v-icon size="small">mdi-file-pdf-box</v-icon>
                  </v-btn>
                  <v-icon v-else color="grey-lighten-1" size="small">mdi-file-pdf-box</v-icon>
                </template>
              </v-tooltip>
            </td>
            <td class="text-center">
              <v-tooltip text="Editar">
                <template #activator="{ props }">
                  <v-btn 
                    icon 
                    size="small"
                    variant="tonal"
                    color="info"
                    v-bind="props" 
                    @click="$emit('editar', item)"
                  >
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Eliminar">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="error"
                    v-bind="props"
                    @click="confirmarEliminar(item)"
                    class="ml-1"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- paginación manual -->
      <div class="d-flex justify-end align-center mt-4">
        <v-btn icon size="small" @click="pagina--" :disabled="pagina <= 1">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <span class="mx-3 text-body-2">Página {{ pagina }} / {{ totalPaginas }}</span>
        <v-btn icon size="small" @click="pagina++" :disabled="pagina >= totalPaginas">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </v-card-text>

    <!-- Diálogo previsualización imagen -->
    <v-dialog v-model="dialogImagen" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-image</v-icon>
          <span class="text-truncate">{{ imagenActualNombre || 'Imagen' }}</span>
          <v-spacer />
          <v-btn icon variant="text" @click="dialogImagen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-img
            v-if="imagenActualUrl"
            :src="imagenActualUrl"
            :alt="imagenActualNombre"
            max-height="520"
            contain
          />
          <div v-else class="text-grey">Sin imagen</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo confirmación eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Confirmar eliminación
        </v-card-title>
        <v-card-text class="pa-4">
          ¿Está seguro que desea eliminar <strong>{{ productoAEliminar?.nombre }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn color="grey" variant="outlined" @click="dialogEliminar = false">Cancelar</v-btn>
          <v-btn color="error" @click="eliminarConfirmado">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { resolveMediaUrl } from '@/utils/mediaUrl'

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
      dialogImagen: false,
      imagenActualUrl: null,
      imagenActualNombre: '',
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
    resolveMediaUrl,
    verImagen(item) {
      if (!item?.imagen_url) return
      this.imagenActualUrl = resolveMediaUrl(item.imagen_url)
      this.imagenActualNombre = item.nombre || ''
      this.dialogImagen = true
    },
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
  border-radius: 8px;
  overflow: hidden;
}

.v-table thead tr th {
  background-color: #f5f5f5;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.v-table tbody tr:hover {
  background-color: #f9f9f9;
}

code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.bg-error {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
}

.text-white {
  color: white !important;
}

@media (max-width: 767px) {
  .v-table {
    font-size: 12px;
  }
}
</style>
