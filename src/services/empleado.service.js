import ApiService from './api.service';

class EmpleadoService {
  getAll() {
    return ApiService.get('/empleados/all');
  }

  create(data) {
    return ApiService.post('/empleados/new', data);
  }

  resetPassword(id, newPassword) {
    return ApiService.put('/empleados/reset-password/' + id, { newPassword });
  }

  changePassword(id, currentPassword, newPassword) {
    return ApiService.put('/empleados/update-password/' + id, { currentPassword, newPassword });
  }
}

export default new EmpleadoService();
