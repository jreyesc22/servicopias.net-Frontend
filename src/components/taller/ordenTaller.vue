<template>
  <v-container fluid class="tablet-container">
    <!-- Header mejorado -->
    <v-card class="mb-4 header-card" elevation="2">
      <v-card-title class="header-title">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="title-section">
            <h2 class="text-h5 font-weight-bold mb-1">
              <v-icon class="mr-2" color="primary">mdi-wrench</v-icon>
              Gestion de Producción
            </h2>
            <p class="text-subtitle-2 text-medium-emphasis mb-0">
              Órdenes en Proceso de Preparación
            </p>
          </div>
          
          <div class="d-flex align-center gap-3">
            <!-- Estadísticas -->
            <div class="stats-section d-flex gap-2">
              <v-chip 
                :color="getEstadoColor('pendiente')" 
                variant="elevated"
                size="large"
                class="stat-chip"
              >
                <v-icon start>mdi-clock-outline</v-icon>
                {{ ordenesPendientes }} Pendientes
              </v-chip>
              
              <v-chip 
                :color="getEstadoColor('en proceso')" 
                variant="elevated"
                size="large"
                class="stat-chip"
              >
                <v-icon start>mdi-cogs</v-icon>
                {{ ordenesEnProceso }} En Proceso
              </v-chip>
              
              <v-chip 
                :color="getEstadoColor('en produccion')" 
                variant="elevated"
                size="large"
                class="stat-chip"
              >
                <v-icon start>mdi-factory</v-icon>
                {{ ordenesEnProduccion }} En Producción
              </v-chip>
            </div>
            
            <!-- Botón actualizar -->
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              @click="obtenerOrdenes"
              :loading="cargando"
              class="refresh-btn"
            >
              <v-icon start>mdi-refresh</v-icon>
              Actualizar
            </v-btn>
          </div>
        </div>
      </v-card-title>
    </v-card>

    <!-- Filtros rápidos -->
    <v-card class="mb-4 filters-card" elevation="1">
      <v-card-text class="py-3">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div class="d-flex align-center gap-3">
            <v-chip-group v-model="filtroEstado" mandatory class="filter-chips">
              <v-chip 
                value="todos" 
                variant="outlined" 
                size="large"
                filter
              >
                <v-icon start>mdi-view-grid</v-icon>
                Todos ({{ ordenesFiltradas.length }})
              </v-chip>
              <v-chip 
                v-for="estado in estadosDisponibles.slice(0, 3)" 
                :key="estado.value"
                :value="estado.value"
                :color="getEstadoColor(estado.value)"
                variant="outlined"
                size="large"
                filter
              >
                <v-icon start>{{ getEstadoIcono(estado.value) }}</v-icon>
                {{ estado.title }}
              </v-chip>
            </v-chip-group>
          </div>
          
          <!-- Búsqueda -->
          <v-text-field
            v-model="busqueda"
            placeholder="Buscar por cliente..."
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-field"
            style="max-width: 300px;"
          >
            <template #prepend-inner>
              <v-icon>mdi-magnify</v-icon>
            </template>
          </v-text-field>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabla optimizada -->
    <v-card elevation="3" class="table-card">
      <v-data-table
        :headers="headersTablet"
        :items="ordenesFiltradas"
        :items-per-page="itemsPorPagina"
        :loading="cargando"
        :search="busqueda"
        class="tablet-table"
        loading-text="Cargando órdenes..."
        no-data-text="No hay órdenes disponibles"
        hover
      >
        <!-- ID con badge -->
        <template #item.id="{ item }">
          <v-badge
            :content="item.id"
            color="primary"
            inline
          >
            <v-avatar size="40" color="grey-lighten-3" class="text-h6">
              <v-icon>mdi-package-variant</v-icon>
            </v-avatar>
          </v-badge>
        </template>

        <!-- Cliente con información adicional -->
        <template #item.cliente="{ item }">
          <div class="cliente-info">
            <div class="text-h6 font-weight-medium">{{ item.cliente_nombre }}</div>
            <div class="text-body-2 text-medium-emphasis d-flex align-center">
              <v-icon size="16" class="mr-1">mdi-phone</v-icon>
              {{ item.cliente_telefono }}
            </div>
          </div>
        </template>

        <!-- Fecha -->
        <template #item.fecha="{ item }">
          <div class="fecha-info">
            <div class="text-body-1 font-weight-medium">
              {{ formatearFecha(item.fecha) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ calcularDiasTranscurridos(item.fecha) }}
            </div>
          </div>
        </template>

        <!-- Estado con selector -->
        <template #item.estado="{ item }">
          <v-select
            v-model="item.estado"
            :items="estadosDisponibles"
            variant="outlined"
            density="comfortable"
            hide-details
            class="estado-select-tablet"
            @update:modelValue="onEstadoChange(item)"
          >
            <template #selection="{ item: estadoItem }">
              <v-chip
                :color="getEstadoColor(estadoItem.value)"
                size="large"
                variant="elevated"
                class="estado-chip"
              >
                <v-icon start size="20">{{ getEstadoIcono(estadoItem.value) }}</v-icon>
                {{ estadoItem.title }}
              </v-chip>
            </template>
          </v-select>
        </template>

        <!-- Acciones optimizadas en fila horizontal -->
        <template #item.acciones="{ item }">
          <div class="acciones-horizontal">
            <!-- Ver Items -->
            <v-tooltip text="Ver Items" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  color="info"
                  variant="tonal"
                  size="large"
                  @click="verItems(item)"
                  class="action-icon-btn"
                >
                  <v-icon size="24">mdi-format-list-bulleted</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Guardar (si hay cambios) -->
            <v-tooltip v-if="item.estadoCambiado" text="Guardar Cambios" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  color="success"
                  variant="elevated"
                  size="large"
                  :loading="item.loading"
                  @click="guardarEstado(item)"
                  class="action-icon-btn save-btn"
                >
                  <v-icon size="24">mdi-content-save</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Acción rápida según estado -->
            <v-tooltip 
              v-if="getAccionRapida(item.estado)" 
              :text="getAccionRapida(item.estado).tooltip" 
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  :color="getAccionRapida(item.estado).color"
                  variant="tonal"
                  size="large"
                  @click="cambiarEstadoRapido(item, getAccionRapida(item.estado).nuevoEstado)"
                  class="action-icon-btn"
                >
                  <v-icon size="24">{{ getAccionRapida(item.estado).icon }}</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal para ver items -->
    <OrdenItemsModal
      v-model:dialog="dialogItems"
      :orden="ordenSeleccionada"
      @pdf-descargado="onPDFDescargado"
    />

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      timeout="4000" 
      location="bottom center"
      variant="elevated"
      class="tablet-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn 
          color="white" 
          variant="text" 
          size="large"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios'
import OrdenItemsModal from './OrdenItemsmodal.vue'

export default {
  name: 'OrdenTaller',
  components: {
    OrdenItemsModal
  },
  data() {
    return {
      ordenes: [],
      cargando: false,
      itemsPorPagina: 20,
      busqueda: '',
      filtroEstado: 'todos',
      
      // Modal
      dialogItems: false,
      ordenSeleccionada: null,
      
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      },
      
      // Headers optimizados
      headersTablet: [
        { title: 'ID', key: 'id', width: '100px', sortable: true },
        { title: 'Cliente', key: 'cliente', width: '280px', sortable: true },
        { title: 'Fecha', key: 'fecha', width: '180px', sortable: true },
        { title: 'Estado', key: 'estado', width: '200px', sortable: true },
        { title: 'Acciones', key: 'acciones', sortable: false, width: '180px', align: 'center' }
      ],
      
      estadosDisponibles: [
        { title: 'Pendiente', value: 'pendiente' },
        { title: 'En Proceso', value: 'en proceso' },
        { title: 'En Producción', value: 'en produccion' },
        { title: 'Finalizado', value: 'finalizado' },
        { title: 'Entregado', value: 'entregado' },
        { title: 'Cancelado', value: 'cancelado' }
      ]
    }
  },
  
  computed: {
    ordenesPendientes() {
      return this.ordenes.filter(o => o.estado === 'pendiente').length
    },
    
    ordenesEnProceso() {
      return this.ordenes.filter(o => o.estado === 'en proceso').length
    },
    
    ordenesEnProduccion() {
      return this.ordenes.filter(o => o.estado === 'en produccion').length
    },
    
    ordenesFiltradas() {
      let filtradas = this.ordenes
      
      if (this.filtroEstado && this.filtroEstado !== 'todos') {
        filtradas = filtradas.filter(o => o.estado === this.filtroEstado)
      }
      
      return filtradas
    }
  },
  
  mounted() {
    this.obtenerOrdenes()
  },
  
  methods: {
    async obtenerOrdenes() {
      this.cargando = true
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_URL}/ordenes/all`)
        this.ordenes = res.data
          .filter(o =>
            ['pendiente', 'en proceso', 'en produccion'].includes(o.estado)
          )
          .map(o => ({
            ...o,
            estadoOriginal: o.estado,
            estadoCambiado: false,
            loading: false
          }))
      } catch (error) {
        this.mostrarNotificacion('Error al cargar órdenes', 'error')
      } finally {
        this.cargando = false
      }
    },

    async verItems(orden) {
      try {
        if (!orden.items || orden.items.length === 0) {
          this.cargando = true
          const res = await axios.get(`${process.env.VUE_APP_API_URL}/ordenes/${orden.id}`)
          orden.items = res.data.items || []
        }
        
        this.ordenSeleccionada = orden
        this.dialogItems = true
        
      } catch (error) {
        console.error('Error al cargar items:', error)
        this.mostrarNotificacion('Error al cargar los items de la orden', 'error')
      } finally {
        this.cargando = false
      }
    },

    onPDFDescargado(resultado) {
      if (resultado.success) {
        this.mostrarNotificacion(`PDF descargado: ${resultado.filename}`, 'success')
      } else {
        this.mostrarNotificacion(`Error al descargar PDF: ${resultado.error}`, 'error')
      }
    },

    onEstadoChange(orden) {
      orden.estadoCambiado = orden.estado !== orden.estadoOriginal
    },

    async guardarEstado(orden) {
      try {
        orden.loading = true
        await axios.put(`${process.env.VUE_APP_API_URL}/ordenes/update/${orden.id}`, {
          estado: orden.estado,
          id_usuario: 1
        })

        orden.estadoOriginal = orden.estado
        orden.estadoCambiado = false
        orden.loading = false

        this.mostrarNotificacion('Estado actualizado correctamente')

        if (!['pendiente', 'en proceso', 'en produccion'].includes(orden.estado)) {
          this.ordenes = this.ordenes.filter(o => o.id !== orden.id)
        }
      } catch (e) {
        orden.loading = false
        this.mostrarNotificacion('Error al guardar estado', 'error')
      }
    },

    async cambiarEstadoRapido(orden, nuevoEstado) {
      orden.loading = true
      try {
        await axios.put(`${process.env.VUE_APP_API_URL}/ordenes/update/${orden.id}`, {
          estado: nuevoEstado,
          id_usuario: 1
        })

        this.mostrarNotificacion(`Estado cambiado a ${nuevoEstado}`)

        const activos = ['pendiente', 'en proceso', 'en produccion']
        if (!activos.includes(nuevoEstado)) {
          this.ordenes = this.ordenes.filter(o => o.id !== orden.id)
        } else {
          orden.estado = nuevoEstado
          orden.estadoOriginal = nuevoEstado
          orden.estadoCambiado = false
          orden.loading = false
        }
      } catch (error) {
        orden.loading = false
        this.mostrarNotificacion('Error al cambiar estado', 'error')
      }
    },

    // Método optimizado para obtener la acción rápida según el estado
    getAccionRapida(estado) {
      const acciones = {
        'pendiente': {
          nuevoEstado: 'en proceso',
          icon: 'mdi-cogs',
          color: 'blue',
          tooltip: 'Procesar'
        },
        'en proceso': {
          nuevoEstado: 'en produccion',
          icon: 'mdi-factory',
          color: 'purple',
          tooltip: 'Enviar a Producción'
        },
        'en produccion': {
          nuevoEstado: 'finalizado',
          icon: 'mdi-check-circle-outline',
          color: 'green',
          tooltip: 'Finalizar'
        }
      }
      return acciones[estado] || null
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    calcularDiasTranscurridos(fecha) {
      const dias = Math.floor((new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24))
      if (dias === 0) return 'Hoy'
      if (dias === 1) return 'Ayer'
      return `Hace ${dias} días`
    },

    getEstadoColor(estado) {
      const colores = {
        'pendiente': 'orange',
        'en proceso': 'blue',
        'en produccion': 'purple',
        'finalizado': 'green',
        'entregado': 'success',
        'cancelado': 'red'
      }
      return colores[estado] || 'grey'
    },

    getEstadoIcono(estado) {
      const iconos = {
        'pendiente': 'mdi-clock-outline',
        'en proceso': 'mdi-cogs',
        'en produccion': 'mdi-factory',
        'finalizado': 'mdi-check-circle-outline',
        'entregado': 'mdi-truck-check',
        'cancelado': 'mdi-cancel'
      }
      return iconos[estado] || 'mdi-help-circle-outline'
    },

    mostrarNotificacion(mensaje, color = 'success') {
      this.snackbar.message = mensaje
      this.snackbar.color = color
      this.snackbar.show = true
    }
  }
}
</script>

<style scoped>
/* Estilos base */
.tablet-container {
  max-width: 100%;
  padding: 16px;
}

.header-card {
  background: linear-gradient(135deg, #6fb4f8 0%, #d7e5f5 100%);
  color: white;
}

.header-card .v-card-title {
  padding: 24px;
}

.title-section h2 {
  color: white;
}

.title-section p {
  color: rgba(255, 255, 255, 0.8);
}

.stats-section .stat-chip {
  font-weight: 600;
  font-size: 0.9rem;
  height: 40px;
}

.refresh-btn {
  min-width: 140px;
  height: 44px;
}

.filters-card {
  border-radius: 12px;
}

.filter-chips .v-chip {
  font-size: 0.9rem;
  height: 36px;
  margin-right: 8px;
}

.search-field {
  border-radius: 8px;
}

.table-card {
  border-radius: 12px;
  overflow: hidden;
}

.tablet-table {
  font-size: 1rem;
}

.tablet-table .v-data-table__td {
  padding: 16px 12px;
  vertical-align: middle;
}

.cliente-info {
  line-height: 1.4;
}

.fecha-info {
  line-height: 1.4;
}

.estado-select-tablet {
  min-width: 160px;
}

.estado-chip {
  font-weight: 600;
  text-transform: capitalize;
}

/* Estilos para acciones horizontales */
.acciones-horizontal {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.action-icon-btn {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.save-btn {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.tablet-snackbar {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-section {
    flex-wrap: wrap;
  }
  
  .stat-chip {
    margin-bottom: 4px;
  }
  
  .header-title {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .tablet-container {
    padding: 12px;
  }
  
  .acciones-horizontal {
    gap: 8px;
  }
  
  .action-icon-btn {
    width: 44px !important;
    height: 44px !important;
  }
}

/* Mejorar hover effects */
.v-data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.v-btn:hover {
  transition: all 0.2s ease;
}

/* Touch optimizations */
.v-chip, .v-btn, .v-select {
  touch-action: manipulation;
}

.v-btn {
  min-height: 36px;
}
</style>