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
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout
        
        const response = await fetch(this.servidorImpresion, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
      } catch (error) {
        console.warn('Servidor de impresión no disponible:', error.message);
        return false;
      }
    },

    async imprimir() {
      if (this.imprimiendo) {
        console.warn('Ya hay una impresión en proceso');
        return;
      }

      this.imprimiendo = true;

      try {
        // Validar conectividad antes de intentar imprimir
        const conectividadOk = await this.validarConectividad();
        if (!conectividadOk) {
          throw new Error('Servidor de impresión no disponible. Verifique la conexión.');
        }

        // Generar ticket usando la plantilla compartida
        const texto = generarTicket(this.orden, this.pago);

        // Enviar a impresora
        const response = await fetch(this.servidorImpresion, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: texto
        });

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        console.log('Ticket enviado a la impresora POS exitosamente');
        
        // Emitir evento de éxito
        this.$emit('impresion-exitosa', {
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error al imprimir:', error);
        
        // Emitir evento de error
        this.$emit('impresion-error', {
          error: error.message,
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });

        // Re-lanzar error para manejo adicional si es necesario
        throw error;

      } finally {
        this.imprimiendo = false;
      }
    },

    // Método público para reimprimir
    async reimprimir() {
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

    console.log('TicketPrinter montado correctamente', {
      orden_id: this.orden.id,
      tiene_pago: !!this.pago,
      servidor: this.servidorImpresion
    });
  }
};
</script>

<style scoped>
/* Componente invisible - sin estilos necesarios */
</style>