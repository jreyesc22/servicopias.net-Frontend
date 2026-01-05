/**
 * Servicio para operaciones de abonos
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
    // Mantener el objeto original (incluye response/status) pero con mensaje útil
    error.message = message;
  }
  return error instanceof Error ? error : new Error(message);
};

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
  async registrarAbono(abono, config = {}) {
    try {
      const { data } = await axios.post(`${API_URL}/abonos/create`, abono, {
        timeout: 15000,
        ...config
      });
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al registrar el abono');
    }
  }

  /**
   * Obtener todos los abonos
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const { data } = await axios.get(`${API_URL}/abonos/all`, { timeout: 15000 });
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al obtener abonos');
    }
  }

  /**
   * Obtener abonos de una orden específica
   * @param {number} ordenId - ID de la orden
   * @returns {Promise<Array>}
   */
  async getByOrden(ordenId) {
    try {
      const { data } = await axios.get(`${API_URL}/abonos/orden/${ordenId}`, { timeout: 15000 });
      return data;
    } catch (error) {
      throw normalizeAxiosError(error, 'Error al obtener abonos de la orden');
    }
  }
}

export default new AbonosService();
