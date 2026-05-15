<template>
  <v-container class="inventario-view" fluid>
    <!-- ENCABEZADO CON ACCIONES RÁPIDAS -->
    <v-fade-transition mode="out-in">
      <v-card v-if="vistaActual === 'inicio'" class="welcome-card mb-6" elevation="2">
      <v-card-text class="text-center pa-8">
        <v-icon size="80" color="primary" class="mb-4">mdi-store</v-icon>
        <h2 class="text-h4 mb-2">¡Bienvenido al Sistema de Inventario!</h2>
        <p class="text-h6 text-grey-darken-1 mb-6">
          Gestiona tus productos y servicios de manera eficiente
        </p>
        <v-row justify="center">
          <v-col cols="12" md="4">
            <v-card class="quick-action-card" @click="cambiarVista('nuevo')" hover>
              <v-card-text class="d-flex align-center">
                <v-icon size="40" color="success" class="mr-4">mdi-plus-box</v-icon>
                <div>
                  <h4 class="text-h6">Nuevo Ítem</h4>
                  <p class="text-body-2 text-grey-darken-1">Agregar producto o servicio</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="quick-action-card" @click="cambiarVista('lista')" hover>
              <v-card-text class="d-flex align-center">
                <v-icon size="40" color="info" class="mr-4">mdi-format-list-bulleted</v-icon>
                <div>
                  <h4 class="text-h6">Ver Inventario Completo</h4>
                  <p class="text-body-2 text-grey-darken-1">Explora todos los productos y servicios</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="quick-action-card" @click="cambiarVista('categorias')" hover>
              <v-card-text class="d-flex align-center">
                <v-icon size="40" color="purple" class="mr-4">mdi-tag-multiple</v-icon>
                <div>
                  <h4 class="text-h6">Categorías</h4>
                  <p class="text-body-2 text-grey-darken-1">Organiza tus productos por categorías</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    </v-fade-transition>

   
    <!-- Vistas dinámicas debajo del encabezado -->
    <v-fade-transition mode="out-in">
      <div v-if="vistaActual === 'nuevo'" key="nuevo">
        <v-card class="form-card" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" color="success">mdi-plus-box</v-icon>
            <span>{{ itemSeleccionado ? 'Editar Item' : 'Nuevo Item' }}</span>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="cerrarFormulario" />
          </v-card-title>
          <v-card-text>
            <FormProductoServicio 
              :item="itemSeleccionado"
              @guardar="itemGuardado"
              @cerrar="cerrarFormulario"
            />
          </v-card-text>
        </v-card>
      </div>

      <div v-else-if="vistaActual === 'lista'" key="lista">
        <v-card class="list-card" elevation="2">
          <v-card-title class="d-flex align-center">
            
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="cambiarVista('inicio')" />
          </v-card-title>
          <v-card-text>
            <ListaProductos 
              :items="items"
              @editar="editarItem"
              @eliminar="eliminarItem"
            />
          </v-card-text>
        </v-card>
      </div>

      <div v-else-if="vistaActual === 'categorias'" key="categorias">
        <v-card class="categories-card" elevation="2">
          <v-card-title class="d-flex align-center">
           
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="cambiarVista('inicio')" />
          </v-card-title>
         <v-card-text>
  <CategoriaForm @cerrar="cambiarVista('inicio')" />
</v-card-text>

        </v-card>
      </div>
    </v-fade-transition>

    <!-- Snackbar de notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="bottom">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import FormProductoServicio from '@/components/inventario/FormProductoServicio.vue'
import ListaProductos from '@/components/inventario/ListaProductos.vue'
import CategoriaForm from './CategoriaForm.vue'
import axios from 'axios'

// Estados reactivos
const vistaActual = ref('inicio')
const items = ref([])
const itemSeleccionado = ref(null)
const loading = ref(false)

// Snackbar para notificaciones
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// URL de la API
const apiUrl = `${process.env.VUE_APP_API_URL}/items`

// Computed properties para estadísticas
const totalProductos = computed(() => 
  items.value.filter(item => item.tipo === 'producto').length
)

const totalServicios = computed(() => 
  items.value.filter(item => item.tipo === 'servicio').length
)

const stockBajo = computed(() => 
  items.value.filter(item => 
    item.tipo === 'producto' && 
    item.stock !== undefined && 
    item.stock < (item.stock_minimo || 10)
  ).length
)

const valorInventario = computed(() => {
  return items.value
    .filter(item => item.tipo === 'producto')
    .reduce((total, item) => {
      const precio = Number(item.precio) || 0
      const stock = Number(item.stock) || 0
      return total + (precio * stock)
    }, 0)
    .toFixed(2)
})

// Breadcrumbs dinámicos
const breadcrumbs = computed(() => {
  const itemsList = [
    { text: 'Inicio', icon: 'mdi-home', disabled: false }
  ]
  
  if (vistaActual.value === 'nuevo') {
    itemsList.push({ 
      text: itemSeleccionado.value ? 'Editar Item' : 'Nuevo Item', 
      icon: 'mdi-plus-box',
      disabled: true
    })
  } else if (vistaActual.value === 'lista') {
    itemsList.push({ 
      text: 'Lista de Items', 
      icon: 'mdi-format-list-bulleted',
      disabled: true
    })
  } else if (vistaActual.value === 'categorias') {
    itemsList.push({ 
      text: 'Categorías', 
      icon: 'mdi-tag-multiple',
      disabled: true
    })
  }
  
  return itemsList
})

// Funciones
function cambiarVista(vista) {
  vistaActual.value = vista
  
  // Limpiar item seleccionado al cambiar vista
  if (vista !== 'nuevo') {
    itemSeleccionado.value = null
  }
  
  // Mostrar notificación
  const mensajes = {
    'nuevo': 'Formulario de nuevo item activado',
    'lista': 'Lista de inventario cargada',
    'categorias': 'Gestión de categorías activada'
  }
  
  if (mensajes[vista]) {
    mostrarNotificacion(mensajes[vista], 'info')
  }
}

function mostrarNotificacion(mensaje, color = 'success') {
  snackbar.value = {
    show: true,
    message: mensaje,
    color: color
  }
}

async function cargarItems() {
  loading.value = true
  try {
    const response = await axios.get(`${apiUrl}/all`)
    items.value = response.data
    mostrarNotificacion(`${response.data.length} items cargados exitosamente`)
  } catch (error) {
    console.error('Error al cargar productos:', error)
    mostrarNotificacion('Error al cargar los items', 'error')
  } finally {
    loading.value = false
  }
}

function itemGuardado() {
  cargarItems()
  cerrarFormulario()
  mostrarNotificacion('Item guardado exitosamente', 'success')
}

function editarItem(item) {
  itemSeleccionado.value = { ...item }
  vistaActual.value = 'nuevo'
  mostrarNotificacion('Item cargado para edición', 'info')
}

async function eliminarItem(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este item?')) {
    try {
      await axios.delete(`${apiUrl}/${id}`)
      cargarItems()
      mostrarNotificacion('Item eliminado exitosamente', 'success')
    } catch (error) {
      console.error('Error al eliminar item:', error)
      mostrarNotificacion('Error al eliminar el item', 'error')
    }
  }
}

function cerrarFormulario() {
  vistaActual.value = 'inicio'
  itemSeleccionado.value = null
}

// Lifecycle
onMounted(() => {
  cargarItems()
})
</script>

<style scoped>
.inventario-view {
  padding: var(--spacing-lg, 24px);
  background: var(--background-light, #FAFBFC);
  min-height: 100vh;
}

.header-card {
  background: var(--gradient-primary, linear-gradient(135deg, #1976d2 0%, #1565c0 100%));
  color: var(--surface-color, white);
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.action-card {
  transition: all var(--transition-base, 0.3s ease);
  cursor: pointer;
  border: 2px solid transparent;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover, 0 12px 40px rgba(21, 101, 192, 0.15));
}

.action-card.active {
  border-color: var(--primary-color, #1976D2);
  background: var(--background-gradient, linear-gradient(135deg, #F8FAFC 0%, #E3F2FD 100%));
}

.stats-card {
  transition: all var(--transition-base, 0.3s ease);
}

.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium, 0 8px 32px rgba(21, 101, 192, 0.12));
}

.welcome-card {
  background: var(--surface-elevated, #F8FAFC);
  border-radius: var(--border-radius-lg, 16px);
  box-shadow: var(--shadow-sm, 0 4px 12px rgba(21, 101, 192, 0.06));
}

.quick-action-card {
  transition: all var(--transition-base, 0.3s ease);
  cursor: pointer;
  border-radius: var(--border-radius, 12px);
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm, 0 4px 15px rgba(0,0,0,0.1));
}

.form-card, .list-card, .categories-card {
  border-radius: var(--border-radius-lg, 16px);
  box-shadow: var(--shadow-medium, 0 8px 32px rgba(21, 101, 192, 0.12));
}

.v-fade-transition-enter-active,
.v-fade-transition-leave-active {
  transition: opacity var(--transition-base, 0.3s ease);
}

.v-fade-transition-enter-from,
.v-fade-transition-leave-to {
  opacity: 0;
}
</style>