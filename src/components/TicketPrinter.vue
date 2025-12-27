<template>
  <div><!-- componente invisible, solo para imprimir --></div>
</template>

<script>
import { generarTicket } from '@/utils/ticketTemplate.js'

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
      default: 'http://192.168.1.15:3005'
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
    // Función helper para validar conectividad
    async validarConectividad() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(this.servidorImpresion, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: 'TEST',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.status !== 0;
        
      } catch (error) {
        console.warn('TicketPrinter: Servidor no disponible:', error.message);
        return false;
      }
    },

    async imprimir() {
      console.log('TicketPrinter: Iniciando impresión orden', this.orden.id);
      
      if (this.imprimiendo) {
        console.warn('TicketPrinter: Ya hay una impresión en proceso');
        return;
      }

      this.imprimiendo = true;

      try {
        // Validar conectividad
        const conectividadOk = await this.validarConectividad();
        if (!conectividadOk) {
          throw new Error('Servidor de impresión no disponible. Verifique la conexión.');
        }

        // Generar ticket
        const texto = generarTicket(this.orden, this.pago);
        console.log('TicketPrinter: Ticket generado, longitud:', texto.length);

        // Enviar a impresora
        const response = await fetch(this.servidorImpresion, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: texto
        });

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        console.log('TicketPrinter: Ticket enviado exitosamente');
        
        // Emitir evento de éxito
        this.$emit('impresion-exitosa', {
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });

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

    // Método público para reimprimir
    async reimprimir() {
      console.log('TicketPrinter: Iniciando reimpresión');
      return await this.imprimir();
    },

    // Método público para obtener estado
    getEstado() {
      return {
        imprimiendo: this.imprimiendo,
        servidorDisponible: this.validarConectividad()
      };
    }
  },

  // Validar props al montar
  mounted() {
    if (!this.orden) {
      console.error('TicketPrinter: Prop "orden" es requerida');
      return;
    }

    console.log('TicketPrinter: Componente montado - Orden:', this.orden.id);
  }
};
</script>

<style scoped>
/* Componente invisible - sin estilos necesarios */
</style>