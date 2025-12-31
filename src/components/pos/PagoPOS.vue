<template>
  <v-dialog v-model="dialogVisible" max-width="600" persistent>
    <v-card>
      <!-- Header -->
      <v-card-title class="bg-success text-white d-flex align-center">
        <v-icon class="mr-2">mdi-cash-register</v-icon>
        <span>Procesar Pago</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="cancelar" />
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Resumen de venta -->
        <v-card variant="tonal" color="primary" class="mb-4">
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-2">Total de la venta:</span>
              <span class="text-h5 font-weight-bold">Q {{ formatMoney(total) }}</span>
            </div>
            <div class="d-flex justify-space-between align-center text-caption">
              <span>{{ cantidadItems }} item{{ cantidadItems !== 1 ? 's' : '' }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Datos del cliente -->
        <v-card variant="outlined" class="mb-4">
          <v-card-subtitle class="font-weight-bold">
            <v-icon start>mdi-account</v-icon>
            Datos del Cliente
          </v-card-subtitle>
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="cliente.nombre"
                  label="Nombre"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cliente.telefono"
                  label="Teléfono (opcional)"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cliente.nit"
                  label="NIT"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-card-account-details"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Método de pago -->
        <v-card variant="outlined" class="mb-4">
          <v-card-subtitle class="font-weight-bold">
            <v-icon start>mdi-credit-card</v-icon>
            Método de Pago
          </v-card-subtitle>
          <v-card-text>
            <v-form ref="form" v-model="formValido">
              <!-- Chips de tipo de pago -->
              <div class="mb-3">
                <v-chip-group
                  v-model="tipoPagoChip"
                  mandatory
                  selected-class="text-primary"
                >
                  <v-chip value="completo" size="small" variant="outlined">
                    Pago Completo
                  </v-chip>
                  <v-chip value="credito" size="small" variant="outlined">
                    A Crédito
                  </v-chip>
                </v-chip-group>
              </div>

              <!-- Selector de método de pago (solo si paga) -->
              <v-select
                v-if="tipoPagoChip === 'completo'"
                v-model="tipoPago"
                :items="tiposDePago"
                item-title="nombre"
                item-value="id"
                label="Método de pago"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-credit-card"
                :rules="[reglasRequerido]"
              />

              <!-- Efectivo recibido (solo para efectivo) -->
              <v-text-field
                v-if="tipoPagoChip === 'completo' && tipoPago === efectivoId"
                v-model.number="efectivoRecibido"
                label="Efectivo recibido"
                type="number"
                step="0.01"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-cash"
                suffix="Q"
                :rules="[reglasRequerido, reglaMinimo]"
              />

              <!-- Mostrar cambio -->
              <v-expand-transition>
                <v-alert
                  v-if="tipoPagoChip === 'completo' && tipoPago === efectivoId && efectivoRecibido > total"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  <div class="d-flex justify-space-between align-center">
                    <span class="font-weight-bold">Cambio:</span>
                    <span class="text-h6">Q {{ formatMoney(cambio) }}</span>
                  </div>
                </v-alert>
              </v-expand-transition>

              <!-- Alerta de crédito -->
              <v-alert
                v-if="tipoPagoChip === 'credito'"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                La venta quedará pendiente de pago
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Acciones -->
      <v-card-actions class="pa-4 pt-0">
        <v-btn
          variant="outlined"
          @click="cancelar"
          :disabled="cargando"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn
          color="success"
          variant="elevated"
          size="large"
          prepend-icon="mdi-check-circle"
          :loading="cargando"
          :disabled="!puedeConfirmar"
          @click="confirmarVenta"
        >
          Confirmar Venta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    required: true
  },
  cantidadItems: {
    type: Number,
    required: true
  },
  cliente: {
    type: Object,
    required: true
  },
  tiposDePago: {
    type: Array,
    required: true,
    default: () => []
  },
  efectivoId: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar']);

// Estado del dialog
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Estado del formulario
const form = ref(null);
const formValido = ref(false);
const cargando = ref(false);

// Datos de pago
const tipoPagoChip = ref('completo');
const tipoPago = ref(props.efectivoId);
const efectivoRecibido = ref(null);

// Cliente local (copia)
const cliente = computed(() => props.cliente);

/**
 * Validaciones
 */
const reglasRequerido = (valor) => {
  return !!valor || 'Campo requerido';
};

const reglaMinimo = (valor) => {
  return valor >= props.total || `Debe ser mayor o igual a Q ${formatMoney(props.total)}`;
};

/**
 * Cambio calculado
 */
const cambio = computed(() => {
  if (tipoPagoChip.value === 'completo' && tipoPago.value === props.efectivoId) {
    return Math.max(0, (efectivoRecibido.value || 0) - props.total);
  }
  return 0;
});

/**
 * Puede confirmar
 */
const puedeConfirmar = computed(() => {
  if (tipoPagoChip.value === 'credito') {
    return true; // Crédito siempre puede confirmar
  }
  
  if (!tipoPago.value) {
    return false;
  }

  if (tipoPago.value === props.efectivoId) {
    return efectivoRecibido.value >= props.total;
  }

  return true;
});

/**
 * Formatear dinero
 */
const formatMoney = (valor) => {
  return parseFloat(valor || 0).toFixed(2);
};

/**
 * Confirmar venta
 */
const confirmarVenta = async () => {
  // Validar formulario si es pago completo
  if (tipoPagoChip.value === 'completo' && form.value) {
    const { valid } = await form.value.validate();
    if (!valid) {
      return;
    }
  }

  cargando.value = true;

  try {
    // Preparar datos de pago
    const datosPago = {
      pagaCompleto: tipoPagoChip.value === 'completo',
      tipoPagoId: tipoPagoChip.value === 'completo' ? tipoPago.value : null,
      efectivoRecibido: efectivoRecibido.value,
      cambio: cambio.value
    };

    // Emitir evento de confirmación
    emit('confirmar', datosPago);
  } finally {
    cargando.value = false;
  }
};

/**
 * Cancelar
 */
const cancelar = () => {
  emit('cancelar');
  dialogVisible.value = false;
};

/**
 * Resetear formulario cuando se abre
 */
watch(dialogVisible, (nuevo) => {
  if (nuevo) {
    tipoPagoChip.value = 'completo';
    tipoPago.value = props.efectivoId;
    efectivoRecibido.value = null;
  }
});
</script>

<style scoped>
.v-card-title {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
