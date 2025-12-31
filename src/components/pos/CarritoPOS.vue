<template>
  <v-card elevation="2" class="carrito-pos-card">
    <!-- Header -->
    <v-card-title class="d-flex align-center bg-primary text-white">
      <v-icon class="mr-2">mdi-cart</v-icon>
      <span>Carrito de Venta</span>
      <v-spacer />
      <v-chip color="white" variant="outlined" size="small">
        {{ cantidadItems }} item{{ cantidadItems !== 1 ? 's' : '' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-0">
      <!-- Carrito vacío -->
      <v-alert
        v-if="items.length === 0"
        type="info"
        variant="tonal"
        class="ma-4"
      >
        <v-icon start>mdi-cart-outline</v-icon>
        El carrito está vacío. Escanee o agregue productos.
      </v-alert>

      <!-- Tabla de items -->
      <v-table v-else density="comfortable" class="carrito-table">
        <thead>
          <tr>
            <th class="text-left">Producto</th>
            <th class="text-center">Precio</th>
            <th class="text-center" style="width: 150px;">Cantidad</th>
            <th class="text-right">Subtotal</th>
            <th class="text-center" style="width: 60px;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="carrito-item">
            <td>
              <div class="d-flex align-center">
                <v-avatar v-if="item.imagen_url" size="40" class="mr-2">
                  <v-img :src="item.imagen_url" cover />
                </v-avatar>
                <v-icon v-else class="mr-2" color="grey">mdi-package-variant</v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.nombre }}</div>
                  <div v-if="item.codigo_barras" class="text-caption text-grey">
                    {{ item.codigo_barras }}
                  </div>
                </div>
              </div>
            </td>
            <td class="text-center">
              Q {{ formatMoney(item.precio) }}
            </td>
            <td class="text-center">
              <v-btn-group density="compact" divided>
                <v-btn
                  icon="mdi-minus"
                  size="small"
                  @click="decrementarCantidad(item)"
                />
                <v-text-field
                  :model-value="item.cantidad"
                  type="number"
                  variant="plain"
                  density="compact"
                  hide-details
                  style="width: 60px;"
                  class="text-center"
                  @update:model-value="actualizarCantidad(item, $event)"
                />
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  @click="incrementarCantidad(item)"
                />
              </v-btn-group>
            </td>
            <td class="text-right font-weight-bold">
              Q {{ formatMoney(item.precio * item.cantidad) }}
            </td>
            <td class="text-center">
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="eliminarItem(item)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Resumen de totales -->
      <v-divider v-if="items.length > 0" />
      <div v-if="items.length > 0" class="pa-4">
        <v-row dense>
          <v-col cols="6" class="text-right text-grey">
            <strong>Subtotal:</strong>
          </v-col>
          <v-col cols="6" class="text-right">
            <strong>Q {{ formatMoney(subtotal) }}</strong>
          </v-col>
        </v-row>
        
        <!-- Descuento (si existe) -->
        <v-row v-if="descuento > 0" dense>
          <v-col cols="6" class="text-right text-grey">
            <strong>Descuento:</strong>
          </v-col>
          <v-col cols="6" class="text-right text-error">
            <strong>- Q {{ formatMoney(descuento) }}</strong>
          </v-col>
        </v-row>

        <v-divider class="my-2" />
        
        <v-row dense>
          <v-col cols="6" class="text-right text-h6">
            <strong>TOTAL:</strong>
          </v-col>
          <v-col cols="6" class="text-right text-h5 text-primary">
            <strong>Q {{ formatMoney(total) }}</strong>
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <!-- Acciones del carrito -->
    <v-card-actions v-if="items.length > 0" class="pa-4 pt-0">
      <v-btn
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete-sweep"
        @click="confirmarVaciar"
      >
        Vaciar
      </v-btn>
      <v-spacer />
      <v-btn
        color="success"
        variant="elevated"
        size="large"
        prepend-icon="mdi-cash-register"
        @click="$emit('procesar-venta')"
      >
        Procesar Venta
      </v-btn>
    </v-card-actions>

    <!-- Dialog de confirmación -->
    <v-dialog v-model="dialogVaciar" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          ¿Vaciar carrito?
        </v-card-title>
        <v-card-text>
          Se eliminarán todos los items del carrito. Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogVaciar = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="elevated" @click="vaciarCarrito">
            Vaciar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  descuento: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'actualizar-cantidad',
  'eliminar-item',
  'vaciar-carrito',
  'procesar-venta'
]);

// Estado
const dialogVaciar = ref(false);

/**
 * Computed - Cálculos
 */
const cantidadItems = computed(() => {
  return props.items.reduce((sum, item) => sum + item.cantidad, 0);
});

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => {
    return sum + (item.precio * item.cantidad);
  }, 0);
});

const total = computed(() => {
  return Math.max(0, subtotal.value - props.descuento);
});

/**
 * Formatear dinero
 */
const formatMoney = (valor) => {
  return parseFloat(valor || 0).toFixed(2);
};

/**
 * Incrementar cantidad
 */
const incrementarCantidad = (item) => {
  emit('actualizar-cantidad', item.id, item.cantidad + 1);
};

/**
 * Decrementar cantidad
 */
const decrementarCantidad = (item) => {
  if (item.cantidad > 1) {
    emit('actualizar-cantidad', item.id, item.cantidad - 1);
  }
};

/**
 * Actualizar cantidad manualmente
 */
const actualizarCantidad = (item, nuevaCantidad) => {
  const cantidad = parseInt(nuevaCantidad);
  if (!isNaN(cantidad) && cantidad > 0) {
    emit('actualizar-cantidad', item.id, cantidad);
  }
};

/**
 * Eliminar item
 */
const eliminarItem = (item) => {
  emit('eliminar-item', item.id);
};

/**
 * Confirmar vaciado
 */
const confirmarVaciar = () => {
  dialogVaciar.value = true;
};

/**
 * Vaciar carrito
 */
const vaciarCarrito = () => {
  emit('vaciar-carrito');
  dialogVaciar.value = false;
};
</script>

<style scoped>
.carrito-pos-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.carrito-table {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
}

.carrito-item {
  transition: background-color 0.2s;
}

.carrito-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-text-field input[type="number"]) {
  text-align: center;
  -moz-appearance: textfield;
}

:deep(.v-text-field input[type="number"]::-webkit-outer-spin-button),
:deep(.v-text-field input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
