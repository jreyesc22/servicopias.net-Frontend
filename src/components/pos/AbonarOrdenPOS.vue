<template>
  <v-dialog v-model="dialogVisible" max-width="700" persistent>
    <v-card v-if="orden">
      <!-- Header -->
      <v-card-title class="bg-success text-white d-flex align-center">
        <v-icon class="mr-2">mdi-cash-register</v-icon>
        <span>Procesar Pago - Orden #{{ orden.id }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="cancelar" :disabled="cargando" />
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row>
          <!-- Columna izquierda: Resumen -->
          <v-col cols="12" md="5">
            <!-- Resumen compacto -->
            <v-card variant="tonal" color="primary" class="mb-3" density="compact">
              <v-card-text class="pa-3">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-grey">Cliente:</span>
                  <span class="text-body-2 font-weight-medium">{{ orden.cliente_nombre || 'CF' }}</span>
                </div>
                <v-divider class="my-2" />
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption text-grey">Total:</span>
                  <span class="text-body-1 font-weight-bold">Q {{ formatMoney(orden.total) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption text-grey">Pagado:</span>
                  <span class="text-body-2 text-success">Q {{ formatMoney(orden.abonado || 0) }}</span>
                </div>
                <v-divider class="my-2" />
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2 font-weight-medium">Pendiente:</span>
                  <span class="text-h6 font-weight-bold text-primary">Q {{ formatMoney(saldoPendiente) }}</span>
                </div>
              </v-card-text>
            </v-card>

            <!-- Resumen del pago (cuando aplique) -->
            <v-expand-transition>
              <v-card 
                v-if="monto > 0"
                variant="flat" 
                color="grey-lighten-5"
                class="mb-3"
                density="compact"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption">A pagar:</span>
                    <span class="font-weight-bold">Q {{ formatMoney(monto) }}</span>
                  </div>
                  <div v-if="esEfectivo && cambio > 0" class="d-flex justify-space-between align-center text-success mb-1">
                    <span class="text-caption">Cambio:</span>
                    <span class="font-weight-bold">Q {{ formatMoney(cambio) }}</span>
                  </div>

                </v-card-text>
              </v-card>
            </v-expand-transition>
          </v-col>

          <!-- Columna derecha: Formulario -->
          <v-col cols="12" md="7">
            <v-form ref="form" v-model="formValido" @submit.prevent="registrarAbono">
              <!-- Fila de campos principales -->
              <v-row dense class="mb-2">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="tipoPago"
                    :items="tiposDePago"
                    item-title="nombre"
                    item-value="id"
                    label="Método"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-credit-card"
                    :rules="[reglasRequerido]"
                    required
                  />
                </v-col>
                
                <!-- Efectivo recibido (solo para efectivo) -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-if="esEfectivo"
                    v-model.number="efectivoRecibido"
                    label="Efectivo recibido"
                    type="number"
                    step="0.01"
                    min="0"
                    variant="outlined"
                    density="compact"
                    prefix="Q"
                    prepend-inner-icon="mdi-cash-100"
                    :rules="reglasValidacionEfectivo"
                    hint="Ingrese el efectivo recibido del cliente"
                    persistent-hint
                    required
                  />
                  <div v-else class="text-caption text-grey px-3 py-3">
                    Monto a pagar: Q {{ formatMoney(monto) }}
                  </div>
                </v-col>
              </v-row>

              <!-- Número de documento (cuando aplique) -->
              <v-slide-y-transition>
                <v-text-field
                  v-if="requiereNumeroRecibo"
                  v-model="numeroRecibo"
                  :label="etiquetaDocumento"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-file-document"
                  :rules="reglasNumeroRecibo"
                  class="mb-2"
                  required
                />
              </v-slide-y-transition>

              <!-- Observaciones compactas -->
              <v-textarea
                v-model="observacion"
                label="Observaciones (opcional)"
                variant="outlined"
                density="compact"
                rows="2"
                prepend-inner-icon="mdi-note-text"
                class="mb-3"
              />

              <!-- Botones compactos -->
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    block
                    @click="cancelar"
                    :disabled="cargando"
                    size="large"
                  >
                    <v-icon start>mdi-close-circle</v-icon>
                    Cancelar
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    type="submit"
                    color="success"
                    block
                    :loading="cargando"
                    :disabled="!formularioCompleto"
                    size="large"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    {{ textoBoton }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import abonosService from '@/services/abonos.service';
import { printerService } from '@/services/printer.service';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orden: {
    type: Object,
    required: false,
    default: null
  },
  empleadoId: {
    type: Number,
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

const emit = defineEmits(['update:modelValue', 'abono-registrado', 'cancelar']);

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
const tipoPago = ref(props.efectivoId);
const monto = ref(null);
const efectivoRecibido = ref(null);
const numeroRecibo = ref('');
const observacion = ref('');

/**
 * Normalización de IDs (Vuetify puede devolver strings)
 */
const efectivoIdNum = computed(() => Number(props.efectivoId));
const tipoPagoIdNum = computed(() => Number(tipoPago.value));
const esEfectivo = computed(() => tipoPagoIdNum.value === efectivoIdNum.value);

const montoNum = computed(() => {
  const n = Number(monto.value);
  return Number.isFinite(n) ? n : 0;
});

const efectivoRecibidoNum = computed(() => {
  const n = Number(efectivoRecibido.value);
  return Number.isFinite(n) ? n : 0;
});

/**
 * Computed - Cálculos
 */
const saldoPendiente = computed(() => {
  if (!props.orden) return 0;
  return parseFloat(props.orden.saldo_pendiente) || parseFloat(props.orden.total) || 0;
});

const tipoPagoNombre = computed(() => {
  const tipo = props.tiposDePago.find(t => Number(t.id) === tipoPagoIdNum.value);
  return tipo?.nombre?.toLowerCase() || '';
});

const cambio = computed(() => {
  if (!esEfectivo.value) {
    return 0;
  }
  const recibido = efectivoRecibidoNum.value;
  const montoVal = montoNum.value;
  return Math.max(0, recibido - montoVal);
});

const saldoRestante = computed(() => {
  const montoVal = montoNum.value;
  return Math.max(0, saldoPendiente.value - montoVal);
});

const etiquetaDocumento = computed(() => {
  const tipoPagoName = tipoPagoNombre.value;
  if (tipoPagoName.includes('transferencia')) return 'Número de transferencia';
  if (tipoPagoName.includes('tc') || tipoPagoName.includes('tarjeta')) return 'Número de autorización';
  if (tipoPagoName.includes('cheque')) return 'Número de cheque';
  if (tipoPagoName.includes('móvil')) return 'Número de referencia';
  return 'Número de comprobante';
});

const textoBoton = computed(() => {
  return 'Procesar';
});

const requiereNumeroRecibo = computed(() => {
  if (esEfectivo.value) {
    return false;
  }
  
  const tipoPagoName = tipoPagoNombre.value;
  return tipoPagoName.includes('transferencia') || 
         tipoPagoName.includes('tc') || 
         tipoPagoName.includes('tarjeta') ||
         tipoPagoName.includes('cheque') ||
         tipoPagoName.includes('crédito') ||
         tipoPagoName.includes('móvil');
});

const tipoComprobanteTexto = computed(() => {
  const tipoPagoName = tipoPagoNombre.value;
  if (tipoPagoName.includes('transferencia')) return 'transferencia';
  if (tipoPagoName.includes('tc') || tipoPagoName.includes('tarjeta')) return 'autorización';
  if (tipoPagoName.includes('cheque')) return 'cheque';
  if (tipoPagoName.includes('móvil')) return 'referencia';
  return 'comprobante';
});

const formularioCompleto = computed(() => {
  if (!props.orden || !tipoPago.value) return false;

  const montoValido = montoNum.value > 0;
  const efectivoValido = !esEfectivo.value || (Number.isFinite(Number(efectivoRecibido.value)) && efectivoRecibidoNum.value >= montoNum.value);
  const reciboValido = !requiereNumeroRecibo.value || !!numeroRecibo.value?.trim();
  
  return montoValido && efectivoValido && reciboValido;
});

/**
 * Validaciones
 */
const reglasRequerido = (valor) => {
  return !!valor || 'Campo requerido';
};

const reglasValidacionMonto = [
  v => !!v || 'Ingrese el monto del abono',
  v => v > 0 || 'El monto debe ser mayor a 0',
  v => v <= saldoPendiente.value || `No puede superar Q ${formatMoney(saldoPendiente.value)}`
];

const reglasValidacionEfectivo = computed(() => [
  v => !!v || 'Ingrese el efectivo recibido',
  v => Number(v) >= montoNum.value || `El efectivo debe ser mayor o igual a Q ${formatMoney(montoNum.value)}`
]);

const reglasNumeroRecibo = computed(() => [
  v => !!v || `Número de ${tipoComprobanteTexto.value} es requerido`
]);

/**
 * Formatear dinero
 */
const formatMoney = (valor) => {
  const numero = parseFloat(valor);
  return isNaN(numero) ? '0.00' : numero.toFixed(2);
};



/**
 * Registrar abono
 */
const registrarAbono = async () => {
  if (!props.orden) {
    alert('Error: No hay orden para procesar');
    return;
  }

  if (!formularioCompleto.value) {
    return;
  }
  
  if (requiereNumeroRecibo.value && !numeroRecibo.value?.trim()) {
    return;
  }

  cargando.value = true;

  try {
    const payload = {
      ordenId: props.orden.id,
      tipoPagoId: tipoPagoIdNum.value,
      monto: montoNum.value,
      numero_recibo: requiereNumeroRecibo.value ? numeroRecibo.value.trim() : null,
      empleadoId: props.empleadoId,
      observacion: observacion.value?.trim() || null
    };

    const data = await abonosService.registrarAbono(payload);
    
    // Abrir cajón de dinero si es efectivo
    if (esEfectivo.value) {
      try {
        await printerService.abrirCajon();
      } catch (errorCajon) {
        console.warn('No se pudo abrir el cajón:', errorCajon.message);
      }
    }
    
    const cambioCalculado = esEfectivo.value && efectivoRecibidoNum.value > montoNum.value
      ? efectivoRecibidoNum.value - montoNum.value
      : 0;
    
    // Emitir evento con información completa
    emit('abono-registrado', {
      abono: data.data,
      monto: montoNum.value,
      cambio: cambioCalculado,
      efectivoRecibido: esEfectivo.value ? efectivoRecibidoNum.value : null,
      tipoPago: props.tiposDePago.find(t => Number(t.id) === tipoPagoIdNum.value)?.nombre || 'Desconocido',
      tipoPagoId: tipoPagoIdNum.value,
      estadoPago: data.estado_pago,
      abonado: data.abonado,
      saldoPendiente: data.saldo_pendiente,
      ordenCompletada: data.estado_pago === 'pagado',
      numeroRecibo: numeroRecibo.value || null
    });

    // Cerrar dialog
    dialogVisible.value = false;
    
    // Resetear después de cerrar
    await nextTick();
    resetForm();

  } catch (error) {
    console.error('Error al registrar abono:', error);
    alert(error.message || 'Error al registrar abono');
  } finally {
    cargando.value = false;
  }
};

/**
 * Cancelar y eliminar orden
 */
const cancelar = async () => {
  // Preguntar confirmación
  if (!confirm('¿Cancelar el pago? La orden será eliminada.')) {
    return;
  }

  emit('cancelar');
  dialogVisible.value = false;
  
  // Resetear al cerrar
  await nextTick();
  resetForm();
};

/**
 * Resetear formulario
 */
const resetForm = () => {
  monto.value = null;
  tipoPago.value = efectivoIdNum.value;
  numeroRecibo.value = '';
  observacion.value = '';
  efectivoRecibido.value = null;
  formValido.value = false;
};

/**
 * Inicializar formulario con datos de la orden
 */
const inicializarFormulario = () => {
  if (!props.orden) return;
  
  const saldo = parseFloat(props.orden.saldo_pendiente) || parseFloat(props.orden.total) || 0;
  
  tipoPago.value = efectivoIdNum.value;
  monto.value = saldo;
  efectivoRecibido.value = saldo;
  numeroRecibo.value = '';
  observacion.value = '';
};

/**
 * Watch: Inicializar cuando se abre el modal
 */
watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return;
    if (!props.orden) return;
    await nextTick();
    inicializarFormulario();
  },
  { immediate: true }
);

watch(
  () => props.orden?.id,
  async (ordenId) => {
    if (!props.modelValue) return;
    if (!ordenId) return;
    await nextTick();
    inicializarFormulario();
  },
  { immediate: true }
);

watch(
  () => tipoPago.value,
  (nuevo) => {
    // Forzar tipo numérico (evita fallos en v-if y comparaciones)
    const coerced = Number(nuevo);
    if (Number.isFinite(coerced) && coerced !== nuevo) {
      tipoPago.value = coerced;
    }
  }
);

onMounted(async () => {
  // Respaldo: si el componente se monta ya visible, los watch sin immediate no correrían.
  if (props.modelValue && props.orden) {
    await nextTick();
    inicializarFormulario();
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
