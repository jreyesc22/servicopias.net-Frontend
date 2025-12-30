/**
 * Composable para gestionar categorías
 * Centraliza toda la lógica de API y estado para categorías
 */

import { ref, computed } from 'vue';
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

// Estado compartido (singleton)
const categorias = ref([]);
const loading = ref(false);
const error = ref(null);
const initialized = ref(false);

export function useCategorias() {
  
  /**
   * Obtener todas las categorías
   * @param {boolean} force - Forzar recarga
   * @returns {Promise<Array>}
   */
  const fetchCategorias = async (force = false) => {
    // Si ya se inicializó y no se fuerza, retornar cache
    if (initialized.value && !force) {
      return categorias.value;
    }

    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await axios.get(`${API_URL}/categorias/list`);//no es all, es list
      categorias.value = Array.isArray(data) ? data : [];
      initialized.value = true;
      return categorias.value;
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      error.value = err.response?.data?.error || 'Error al cargar categorías';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crear nueva categoría
   * @param {Object} categoria - Datos de la categoría
   * @returns {Promise<Object>}
   */
  const crearCategoria = async (categoria) => {
    if (!categoria.nombre?.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }

    loading.value = true;
    error.value = null;

    try {
      const { data } = await axios.post(`${API_URL}/categorias/create`, categoria);
      
      // Agregar al cache local
      if (data && data.id) {
        categorias.value.push(data);
      } else {
        // Si el servidor no retorna la categoría, recargar
        await fetchCategorias(true);
      }

      return data;
    } catch (err) {
      console.error('Error al crear categoría:', err);
      error.value = err.response?.data?.error || 'Error al crear categoría';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Actualizar categoría existente
   * @param {number} id - ID de la categoría
   * @param {Object} categoria - Datos actualizados
   * @returns {Promise<Object>}
   */
  const actualizarCategoria = async (id, categoria) => {
    if (!id) {
      throw new Error('ID de categoría requerido');
    }

    if (!categoria.nombre?.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }

    loading.value = true;
    error.value = null;

    try {
      const { data } = await axios.put(`${API_URL}/categorias/update/${id}`, categoria); //falta el metodo update en el backend
      
      // Actualizar en cache local
      const index = categorias.value.findIndex(c => c.id === id);
      if (index !== -1) {
        categorias.value[index] = { ...categorias.value[index], ...data };
      } else {
        // Si no está en cache, recargar
        await fetchCategorias(true);
      }

      return data;
    } catch (err) {
      console.error('Error al actualizar categoría:', err);
      error.value = err.response?.data?.error || 'Error al actualizar categoría';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Eliminar categoría
   * @param {number} id - ID de la categoría
   * @returns {Promise<void>}
   */
  const eliminarCategoria = async (id) => {
    if (!id) {
      throw new Error('ID de categoría requerido');
    }

    loading.value = true;
    error.value = null;

    try {
      await axios.delete(`${API_URL}/categorias/delete/${id}`);
      
      // Remover del cache local
      categorias.value = categorias.value.filter(c => c.id !== id);
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      error.value = err.response?.data?.error || 'Error al eliminar categoría';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Buscar categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Object|null}
   */
  const buscarCategoriaPorId = (id) => {
    return categorias.value.find(c => c.id === id) || null;
  };

  /**
   * Buscar categorías por nombre (búsqueda parcial)
   * @param {string} termino - Término de búsqueda
   * @returns {Array}
   */
  const buscarCategoriasPorNombre = (termino) => {
    if (!termino || !termino.trim()) {
      return categorias.value;
    }

    const terminoLower = termino.toLowerCase().trim();
    return categorias.value.filter(c => 
      c.nombre?.toLowerCase().includes(terminoLower) ||
      c.descripcion?.toLowerCase().includes(terminoLower)
    );
  };

  /**
   * Forzar recarga de categorías
   */
  const recargarCategorias = () => {
    return fetchCategorias(true);
  };

  /**
   * Limpiar error
   */
  const limpiarError = () => {
    error.value = null;
  };

  /**
   * Computed para categorías ordenadas alfabéticamente
   */
  const categoriasOrdenadas = computed(() => {
    return [...categorias.value].sort((a, b) => 
      (a.nombre || '').localeCompare(b.nombre || '')
    );
  });

  /**
   * Computed para total de categorías
   */
  const totalCategorias = computed(() => categorias.value.length);

  return {
    // Estado
    categorias: computed(() => categorias.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    initialized: computed(() => initialized.value),
    
    // Computed
    categoriasOrdenadas,
    totalCategorias,
    
    // Métodos
    fetchCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    buscarCategoriaPorId,
    buscarCategoriasPorNombre,
    recargarCategorias,
    limpiarError
  };
}

export default useCategorias;
