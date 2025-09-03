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
                <span class="text-body-2 font-weight-medium">{{ orden.cliente_nombre || 'Sin nombre' }}</span>
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
              v-if="montoAPagar > 0"
              variant="flat" 
              color="grey-lighten-5"
              class="mb-3"
              density="compact"
            >
              <v-card-text class="pa-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption">A pagar:</span>
                  <span class="font-weight-bold">Q {{ formatMoney(montoAPagar) }}</span>
                </div>
                <div v-if="metodoPago === 1 && cambio > 0" class="d-flex justify-space-between align-center text-success mb-1">
                  <span class="text-caption">Cambio:</span>
                  <span class="font-weight-bold">Q {{ formatMoney(cambio) }}</span>
                </div>
                <div v-if="tipoPagoSeleccionado === 'parcial'" class="d-flex justify-space-between align-center text-warning">
                  <span class="text-caption">Nuevo saldo:</span>
                  <span class="font-weight-bold">Q {{ formatMoney(nuevoSaldo) }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-expand-transition>
        </v-col>

        <!-- Columna derecha: Formulario -->
        <v-col cols="12" md="7">
          <v-form ref="formPago" @submit.prevent="procesarPago">
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
                  v-model="metodoPago"
                  :items="metodosPago"
                  item-title="nombre"
                  item-value="id"
                  label="Método"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-credit-card"
                  :rules="[reglasValidacion.requerido]"
                />
              </v-col>
              
              <!-- Monto (parcial) o Efectivo recibido -->
              <v-col cols="12" sm="6">
                <v-slide-y-transition>
                  <v-text-field
                    v-if="tipoPagoSeleccionado === 'parcial'"
                    v-model.number="montoAbono"
                    label="Monto abono"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="Q"
                    prepend-inner-icon="mdi-cash"
                    :rules="reglasValidacionAbono"
                    @input="actualizarMontoPagaCon"
                  />
                  <v-text-field
                    v-else-if="metodoPago === 1"
                    v-model.number="efectivoRecibido"
                    label="Efectivo recibido"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="Q"
                    prepend-inner-icon="mdi-cash-100"
                    :rules="reglasValidacionEfectivo"
                  />
                </v-slide-y-transition>
              </v-col>
            </v-row>

            <!-- Número de documento (cuando aplique) -->
            <v-slide-y-transition>
              <v-text-field
                v-if="metodoPago > 1"
                v-model="numeroDocumento"
                :label="etiquetaDocumento"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-file-document"
                :rules="[reglasValidacion.requerido]"
                class="mb-2"
              />
            </v-slide-y-transition>

            <!-- Observaciones compactas -->
            <v-textarea
              v-model="observaciones"
              label="Observaciones"
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
                  type="submit"
                  color="primary"
                  block
                  :loading="procesando"
                  :disabled="!formularioValido"
                >
                  <v-icon start size="small">mdi-check-circle</v-icon>
                  {{ textoBoton }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-card>

    <!-- Snackbar optimizado -->
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
import axios from 'axios';

export default {
  name: 'CajaPago',
  props: {
    orden: {
      type: Object,
      required: true,
      validator(value) {
        return value && 
               typeof value.id !== 'undefined' && 
               typeof value.total === 'number' &&
               typeof value.cliente_nombre === 'string'
      }
    },
    usuario: {
      type: Object,
      required: true,
      validator(value) {
        return value && 
               typeof value.id !== 'undefined' && 
               typeof value.nombre === 'string'
      }
    }
  },
  emits: [
    'cobro-realizado',
    'pago-completado', 
    'cancelar',
    'regresar-paso'
  ],
  data() {
    return {
      // Estado del formulario
      tipoPagoSeleccionado: 'completo',
      tipoPagoChip: 'completo', // Para el chip-group
      metodoPago: 1,
      montoAbono: 0,
      efectivoRecibido: 0,
      numeroDocumento: '',
      observaciones: '',
      procesando: false,
      
      // Notificaciones
      mostrarNotificacion: false,
      notificacion: {
        color: 'success',
        texto: ''
      },
      
      // Catálogos
      metodosPago: [
        { id: 1, nombre: 'Efectivo' },
        { id: 2, nombre: 'Tarjeta de Crédito' },
        { id: 3, nombre: 'Transferencia Bancaria' },
        { id: 4, nombre: 'Pago Móvil' },
        { id: 5, nombre: 'Cheque' },
        { id: 6, nombre: 'Crédito a Cliente' },
        { id: 7, nombre: 'Vale / Cupón' }
      ],
      
      // Reglas de validación
      reglasValidacion: {
        requerido: v => !!v || 'Campo requerido'
      }
    };
  },
  computed: {
    saldoPendiente() {
      const total = parseFloat(this.orden.total) || 0;
      const abonado = parseFloat(this.orden.abonado) || 0;
      return Math.max(0, total - abonado);
    },
    
    montoAPagar() {
      if (this.tipoPagoSeleccionado === 'completo') {
        return this.saldoPendiente;
      }
      return parseFloat(this.montoAbono) || 0;
    },
    
    cambio() {
      if (this.metodoPago === 1) {
        const efectivo = parseFloat(this.efectivoRecibido) || 0;
        const monto = parseFloat(this.montoAPagar) || 0;
        return Math.max(0, efectivo - monto);
      }
      return 0;
    },
    
    nuevoSaldo() {
      return Math.max(0, this.saldoPendiente - this.montoAPagar);
    },
    
    textoBoton() {
      if (this.tipoPagoSeleccionado === 'completo') {
        return 'Completar pago';
      }
      return 'Registrar abono';
    },
    
    etiquetaDocumento() {
      const etiquetas = {
        2: 'Número de autorización',
        3: 'Número de transferencia',
        4: 'Número de referencia',
        5: 'Número de cheque',
        6: 'Número de documento',
        7: 'Número de vale'
      };
      return etiquetas[this.metodoPago] || 'Número de documento';
    },
    
    reglasValidacionAbono() {
      return [
        v => !!v || 'Ingrese el monto del abono',
        v => v > 0 || 'El monto debe ser mayor a 0',
        v => v <= this.saldoPendiente || 'El monto no puede ser mayor al saldo pendiente'
      ];
    },
    
    reglasValidacionEfectivo() {
      const montoRequerido = parseFloat(this.montoAPagar) || 0;
      return [
        v => !!v || 'Ingrese el efectivo recibido',
        v => {
          const efectivo = parseFloat(v) || 0;
          const faltante = montoRequerido - efectivo;
          return efectivo >= montoRequerido || `Monto insuficiente, falta Q ${this.formatMoney(faltante)}`;
        }
      ];
    },
    
    formularioValido() {
      const montoAPagar = parseFloat(this.montoAPagar) || 0;
      const efectivoRecibido = parseFloat(this.efectivoRecibido) || 0;
      const montoAbono = parseFloat(this.montoAbono) || 0;
      
      // Validación básica sin usar refs
      if (this.metodoPago === 1 && efectivoRecibido < montoAPagar) {
        return false;
      }
      if (this.metodoPago > 1 && !this.numeroDocumento) {
        return false;
      }
      if (this.tipoPagoSeleccionado === 'parcial' && montoAbono <= 0) {
        return false;
      }
      return true;
    }
  },
  watch: {
    tipoPagoSeleccionado(nuevoValor) {
      // Sincronizar con el chip-group
      this.tipoPagoChip = nuevoValor;
      
      if (nuevoValor === 'completo') {
        this.montoAbono = 0;
        if (this.metodoPago === 1) {
          this.efectivoRecibido = this.saldoPendiente;
        }
      } else {
        // Sugerir 50% del saldo como abono inicial
        this.montoAbono = Math.round(this.saldoPendiente * 0.5 * 100) / 100;
        if (this.metodoPago === 1) {
          this.efectivoRecibido = this.montoAbono;
        }
      }
    },
    
    // Sincronizar cambios del chip-group con el modelo principal
    tipoPagoChip(nuevoValor) {
      if (this.tipoPagoSeleccionado !== nuevoValor) {
        this.tipoPagoSeleccionado = nuevoValor;
      }
    },
    
    metodoPago(nuevoValor) {
      // Limpiar campos específicos del método anterior
      this.numeroDocumento = '';
      
      if (nuevoValor === 1) {
        // Si es efectivo, prellenar con el monto a pagar
        this.efectivoRecibido = this.montoAPagar;
      } else {
        // Si no es efectivo, limpiar el campo
        this.efectivoRecibido = 0;
      }
    }
  },
  methods: {
    formatMoney(valor) {
      // Validar que sea un número válido
      const numero = parseFloat(valor);
      return isNaN(numero) ? '0.00' : numero.toFixed(2);
    },
    
    // Método para actualizar desde el chip-group (usado en template)
    actualizarTipoPago(valor) {
      this.tipoPagoSeleccionado = valor;
    },
    
    actualizarMontoPagaCon() {
      if (this.metodoPago === 1 && this.tipoPagoSeleccionado === 'parcial') {
        this.efectivoRecibido = parseFloat(this.montoAbono) || 0;
      }
    },
    
    mostrarMensaje(tipo, texto) {
      this.notificacion = { color: tipo, texto };
      this.mostrarNotificacion = true;
    },

    cancelar() {
      this.$emit('cancelar');
    },

    regresar() {
      this.$emit('regresar-paso', 4);
    },
    
    async procesarPago() {
      // Validar formulario solo si el ref existe
      if (this.$refs.formPago && this.$refs.formPago.validate) {
        const valido = await this.$refs.formPago.validate();
        if (!valido.valid) return;
      }
      
      this.procesando = true;
      
      try {
        const payload = {
          ordenId: this.orden.id,
          monto: this.montoAPagar,
          empleadoId: this.usuario.id,
          tipoPagoId: this.metodoPago,
          observacion: this.observaciones
        };
        
        // Agregar número de documento si aplica
        if (this.metodoPago > 1) {
          payload.numero_recibo = this.numeroDocumento;
        }
        
        // Llamar al API
        const { data } = await axios.post(
          `${process.env.VUE_APP_API_URL}/abonos/create`,
          payload
        );
        
        // Mostrar mensaje de éxito
        this.mostrarMensaje('success', 'Pago procesado exitosamente');

        const esPagoTotal = this.nuevoSaldo <= 0;
        const metodoPagoNombre = this.metodosPago.find(m => m.id === this.metodoPago)?.nombre;
        
        // Emitir evento cobro-realizado con estructura esperada por FormOrden
        this.$emit('cobro-realizado', {
          movimiento: {
            id: data.id,
            monto: this.montoAPagar,
            tipo_pago_id: this.metodoPago,
            numero_recibo: this.numeroDocumento
          },
          ordenActualizada: true,
          tipo: esPagoTotal ? 'pago_total' : 'abono_parcial'
        });
        
        // Emitir evento pago-completado con estructura esperada por FormOrden
        this.$emit('pago-completado', {
          monto_pagado: this.montoAPagar,
          forma_pago: metodoPagoNombre,
          vuelto: this.cambio,
          numero_recibo: this.numeroDocumento,
          es_pago_total: esPagoTotal,
          saldo_restante: this.nuevoSaldo,
          fecha: new Date().toISOString()
        });
        
        // Limpiar formulario después de un pequeño delay
        setTimeout(() => {
          this.limpiarFormulario();
        }, 1500);
        
      } catch (error) {
        console.error('Error al procesar pago:', error);
        this.mostrarMensaje(
          'error',
          error.response?.data?.error || 'Error al procesar el pago'
        );
      } finally {
        this.procesando = false;
      }
    },
    
    limpiarFormulario() {
      this.tipoPagoSeleccionado = 'completo';
      this.tipoPagoChip = 'completo'; // Sincronizar chip-group
      this.metodoPago = 1;
      this.montoAbono = 0;
      this.efectivoRecibido = 0;
      this.numeroDocumento = '';
      this.observaciones = '';
      
      // Validar que el ref existe antes de usarlo
      if (this.$refs.formPago && this.$refs.formPago.resetValidation) {
        this.$refs.formPago.resetValidation();
      }
    }
  },
  mounted() {
    // Inicializar con valores por defecto
    if (this.metodoPago === 1) {
      this.efectivoRecibido = this.saldoPendiente;
    }
    
    // Si la orden ya tiene un tipo de pago, usarlo
    if (this.orden.tipoPago && this.orden.tipoPago.id) {
      this.metodoPago = parseInt(this.orden.tipoPago.id) || 1;
    }
    
    // Sincronizar estado inicial
    this.tipoPagoChip = this.tipoPagoSeleccionado;
  }
};
</script>

<style scoped>
.v-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.v-btn {
  text-transform: none;
  letter-spacing: normal;
}

.v-text-field, .v-select, .v-textarea {
  margin-bottom: 0;
}
</style>