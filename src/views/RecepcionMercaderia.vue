<template>
  <v-container class="recepcion-view pa-4" fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="3" class="bg-primary text-white">
          <v-card-text class="d-flex align-center pa-3">
            <v-icon size="40" color="white" class="mr-3">mdi-truck-delivery</v-icon>
            <div>
              <h2 class="text-h5 font-weight-bold">Recepción de Mercadería</h2>
              <p class="text-caption ma-0">Escanear productos para surtir el inventario</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <!-- Scanner -->
        <ScannerInput
          ref="scannerRef"
          :procesando="cargando"
          :mostrar-estadisticas="true"
          @codigo-escaneado="manejarEscaneo"
        />
        
        <v-alert
          type="info"
          variant="tonal"
          class="mt-4"
          icon="mdi-information"
        >
          Escanee los códigos de barras. Si el producto existe, se agregará a la lista para sumar stock. Si no existe, podrá crearlo rápidamente.
        </v-alert>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="3">
          <v-card-title class="bg-grey-lighten-4 d-flex justify-space-between align-center">
            <span>Lista de Recepción</span>
            <v-chip color="primary" variant="flat">{{ itemsRecepcion.length }} items</v-chip>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table v-if="itemsRecepcion.length > 0" density="comfortable">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th class="text-center">Cant. a Recibir</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsRecepcion" :key="item.id">
                  <td>
                    <div class="font-weight-bold">{{ item.nombre }}</div>
                    <div class="text-caption text-grey">{{ item.codigo_barras }}</div>
                  </td>
                  <td>
                    <v-chip size="small" :color="item.stock > 0 ? 'success' : 'error'">
                      {{ item.stock }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <div class="d-flex align-center justify-center">
                      <v-btn icon="mdi-minus" size="x-small" variant="tonal" color="error" @click="decrementar(item)" :disabled="item.cantidad <= 1"></v-btn>
                      <span class="mx-3 font-weight-bold">{{ item.cantidad }}</span>
                      <v-btn icon="mdi-plus" size="x-small" variant="tonal" color="success" @click="incrementar(item)"></v-btn>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removerItem(item.id)"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div v-else class="pa-8 text-center text-grey">
              <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-package-variant-closed</v-icon>
              <p>No hay productos en la lista de recepción.</p>
            </div>
          </v-card-text>
          <v-card-actions v-if="itemsRecepcion.length > 0" class="pa-4 bg-grey-lighten-4">
            <v-btn color="error" variant="text" @click="limpiarLista">Limpiar</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="success" variant="elevated" @click="procesarRecepcion" :loading="procesando">
              Procesar Recepción
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal Formulario Producto Nuevo -->
    <v-dialog v-model="modalNuevoProducto" max-width="800" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white d-flex justify-space-between align-center">
          <span>Crear Nuevo Producto</span>
          <v-btn icon="mdi-close" variant="text" @click="cerrarModalNuevoProducto"></v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert type="warning" variant="tonal" class="mb-4" density="compact">
            El código escaneado <strong>{{ codigoDesconocido }}</strong> no existe. Complete el formulario para crearlo.
          </v-alert>
          <FormProductoServicio 
            :item="nuevoItemModel"
            @guardar="onProductoCreado"
            @cerrar="cerrarModalNuevoProducto"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import ScannerInput from '@/components/pos/ScannerInput.vue';
import POSService from '@/services/pos.service';
import apiService from '@/services/api.service';
import FormProductoServicio from '@/components/inventario/FormProductoServicio.vue';

// Referencias
const scannerRef = ref(null);
const cargando = ref(false);
const procesando = ref(false);

// Estado de la recepción
const itemsRecepcion = ref([]);

// Estado del Modal de Producto Nuevo
const modalNuevoProducto = ref(false);
const codigoDesconocido = ref('');
const nuevoItemModel = ref(null);

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const mostrarNotificacion = (msg, color = 'success') => {
  snackbar.value = { show: true, message: msg, color };
};

// Manejar el escaneo del código
const manejarEscaneo = async (codigo) => {
  if (!codigo) return;
  
  cargando.value = true;
  try {
    const response = await POSService.buscarPorCodigoBarras(codigo);
    
    if (response.encontrado && response.item) {
      // Producto existe, agregarlo a la lista de recepción
      agregarALista(response.item);
      scannerRef.value?.actualizarResultado({
        success: true,
        message: `${response.item.nombre} listo para recibir`
      });
    } else {
      // Producto NO existe, abrir modal para crearlo
      scannerRef.value?.actualizarResultado({
        success: false,
        message: 'Producto no encontrado'
      });
      codigoDesconocido.value = codigo;
      nuevoItemModel.value = {
        codigo_barras: codigo,
        tipo: 'producto',
        stock: 0
      };
      modalNuevoProducto.value = true;
    }
  } catch (error) {
    console.error('Error al buscar código:', error);
    scannerRef.value?.actualizarResultado({
      success: false,
      message: 'Error de conexión'
    });
    mostrarNotificacion('Error al buscar producto', 'error');
  } finally {
    cargando.value = false;
  }
};

const agregarALista = (item) => {
  const existente = itemsRecepcion.value.find(i => i.id === item.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    itemsRecepcion.value.push({
      ...item,
      cantidad: 1
    });
  }
};

const incrementar = (item) => { item.cantidad++; };
const decrementar = (item) => { if (item.cantidad > 1) item.cantidad--; };
const removerItem = (id) => {
  itemsRecepcion.value = itemsRecepcion.value.filter(i => i.id !== id);
};

const limpiarLista = () => {
  itemsRecepcion.value = [];
};

const procesarRecepcion = async () => {
  if (itemsRecepcion.value.length === 0) return;
  
  procesando.value = true;
  let errores = 0;
  
  try {
    for (const item of itemsRecepcion.value) {
      const nuevoStock = (Number(item.stock) || 0) + Number(item.cantidad);
      try {
        await apiService.put(`/items/${item.id}`, { stock: nuevoStock });
      } catch (err) {
        console.error(`Error al actualizar item ${item.id}:`, err);
        errores++;
      }
    }
    
    if (errores === 0) {
      mostrarNotificacion('Recepción procesada exitosamente', 'success');
      limpiarLista();
    } else {
      mostrarNotificacion(`Recepción parcial: Hubo error en ${errores} items`, 'warning');
    }
  } catch (error) {
    console.error('Error en procesar recepción:', error);
    mostrarNotificacion('Error al procesar la recepción', 'error');
  } finally {
    procesando.value = false;
    scannerRef.value?.enfocarInput();
  }
};

const cerrarModalNuevoProducto = () => {
  modalNuevoProducto.value = false;
  codigoDesconocido.value = '';
  nuevoItemModel.value = null;
  setTimeout(() => scannerRef.value?.enfocarInput(), 100);
};

const onProductoCreado = async (itemGuardado) => {
  mostrarNotificacion('Producto creado. Agregando a la recepción...', 'success');
  try {
    if (itemGuardado && itemGuardado.id) {
      agregarALista({ ...itemGuardado, cantidad: 1 });
      mostrarNotificacion(`${itemGuardado.nombre} agregado a la lista de recepción`, 'success');
    } else {
      // Fallback: intentar recuperar el producto recién creado por su código de barras
      const codigo = nuevoItemModel.value?.codigo_barras || codigoDesconocido.value;
      if (codigo) {
        const resp = await POSService.buscarPorCodigoBarras(codigo);
        if (resp && resp.encontrado && resp.item) {
          agregarALista(resp.item);
          mostrarNotificacion(`${resp.item.nombre} agregado a la lista de recepción`, 'success');
        } else {
          mostrarNotificacion('Producto creado. Escanee el código para agregarlo.', 'info');
        }
      }
    }
  } catch (err) {
    console.error('Error al recuperar producto creado:', err);
    mostrarNotificacion('Producto creado, pero no se pudo agregar automáticamente', 'warning');
  } finally {
    cerrarModalNuevoProducto();
  }
};
</script>

<style scoped>
.recepcion-view {
  max-width: 1200px;
  margin: 0 auto;
}
</style>