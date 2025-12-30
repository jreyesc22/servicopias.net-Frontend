/**
 * Composable para búsqueda y filtrado de órdenes
 */

import { ref, computed } from 'vue';
import ordenesService from '@/services/ordenes.service';

export function useBusquedaOrdenes() {
  // Estado de búsqueda
  const loading = ref(false);
  const error = ref(null);
  const resultados = ref([]);
  const ultimaBusqueda = ref(null);

  // Parámetros de búsqueda actuales
  const filtros = ref({
    tipo: 'todos', // 'todos', 'id', 'cliente', 'fecha', 'rango'
    id: '',
    cliente_nombre: '',
    cliente_nit: '',
    fecha: '',
    fechaInicio: '',
    fechaFin: '',
    estado: null,
    estadoPago: null
  });

  // Paginación
  const paginacion = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  /**
   * Buscar orden por ID
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  const buscarPorId = async (id) => {
    if (!id) {
      throw new Error('ID de orden requerido');
    }

    loading.value = true;
    error.value = null;
    ultimaBusqueda.value = { tipo: 'id', id };

    try {
      const orden = await ordenesService.getById(id);
      resultados.value = orden ? [orden] : [];
      return { success: true, data: orden };
    } catch (err) {
      console.error('Error al buscar por ID:', err);
      error.value = err.response?.data?.error || 'Error al buscar orden';
      resultados.value = [];
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Buscar órdenes por cliente (nombre o NIT)
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise<Object>}
   */
  const buscarPorCliente = async (params) => {
    if (!params) params = {};
    const { cliente_nombre, cliente_nit } = params;

    if (!cliente_nombre && !cliente_nit) {
      throw new Error('Debe proporcionar nombre o NIT del cliente');
    }

    loading.value = true;
    error.value = null;
    ultimaBusqueda.value = { tipo: 'cliente', ...params };

    try {
      const ordenes = await ordenesService.searchByCliente(params);
      resultados.value = ordenes || [];
      return { success: true, data: ordenes, total: ordenes.length };
    } catch (err) {
      console.error('Error al buscar por cliente:', err);
      error.value = err.response?.data?.error || 'Error al buscar órdenes';
      resultados.value = [];
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Buscar órdenes por fecha única
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  const buscarPorFecha = async (fecha) => {
    if (!fecha) {
      throw new Error('Fecha requerida');
    }

    loading.value = true;
    error.value = null;
    ultimaBusqueda.value = { tipo: 'fecha', fecha };

    try {
      // Usar el mismo método de rango pero con la misma fecha inicio y fin
      const params = {
        fechaInicio: fecha,
        fechaFin: fecha,
        page: paginacion.value.page,
        limit: paginacion.value.limit
      };

      const response = await ordenesService.searchByDateRange(params);
      
      resultados.value = response.ordenes || [];
      
      if (response.pagination) {
        paginacion.value = {
          page: response.pagination.currentPage,
          limit: response.pagination.pageSize,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        };
      }

      return { 
        success: true, 
        data: resultados.value, 
        total: paginacion.value.total,
        pagination: paginacion.value
      };
    } catch (err) {
      console.error('Error al buscar por fecha:', err);
      error.value = err.response?.data?.error || 'Error al buscar órdenes';
      resultados.value = [];
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Buscar órdenes por rango de fechas
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise<Object>}
   */
  const buscarPorRangoFechas = async (params) => {
    if (!params) params = {};
    const { fechaInicio, fechaFin, estado, estadoPago } = params;

    if (!fechaInicio || !fechaFin) {
      throw new Error('Fecha inicio y fecha fin requeridas');
    }

    loading.value = true;
    error.value = null;
    ultimaBusqueda.value = { tipo: 'rango', ...params };

    try {
      const searchParams = {
        fechaInicio,
        fechaFin,
        page: paginacion.value.page,
        limit: paginacion.value.limit
      };

      if (estado) searchParams.estado = estado;
      if (estadoPago) searchParams.estadoPago = estadoPago;

      const response = await ordenesService.searchByDateRange(searchParams);
      
      resultados.value = response.ordenes || [];
      
      if (response.pagination) {
        paginacion.value = {
          page: response.pagination.currentPage,
          limit: response.pagination.pageSize,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        };
      }

      return { 
        success: true, 
        data: resultados.value, 
        total: paginacion.value.total,
        pagination: paginacion.value,
        estadisticas: response.estadisticas
      };
    } catch (err) {
      console.error('Error al buscar por rango:', err);
      error.value = err.response?.data?.error || 'Error al buscar órdenes';
      resultados.value = [];
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Ejecutar búsqueda basada en los filtros actuales
   * @returns {Promise<Object>}
   */
  const ejecutarBusqueda = async () => {
    const tipo = filtros.value.tipo;

    try {
      switch (tipo) {
        case 'id':
          if (!filtros.value.id) {
            throw new Error('Ingrese un ID de orden');
          }
          return await buscarPorId(filtros.value.id);

        case 'cliente':
          if (!filtros.value.cliente_nombre && !filtros.value.cliente_nit) {
            throw new Error('Ingrese nombre o NIT del cliente');
          }
          return await buscarPorCliente({
            cliente_nombre: filtros.value.cliente_nombre,
            cliente_nit: filtros.value.cliente_nit
          });

        case 'fecha':
          if (!filtros.value.fecha) {
            throw new Error('Seleccione una fecha');
          }
          return await buscarPorFecha(filtros.value.fecha);

        case 'rango':
          if (!filtros.value.fechaInicio || !filtros.value.fechaFin) {
            throw new Error('Seleccione rango de fechas');
          }
          return await buscarPorRangoFechas({
            fechaInicio: filtros.value.fechaInicio,
            fechaFin: filtros.value.fechaFin,
            estado: filtros.value.estado,
            estadoPago: filtros.value.estadoPago
          });

        case 'todos':
        default:
          // Cargar todas las órdenes con paginación
          return await cargarTodas();
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    }
  };

  /**
   * Cargar todas las órdenes
   * @returns {Promise<Object>}
   */
  const cargarTodas = async () => {
    loading.value = true;
    error.value = null;
    ultimaBusqueda.value = { tipo: 'todos' };

    try {
      const response = await ordenesService.getAll({
        page: paginacion.value.page,
        limit: paginacion.value.limit
      });

      if (response.ordenes) {
        // Respuesta paginada
        resultados.value = response.ordenes;
        paginacion.value = {
          page: response.pagination.currentPage,
          limit: response.pagination.pageSize,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        };
      } else if (Array.isArray(response)) {
        // Respuesta legacy
        resultados.value = response;
        paginacion.value.total = response.length;
      }

      return { 
        success: true, 
        data: resultados.value,
        total: paginacion.value.total,
        pagination: paginacion.value
      };
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      error.value = err.response?.data?.error || 'Error al cargar órdenes';
      resultados.value = [];
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cambiar página
   * @param {number} page - Número de página
   */
  const cambiarPagina = async (page) => {
    paginacion.value.page = page;
    
    if (ultimaBusqueda.value) {
      // Repetir última búsqueda con nueva página
      return await ejecutarBusqueda();
    } else {
      return await cargarTodas();
    }
  };

  /**
   * Cambiar items por página
   * @param {number} limit - Límite de items
   */
  const cambiarLimite = async (limit) => {
    paginacion.value.limit = limit;
    paginacion.value.page = 1; // Reset a primera página
    
    if (ultimaBusqueda.value) {
      return await ejecutarBusqueda();
    } else {
      return await cargarTodas();
    }
  };

  /**
   * Limpiar filtros y resultados
   */
  const limpiarBusqueda = () => {
    filtros.value = {
      tipo: 'todos',
      id: '',
      cliente_nombre: '',
      cliente_nit: '',
      fecha: '',
      fechaInicio: '',
      fechaFin: '',
      estado: null,
      estadoPago: null
    };
    resultados.value = [];
    error.value = null;
    ultimaBusqueda.value = null;
    paginacion.value.page = 1;
  };

  /**
   * Limpiar solo el error
   */
  const limpiarError = () => {
    error.value = null;
  };

  // Computed
  const tieneResultados = computed(() => resultados.value.length > 0);
  const totalResultados = computed(() => paginacion.value.total || resultados.value.length);

  return {
    // Estado
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    resultados: computed(() => resultados.value),
    filtros,
    paginacion: computed(() => paginacion.value),
    ultimaBusqueda: computed(() => ultimaBusqueda.value),
    
    // Computed
    tieneResultados,
    totalResultados,
    
    // Métodos
    buscarPorId,
    buscarPorCliente,
    buscarPorFecha,
    buscarPorRangoFechas,
    ejecutarBusqueda,
    cargarTodas,
    cambiarPagina,
    cambiarLimite,
    limpiarBusqueda,
    limpiarError
  };
}

export default useBusquedaOrdenes;
