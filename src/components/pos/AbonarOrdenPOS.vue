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
                  <div v-if="tipoPago === efectivoId && efectivoRecibido > monto" class="d-flex justify-space-between align-center text-success mb-1">
                    <span class="text-caption">Cambio:</span>
                    <span class="font-weight-bold">Q {{ formatMoney(cambio) }}</span>
                  </div>
                  <div v-if="tipoPagoSeleccionado === 'parcial'" class="d-flex justify-space-between align-center text-warning">
                    <span class="text-caption">Nuevo saldo:</span>
                    <span class="font-weight-bold">Q {{ formatMoney(saldoRestante) }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-expand-transition>
          </v-col>

          <!-- Columna derecha: Formulario -->
          <v-col cols="12" md="7">
            <v-form ref="form" v-model="formValido" @submit.prevent="registrarAbono">
              <!-- Tipo de pago en fila -->
              <div class="mb-3">
                <div class="text-body-2 font-weight-medium mb-2">Tipo de pago</div>
                <v-chip-group
                  v-model="tipoPagoChip"
                  mandatory
                  selected-class="text-primary"
                  @update:model-value="actualizarTipoPago"
                >
                  <v-chip value="completo" size="small" variant="outlined">
                    Completo
                  </v-chip>
                  <v-chip value="parcial" size="small" variant="outlined">
                    Parcial
                  </v-chip>
                </v-chip-group>
              </div>

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
                
                <!-- Monto (parcial) o Efectivo recibido -->
                <v-col cols="12" sm="6">
                  <v-slide-y-transition>
                    <v-text-field
                      v-if="tipoPagoSeleccionado === 'parcial'"
                      v-model.number="monto"
                      label="Monto abono"
                      type="number"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prefix="Q"
                      prepend-inner-icon="mdi-cash"
                      :rules="reglasValidacionMonto"
                      @input="validarMonto"
                      required
                    />
                    <v-text-field
                      v-else-if="tipoPago === efectivoId"
                      v-model.number="efectivoRecibido"
                      label="Efectivo recibido"
                      type="number"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prefix="Q"
                      prepend-inner-icon="mdi-cash-100"
                      :rules="reglasValidacionEfectivo"
                      hint="Ingrese el efectivo recibido del cliente"
                      required
                    />
                    <div v-else class="text-caption text-grey px-3">
                      Monto a pagar: Q {{ formatMoney(monto) }}
                    </div>
                  </v-slide-y-transition>
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
import { ref, computed, watch, nextTick } from 'vue';
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
const tipoPagoChip = ref('completo');
const tipoPago = ref(props.efectivoId);
const monto = ref(null);
const efectivoRecibido = ref(null);
const numeroRecibo = ref('');
const observacion = ref('');

/**
 * Computed - Cálculos
 */
const saldoPendiente = computed(() => {
  if (!props.orden) return 0;
  return parseFloat(props.orden.saldo_pendiente) || parseFloat(props.orden.total) || 0;
});

const tipoPagoSeleccionado = computed(() => {
  return tipoPagoChip.value === 'completo' ? 'completo' : 'parcial';
});

const tipoPagoNombre = computed(() => {
  const tipo = props.tiposDePago.find(t => t.id === tipoPago.value);
  return tipo?.nombre?.toLowerCase() || '';
});

const cambio = computed(() => {
  if (tipoPago.value !== props.efectivoId || !efectivoRecibido.value) {
    return 0;
  }
  const recibido = parseFloat(efectivoRecibido.value) || 0;
  const montoVal = parseFloat(monto.value) || 0;
  return Math.max(0, recibido - montoVal);
});

const saldoRestante = computed(() => {
  const montoVal = parseFloat(monto.value) || 0;
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
  return tipoPagoSeleccionado.value === 'completo' ? 'Pagar Total' : 'Registrar Abono';
});

const requiereNumeroRecibo = computed(() => {
  if (tipoPago.value === props.efectivoId) {
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
  // Validar que exista orden
  if (!props.orden) {
    console.log('formularioCompleto: No hay orden');
    return false;
  }

  // Validar tipo de pago seleccionado
  if (!tipoPago.value) {
    console.log('formularioCompleto: No hay tipo de pago');
    return false;
  }

  if (tipoPagoSeleccionado.value === 'completo') {
    const montoValido = monto.value > 0;
    const efectivoValido = tipoPago.value !== props.efectivoId || (efectivoRecibido.value && efectivoRecibido.value >= monto.value);
    const reciboValido = !requiereNumeroRecibo.value || !!numeroRecibo.value?.trim();
    
    console.log('🔍 Validación COMPLETO:', {
      tipoPagoSeleccionado: tipoPagoSeleccionado.value,
      monto: monto.value,
      montoValido,
      efectivoRecibido: efectivoRecibido.value,
      efectivoId: props.efectivoId,
      tipoPago: tipoPago.value,
      efectivoValido,
      requiereRecibo: requiereNumeroRecibo.value,
      numeroRecibo: numeroRecibo.value,
      reciboValido,
      resultado: montoValido && efectivoValido && reciboValido
    });
    
    return montoValido && efectivoValido && reciboValido;
  } else {
    const montoValido = monto.value > 0 && monto.value <= saldoPendiente.value;
    const reciboValido = !requiereNumeroRecibo.value || !!numeroRecibo.value?.trim();
    
    console.log('🔍 Validación PARCIAL:', {
      monto: monto.value,
      saldoPendiente: saldoPendiente.value,
      montoValido,
      requiereRecibo: requiereNumeroRecibo.value,
      reciboValido,
      resultado: montoValido && reciboValido
    });
    
    return montoValido && reciboValido;
  }
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
  v => v >= monto.value || 'El efectivo debe ser mayor o igual al monto'
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
 * Actualizar tipo de pago
 */
const actualizarTipoPago = () => {
  console.log('🔄 Cambiando tipo de pago a:', tipoPagoChip.value);
  
  if (tipoPagoChip.value === 'completo') {
    monto.value = saldoPendiente.value;
    // Pre-llenar efectivo recibido con el monto exacto para pago completo
    if (tipoPago.value === props.efectivoId) {
      efectivoRecibido.value = saldoPendiente.value;
    }
  } else {
    // Parcial - sugerir 50% del saldo
    monto.value = Math.round(saldoPendiente.value * 0.5 * 100) / 100;
    efectivoRecibido.value = null;
  }
  
  console.log('✅ Valores actualizados:', {
    monto: monto.value,
    efectivoRecibido: efectivoRecibido.value
  });
};

/**
 * Validar monto
 */
const validarMonto = () => {
  const montoVal = parseFloat(monto.value);
  if (montoVal > saldoPendiente.value) {
    // Se maneja con las reglas de validación
  }
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
      tipoPagoId: tipoPago.value,
      monto: parseFloat(monto.value),
      numero_recibo: requiereNumeroRecibo.value ? numeroRecibo.value.trim() : null,
      empleadoId: props.empleadoId,
      observacion: observacion.value?.trim() || null
    };

    const data = await abonosService.registrarAbono(payload);
    
    // Abrir cajón de dinero si es efectivo
    if (tipoPago.value === props.efectivoId) {
      try {
        await printerService.abrirCajon();
      } catch (errorCajon) {
        console.warn('No se pudo abrir el cajón:', errorCajon.message);
      }
    }
    
    const cambioCalculado = tipoPago.value === props.efectivoId && efectivoRecibido.value > monto.value
      ? efectivoRecibido.value - monto.value
      : 0;
    
    // Emitir evento con información completa
    emit('abono-registrado', {
      abono: data.data,
      monto: parseFloat(monto.value),
      cambio: cambioCalculado,
      efectivoRecibido: efectivoRecibido.value || null,
      tipoPago: props.tiposDePago.find(t => t.id === tipoPago.value)?.nombre || 'Desconocido',
      tipoPagoId: tipoPago.value,
      estadoPago: data.estado_pago,
      abonado: data.abonado,
      saldoPendiente: data.saldo_pendiente,
      ordenCompletada: data.estado_pago === 'pagado',
      numeroRecibo: numeroRecibo.value || null
    });

    // Cerrar dialog
    dialogVisible.value = false;
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
  resetForm();
};

/**
 * Resetear formulario
 */
const resetForm = () => {
  monto.value = null;
  tipoPago.value = props.efectivoId;
  numeroRecibo.value = '';
  observacion.value = '';
  efectivoRecibido.value = null;
  formValido.value = false;
};

/**
 * Watch para inicializar cuando se abre
 */
watch(dialogVisible, async (nuevo) => {
  console.log('👁️ Dialog visible cambió a:', nuevo);
  if (nuevo && props.orden) {
    // Esperar al siguiente tick para asegurar que el DOM esté listo
    await nextTick();
    
    // Inicializar valores
    tipoPagoChip.value = 'completo';
    tipoPago.value = props.efectivoId;
    monto.value = saldoPendiente.value;
    numeroRecibo.value = '';
    observacion.value = '';
    
    // Importante: usar nextTick otra vez para asegurar que efectivoRecibido se aplique
    await nextTick();
    efectivoRecibido.value = saldoPendiente.value;
    
    console.log('✅ Modal inicializado:', {
      tipoPagoChip: tipoPagoChip.value,
      monto: monto.value,
      efectivoRecibido: efectivoRecibido.value,
      saldoPendiente: saldoPendiente.value
    });
  }
});

watch(() => props.tiposDePago, (nuevosTipos) => {
  if (nuevosTipos?.length > 0 && !tipoPago.value) {
    tipoPago.value = props.efectivoId;
  }
}, { immediate: true });

watch(tipoPago, (nuevoTipo) => {
  console.log('💳 Tipo de pago cambió a:', nuevoTipo);
  
  if (!requiereNumeroRecibo.value) {
    numeroRecibo.value = '';
  }
  // Si cambia a efectivo en modo completo, pre-llenar
  if (nuevoTipo === props.efectivoId && tipoPagoSeleccionado.value === 'completo') {
    efectivoRecibido.value = monto.value;
    console.log('✅ Pre-llenado efectivo:', efectivoRecibido.value);
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
