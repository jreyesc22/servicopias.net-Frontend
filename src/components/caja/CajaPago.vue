<template>
  <v-container class="py-4" max-width="600">
    <v-card elevation="2">
      <v-card-title class="text-h6">
        💰 Cobro Orden #{{ orden.id }}
      </v-card-title>
      <v-card-text>
        <div>
          <strong>Cliente:</strong> {{ orden.cliente_nombre }}<br />
          <strong>Total:</strong> Q {{ orden.total.toFixed(2) }}<br />
          <strong>Pagado:</strong> Q {{ orden.pagado?.toFixed(2) || 0 }}<br />
          <strong>Saldo actual:</strong> Q {{ saldoActual }}<br />
        </div>

        <!-- Selector de tipo de pago -->
        <v-select
          v-model="orden.tipoPago"
          :items="tiposPago"
          item-title="nombre"
          item-value="id"
          label="Forma de pago"
          prepend-icon="mdi-credit-card-outline"
          class="mt-4"
          return-object
          variant="outlined"
        />

        <v-checkbox
          v-model="cobrarTotal"
          label="Cobrar total de la orden"
          class="mt-4"
        ></v-checkbox>

        <v-form ref="cajaForm" v-model="formValido" @submit.prevent="validarYRegistrarCobro" class="mt-4">
          <v-text-field
            v-if="!cobrarTotal"
            v-model.number="abono"
            label="💳 Abono"
            type="number"
            step="0.01"
            :rules="[v => v > 0 && v <= parseFloat(saldoActual) || 'Monto inválido']"
            variant="outlined"
            class="mb-3"
            required
          />

          <v-text-field
            v-if="orden.tipoPago?.id == efectivoId"
            v-model.number="pagaCon"
            label="💵 Paga con"
            type="number"
            step="0.01"
            :rules="[v => {
              if (cobrarTotal) {
                return v >= parseFloat(saldoActual) || 'Monto insuficiente para el total'
              }
              return v >= abonoCalculado || 'Monto insuficiente para el abono'
            }]"
            variant="outlined"
            class="mb-3"
            required
          />

          <!-- Campo para número de recibo/comprobante -->
          <v-text-field
            v-if="requiereNumeroRecibo"
            v-model="numero_recibo"
            :label="`Número de ${tipoComprobanteTexto}`"
            prepend-icon="mdi-receipt"
            :rules="[v => !!v || 'Número de recibo es requerido']"
            variant="outlined"
            persistent-hint
            :hint="`Ingrese el número de ${tipoComprobanteTexto}`"
            class="mb-3"
            required
          />

          <div
            v-if="orden.tipoPago?.id == efectivoId && pagaCon >= abonoCalculado"
            class="mt-2 text-subtitle-1"
          >
            Cambio: <strong>Q {{ cambio }}</strong>
          </div>

          <div
            v-if="!cobrarTotal && abono > 0"
            class="mt-2 text-subtitle-1"
          >
            Saldo pendiente tras abono: <strong>Q {{ saldoPendiente }}</strong>
          </div>

          <v-text-field
            v-model="descripcion"
            label="Observación (opcional)"
            variant="outlined"
            persistent-hint
            hint="Ej: pago parcial, transferencia, etc."
            class="mb-3"
          />

          <v-btn
            color="primary"
            type="submit"
            prepend-icon="mdi-cash"
            class="mt-3"
            :disabled="botonCobrarDeshabilitado"
            block
          >
            Cobrar
          </v-btn>
        </v-form>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
          {{ snackbar.text }}
          <template #actions>
            <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
          </template>
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "CajaPago",
  props: {
    orden: Object,
    efectivoId: {
      type: Number,
      default: 1 // Cambia el ID según tu base de datos para "Efectivo"
    },
    usuario: Object
  },
  data() {
    return {
      cobrarTotal: true,
      abono: 0,
      pagaCon: 0,
      descripcion: "",
      numero_recibo: "",
      formValido: false,
      snackbar: {
        show: false,
        text: "",
        color: "success"
      },
      tiposPago: [
        { id: 1, nombre: "Efectivo" },
        { id: 2, nombre: "Transferencia" },
        { id: 3, nombre: "Cheque" },
        { id: 4, nombre: "Tarjeta de crédito" }
        // Agrega más si tienes otros tipos
      ]
    };
  },
  computed: {
    tipoPagoNombre() {
      return this.orden.tipoPago?.nombre || "Cargando";
    },
    saldoActual() {
      return (this.orden.total - (this.orden.pagado || 0)).toFixed(2);
    },
    abonoCalculado() {
      return this.cobrarTotal ? parseFloat(this.saldoActual) : parseFloat(this.abono || 0);
    },
    saldoPendiente() {
      return (parseFloat(this.saldoActual) - this.abonoCalculado).toFixed(2);
    },
    cambio() {
      return (this.pagaCon - this.abonoCalculado).toFixed(2);
    },
    requiereNumeroRecibo() {
      const tipoPago = this.tipoPagoNombre.toLowerCase();
      return tipoPago.includes('transferencia') ||
             tipoPago.includes('tc') ||
             tipoPago.includes('tarjeta') ||
             tipoPago.includes('cheque');
    },
    tipoComprobanteTexto() {
      const tipoPago = this.tipoPagoNombre.toLowerCase();
      if (tipoPago.includes('transferencia')) return 'transferencia';
      if (tipoPago.includes('tc') || tipoPago.includes('tarjeta')) return 'tarjeta de crédito';
      if (tipoPago.includes('cheque')) return 'cheque';
      return 'comprobante';
    },
    botonCobrarDeshabilitado() {
      if (this.requiereNumeroRecibo && !this.numero_recibo) {
        return true;
      }
      if (this.cobrarTotal) {
        if (this.orden.tipoPago?.id == this.efectivoId) {
          return this.pagaCon < parseFloat(this.saldoActual);
        }
        return false;
      } else {
        if (this.abono <= 0 || this.abono > parseFloat(this.saldoActual)) {
          return true;
        }
        if (this.orden.tipoPago?.id == this.efectivoId) {
          return this.pagaCon < this.abono;
        }
        return false;
      }
    }
  },
  methods: {
    async validarYRegistrarCobro() {
      const valido = await this.$refs.cajaForm.validate();
      if (valido) {
        this.registrarCobro();
      }
    },
    async registrarCobro() {
      try {
        const monto = this.abonoCalculado;
        let monto_recibido = null;
        let cambio = null;
        let numero_recibo = null;

        if (this.orden.tipoPago?.id == this.efectivoId) {
          monto_recibido = this.pagaCon;
          cambio = this.cambio;
        }

        if (this.requiereNumeroRecibo) {
          numero_recibo = this.numero_recibo;
        }

        const response = await axios.post(`${process.env.VUE_APP_API_URL}/caja/create`, {
          monto,
          id_orden: this.orden.id,
          id_empleado: this.usuario?.id || 1,
          id_tipo_pago: this.orden.tipoPago.id,
          tipo_movimiento: "ingreso",
          descripcion: this.descripcion,
          monto_recibido,
          cambio,
          numero_recibo
        });

        this.snackbar = {
          show: true,
          color: "success",
          text: response.data.mensaje || "Movimiento registrado"
        };

        this.$emit("cobroRealizado", response.data.movimiento);
        this.$emit("pagoCompletado", {
          estado_pago: response.data.movimiento?.estado_pago || null,
          monto_pagado: response.data.movimiento?.monto || monto,
          forma_pago: this.orden.tipoPago?.nombre || "N/D",
          vuelto: Number(this.cambio),
          numero_recibo: numero_recibo
        });
        this.$emit('regresarPaso', 1);
      } catch (error) {
        this.snackbar = {
          show: true,
          color: "error",
          text: error.response?.data?.error || "Error al registrar el pago"
        };
      }
    }
  }
};
</script>
