import { ref } from 'vue';
import TipoPagoService from '@/services/tipo_pago.service';

// Estado compartido (Singleton)
// Se definen fuera de la función para que sean compartidos por todos los componentes que usen este composable
const tiposPago = ref([]);
const loading = ref(false);
const error = ref(null);
const initialized = ref(false);

export function useTiposPago() {
  
  const fetchTiposPago = async (force = false) => {
    // Si ya se inicializó y no se fuerza la recarga, no hacemos nada
    // Esto evita llamadas innecesarias a la API
    if (initialized.value && !force) {
      return;
    }

    loading.value = true;
    error.value = null;
    
    try {
      const response = await TipoPagoService.getAll();
      tiposPago.value = response;
      initialized.value = true;
    } catch (err) {
      console.error('Error al obtener tipos de pago:', err);
      error.value = 'Error al cargar los tipos de pago';
    } finally {
      loading.value = false;
    }
  };

  // Método para forzar recarga si es necesario
  const refreshTiposPago = () => {
    return fetchTiposPago(true);
  };

  return {
    tiposPago,
    loading,
    error,
    fetchTiposPago,
    refreshTiposPago
  };
}
