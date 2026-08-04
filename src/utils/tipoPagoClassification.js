const normalizarTexto = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const CLASIFICACIONES_POR_ID = {
  1: {
    clave: 'efectivo',
    etiqueta: 'Efectivo',
    grupo: 'efectivo',
    afectaCaja: true,
    color: 'success',
    icon: 'mdi-cash'
  },
  2: {
    clave: 'tarjeta_credito',
    etiqueta: 'Tarjeta de Crédito',
    grupo: 'bancario',
    afectaCaja: false,
    color: 'primary',
    icon: 'mdi-credit-card'
  },
  3: {
    clave: 'transferencia_bancaria',
    etiqueta: 'Transferencia Bancaria',
    grupo: 'bancario',
    afectaCaja: false,
    color: 'info',
    icon: 'mdi-bank-transfer'
  }
};

const clasificarPorNombre = (nombre = '') => {
  const texto = normalizarTexto(nombre);

  if (texto.includes('efectivo')) {
    return CLASIFICACIONES_POR_ID[1];
  }

  if (
    texto.includes('tarjeta') ||
    texto.includes('credito') ||
    texto.includes('debito') ||
    texto.includes('cheque')
  ) {
    return CLASIFICACIONES_POR_ID[2];
  }

  if (texto.includes('transfer')) {
    return CLASIFICACIONES_POR_ID[3];
  }

  return null;
};

export const clasificarTipoPago = (tipoPago = {}) => {
  const id = Number(tipoPago.id);
  const clasificacion = CLASIFICACIONES_POR_ID[id] || clasificarPorNombre(tipoPago.nombre) || {
    clave: id ? `tipo_${id}` : 'otros',
    etiqueta: tipoPago.nombre || 'Otro',
    grupo: 'otros',
    afectaCaja: false,
    color: 'grey',
    icon: 'mdi-swap-horizontal'
  };

  return {
    id: Number.isNaN(id) ? tipoPago.id : id,
    nombre: tipoPago.nombre || '',
    ...clasificacion
  };
};

export const enriquecerTipoPago = (tipoPago) => {
  if (!tipoPago) {
    return null;
  }

  return {
    ...tipoPago,
    clasificacion: clasificarTipoPago(tipoPago)
  };
};

export const enriquecerListaTiposPago = (tiposPago = []) => {
  return tiposPago.map((tipoPago) => enriquecerTipoPago(tipoPago));
};

export const clasificarMovimientos = (movimientos = []) => {
  const resumen = {
    total_movimientos: movimientos.length,
    total_ingresos: 0,
    total_egresos: 0,
    balance_del_dia: 0,
    clasificacion: {
      efectivo: {
        ingresos: 0,
        egresos: 0,
        neto: 0
      },
      bancario: {
        ingresos: 0,
        egresos: 0,
        neto: 0
      },
      otros: {
        ingresos: 0,
        egresos: 0,
        neto: 0
      }
    }
  };

  movimientos.forEach((movimiento) => {
    const monto = Number(movimiento.monto || 0);
    const clasificacion = movimiento.tipo_pago_clasificacion || clasificarTipoPago(movimiento.TipoPago || {});
    const grupo = resumen.clasificacion[clasificacion.grupo] ? clasificacion.grupo : 'otros';

    if (movimiento.tipo_movimiento === 'ingreso') {
      resumen.total_ingresos += monto;
      resumen.clasificacion[grupo].ingresos += monto;
    } else if (movimiento.tipo_movimiento === 'egreso') {
      resumen.total_egresos += monto;
      resumen.clasificacion[grupo].egresos += monto;
    }
  });

  Object.values(resumen.clasificacion).forEach((grupo) => {
    grupo.neto = grupo.ingresos - grupo.egresos;
  });

  resumen.balance_del_dia = resumen.total_ingresos - resumen.total_egresos;
  resumen.caja_esperada = resumen.clasificacion.efectivo.neto;
  resumen.total_bancario = resumen.clasificacion.bancario.neto;
  resumen.total_otros = resumen.clasificacion.otros.neto;

  return resumen;
};