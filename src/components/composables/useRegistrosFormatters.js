/**
 * Composable compartido de formateo para el módulo de Registros.
 * Centraliza formatMoney, formatDate y getColorPago para evitar
 * duplicación entre RegistrosTable, RegistrosDetailModal y RegistrosIngresosCategoria.
 */
export function useRegistrosFormatters() {
  /**
   * Formatea un valor numérico como moneda guatemalteca (es-GT).
   * @param {number|string} val
   * @returns {string}
   */
  const formatMoney = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * Formatea una fecha ISO en formato legible en español.
   * @param {string} val
   * @returns {string}
   */
  const formatDate = (val) => {
    if (!val) return '';
    const date = new Date(val);
    return date.toLocaleString('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Retorna el color de Vuetify según el estado de pago de una orden.
   * @param {string} estado - 'pagado' | 'parcial' | cualquier otro
   * @returns {string}
   */
  const getColorPago = (estado) => {
    if (estado === 'pagado') return 'success';
    if (estado === 'parcial') return 'warning';
    return 'error';
  };

  return { formatMoney, formatDate, getColorPago };
}
