import { ref, computed, watch } from 'vue';
import POSService from '@/services/pos.service';
import AuthService from '@/services/auth.service';

/**
 * Composable para gestionar el carrito y lógica del POS
 */
export function usePOS() {
  // Estado del carrito
  const carrito = ref([]);
  const cargando = ref(false);
  const error = ref(null);
  const ultimoCodigoEscaneado = ref('');

  // Estados para búsqueda manual
  const productos = ref([]);
  const busquedaTexto = ref('');

  // Datos del cliente
  const cliente = ref({
    nombre: 'CF',
    telefono: '',
    nit: 'CF'
  });

  /**
   * Cálculos del carrito
   */
  const subtotal = computed(() => {
    return carrito.value.reduce((sum, item) => {
      return sum + (parseFloat(item.precio) * item.cantidad);
    }, 0);
  });

  const cantidadItems = computed(() => {
    return carrito.value.reduce((sum, item) => sum + item.cantidad, 0);
  });

  const total = computed(() => subtotal.value);

  /**
   * Buscar producto por código de barras
   */
  const buscarPorCodigo = async (codigo) => {
    if (!codigo || codigo.trim() === '') {
      return { success: false, message: 'Código vacío' };
    }

    try {
      cargando.value = true;
      error.value = null;
      ultimoCodigoEscaneado.value = codigo;

      const response = await POSService.buscarPorCodigoBarras(codigo);
      
      if (response.encontrado && response.item) {
        const resultado = agregarAlCarrito(response.item);
        
        let mensaje = '';
        if (resultado.sumado) {
          mensaje = `${response.item.nombre} - Cantidad: ${resultado.cantidadTotal}`;
        } else {
          mensaje = `${response.item.nombre} agregado al carrito`;
        }
        
        return { 
          success: true, 
          message: mensaje,
          item: response.item,
          cantidadTotal: resultado.cantidadTotal
        };
      } else {
        error.value = 'Producto no encontrado';
        return { 
          success: false, 
          message: 'Producto no encontrado' 
        };
      }
    } catch (err) {
      error.value = err.message || 'Error al buscar producto';
      return { 
        success: false, 
        message: error.value 
      };
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Agregar producto al carrito
   */
  const agregarAlCarrito = (producto, cantidad = 1) => {
    const itemExistente = carrito.value.find(item => item.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      return { agregado: false, sumado: true, cantidadTotal: itemExistente.cantidad };
    } else {
      carrito.value.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        cantidad: cantidad,
        codigo_barras: producto.codigo_barras,
        stock: producto.stock,
        imagen_url: producto.imagen_url,
        descripcion: producto.descripcion
      });
      return { agregado: true, sumado: false, cantidadTotal: cantidad };
    }
  };

  /**
   * Actualizar cantidad de un item
   */
  const actualizarCantidad = (itemId, nuevaCantidad) => {
    const item = carrito.value.find(i => i.id === itemId);
    if (item) {
      if (nuevaCantidad <= 0) {
        eliminarDelCarrito(itemId);
      } else {
        item.cantidad = nuevaCantidad;
      }
    }
  };

  /**
   * Eliminar item del carrito
   */
  const eliminarDelCarrito = (itemId) => {
    const index = carrito.value.findIndex(item => item.id === itemId);
    if (index !== -1) {
      carrito.value.splice(index, 1);
    }
  };

  /**
   * Vaciar carrito completamente
   */
  const vaciarCarrito = () => {
    carrito.value = [];
    cliente.value = {
      nombre: 'CF',
      telefono: '',
      nit: 'CF'
    };
    error.value = null;
  };

  /**
   * Cargar productos para búsqueda manual
   */
  const cargarProductos = async () => {
    try {
      cargando.value = true;
      productos.value = await POSService.obtenerProductos();
    } catch (err) {
      error.value = err.message;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Buscar productos por texto
   */
  const buscarProductosTexto = async (texto) => {
    try {
      cargando.value = true;
      productos.value = await POSService.buscarProductos(texto);
    } catch (err) {
      error.value = err.message;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Crear orden sin pago (paso 1 del flujo POS)
   */
  const crearOrdenPOS = async () => {
    if (carrito.value.length === 0) {
      return { 
        success: false, 
        message: 'El carrito está vacío' 
      };
    }

    try {
      cargando.value = true;
      error.value = null;

      const empleado = AuthService.getCurrentEmpleado();

      if (!empleado) {
        throw new Error('No se encontró información del empleado. Por favor inicie sesión nuevamente.');
      }

      if (!empleado.id) {
        throw new Error('ID de empleado no válido. Por favor inicie sesión nuevamente.');
      }

      // Preparar items para la orden con subtotal calculado
      const items = carrito.value.map(item => ({
        itemId: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.cantidad * item.precio // Calcular subtotal
      }));

      // Crear orden SIN abono (siempre pendiente inicialmente)
      const ordenData = {
        cliente_nombre: cliente.value.nombre,
        cliente_telefono: cliente.value.telefono,
        cliente_nit: cliente.value.nit,
        items: items,
        empleadoId: empleado.id, // Empleado autenticado
        total: total.value, // Total calculado del carrito
        origen: 'pos',
        estado: 'entregado', // Las ventas POS se entregan de inmediato
        estado_pago: 'pendiente' // Siempre pendiente, se actualiza con el abono
      };

      const response = await POSService.crearVentaPOS(ordenData);
      
      return { 
        success: true, 
        message: 'Orden creada exitosamente',
        orden: response 
      };
    } catch (err) {
      error.value = err.message || 'Error al crear orden';
      return { 
        success: false, 
        message: error.value 
      };
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Procesar venta (DEPRECADO - mantener por compatibilidad)
   * Usar crearOrdenPOS en su lugar
   */
  const procesarVenta = async (datosPago) => {
    if (carrito.value.length === 0) {
      return { 
        success: false, 
        message: 'El carrito está vacío' 
      };
    }

    try {
      cargando.value = true;
      error.value = null;

      // Preparar items para la orden
      const items = carrito.value.map(item => ({
        itemId: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));

      // Obtener empleado del localStorage
      const empleado = AuthService.getCurrentEmpleado() || {};

      // Crear venta
      const ventaData = {
        cliente_nombre: cliente.value.nombre,
        cliente_telefono: cliente.value.telefono,
        cliente_nit: cliente.value.nit,
        items: items,
        empleadoId: empleado.id,
        estado_pago: datosPago.pagaCompleto ? 'pagado' : 'pendiente',
        abono: datosPago.pagaCompleto ? {
          monto: total.value,
          tipoPagoId: datosPago.tipoPagoId
        } : null
      };

      const response = await POSService.crearVentaPOS(ventaData);
      
      // Limpiar carrito después de venta exitosa
      vaciarCarrito();

      return { 
        success: true, 
        message: 'Venta procesada exitosamente',
        orden: response 
      };
    } catch (err) {
      error.value = err.message || 'Error al procesar venta';
      return { 
        success: false, 
        message: error.value 
      };
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Watch para búsqueda en tiempo real
   */
  watch(busquedaTexto, (nuevoTexto) => {
    if (nuevoTexto.length >= 2 || nuevoTexto === '') {
      buscarProductosTexto(nuevoTexto);
    }
  });

  return {
    // Estado
    carrito,
    cargando,
    error,
    ultimoCodigoEscaneado,
    productos,
    busquedaTexto,
    cliente,
    
    // Computed
    subtotal,
    cantidadItems,
    total,
    
    // Métodos
    buscarPorCodigo,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cargarProductos,
    buscarProductosTexto,
    crearOrdenPOS,
    procesarVenta // Deprecado, mantener por compatibilidad
  };
}
