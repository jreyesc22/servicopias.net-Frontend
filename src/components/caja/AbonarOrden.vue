<template>
  <v-container class="py-4" max-width="600">
    <v-card>
      <v-card-title class="text-h6">
        💳 Abonar a Orden #{{ orden.id }}
      </v-card-title>

      <v-card-text>
        <div>
          <strong>Cliente:</strong> {{ orden.cliente_nombre }}<br />
          <strong>Total:</strong> Q {{ Number(orden.total).toFixed(2) }}<br />
          <strong>Saldo pendiente:</strong> Q {{ Number(orden.saldo_pendiente).toFixed(2) }}<br />
        </div>

        <v-form ref="form" v-model="formValido" @submit.prevent="registrarAbono" class="mt-4">
          <v-text-field
            v-model.number="monto"
            label="💵 Monto del abono"
            type="number"
            step="0.01"
            :rules="[
              v => v > 0 || 'Debe ser mayor a 0',
              v => v <= orden.saldo_pendiente || 'No puede superar el saldo pendiente'
            ]"
            required
          />
          
          <v-select
            v-model="tipoPago"
            :items="tiposDePago"
            item-title="nombre"
            item-value="id"
            label="Método de pago"
            required
          />

          <!-- Campo para número de recibo con validación mejorada -->
          <v-text-field
            v-if="requiereNumeroRecibo"
            v-model="numeroRecibo"
            label="📄 Número de recibo/comprobante"
            :rules="[v => !!v || 'Número de recibo es requerido']"
            persistent-hint
            :hint="`Ingrese el número de ${tipoComprobanteTexto}`"
            required
          />

          <v-textarea
            v-model="observacion"
            label="Observación (opcional)"
            rows="2"
          />

          <v-btn
            type="submit"
            color="primary"
            :disabled="!formValido || cargando || (requiereNumeroRecibo && !numeroRecibo)"
            :loading="cargando"
          >
            Registrar Abono
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  props: {
    orden: Object,
    empleadoId: Number,
    tiposDePago: Array,
    efectivoId: {
      type: Number,
      default: 1 // ID del efectivo, ajusta según tu BD
    },
    onAbonoRegistrado: Function
  },
  data() {
    return {
      monto: null,
      tipoPago: 1,
      numeroRecibo: '',
      observacion: '',
      formValido: false,
      cargando: false
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
      // No es efectivo (asumiendo que efectivo tiene ID = 1 o el que definas)
      if (this.tipoPago === this.efectivoId) {
        return false;
      }
      
      // O verificar por nombre si prefieres esta lógica
      const tipoPago = this.tipoPagoNombre;
      return tipoPago.includes('transferencia') || 
             tipoPago.includes('tc') || 
             tipoPago.includes('tarjeta') ||
             tipoPago.includes('cheque');
    },
    
    // Texto descriptivo del tipo de comprobante
    tipoComprobanteTexto() {
      const tipoPago = this.tipoPagoNombre;
      if (tipoPago.includes('transferencia')) return 'transferencia';
      if (tipoPago.includes('tc') || tipoPago.includes('tarjeta')) return 'tarjeta de crédito';
      if (tipoPago.includes('cheque')) return 'cheque';
      return 'comprobante';
    }
  },

  watch: {
    // Limpiar número de recibo cuando cambie el tipo de pago
    tipoPago() {
      if (!this.requiereNumeroRecibo) {
        this.numeroRecibo = '';
      }
    }
  },

  methods: {
    async registrarAbono() {
      if (!this.formValido) return;
      
      // Validación adicional para número de recibo
      if (this.requiereNumeroRecibo && !this.numeroRecibo.trim()) {
        this.$emit('snackbar', {
          text: 'Número de recibo es requerido para este método de pago ⚠️',
          color: 'warning'
        });
        return;
      }

      this.cargando = true;

      try {
        const payload = {
          ordenId: this.orden.id,
          tipoPagoId: this.tipoPago,
          monto: this.monto,
          numero_recibo: this.requiereNumeroRecibo ? this.numeroRecibo.trim() : null,
          empleadoId: this.empleadoId,
          observacion: this.observacion
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

        this.$emit('snackbar', {
          text: 'Abono registrado exitosamente ✅',
          color: 'success'
        });
        
        // Limpiar formulario
        this.resetForm();
        
        this.$emit('terminar');

      } catch (error) {
        this.$emit('snackbar', {
          text: error.message || 'Error al registrar abono ❌',
          color: 'error'
        });
      } finally {
        this.cargando = false;
      }
    },

    resetForm() {
      this.monto = null;
      this.tipoPago = this.efectivoId;
      this.numeroRecibo = '';
      this.observacion = '';
      this.formValido = false;
    }
  }
};
</script>