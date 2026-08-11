import ApiService from './api.service';

const CategoriaService = {
  getAll() {
    return ApiService.get('/categorias/list');
  },
};

export default CategoriaService;
