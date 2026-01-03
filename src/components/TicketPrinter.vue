<template>
  <div><!-- componente invisible, solo para imprimir --></div>
</template>

<script>
import { generarTicket } from '@/utils/ticketTemplate.js'
import { printerService } from '@/services/printer.service.js'

export default {
  name: "TicketPrinter",
  props: {
    orden: {
      type: Object,
      required: true,
      validator(value) {
        return value && 
               typeof value.id !== 'undefined' && 
               typeof value.cliente_nombre === 'string' &&
               Array.isArray(value.items) &&
               typeof value.total === 'number'
      }
    },
    pago: {
      type: Object,
      default: null,
      validator(value) {
        if (value === null) return true
        return value && 
               (typeof value.monto === 'number' || typeof value.monto_pagado === 'number') &&
               (typeof value.metodo === 'string' || typeof value.forma_pago === 'string')
      }
    },
    servidorImpresion: {
      type: String,
      default: process.env.VUE_APP_PRINTER_SERVER_URL || 'http://192.168.1.15:3005'
    },
    abrirCajon: {
      type: Boolean,
      default: true
    },
    cortarPapel: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'impresion-exitosa',
    'impresion-error'
  ],
  data() {
    return {
      imprimiendo: false
    }
  },
  methods: {
    /**
     * Imprimir ticket usando el servicio centralizado
     */
    async imprimir() {
      console.log('TicketPrinter: Iniciando impresión orden', this.orden.id);
      
      if (this.imprimiendo) {
        console.warn('TicketPrinter: Ya hay una impresión en proceso');
        return;
      }

      this.imprimiendo = true;

      try {
        // Generar ticket usando la plantilla
        const textoTicket = generarTicket(this.orden, this.pago);
        console.log('TicketPrinter: Ticket generado, longitud:', textoTicket.length);

        // Configurar el servicio con la URL proporcionada
        printerService.configurar({ 
          servidorUrl: this.servidorImpresion 
        });

        // Imprimir usando el servicio (sin agregar comandos extra, ya están en generarTicket)
        const resultado = await printerService.imprimirRaw(textoTicket, {
          validarConexion: true,
          abrirCajon: false, // Ya incluido en el ticket
          cortar: false      // Ya incluido en el ticket
        });

        if (resultado.success) {
          console.log('TicketPrinter: Ticket enviado exitosamente');
          
          // Emitir evento de éxito
          this.$emit('impresion-exitosa', {
            orden_id: this.orden.id,
            timestamp: resultado.timestamp,
            intentos: resultado.intentos
          });
        } else {
          throw new Error(resultado.error || 'Error desconocido');
        }

      } catch (error) {
        console.error('TicketPrinter: Error al imprimir:', error.message);
        
        // Emitir evento de error
        this.$emit('impresion-error', {
          error: error.message,
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });

        throw error;

      } finally {
        this.imprimiendo = false;
      }
    },

    /**
     * Método público para reimprimir
     */
    async reimprimir() {
      console.log('TicketPrinter: Iniciando reimpresión');
      return await this.imprimir();
    },

    /**
     * Método público para obtener estado
     */
    getEstado() {
      return {
        imprimiendo: this.imprimiendo,
        servicio: printerService.getEstado()
      };
    },

    /**
     * Método para validar conectividad (expuesto para uso externo)
     */
    async validarConectividad() {
      printerService.configurar({ 
        servidorUrl: this.servidorImpresion 
      });
      return await printerService.validarConectividad();
    }
  },

  // Validar props al montar
  mounted() {
    if (!this.orden) {
      console.error('TicketPrinter: Prop "orden" es requerida');
      return;
    }

    // Configurar el servicio con la URL proporcionada
    printerService.configurar({ 
      servidorUrl: this.servidorImpresion 
    });

    console.log('TicketPrinter: Componente montado - Orden:', this.orden.id);
  }
};
</script>

<style scoped>
/* Componente invisible - sin estilos necesarios */
</style>