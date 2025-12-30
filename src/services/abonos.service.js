/**
 * Servicio para operaciones de abonos
 */

import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

class AbonosService {
  /**
   * Registrar un abono a una orden
   * @param {Object} abono - Datos del abono
   * @param {number} abono.ordenId - ID de la orden
   * @param {number} abono.tipoPagoId - ID del tipo de pago
   * @param {number} abono.monto - Monto del abono
   * @param {string} abono.numero_recibo - Número de recibo (opcional)
   * @param {number} abono.empleadoId - ID del empleado
   * @param {string} abono.observacion - Observación (opcional)
   * @returns {Promise<Object>} Respuesta con datos del abono y estado actualizado de la orden
   */
  async registrarAbono(abono) {
    const { data } = await axios.post(`${API_URL}/abonos/create`, abono);
    return data;
  }

  /**
   * Obtener todos los abonos
   * @returns {Promise<Array>}
   */
  async getAll() {
    const { data } = await axios.get(`${API_URL}/abonos/all`);
    return data;
  }

  /**
   * Obtener abonos de una orden específica
   * @param {number} ordenId - ID de la orden
   * @returns {Promise<Array>}
   */
  async getByOrden(ordenId) {
    const { data } = await axios.get(`${API_URL}/abonos/orden/${ordenId}`);
    return data;
  }
}

export default new AbonosService();
