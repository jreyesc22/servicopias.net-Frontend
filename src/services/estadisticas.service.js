import ApiService from './api.service';

const EstadisticasService = {
  /**
   * Obtiene los productos/ítems vendidos agrupados por su categoría en el rango dado.
   * Devuelve: categorías con sus productos, unidades vendidas e ingresos por ítem.
   * Usa limit alto para traer todos los productos (no solo top 5).
   * @param {string} fechaInicio - YYYY-MM-DD
   * @param {string} fechaFin    - YYYY-MM-DD
   */
  getProductosPorCategoria(fechaInicio, fechaFin) {
    return ApiService.get('/estadisticas/productos-por-categoria', {
      fechaInicio,
      fechaFin,
      limit: 1000, // traer todos los productos, no solo top 5 por categoría
    });
  },
};

export default EstadisticasService;
