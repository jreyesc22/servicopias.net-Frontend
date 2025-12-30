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

<script>
import abonosService from '@/services/abonos.service'
import ordenesService from '@/services/ordenes.service'
import { printerService } from '@/services/printer.service'

export default {
  name: 'ComponenteAbono',
  props: {
    orden: {
      type: Object,
      required: true,
      validator(value) {
        return value && 
               typeof value.id !== 'undefined' && 
               typeof value.total === 'number' &&
               typeof value.saldo_pendiente === 'number'
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
  },
  emits: [
    'abono-registrado',
    'terminar',
    'cancelar',
    'snackbar'
  ],
  data() {
    return {
      monto: null,
      tipoPago: 1,
      numeroRecibo: '',
      observacion: '',
      formValido: false,
      cargando: false,
      
      // Control de tipo de pago
      tipoPagoChip: 'completo',
      efectivoRecibido: null,
      
      // Notificaciones internas
      mostrarNotificacion: false,
      notificacion: {
        color: 'success',
        texto: ''
      }
    };
  },

  computed: {
    // Saldo pendiente actual
    saldoPendiente() {
      return parseFloat(this.orden.saldo_pendiente) || 0;
    },

    // Obtener el tipo de pago seleccionado
    tipoPagoSeleccionado() {
      if (this.tipoPagoChip === 'completo') {
        return 'completo';
      }
      return 'parcial';
    },
    
    // Nombre del tipo de pago seleccionado
    tipoPagoNombre() {
      const tipo = this.tiposDePago.find(t => t.id === this.tipoPago);
      return tipo?.nombre?.toLowerCase() || '';
    },
    
    // Cambio en efectivo
    cambio() {
      if (this.tipoPago !== this.efectivoId || !this.efectivoRecibido) {
        return 0;
      }
      const recibido = parseFloat(this.efectivoRecibido) || 0;
      const monto = parseFloat(this.monto) || 0;
      return Math.max(0, recibido - monto);
    },

    // Etiqueta del documento según tipo de pago
    etiquetaDocumento() {
      const tipoPago = this.tipoPagoNombre;
      if (tipoPago.includes('transferencia')) return 'Número de transferencia';
      if (tipoPago.includes('tc') || tipoPago.includes('tarjeta')) return 'Número de autorización';
      if (tipoPago.includes('cheque')) return 'Número de cheque';
      if (tipoPago.includes('móvil')) return 'Número de referencia';
      return 'Número de comprobante';
    },

    // Texto del botón según tipo de pago
    textoBoton() {
      return this.tipoPagoSeleccionado === 'completo' ? 'Pagar Total' : 'Registrar Abono';
    },

    // Regla de validación requerido
    reglasRequerido() {
      return v => !!v || 'Este campo es requerido';
    },
    
    // Verificar si requiere número de recibo
    requiereNumeroRecibo() {
      if (this.tipoPago === this.efectivoId) {
        return false;
      }
      
      const tipoPago = this.tipoPagoNombre;
      return tipoPago.includes('transferencia') || 
             tipoPago.includes('tc') || 
             tipoPago.includes('tarjeta') ||
             tipoPago.includes('cheque') ||
             tipoPago.includes('crédito') ||
             tipoPago.includes('móvil');
    },
    
    // Texto descriptivo del tipo de comprobante
    tipoComprobanteTexto() {
      const tipoPago = this.tipoPagoNombre;
      if (tipoPago.includes('transferencia')) return 'transferencia';
      if (tipoPago.includes('tc') || tipoPago.includes('tarjeta')) return 'autorización';
      if (tipoPago.includes('cheque')) return 'cheque';
      if (tipoPago.includes('móvil')) return 'referencia';
      return 'comprobante';
    },

    // Saldo restante después del abono
    saldoRestante() {
      const monto = parseFloat(this.monto) || 0;
      const saldoPendiente = parseFloat(this.orden.saldo_pendiente) || 0;
      return Math.max(0, saldoPendiente - monto);
    },

    // Reglas de validación para el monto
    reglasValidacionMonto() {
      const saldoPendiente = this.saldoPendiente;
      return [
        v => !!v || 'Ingrese el monto del abono',
        v => v > 0 || 'El monto debe ser mayor a 0',
        v => v <= saldoPendiente || `No puede superar Q ${this.formatMoney(saldoPendiente)}`
      ];
    },

    // Reglas de validación para efectivo recibido
    reglasValidacionEfectivo() {
      const monto = parseFloat(this.monto) || 0;
      return [
        v => !!v || 'Ingrese el efectivo recibido',
        v => v >= monto || 'El efectivo debe ser mayor o igual al monto'
      ];
    },

    // Reglas para número de recibo
    reglasNumeroRecibo() {
      return [
        v => !!v || `Número de ${this.tipoComprobanteTexto} es requerido`
      ];
    },

    // Validación completa del formulario
    formularioCompleto() {
      if (this.tipoPagoSeleccionado === 'completo') {
        const montoValido = this.monto > 0;
        const efectivoValido = this.tipoPago !== this.efectivoId || (this.efectivoRecibido >= this.monto);
        const reciboValido = !this.requiereNumeroRecibo || !!this.numeroRecibo?.trim();
        return this.formValido && montoValido && efectivoValido && reciboValido;
      } else {
        const montoValido = this.monto > 0 && this.monto <= this.saldoPendiente;
        const reciboValido = !this.requiereNumeroRecibo || !!this.numeroRecibo?.trim();
        return this.formValido && montoValido && reciboValido;
      }
    }
  },

  watch: {
    // Limpiar número de recibo cuando cambie el tipo de pago
    tipoPago() {
      if (!this.requiereNumeroRecibo) {
        this.numeroRecibo = '';
      }
    },

    // Inicializar tipo de pago cuando lleguen los datos
    tiposDePago: {
      handler(nuevosTipos) {
        if (nuevosTipos?.length > 0 && !this.tipoPago) {
          this.tipoPago = this.efectivoId;
        }
      },
      immediate: true
    }
  },

  methods: {
    // Actualizar tipo de pago (completo/parcial)
    actualizarTipoPago() {
      if (this.tipoPagoSeleccionado === 'completo') {
        // Completo: 100% del saldo pendiente
        this.monto = this.saldoPendiente;
      } else {
        // Parcial: 50% del saldo pendiente
        this.monto = Math.round(this.saldoPendiente * 0.5 * 100) / 100;
      }
      this.efectivoRecibido = null;
    },

    formatMoney(valor) {
      const numero = parseFloat(valor);
      return isNaN(numero) ? '0.00' : numero.toFixed(2);
    },

    validarMonto() {
      // Validación en tiempo real del monto
      const monto = parseFloat(this.monto);
      const saldoPendiente = parseFloat(this.orden.saldo_pendiente);
      
      if (monto > saldoPendiente) {
        this.mostrarMensaje('warning', 'El monto no puede superar el saldo pendiente');
      }
    },

    mostrarMensaje(tipo, texto) {
      this.notificacion = { color: tipo, texto };
      this.mostrarNotificacion = true;
    },

    async registrarAbono() {
      if (!this.formularioCompleto) {
        this.mostrarMensaje('warning', 'Complete todos los campos requeridos');
        return;
      }
      
      // Validación adicional para número de recibo
      if (this.requiereNumeroRecibo && !this.numeroRecibo?.trim()) {
        this.mostrarMensaje('warning', `Número de ${this.tipoComprobanteTexto} es requerido`);
        return;
      }

      this.cargando = true;

      try {
        const payload = {
          ordenId: this.orden.id,
          tipoPagoId: this.tipoPago,
          monto: parseFloat(this.monto),
          numero_recibo: this.requiereNumeroRecibo ? this.numeroRecibo.trim() : null,
          empleadoId: this.empleadoId,
          observacion: this.observacion?.trim() || null
        };

        console.log('Payload a enviar:', payload);
        
        // Registrar abono usando el servicio
        const data = await abonosService.registrarAbono(payload);
        
        // Obtener orden actualizada desde el servidor
        const ordenActualizada = await ordenesService.getById(this.orden.id);

        this.mostrarMensaje('success', 'Abono registrado exitosamente');
        
        // Abrir cajón de dinero si el método de pago es efectivo
        if (this.tipoPago === this.efectivoId) {
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
        const cambio = this.tipoPago === this.efectivoId && this.efectivoRecibido > this.monto
          ? this.efectivoRecibido - this.monto
          : 0;
        
        // Emitir evento con información completa incluyendo orden actualizada
        this.$emit('abono-registrado', {
          abono: data.data,
          ordenActualizada: ordenActualizada,
          monto: parseFloat(this.monto),
          cambio: cambio,
          efectivoRecibido: this.efectivoRecibido || null,
          tipoPago: this.tiposDePago.find(t => t.id === this.tipoPago)?.nombre || 'Desconocido',
          tipoPagoId: this.tipoPago,
          estadoPago: data.estado_pago,
          abonado: data.abonado,
          saldoPendiente: data.saldo_pendiente,
          ordenCompletada: data.estado_pago === 'pagado',
          numeroRecibo: this.numeroRecibo || null
        });

        // Emitir para compatibilidad con el sistema existente
        const mensajeEstado = data.estado_pago === 'pagado' 
          ? 'Pago completado exitosamente' 
          : data.estado_pago === 'parcial'
            ? 'Abono parcial registrado exitosamente'
            : 'Abono registrado exitosamente';
        
        this.$emit('snackbar', {
          text: mensajeEstado,
          color: 'success'
        });
        
        // Limpiar formulario
        this.resetForm();
        
        // Finalizar siempre (tanto en completo como en parcial)
        setTimeout(() => {
          this.$emit('terminar');
        }, 1500);

      } catch (error) {
        console.error('Error al registrar abono:', error);
        this.mostrarMensaje('error', error.message || 'Error al registrar abono');
        
        this.$emit('snackbar', {
          text: error.message || 'Error al registrar abono',
          color: 'error'
        });
      } finally {
        this.cargando = false;
      }
    },

    cancelar() {
      this.resetForm();
      this.$emit('cancelar');
    },

    resetForm() {
      this.monto = null;
      this.tipoPago = this.efectivoId;
      this.numeroRecibo = '';
      this.observacion = '';
      this.formValido = false;
      
      // Reset validación del formulario
      if (this.$refs.form?.resetValidation) {
        this.$refs.form.resetValidation();
      }
    }
  },

  mounted() {
    // Inicializar tipo de pago por defecto
    if (this.tiposDePago?.length > 0) {
      this.tipoPago = this.efectivoId;
    }

    // Si es pago completo, inicializar con saldo pendiente
    if (this.tipoPagoChip === 'completo') {
      this.monto = this.saldoPendiente;
    }
  }
};
</script>

