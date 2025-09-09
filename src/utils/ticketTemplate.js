// Función helper para formatear números de forma segura
export function formatearNumero(valor) {
  const numero = parseFloat(valor);
  return isNaN(numero) ? 0.00 : numero.toFixed(2);
}

// Función helper para truncar texto de forma segura
export function truncarTexto(texto, longitud) {
  const textoSeguro = String(texto || '').trim();
  return textoSeguro.padEnd(longitud, ' ').slice(0, longitud);
}

// Función para obtener forma de pago con fallbacks
export function obtenerFormaPago(orden, pago) {
  if (pago?.forma_pago) return pago.forma_pago;
  if (pago?.metodo) return pago.metodo;
  if (orden?.tipoPago?.nombre) return orden.tipoPago.nombre;
  return 'Efectivo';
}

// Función principal para generar el ticket
export function generarTicket(orden, pago = null) {
  try {
    // Validar datos esenciales
    if (!orden || !orden.items || !Array.isArray(orden.items)) {
      throw new Error('Datos de orden inválidos');
    }

    let ticket = `

           PROFORMA  No. ${orden.id || 'N/A'}

            DATOS DEL CLIENTE 
Cliente: ${orden.cliente_nombre || 'Consumidor Final'}
NIT: ${orden.cliente_nit || 'CF'}
Tel: ${orden.cliente_telefono || 'N/A'}
---------------------------------------------
`;

    ticket += `Producto             Cant  PrecioU.  Subtotal\n`;
    ticket += `---------------------------------------------\n`;

    // Generar líneas de productos con validación
    orden.items.forEach((item, index) => {
      try {
        const nombre = truncarTexto(item.nombre || `Producto ${index + 1}`, 20);
        const cantidad = String(item.cantidad || 0).padStart(3, ' ');
        const punit = formatearNumero(item.precio_unitario).padStart(8, ' ');
        const subtotal = formatearNumero(item.subtotal).padStart(9, ' ');
        ticket += `${nombre} ${cantidad} Q${punit} Q${subtotal}\n`;
      } catch (itemError) {
        console.warn('Error procesando item:', itemError);
        ticket += `Item ${index + 1}          ERROR EN FORMATO\n`;
      }
    });

    ticket += `---------------------------------------------\n`;
    ticket += `      TOTAL: Q ${formatearNumero(orden.total)}\n`;

    // Mostrar forma de pago con múltiples fallbacks
    const formaPago = obtenerFormaPago(orden, pago);

    if (pago) {
      const montoPagado = pago.monto_pagado || pago.monto || 0;
      const vuelto = pago.vuelto || 0;
      
      ticket += `

              DETALLE DE PAGO
Forma de pago:   ${formaPago}
Pagado:         Q ${formatearNumero(montoPagado)}
Cambio:         Q ${formatearNumero(vuelto)}

`;
    }

    ticket += `
          SERVICOPIAS.NET
  8 Ave. 7-25, Zona 1, Salamá B.V
  Tel: 5188-6437 | www.servicopias.net

\n \n
`;
    // Comandos ESC/POS (solo para impresión)
    ticket += '\x1B\x70\x00\x19\xFA'; // abrir cajón de dinero
    ticket += '\x1D\x56\x00'; // comando de corte

    return ticket;

  } catch (error) {
    console.error('Error generando ticket:', error);
    throw new Error(`Error al generar ticket: ${error.message}`);
  }
}

// Función para generar mensaje de WhatsApp (sin comandos ESC/POS)
export function generarMensajeWhatsApp(orden, pago = null) {
  try {
    // Usar la misma lógica base pero adaptar para WhatsApp
    let mensaje = `*SERVICOPIAS.NET*\n\n`;
    mensaje += `*PROFORMA No. ${orden.id || 'N/A'}*\n\n`;
    mensaje += `*DATOS DEL CLIENTE*\n`;
    mensaje += `Cliente: ${orden.cliente_nombre || 'Consumidor Final'}\n`;
    mensaje += `NIT: ${orden.cliente_nit || 'CF'}\n\n`;
    mensaje += `---------------------------------------------\n`;
    mensaje += `Producto | Cant | PrecioU. | Subtotal\n`;
    mensaje += `---------------------------------------------\n`;

    // Generar líneas de productos
    orden.items.forEach((item, index) => {
      try {
        const nombre = truncarTexto(item.nombre || `Producto ${index + 1}`, 20);
        mensaje += `${nombre} | ${item.cantidad} | Q${formatearNumero(item.precio_unitario)} | Q${formatearNumero(item.subtotal)}\n`;
      } catch (itemError) {
        mensaje += `Item ${index + 1} - ERROR EN FORMATO\n`;
      }
    });

    mensaje += `---------------------------------------------\n`;
    mensaje += `*TOTAL: Q ${formatearNumero(orden.total)}*\n\n`;

    // Mostrar forma de pago
    if (pago) {
      const formaPago = obtenerFormaPago(orden, pago);
      const montoPagado = pago.monto_pagado || pago.monto || 0;
      const vuelto = pago.vuelto || 0;
      
      mensaje += `*DETALLE DE PAGO*\n`;
      mensaje += `Forma de pago: ${formaPago}\n`;
      mensaje += `Pagado: Q ${formatearNumero(montoPagado)}\n`;
      
      if (vuelto > 0) {
        mensaje += `Cambio: Q ${formatearNumero(vuelto)}\n`;
      }
    }

    mensaje += `\n*SERVICOPIAS.NET*\n`;
    mensaje += `8 Ave. 7-25, Zona 1, Salamá B.V\n`;
    mensaje += `Tel: 5188-6437 | www.servicopias.net\n`;

    return mensaje;
  } catch (error) {
    console.error('Error generando mensaje WhatsApp:', error);
    throw new Error(`Error al generar mensaje: ${error.message}`);
  }
}