<template>
  <div>
    <!-- Buscador -->
    <div class="d-flex align-center mb-4">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Buscar categoría o producto..."
        variant="outlined"
        density="compact"
        hide-details
        clearable
        style="max-width: 400px"
      />
      <v-spacer />
      <span v-if="filteredItems.length" class="text-caption text-grey mr-2">
        {{ filteredItems.length }} categoría{{ filteredItems.length !== 1 ? 's' : '' }} encontrada{{ filteredItems.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Estado vacío -->
    <v-card v-if="!loading && !items.length" elevation="0" border class="text-center py-10">
      <v-icon size="56" color="grey-lighten-2">mdi-shape-outline</v-icon>
      <div class="text-h6 text-grey mt-3">Sin datos para el periodo</div>
      <div class="text-caption text-grey-darken-1 mt-1">
        Selecciona un periodo y haz clic en Buscar
      </div>
    </v-card>

    <!-- Sin resultados de búsqueda -->
    <v-card v-else-if="!loading && items.length && !filteredItems.length" elevation="0" border class="text-center py-8">
      <v-icon size="48" color="grey-lighten-2">mdi-magnify-close</v-icon>
      <div class="text-h6 text-grey mt-2">Sin coincidencias</div>
      <div class="text-caption text-grey-darken-1">Intenta con otro término de búsqueda</div>
    </v-card>

    <!-- Skeleton de carga -->
    <div v-else-if="loading">
      <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-three-line" class="mb-3" />
    </div>

    <!-- Paneles expandibles por categoría -->
    <v-expansion-panels
      v-else
      v-model="expanded"
      multiple
      variant="accordion"
    >
      <v-expansion-panel
        v-for="cat in filteredItems"
        :key="cat.categoria_id"
        :value="cat.categoria_id"
        class="categoria-panel mb-2"
        elevation="1"
        rounded="lg"
      >
        <!-- Encabezado de categoría -->
        <v-expansion-panel-title class="py-3">
          <div class="d-flex align-center w-100 flex-wrap" style="gap: 8px;">
            <v-icon color="purple" class="mr-1">mdi-shape</v-icon>
            <span class="font-weight-bold text-body-1">{{ cat.categoria_nombre }}</span>
            <v-spacer />
            <div class="d-flex align-center" style="gap: 12px;">
              <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-package-variant-closed">
                {{ cat.total_categoria }} uds.
              </v-chip>
              <v-chip size="small" color="success" variant="tonal" prepend-icon="mdi-cash">
                Q {{ formatMoney(cat.ingresos_categoria) }}
              </v-chip>
              <v-chip size="small" color="grey" variant="tonal">
                {{ cat.productos?.length || 0 }} producto{{ (cat.productos?.length || 0) !== 1 ? 's' : '' }}
              </v-chip>
            </div>
          </div>
        </v-expansion-panel-title>

        <!-- Tabla de productos de la categoría -->
        <v-expansion-panel-text class="px-0">
          <v-data-table
            :items="cat.productos || []"
            :headers="productoHeaders"
            density="compact"
            hide-default-footer
            disable-pagination
            class="productos-tabla"
          >
            <!-- Nombre del producto -->
            <template #item.producto_nombre="{ item }">
              <span class="text-body-2">{{ item.producto_nombre }}</span>
            </template>

            <!-- Unidades vendidas con barra visual -->
            <template #item.total_vendido="{ item }">
              <div class="d-flex align-center" style="gap: 8px; min-width: 120px;">
                <v-progress-linear
                  :model-value="getPorcentajeUnidades(item.total_vendido, cat)"
                  color="primary"
                  height="6"
                  rounded
                  style="max-width: 60px;"
                />
                <span class="font-weight-medium">{{ item.total_vendido }}</span>
              </div>
            </template>

            <!-- Precio unitario -->
            <template #item.precio_unitario="{ item }">
              <span class="text-grey">Q {{ formatMoney(item.precio_unitario) }}</span>
            </template>

            <!-- Ingresos generados -->
            <template #item.ingresos_generados="{ item }">
              <span class="font-weight-medium text-success">
                Q {{ formatMoney(item.ingresos_generados) }}
              </span>
            </template>

            <!-- Pie con subtotal de categoría -->
            <template #bottom>
              <div class="d-flex justify-end align-center pa-3 bg-grey-lighten-4 subtotal-row">
                <span class="text-caption text-grey mr-4">Subtotal categoría</span>
                <span class="font-weight-bold">
                  {{ cat.total_categoria }} unidades &nbsp;·&nbsp;
                  Q {{ formatMoney(cat.ingresos_categoria) }}
                </span>
              </div>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRegistrosFormatters } from '@/components/composables/useRegistrosFormatters';

const props = defineProps({
  // Array de categorías: [{ categoria_id, categoria_nombre, total_categoria, ingresos_categoria, productos: [...] }]
  items:   { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false    },
});

const { formatMoney } = useRegistrosFormatters();

// Buscador — filtra por nombre de categoría O nombre de producto dentro de ella
const search = ref('');
const expanded = ref([]); // panel(es) abiertos — inicia vacío

const filteredItems = computed(() => {
  if (!search.value.trim()) return props.items;
  const term = search.value.toLowerCase().trim();
  return props.items.filter(cat =>
    cat.categoria_nombre?.toLowerCase().includes(term) ||
    cat.productos?.some(p => p.producto_nombre?.toLowerCase().includes(term))
  );
});

// Headers de la tabla interna de productos
const productoHeaders = [
  { title: 'Producto',          key: 'producto_nombre',   sortable: true  },
  { title: 'Unidades Vendidas', key: 'total_vendido',     sortable: true, align: 'start' },
  { title: 'Precio Unitario',   key: 'precio_unitario',   sortable: false, align: 'end'   },
  { title: 'Ingresos',          key: 'ingresos_generados',sortable: true,  align: 'end'   },
];

/**
 * Calcula el porcentaje de unidades de un producto respecto al total de la categoría.
 * Se usa para la barra de progreso visual.
 */
function getPorcentajeUnidades(totalVendido, cat) {
  const max = cat.total_categoria || 1;
  return Math.round((totalVendido / max) * 100);
}
</script>

<style scoped>
.categoria-panel {
  border-left: 3px solid transparent;
  transition: border-color 0.2s ease;
}

.categoria-panel:hover {
  border-left-color: var(--primary-color);
}

.productos-tabla :deep(thead tr th) {
  background-color: #fafafa !important;
  font-size: 0.7rem !important;
}

.subtotal-row {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
