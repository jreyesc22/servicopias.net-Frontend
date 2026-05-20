/**
 * Servicio para operaciones de órdenes
 */

import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

const getAxiosErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;
  return (
    data?.message ||
    data?.error ||
    data?.mensaje ||
    error?.message ||
    fallbackMessage
  );
};

const normalizeAxiosError = (error, fallbackMessage) => {
  const message = getAxiosErrorMessage(error, fallbackMessage);
  if (error && typeof error === 'object') {
    error.message = message;
  }
  return error instanceof Error ? error : new Error(message);
};

class OrdenesService {
  /**
   * Obtener todas las órdenes con paginación y filtros
   * @param {Object} params - Parámetros de paginación y filtros
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Registros por página
   * @param {number} params.diasAtras - Días hacia atrás (default: 60)
   * @param {string} params.estado - Filtrar por estado
   * @returns {Promise<Object>}
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Siempre incluir filtro de días (default: 60 días)
    const diasAtras = params.diasAtras !== undefined ? params.diasAtras : 60;
    queryParams.append('diasAtras', diasAtras);
    
    // Filtro opcional por estado
    if (params.estado) {
      queryParams.append('estado', params.estado);
    }
    
    // Paginación opcional
    if (params.page !== null && params.page !== undefined) {
      queryParams.append('page', params.page);
    }
    if (params.limit !== null && params.limit !== undefined) {
      queryParams.append('limit', params.limit);
    }
    
    try {
      const { data } = await axios.get(`${API_URL}/ordenes/all?${queryParams.toString()}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al obtener órdenes');
    }
  }

  /**
   * Obtener una orden por ID
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const { data } = await axios.get(`${API_URL}/ordenes/${id}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al obtener la orden');
    }
  }

  /**
   * Buscar órdenes por cliente (nombre o NIT)
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.cliente_nombre - Nombre del cliente
   * @param {string} params.cliente_nit - NIT del cliente
   * @returns {Promise<Array>}
   */
  async searchByCliente(params) {
    if (!params) params = {};
    const { cliente_nombre, cliente_nit } = params;
    const queryParams = new URLSearchParams();
    
    if (cliente_nombre) queryParams.append('cliente_nombre', cliente_nombre);
    if (cliente_nit) queryParams.append('cliente_nit', cliente_nit);
    
    try {
      const { data } = await axios.get(`${API_URL}/ordenes/search?${queryParams.toString()}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al buscar órdenes por cliente');
    }
  }

  /**
   * Buscar órdenes por rango de fechas
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.fechaInicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} params.fechaFin - Fecha fin (YYYY-MM-DD)
   * @param {string} params.estado - Estado de la orden (opcional)
   * @param {string} params.estadoPago - Estado de pago (opcional)
   * @param {number} params.page - Página (opcional)
   * @param {number} params.limit - Límite por página (opcional)
   * @returns {Promise<Object>}
   */
  async searchByDateRange(params) {
    if (!params) params = {};
    const {
      fechaInicio,
      fechaFin,
      estado,
      estadoPago,
      empleadoId,
      page = 1,
      limit = 100
    } = params;

    const queryParams = new URLSearchParams({
      fechaInicio,
      fechaFin,
      page,
      limit
    });

    if (estado) queryParams.append('estado', estado);
    if (estadoPago) queryParams.append('estadoPago', estadoPago);
    if (empleadoId) queryParams.append('empleadoId', empleadoId);

    try {
      const { data } = await axios.get(`${API_URL}/estadisticas/date-range?${queryParams.toString()}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al buscar órdenes por rango de fechas');
    }
  }
  /**
   * Obtener resumen de órdenes por rango de fechas (solo estadísticas)
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.fechaInicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} params.fechaFin - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getResumenByDateRange(params) {
    if (!params) params = {};
    const { fechaInicio, fechaFin, empleadoId } = params;
    
    const queryParamsObj = { fechaInicio, fechaFin };
    if (empleadoId) queryParamsObj.empleadoId = empleadoId;
    
    const queryParams = new URLSearchParams(queryParamsObj).toString();
    
    try {
      const { data } = await axios.get(`${API_URL}/estadisticas/resumen-date-range?${queryParams.toString()}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al obtener resumen de órdenes');
    }
  }

  /**
   * Crear nueva orden
   * @param {Object} orden - Datos de la orden
   * @returns {Promise<Object>}
   */
  async create(orden) {
    try {
      const { data } = await axios.post(`${API_URL}/ordenes/create`, orden);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al crear la orden');
    }
  }

  /**
   * Actualizar orden
   * @param {number} id - ID de la orden
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    try {
      const { data } = await axios.put(`${API_URL}/ordenes/update/${id}`, updates);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al actualizar la orden');
    }
  }

  /**
   * Eliminar orden
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      const { data } = await axios.delete(`${API_URL}/ordenes/delete/${id}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al eliminar la orden');
    }
  }

  /**
   * Obtener estado público de una orden (sin autenticación)
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  async getPublicStatus(id) {
    try {
      const { data } = await axios.get(`${API_URL}/ordenes/public/${id}`);
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al obtener estado público de la orden');
    }
  }
}

export default new OrdenesService();
