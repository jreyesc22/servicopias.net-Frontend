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
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" :color="getIconColor(vistaActual)">
              {{ getIcon(vistaActual) }}
            </v-icon>
            <span>{{ getTitle(vistaActual) }}</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="cambiarVista('inicio')" />
          </v-card-title>
          
          <v-card-text>
            <!-- Barra de Filtros -->
            <RegistrosFilters
              :vista-actual="vistaActual"
              :empleados="empleados"
              :categorias="categorias"
              :loading="loading"
              :opciones-periodo="opcionesPeriodo"
              v-model:empleado="empleadoSeleccionado"
              v-model:periodo="periodoSeleccionado"
              v-model:fecha-inicio="fechaInicio"
              v-model:fecha-fin="fechaFin"
              v-model:categoriasSeleccionadas="categoriasSeleccionadas"
              @buscar="cargarReporte"
            />

            <!-- KPIs -->
            <RegistrosKPIs v-if="resumen && (vistaActual === 'reporte_general' || vistaActual === 'ventas_usuario')" :kpi-cards="kpiCards" />

            <!-- Tabla de Detalles -->
            <RegistrosTable
              v-if="resumen && (vistaActual === 'reporte_general' || vistaActual === 'ventas_usuario')"
              :headers="headers"
              :ordenes="ordenes"
              :loading="loading"
              @ver-detalle="verDetalle"
            />

            <!-- Tabla de Ingresos por Categoría -->
            <RegistrosIngresosCategoria
              v-if="vistaActual === 'ingresos_categoria'"
              :items="ingresosPorCategoria"
            />
          </v-card-text>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Modal Detalle -->
    <RegistrosDetailModal
      v-model="dialogDetalle"
      :orden="ordenSeleccionada"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import OrdenesService from '@/services/ordenes.service';
import ApiService from '@/services/api.service';
import EmpleadoService from '@/services/empleado.service';
import EstadisticasService from '@/services/estadisticas.service';
import { useCategorias } from '@/components/composables/useCategorias';

// Importar nuevos componentes
import RegistrosWelcome from '@/components/registros/RegistrosWelcome.vue';
import RegistrosFilters from '@/components/registros/RegistrosFilters.vue';
import RegistrosKPIs from '@/components/registros/RegistrosKPIs.vue';
import RegistrosTable from '@/components/registros/RegistrosTable.vue';
import RegistrosDetailModal from '@/components/registros/RegistrosDetailModal.vue';
import RegistrosIngresosCategoria from '@/components/registros/RegistrosIngresosCategoria.vue';

// --- Estado Centralizado ---
const vistaActual = ref('inicio');
const loading = ref(false);

// Estado para Filtros
const empleados = ref([]);
const empleadoSeleccionado = ref(null);
// categorias vendrá del composable (cache compartida)
const categorias = ref([]);
const categoriasSeleccionadas = ref([]);
const opcionesPeriodo = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mes', value: 'mes' },
  { label: 'Personalizado', value: 'custom' },
];
const periodoSeleccionado = ref('hoy');
const fechaInicio = ref('');
const fechaFin = ref('');

// Estado para Datos
const ordenes = ref([]);
const resumen = ref(null);
const ingresosPorCategoria = ref([]);

// Estado para UI
const dialogDetalle = ref(false);
const ordenSeleccionada = ref(null);

// --- Headers para la Tabla ---
const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Folio', key: 'id' },
  { title: 'Cliente', key: 'cliente_nombre' },
  { title: 'Empleado', key: 'empleado_nombre' },
  { title: 'Estado Pago', key: 'estado_pago' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Acciones', key: 'acciones', align: 'center', sortable: false },
];

// --- Propiedades Computadas ---
const kpiCards = computed(() => {
  if (!resumen.value) return [];
  return [
    {
      title: 'Total Vendido',
      value: resumen.value.ventasTotales || 0,
      subtitle: 'Ingresos del periodo',
      variant: 'primary',
      icon: 'mdi-cash-multiple',
      formatAsCurrency: true,
      currencySymbol: 'Q'
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
      currencySymbol: 'Q'
    },
    {
      title: 'Total Abonado',
      value: resumen.value.totalAbonado || 0,
      subtitle: 'Pagos aplicados',
      variant: 'warning',
      icon: 'mdi-wallet-outline',
      formatAsCurrency: true,
      currencySymbol: 'Q'
    }
  ];
});

// --- Ciclo de Vida y Watchers ---
onMounted(async () => {
  await cargarEmpleados();
  await cargarCategorias();
  establecerFechasPorPeriodo();
});

watch(periodoSeleccionado, (newVal) => {
  if (newVal !== 'custom') {
    establecerFechasPorPeriodo();
    cargarReporte();
  }
});

watch(empleadoSeleccionado, () => {
  if (vistaActual.value === 'ventas_usuario') {
    cargarReporte();
  }
});

// --- Métodos ---
function cambiarVista(vista) {
  vistaActual.value = vista;
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
    const data = await EmpleadoService.getAll();
    empleados.value = Array.isArray(data) ? data : (data?.empleados || []);
  } catch (error) {
    console.error('Error al cargar empleados', error);
  }
};

const cargarCategorias = async () => {
  try {
    const { fetchCategorias } = useCategorias();
    const data = await fetchCategorias();
    categorias.value = Array.isArray(data) ? data : (data?.categorias || []);
  } catch (error) {
    console.error('Error al cargar categorias', error);
  }
};

const establecerFechasPorPeriodo = () => {
  const hoy = new Date();
  const formatIso = (d) => d.toISOString().split('T')[0];

  if (periodoSeleccionado.value === 'hoy') {
    fechaInicio.value = formatIso(hoy);
    fechaFin.value = formatIso(hoy);
  } else if (periodoSeleccionado.value === 'semana') {
    const inicioSemana = new Date(hoy);
    const dayOfWeek = hoy.getDay();
    const diff = hoy.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lunes
    inicioSemana.setDate(diff);
    fechaInicio.value = formatIso(inicioSemana);
    fechaFin.value = formatIso(hoy);
  } else if (periodoSeleccionado.value === 'mes') {
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    fechaInicio.value = formatIso(inicioMes);
    fechaFin.value = formatIso(hoy);
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
      fechaFin: fechaFin.value,
      empleadoId: empleadoSeleccionado.value || undefined,
      page: 1,
      limit: 1000
    };

    // Usar ApiService centralizado para endpoints de estadísticas
    const data = await ApiService.getOrdenesByDateRange(params);

    // Manejar formas distintas de respuesta: { ordenes: [] } o { rows: [] }
    const filas = Array.isArray(data.ordenes) ? data.ordenes : (Array.isArray(data.rows) ? data.rows : []);

    ordenes.value = filas.map(ord => ({
      ...ord,
      empleado_nombre: (ord && ord.empleado && ord.empleado.nombre) ? ord.empleado.nombre : (ord.empleado_nombre || 'No asignado')
    }));

    // Estadísticas pueden venir en data.estadisticas o data.estadisticas
    resumen.value = data.estadisticas || data.estadisticas || null;

  } catch (error) {
    console.error('Error al cargar reporte general', error);
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
    const categoriaIds = categoriasSeleccionadas.value.join(',');
    const data = await EstadisticasService.getIngresosPorCategoria(fechaInicio.value, fechaFin.value, categoriaIds);
    ingresosPorCategoria.value = data.ingresosPorCategoria || [];
  } catch (error) {
    console.error('Error al cargar reporte de ingresos por categoría', error);
    ingresosPorCategoria.value = [];
  } finally {
    loading.value = false;
  }
};

const verDetalle = (item) => {
  ordenSeleccionada.value = item;
  dialogDetalle.value = true;
};

const getTitle = (vista) => {
  const titles = {
    ventas_usuario: 'Reporte de Ventas por Empleado',
    reporte_general: 'Reporte General',
    ingresos_categoria: 'Reporte de Ingresos por Categoría'
  };
  return titles[vista] || 'Reporte';
};

const getIcon = (vista) => {
  const icons = {
    ventas_usuario: 'mdi-account-cash',
    reporte_general: 'mdi-chart-line',
    ingresos_categoria: 'mdi-shape'
  };
  return icons[vista] || 'mdi-chart-bar';
};

const getIconColor = (vista) => {
  const colors = {
    ventas_usuario: 'primary',
    reporte_general: 'success',
    ingresos_categoria: 'purple'
  };
  return colors[vista] || 'grey';
};
</script>

<style scoped>
.registros-view {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.report-card {
  border-radius: 12px;
}

.v-fade-transition-enter-active,
.v-fade-transition-leave-active {
  transition: opacity 0.3s ease;
}

.v-fade-transition-enter-from,
.v-fade-transition-leave-to {
  opacity: 0;
}
</style>
