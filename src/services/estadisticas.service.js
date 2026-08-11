import ApiService from './api.service';

const EstadisticasService = {
  getIngresosPorCategoria(fechaInicio, fechaFin, categoriaIds) {
    return ApiService.get('/estadisticas/ingresos-por-categoria', {
      fechaInicio,
      fechaFin,
      categoriaIds,
    });
  },
};

export default EstadisticasService;
