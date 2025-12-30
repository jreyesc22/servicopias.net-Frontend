/**
 * Composable para facilitar el uso del servicio de impresión en componentes Vue
 * Proporciona funciones reactivas y estado compartido
 */

import { ref, computed } from 'vue';
import { printerService } from '@/services/printer.service';
import { generarContenidoTicket } from '@/utils/ticketTemplate';

// Estado reactivo compartido
const imprimiendo = ref(false);
const ultimoError = ref(null);
const ultimaImpresion = ref(null);

export function usePrinter(config = {}) {
  
  /**
   * Configurar el servicio de impresión
   */
  const configurar = (nuevaConfig) => {
    printerService.configurar(nuevaConfig);
  };

  /**
   * Imprimir ticket de orden
   * @param {Object} orden - Datos de la orden
   * @param {Object} pago - Datos del pago (opcional)
   * @param {Object} options - Opciones de impresión
   */
  const imprimirTicket = async (orden, pago = null, options = {}) => {
    imprimiendo.value = true;
    ultimoError.value = null;

    try {
      // Generar plantilla
      const plantilla = (datos) => {
        return generarContenidoTicket(datos.orden, datos.pago);
      };

      // Imprimir usando el servicio
      const resultado = await printerService.imprimirTicket(
        plantilla,
        { orden, pago },
        {
          abrirCajon: true,
          cortar: true,
          ...options
        }
      );

      if (resultado.success) {
        ultimaImpresion.value = {
          orden_id: orden.id,
          timestamp: resultado.timestamp,
          intentos: resultado.intentos
        };
        return resultado;
      } else {
        throw new Error(resultado.error);
      }

    } catch (error) {
      ultimoError.value = error.message;
      throw error;

    } finally {
      imprimiendo.value = false;
    }
  };

  /**
   * Imprimir texto raw con comandos personalizados
   */
  const imprimirRaw = async (texto, options = {}) => {
    imprimiendo.value = true;
    ultimoError.value = null;

    try {
      const resultado = await printerService.imprimirRaw(texto, options);
      
      if (resultado.success) {
        ultimaImpresion.value = {
          timestamp: resultado.timestamp,
          intentos: resultado.intentos
        };
        return resultado;
      } else {
        throw new Error(resultado.error);
      }

    } catch (error) {
      ultimoError.value = error.message;
      throw error;

    } finally {
      imprimiendo.value = false;
    }
  };

  /**
   * Abrir cajón de dinero
   */
  const abrirCajon = async () => {
    imprimiendo.value = true;
    ultimoError.value = null;

    try {
      const resultado = await printerService.abrirCajon();
      
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      return resultado;

    } catch (error) {
      ultimoError.value = error.message;
      throw error;

    } finally {
      imprimiendo.value = false;
    }
  };

  /**
   * Cortar papel
   */
  const cortarPapel = async () => {
    imprimiendo.value = true;
    ultimoError.value = null;

    try {
      const resultado = await printerService.cortarPapel();
      
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      return resultado;

    } catch (error) {
      ultimoError.value = error.message;
      throw error;

    } finally {
      imprimiendo.value = false;
    }
  };

  /**
   * Validar conectividad con la impresora
   */
  const validarConectividad = async () => {
    try {
      return await printerService.validarConectividad();
    } catch (error) {
      ultimoError.value = error.message;
      return false;
    }
  };

  /**
   * Obtener estado del servicio
   */
  const estado = computed(() => ({
    imprimiendo: imprimiendo.value,
    ultimoError: ultimoError.value,
    ultimaImpresion: ultimaImpresion.value,
    servicio: printerService.getEstado()
  }));

  /**
   * Limpiar error
   */
  const limpiarError = () => {
    ultimoError.value = null;
  };

  return {
    // Estado
    imprimiendo: computed(() => imprimiendo.value),
    ultimoError: computed(() => ultimoError.value),
    ultimaImpresion: computed(() => ultimaImpresion.value),
    estado,

    // Métodos
    configurar,
    imprimirTicket,
    imprimirRaw,
    abrirCajon,
    cortarPapel,
    validarConectividad,
    limpiarError
  };
}

export default usePrinter;
