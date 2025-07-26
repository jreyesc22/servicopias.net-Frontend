<template>
  <div><!-- componente invisible, solo para imprimir --></div>
</template>

<script>
export default {
  name: "TicketPrinter",
  props: {
    orden: {
      type: Object,
      required: true
    },
    pago: {
      type: Object,
      default: null
    }
  },
  methods: {
    generarTicket() {
      let ticket = `

           PROFORMA  No. ${this.orden.id}

            DATOS DEL CLIENTE 
Cliente: ${this.orden.cliente_nombre}
NIT: ${this.orden.cliente_nit}
Tel: ${this.orden.cliente_telefono}
---------------------------------------------
`;

      ticket += `Producto             Cant  PrecioU.  Subtotal\n`;
      ticket += `---------------------------------------------\n`;

      this.orden.items.forEach(item => {
        const nombre = (item.nombre || " ").padEnd(20, " ").slice(0, 20);
        const cantidad = String(item.cantidad).padStart(3, " ");
        const punit = item.precio_unitario.toFixed(2).padStart(6, "  ");
        const subtotal = item.subtotal.toFixed(2).padStart(7, "  ");
        ticket += `${nombre} ${cantidad} Q ${punit} Q ${subtotal}\n`;
      });

      ticket += `---------------------------------------------\n`;
      ticket += `      TOTAL: Q ${this.orden.total.toFixed(2)}\n`;

      // Mostrar forma de pago
      const formaPago =
        this.pago?.forma_pago ||
        this.orden?.tipoPago?.nombre ||
        "N/D";

      if (this.pago) {
        ticket += `

              DETALLE DE PAGO
Forma de pago:   ${formaPago}
Pagado:         Q ${Number(this.pago.monto_pagado || 0).toFixed(2)}
Cambio:         Q ${Number(this.pago.vuelto || 0).toFixed(2)}

`;
      }

      ticket += `
          SERVICOPIAS.NET
  8 Ave. 7-25, Zona 1, Salamá B.V
  Tel: 5188-6437 | www.servicopias.net

\n \n
`; 
ticket += '\x1B\x70\x00\x19\xFA'; // comando ESC/POS para abrir el cajón de dinero
      ticket += '\x1D\x56\x00'; // comando ESC/POS de corte
     

      return ticket;
    },
    imprimir() {
      const texto = this.generarTicket();
      fetch("http://192.168.1.15:3005", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: texto
      })
        .then(() => {
          console.log("Ticket enviado a la impresora POS");
          this.enviarPorWhatsApp(); // <-- Llama aquí al método
        })
        .catch(console.error);
    }, 
      enviarPorWhatsApp() {
  if (!this.orden.cliente_telefono || this.orden.cliente_telefono === "N/A") {
    console.warn("No hay número de teléfono válido en la orden.");
    return;
  }

  const texto = encodeURIComponent(this.generarTicket());
  let telefono = this.orden.cliente_telefono.replace(/\D/g, '');

  if (!telefono.startsWith('502')) {
    telefono = '502' + telefono;
  }

  const url = `https://wa.me/${telefono}?text=${texto}`;
  window.open(url, '_blank');
}
  }
};
</script>
