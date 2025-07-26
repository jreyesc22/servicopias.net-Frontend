<template>
  <v-card ref="contenidoPDF" class="pa-4 printable-factura" style="width: 100%;">
    <!-- ENCABEZADO ESTILO FACTURA -->
    <v-row no-gutters class="mb-2" align="center">
      <v-col cols="8">
        <div class="text-h6 font-weight-bold" style="color:#1976d2; letter-spacing:2px;">SERVICOPIAS SALAMÁ</div>
        <div class="text-caption" style="color:#616161;">
          8va. Avenida 7-25 zona 1, Salamá, Baja Verapaz<br>
          NIT: 7248213-3
        </div>
      </v-col>
      <v-col cols="4" class="text-right">
        <div class="text-h6 font-weight-bold" style="color:#d32f2f;">PROFORMA</div>
        <div class="text-caption">
          <span class="numero-rojo">No. {{ orden.id }}</span><br>
          <span style="color:#616161;">Fecha: {{ orden.fecha ? new Date(orden.fecha).toLocaleDateString() : '-' }}</span>
        </div>
      </v-col>
    </v-row>
    <v-divider class="my-2"></v-divider>

    <!-- DATOS DEL CLIENTE -->
    <v-row dense>
      <v-col cols="6">
        <strong>Cliente:</strong> {{ orden.cliente_nombre || 'No especificado' }}<br>
        <strong>Teléfono:</strong> {{ orden.cliente_telefono || '-' }}<br>
        <strong>NIT:</strong> {{ orden.cliente_nit || 'C/F' }}<br>
      </v-col>
      <v-col cols="6">
        <strong>Estado de Orden:</strong> {{ orden.estado || 'pendiente' }}<br>
        <strong>Estado de Pago:</strong> {{ orden.estado_pago || 'pendiente' }}<br>
        <strong>Tipo de Pago:</strong> {{ orden.tipoPago?.nombre || 'N/D' }}<br>
        <strong>Fecha de Entrega:</strong>
        {{ orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString() : 'N/D' }}<br>
      </v-col>
    </v-row>

    <v-divider class="my-2"></v-divider>

    <!-- TABLA DE PRODUCTOS -->
    <v-table class="tabla-factura mb-4">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in orden.items" :key="index">
          <td>{{ item.item?.nombre || '-' }}</td>
          <td>{{ item.cantidad }}</td>
          <td>Q {{ Number(item.precio_unitario).toFixed(2) }}</td>
          <td>Q {{ Number(item.subtotal).toFixed(2) }}</td>
        </tr>
      </tbody>
    </v-table>

    <!-- NOTAS -->
    <div class="mb-2" style="font-size:13px; color:#1976d2;">
      <strong>NOTA:</strong><br>
      - Para procesar esta proforma, debe pagar el 50% del total de la orden.<br>
      - El saldo restante debe ser pagado al momento de la entrega.<br>
      - Cualquier reclamo debe hacerse dentro de 24 hrs.<br>
      - Coordine con su representante de ventas.<br>
      - La disponibilidad está sujeta a cambios.
    </div>

    <!-- TABLA DE PAGOS -->
    <v-table class="tabla-factura mb-4" v-if="pagosCaja && pagosCaja.length > 0">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Monto</th>
          <th>Tipo de Pago</th>
          <th>Número Recibo</th>
          <th>Monto Recibido</th>
          <th>Cambio</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pago in pagosCaja" :key="pago.id">
          <td>{{ new Date(pago.fecha).toLocaleDateString() }}</td>
          <td style="text-align:right; font-weight:bold; color:#1976d2;">
            Q {{ Number(pago.monto).toFixed(2) }}
          </td>
          <td>
            <v-icon v-if="pago.tipo_pago_nombre === 'Efectivo'" color="green" small>mdi-cash</v-icon>
            <v-icon v-else-if="pago.tipo_pago_nombre === 'Tarjeta'" color="blue" small>mdi-credit-card</v-icon>
            <v-icon v-else-if="pago.tipo_pago_nombre === 'Transferencia'" color="purple" small>mdi-bank-transfer</v-icon>
            {{ pago.tipo_pago_nombre }}
          </td>
          <td>{{ pago.numero_recibo || '-' }}</td>
          <td style="text-align:right;">
            <span v-if="pago.monto_recibido">Q {{ Number(pago.monto_recibido).toFixed(2) }}</span>
            <span v-else>-</span>
          </td>
          <td style="text-align:right;">
            <span v-if="pago.cambio">Q {{ Number(pago.cambio).toFixed(2) }}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="pago.descripcion">{{ pago.descripcion }}</span>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- TOTALES -->
    <v-row justify="end">
      <v-col cols="6">
        <table class="totales-factura">
          <tbody>
            <tr>
              <td><strong>Total</strong></td>
              <td class="text-right">Q {{ total.toFixed(2) }}</td>
            </tr>
            <tr v-if="pagosCaja && pagosCaja.length > 0">
              <td colspan="2"><strong>Abonos realizados:</strong></td>
            </tr>
            <tr v-for="pago in pagosCaja" :key="'total-' + pago.id">
              <td>
                <v-icon v-if="pago.tipo_pago_nombre === 'Efectivo'" color="green" small>mdi-cash</v-icon>
                <v-icon v-else-if="pago.tipo_pago_nombre === 'Tarjeta'" color="blue" small>mdi-credit-card</v-icon>
                <v-icon v-else-if="pago.tipo_pago_nombre === 'Transferencia'" color="purple" small>mdi-bank-transfer</v-icon>
                {{ new Date(pago.fecha).toLocaleDateString() }}
                <span style="font-size:10px;">
                  {{ pago.tipo_pago_nombre }}
                  <span v-if="pago.numero_recibo">({{ pago.numero_recibo }})</span>
                </span>
              </td>
              <td class="text-right">Q {{ Number(pago.monto).toFixed(2) }}</td>
            </tr>
            <tr v-if="pagosCaja && pagosCaja.length > 0">
              <td><strong>Total Abonado</strong></td>
              <td class="text-right" style="color: #1976d2; font-weight: bold;">Q {{ totalAbonado.toFixed(2) }}</td>
            </tr>
            <tr v-if="pagosCaja && pagosCaja.length > 0">
              <td><strong>Saldo</strong></td>
              <td class="text-right" :style="{color: (total - totalAbonado) > 0 ? 'red' : 'green', fontWeight: 'bold'}">
                Q {{ (total - totalAbonado).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </v-col>
    </v-row>


  </v-card>
</template>

<script>
export default {
  name: 'OrdenDetalle',
  props: {
    orden: { 
      type: Object, 
      required: true 
    },
    pagosCaja: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      generandoPDF: false
    }
  },
  mounted() {
    // Exponer el método al componente padre
    this.$emit('component-ready', {
      exportarPDF: this.exportarPDF,
      generandoPDF: () => this.generandoPDF
    })
  },
  computed: {
    total() {
      return this.orden.items?.reduce((acc, item) => acc + Number(item.subtotal), 0) || 0
    },
    totalAbonado() {
      return this.pagosCaja.reduce((acc, pago) => acc + Number(pago.monto), 0)
    }
  },
  methods: {
    async exportarPDF() {
      this.generandoPDF = true
      
      try {
        // Importar html2pdf dinámicamente
        const { default: html2pdf } = await import('html2pdf.js')
        
        console.log('Exportando PDF de la orden:', this.orden.id)
        
        const element = this.$refs.contenidoPDF.$el || this.$refs.contenidoPDF
        
        // Configuración mejorada para el PDF
        const options = {
          margin: [10, 10, 10, 10],
          filename: `proforma_${this.orden.id}_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { 
            type: 'jpeg', 
            quality: 0.98 
          },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            floatPrecision: 16
          }
        }
        
        // Crear y descargar el PDF
        await html2pdf().set(options).from(element).save()
        
        // Emitir evento de éxito al componente padre
        this.$emit('pdf-generated', { 
          success: true, 
          filename: options.filename,
          ordenId: this.orden.id 
        })
        
        return { success: true }
        
      } catch (error) {
        console.error('Error al generar PDF:', error)
        
        // Emitir evento de error al componente padre
        this.$emit('pdf-generated', { 
          success: false, 
          error: error.message,
          ordenId: this.orden.id 
        })
        
        // Fallback: usar window.print()
        this.imprimirFallback()
        
        return { success: false, error: error.message }
        
      } finally {
        this.generandoPDF = false
      }
    },
    
    imprimirFallback() {
      console.log('Usando método de impresión alternativo')
      window.print()
    }
  }
}
</script>

<style scoped>
.printable-factura {
  background: #fafafa;
  color: #222;
  font-size: 13px;
  border: 1.5px solid #1976d2;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.08);
  width: 100%;
  max-width: 800px;
  margin: auto;
  padding: 32px 24px;
}

.text-h6 {
  font-size: 1.3rem;
  letter-spacing: 1px;
}

.tabla-factura {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 12px;
  background: #fff;
}

.tabla-factura th {
  background: #1976d2;
  color: #fff;
  font-weight: bold;
  font-size: 12px;
  padding: 6px 4px;
  border: 1px solid #1976d2;
}

.tabla-factura td {
  border: 1px solid #bdbdbd;
  padding: 6px 4px;
  font-size: 12px;
}

.totales-factura {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.totales-factura td {
  border: none;
  padding: 5px 4px;
  font-size: 12px;
}

.totales-factura tr td:first-child {
  font-weight: 500;
}

.totales-factura td.text-right {
  text-align: right;
}

.numero-rojo {
  color: #d32f2f;
  font-weight: bold;
  font-size: 15px;
  letter-spacing: 1px;
}

.v-divider {
  border-color: #1976d2 !important;
}

.mb-2 {
  margin-bottom: 12px !important;
}

.mb-4 {
  margin-bottom: 24px !important;
}

.text-right {
  text-align: right;
}

strong {
  color: #1976d2;
}

/* Estilos para impresión */
@media print {
  .printable-factura {
    box-shadow: none !important;
    border: 1px solid #000 !important;
    background: #fff !important;
    margin: 0 !important;
    padding: 20px !important;
  }
  
  .v-btn {
    display: none !important;
  }
  
  .v-icon {
    display: none !important;
  }
}
</style>