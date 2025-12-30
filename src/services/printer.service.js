/**
 * Servicio centralizado para gestionar impresión de tickets
 * Maneja la comunicación con el servidor de impresión
 */

import { finalizarImpresion } from '../utils/printerCommands';

/**
 * Configuración por defecto del servicio de impresión
 */
const CONFIG_DEFAULT = {
  servidorUrl: 'http://192.168.1.15:3005',
  timeout: 5000,
  reintentos: 2,
  debug: process.env.NODE_ENV === 'development'
};

class PrinterService {
  constructor(config = {}) {
    this.config = { ...CONFIG_DEFAULT, ...config };
    this.imprimiendo = false;
  }

  /**
   * Función helper para logging con timestamp
   */
  log(mensaje, ...args) {
    if (this.config.debug) {
      console.log(`[PrinterService ${new Date().toISOString()}]`, mensaje, ...args);
    }
  }

  /**
   * Función helper para errores
   */
  logError(mensaje, error) {
    console.error(`[PrinterService ERROR]`, mensaje, error);
  }

  /**
   * Validar conectividad con el servidor de impresión
   * @returns {Promise<boolean>}
   */
  async validarConectividad() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(this.config.servidorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'PING',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.log('Conectividad validada:', response.ok);
      return response.ok;
      
    } catch (error) {
      this.log('Servidor de impresión no disponible:', error.message);
      return false;
    }
  }

  /**
   * Actualizar configuración del servicio
   * @param {Object} nuevaConfig - Nueva configuración parcial
   */
  configurar(nuevaConfig) {
    this.config = { ...this.config, ...nuevaConfig };
    this.log('Configuración actualizada:', this.config);
  }

  /**
   * Enviar texto raw a la impresora
   * @param {string} textoRaw - Texto con comandos ESC/POS
   * @param {Object} options - Opciones de impresión
   * @returns {Promise<Object>} Resultado de la impresión
   */
  async imprimirRaw(textoRaw, options = {}) {
    const {
      validarConexion = true,
      reintentos = this.config.reintentos,
      abrirCajon = false,
      cortar = true
    } = options;

    if (this.imprimiendo) {
      throw new Error('Ya hay una impresión en proceso');
    }

    this.imprimiendo = true;
    let intentoActual = 0;

    try {
      // Validar conectividad si se solicita
      if (validarConexion) {
        const conectado = await this.validarConectividad();
        if (!conectado) {
          throw new Error('Servidor de impresión no disponible');
        }
      }

      // Agregar comandos de finalización si se solicitan
      let textoFinal = textoRaw;
      if (abrirCajon || cortar) {
        textoFinal += finalizarImpresion({
          abrirCajon,
          tipoCorte: cortar ? 'full' : null,
          lineasExtra: cortar ? 3 : 0
        });
      }

      this.log('Enviando a impresora, longitud:', textoFinal.length);

      // Intentar imprimir con reintentos
      while (intentoActual <= reintentos) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await fetch(this.config.servidorUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: textoFinal,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
          }

          this.log('Impresión exitosa');
          return {
            success: true,
            timestamp: new Date().toISOString(),
            intentos: intentoActual + 1
          };

        } catch (error) {
          intentoActual++;
          if (intentoActual > reintentos) {
            throw error;
          }
          this.log(`Reintento ${intentoActual}/${reintentos}...`);
          await this.esperar(1000 * intentoActual); // Espera incremental
        }
      }

    } catch (error) {
      this.logError('Error al imprimir:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        intentos: intentoActual
      };

    } finally {
      this.imprimiendo = false;
    }
  }

  /**
   * Imprimir ticket desde plantilla
   * @param {Function} plantillaFn - Función que genera el texto del ticket
   * @param {Object} datos - Datos para la plantilla
   * @param {Object} options - Opciones de impresión
   * @returns {Promise<Object>} Resultado de la impresión
   */
  async imprimirTicket(plantillaFn, datos, options = {}) {
    try {
      // Generar ticket usando la plantilla
      const textoTicket = plantillaFn(datos);
      
      if (!textoTicket || typeof textoTicket !== 'string') {
        throw new Error('La plantilla no generó texto válido');
      }

      this.log('Ticket generado desde plantilla');

      // Imprimir
      return await this.imprimirRaw(textoTicket, {
        abrirCajon: true,
        cortar: true,
        ...options
      });

    } catch (error) {
      this.logError('Error al imprimir ticket:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Abrir cajón de dinero sin imprimir
   * @returns {Promise<Object>}
   */
  async abrirCajon() {
    const { abrirCajon: comandoCajon } = await import('../utils/printerCommands');
    return await this.imprimirRaw(comandoCajon(), {
      validarConexion: true,
      cortar: false,
      abrirCajon: false // Ya está incluido en el comando
    });
  }

  /**
   * Cortar papel sin imprimir
   * @returns {Promise<Object>}
   */
  async cortarPapel() {
    const { cortarPapel: comandoCorte, alimentarLineas } = await import('../utils/printerCommands');
    const comando = alimentarLineas(3) + comandoCorte();
    return await this.imprimirRaw(comando, {
      validarConexion: true,
      cortar: false,
      abrirCajon: false
    });
  }

  /**
   * Imprimir texto simple (útil para pruebas)
   * @param {string} texto - Texto a imprimir
   * @param {Object} options - Opciones
   * @returns {Promise<Object>}
   */
  async imprimirTexto(texto, options = {}) {
    return await this.imprimirRaw(texto, {
      cortar: true,
      ...options
    });
  }

  /**
   * Verificar estado del servicio
   * @returns {Object}
   */
  getEstado() {
    return {
      imprimiendo: this.imprimiendo,
      config: { ...this.config },
      disponible: this.validarConectividad()
    };
  }

  /**
   * Función helper para esperar
   */
  esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exportar instancia singleton
export const printerService = new PrinterService();

// Exportar clase para crear instancias personalizadas
export default PrinterService;
