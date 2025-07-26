<template>
  <v-container fluid class="configuracion-container">
    <!-- Header Principal -->
    <v-card class="mb-6 header-card" elevation="3">
      <v-card-title class="header-title">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="title-section">
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon class="mr-3" size="40" color="white">mdi-cog</v-icon>
              Configuración del Sistema
            </h1>
            <p class="text-h6 mb-0 header-subtitle">
              Gestiona la configuración general, usuarios y parámetros del sistema
            </p>
          </div>
          
          <div class="d-flex align-center gap-3">
            <v-chip variant="elevated" color="success" size="large">
              <v-icon start>mdi-shield-check</v-icon>
              Sistema Activo
            </v-chip>
            <v-btn 
              color="white" 
              variant="elevated" 
              size="large"
              @click="guardarConfiguracion"
              :loading="guardando"
            >
              <v-icon start>mdi-content-save</v-icon>
              Guardar Cambios
            </v-btn>
          </div>
        </div>
      </v-card-title>
    </v-card>

    <!-- Navegación por pestañas -->
    <v-card class="mb-4" elevation="2">
      <v-tabs 
        v-model="tabActiva" 
        bg-color="transparent"
        color="primary"
        slider-color="primary"
        class="config-tabs"
      >
        <v-tab 
          v-for="tab in tabs" 
          :key="tab.value"
          :value="tab.value"
          class="tab-item"
        >
          <v-icon start class="mr-2">{{ tab.icon }}</v-icon>
          {{ tab.title }}
          <v-badge 
            v-if="tab.badge" 
            :content="tab.badge" 
            color="error" 
            inline
            class="ml-2"
          />
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Contenido de las pestañas -->
    <v-window v-model="tabActiva">
      
      <!-- Pestaña: General -->
      <v-window-item value="general">
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="2" class="config-card">
              <v-card-title class="section-title">
                <v-icon class="mr-2" color="primary">mdi-domain</v-icon>
                Información de la Empresa
              </v-card-title>
              <v-card-text>
                <v-form class="config-form">
                  <v-text-field
                    v-model="configuracion.empresa.nombre"
                    label="Nombre de la Empresa"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-office-building"
                  />
                  <v-text-field
                    v-model="configuracion.empresa.direccion"
                    label="Dirección"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-map-marker"
                  />
                  <v-text-field
                    v-model="configuracion.empresa.telefono"
                    label="Teléfono"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-phone"
                  />
                  <v-text-field
                    v-model="configuracion.empresa.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-email"
                  />
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card elevation="2" class="config-card">
              <v-card-title class="section-title">
                <v-icon class="mr-2" color="primary">mdi-tune</v-icon>
                Configuración General
              </v-card-title>
              <v-card-text>
                <v-form class="config-form">
                  <v-select
                    v-model="configuracion.general.idioma"
                    :items="idiomasDisponibles"
                    label="Idioma del Sistema"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-translate"
                  />
                  <v-select
                    v-model="configuracion.general.moneda"
                    :items="monedasDisponibles"
                    label="Moneda Principal"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-currency-usd"
                  />
                  <v-select
                    v-model="configuracion.general.formatoFecha"
                    :items="formatosFecha"
                    label="Formato de Fecha"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar"
                  />
                  <v-switch
                    v-model="configuracion.general.modoOscuro"
                    label="Modo Oscuro"
                    color="primary"
                    inset
                  />
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Pestaña: Usuarios -->
      <v-window-item value="usuarios">
        <v-card elevation="2" class="config-card">
          <v-card-title class="section-title d-flex justify-space-between">
            <div>
              <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
              Gestión de Empleados
            </div>
            <v-btn 
              color="primary" 
              variant="elevated"
              @click="toggleEmpleados"
              size="large"
            >
              <v-icon start>{{ showEmpleados ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              {{ showEmpleados ? 'Ocultar' : 'Mostrar' }} Empleados
            </v-btn>
          </v-card-title>
          
          <v-expand-transition>
            <div v-if="showEmpleados">
              <v-card-text>
                <Empleados />
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-window-item>

      <!-- Pestaña: Sistema -->
      <v-window-item value="sistema">
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="2" class="config-card">
              <v-card-title class="section-title">
                <v-icon class="mr-2" color="primary">mdi-security</v-icon>
                Seguridad
              </v-card-title>
              <v-card-text>
                <v-form class="config-form">
                  <v-switch
                    v-model="configuracion.seguridad.autenticacionDosFactor"
                    label="Autenticación de Dos Factores"
                    color="primary"
                    inset
                  />
                  <v-switch
                    v-model="configuracion.seguridad.sesionesMultiples"
                    label="Permitir Sesiones Múltiples"
                    color="primary"
                    inset
                  />
                  <v-text-field
                    v-model="configuracion.seguridad.tiempoSesion"
                    label="Tiempo de Sesión (minutos)"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-clock"
                  />
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card elevation="2" class="config-card">
              <v-card-title class="section-title">
                <v-icon class="mr-2" color="primary">mdi-backup-restore</v-icon>
                Respaldo y Mantenimiento
              </v-card-title>
              <v-card-text>
                <v-form class="config-form">
                  <v-switch
                    v-model="configuracion.sistema.respaldoAutomatico"
                    label="Respaldo Automático"
                    color="primary"
                    inset
                  />
                  <v-select
                    v-model="configuracion.sistema.frecuenciaRespaldo"
                    :items="frecuenciasRespaldo"
                    label="Frecuencia de Respaldo"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar-clock"
                    :disabled="!configuracion.sistema.respaldoAutomatico"
                  />
                  <div class="d-flex gap-3 mt-4">
                    <v-btn 
                      color="success" 
                      variant="outlined"
                      size="large"
                      @click="crearRespaldo"
                      :loading="creandoRespaldo"
                    >
                      <v-icon start>mdi-download</v-icon>
                      Crear Respaldo
                    </v-btn>
                    <v-btn 
                      color="warning" 
                      variant="outlined"
                      size="large"
                      @click="limpiarCache"
                      :loading="limpiandoCache"
                    >
                      <v-icon start>mdi-broom</v-icon>
                      Limpiar Caché
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Pestaña: Notificaciones -->
      <v-window-item value="notificaciones">
        <v-card elevation="2" class="config-card">
          <v-card-title class="section-title">
            <v-icon class="mr-2" color="primary">mdi-bell</v-icon>
            Configuración de Notificaciones
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-4">Notificaciones del Sistema</h3>
                <v-form class="config-form">
                  <v-switch
                    v-model="configuracion.notificaciones.ordenesNuevas"
                    label="Órdenes Nuevas"
                    color="primary"
                    inset
                  />
                  <v-switch
                    v-model="configuracion.notificaciones.cambiosEstado"
                    label="Cambios de Estado"
                    color="primary"
                    inset
                  />
                  <v-switch
                    v-model="configuracion.notificaciones.stockBajo"
                    label="Stock Bajo"
                    color="primary"
                    inset
                  />
                  <v-switch
                    v-model="configuracion.notificaciones.pagosVencidos"
                    label="Pagos Vencidos"
                    color="primary"
                    inset
                  />
                </v-form>
              </v-col>
              
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-4">Métodos de Envío</h3>
                <v-form class="config-form">
                  <v-switch
                    v-model="configuracion.notificaciones.email"
                    label="Notificaciones por Email"
                    color="primary"
                    inset
                  />
                  <v-switch
                    v-model="configuracion.notificaciones.sms"
                    label="Notificaciones por SMS"
                    color="primary"
                    inset
                  />
                  <v-switch
                    v-model="configuracion.notificaciones.push"
                    label="Notificaciones Push"
                    color="primary"
                    inset
                  />
                </v-form>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-window-item>

    </v-window>

    <!-- Snackbar para notificaciones -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      timeout="4000" 
      location="bottom center"
      variant="elevated"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Empleados from '@/components/empleado/FormEmpleados.vue'

// Estado reactivo
const tabActiva = ref('general')
const showEmpleados = ref(false)
const guardando = ref(false)
const creandoRespaldo = ref(false)
const limpiandoCache = ref(false)

// Configuración del sistema
const configuracion = reactive({
  empresa: {
    nombre: 'Mi Empresa',
    direccion: '',
    telefono: '',
    email: ''
  },
  general: {
    idioma: 'es',
    moneda: 'GTQ',
    formatoFecha: 'DD/MM/YYYY',
    modoOscuro: false
  },
  seguridad: {
    autenticacionDosFactor: false,
    sesionesMultiples: true,
    tiempoSesion: 120
  },
  sistema: {
    respaldoAutomatico: true,
    frecuenciaRespaldo: 'diario'
  },
  notificaciones: {
    ordenesNuevas: true,
    cambiosEstado: true,
    stockBajo: true,
    pagosVencidos: true,
    email: true,
    sms: false,
    push: true
  }
})

// Snackbar
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// Pestañas de navegación
const tabs = [
  { 
    title: 'General', 
    value: 'general', 
    icon: 'mdi-cog-outline' 
  },
  { 
    title: 'Usuarios', 
    value: 'usuarios', 
    icon: 'mdi-account-group',
    badge: null
  },
  { 
    title: 'Sistema', 
    value: 'sistema', 
    icon: 'mdi-server' 
  },
  { 
    title: 'Notificaciones', 
    value: 'notificaciones', 
    icon: 'mdi-bell-outline',
    badge: '3'
  }
]

// Opciones para selects
const idiomasDisponibles = [
  { title: 'Español', value: 'es' },
  { title: 'English', value: 'en' }
]

const monedasDisponibles = [
  { title: 'Quetzal (GTQ)', value: 'GTQ' },
  { title: 'Dólar (USD)', value: 'USD' },
  { title: 'Euro (EUR)', value: 'EUR' }
]

const formatosFecha = [
  { title: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { title: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { title: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
]

const frecuenciasRespaldo = [
  { title: 'Diario', value: 'diario' },
  { title: 'Semanal', value: 'semanal' },
  { title: 'Mensual', value: 'mensual' }
]

// Métodos
const toggleEmpleados = () => {
  showEmpleados.value = !showEmpleados.value
}

const guardarConfiguracion = async () => {
  guardando.value = true
  try {
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))
    mostrarNotificacion('Configuración guardada correctamente', 'success')
  } catch (error) {
    mostrarNotificacion('Error al guardar la configuración', 'error')
  } finally {
    guardando.value = false
  }
}

const crearRespaldo = async () => {
  creandoRespaldo.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    mostrarNotificacion('Respaldo creado correctamente', 'success')
  } catch (error) {
    mostrarNotificacion('Error al crear el respaldo', 'error')
  } finally {
    creandoRespaldo.value = false
  }
}

const limpiarCache = async () => {
  limpiandoCache.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    mostrarNotificacion('Caché limpiado correctamente', 'success')
  } catch (error) {
    mostrarNotificacion('Error al limpiar el caché', 'error')
  } finally {
    limpiandoCache.value = false
  }
}

const mostrarNotificacion = (mensaje, color = 'success') => {
  snackbar.message = mensaje
  snackbar.color = color
  snackbar.show = true
}
</script>

<style scoped>
.configuracion-container {
  max-width: 100%;
  padding: 20px;
}

.header-card {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border-radius: 16px;
}

.header-title {
  padding: 32px;
}

.title-section h1 {
  color: white;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.config-tabs .v-tab {
  font-weight: 600;
  font-size: 1rem;
  min-height: 60px;
  padding: 0 24px;
}

.config-card {
  border-radius: 12px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.config-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 20px 24px 16px;
  color: #1976d2;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-form .v-text-field,
.config-form .v-select {
  margin-bottom: 8px;
}

.config-form .v-switch {
  margin-bottom: 16px;
}

/* Estilos para mejor UX en tablet */
.v-text-field,
.v-select {
  font-size: 1rem;
}

.v-text-field .v-field,
.v-select .v-field {
  min-height: 56px;
}

.v-btn {
  min-height: 44px;
  font-weight: 600;
  border-radius: 8px;
}

.v-switch .v-label {
  font-size: 1rem;
  font-weight: 500;
}

/* Responsive para tablet */
@media (max-width: 1024px) {
  .header-title {
    padding: 24px;
  }
  
  .title-section h1 {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .configuracion-container {
    padding: 16px;
  }
  
  .header-title .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px;
  }
  
  .config-tabs .v-tab {
    min-width: auto;
    padding: 0 12px;
    font-size: 0.9rem;
  }
}

/* Animaciones suaves */
.v-window-item {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .config-card {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .section-title {
    color: #90caf9;
  }
}
</style>