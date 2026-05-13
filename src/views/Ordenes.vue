<template>
  <v-container class="ordenes-view" fluid>
  
    <!-- Encabezado fijo con acciones (solo visible en vista inicio) -->
    <v-card v-if="vistaActual === 'inicio'" class="welcome-card mb-6" elevation="2">
      <v-card-text class="text-center pa-8">
        <v-icon size="80" color="primary" class="mb-4">mdi-format-list-checks</v-icon>
        <h2 class="text-h4 mb-2">¡Bienvenido al módulo de Órdenes!</h2>
        <p class="text-h6 text-grey-darken-1 mb-6">
          Aquí puedes gestionar y crear órdenes fácilmente
        </p>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-card class="quick-action-card" @click="abrirDialogNuevaOrden" hover>
              <v-card-text class="d-flex align-center">
                <v-icon size="40" color="primary" class="mr-4">mdi-plus-circle</v-icon>
                <div>
                  <h4 class="text-h6">Nueva Orden</h4>
                  <p class="text-body-2 text-grey-darken-1">Crear una nueva orden de servicio o producto</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="quick-action-card" @click="cambiarVista('lista')" hover>
              <v-card-text class="d-flex align-center">
                <v-icon size="40" color="success" class="mr-4">mdi-format-list-bulleted</v-icon>
                <div>
                  <h4 class="text-h6">Ver Órdenes</h4>
                  <p class="text-body-2 text-grey-darken-1">Explora todas las órdenes registradas</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>



    <!-- Vista de nueva orden -->
    <v-fade-transition mode="out-in">
      <div v-if="vistaActual === 'nueva'" key="nueva">
        <v-card class="new-order-card" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-plus-circle</v-icon>
            <span>Nueva Orden</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="cerrarFormularioOrden" />
          </v-card-title>
          <v-card-text>
            <FormOrden @ordenGuardada="ordenGuardada" />
          </v-card-text>
        </v-card>
      </div>

      <!-- Vista de lista de órdenes -->
      <div v-else-if="vistaActual === 'lista'" key="lista">
        <v-card class="list-card" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" color="success">mdi-format-list-bulleted</v-icon>
            <span>Lista de Órdenes</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="cambiarVista('inicio')" />
          </v-card-title>
          <v-card-text>
            <ListaOrdenes :ordenes="ordenes" />
          </v-card-text>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="bottom"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FormOrden from '@/components/ordenes/FormOrden.vue'
import ListaOrdenes from '@/components/ordenes/ListaOrdenes.vue'
import ordenesService from '@/services/ordenes.service'

const vistaActual = ref('inicio')
const ordenes = ref([])
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

async function cargarOrdenes() {
  try {
    const data = await ordenesService.getAll()
    ordenes.value = data
  } catch (err) {
    console.error('Error al cargar órdenes', err)
    mostrarNotificacion('Error al cargar las órdenes', 'error')
  }
}

function cambiarVista(vista) {
  vistaActual.value = vista
}

function mostrarNotificacion(mensaje, color = 'success') {
  snackbar.value = { show: true, message: mensaje, color }
}

function abrirDialogNuevaOrden() {
  vistaActual.value = 'nueva'
}

function cerrarFormularioOrden() {
  vistaActual.value = 'inicio'
}

function ordenGuardada(nuevaOrden) {
  ordenes.value.unshift(nuevaOrden)
  vistaActual.value = 'inicio'
  mostrarNotificacion('Orden guardada exitosamente')
}

onMounted(() => {
  cargarOrdenes()
})
</script>

<style scoped>
.ordenes-view {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.welcome-card {
background: linear-gradient(135deg, #f0faffe7 0%, #e6f4ff99 100%);

}

.action-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-card.active {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.list-card,
.new-order-card {
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
