<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 text-primary">Reporte de Ventas por Empleado</h1>
      </v-col>
    </v-row>

    <!-- Barra de Filtros -->
    <v-card class="mb-6 pa-4">
      <v-row align="center">
        <v-col cols="12" md="4">
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
        <v-col cols="12" md="4">
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
        <v-col cols="12" md="4" v-if="periodoSeleccionado === 'custom'">
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
        <v-col cols="12" md="4" v-else>
           <v-btn color="primary" block @click="cargarReporte" :loading="loading" height="40">
             Buscar Ventas
           </v-btn>
        </v-col>
        <v-col cols="12" v-if="periodoSeleccionado === 'custom'">
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
    <v-card v-if="resumen">
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
        class="elevation-1"
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
  cargarReporte();
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

const cargarEmpleados = async () => {
  try {
    const data = await EmpleadoService.getAll();
    // ApiService sometimes returns { empleados: [...] } or direct array. We handle accordingly.
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
      empleadoId: empleadoSeleccionado.value,
      limit: 1000 // Para obtener la mayoría en el reporte
    };

    const data = await OrdenesService.searchByDateRange(params);
    ordenes.value = data.ordenes || [];
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
