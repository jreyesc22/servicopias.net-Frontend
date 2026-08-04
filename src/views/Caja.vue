<template>
  <v-container class="pa-6 dashboard-container">
    <!-- Header profesional -->
    <v-row align="center" justify="space-between" class="mb-8">
      <v-col cols="12" md="8">
        <div class="header-section">
          <h1 class="display-1 font-weight-bold text-primary-dark mb-3">
            <v-icon class="me-3" size="36" color="primary">mdi-cash-register</v-icon>
            Gestión de Caja
          </h1>
          <div class="text-body-1 text-slate-600 d-flex align-center">
            <v-icon class="me-2" size="20" color="slate-500">mdi-calendar-today</v-icon>
            {{ fechaActual }}
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-end">
        <v-chip 
          class="status-chip"
          :color="resumenDia?.balance_del_dia >= 0 ? 'success' : 'warning'"
          size="large"
          label
        >
          <v-icon start>mdi-trending-up</v-icon>
          Estado: {{ resumenDia?.balance_del_dia >= 0 ? 'Positivo' : 'Negativo' }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Tarjetas resumen con DashboardKPICard -->
    <v-row v-if="resumenDia" class="my-6" dense>
      <v-col 
        v-for="(kpi, index) in kpiCards" 
        :key="index"
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
          :showProgress="kpi.showProgress"
          :progressValue="kpi.progressValue"
          hoverable
        />
      </v-col>
    </v-row>


    
    <!-- Registro de egreso -->
    <v-card class="mb-8 egreso-card" elevation="2">
      <v-card-title class="pa-6 bg-gradient-primary text-white d-flex align-center">
        <v-icon class="me-3" size="28">mdi-cash-minus</v-icon>
        <span class="text-h6 font-weight-medium">Registro Rápido de Egreso</span>
      </v-card-title>
      <v-card-text class="pa-6">
        <RegistrarEgreso
          :tipos-pago="tiposPago"
          :empleados="empleados"
          :loading="cargando"
          @egreso-creado="(egreso) => {
            mostrarNotificacion('✅ Egreso registrado exitosamente', 'success')
            refrescarDatos()
          }"
        />
      </v-card-text>
      
    </v-card>

 



    <!-- Panel de controles y Filtros -->
    <v-card class="control-panel mb-8" elevation="2">
      <v-card-title class="pa-6 bg-slate-50 border-bottom">
        <v-icon class="me-3" color="primary">mdi-tune-variant</v-icon>
        <span class="text-h6 font-weight-medium">Controles y Filtros</span>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="4">
            <v-select
              v-model="filtroTipo"
              :items="[
                { title: 'Todos los movimientos', value: '' },
                { title: 'Solo Ingresos', value: 'ingreso' },
                { title: 'Solo Egresos', value: 'egreso' }
              ]"
              label="Filtrar tipo de movimiento"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-filter-variant"
              class="control-select"
              color="primary"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="filtroEmpleado"
              :items="[{ id: '', nombre: 'Todos los empleados' }, ...empleados]"
              item-title="nombre"
              item-value="id"
              label="Filtrar por empleado"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              class="control-select"
              color="primary"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="fechaSeleccionada"
              type="date"
              label="Seleccionar fecha"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar"
              class="control-input"
              color="primary"
              @change="cargarMovimientosPorFecha"
            />
          </v-col>

        </v-row>
      </v-card-text>
    </v-card>



        <!-- Lista de movimientos -->
    <v-card elevation="3" class="movements-container">
      <v-card-title class="pa-6 bg-gradient-secondary text-white d-flex align-center">
        <v-icon class="me-3" size="28">mdi-format-list-bulleted-square</v-icon>
        <span class="text-h6 font-weight-medium">Historial de Movimientos</span>
        <v-spacer />
        <v-chip 
          :color="movimientosFiltrados.length > 0 ? 'success' : 'warning'" 
          size="small"
          variant="flat"
          class="ml-2"
        >
          <v-icon start size="16">mdi-database</v-icon>
          {{ movimientosFiltrados.length }} registros
        </v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <MovimientosList
          :movimientos="movimientosFiltrados"
          :cargando="cargando"
          @eliminar="eliminarMovimiento"
          @editar="editarMovimiento"
          @ver-detalle="verDetalle"
        />
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <MovimientoModal
      v-if="mostrarModal"
      :visible="mostrarModal"
      :movimiento="movimientoSeleccionado"
      :modo="modoModal"
      @cerrar="cerrarModal"
      @guardar="guardarMovimiento"
    />

    <!-- Notificación profesional -->
    <v-snackbar 
      v-model="notificacionVisible" 
      :color="notificacion?.tipo || 'info'" 
      timeout="4000"
      location="top right"
      class="professional-snackbar"
      elevation="6"
    >
      <div class="d-flex align-center">
        <v-icon class="me-3" size="20">
          {{ getNotificationIcon(notificacion?.tipo) }}
        </v-icon>
        <span class="font-weight-medium">{{ notificacion?.mensaje }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MovimientosList from '../components/caja/MovimientosList.vue'
import { useCajaAPI } from '../components/composables/useCajaAPI.js'
import RegistrarEgreso from '../components/caja/RegistrarEgreso.vue'
import MovimientoModal from '../components/caja/RegistrarIngresoE.vue'
import { useTiposPago } from '../components/composables/useTiposPago'
import { useEmpleados } from '../components/composables/useEmpleados'
import DashboardKPICard from '../components/Dashboard/DashboardKPICard.vue'
import { clasificarMovimientos } from '../utils/tipoPagoClassification'

const movimientos = ref([])
const resumenDia = ref(null)
const cargando = ref(false)
const fechaSeleccionada = ref(new Date().toISOString().split('T')[0])
const filtroTipo = ref('')
const filtroEmpleado = ref('')
const mostrarModal = ref(false)
const movimientoSeleccionado = ref(null)
const modoModal = ref('crear')
const notificacion = ref(null)
const notificacionVisible = ref(false)

const { obtenerMovimientosHoy, obtenerMovimientosPorFecha, crearMovimiento, eliminarMovimiento: eliminarMovimientoAPI } = useCajaAPI()
const { tiposPago, fetchTiposPago } = useTiposPago()
const { empleados, fetchEmpleados } = useEmpleados()

const fechaActual = computed(() =>
  new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
)

const movimientosFiltrados = computed(() => {
  let filtrados = movimientos.value

  if (filtroTipo.value) {
    filtrados = filtrados.filter(m => m.tipo_movimiento === filtroTipo.value)
  }

  if (filtroEmpleado.value) {
    filtrados = filtrados.filter(m => m.id_empleado === filtroEmpleado.value || (m.Empleado && m.Empleado.id === filtroEmpleado.value))
  }

  return filtrados
})

const resumenClasificado = computed(() => {
  if (resumenDia.value?.clasificacion) {
    return resumenDia.value
  }

  return clasificarMovimientos(movimientos.value || [])
})

// Función para formatear moneda
const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(valor || 0)
}

// Función para calcular progreso
const calcularProgreso = (valor, tipo) => {
  const maximo = tipo === 'ingreso' ? 50000 : 30000
  return Math.min((valor / maximo) * 100, 100)
}

// Configuración de KPIs para las summary cards
const kpiCards = computed(() => {
  if (!resumenDia.value) return []
  
  return [
    {
      variant: 'success',
      icon: 'mdi-trending-up',
      title: 'EFECTIVO ESPERADO EN CAJA',
      value: formatearMoneda(resumenClasificado.value.caja_esperada || 0),
      subtitle: 'Solo lo que afecta el cajón',
      showProgress: true,
      progressValue: calcularProgreso(resumenClasificado.value.caja_esperada || 0, 'ingreso')
    },
    {
      variant: 'info',
      icon: 'mdi-bank-transfer',
      title: 'MOVIMIENTO BANCARIO',
      value: formatearMoneda(resumenClasificado.value.total_bancario || 0),
      subtitle: 'Tarjetas y transferencias',
      showProgress: true,
      progressValue: calcularProgreso(resumenClasificado.value.total_bancario || 0, 'ingreso')
    },
    {
      variant: 'error',
      icon: 'mdi-trending-down',
      title: 'EGRESOS DEL DÍA',
      value: formatearMoneda(resumenClasificado.value.total_egresos),
      subtitle: 'Salidas totales del día',
      showProgress: true,
      progressValue: calcularProgreso(resumenClasificado.value.total_egresos, 'egreso')
    },
    {
      variant: resumenClasificado.value.balance_del_dia >= 0 ? 'primary' : 'warning',
      icon: resumenClasificado.value.balance_del_dia >= 0 ? 'mdi-wallet' : 'mdi-wallet-outline',
      title: 'BALANCE NETO',
      value: formatearMoneda(resumenClasificado.value.balance_del_dia),
      subtitle: resumenClasificado.value.balance_del_dia >= 0 ? 'Superávit' : 'Déficit',
      showProgress: true,
      progressValue: Math.min(Math.abs(resumenClasificado.value.balance_del_dia) / 10000 * 100, 100)
    }
  ]
})

// Función para obtener icono de notificación
const getNotificationIcon = (tipo) => {
  const iconos = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return iconos[tipo] || 'mdi-information'
}

const cargarMovimientosHoy = async () => {
  try {
    cargando.value = true
    const response = await obtenerMovimientosHoy()
    movimientos.value = response.movimientos || []
    resumenDia.value = response.resumen || {}
    fechaSeleccionada.value = new Date().toISOString().split('T')[0]
  } catch (error) {
    mostrarNotificacion('Error al cargar movimientos de hoy', 'error')
    console.error(error)
  } finally {
    cargando.value = false
  }
}

const cargarMovimientosPorFecha = async () => {
  if (!fechaSeleccionada.value) return
  try {
    cargando.value = true
    const response = await obtenerMovimientosPorFecha(fechaSeleccionada.value)
    movimientos.value = response.movimientos || []
    resumenDia.value = response.resumen || {}
  } catch (error) {
    mostrarNotificacion('Error al cargar movimientos por fecha', 'error')
    console.error(error)
  } finally {
    cargando.value = false
  }
}

const refrescarDatos = () => {
  const hoy = new Date().toISOString().split('T')[0]
  fechaSeleccionada.value === hoy ? cargarMovimientosHoy() : cargarMovimientosPorFecha()
}

const nuevoMovimiento = () => {
  movimientoSeleccionado.value = null
  modoModal.value = 'crear'
  mostrarModal.value = true
}

const editarMovimiento = (mov) => {
  movimientoSeleccionado.value = { ...mov }
  modoModal.value = 'editar'
  mostrarModal.value = true
}

const eliminarMovimiento = async (id) => {
  if (!confirm('¿Está seguro de eliminar este movimiento?')) return
  try {
    await eliminarMovimientoAPI(id)
    mostrarNotificacion('Movimiento eliminado correctamente', 'success')
    refrescarDatos()
  } catch (error) {
    mostrarNotificacion('Error al eliminar movimiento', 'error')
    console.error(error)
  }
}

const guardarMovimiento = async (data) => {
  try {
    cargando.value = true
    await crearMovimiento(data)
    mostrarNotificacion('Movimiento guardado correctamente', 'success')
    cerrarModal()
    refrescarDatos()
  } catch (error) {
    mostrarNotificacion('Error al guardar movimiento', 'error')
    console.error(error)
  } finally {
    cargando.value = false
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
  movimientoSeleccionado.value = null
}

const verDetalle = (mov) => {
  console.log('Ver detalle:', mov)
}

const mostrarNotificacion = (mensaje, tipo = 'info') => {
  notificacion.value = { mensaje, tipo }
  notificacionVisible.value = true
}

onMounted(() => {
  cargarMovimientosHoy()
  fetchTiposPago()
  fetchEmpleados()
})

</script>

<style scoped>
/* Variables CSS para colores profesionales */
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-900: #1e3a8a;
  
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
}

/* Contenedor principal */
.dashboard-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Header */
.header-section {
  padding: 1.5rem 0;
}

.status-chip {
  font-weight: 700;
  border-radius: 12px;
}

/* Tarjetas de resumen */
.summary-card {
  border-radius: 20px;
  border: 1px solid var(--slate-200);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  transition: all 0.3s ease;
}

.income-card::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.expense-card::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.balance-card::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.movements-card::before {
  background: linear-gradient(90deg, #06b6d4, #38bdf8);
}

.hover-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(59, 130, 246, 0.15);
  border-color: var(--primary-300);
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.success-bg { background: linear-gradient(135deg, #10b981, #34d399); }
.error-bg { background: linear-gradient(135deg, #ef4444, #f87171); }
.primary-bg { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.warning-bg { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.info-bg { background: linear-gradient(135deg, #06b6d4, #38bdf8); }

.progress-section {
  margin-top: 1rem;
}

/* Colores de texto */
.text-primary-dark { color: var(--primary-700) !important; }
.text-success-dark { color: #059669 !important; }
.text-error-dark { color: #dc2626 !important; }
.text-warning-dark { color: #d97706 !important; }
.text-info-dark { color: #0284c7 !important; }
.text-slate-600 { color: var(--slate-600) !important; }
.text-slate-500 { color: var(--slate-500) !important; }

/* Panel de controles */
.control-panel {
  border-radius: 20px;
  border: 1px solid var(--slate-200);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

.border-bottom {
  border-bottom: 1px solid var(--slate-200) !important;
}

.control-select :deep(.v-field),
.control-input :deep(.v-field) {
  border-radius: 16px;
  transition: all 0.3s ease;
  border-color: var(--slate-300);
}

.control-select :deep(.v-field):hover,
.control-input :deep(.v-field):hover {
  border-color: var(--primary-400);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-select :deep(.v-field--focused),
.control-input :deep(.v-field--focused) {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Botones */
.action-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 16px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.action-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.4);
}

.action-btn-secondary {
  border-radius: 16px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-color: var(--primary-500);
  color: var(--primary-600);
}

.action-btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(59, 130, 246, 0.05);
}

/* Gradientes */
.bg-gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
}

.bg-slate-50 {
  background-color: var(--slate-50);
}

/* Contenedores de secciones */
.egreso-card,
.movements-container {
  border-radius: 20px;
  border: 1px solid var(--slate-200);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

/* Notificaciones */
.professional-snackbar {
  border-radius: 16px;
}

.professional-snackbar :deep(.v-snackbar__content) {
  padding: 16px 24px;
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.control-panel {
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.egreso-card {
  animation: slideInUp 0.8s ease-out 0.4s both;
}

.movements-container {
  animation: slideInUp 0.8s ease-out 0.6s both;
}

/* Responsive */
@media (max-width: 800px) {
  .action-btn-primary,
  .action-btn-secondary {
    width: 100%;
    margin-bottom: 12px;
  }
}

/* Estados de carga */
.v-skeleton-loader {
  border-radius: 20px;
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--slate-100);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-400);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-500);
}
</style>