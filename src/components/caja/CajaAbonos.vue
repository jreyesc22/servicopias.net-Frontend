<template>
  <v-container class="py-4" max-width="800">
    <v-card>
      <v-card-title class="text-h6">
        Historial de Abonos - Orden #{{ orden.id }}
      </v-card-title>

      <v-card-text>
        <div class="mb-2">
          <strong>Cliente:</strong> {{ orden.cliente_nombre }}<br />
          <strong>Total:</strong> Q {{ orden.total.toFixed(2) }}<br />
          <strong>Abonado:</strong> Q {{ orden.abonado.toFixed(2) }}<br />
          <strong>Saldo pendiente:</strong> Q {{ orden.saldo_pendiente.toFixed(2) }}<br />
        </div>

        <v-table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Tipo de Pago</th>
              <th>N° Recibo</th>
              <th>Empleado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="abono in abonos" :key="abono.id">
              <td>{{ new Date(abono.fecha).toLocaleString() }}</td>
              <td>Q {{ abono.monto.toFixed(2) }}</td>
              <td>{{ abono.TipoPago?.nombre || 'N/D' }}</td>
              <td>{{ abono.numero_recibo || '-' }}</td>
              <td>{{ abono.Empleado?.nombre || 'N/D' }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "CajaAbonos",
  props: {
    orden: { type: Object, required: true }
  },
  data() {
    return {
      abonos: [],
      API_URL: process.env.VUE_APP_API_URL
    };
  },
  mounted() {
    this.cargarAbonos();
  },
  methods: {
    async cargarAbonos() {
      try {
        const res = await axios.get(`${this.API_URL}/caja/all`);
        this.abonos = res.data.filter(m =>
          m.id_orden === this.orden.id && m.tipo_movimiento === "ingreso"
        );
      } catch (error) {
        console.error("Error al cargar abonos:", error);
      }
    }
  }
};
</script>
