<template>
  <v-container fluid class="configuracion-container">
    <!-- Header Principal -->
    <v-card class="mb-6 header-card" elevation="3">
      <v-card-title class="header-title">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="title-section">
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon class="mr-3" size="40" color="white">mdi-account-group</v-icon>
              Gestión de Empleados
            </h1>
            <p class="text-h6 mb-0 header-subtitle">
              Gestiona los empleados del sistema
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

    <!-- Contenido Principal - Empleados -->
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
const showEmpleados = ref(false)
const guardando = ref(false)

// Snackbar
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

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

.v-btn {
  min-height: 44px;
  font-weight: 600;
  border-radius: 8px;
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
}

/* Animaciones suaves */
.v-expand-transition {
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