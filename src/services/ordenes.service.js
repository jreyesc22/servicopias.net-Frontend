/**
 * Servicio para operaciones de órdenes
 */

import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

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
    
    const { data } = await axios.get(`${API_URL}/ordenes/all?${queryParams.toString()}`);
    return data;
  }

  /**
   * Obtener una orden por ID
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const { data } = await axios.get(`${API_URL}/ordenes/${id}`);
    return data;
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
    
    const { data } = await axios.get(`${API_URL}/ordenes/search?${queryParams.toString()}`);
    return data;
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
    
    const { data } = await axios.get(`${API_URL}/ordenes/date-range?${queryParams.toString()}`);
    return data;
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
    const { fechaInicio, fechaFin } = params;
    const queryParams = new URLSearchParams({ fechaInicio, fechaFin }).toString();
    const { data } = await axios.get(`${API_URL}/ordenes/resumen-date-range?${queryParams.toString()}`);
    return data;
  }

  /**
   * Crear nueva orden
   * @param {Object} orden - Datos de la orden
   * @returns {Promise<Object>}
   */
  async create(orden) {
    const { data } = await axios.post(`${API_URL}/ordenes/create`, orden);
    return data;
  }

  /**
   * Actualizar orden
   * @param {number} id - ID de la orden
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    const { data } = await axios.put(`${API_URL}/ordenes/update/${id}`, updates);
    return data;
  }

  /**
   * Eliminar orden
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const { data } = await axios.delete(`${API_URL}/ordenes/delete/${id}`);
    return data;
  }

  /**
   * Obtener estado público de una orden (sin autenticación)
   * @param {number} id - ID de la orden
   * @returns {Promise<Object>}
   */
  async getPublicStatus(id) {
    const { data } = await axios.get(`${API_URL}/ordenes/public/${id}`);
    return data;
  }
}

export default new OrdenesService();
