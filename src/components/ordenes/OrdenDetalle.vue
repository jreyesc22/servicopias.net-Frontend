<template>
  <div ref="contenidoPDF" class="printable-factura">
    <!-- ENCABEZADO -->
    <div class="header">
      <div class="header-left">
        <h1 class="company-name">SERVICOPIAS SALAMÁ</h1>
        <div class="company-address">
          8va. Avenida 7-25 zona 1, Salamá, Baja Verapaz<br>
          NIT: 7248213-3
        </div>
      </div>
      <div class="header-right">
        <div class="document-type">PROFORMA</div>
        <div class="document-info">
          <div class="document-number">No. {{ orden.id }}</div>
          <div class="document-date">
            Fecha: {{ orden.fecha ? new Date(orden.fecha).toLocaleDateString() : '-' }}
          </div>
        </div>
      </div>
    </div>

    <div class="separator"></div>

    <!-- DATOS CLIENTE -->
    <div class="client-section">
      <div class="client-left">
        <div class="field">
          <span class="label">Cliente:</span>
          <span class="value">{{ orden.cliente_nombre || 'No especificado' }}</span>
        </div>
        <div class="field">
          <span class="label">Teléfono:</span>
          <span class="value">{{ orden.cliente_telefono || '-' }}</span>
        </div>
        <div class="field">
          <span class="label">NIT:</span>
          <span class="value">{{ orden.cliente_nit || 'C/F' }}</span>
        </div>
      </div>
      <div class="client-right">
        <div class="field">
          <span class="label">Estado:</span>
          <span class="value">{{ orden.estado || 'Pendiente' }}</span>
        </div>
        <div class="field">
          <span class="label">Pago:</span>
          <span class="value">{{ orden.estado_pago || 'Pendiente' }}</span>
        </div>
        <div class="field">
          <span class="label">Entrega:</span>
          <span class="value">{{ orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString() : 'N/D' }}</span>
        </div>
      </div>
    </div>

    <div class="separator"></div>

    <!-- TABLA PRODUCTOS -->
    <div class="products-section">
      <table class="products-table">
        <thead>
          <tr>
            <th class="col-product">PRODUCTO</th>
            <th class="col-qty">CANT.</th>
            <th class="col-price">PRECIO UNIT.</th>
            <th class="col-total">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orden.items" :key="item.id" class="product-row">
            <td class="product-name">{{ item.item?.nombre || '-' }}</td>
            <td class="quantity">{{ item.cantidad }}</td>
            <td class="unit-price">Q {{ Number(item.precio_unitario).toFixed(2) }}</td>
            <td class="subtotal">Q {{ Number(item.subtotal).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TOTAL -->
    <div class="total-section">
      <div class="total-row">
        <span class="total-label">TOTAL:</span>
        <span class="total-amount">Q {{ total.toFixed(2) }}</span>
      </div>
    </div>

    <div class="separator"></div>

    <!-- CONDICIONES -->
    <div class="terms-section">
      <div class="terms-title">CONDICIONES:</div>
      <div class="terms-content">
        • Para procesar esta proforma, debe pagar el 50% del total • El saldo restante se paga al entregar • Reclamos: dentro de 24 hrs • Coordine con su representante • La disponibilidad está sujeta a cambios
      </div>
    </div>

    <!-- PAGOS (si existen) -->
    <div v-if="pagosCaja.length > 0" class="payments-section">
      <div class="separator"></div>
      <div class="payments-title">HISTORIAL DE PAGOS</div>
      <table class="payments-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>MONTO</th>
            <th>TIPO</th>
            <th>RECIBO</th>
            <th>RECIBIDO</th>
            <th>CAMBIO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagosCaja" :key="pago.id">
            <td>{{ new Date(pago.fecha).toLocaleDateString() }}</td>
            <td>Q {{ Number(pago.monto).toFixed(2) }}</td>
            <td>{{ pago.tipo_pago_nombre }}</td>
            <td>{{ pago.numero_recibo || '-' }}</td>
            <td>{{ pago.monto_recibido ? 'Q ' + Number(pago.monto_recibido).toFixed(2) : '-' }}</td>
            <td>{{ pago.cambio ? 'Q ' + Number(pago.cambio).toFixed(2) : '-' }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="payments-summary">
        <div class="summary-line">
          <span>Total Orden:</span>
          <span>Q {{ total.toFixed(2) }}</span>
        </div>
        <div class="summary-line">
          <span>Total Abonado:</span>
          <span>Q {{ totalAbonado.toFixed(2) }}</span>
        </div>
        <div class="summary-line final-balance">
          <span>Saldo Pendiente:</span>
          <span>Q {{ saldo.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- PIE -->
    <div class="footer">
      <div class="separator"></div>
      <div class="footer-text">Gracias por su preferencia</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrdenDetalle',
  props: {
    orden: { type: Object, required: true },
    pagosCaja: { type: Array, default: () => [] }
  },
  data: () => ({
    generandoPDF: false
  }),
  mounted() {
    this.$emit('component-ready', {
      exportarPDF: this.exportarPDF,
      generandoPDF: () => this.generandoPDF
    })
  },
  computed: {
    total() {
      return this.orden.items?.reduce((acc, i) => acc + Number(i.subtotal), 0) || 0
    },
    totalAbonado() {
      return this.pagosCaja.reduce((acc, p) => acc + Number(p.monto), 0)
    },
    saldo() {
      return this.total - this.totalAbonado
    }
  },
  methods: {
    async exportarPDF() {
      this.generandoPDF = true
      try {
        const { default: html2pdf } = await import('html2pdf.js')
        const element = this.$refs.contenidoPDF

        const options = {
          margin: [5, 5, 5, 5],
          filename: `proforma_${this.orden.id}_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            allowTaint: true,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm',
            format: 'letter',
            orientation: 'portrait' 
          }
        }

        await html2pdf().set(options).from(element).save()
        this.$emit('pdf-generated', { success: true, ordenId: this.orden.id })
        return { success: true }
      } catch (error) {
        this.$emit('pdf-generated', { success: false, error: error.message, ordenId: this.orden.id })
        this.imprimirFallback()
        return { success: false, error: error.message }
      } finally {
        this.generandoPDF = false
      }
    },
    imprimirFallback() {
      window.print()
    }
  }
}
</script>

<style scoped>
@media print {
  .printable-factura {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-scheme: exact;
  }
}

.printable-factura {
  width: 8.5in;
  min-height: 10.5in;
  margin: 1 auto;
  padding: 0.5in;
  background: white;
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 11pt;
  line-height: 1;
  color: #000;
  box-sizing: border-box;
}

/* ENCABEZADO */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20pt;
}

.company-name {
  font-size: 18pt;
  font-weight: bold;
  margin: 0 0 6pt 0;
  letter-spacing: 1pt;
}

.company-address {
  font-size: 9pt;
  line-height: 1.3;
}

.header-right {
  text-align: right;
}

.document-type {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 6pt;
  letter-spacing: 1pt;
}

.document-number {
  font-size: 12pt ;
  font-weight: bold ;
  color: #c40909 ;
  margin-bottom: 3pt;
}

.document-date {
  font-size: 10pt;
}

/* SEPARADORES */
.separator {
  border-top: 1px solid #000;
  margin: 12pt 0;
}

/* CLIENTE */
.client-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12pt;
}

.client-left,
.client-right {
  width: 48%;
}

.field {
  margin-bottom: 4pt;
  display: flex;
}

.label {
  font-weight: bold;
  min-width: 80pt;
  margin-right: 6pt;
}

.value {
  flex: 1;
}

/* PRODUCTOS */
.products-section {
  margin-bottom: 12pt;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12pt;
}

.products-table th {
  background: #1096f07e;
  border: 1pt solid #000;
  padding: 6pt 4pt;
  font-weight: bold;
  font-size: 10pt;
  text-align: left;
}

.products-table td {
  border: 1pt solid #000;
  padding: 4pt;
  font-size: 10pt;
  vertical-align: top;
}

.col-product { width: 50%; }
.col-qty { width: 10%; text-align: center; }
.col-price { width: 20%; text-align: right; }
.col-total { width: 20%; text-align: right; }

.quantity {
  text-align: center;
  font-weight: bold;
}

.unit-price,
.subtotal {
  text-align: right;
  font-weight: bold;
}

/* TOTAL */
.total-section {
  text-align: right;
  margin-bottom: 12pt;
}

.total-row {
  display: inline-block;
  border: 1pt solid #000;
  padding: 4pt 12pt;
  background: #f8f8f8;
}

.total-label {
  font-size: 12pt;
  font-weight: bold;
  margin-right: 12pt;
}

.total-amount {
  font-size: 12pt;
  font-weight: bold;
}

/* CONDICIONES */
.terms-section {
  margin-bottom: 12pt;
}

.terms-title {
  font-weight: bold;
  font-size: 11pt;
  margin-bottom: 4pt;
}

.terms-content {
  font-size: 9pt;
  line-height: 1.4;
}

/* PAGOS */
.payments-section {
  margin-bottom: 12pt;
}

.payments-title {
  font-weight: bold;
  font-size: 11pt;
  margin-bottom: 6pt;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  margin-bottom: 8pt;
}

.payments-table th,
.payments-table td {
  border: 1pt solid #000;
  padding: 3pt;
  text-align: left;
}

.payments-table th {
  background: #1096f07e;
  font-weight: bold;
}

.payments-summary {
  text-align: right;
  font-size: 10pt;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2pt;
  padding: 2pt 0;
}

.final-balance {
  border-top: 1pt solid #000;
  padding-top: 4pt;
  font-weight: bold;
  font-size: 11pt;
}

/* PIE */
.footer {
  margin-top: 24pt;
}

.footer-text {
  text-align: center;
  font-size: 10pt;
  font-style: italic;
}

/* RESPONSIVE PARA PANTALLA */
@media screen and (max-width: 780px) {
  .printable-factura {
    width: 100%;
    padding: 14pt;
    font-size: 10pt;
  }
  
  .header {
    flex-direction: column;
    gap: 12pt;
  }
  
  .client-section {
    flex-direction: column;
    gap: 8pt;
  }
  
  .client-left,
  .client-right {
    width: 100%;
  }
}
</style>