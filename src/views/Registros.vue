<template>
  <v-container class="registros-view" fluid>
    <!-- Vista de Bienvenida -->
    <v-fade-transition mode="out-in">
      <RegistrosWelcome
        v-if="vistaActual === 'inicio'"
        @cambiarVista="cambiarVista"
      />
    </v-fade-transition>

    <!-- Vista de Reportes -->
    <v-fade-transition mode="out-in">
      <div v-if="vistaActual !== 'inicio'" :key="vistaActual">
        <v-card class="report-card" elevation="2">
          <!-- Header de la tarjeta con título dinámico -->
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" :color="getIconColor(vistaActual)">
              {{ getIcon(vistaActual) }}
            </v-icon>
            <span>{{ getTitle(vistaActual) }}</span>
            <v-spacer />
            <v-chip
              v-if="periodoLabel"
              size="small"
              variant="tonal"
              color="primary"
              class="mr-2"
              prepend-icon="mdi-calendar-range"
            >
              {{ periodoLabel }}
            </v-chip>
            <v-btn icon="mdi-close" variant="text" @click="cambiarVista('inicio')" />
          </v-card-title>

          <v-card-text>
            <!-- Barra de Filtros (compartida para las 3 vistas) -->
            <RegistrosFilters
              :vista-actual="vistaActual"
              :empleados="empleados"
              :loading="loading"
              :opciones-periodo="opcionesPeriodo"
              v-model:empleado="empleadoSeleccionado"
              v-model:periodo="periodoSeleccionado"
              v-model:fecha-inicio="fechaInicio"
              v-model:fecha-fin="fechaFin"
              @buscar="cargarReporte"
            />

            <!-- KPIs — aparecen en las 3 vistas cuando hay datos -->
            <RegistrosKPIs
              v-if="kpiCards.length > 0"
              :kpi-cards="kpiCards"
            />

            <!-- Tabla: Reporte General y Ventas por Usuario -->
            <RegistrosTable
              v-if="resumen && (vistaActual === 'reporte_general' || vistaActual === 'ventas_usuario')"
              :headers="headers"
              :ordenes="ordenes"
              :loading="loading"
              @ver-detalle="verDetalle"
            />

            <!-- Tabla: Ingresos por Categoría (estandarizada con buscador) -->
            <RegistrosIngresosCategoria
              v-if="vistaActual === 'ingresos_categoria'"
              :items="ingresosPorCategoria"
              :loading="loading"
            />
          </v-card-text>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Modal de Detalle de Orden -->
    <RegistrosDetailModal
      v-model="dialogDetalle"
      :orden="ordenSeleccionada"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Servicios
import ApiService       from '@/services/api.service';
import EmpleadoService  from '@/services/empleado.service';
import EstadisticasService from '@/services/estadisticas.service';

// Composables
import { useRegistrosFiltros } from '@/components/composables/useRegistrosFiltros';

// Componentes del módulo
import RegistrosWelcome          from '@/components/registros/RegistrosWelcome.vue';
import RegistrosFilters          from '@/components/registros/RegistrosFilters.vue';
import RegistrosKPIs             from '@/components/registros/RegistrosKPIs.vue';
import RegistrosTable            from '@/components/registros/RegistrosTable.vue';
import RegistrosDetailModal      from '@/components/registros/RegistrosDetailModal.vue';
import RegistrosIngresosCategoria from '@/components/registros/RegistrosIngresosCategoria.vue';

// ─── Composables en raíz del setup ───────────────────────────────────────────

// Lógica de periodo y fechas extraída del orquestador
const {
  opcionesPeriodo,
  periodoSeleccionado,
  fechaInicio,
  fechaFin,
  periodoLabel,
  establecerFechasPorPeriodo,
} = useRegistrosFiltros();

// ─── Estado Centralizado ──────────────────────────────────────────────────────

const vistaActual = ref('inicio');
const loading     = ref(false);

// Filtros
const empleados            = ref([]);
const empleadoSeleccionado = ref(null);

// Datos de reporte
const ordenes              = ref([]);
const resumen              = ref(null);
const ingresosPorCategoria = ref([]);

// UI
const dialogDetalle    = ref(false);
const ordenSeleccionada = ref(null);

// ─── Headers de tabla ─────────────────────────────────────────────────────────

const headers = [
  { title: 'Fecha',       key: 'fecha'          },
  { title: 'Folio',       key: 'id'             },
  { title: 'Cliente',     key: 'cliente_nombre'  },
  { title: 'Empleado',    key: 'empleado_nombre' },
  { title: 'Estado Pago', key: 'estado_pago'     },
  { title: 'Total',       key: 'total',      align: 'end'    },
  { title: 'Acciones',    key: 'acciones',   align: 'center', sortable: false },
];

// ─── KPIs unificados para las 3 vistas ───────────────────────────────────────

const kpiCards = computed(() => {
  // Vista: Ingresos por Categoría
  if (vistaActual.value === 'ingresos_categoria') {
    if (!ingresosPorCategoria.value.length) return [];

    // La nueva estructura es: [{ categoria_nombre, total_categoria, ingresos_categoria, productos: [] }]
    const totalIngresos = ingresosPorCategoria.value.reduce(
      (sum, cat) => sum + parseFloat(cat.ingresos_categoria || 0), 0
    );
    const totalUnidades = ingresosPorCategoria.value.reduce(
      (sum, cat) => sum + parseInt(cat.total_categoria || 0), 0
    );
    const totalProductosDistintos = ingresosPorCategoria.value.reduce(
      (sum, cat) => sum + (cat.productos?.length || 0), 0
    );
    return [
      {
        title: 'Categorías con Ventas',
        value: ingresosPorCategoria.value.length,
        subtitle: 'Con ítems vendidos',
        variant: 'info',
        icon: 'mdi-shape',
        formatAsCurrency: false,
      },
      {
        title: 'Total Ingresos',
        value: totalIngresos,
        subtitle: 'Suma de subtotales',
        variant: 'success',
        icon: 'mdi-cash-multiple',
        formatAsCurrency: true,
        currencySymbol: 'Q',
      },
      {
        title: 'Unidades Vendidas',
        value: totalUnidades,
        subtitle: 'Ítems despachados',
        variant: 'primary',
        icon: 'mdi-package-variant-closed',
        formatAsCurrency: false,
      },
      {
        title: 'Productos Distintos',
        value: totalProductosDistintos,
        subtitle: 'Referencias vendidas',
        variant: 'warning',
        icon: 'mdi-tag-multiple',
        formatAsCurrency: false,
      },
    ];
  }

  // Vistas: Reporte General y Ventas por Usuario
  if (!resumen.value) return [];
  return [
    {
      title: 'Total Vendido',
      value: resumen.value.ventasTotales || 0,
      subtitle: 'Ingresos del periodo',
      variant: 'primary',
      icon: 'mdi-cash-multiple',
      formatAsCurrency: true,
      currencySymbol: 'Q',
    },
    {
      title: 'Órdenes Procesadas',
      value: resumen.value.totalOrdenes || 0,
      subtitle: 'Documentos incluidos',
      variant: 'info',
      icon: 'mdi-receipt-text-outline',
      formatAsCurrency: false,
    },
    {
      title: 'Ticket Promedio',
      value: resumen.value.ticketPromedio || 0,
      subtitle: 'Promedio por orden',
      variant: 'success',
      icon: 'mdi-chart-line',
      formatAsCurrency: true,
      currencySymbol: 'Q',
    },
    {
      title: 'Total Abonado',
      value: resumen.value.totalAbonado || 0,
      subtitle: 'Pagos aplicados',
      variant: 'warning',
      icon: 'mdi-wallet-outline',
      formatAsCurrency: true,
      currencySymbol: 'Q',
    },
  ];
});

// ─── Ciclo de Vida ────────────────────────────────────────────────────────────

onMounted(async () => {
  await cargarEmpleados();
  establecerFechasPorPeriodo();
});

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(periodoSeleccionado, (newVal) => {
  if (newVal !== 'custom') {
    establecerFechasPorPeriodo();
    if (vistaActual.value !== 'inicio') cargarReporte();
  }
});

watch(empleadoSeleccionado, () => {
  if (vistaActual.value === 'ventas_usuario') {
    cargarReporte();
  }
});

// ─── Métodos ──────────────────────────────────────────────────────────────────

function cambiarVista(vista) {
  vistaActual.value = vista;

  // Limpiar filtro de empleado al cambiar a vistas que no lo usan
  if (vista === 'reporte_general' || vista === 'ingresos_categoria') {
    empleadoSeleccionado.value = null;
  }

  if (vista !== 'inicio') {
    establecerFechasPorPeriodo();
    cargarReporte();
  }
}

const cargarEmpleados = async () => {
  try {
    const data     = await EmpleadoService.getAll();
    empleados.value = Array.isArray(data) ? data : (data?.empleados || []);
  } catch (error) {
    console.error('Error al cargar empleados:', error);
  }
};

const cargarReporte = async () => {
  if (vistaActual.value === 'ingresos_categoria') {
    await cargarReporteIngresosCategoria();
  } else {
    await cargarReporteGeneral();
  }
};

const cargarReporteGeneral = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  loading.value = true;
  try {
    const params = {
      fechaInicio: fechaInicio.value,
      fechaFin:    fechaFin.value,
      empleadoId:  empleadoSeleccionado.value || undefined,
      page:        1,
      limit:       1000,
    };

    const data = await ApiService.getOrdenesByDateRange(params);

    // Normalizar respuesta: puede venir como { ordenes: [] } o { rows: [] }
    const filas = Array.isArray(data.ordenes)
      ? data.ordenes
      : (Array.isArray(data.rows) ? data.rows : []);

    ordenes.value = filas.map(ord => ({
      ...ord,
      empleado_nombre:
        ord?.empleado?.nombre
          ? ord.empleado.nombre
          : (ord.empleado_nombre || 'No asignado'),
    }));

    // Normalizar respuesta de estadísticas (fix: ambos lados eran idénticos)
    resumen.value = data.estadisticas || data.resumen || null;

  } catch (error) {
    console.error('Error al cargar reporte general:', error);
    ordenes.value = [];
    resumen.value = null;
  } finally {
    loading.value = false;
  }
};

const cargarReporteIngresosCategoria = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  loading.value = true;
  try {
    // Llama a productos-por-categoria: devuelve cómo se distribuyeron
    // las ventas de ítems (DetalleOrden) por categoría en el período.
    const data = await EstadisticasService.getProductosPorCategoria(
      fechaInicio.value,
      fechaFin.value
    );
    ingresosPorCategoria.value = data.categorias || [];
  } catch (error) {
    console.error('Error al cargar reporte de ingresos por categoría:', error);
    ingresosPorCategoria.value = [];
  } finally {
    loading.value = false;
  }
};

const verDetalle = (item) => {
  ordenSeleccionada.value = item;
  dialogDetalle.value     = true;
};

// ─── Helpers de vista ────────────────────────────────────────────────────────

const getTitle = (vista) => ({
  ventas_usuario:    'Reporte de Ventas por Empleado',
  reporte_general:   'Reporte General',
  ingresos_categoria:'Reporte de Ingresos por Categoría',
}[vista] || 'Reporte');

const getIcon = (vista) => ({
  ventas_usuario:    'mdi-account-cash',
  reporte_general:   'mdi-chart-line',
  ingresos_categoria:'mdi-shape',
}[vista] || 'mdi-chart-bar');

const getIconColor = (vista) => ({
  ventas_usuario:    'primary',
  reporte_general:   'success',
  ingresos_categoria:'purple',
}[vista] || 'grey');
</script>

<style scoped>
.registros-view {
  padding: 24px;
  background: var(--pos-gradient-background); /* usa variable del design-system global */
  min-height: 100vh;
}

.report-card {
  border-radius: var(--border-radius-lg);
}
</style>
