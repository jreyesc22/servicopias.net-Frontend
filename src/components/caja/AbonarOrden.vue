<template>
  <v-container class="py-2" max-width="600">
    <v-card class="pa-4" elevation="2" rounded="lg">
      <!-- Header compacto -->
      <div class="text-center mb-4">
        <v-icon size="32" color="primary" class="mb-1">mdi-cash-register</v-icon>
        <h3 class="text-h6 font-weight-bold mb-1">Pago - Orden #{{ orden.id }}</h3>
      </div>

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
                    required
                  />
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
              label="Observaciones"
              variant="outlined"
              density="compact"
              rows="2"
              prepend-inner-icon="mdi-note-text"
              class="mb-3"
            />

            <!-- Botones compactos con iconos -->
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-tooltip text="Cancelar" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="outlined"
                      block
                      @click="cancelar"
                      :disabled="cargando"
                      size="large"
                    >
                      <v-icon size="28">mdi-close-circle</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>
              <v-col cols="12" sm="6">
                <v-tooltip text="Registrar abono" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      type="submit"
                      color="primary"
                      block
                      :loading="cargando"
                      :disabled="!formularioCompleto"
                      size="large"
                    >
                      <v-icon size="28">mdi-check-circle</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-card>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="mostrarNotificacion"
      :color="notificacion.color"
      :timeout="3000"
      location="top"
      rounded="pill"
    >
      {{ notificacion.texto }}
      <template #actions>
        <v-btn
          variant="text"
          size="small"
          @click="mostrarNotificacion = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import abonosService from '@/services/abonos.service';
import ordenesService from '@/services/ordenes.service';
import { printerService } from '@/services/printer.service';

const props = defineProps({
  orden: {
    type: Object,
    required: true,
    validator(value) {
      return value && 
             typeof value.id !== 'undefined' && 
             typeof value.total === 'number' &&
             typeof value.saldo_pendiente === 'number';
    }
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

const emit = defineEmits([
  'abono-registrado',
  'terminar',
  'cancelar',
  'snackbar'
]);

// Referencias reactivas
const form = ref(null);
const monto = ref(null);
const tipoPago = ref(1);
const numeroRecibo = ref('');
const observacion = ref('');
const formValido = ref(false);
const cargando = ref(false);

// Control de tipo de pago
const tipoPagoChip = ref('completo');
const efectivoRecibido = ref(null);

// Notificaciones internas
const mostrarNotificacion = ref(false);
const notificacion = ref({
  color: 'success',
  texto: ''
});

// Computed properties
const saldoPendiente = computed(() => {
  return parseFloat(props.orden.saldo_pendiente) || 0;
});

const tipoPagoSeleccionado = computed(() => {
  if (tipoPagoChip.value === 'completo') {
    return 'completo';
  }
  return 'parcial';
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

const reglasRequerido = computed(() => {
  return v => !!v || 'Este campo es requerido';
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

const saldoRestante = computed(() => {
  const montoVal = parseFloat(monto.value) || 0;
  const saldoPend = parseFloat(props.orden.saldo_pendiente) || 0;
  return Math.max(0, saldoPend - montoVal);
});

const reglasValidacionMonto = computed(() => {
  const saldoPend = saldoPendiente.value;
  return [
    v => !!v || 'Ingrese el monto del abono',
    v => v > 0 || 'El monto debe ser mayor a 0',
    v => v <= saldoPend || `No puede superar Q ${formatMoney(saldoPend)}`
  ];
});

const reglasValidacionEfectivo = computed(() => {
  const montoVal = parseFloat(monto.value) || 0;
  return [
    v => !!v || 'Ingrese el efectivo recibido',
    v => v >= montoVal || 'El efectivo debe ser mayor o igual al monto'
  ];
});

const reglasNumeroRecibo = computed(() => {
  return [
    v => !!v || `Número de ${tipoComprobanteTexto.value} es requerido`
  ];
});

const formularioCompleto = computed(() => {
  if (tipoPagoSeleccionado.value === 'completo') {
    const montoValido = monto.value > 0;
    const efectivoValido = tipoPago.value !== props.efectivoId || (efectivoRecibido.value >= monto.value);
    const reciboValido = !requiereNumeroRecibo.value || !!numeroRecibo.value?.trim();
    return formValido.value && montoValido && efectivoValido && reciboValido;
  } else {
    const montoValido = monto.value > 0 && monto.value <= saldoPendiente.value;
    const reciboValido = !requiereNumeroRecibo.value || !!numeroRecibo.value?.trim();
    return formValido.value && montoValido && reciboValido;
  }
});

// Métodos
const actualizarTipoPago = () => {
  if (tipoPagoSeleccionado.value === 'completo') {
    // Completo: 100% del saldo pendiente
    monto.value = saldoPendiente.value;
  } else {
    // Parcial: 50% del saldo pendiente
    monto.value = Math.round(saldoPendiente.value * 0.5 * 100) / 100;
  }
  efectivoRecibido.value = null;
};

const formatMoney = (valor) => {
  const numero = parseFloat(valor);
  return isNaN(numero) ? '0.00' : numero.toFixed(2);
};

const validarMonto = () => {
  // Validación en tiempo real del monto
  const montoVal = parseFloat(monto.value);
  const saldoPend = parseFloat(props.orden.saldo_pendiente);
  
  if (montoVal > saldoPend) {
    mostrarMensaje('warning', 'El monto no puede superar el saldo pendiente');
  }
};

const mostrarMensaje = (tipo, texto) => {
  notificacion.value = { color: tipo, texto };
  mostrarNotificacion.value = true;
};

const registrarAbono = async () => {
  if (!formularioCompleto.value) {
    mostrarMensaje('warning', 'Complete todos los campos requeridos');
    return;
  }
  
  // Validación adicional para número de recibo
  if (requiereNumeroRecibo.value && !numeroRecibo.value?.trim()) {
    mostrarMensaje('warning', `Número de ${tipoComprobanteTexto.value} es requerido`);
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

    console.log('Payload a enviar:', payload);
    
    // Registrar abono usando el servicio
    const data = await abonosService.registrarAbono(payload);
    
    // Obtener orden actualizada desde el servidor
    const ordenActualizada = await ordenesService.getById(props.orden.id);

    mostrarMensaje('success', 'Abono registrado exitosamente');
    
    // Abrir cajón de dinero si el método de pago es efectivo
    if (tipoPago.value === props.efectivoId) {
      try {
        console.log('Abriendo cajón de dinero...');
        await printerService.abrirCajon();
        console.log('Cajón abierto exitosamente');
      } catch (errorCajon) {
        console.warn('No se pudo abrir el cajón:', errorCajon.message);
        // No detenemos el flujo si falla el cajón
      }
    }
    
    // Calcular cambio si es efectivo
    const cambioCalculado = tipoPago.value === props.efectivoId && efectivoRecibido.value > monto.value
      ? efectivoRecibido.value - monto.value
      : 0;
    
    // Emitir evento con información completa incluyendo orden actualizada
    emit('abono-registrado', {
      abono: data.data,
      ordenActualizada: ordenActualizada,
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

    // Emitir para compatibilidad con el sistema existente
    const mensajeEstado = data.estado_pago === 'pagado' 
      ? 'Pago completado exitosamente' 
      : data.estado_pago === 'parcial'
        ? 'Abono parcial registrado exitosamente'
        : 'Abono registrado exitosamente';
    
    emit('snackbar', {
      text: mensajeEstado,
      color: 'success'
    });
    
    // Limpiar formulario
    resetForm();
    
    // Finalizar inmediatamente (tanto en completo como en parcial)
    emit('terminar');

  } catch (error) {
    console.error('Error al registrar abono:', error);
    mostrarMensaje('error', error.message || 'Error al registrar abono');
    
    emit('snackbar', {
      text: error.message || 'Error al registrar abono',
      color: 'error'
    });
  } finally {
    cargando.value = false;
  }
};

const cancelar = () => {
  resetForm();
  emit('cancelar');
};

const resetForm = () => {
  monto.value = null;
  tipoPago.value = props.efectivoId;
  numeroRecibo.value = '';
  observacion.value = '';
  formValido.value = false;
  
  // Reset validación del formulario
  if (form.value?.resetValidation) {
    form.value.resetValidation();
  }
};

// Watchers
watch(tipoPago, () => {
  if (!requiereNumeroRecibo.value) {
    numeroRecibo.value = '';
  }
});

watch(() => props.tiposDePago, (nuevosTipos) => {
  if (nuevosTipos?.length > 0 && !tipoPago.value) {
    tipoPago.value = props.efectivoId;
  }
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
  // Inicializar tipo de pago por defecto
  if (props.tiposDePago?.length > 0) {
    tipoPago.value = props.efectivoId;
  }

  // Inicializar con saldo pendiente
  if (tipoPagoChip.value === 'completo' && saldoPendiente.value > 0) {
    monto.value = saldoPendiente.value;
  }
});
</script>

