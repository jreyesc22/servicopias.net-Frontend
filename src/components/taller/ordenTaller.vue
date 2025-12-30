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

              <v-divider vertical class="mx-2" />

              <!-- Estadísticas de Origen -->
              <v-chip 
                :color="getOrigenColor('local')" 
                variant="elevated"
                size="large"
                class="stat-chip"
              >
                <v-icon start>mdi-store</v-icon>
                {{ ordenesLocales }} Local
              </v-chip>

              <v-chip 
                :color="getOrigenColor('web')" 
                variant="elevated"
                size="large"
                class="stat-chip"
              >
                <v-icon start>mdi-web</v-icon>
                {{ ordenesWeb }} Web
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
          <div class="d-flex align-center gap-2 flex-wrap">
            <!-- Filtro por Estado -->
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

            <!-- Filtro por Origen -->
            <v-chip-group v-model="filtroOrigen" mandatory class="filter-chips">
              <v-chip 
                v-for="origen in origenesDisponibles" 
                :key="origen.value"
                :value="origen.value"
                :color="getOrigenColor(origen.value)"
                variant="outlined"
                size="large"
                filter
              >
                <v-icon start>{{ getOrigenIcono(origen.value) }}</v-icon>
                {{ origen.title }}
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

        <!-- Origen -->
        <template #item.origen="{ item }">
          <v-chip
            :color="getOrigenColor(item.origen)"
            size="large"
            variant="tonal"
            class="origen-chip"
          >
            <v-icon start size="20">{{ getOrigenIcono(item.origen) }}</v-icon>
            {{ item.origen === 'local' ? 'Local' : 'Web' }}
          </v-chip>
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
import { ref } from 'vue';
import OrdenItemsModal from './OrdenItemsmodal.vue';
import { useTallerOrdenes } from '@/components/composables/useTallerOrdenes';

export default {
  name: 'OrdenTaller',
  components: {
    OrdenItemsModal
  },
  
  setup() {
    // Usar el composable
    const {
      // Estado
      ordenes,
      cargando,
      busqueda,
      filtroEstado,
      filtroOrigen,

      // Configuración
      estadosDisponibles,
      origenesDisponibles,

      // Computed
      ordenesPendientes,
      ordenesEnProceso,
      ordenesEnProduccion,
      ordenesLocales,
      ordenesWeb,
      ordenesFiltradas,

      // Métodos
      obtenerOrdenes,
      obtenerOrdenCompleta,
      marcarEstadoCambiado,
      guardarEstado,
      cambiarEstadoRapido,

      // Helpers
      getEstadoColor,
      getEstadoIcono,
      getOrigenColor,
      getOrigenIcono,
      getAccionRapida,
      formatearFecha,
      calcularDiasTranscurridos
    } = useTallerOrdenes();

    // Estado local del componente
    const itemsPorPagina = ref(20);
    const dialogItems = ref(false);
    const ordenSeleccionada = ref(null);
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    });

    // Headers de la tabla
    const headersTablet = [
      { title: 'ID', key: 'id', width: '100px', sortable: true },
      { title: 'Cliente', key: 'cliente', width: '240px', sortable: true },
      { title: 'Origen', key: 'origen', width: '140px', sortable: true },
      { title: 'Fecha', key: 'fecha', width: '180px', sortable: true },
      { title: 'Estado', key: 'estado', width: '200px', sortable: true },
      { title: 'Acciones', key: 'acciones', sortable: false, width: '180px', align: 'center' }
    ];

    // Métodos locales
    const mostrarNotificacion = (mensaje, color = 'success') => {
      snackbar.value.message = mensaje;
      snackbar.value.color = color;
      snackbar.value.show = true;
    };

    const verItems = async (orden) => {
      try {
        if (!orden.items || orden.items.length === 0) {
          cargando.value = true;
          const ordenCompleta = await obtenerOrdenCompleta(orden.id);
          orden.items = ordenCompleta.items || [];
        }
        
        ordenSeleccionada.value = orden;
        dialogItems.value = true;
        
      } catch (error) {
        console.error('Error al cargar items:', error);
        mostrarNotificacion('Error al cargar los items de la orden', 'error');
      } finally {
        cargando.value = false;
      }
    };

    const onPDFDescargado = (resultado) => {
      if (resultado.success) {
        mostrarNotificacion(`PDF descargado: ${resultado.filename}`, 'success');
      } else {
        mostrarNotificacion(`Error al descargar PDF: ${resultado.error}`, 'error');
      }
    };

    const onEstadoChange = (orden) => {
      marcarEstadoCambiado(orden);
    };

    const handleGuardarEstado = async (orden) => {
      try {
        await guardarEstado(orden);
        mostrarNotificacion('Estado actualizado correctamente');
      } catch (error) {
        mostrarNotificacion(error.message || 'Error al guardar estado', 'error');
      }
    };

    const handleCambiarEstadoRapido = async (orden, nuevoEstado) => {
      try {
        await cambiarEstadoRapido(orden, nuevoEstado);
        mostrarNotificacion(`Estado cambiado a ${nuevoEstado}`);
      } catch (error) {
        mostrarNotificacion(error.message || 'Error al cambiar estado', 'error');
      }
    };

    // Cargar órdenes al montar
    obtenerOrdenes().catch(error => {
      mostrarNotificacion('Error al cargar órdenes', 'error');
    });

    return {
      // Estado del composable
      ordenes,
      cargando,
      busqueda,
      filtroEstado,
      filtroOrigen,

      // Configuración
      estadosDisponibles,
      origenesDisponibles,

      // Computed
      ordenesPendientes,
      ordenesEnProceso,
      ordenesEnProduccion,
      ordenesLocales,
      ordenesWeb,
      ordenesFiltradas,

      // Estado local
      itemsPorPagina,
      dialogItems,
      ordenSeleccionada,
      snackbar,
      headersTablet,

      // Métodos del composable
      obtenerOrdenes,
      getEstadoColor,
      getEstadoIcono,
      getOrigenColor,
      getOrigenIcono,
      getAccionRapida,
      formatearFecha,
      calcularDiasTranscurridos,

      // Métodos locales
      verItems,
      onPDFDescargado,
      onEstadoChange,
      guardarEstado: handleGuardarEstado,
      cambiarEstadoRapido: handleCambiarEstadoRapido,
      mostrarNotificacion
    };
  }
};
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

.origen-chip {
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