import apiService from './api.service';

/**
 * Servicio para operaciones del Punto de Venta (POS)
 */
class POSService {
  // Normalizar un registro de producto retornado por la API
  normalizeItem(raw) {
    if (!raw) return null;

    return {
      id: raw.id ?? raw.producto_id ?? raw.itemId ?? null,
      nombre: raw.nombre ?? raw.producto_nombre ?? raw.producto_nombre_comercial ?? raw.nombre_producto ?? '',
      precio_unitario: Number(raw.precio_unitario ?? raw.precio ?? raw.precio_venta ?? raw.precio_unitario_venta ?? 0),
      imagen_url: raw.imagen_url ?? raw.imagen ?? raw.image_url ?? null,
      categoria_nombre: raw.categoria_nombre ?? raw.categoria ?? raw.categoriaName ?? null,
      total_vendido: raw.total_vendido ?? raw.vendidos ?? null,
      stock: raw.stock ?? raw.cantidad_stock ?? null,
      codigo_barras: raw.codigo_barras ?? raw.barcode ?? raw.codigo ?? null,
      descripcion: raw.descripcion ?? raw.descripcion_corta ?? raw.description ?? null,
      raw
    }
  }
  /**
   * Buscar producto por código de barras
   * @param {string} codigoBarras - Código de barras del producto
   * @returns {Promise<Object>} - Producto encontrado o error
   */
  async buscarPorCodigoBarras(codigoBarras) {
    try {
      const response = await apiService.get(
        `/items/buscar-codigo/${encodeURIComponent(codigoBarras)}`
      );
      // Estandarizar formato: la API puede devolver { item: {...} } o el item directo
      if (response && (response.item || response.producto || response.data)) {
        const rawItem = response.item ?? response.producto ?? response.data;
        return { ...response, item: this.normalizeItem(rawItem) };
      }

      if (response && (response.id || response.producto_id || response.itemId)) {
        return { encontrado: true, item: this.normalizeItem(response) };
      }

      return response;
    } catch (error) {
      const statusMatch = String(error?.message || '').match(/status:\s*(\d+)/i);
      const status = statusMatch ? Number(statusMatch[1]) : null;

      // 404 significa que el producto no existe; no debe tratarse como error técnico.
      if (status === 404) {
        return { encontrado: false, item: null };
      }

      console.error('Error al buscar producto por código de barras:', error);
      throw error;
    }
  }

  /**
   * Crear venta directa del POS (como orden especial)
   * @param {Object} ventaData - Datos de la venta
   * @returns {Promise<Object>} - Orden creada
   */
  async crearVentaPOS(ventaData) {
    try {
      const ordenData = {
        cliente_nombre: ventaData.cliente_nombre || 'CF',
        cliente_telefono: ventaData.cliente_telefono || null,
        cliente_nit: ventaData.cliente_nit || 'CF',
        origen: 'pos', // Identificador especial para ventas POS
        estado: ventaData.estado || 'entregado', // Las ventas POS se entregan inmediatamente
        estado_pago: ventaData.estado_pago || 'pendiente', // Siempre pendiente si no se especifica
        items: ventaData.items,
        empleadoId: ventaData.empleadoId,
        // Calcular total desde los items si no viene
        total: ventaData.total || this.calcularTotal(ventaData.items),
        // Si hay abono, se incluye (mantener compatibilidad)
        abono: ventaData.abono || null
      };

      const response = await apiService.post('/ordenes/create', ordenData);
      return response.orden || response; // El backend retorna { orden: {...}, mensaje: "..." }
    } catch (error) {
      console.error('Error al crear venta POS:', error);
      throw error;
    }
  }

  /**
   * Calcular total desde los items
   * @param {Array} items - Lista de items
   * @returns {number} - Total calculado
   */
  calcularTotal(items) {
    return items.reduce((sum, item) => {
      const subtotal = item.subtotal || (item.cantidad * item.precio_unitario);
      return sum + subtotal;
    }, 0);
  }

  /**
   * Obtener todos los productos activos
   * @returns {Promise<Array>} - Lista de productos
   */
  async obtenerProductos() {
    try {
      const response = await apiService.get('/items/all');
      // Normalizar respuesta: puede venir como array o como { productos: [...] }
      const list = Array.isArray(response) ? response : (response.productos || response.items || []);
      return list.map(p => this.normalizeItem(p));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  /**
   * Buscar productos por texto (nombre o descripción)
   * @param {string} texto - Texto a buscar
   * @returns {Promise<Array>} - Productos encontrados
   */
  async buscarProductos(texto) {
    try {
      const productos = await this.obtenerProductos();
      if (!texto || texto.trim() === '') return productos;

      const textoLower = texto.toLowerCase();
      return productos.filter(p => {
        const nombre = (p.nombre || '').toString().toLowerCase();
        const descripcion = (p.descripcion || '').toString().toLowerCase();
        const codigo = (p.codigo_barras || '').toString();
        return nombre.includes(textoLower) || descripcion.includes(textoLower) || codigo.includes(texto);
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }

  /**
   * Obtener productos más vendidos
   * @param {number} limit - Cantidad de productos a obtener (default 15)
   * @returns {Promise<Object>} - Lista de productos más vendidos
   */
  async obtenerProductosMasVendidos(limit = 15) {
    try {
      const response = await apiService.get(`/estadisticas/productos-mas-vendidos?limit=${limit}`);
      const productos = Array.isArray(response) ? response : (response.productos || []);
      return { productos: productos.map(p => this.normalizeItem(p)) };
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      throw error;
    }
  }
}

export default new POSService();
