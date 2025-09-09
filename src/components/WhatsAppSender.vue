<template>
  <div class="whatsapp-sender">
    <v-btn
      :color="color || 'success'"
      :variant="variant || 'elevated'" 
      :size="size || 'default'"
      @click="enviarPorWhatsApp"
      :disabled="enviando"
    >
      <v-icon start>mdi-whatsapp</v-icon>
      {{ enviando ? 'Enviando...' : (buttonText || 'Enviar WhatsApp') }}
    </v-btn>
  </div>
</template>

<script>
import { generarMensajeWhatsApp } from '@/utils/ticketTemplate.js'

export default {
  name: "WhatsAppSender",
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
      default: null
    },
    buttonText: {
      type: String,
      default: 'Enviar por WhatsApp'
    },
    color: {
      type: String,
      default: 'success'
    },
    variant: {
      type: String,
      default: 'elevated'
    },
    size: {
      type: String,
      default: 'default'
    }
  },
  emits: [
    'whatsapp-enviado',
    'whatsapp-error'
  ],
  data() {
    return {
      enviando: false
    }
  },
  methods: {
    async enviarPorWhatsApp() {
      if (this.enviando) {
        console.warn('Ya hay un envío de WhatsApp en proceso');
        return;
      }

      this.enviando = true;

      try {
        // Validar número de teléfono
        if (!this.orden.cliente_telefono || 
            this.orden.cliente_telefono === 'N/A' || 
            this.orden.cliente_telefono.trim() === '') {
          throw new Error('No hay número de teléfono válido en la orden');
        }

        // Generar texto para WhatsApp usando la plantilla compartida
        const texto = encodeURIComponent(generarMensajeWhatsApp(this.orden, this.pago));
        let telefono = this.orden.cliente_telefono.replace(/\D/g, '');

        // Validar que el número no esté vacío después de limpiar
        if (!telefono) {
          throw new Error('Número de teléfono inválido después de procesar');
        }

        // Agregar código de país si no lo tiene
        if (!telefono.startsWith('502')) {
          telefono = '502' + telefono;
        }

        // Validar longitud del número (Guatemala: 502 + 8 dígitos = 11 total)
        if (telefono.length < 10) {
          throw new Error('Número de teléfono muy corto');
        }

        const url = `https://wa.me/${telefono}?text=${texto}`;
        
        // Abrir WhatsApp
        window.open(url, '_blank');
        
        console.log('WhatsApp abierto exitosamente');
        
        // Emitir evento de éxito
        this.$emit('whatsapp-enviado', {
          telefono: telefono,
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.warn('Error al enviar por WhatsApp:', error.message);
        
        // Emitir evento de error
        this.$emit('whatsapp-error', {
          error: error.message,
          telefono: this.orden.cliente_telefono,
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      } finally {
        this.enviando = false;
      }
    }
  }
};
</script>

<style scoped>
.whatsapp-sender {
  display: inline-block;
}
</style>