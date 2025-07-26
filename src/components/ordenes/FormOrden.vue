<template>
  <v-container :class="['form-orden', { 'form-expandida': pasoActual === 2 }]" fluid>
    <v-card elevation="2" class="pa-4">
      <v-card-title class="text-h6">🧾 Nueva Orden</v-card-title>

      <BarraEstado :pasoActual="pasoActual" />

      <!-- Paso 1: Cliente -->
      <FormCliente
        v-if="pasoActual === 1"
        :cliente="orden"
       @continuar="continuarPaso2"
      />

      <!-- Paso 2: Productos (layout horizontal mejorado) -->
      <div v-if="pasoActual === 2">
        <v-row no-gutters>
          <v-col cols="12" md="6" class="pa-2">
            <SelectorProductos @agregar="agregarItem" />
          </v-col>

          <v-col cols="12" md="6" class="pa-2">
            <v-card class="pa-4" elevation="1" height="100%">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">🛒 Productos agregados</h3>

              <v-data-table
                :headers="[
                  { text: 'Producto', value: 'nombre' },
                  { text: 'Cantidad', value: 'cantidad' },
                  { text: 'Precio Unitario', value: 'precio_unitario' },
                  { text: 'Subtotal', value: 'subtotal' },
                  { text: 'Acción', value: 'accion', sortable: false }
                ]"
                :items="orden.items"
                density="compact"
                class="tabla-resumen"
                hide-default-footer
              >
                <template #item.precio_unitario="{ item }">
                  Q {{ item.precio_unitario.toFixed(2) }}
                </template>
                <template #item.subtotal="{ item }">
                  Q {{ item.subtotal.toFixed(2) }}
                </template>
                <template #item.accion="{ index }">
                  <v-btn icon color="error" @click="quitarItem(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4 align-center justify-space-between">
          <v-col cols="12" md="6" class="text-start text-subtitle-1 font-weight-medium">
            <strong>Total: Q {{ totalOrden.toFixed(2) }}</strong>
          </v-col>
          <v-col cols="12" md="6" class="acciones">
            <v-btn color="grey" @click="pasoActual = 1">Regresar</v-btn>
            <v-btn color="primary" :disabled="orden.items.length === 0" @click="continuarPaso3">
              Siguiente
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Paso 3: Resumen -->
      <div v-if="pasoActual === 3">
        <ResumenOrden
          :orden="orden"
          @confirmar="guardarOrden"
          @cancelar="pasoActual = 2"
        />
      </div>

      <!-- Paso 4: Confirmación -->
      <div v-if="pasoActual === 4" class="text-center">
        <p>La orden fue registrada exitosamente.</p>
        <v-btn color="primary" @click="pasoActual = 5">Ir a Caja</v-btn>
      </div>

      <!-- Paso 5: Caja + Ticket -->
      <div v-if="pasoActual === 5">
        <CajaPago
          :orden="ordenGuardada"
          :efectivoId="1"
          :usuario="{ id: 1 }"
          @pagoCompletado="finalizarFlujo"
          @cobroRealizado="refrescarCaja"
        />
        <TicketPrinter
          v-if="ordenGuardada && pago"
          ref="ticketPrinter"
          :orden="ordenGuardada"
          :pago="pago"
        />
      </div>
    </v-card>
  </v-container>
</template>

<script>
import FormCliente from './FormCliente.vue'
import SelectorProductos from './SelectorProductos.vue'
import TablaResumenProductos from './TablaResumenProductos.vue'
import ResumenOrden from './ResumenOrden.vue'
import CajaPago from '../caja/CajaPago.vue'
import TicketPrinter from '../TicketPrinter.vue'
import BarraEstado from './BarraEstado.vue'

export default {
  components: {
    FormCliente,
    SelectorProductos,
    TablaResumenProductos,
    ResumenOrden,
    CajaPago,
    TicketPrinter,
    BarraEstado
  },
  data() {
    return {
      pasoActual: 1,
      pago: null,
      orden: {
        cliente_nombre: '',
        cliente_nit: '',
        cliente_telefono: '',
        estado: 'pendiente',
        total: 0,
        items: []
      },
      ordenGuardada: null,
      loading: false
    }
  },
  computed: {
    totalOrden() {
      return this.orden.items.reduce((sum, i) => sum + i.subtotal, 0)
    }
  },
  methods: {
    continuarPaso2() {
      this.pasoActual = 2
    },
    continuarPaso3() {
      if (this.orden.items.length === 0) return
      this.pasoActual = 3
    },
    agregarItem(item) {
      const existente = this.orden.items.find(i => i.itemId === item.itemId)
      if (existente) {
        existente.cantidad += item.cantidad
        existente.subtotal += item.subtotal
      } else {
        this.orden.items.push({ ...item })
      }
    },
    quitarItem(index) {
      this.orden.items.splice(index, 1)
    },
    async guardarOrden() {
      if (!this.orden.items.length) {
        alert('Debe agregar al menos un producto.')
        return
      }

      this.loading = true
      try {
        this.orden.total = this.totalOrden  // sincroniza el total antes de guardar

        const payload = {
          cliente_nombre: this.orden.cliente_nombre || 'Consumidor Final',
          cliente_nit: this.orden.cliente_nit || 'CF',
          cliente_telefono: this.orden.cliente_telefono || 'N/A',
          estado: 'pendiente',
          total: this.orden.total,
          items: this.orden.items.map(i => ({
            itemId: i.itemId,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
            subtotal: i.subtotal
          }))
        }

        const res = await fetch(`${process.env.VUE_APP_API_URL}/ordenes/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const texto = await res.text()
        if (!res.ok) throw new Error(texto)

        const resData = JSON.parse(texto)
        this.ordenGuardada = {
          ...this.orden,
          id: resData.orden.id
        }

        this.pasoActual = 4
      } catch (err) {
        console.error('Error al guardar la orden:', err)
        alert('Hubo un error al guardar la orden.')
      } finally {
        this.loading = false
      }
    },
    finalizarFlujo(pago) {
      this.pago = pago
      this.$nextTick(() => {
        this.$refs.ticketPrinter.imprimir()
        setTimeout(() => this.iniciarNuevaOrden(), 1000)
      })
      this.pasoActual = 5
    },
    refrescarCaja() {
      console.log("Caja actualizada")
    },
    iniciarNuevaOrden() {
      this.orden = {
        cliente_nombre: '',
        cliente_nit: '',
        cliente_telefono: '',
        estado: 'pendiente',
        total: 0,
        items: []
      }
      this.ordenGuardada = null
      this.pago = null
      this.pasoActual = 1
    }
  }
}
</script>
<style scoped>
.form-orden {
  max-width: 1200px;
  margin: 0 auto;
  transition: max-width 0.3s ease;
}
.form-expandida {
  max-width: 1800px;
}

.barra-estado {
  font-weight: bold;
}
.barra-estado .activo {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}
.acciones {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.tabla-scroll {
  overflow-x: auto;
}
.tabla-resumen {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}
</style>
