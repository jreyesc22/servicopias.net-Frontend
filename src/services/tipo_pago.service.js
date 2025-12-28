import ApiService from './api.service';

class TipoPagoService {
  getAll() {
    return ApiService.get('/tipos_pago/all');
  }
}

export default new TipoPagoService();
