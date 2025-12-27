<template>
  <div class="lista-ordenes">
    <h3 class="text-h5 mb-4">Historial de Órdenes</h3>

    <!-- Filtros -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filtroCliente"
          label="Buscar por cliente"
          prepend-inner-icon="mdi-magnify"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filtroFecha"
          label="Filtrar por fecha"
          type="date"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filtroEstado"
          :items="estadosDisponibles"
          label="Filtrar por estado"
          clearable
          prepend-inner-icon="mdi-filter"
        />
      </v-col>
      <v-col cols="12" md="3" class="d-flex align-center">
        <v-btn @click="filtrarOrdenes" color="primary" class="mr-2">Filtrar</v-btn>
        <v-btn @click="limpiarFiltros" color="grey">Limpiar</v-btn>
      </v-col>
    </v-row>

    <!-- Información de resultados -->
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div class="text-body-2 text-grey-darken-1">
          Mostrando {{ ordenesParaPaginar.length }} de {{ ordenesFiltradas.length }} resultados
        </div>
        <v-select
          v-model="itemsPorPagina"
          :items="[10, 25, 50, 100]"
          label="Elementos por página"
          variant="outlined"
          density="compact"
          style="max-width: 200px;"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-responsive class="overflow-auto">
      <v-table class="elevation-1 min-width-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>NIT</th>
            <th>Fecha Orden</th>
            <th>Fecha Entrega</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Estado de Pago</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="orden in ordenesParaPaginar" :key="orden.id">
            <td>{{ orden.id }}</td>
            <td>{{ orden.cliente_nombre }}</td>
            <td>{{ orden.cliente_telefono }}</td>
            <td>{{ orden.cliente_nit }}</td>
            <td>{{ orden.fecha ? new Date(orden.fecha).toLocaleString() : '-' }}</td>
            <td>
              <span v-if="orden.fecha_entrega">
                {{ new Date(orden.fecha_entrega).toLocaleDateString() }}
              </span>
              <span v-else class="text-grey">Sin fecha</span>
            </td>
            <td>Q {{ orden.total != null ? Number(orden.total).toFixed(2) : '0.00' }}</td>
            <td>
              <v-chip :color="estadoColor(orden.estado)" text-color="white" small>
                {{ orden.estado }}
              </v-chip>
            </td>
            <td>
              <v-chip
                :color="orden.estado_pago === 'pagado'
                  ? 'green'
                  : orden.estado_pago === 'parcial'
                  ? 'orange'
                  : 'grey'"
                text-color="white"
                small
              >
                {{ orden.estado_pago }}
              </v-chip>
            </td>
            <td>
              <v-btn size="small" color="primary" @click="verDetalle(orden)" class="mr-1">
                VER
              </v-btn>
              <v-btn
                v-if="orden.estado_pago !== 'pagado' && orden.estado !== 'cancelado'"
                size="small"
                color="warning"
                @click="abrirAbonar(orden)"
              >
                ABONAR
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-responsive>

    <!-- Paginación -->
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="paginaActual"
          :length="totalPaginas"
          :total-visible="7"
          color="primary"
          @update:model-value="cambiarPagina"
        />
      </v-col>
    </v-row>

    <!-- Modal Detalle -->
    <v-dialog v-model="dialogDetalle" max-width="900px" persistent scrollable>
      <v-card>
        <v-card-title class="text-h6">
          Orden #{{ ordenSeleccionada?.id }}
        </v-card-title>
        
        <v-card-text>
          <OrdenDetalle
            v-if="ordenSeleccionada"
            ref="ordenDetalleComponent"
            :orden="ordenSeleccionada"
            :pagosCaja="pagosCaja"
            @pdf-generated="onPDFGenerated"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn 
            color="purple" 
            @click="exportarPDF"
            :loading="generandoPDF"
            :disabled="!componenteDetalleReady"
            prepend-icon="mdi-file-pdf-box"
          >
            {{ generandoPDF ? 'Generando...' : 'Exportar PDF' }}
          </v-btn>
          <v-btn color="red" @click="dialogDetalle = false">
            <v-icon start>mdi-close</v-icon> Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Abonar -->
    <v-dialog v-model="dialogAbonar" max-width="600px" persistent>
      <v-card>
        <v-card-text>
          <AbonarOrden
            v-if="ordenSeleccionada"
            :orden="ordenSeleccionada"
            :tipos-de-pago="tiposDePago"
            :empleado-id="empleadoId"
            @terminar="cerrarAbono"
            @snackbar="mostrarSnackbar" 
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="red" @click="dialogAbonar = false">
            <v-icon start>mdi-close</v-icon> Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.mostrar"
      :color="snackbar.color"
      timeout="4000"
      location="bottom right"
    >
      {{ snackbar.mensaje }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.mostrar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import OrdenDetalle from './OrdenDetalle.vue'
import AbonarOrden from '../caja/AbonarOrden.vue'
import AuthService from '@/services/auth.service'

export default {
  name: 'ListaOrdenes',
  components: { OrdenDetalle, AbonarOrden },
  data() {
    return {
      ordenes: [],
      ordenesFiltradas: [],
      ordenSeleccionada: null,
      dialogDetalle: false,
      dialogAbonar: false,
      filtroCliente: '',
      filtroFecha: '',
      filtroEstado: null,
      loading: false,
      pagosCaja: [],
      tiposDePago: [],
      empleadoId: null,

      // Estado para PDF
      generandoPDF: false,
      componenteDetalleReady: false,

      // Paginación
      paginaActual: 1,
      itemsPorPagina: 25,

      // Snackbar para mensajes de estado
      snackbar: {
        mostrar: false,
        mensaje: '',
        color: ''
      }
    }
  },
  computed: {
    estadosDisponibles() {
      // Obtener todos los estados únicos de las órdenes
      const estados = [...new Set(this.ordenes.map(orden => orden.estado).filter(estado => estado))]
      return estados.sort()
    },
    totalPaginas() {
      return Math.ceil(this.ordenesFiltradas.length / this.itemsPorPagina)
    },
    ordenesParaPaginar() {
      const inicio = (this.paginaActual - 1) * this.itemsPorPagina
      const fin = inicio + this.itemsPorPagina
      return this.ordenesFiltradas.slice(inicio, fin)
    }
  },
  watch: {
    itemsPorPagina() {
      this.paginaActual = 1
    },
    ordenesFiltradas() {
      // Resetear a la primera página cuando cambian los filtros
      this.paginaActual = 1
    },
    dialogDetalle(newVal) {
      if (!newVal) {
        // Reset cuando se cierra el modal
        this.componenteDetalleReady = false
        this.generandoPDF = false
      }
    }
  },
  mounted() {
    this.cargarOrdenes()
    this.cargarTiposDePago()
    
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      this.empleadoId = currentUser.id
    }
  },
  methods: {
    async cargarOrdenes() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/ordenes/all`)
        const data = await res.json()
        this.ordenes = data
        this.ordenesFiltradas = data
      } catch (err) {
        console.error('Error al cargar órdenes:', err)
        this.mostrarSnackbar({
          text: 'Error al cargar órdenes ❌',
          color: 'error'
        })
      }
    },
    async cargarTiposDePago() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/tipos_pago/all`)
        this.tiposDePago = await res.json()
      } catch (err) {
        console.error('Error al cargar tipos de pago', err)
        this.mostrarSnackbar({
          text: 'Error al cargar tipos de pago ❌',
          color: 'error'
        })
      }
    },
    filtrarOrdenes() {
      this.ordenesFiltradas = this.ordenes.filter(orden => {
        const nombreMatch = this.filtroCliente === '' || orden.cliente_nombre?.toLowerCase().includes(this.filtroCliente.toLowerCase())
        const fechaMatch = this.filtroFecha === '' || orden.fecha?.substring(0, 10) === this.filtroFecha
        const estadoMatch = this.filtroEstado === null || orden.estado === this.filtroEstado
        return nombreMatch && fechaMatch && estadoMatch
      })
    },
    limpiarFiltros() {
      this.filtroCliente = ''
      this.filtroFecha = ''
      this.filtroEstado = null
      this.ordenesFiltradas = [...this.ordenes]
    },
    cambiarPagina(pagina) {
      this.paginaActual = pagina
    },
    async verDetalle(orden) {
      this.dialogDetalle = true
      this.ordenSeleccionada = orden
      this.pagosCaja = []
      this.componenteDetalleReady = false

      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/abonos/orden/${orden.id}`)
        if (!res.ok) throw new Error(await res.text())
        const pagos = await res.json()
        this.pagosCaja = pagos
        
        // Esperar un tick para que el componente se monte
        await this.$nextTick()
        this.componenteDetalleReady = true
        
      } catch (err) {
        console.error(`Error al cargar pagos para orden ${orden.id}:`, err)
        this.mostrarSnackbar({
          text: 'Error al cargar pagos de la orden ❌',
          color: 'error'
        })
      }
    },
    abrirAbonar(orden) {
      this.ordenSeleccionada = orden
      this.dialogAbonar = true
    },
    cerrarAbono() {
      this.dialogAbonar = false
      this.ordenSeleccionada = null
      this.cargarOrdenes()
    },
    
    // Función corregida para exportar PDF
    async exportarPDF() {
      if (!this.componenteDetalleReady || !this.$refs.ordenDetalleComponent) {
        this.mostrarSnackbar({
          text: 'El componente no está listo para generar el PDF',
          color: 'warning'
        })
        return
      }

      this.generandoPDF = true

      try {
        // Llamar al método exportarPDF del componente hijo
        await this.$refs.ordenDetalleComponent.exportarPDF()
        
        // El evento @pdf-generated manejará la notificación
        
      } catch (error) {
        console.error('Error al exportar PDF:', error)
        this.mostrarSnackbar({
          text: `Error al generar PDF: ${error.message}`,
          color: 'error'
        })
      } finally {
        this.generandoPDF = false
      }
    },

    // Manejar eventos del componente hijo
    onPDFGenerated(result) {
      if (result.success) {
        this.mostrarSnackbar({
          text: `PDF generado exitosamente: ${result.filename}`,
          color: 'success'
        })
      } else {
        this.mostrarSnackbar({
          text: `Error al generar PDF: ${result.error}`,
          color: 'error'
        })
      }
    },

    estadoColor(estado) {
      switch ((estado || '').toLowerCase()) {
        case 'cancelado': return 'red'
        case 'entregado': return 'green'
        case 'en proceso': return 'orange'
        case 'pendiente': return 'grey'
        case 'finalizado': return 'teal'
        case 'en produccion': return 'blue'
        default: return 'purple'
      }
    },
    mostrarSnackbar({ text, color }) {
      this.snackbar.mensaje = text
      this.snackbar.color = color || 'info'
      this.snackbar.mostrar = true
    }
  }
}
</script>

<style scoped>
.lista-ordenes {
  padding: 10px;
  max-width: 1400px;
  margin: 0 auto;
}
.min-width-table {
  min-width: 1200px;
}
</style>