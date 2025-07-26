<template>
  <v-container class="ordenes-view" fluid>
    <!-- Encabezado fijo -->
    <v-card class="welcome-card mb-4" elevation="2">
      <v-card-text class="text-center pa-8">
        <v-icon size="100" color="primary" class="mb-4">mdi-format-list-checks</v-icon>
        <h2 class="text-h4 mb-4">¡Bienvenido al módulo de Órdenes!</h2>
        <p class="text-h6 text-grey-darken-1 mb-4">
          Aquí puedes gestionar y crear órdenes fácilmente
        </p>
      </v-card-text>
    </v-card>

    <!-- Acciones principales -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card
          class="action-card"
          :class="{ 'active': dialogNuevaOrden }"
          @click="abrirDialogNuevaOrden"
          hover
          elevation="2"
        >
          <v-card-text class="text-center pa-6">
            <v-avatar size="80" class="mb-3" color="primary">
              <v-icon size="40" color="white">mdi-plus-circle</v-icon>
            </v-avatar>
            <h3 class="text-h6 mb-2">Nueva Orden</h3>
            <p class="text-body-2 text-grey-darken-1">Crear una nueva orden</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card
          class="action-card"
          :class="{ 'active': vistaActual === 'lista' }"
          @click="cambiarVista('lista')"
          hover
          elevation="2"
        >
          <v-card-text class="text-center pa-6">
            <v-avatar size="80" class="mb-3" color="success">
              <v-icon size="40" color="white">mdi-format-list-bulleted</v-icon>
            </v-avatar>
            <h3 class="text-h6 mb-2">Lista de Órdenes</h3>
            <p class="text-body-2 text-grey-darken-1">Ver y gestionar órdenes</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Vista de lista de órdenes -->
    <v-fade-transition mode="out-in">
      <div v-if="vistaActual === 'lista'" key="lista">
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

    <!-- Modal para nueva orden -->
    <v-dialog v-model="dialogNuevaOrden" max-width="1800" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-plus-circle</v-icon>
          <span>Nueva Orden</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="cerrarDialogNuevaOrden" />
        </v-card-title>
        <v-card-text>
          <FormOrden @ordenGuardada="ordenGuardada" />
        </v-card-text>
      </v-card>
    </v-dialog>

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

<script>
import { ref, onMounted } from 'vue'
import FormOrden from '@/components/ordenes/FormOrden.vue'
import ListaOrdenes from '@/components/ordenes/ListaOrdenes.vue'

export default {
  name: 'OrdenesView',
  components: {
    FormOrden,
    ListaOrdenes
  },
  setup() {
    const vistaActual = ref('inicio')
    const dialogNuevaOrden = ref(false)
    const ordenes = ref([])
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    async function cargarOrdenes() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/ordenes/all`)
        ordenes.value = await res.json()
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
      dialogNuevaOrden.value = true
    }

    function cerrarDialogNuevaOrden() {
      dialogNuevaOrden.value = false
    }

    function ordenGuardada(nuevaOrden) {
      ordenes.value.unshift(nuevaOrden)
      cerrarDialogNuevaOrden()
      mostrarNotificacion('Orden guardada exitosamente')
    }

    onMounted(() => {
      cargarOrdenes()
    })

    return {
      vistaActual,
      ordenes,
      snackbar,
      dialogNuevaOrden,
      cambiarVista,
      mostrarNotificacion,
      abrirDialogNuevaOrden,
      cerrarDialogNuevaOrden,
      ordenGuardada
    }
  }
}
</script>

<style scoped>
.ordenes-view {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.welcome-card {
  background: linear-gradient(135deg, #ffeef8 0%, #f0f4ff 100%);
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

.list-card {
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
