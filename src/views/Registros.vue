<template>
  <v-container class="registros-view" fluid>
  
    <!-- Encabezado fijo con acciones (solo visible en vista inicio) -->
    <v-fade-transition mode="out-in">
      <v-card v-if="vistaActual === 'inicio'" class="welcome-card mb-6" elevation="2">
        <v-card-text class="text-center pa-8">
          <v-icon size="80" color="primary" class="mb-4">mdi-chart-bar</v-icon>
          <h2 class="text-h4 mb-2">¡Bienvenido al módulo de Registros y Reportes!</h2>
          <p class="text-h6 text-grey-darken-1 mb-6">
            Consulta el rendimiento y estadísticas del negocio
          </p>
          <v-row justify="center">
            <v-col cols="12" md="6">
              <v-card class="quick-action-card" @click="cambiarVista('ventas_usuario')" hover>
                <v-card-text class="d-flex align-center">
                  <v-icon size="40" color="primary" class="mr-4">mdi-account-cash</v-icon>
                  <div>
                    <h4 class="text-h6 text-left">Ventas por Usuario</h4>
                    <p class="text-body-2 text-grey-darken-1 text-left">Consulta el rendimiento y lo que ha vendido cada empleado</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="quick-action-card" @click="cambiarVista('reporte_general')" hover>
                <v-card-text class="d-flex align-center">
                  <v-icon size="40" color="success" class="mr-4">mdi-chart-line</v-icon>
                  <div>
                    <h4 class="text-h6 text-left">Reporte General</h4>
                    <p class="text-body-2 text-grey-darken-1 text-left">Resumen global de las ventas e ingresos del negocio</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-fade-transition>

    <!-- Vista de Ventas por Usuario / Reportes (Ambas reutilizan el mismo componente por ahora) -->
    <v-fade-transition mode="out-in">
      <div v-if="vistaActual === 'ventas_usuario' || vistaActual === 'reporte_general'" :key="vistaActual">
        <v-card class="report-card" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" :color="vistaActual === 'ventas_usuario' ? 'primary' : 'success'">
              {{ vistaActual === 'ventas_usuario' ? 'mdi-account-cash' : 'mdi-chart-line' }}
            </v-icon>
            <span>{{ vistaActual === 'ventas_usuario' ? 'Reporte de Ventas por Empleado' : 'Reporte General' }}</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="cambiarVista('inicio')" />
          </v-card-title>
          
          <v-card-text>
            <!-- Barra de Filtros -->
            <v-card class="mb-6 pa-4 bg-grey-lighten-4" elevation="0">
              <v-row align="center">
                <v-col cols="12" md="4" v-if="vistaActual === 'ventas_usuario'">
                  <v-select
                    v-model="empleadoSeleccionado"
                    :items="empleados"
                    item-title="nombre"
                    item-value="id"
                    label="Seleccionar Empleado"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12" :md="vistaActual === 'ventas_usuario' ? 4 : 6">
                  <v-select
                    v-model="periodoSeleccionado"
                    :items="opcionesPeriodo"
                    item-title="label"
                    item-value="value"
                    label="Periodo"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </v-col>
                <!-- Fechas personalizadas si selecciona 'custom' -->
                <v-col cols="12" :md="vistaActual === 'ventas_usuario' ? 4 : 6" v-if="periodoSeleccionado === 'custom'">
                  <div class="d-flex" style="gap: 8px;">
                    <v-text-field
                      v-model="fechaInicio"
                      type="date"
                      label="Desde"
                      variant="outlined"
                      density="compact"
                      hide-details
                    ></v-text-field>
                    <v-text-field
                      v-model="fechaFin"
                      type="date"
                      label="Hasta"
                      variant="outlined"
                      density="compact"
                      hide-details
                    ></v-text-field>
                  </div>
                </v-col>
                <v-col cols="12" md="4" v-else-if="vistaActual === 'ventas_usuario'">
                   <v-btn color="primary" block @click="cargarReporte" :loading="loading" height="40">
                     Buscar Ventas
                   </v-btn>
                </v-col>
                <v-col cols="12" v-if="periodoSeleccionado === 'custom' || vistaActual === 'reporte_general'">
                   <v-btn color="primary" block @click="cargarReporte" :loading="loading" height="40">
                     Buscar Ventas
                   </v-btn>
                </v-col>
              </v-row>
            </v-card>

            <!-- KPIs -->
            <v-row class="mb-6" v-if="resumen">
              <v-col
                v-for="kpi in kpiCards"
                :key="kpi.title"
                cols="12"
                sm="6"
                lg="3"
              >
                <DashboardKPICard
                  :variant="kpi.variant"
                  :icon="kpi.icon"
                  :title="kpi.title"
                  :value="kpi.value"
                  :subtitle="kpi.subtitle"
                  :format-as-currency="kpi.formatAsCurrency"
                  :currency-symbol="kpi.currencySymbol"
                  :hoverable="true"
                />
              </v-col>
            </v-row>

            <!-- Tabla de Detalles -->
            <v-card v-if="resumen" elevation="0" border>
              <v-card-title class="d-flex align-center bg-grey-lighten-4 py-3">
                <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
                Detalle de Ventas
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-inner-icon="mdi-magnify"
                  label="Buscar orden..."
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                  style="max-width: 300px"
                ></v-text-field>
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="ordenes"
                :search="search"
                :loading="loading"
                hover
              >
                <template v-slot:item.fecha="{ item }">
                  {{ formatDate(item.fecha) }}
                </template>
                <template v-slot:item.id="{ item }">
                  <strong>#ORD-{{ String(item.id).padStart(5, '0') }}</strong>
                </template>
                <template v-slot:item.estado_pago="{ item }">
                  <v-chip :color="getColorPago(item.estado_pago)" size="small">
                    {{ item.estado_pago?.toUpperCase() }}
                  </v-chip>
                </template>
                <template v-slot:item.total="{ item }">
                  Q{{ formatMoney(item.total) }}
                </template>
                <template v-slot:item.acciones="{ item }">
                  <v-btn icon="mdi-eye" size="small" variant="text" color="primary" @click="verDetalle(item)"></v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-card-text>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Modal Detalle -->
    <v-dialog v-model="dialogDetalle" max-width="600">
      <v-card v-if="ordenSeleccionada">
        <v-card-title class="bg-primary text-white d-flex align-center">
          Detalle Orden #ORD-{{ String(ordenSeleccionada.id).padStart(5, '0') }}
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogDetalle = false" color="white"></v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6">
              <div class="text-caption text-grey">Cliente</div>
              <div class="text-body-1">{{ ordenSeleccionada.cliente_nombre || 'Mostrador' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Fecha</div>
              <div class="text-body-1">{{ formatDate(ordenSeleccionada.fecha) }}</div>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <h3 class="text-h6 mb-3">Productos</h3>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Cant</th>
                <th>Producto</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ordenSeleccionada.items" :key="item.item.id">
                <td>{{ item.cantidad }}</td>
                <td>{{ item.item.nombre }}</td>
                <td class="text-right">Q{{ formatMoney(item.precio_unitario) }}</td>
                <td class="text-right">Q{{ formatMoney(item.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold">Total:</td>
                <td class="text-right font-weight-bold">Q{{ formatMoney(ordenSeleccionada.total) }}</td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="dialogDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import OrdenesService from '@/services/ordenes.service';
import EmpleadoService from '@/services/empleado.service';
import DashboardKPICard from '@/components/Dashboard/DashboardKPICard.vue';

const vistaActual = ref('inicio');

const empleados = ref([]);
const empleadoSeleccionado = ref(null);

const opcionesPeriodo = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mes', value: 'mes' },
  { label: 'Personalizado', value: 'custom' },
];
const periodoSeleccionado = ref('hoy');

const fechaInicio = ref('');
const fechaFin = ref('');

const loading = ref(false);
const ordenes = ref([]);
const resumen = ref(null);
const search = ref('');

const dialogDetalle = ref(false);
const ordenSeleccionada = ref(null);

const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Folio', key: 'id' },
  { title: 'Cliente', key: 'cliente_nombre' },
  { title: 'Empleado', key: 'empleado_nombre' },
  { title: 'Estado Pago', key: 'estado_pago' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Acciones', key: 'acciones', align: 'center', sortable: false },
];

const kpiCards = computed(() => [
  {
    title: 'Total Vendido',
    value: resumen.value?.ventasTotales || 0,
    subtitle: 'Ingresos del periodo',
    variant: 'primary',
    icon: 'mdi-cash-multiple',
    formatAsCurrency: true,
    currencySymbol: 'Q'
  },
  {
    title: 'Órdenes Procesadas',
    value: resumen.value?.totalOrdenes || 0,
    subtitle: 'Documentos incluidos',
    variant: 'info',
    icon: 'mdi-receipt-text-outline',
    formatAsCurrency: false,
    currencySymbol: 'Q'
  },
  {
    title: 'Ticket Promedio',
    value: resumen.value?.ticketPromedio || 0,
    subtitle: 'Promedio por orden',
    variant: 'success',
    icon: 'mdi-chart-line',
    formatAsCurrency: true,
    currencySymbol: 'Q'
  },
  {
    title: 'Total Abonado',
    value: resumen.value?.totalAbonado || 0,
    subtitle: 'Pagos aplicados',
    variant: 'warning',
    icon: 'mdi-wallet-outline',
    formatAsCurrency: true,
    currencySymbol: 'Q'
  }
]);

onMounted(async () => {
  await cargarEmpleados();
  establecerFechasPorPeriodo();
});

watch(periodoSeleccionado, (newVal) => {
  if (newVal !== 'custom') {
    establecerFechasPorPeriodo();
    cargarReporte();
  }
});

watch(empleadoSeleccionado, () => {
  cargarReporte();
});

function cambiarVista(vista) {
  vistaActual.value = vista;
  // Limpiar selecciones al cambiar a reporte general
  if (vista === 'reporte_general') {
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
    if (Array.isArray(data)) {
      empleados.value = data;
    } else if (data && data.empleados) {
      empleados.value = data.empleados;
    } else {
      empleados.value = [];
    }
  } catch (error) {
    console.error('Error al cargar empleados', error);
  }
};

const establecerFechasPorPeriodo = () => {
  const hoy = new Date();
  const formatIso = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  if (periodoSeleccionado.value === 'hoy') {
    fechaInicio.value = formatIso(hoy);
    fechaFin.value = formatIso(hoy);
  } else if (periodoSeleccionado.value === 'semana') {
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1)); // Lunes
    fechaInicio.value = formatIso(inicioSemana);
    fechaFin.value = formatIso(hoy);
  } else if (periodoSeleccionado.value === 'mes') {
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    fechaInicio.value = formatIso(inicioMes);
    fechaFin.value = formatIso(hoy);
  }
};

const cargarReporte = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  loading.value = true;
  try {
    const params = {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      empleadoId: empleadoSeleccionado.value, // se envía null/undefined si es reporte general
      limit: 1000
    };

    const data = await OrdenesService.searchByDateRange(params);
    
    // Mapear empleado_nombre para la tabla si viene el objeto empleado
    const ordenesMapeadas = (data.ordenes || []).map(ord => ({
      ...ord,
      empleado_nombre: ord.empleado ? ord.empleado.nombre : 'No asignado'
    }));

    ordenes.value = ordenesMapeadas;
    resumen.value = data.estadisticas || null;

  } catch (error) {
    console.error('Error al cargar reporte', error);
  } finally {
    loading.value = false;
  }
};

const formatMoney = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (val) => {
  if (!val) return '';
  const date = new Date(val);
  return date.toLocaleString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getColorPago = (estado) => {
  if (estado === 'pagado') return 'success';
  if (estado === 'parcial') return 'warning';
  return 'error';
};

const verDetalle = (item) => {
  ordenSeleccionada.value = item;
  dialogDetalle.value = true;
};

</script>

<style scoped>
.registros-view {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.welcome-card {
  background: linear-gradient(135deg, #f0faffe7 0%, #e6f4ff99 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(21, 101, 192, 0.06);
}

.quick-action-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid transparent;
  height: 100%;
}

.quick-action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.quick-action-card.active {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
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
