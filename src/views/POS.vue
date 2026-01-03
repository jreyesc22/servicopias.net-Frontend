<template>
  <v-container fluid class="pos-view pa-4">
    <!-- Header con información -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="3" class="pos-header">
          <v-card-text class="d-flex align-center pa-3">
            <v-icon size="40" color="white" class="mr-3">mdi-point-of-sale</v-icon>
            <div>
              <h2 class="text-h5 text-white font-weight-bold">Punto de Venta</h2>
              <p class="text-caption text-white ma-0">Ventas rápidas con escáner de código de barras</p>
            </div>
            <v-spacer />
            <!-- Estadísticas rápidas -->
            <div class="d-flex gap-2">
              <v-chip size="small" color="white" variant="tonal">
                <v-icon start size="small">mdi-barcode</v-icon>
                {{ estadisticas.escaneados }}
              </v-chip>
              <v-chip size="small" color="success" variant="tonal">
                <v-icon start size="small">mdi-check</v-icon>
                {{ estadisticas.exitosos }}
              </v-chip>
              <v-chip v-if="estadisticas.errores > 0" size="small" color="error" variant="tonal">
                <v-icon start size="small">mdi-alert</v-icon>
                {{ estadisticas.errores }}
              </v-chip>
              <v-divider vertical class="mx-2" color="white"></v-divider>
              <v-chip color="white" variant="outlined">
                <v-icon start>mdi-clock-outline</v-icon>
                {{ horaActual }}
              </v-chip>
              <v-chip color="white" variant="outlined">
                <v-icon start>mdi-account</v-icon>
                {{ nombreEmpleado }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Columna izquierda: Scanner y productos populares -->
      <v-col cols="12" md="7">
        <!-- Scanner de código de barras -->
        <ScannerInput
          ref="scannerRef"
          :procesando="cargando"
          :mostrar-estadisticas="true"
          @codigo-escaneado="buscarProductoPorCodigo"
          class="mb-4"
        />

        <!-- Productos populares -->
        <ProductosPopulares
          :productos="productosPopulares"
          :cargando="cargandoPopulares"
          @producto-seleccionado="agregarProductoPopular"
        />
      </v-col>

      <!-- Columna derecha: Carrito -->
      <v-col cols="12" md="5">
        <CarritoPOS
          :items="carrito"
          :descuento="0"
          @actualizar-cantidad="actualizarCantidad"
          @eliminar-item="eliminarDelCarrito"
          @vaciar-carrito="vaciarCarrito"
          @procesar-venta="abrirDialogPago"
        />
      </v-col>
    </v-row>

    <!-- Dialog de pago con abono -->
    <AbonarOrdenPOS
      v-if="ordenTemporal"
      v-model="dialogAbono"
      :orden="ordenTemporal"
      :empleado-id="empleadoId"
      :tipos-de-pago="tiposDePago"
      :efectivo-id="efectivoId"
      @abono-registrado="manejarAbonoRegistrado"
      @cancelar="cancelarPago"
    />

    <!-- Snackbar de notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog de éxito -->
    <v-dialog v-model="dialogExito" max-width="500" persistent>
      <v-card>
        <v-card-text class="text-center pa-8">
          <v-icon size="80" color="success" class="mb-4">
            mdi-check-circle
          </v-icon>
          <h2 class="text-h5 mb-2">¡Venta Exitosa!</h2>
          <p class="text-subtitle-1 text-grey-darken-1">
            La venta se ha procesado correctamente
          </p>
          <v-divider class="my-4" />
          <div class="text-left">
            <p class="mb-1"><strong>Total:</strong> Q {{ formatMoney(ultimaVenta.total) }}</p>
            <p class="mb-1"><strong>Orden #:</strong> {{ ultimaVenta.ordenId }}</p>
            <p v-if="ultimaVenta.efectivoRecibido" class="mb-1">
              <strong>Efectivo recibido:</strong> Q {{ formatMoney(ultimaVenta.efectivoRecibido) }}
            </p>
            <p v-if="ultimaVenta.cambio > 0" class="mb-1 text-success">
              <strong>Cambio:</strong> Q {{ formatMoney(ultimaVenta.cambio) }}
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-printer"
            @click="imprimirTicket"
          >
            Imprimir Ticket
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            prepend-icon="mdi-cart-plus"
            @click="nuevaVenta"
          >
            Nueva Venta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { usePOS } from '@/components/composables/usePOS';
import POSService from '@/services/pos.service';
import ordenesService from '@/services/ordenes.service';
import ScannerInput from '@/components/pos/ScannerInput.vue';
import CarritoPOS from '@/components/pos/CarritoPOS.vue';
import AbonarOrdenPOS from '@/components/pos/AbonarOrdenPOS.vue';
import ProductosPopulares from '@/components/pos/ProductosPopulares.vue';
import tipoPagoService from '@/services/tipo_pago.service';

// Composable del POS
const {
  carrito,
  cargando,
  error,
  cliente,
  subtotal,
  cantidadItems,
  total,
  buscarPorCodigo,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  crearOrdenPOS
} = usePOS();

// Referencias
const scannerRef = ref(null);

// Estado local
const dialogAbono = ref(false);
const dialogExito = ref(false);
const productosPopulares = ref([]);
const cargandoPopulares = ref(false);
const tiposDePago = ref([]);
const efectivoId = ref(1);
const horaActual = ref('');
const nombreEmpleado = ref('');
const empleadoId = ref(null);

// Orden temporal (creada antes del abono)
const ordenTemporal = ref(null);

// Estadísticas del escáner
const estadisticas = ref({
  escaneados: 0,
  exitosos: 0,
  errores: 0
});

// Última venta procesada
const ultimaVenta = ref({
  total: 0,
  ordenId: null
});

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'info',
  icon: 'mdi-information'
});

/**
 * Buscar producto por código de barras
 */
const buscarProductoPorCodigo = async (codigo) => {
  const resultado = await buscarPorCodigo(codigo);
  
  // Actualizar estadísticas
  estadisticas.value.escaneados++;
  if (resultado.success) {
    estadisticas.value.exitosos++;
  } else {
    estadisticas.value.errores++;
  }
  
  if (scannerRef.value) {
    scannerRef.value.actualizarResultado(resultado);
  }
};

/**
 * Cargar productos más vendidos
 */
const cargarProductosPopulares = async () => {
  try {
    cargandoPopulares.value = true;
    const response = await POSService.obtenerProductosMasVendidos(15);
    productosPopulares.value = response.productos || [];
  } catch (error) {
    console.error('Error al cargar productos populares:', error);
    mostrarNotificacion('Error al cargar productos populares', 'error', 'mdi-alert');
  } finally {
    cargandoPopulares.value = false;
  }
};

/**
 * Agregar producto popular al carrito
 */
const agregarProductoPopular = (producto) => {
  try {
    // Crear objeto con formato esperado por agregarAlCarrito
    const productoFormateado = {
      id: producto.producto_id,
      nombre: producto.producto_nombre,
      precio: parseFloat(producto.precio_unitario),
      codigo_barras: producto.codigo_barras || '',
      stock: producto.stock || 0,
      imagen_url: producto.imagen_url || null,
      descripcion: producto.descripcion || ''
    };
    
    const resultado = agregarAlCarrito(productoFormateado, 1);
    
    if (resultado.sumado) {
      mostrarNotificacion(`${producto.producto_nombre} - Cantidad: ${resultado.cantidadTotal}`, 'success', 'mdi-check');
    } else {
      mostrarNotificacion(`${producto.producto_nombre} agregado al carrito`, 'success', 'mdi-check');
    }
  } catch (error) {
    console.error('Error al agregar producto:', error);
    mostrarNotificacion('Error al agregar producto', 'error', 'mdi-alert');
  }
};

/**
 * Abrir dialog de pago (ahora crea orden primero)
 */
const abrirDialogPago = async () => {
  if (carrito.value.length === 0) {
    mostrarNotificacion('El carrito está vacío', 'warning', 'mdi-alert');
    return;
  }

  // Validar que hay empleado logueado
  if (!empleadoId.value) {
    mostrarNotificacion('No hay empleado activo. Por favor inicie sesión.', 'error', 'mdi-account-alert');
    return;
  }

  // Paso 1: Crear orden sin pago
  const resultado = await crearOrdenPOS();
  
  if (resultado.success) {
    // Guardar orden temporal con saldo_pendiente
    ordenTemporal.value = {
      ...resultado.orden,
      saldo_pendiente: resultado.orden.total,
      abonado: 0
    };
    
    console.log('✅ Orden creada:', ordenTemporal.value.id, 'Total:', ordenTemporal.value.total);
    
    // Paso 2: Abrir dialog para abonar
    dialogAbono.value = true;
  } else {
    mostrarNotificacion(resultado.message, 'error', 'mdi-alert-circle');
  }
};

/**
 * Manejar abono registrado (después de crear orden)
 */
const manejarAbonoRegistrado = (datosAbono) => {
  dialogAbono.value = false;

  // Actualizar última venta
  ultimaVenta.value = {
    total: ordenTemporal.value.total,
    ordenId: ordenTemporal.value.id,
    cambio: datosAbono.cambio,
    efectivoRecibido: datosAbono.efectivoRecibido,
    tipoPago: datosAbono.tipoPago,
    ordenCompletada: datosAbono.ordenCompletada
  };

  // Limpiar carrito y mostrar éxito
  vaciarCarrito();
  dialogExito.value = true;
  
  // Reiniciar estadísticas del scanner
  if (scannerRef.value) {
    scannerRef.value.reiniciarEstadisticas();
  }

  // Limpiar orden temporal
  ordenTemporal.value = null;
};

/**
 * Cancelar pago
 */
/**
 * Cancelar pago y eliminar orden
 */
const cancelarPago = async () => {
  if (!ordenTemporal.value?.id) {
    dialogAbono.value = false;
    return;
  }

  try {
    // Eliminar orden de la base de datos
    await ordenesService.delete(ordenTemporal.value.id);
    console.log('Orden eliminada:', ordenTemporal.value.id);
    
    mostrarNotificacion('Pago cancelado. La orden fue eliminada.', 'info', 'mdi-information');
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    mostrarNotificacion('Error al eliminar orden', 'error', 'mdi-alert-circle');
  } finally {
    dialogAbono.value = false;
    ordenTemporal.value = null;
  }
};

/**
 * Nueva venta
 */
const nuevaVenta = () => {
  dialogExito.value = false;
  vaciarCarrito();
  if (scannerRef.value) {
    scannerRef.value.enfocarInput();
  }
};

/**
 * Imprimir ticket (placeholder)
 */
const imprimirTicket = () => {
  mostrarNotificacion('Función de impresión en desarrollo', 'info', 'mdi-information');
  // TODO: Integrar con TicketPrinter.vue
};

/**
 * Mostrar notificación
 */
const mostrarNotificacion = (message, color = 'info', icon = 'mdi-information') => {
  snackbar.value = {
    show: true,
    message,
    color,
    icon
  };
};

/**
 * Formatear dinero
 */
const formatMoney = (valor) => {
  return parseFloat(valor || 0).toFixed(2);
};

/**
 * Actualizar hora actual
 */
const actualizarHora = () => {
  const now = new Date();
  horaActual.value = now.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Cargar tipos de pago
 */
const cargarTiposPago = async () => {
  try {
    tiposDePago.value = await tipoPagoService.getAll();
    // Buscar el ID del efectivo
    const efectivo = tiposDePago.value.find(tp => 
      tp.nombre.toLowerCase().includes('efectivo')
    );
    if (efectivo) {
      efectivoId.value = efectivo.id;
    }
  } catch (err) {
    console.error('Error al cargar tipos de pago:', err);
  }
};

/**
 * Cargar información del empleado
 */
const cargarEmpleado = () => {
  try {
    // Intentar cargar desde 'empleado' primero, luego desde 'user' (fallback)
    let empleadoData = localStorage.getItem('empleado');
    if (!empleadoData) {
      console.log('No se encontró "empleado", intentando con "user"...');
      empleadoData = localStorage.getItem('user');
    }

    if (!empleadoData) {
      console.error('No se encontró información del empleado en localStorage');
      mostrarNotificacion('No se encontró información del empleado. Por favor inicie sesión.', 'error', 'mdi-alert');
      return;
    }

    const empleado = JSON.parse(empleadoData);
    if (!empleado.id || !empleado.nombre) {
      console.error('Datos de empleado incompletos:', empleado);
      mostrarNotificacion('Datos de empleado incompletos. Por favor inicie sesión nuevamente.', 'error', 'mdi-alert');
      return;
    }

    // Si se cargó desde 'user', guardarlo también como 'empleado' para próximas veces
    if (!localStorage.getItem('empleado')) {
      localStorage.setItem('empleado', JSON.stringify(empleado));
      console.log('Empleado guardado en localStorage como "empleado"');
    }

    nombreEmpleado.value = empleado.nombre;
    empleadoId.value = empleado.id;
    
    console.log('✅ Empleado cargado:', { id: empleado.id, nombre: empleado.nombre });
  } catch (err) {
    console.error('Error al cargar empleado:', err);
    nombreEmpleado.value = 'Usuario';
    empleadoId.value = null;
    mostrarNotificacion('Error al cargar información del empleado', 'error', 'mdi-alert');
  }
};

// Intervalo de actualización de hora
let intervaloHora = null;

onMounted(async () => {
  actualizarHora();
  intervaloHora = setInterval(actualizarHora, 1000);
  
  cargarEmpleado();
  await cargarTiposPago();
  await cargarProductosPopulares();
});

onBeforeUnmount(() => {
  if (intervaloHora) {
    clearInterval(intervaloHora);
  }
});
</script>

<style scoped>
.pos-view {
  background: var(--pos-gradient-background);
  min-height: 100vh;
}

.pos-header {
  background: var(--primary-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-large);
  transition: all var(--transition-base);
}

.pos-header:hover {
  box-shadow: var(--shadow-elevated);
  transform: translateY(-2px);
}

:deep(.v-chip--variant-outlined) {
  border-width: 2px;
  transition: all var(--transition-base);
}

:deep(.v-chip--variant-outlined:hover) {
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

:deep(.v-card) {
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);
}

:deep(.v-btn) {
  transition: all var(--transition-base);
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}
</style>
