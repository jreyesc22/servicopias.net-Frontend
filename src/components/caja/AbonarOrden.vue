<template>
  <v-container class="py-2" max-width="500">
    <v-card class="pa-4" elevation="2" rounded="lg">
      <!-- Header compacto -->
      <div class="text-center mb-4">
        <v-icon size="32" color="primary" class="mb-1">mdi-cash-plus</v-icon>
        <h3 class="text-h6 font-weight-bold mb-1">Registrar Abono</h3>
        <p class="text-body-2 text-grey">Orden #{{ orden.id }}</p>
      </div>

      <!-- Información de la orden compacta -->
      <v-card variant="tonal" color="primary" class="mb-4" density="compact">
        <v-card-text class="pa-3">
          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey">Cliente:</div>
              <div class="text-body-2 font-weight-medium">{{ orden.cliente_nombre || 'Sin nombre' }}</div>
            </v-col>
            <v-col cols="12" sm="6" class="text-sm-right">
              <div class="text-caption text-grey">Total orden:</div>
              <div class="text-body-2 font-weight-bold">Q {{ formatMoney(orden.total) }}</div>
            </v-col>
          </v-row>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2 font-weight-medium text-warning">Saldo pendiente:</span>
            <span class="text-h6 font-weight-bold text-primary">Q {{ formatMoney(orden.saldo_pendiente) }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Formulario optimizado -->
      <v-form ref="form" v-model="formValido" @submit.prevent="registrarAbono">
        <v-row dense>
          <!-- Monto y método de pago en fila -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="monto"
              label="Monto del abono"
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
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-select
              v-model="tipoPago"
              :items="tiposDePago"
              item-title="nombre"
              item-value="id"
              label="Método de pago"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-credit-card"
              required
            />
          </v-col>
        </v-row>

        <!-- Campo condicional para número de recibo -->
        <v-slide-y-transition>
          <v-text-field
            v-if="requiereNumeroRecibo"
            v-model="numeroRecibo"
            :label="`Número de ${tipoComprobanteTexto}`"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-file-document"
            :rules="reglasNumeroRecibo"
            :hint="`Ingrese el número de ${tipoComprobanteTexto}`"
            persistent-hint
            class="mb-2"
            required
          />
        </v-slide-y-transition>

        <!-- Observaciones compactas -->
        <v-textarea
          v-model="observacion"
          label="Observación (opcional)"
          variant="outlined"
          density="compact"
          rows="2"
          prepend-inner-icon="mdi-note-text"
          class="mb-3"
        />

        <!-- Resumen del abono -->
        <v-expand-transition>
          <v-card 
            v-if="monto > 0 && formValido"
            variant="flat" 
            color="success-lighten-5"
            class="mb-4"
            density="compact"
          >
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption">Monto a abonar:</span>
                <span class="font-weight-bold text-success">Q {{ formatMoney(monto) }}</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">Saldo restante:</span>
                <span class="font-weight-bold" :class="saldoRestante <= 0 ? 'text-success' : 'text-warning'">
                  Q {{ formatMoney(saldoRestante) }}
                </span>
              </div>
              <div v-if="saldoRestante <= 0" class="text-center mt-2">
                <v-chip color="success" size="small" variant="flat">
                  <v-icon start size="small">mdi-check-circle</v-icon>
                  ¡Orden completamente pagada!
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Botones -->
        <v-row dense>
          <v-col cols="12" sm="8">
            <v-btn
              type="submit"
              color="primary"
              block
              :disabled="!formularioCompleto"
              :loading="cargando"
            >
              <v-icon start size="small">mdi-check-circle</v-icon>
              Registrar Abono
            </v-btn>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              variant="outlined"
              block
              @click="cancelar"
              :disabled="cargando"
            >
              Cancelar
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
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
      
      // Notificaciones internas
      mostrarNotificacion: false,
      notificacion: {
        color: 'success',
        texto: ''
      }
    };
  },

  computed: {
    // Obtener el tipo de pago seleccionado
    tipoPagoSeleccionado() {
      return this.tiposDePago.find(tipo => tipo.id === this.tipoPago);
    },
    
    // Nombre del tipo de pago seleccionado
    tipoPagoNombre() {
      return this.tipoPagoSeleccionado?.nombre?.toLowerCase() || '';
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
      const saldoPendiente = parseFloat(this.orden.saldo_pendiente) || 0;
      return [
        v => !!v || 'Ingrese el monto del abono',
        v => v > 0 || 'El monto debe ser mayor a 0',
        v => v <= saldoPendiente || `No puede superar Q ${this.formatMoney(saldoPendiente)}`
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
      const montoValido = this.monto > 0 && this.monto <= this.orden.saldo_pendiente;
      const reciboValido = !this.requiereNumeroRecibo || !!this.numeroRecibo?.trim();
      return this.formValido && montoValido && reciboValido;
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
        
        // Realizar la solicitud POST para registrar el abono
        const res = await fetch(`${process.env.VUE_APP_API_URL}/abonos/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al registrar abono');

        this.mostrarMensaje('success', 'Abono registrado exitosamente');
        
        // Emitir evento con información completa
        this.$emit('abono-registrado', {
          abono: data,
          monto: parseFloat(this.monto),
          tipoPago: this.tipoPagoSeleccionado?.nombre,
          saldoRestante: this.saldoRestante,
          ordenCompletada: this.saldoRestante <= 0
        });

        // Emitir para compatibilidad con el sistema existente
        this.$emit('snackbar', {
          text: 'Abono registrado exitosamente',
          color: 'success'
        });
        
        // Limpiar formulario y terminar
        setTimeout(() => {
          this.resetForm();
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
    //quiero que analisis todo el frontend de este proyecto e identifiquemos las variables de entorno posibles y dejemos solo una para la interaccion con la API
    // Inicializar tipo de pago por defecto
    if (this.tiposDePago?.length > 0) {
      this.tipoPago = this.efectivoId;
    }
  }
};
</script>

