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
            <!-- Información de Última Venta -->
            <div class="d-flex gap-2 align-center">
              <template v-if="ultimaVenta.ordenId">
                <span class="text-caption text-white mr-2 text-uppercase font-weight-bold">Última Venta:</span>
                <v-chip color="white" variant="outlined" size="small">
                  <v-icon start size="small">mdi-receipt</v-icon>
                  #{{ ultimaVenta.ordenId }}
                </v-chip>
                <v-chip color="success" variant="flat" size="small" class="font-weight-bold">
                  Total: Q{{ formatMoney(ultimaVenta.total) }}
                </v-chip>
                <v-chip v-if="ultimaVenta.cambio !== undefined && ultimaVenta.cambio !== null" color="warning" variant="flat" size="small" class="font-weight-bold text-black">
                  Cambio: Q{{ formatMoney(ultimaVenta.cambio) }}
                </v-chip>
              </template>
              <template v-else>
                <span class="text-caption text-white opacity-70">Aún no hay ventas registradas en esta sesión</span>
              </template>
            </div>
            <!-- Botón para abrir buscador de items -->
            <v-btn class="ml-3" color="white" variant="outlined" @click="posSearchOpen = true">
              <v-icon start size="18">mdi-magnify</v-icon>
              Buscar item
            </v-btn>

            <!-- Botón para editar/ingresar cliente -->
            <v-btn class="ml-2" color="white" variant="outlined" @click="posClientOpen = true">
              <v-icon start size="18">mdi-account-edit</v-icon>
              Cliente
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Vista principal (nueva orden) -->
    <v-row v-if="vistaActual === 'venta'">
      <!-- Columna izquierda: Scanner y productos populares -->
      <v-col cols="12" md="7">
        <ScannerInput
          ref="scannerRef"
          :procesando="cargando"
          :mostrar-estadisticas="true"
          @codigo-escaneado="buscarProductoPorCodigo"
          class="mb-4"
        />

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
          @procesar-venta="iniciarPago"
        />
      </v-col>
    </v-row>

    <!-- Vista de pago (sin modal) -->
    <v-row v-else-if="vistaActual === 'pago'">
      <v-col cols="12" md="8" class="mx-auto">
        <AbonarOrdenPOS
          v-if="ordenTemporal"
          :orden="ordenTemporal"
          :empleado-id="empleadoId"
          :tipos-de-pago="tiposDePago"
          :efectivo-id="efectivoId"
          @abono-registrado="manejarAbonoRegistrado"
          @cancelar="cancelarPago"
        />
      </v-col>
    </v-row>

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

    <!-- Modal reutilizable para búsqueda de items -->
    <PosSearchModal v-model="posSearchOpen" @agregar="agregarDesdeModal" />
    <!-- Modal para editar/ingresar cliente -->
    <PosClientModal v-model="posClientOpen" :initial="cliente" @save="guardarClienteDesdeModal" />

    <!-- (Se elimina el modal de éxito: al terminar el pago retorna a nueva venta) -->
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { usePOS } from '@/components/composables/usePOS';
import POSService from '@/services/pos.service';
import ordenesService from '@/services/ordenes.service';
import { printerService } from '@/services/printer.service';
import { generarContenidoTicket } from '@/utils/ticketTemplate';
import { ESC_POS } from '@/utils/printerCommands';
import ScannerInput from '@/components/pos/ScannerInput.vue';
import CarritoPOS from '@/components/pos/CarritoPOS.vue';
import AbonarOrdenPOS from '@/components/pos/AbonarOrdenPOS.vue';
import ProductosPopulares from '@/components/pos/ProductosPopulares.vue';
import { useTiposPago } from '@/components/composables/useTiposPago';
import PosSearchModal from '@/components/pos/PosSearchModal.vue';
import PosClientModal from '@/components/pos/PosClientModal.vue';

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
const vistaActual = ref('venta'); // 'venta' | 'pago'
const productosPopulares = ref([]);
const cargandoPopulares = ref(false);

// Tipos de pago (estado global compartido)
const { tiposPago, fetchTiposPago } = useTiposPago();
const tiposDePago = computed(() => tiposPago.value);
const efectivoId = ref(1);

watch(
  tiposPago,
  (lista) => {
    if (!Array.isArray(lista) || lista.length === 0) return;
    const efectivo = lista.find(tp => String(tp?.nombre || '').toLowerCase().includes('efectivo'));
    if (efectivo?.id != null) {
      const idNum = Number(efectivo.id);
      if (Number.isFinite(idNum)) {
        efectivoId.value = idNum;
      }
    }
  },
  { immediate: true }
);
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

// Modal buscador reutilizable
const posSearchOpen = ref(false);
// Modal cliente
const posClientOpen = ref(false);

/**
 * Manejar agregar de items desde el modal buscador.
 * La responsabilidad de mutar el carrito la mantiene el composable `usePOS`.
 */
const agregarDesdeModal = (item) => {
  try {
    const productoFormateado = {
      id: item.id || item.producto_id,
      nombre: item.nombre || item.producto_nombre || item.producto_nombre_comercial || 'Sin nombre',
      precio: parseFloat(item.precio_unitario || item.precio || item.precio_unitario_venta || 0),
      codigo_barras: item.codigo_barras || '',
      stock: item.stock || 0,
      imagen_url: item.imagen_url || item.imagen || null,
      descripcion: item.descripcion || ''
    };

    const resultado = agregarAlCarrito(productoFormateado, 1);
    if (resultado && resultado.sumado) {
      mostrarNotificacion(`${productoFormateado.nombre} - Cantidad: ${resultado.cantidadTotal}`, 'success', 'mdi-check');
    } else {
      mostrarNotificacion(`${productoFormateado.nombre} agregado al carrito`, 'success', 'mdi-check');
    }
    posSearchOpen.value = false;
  } catch (err) {
    console.error('Error al agregar desde modal:', err);
    mostrarNotificacion('Error al agregar producto', 'error', 'mdi-alert');
  }
}

/**
 * Manejar guardado de cliente desde modal
 */
const guardarClienteDesdeModal = (clienteNuevo) => {
  try {
    cliente.value = {
      nombre: clienteNuevo.nombre || 'CF',
      telefono: clienteNuevo.telefono || '',
      nit: clienteNuevo.nit || 'CF'
    };
    mostrarNotificacion('Cliente actualizado', 'success', 'mdi-account');
  } catch (err) {
    console.error('Error al guardar cliente:', err);
    mostrarNotificacion('Error al guardar cliente', 'error', 'mdi-alert');
  } finally {
    posClientOpen.value = false;
  }
}

/**
 * Buscar producto por código de barras
 */
const buscarProductoPorCodigo = async (codigo) => {
  try {
    const resultado = await buscarPorCodigo(codigo);

    // Actualizar estadísticas
    estadisticas.value.escaneados++;
    if (resultado.success) {
      estadisticas.value.exitosos++;
    } else {
      estadisticas.value.errores++;
    }

    if (scannerRef.value?.actualizarResultado) {
      scannerRef.value.actualizarResultado(resultado);
    }
  } catch (error) {
    console.error('Error en buscarProductoPorCodigo:', error);
    estadisticas.value.escaneados++;
    estadisticas.value.errores++;
    if (scannerRef.value?.actualizarResultado) {
      scannerRef.value.actualizarResultado({
        success: false,
        message: error?.message || 'Error al buscar producto'
      });
    }
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
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio_unitario),
      codigo_barras: producto.codigo_barras || '',
      stock: producto.stock || 0,
      imagen_url: producto.imagen_url || null,
      descripcion: producto.descripcion || ''
    };
    
    const resultado = agregarAlCarrito(productoFormateado, 1);
    
    if (resultado.sumado) {
      mostrarNotificacion(`${producto.nombre} - Cantidad: ${resultado.cantidadTotal}`, 'success', 'mdi-check');
    } else {
      mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success', 'mdi-check');
    }
  } catch (error) {
    console.error('Error al agregar producto:', error);
    mostrarNotificacion('Error al agregar producto', 'error', 'mdi-alert');
  }
};

/**
 * Abrir dialog de pago (ahora crea orden primero)
 */
const iniciarPago = async () => {
  if (carrito.value.length === 0) {
    mostrarNotificacion('El carrito está vacío', 'warning', 'mdi-alert');
    return;
  }

  // Validar que hay empleado logueado
  if (!empleadoId.value) {
    mostrarNotificacion('No hay empleado activo. Por favor inicie sesión.', 'error', 'mdi-account-alert');
    return;
  }

  try {
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

      // Paso 2: Ir a vista de pago (sin modal)
      vistaActual.value = 'pago';
    } else {
      mostrarNotificacion(resultado.message, 'error', 'mdi-alert-circle');
    }
  } catch (error) {
    console.error('Error al abrir dialog de pago:', error);
    mostrarNotificacion(error?.message || 'Error al procesar la venta', 'error', 'mdi-alert-circle');
  }
};

/**
 * Manejar abono registrado (después de crear orden)
 */
const manejarAbonoRegistrado = async (datosAbono) => {
  try {
    console.info('[POS] ✅ Abono registrado, iniciando cierre de modal de pago', {
      ordenId: ordenTemporal.value?.id,
      total: ordenTemporal.value?.total,
      tipoPago: datosAbono?.tipoPago,
      monto: datosAbono?.monto,
      ordenCompletada: datosAbono?.ordenCompletada
    });

    // Mantener el pago visible hasta que termine el procesamiento.
    // Luego retornamos a la vista de nueva venta.

    // Actualizar última venta
    ultimaVenta.value = {
      total: ordenTemporal.value?.total || 0,
      ordenId: ordenTemporal.value?.id || null,
      cambio: datosAbono?.cambio,
      efectivoRecibido: datosAbono?.efectivoRecibido,
      tipoPago: datosAbono?.tipoPago,
      ordenCompletada: datosAbono?.ordenCompletada,
      orden: ordenTemporal.value ? { ...ordenTemporal.value } : null
    };

    // Limpiar carrito y retornar a nueva venta
    vaciarCarrito();

    mostrarNotificacion(
      `Venta procesada. Orden #${ultimaVenta.value.ordenId} - Total Q ${formatMoney(ultimaVenta.value.total)}`,
      'success',
      'mdi-check'
    );

    if (datosAbono?.printerWarning) {
      mostrarNotificacion(datosAbono.printerWarning, 'warning', 'mdi-printer-alert');
    }

    // Reiniciar estadísticas del scanner
    if (scannerRef.value?.reiniciarEstadisticas) {
      scannerRef.value.reiniciarEstadisticas();
    }

    // Limpiar orden temporal
    ordenTemporal.value = null;

    // Volver a la vista principal
    vistaActual.value = 'venta';
    await nextTick();
    if (scannerRef.value) {
      scannerRef.value.enfocarInput?.();
    }
  } catch (error) {
    console.error('[POS] Error en manejarAbonoRegistrado:', error);
    mostrarNotificacion(error?.message || 'Error al finalizar el cobro', 'error', 'mdi-alert');
  }
};

/**
 * Cancelar pago
 */
/**
 * Cancelar pago y eliminar orden
 */
const cancelarPago = async () => {
  if (!ordenTemporal.value?.id) {
    vistaActual.value = 'venta';
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
    ordenTemporal.value = null;
    vistaActual.value = 'venta';
  }
};

/**
 * Nueva venta
 */
const nuevaVenta = () => {
  vaciarCarrito();
  if (scannerRef.value) {
    scannerRef.value.enfocarInput();
  }
};

/**
 * Imprimir ticket
 */
const imprimirTicket = async () => {
  if (!ultimaVenta.value?.orden) {
    mostrarNotificacion('No hay datos de venta para imprimir', 'warning', 'mdi-alert');
    return;
  }

  try {
    mostrarNotificacion('Imprimiendo ticket...', 'info', 'mdi-printer');
    
    // Preparar datos de pago para el template
    const datosPago = {
      monto_pagado: ultimaVenta.value.efectivoRecibido || ultimaVenta.value.total,
      vuelto: ultimaVenta.value.cambio || 0,
      forma_pago: ultimaVenta.value.tipoPago
    };

    // Generar texto del ticket
    const contenidoTicket = generarContenidoTicket(ultimaVenta.value.orden, datosPago);
    
    // Combinar con comandos ESC/POS
    const ticketRaw = 
      ESC_POS.INIT +
      ESC_POS.ALIGN_CENTER +
      contenidoTicket +
      ESC_POS.FEED_LINES(4) +
      ESC_POS.CUT_FULL;

    // Enviar a imprimir
    const resultado = await printerService.imprimirRaw(ticketRaw);
    if (resultado && resultado.success === false) {
      throw new Error(resultado.error || 'Error al imprimir');
    }

    mostrarNotificacion('Ticket impreso correctamente', 'success', 'mdi-check');
  } catch (error) {
    console.error('Error al imprimir:', error);
    mostrarNotificacion('Error al imprimir ticket: ' + error.message, 'error', 'mdi-alert');
  }
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
  await fetchTiposPago();
  await cargarProductosPopulares();
});

onBeforeUnmount(() => {
  if (intervaloHora) {
    clearInterval(intervaloHora);
  }
});
</script>

 style scoped <style scoped>
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
