<template>
  <div><!-- componente invisible, solo para imprimir --></div>
</template>

<script>
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
    'impresion-error',
    'whatsapp-enviado',
    'whatsapp-error'
  ],
  data() {
    return {
      imprimiendo: false,
      enviandoWhatsApp: false
    }
  },
  methods: {
    // Función helper para formatear números de forma segura
    formatearNumero(valor) {
      const numero = parseFloat(valor);
      return isNaN(numero) ? 0.00 : numero.toFixed(2);
    },

    // Función helper para truncar texto de forma segura
    truncarTexto(texto, longitud) {
      const textoSeguro = String(texto || '').trim();
      return textoSeguro.padEnd(longitud, ' ').slice(0, longitud);
    },

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

    generarTicket() {
      try {
        // Validar datos esenciales
        if (!this.orden || !this.orden.items || !Array.isArray(this.orden.items)) {
          throw new Error('Datos de orden inválidos');
        }

        let ticket = `

           PROFORMA  No. ${this.orden.id || 'N/A'}

            DATOS DEL CLIENTE 
Cliente: ${this.orden.cliente_nombre || 'Consumidor Final'}
NIT: ${this.orden.cliente_nit || 'CF'}
Tel: ${this.orden.cliente_telefono || 'N/A'}
---------------------------------------------
`;

        ticket += `Producto             Cant  PrecioU.  Subtotal\n`;
        ticket += `---------------------------------------------\n`;

        // Generar líneas de productos con validación
        this.orden.items.forEach((item, index) => {
          try {
            const nombre = this.truncarTexto(item.nombre || `Producto ${index + 1}`, 20);
            const cantidad = String(item.cantidad || 0).padStart(3, ' ');
            const punit = this.formatearNumero(item.precio_unitario).padStart(8, ' ');
            const subtotal = this.formatearNumero(item.subtotal).padStart(9, ' ');
            ticket += `${nombre} ${cantidad} Q${punit} Q${subtotal}\n`;
          } catch (itemError) {
            console.warn('Error procesando item:', itemError);
            ticket += `Item ${index + 1}          ERROR EN FORMATO\n`;
          }
        });

        ticket += `---------------------------------------------\n`;
        ticket += `      TOTAL: Q ${this.formatearNumero(this.orden.total)}\n`;

        // Mostrar forma de pago con múltiples fallbacks
        const formaPago = this.obtenerFormaPago();

        if (this.pago) {
          const montoPagado = this.pago.monto_pagado || this.pago.monto || 0;
          const vuelto = this.pago.vuelto || 0;
          
          ticket += `

              DETALLE DE PAGO
Forma de pago:   ${formaPago}
Pagado:         Q ${this.formatearNumero(montoPagado)}
Cambio:         Q ${this.formatearNumero(vuelto)}

`;
        }

        ticket += `
          SERVICOPIAS.NET
  8 Ave. 7-25, Zona 1, Salamá B.V
  Tel: 5188-6437 | www.servicopias.net

\n \n
`;
        // Comandos ESC/POS
        ticket += '\x1B\x70\x00\x19\xFA'; // abrir cajón de dinero
        ticket += '\x1D\x56\x00'; // comando de corte

        return ticket;

      } catch (error) {
        console.error('Error generando ticket:', error);
        throw new Error(`Error al generar ticket: ${error.message}`);
      }
    },

    obtenerFormaPago() {
      // Múltiples fallbacks para obtener forma de pago
      if (this.pago?.forma_pago) return this.pago.forma_pago;
      if (this.pago?.metodo) return this.pago.metodo;
      if (this.orden?.tipoPago?.nombre) return this.orden.tipoPago.nombre;
      return 'Efectivo';
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

        // Generar ticket
        const texto = this.generarTicket();

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

        // Enviar por WhatsApp automáticamente
        await this.enviarPorWhatsApp();

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

    async enviarPorWhatsApp() {
      if (this.enviandoWhatsApp) {
        console.warn('Ya hay un envío de WhatsApp en proceso');
        return;
      }

      this.enviandoWhatsApp = true;

      try {
        // Validar número de teléfono
        if (!this.orden.cliente_telefono || 
            this.orden.cliente_telefono === 'N/A' || 
            this.orden.cliente_telefono.trim() === '') {
          throw new Error('No hay número de teléfono válido en la orden');
        }

        // Generar texto para WhatsApp
        const texto = encodeURIComponent(this.generarTicket());
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
        
        // Emitir evento de error (no crítico)
        this.$emit('whatsapp-error', {
          error: error.message,
          telefono: this.orden.cliente_telefono,
          orden_id: this.orden.id,
          timestamp: new Date().toISOString()
        });

        // No re-lanzar el error ya que WhatsApp es opcional

      } finally {
        this.enviandoWhatsApp = false;
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
        enviandoWhatsApp: this.enviandoWhatsApp,
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