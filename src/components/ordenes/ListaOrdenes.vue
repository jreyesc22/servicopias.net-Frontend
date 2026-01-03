<template>
  <div class="lista-ordenes">
    <h3 class="text-h5 mb-4">Historial de Órdenes</h3>

    <!-- Filtros -->
    <v-card class="mb-4 filters-card" elevation="1">
      <v-card-text class="py-3">
        <!-- Chips de tipo de búsqueda -->
        <div class="d-flex align-center gap-3 mb-4 flex-wrap">
          <span class="text-subtitle-2 font-weight-medium text-medium-emphasis">
            Buscar por:
          </span>
          <v-chip-group v-model="filtros.tipo" mandatory class="filter-chips">
            <v-chip 
              value="todos" 
              color="primary"
              variant="outlined" 
              size="large"
              filter
            >
              <v-icon start>mdi-format-list-bulleted</v-icon>
              Todas
            </v-chip>
            <v-chip 
              value="id" 
              color="purple"
              variant="outlined" 
              size="large"
              filter
            >
              <v-icon start>mdi-pound</v-icon>
              ID
            </v-chip>
            <v-chip 
              value="cliente" 
              color="blue"
              variant="outlined" 
              size="large"
              filter
            >
              <v-icon start>mdi-account</v-icon>
              Cliente
            </v-chip>
            <v-chip 
              value="fecha" 
              color="orange"
              variant="outlined" 
              size="large"
              filter
            >
              <v-icon start>mdi-calendar</v-icon>
              Fecha
            </v-chip>
            <v-chip 
              value="rango" 
              color="teal"
              variant="outlined" 
              size="large"
              filter
            >
              <v-icon start>mdi-calendar-range</v-icon>
              Rango de Fechas
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Campos dinámicos según tipo de búsqueda -->
        <v-row v-if="filtros.tipo !== 'todos'" dense class="mb-3">
          <!-- Filtro por ID -->
          <v-col v-if="filtros.tipo === 'id'" cols="12" md="4">
            <v-text-field
              v-model="filtros.id"
              label="ID de Orden"
              type="number"
              prepend-inner-icon="mdi-pound"
              clearable
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- Filtros por cliente -->
          <template v-if="filtros.tipo === 'cliente'">
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filtros.cliente_nombre"
                label="Nombre del cliente"
                prepend-inner-icon="mdi-account"
                clearable
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filtros.cliente_nit"
                label="NIT del cliente"
                prepend-inner-icon="mdi-card-account-details"
                clearable
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
          </template>

          <!-- Filtro por fecha única -->
          <v-col v-if="filtros.tipo === 'fecha'" cols="12" md="4">
            <v-text-field
              v-model="filtros.fecha"
              label="Fecha"
              type="date"
              prepend-inner-icon="mdi-calendar"
              clearable
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- Filtros por rango de fechas -->
          <template v-if="filtros.tipo === 'rango'">
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filtros.fechaInicio"
                label="Fecha Inicio"
                type="date"
                prepend-inner-icon="mdi-calendar-start"
                clearable
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filtros.fechaFin"
                label="Fecha Fin"
                type="date"
                prepend-inner-icon="mdi-calendar-end"
                clearable
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filtros.estado"
                :items="estadosDisponibles"
                label="Estado"
                prepend-inner-icon="mdi-tag"
                clearable
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filtros.estadoPago"
                :items="estadosPagoDisponibles"
                label="Estado Pago"
                prepend-inner-icon="mdi-cash"
                clearable
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
          </template>
        </v-row>

        <!-- Botones de acción -->
        <div class="d-flex justify-end gap-2 mt-3">
          <v-btn 
            v-if="filtros.tipo !== 'todos'"
            @click="aplicarFiltros" 
            color="primary" 
            :loading="loading"
            :disabled="loading"
            size="large"
          >
            <v-icon start>mdi-magnify</v-icon>
            Buscar
          </v-btn>
          <v-btn 
            v-if="filtros.tipo !== 'todos'"
            @click="limpiarFiltros" 
            color="grey" 
            variant="outlined"
            :disabled="loading"
            size="large"
          >
            <v-icon start>mdi-close</v-icon>
            Limpiar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Alerta de error -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      @click:close="limpiarError"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <!-- Información de resultados -->
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div class="text-body-2 text-grey-darken-1">
          <template v-if="ultimaBusqueda && ultimaBusqueda.tipo !== 'todos'">
            <v-chip size="small" color="primary" variant="tonal" class="mr-2">
              <v-icon start size="small">mdi-filter</v-icon>
              Resultados filtrados
            </v-chip>
            Mostrando {{ resultados.length }} de {{ totalResultados }} (Página {{ paginacion.page }} de {{ paginacion.totalPages }})
          </template>
          <template v-else>
            Mostrando {{ resultados.length }} de {{ totalResultados }} órdenes (Página {{ paginacion.page }} de {{ paginacion.totalPages }})
          </template>
        </div>
        <v-select
          v-model="itemsPorPaginaLocal"
          :items="[10, 25, 50, 100]"
          label="Por página"
          variant="outlined"
          density="compact"
          style="max-width: 150px;"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-responsive class="overflow-auto">
      <v-data-table
        :headers="headers"
        :items="resultados"
        :loading="loading"
        :items-per-page="itemsPorPaginaLocal"
        class="elevation-2"
        loading-text="Cargando órdenes..."
        no-data-text="No se encontraron órdenes"
        hover
      >
        <!-- ID con badge -->
        <template #item.id="{ item }">
          <v-badge
            :content="item.id"
            color="primary"
            inline
          >
            <v-avatar size="36" color="grey-lighten-3">
              <v-icon>mdi-receipt-text</v-icon>
            </v-avatar>
          </v-badge>
        </template>

        <!-- Cliente con teléfono y NIT -->
        <template #item.cliente="{ item }">
          <div class="cliente-info">
            <div class="text-subtitle-1 font-weight-medium mb-1">
              <v-icon size="18" color="primary" class="mr-1">mdi-account</v-icon>
              {{ item.cliente_nombre }}
            </div>
            <div class="text-caption text-grey d-flex align-center mb-1">
              <v-icon size="14" color="green" class="mr-1">mdi-phone</v-icon>
              {{ item.cliente_telefono }}
            </div>
            <div class="text-caption text-grey d-flex align-center">
              <v-icon size="14" color="orange" class="mr-1">mdi-card-account-details</v-icon>
              {{ item.cliente_nit }}
            </div>
          </div>
        </template>

        <!-- Fechas -->
        <template #item.fechaOrden="{ item }">
          <div class="fecha-info">
            <div class="text-body-2">
              {{ item.fecha ? new Date(item.fecha).toLocaleDateString() : '-' }}
            </div>
            <div class="text-caption text-grey">
              {{ item.fecha ? new Date(item.fecha).toLocaleTimeString() : '' }}
            </div>
          </div>
        </template>

        <template #item.fechaEntrega="{ item }">
          <div v-if="item.fecha_entrega" class="text-body-2">
            {{ new Date(item.fecha_entrega).toLocaleDateString() }}
          </div>
          <span v-else class="text-grey text-caption">Sin fecha</span>
        </template>

        <!-- Total -->
        <template #item.total="{ item }">
          <div class="text-h6 font-weight-bold">
            Q {{ item.total != null ? Number(item.total).toFixed(2) : '0.00' }}
          </div>
        </template>

        <!-- Estado -->
        <template #item.estado="{ item }">
          <v-chip
            :color="estadoColor(item.estado)"
            size="default"
            variant="elevated"
          >
            <v-icon start size="18">{{ estadoIcono(item.estado) }}</v-icon>
            {{ item.estado }}
          </v-chip>
        </template>

        <!-- Estado de Pago -->
        <template #item.estadoPago="{ item }">
          <v-chip
            :color="item.estado_pago === 'pagado' ? 'success' : item.estado_pago === 'parcial' ? 'warning' : 'grey'"
            size="default"
            variant="elevated"
          >
            <v-icon start size="18">{{ estadoPagoIcono(item.estado_pago) }}</v-icon>
            {{ item.estado_pago }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template #item.acciones="{ item }">
          <div class="d-flex gap-1">
            <!-- Ver Detalle -->
            <v-tooltip text="Ver Detalle" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  color="info"
                  variant="tonal"
                  size="large"
                  @click="verDetalle(item)"
                  class="action-icon-btn"
                >
                  <v-icon size="24">mdi-format-list-bulleted</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Abonar -->
            <v-tooltip 
              v-if="item.estado_pago !== 'pagado' && item.estado !== 'cancelado'"
              text="Abonar Pago" 
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  color="warning"
                  variant="tonal"
                  size="large"
                  @click="abrirAbonar(item)"
                  class="action-icon-btn"
                >
                  <v-icon size="24">mdi-cash-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Entregar Orden -->
            <v-tooltip 
              v-if="item.estado === 'finalizado'"
              text="Entregar Orden" 
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  color="success"
                  variant="tonal"
                  size="large"
                  @click="entregarOrden(item)"
                  class="action-icon-btn"
                >
                  <v-icon size="24">mdi-truck-check</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-responsive>

    <!-- Paginación -->
    <v-row class="mt-4" v-if="paginacion.totalPages > 1">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          :model-value="paginacion.page"
          :length="paginacion.totalPages"
          :total-visible="7"
          color="primary"
          @update:model-value="cambiarPaginaLocal"
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
            :efectivo-id="efectivoId"
            :empleado-id="empleadoId"
            @abono-registrado="manejarAbonoRegistrado"
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
import { useBusquedaOrdenes } from '@/components/composables/useBusquedaOrdenes'


export default {
  name: 'ListaOrdenes',
  components: { OrdenDetalle, AbonarOrden },
  setup() {
    const {
      loading,
      error,
      resultados,
      filtros,
      paginacion,
      ultimaBusqueda,
      totalResultados,
      ejecutarBusqueda,
      cargarTodas,
      cambiarPagina,
      cambiarLimite,
      limpiarBusqueda,
      limpiarError
    } = useBusquedaOrdenes()

    return {
      loading,
      error,
      resultados,
      filtros,
      paginacion,
      ultimaBusqueda,
      totalResultados,
      ejecutarBusqueda,
      cargarTodas,
      cambiarPagina,
      cambiarLimite,
      limpiarBusqueda,
      limpiarError
    }
  },
  data() {
    return {
      ordenSeleccionada: null,
      dialogDetalle: false,
      dialogAbonar: false,
      pagosCaja: [],
      tiposDePago: [],
      efectivoId: 1,
      empleadoId: null,

      // Estado para PDF
      generandoPDF: false,
      componenteDetalleReady: false,

      // Items por página local (para sincronizar con el composable)
      itemsPorPaginaLocal: 10,

      // Headers de la tabla
      headers: [
        { title: '#', key: 'id', sortable: true, width: '100px' },
        { title: 'Cliente', key: 'cliente', sortable: true, width: '220px' },
        { title: 'Fecha Orden', key: 'fechaOrden', sortable: true, width: '140px' },
        { title: 'Fecha Entrega', key: 'fechaEntrega', sortable: true, width: '120px' },
        { title: 'Total', key: 'total', sortable: true, width: '120px' },
        { title: 'Estado', key: 'estado', sortable: true, width: '180px' },
        { title: 'Estado Pago', key: 'estadoPago', sortable: true, width: '150px' },
        { title: 'Acciones', key: 'acciones', sortable: false, width: '150px' }
      ],

      // Tipos de búsqueda disponibles
      tiposBusqueda: [
        { title: 'Todas las órdenes', value: 'todos' },
        { title: 'Buscar por ID', value: 'id' },
        { title: 'Buscar por Cliente', value: 'cliente' },
        { title: 'Buscar por Fecha', value: 'fecha' },
        { title: 'Rango de Fechas', value: 'rango' }
      ],

      // Estados disponibles
      estadosDisponibles: [
        'pendiente',
        'en proceso',
        'en produccion',
        'finalizado',
        'entregado',
        'cancelado'
      ],

      // Estados de pago disponibles
      estadosPagoDisponibles: [
        'pendiente',
        'parcial',
        'pagado'
      ],

      // Snackbar para mensajes de estado
      snackbar: {
        mostrar: false,
        mensaje: '',
        color: ''
      }
    }
  },
  watch: {
    itemsPorPaginaLocal(newVal) {
      this.cambiarLimite(newVal)
    },
    'filtros.tipo'(newVal) {
      // Limpiar campos no necesarios al cambiar tipo de búsqueda
      if (newVal !== 'id') this.filtros.id = ''
      if (newVal !== 'cliente') {
        this.filtros.cliente_nombre = ''
        this.filtros.cliente_nit = ''
      }
      if (newVal !== 'fecha') this.filtros.fecha = ''
      if (newVal !== 'rango') {
        this.filtros.fechaInicio = ''
        this.filtros.fechaFin = ''
        this.filtros.estado = null
        this.filtros.estadoPago = null
      }
    },
    dialogDetalle(newVal) {
      if (!newVal) {
        // Reset cuando se cierra el modal
        this.componenteDetalleReady = false
        this.generandoPDF = false
      }
    }
  },
  async mounted() {
    // Cargar órdenes al montar el componente
    await this.cargarTodasOrdenes()
    this.cargarTiposDePago()
    
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      this.empleadoId = currentUser.id
    }
  },
  methods: {
    async cargarTodasOrdenes() {
      try {
        await this.cargarTodas()
      } catch (err) {
        console.error('Error al cargar órdenes:', err)
        this.mostrarSnackbar({
          text: 'Error al cargar órdenes',
          color: 'error'
        })
      }
    },
    async aplicarFiltros() {
      try {
        const resultado = await this.ejecutarBusqueda()
        
        if (!resultado.success) {
          this.mostrarSnackbar({
            text: resultado.error || 'Error al buscar órdenes',
            color: 'error'
          })
        } else if (resultado.total === 0) {
          this.mostrarSnackbar({
            text: 'No se encontraron órdenes con los filtros aplicados',
            color: 'info'
          })
        }
      } catch (err) {
        console.error('Error al aplicar filtros:', err)
        this.mostrarSnackbar({
          text: err.message || 'Error al buscar órdenes',
          color: 'error'
        })
      }
    },
    limpiarFiltros() {
      this.limpiarBusqueda()
      this.cargarTodasOrdenes()
      this.mostrarSnackbar({
        text: 'Filtros limpiados',
        color: 'info'
      })
    },
    async cambiarPaginaLocal(pagina) {
      try {
        await this.cambiarPagina(pagina)
      } catch (err) {
        console.error('Error al cambiar página:', err)
        this.mostrarSnackbar({
          text: 'Error al cargar página',
          color: 'error'
        })
      }
    },
    async cargarTiposDePago() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/tipos_pago/all`)
        const raw = await res.json()
        if (!Array.isArray(raw)) {
          throw new Error('Formato inesperado al cargar tipos de pago')
        }

        // Normalizar ids a número
        this.tiposDePago = raw.map(tp => ({
          ...tp,
          id: Number(tp.id)
        }))

        // Derivar ID de efectivo
        const efectivo = this.tiposDePago.find(tp => String(tp?.nombre || '').toLowerCase().includes('efectivo'))
        if (efectivo?.id != null) {
          const idNum = Number(efectivo.id)
          if (Number.isFinite(idNum)) {
            this.efectivoId = idNum
          }
        }
      } catch (err) {
        console.error('Error al cargar tipos de pago', err)
        this.mostrarSnackbar({
          text: 'Error al cargar tipos de pago ',
          color: 'error'
        })
      }
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
          text: 'Error al cargar pagos de la orden',
          color: 'error'
        })
      }
    },
    abrirAbonar(orden) {
      this.ordenSeleccionada = orden
      this.dialogAbonar = true
    },
    
    // Manejar abono registrado - actualizar orden en la lista
    manejarAbonoRegistrado(data) {
      console.log('Abono registrado:', data)
      
      // Actualizar la orden en la lista de resultados con los datos del servidor
      const index = this.resultados.findIndex(o => o.id === this.ordenSeleccionada.id)
      if (index !== -1 && data.ordenActualizada) {
        // Actualizar con los datos completos del servidor
        this.resultados[index] = {
          ...this.resultados[index],
          abonado: Number(data.ordenActualizada.abonado || 0),
          saldo_pendiente: Number(data.ordenActualizada.saldo_pendiente || 0),
          estado_pago: data.ordenActualizada.estado_pago || data.estadoPago
        }
        
        // Actualizar también la orden seleccionada
        this.ordenSeleccionada = {
          ...this.ordenSeleccionada,
          abonado: Number(data.ordenActualizada.abonado || 0),
          saldo_pendiente: Number(data.ordenActualizada.saldo_pendiente || 0),
          estado_pago: data.ordenActualizada.estado_pago || data.estadoPago
        }
      }
      
      // Mostrar mensaje apropiado
      const mensaje = data.estadoPago === 'pagado' 
        ? `¡Orden #${this.ordenSeleccionada.id} pagada completamente!` 
        : `Abono registrado. Saldo pendiente: Q ${Number(data.saldoPendiente || 0).toFixed(2)}`
      
      this.mostrarSnackbar({
        text: mensaje,
        color: 'success'
      })
    },
    
    cerrarAbono() {
      this.dialogAbonar = false
      this.ordenSeleccionada = null
      // Ya no es necesario recargar todas las órdenes, se actualiza localmente
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
      const colores = {
        'pendiente': 'orange',
        'en proceso': 'blue',
        'en produccion': 'purple',
        'finalizado': 'green',
        'entregado': 'success',
        'cancelado': 'red'
      }
      return colores[(estado || '').toLowerCase()] || 'grey'
    },
    estadoIcono(estado) {
      const iconos = {
        'pendiente': 'mdi-clock-outline',
        'en proceso': 'mdi-cogs',
        'en produccion': 'mdi-factory',
        'finalizado': 'mdi-check-circle-outline',
        'entregado': 'mdi-truck-check',
        'cancelado': 'mdi-cancel'
      }
      return iconos[(estado || '').toLowerCase()] || 'mdi-help-circle-outline'
    },
    estadoPagoIcono(estadoPago) {
      switch ((estadoPago || '').toLowerCase()) {
        case 'pagado': return 'mdi-check-circle'
        case 'parcial': return 'mdi-clock-alert'
        case 'pendiente': return 'mdi-alert-circle'
        default: return 'mdi-help-circle'
      }
    },
    async entregarOrden(orden) {
      if (!confirm(`¿Está seguro de marcar la orden #${orden.id} como ENTREGADA?\n\nCliente: ${orden.cliente_nombre}`)) {
        return
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/ordenes/update/${orden.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estado: 'entregado'
          })
        })

        if (!response.ok) {
          throw new Error('Error al actualizar el estado de la orden')
        }

        this.mostrarSnackbar({
          text: `Orden #${orden.id} marcada como ENTREGADA exitosamente`,
          color: 'success'
        })

        // Recargar órdenes para ver los cambios
        await this.cargarTodasOrdenes()
      } catch (error) {
        console.error('Error al entregar orden:', error)
        this.mostrarSnackbar({
          text: `Error al entregar la orden: ${error.message}`,
          color: 'error'
        })
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
/* Chips de filtro */
.filter-chips .v-chip {
  font-size: 0.9rem;
  height: 36px;
  margin-right: 8px;
}

.filters-card {
  border-radius: 12px;
}

.lista-ordenes {
  padding: 10px;
  max-width: 1400px;
  margin: 0 auto;
}

.cliente-info {
  min-width: 200px;
  line-height: 1.3;
}

.fecha-info {
  min-width: 100px;
}

.gap-2 {
  gap: 8px;
}

/* Mejorar apariencia de la tabla */
:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-data-table-header) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

/* Botones de acción */
:deep(.v-btn--icon) {
  border-radius: 8px;
}

/* Chips */
:deep(.v-chip) {
  font-weight: 500;
}
</style>