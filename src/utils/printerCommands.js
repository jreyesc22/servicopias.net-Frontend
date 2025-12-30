/**
 * Comandos ESC/POS para impresoras térmicas
 * Estos comandos son estándar para la mayoría de impresoras compatibles con ESC/POS
 */

/**
 * Comandos básicos de impresora
 */
export const ESC_POS = {
  // Inicialización y reset
  INIT: '\x1B\x40',                    // Inicializar impresora
  
  // Alimentación de papel
  LINE_FEED: '\x0A',                   // Salto de línea (LF)
  FEED_LINES: (n) => `\x1B\x64${String.fromCharCode(n)}`, // Alimentar n líneas
  
  // Corte de papel
  CUT_FULL: '\x1D\x56\x00',            // Corte completo
  CUT_PARTIAL: '\x1D\x56\x01',         // Corte parcial
  CUT_FULL_FEED: '\x1D\x56\x41',      // Corte completo con alimentación
  
  // Cajón de dinero
  OPEN_DRAWER_PIN2: '\x1B\x70\x00\x19\xFA',  // Abrir cajón (pin 2)
  OPEN_DRAWER_PIN5: '\x1B\x70\x01\x19\xFA',  // Abrir cajón (pin 5)
  
  // Formato de texto
  BOLD_ON: '\x1B\x45\x01',             // Activar negrita
  BOLD_OFF: '\x1B\x45\x00',            // Desactivar negrita
  UNDERLINE_ON: '\x1B\x2D\x01',        // Activar subrayado
  UNDERLINE_OFF: '\x1B\x2D\x00',       // Desactivar subrayado
  
  // Tamaño de texto
  TEXT_NORMAL: '\x1D\x21\x00',         // Texto normal
  TEXT_DOUBLE_HEIGHT: '\x1D\x21\x01',  // Altura doble
  TEXT_DOUBLE_WIDTH: '\x1D\x21\x10',   // Ancho doble
  TEXT_DOUBLE_BOTH: '\x1D\x21\x11',    // Ancho y alto doble
  
  // Alineación
  ALIGN_LEFT: '\x1B\x61\x00',          // Alinear izquierda
  ALIGN_CENTER: '\x1B\x61\x01',        // Alinear centro
  ALIGN_RIGHT: '\x1B\x61\x02',         // Alinear derecha
  
  // Código de barras
  BARCODE_HEIGHT: (h) => `\x1D\x68${String.fromCharCode(h)}`, // Altura código barras
  BARCODE_WIDTH: (w) => `\x1D\x77${String.fromCharCode(w)}`,  // Ancho código barras
  
  // QR Code
  QR_MODEL: '\x1D\x28\x6B\x04\x00\x31\x41\x32\x00',  // Modelo 2
  QR_SIZE: (size) => `\x1D\x28\x6B\x03\x00\x31\x43${String.fromCharCode(size)}`, // Tamaño (1-16)
  QR_ERROR_CORRECTION: '\x1D\x28\x6B\x03\x00\x31\x45\x31', // Corrección error nivel L
  QR_STORE: (data) => {
    const len = data.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);
    return `\x1D\x28\x6B${String.fromCharCode(pL)}${String.fromCharCode(pH)}\x31\x50\x30${data}`;
  },
  QR_PRINT: '\x1D\x28\x6B\x03\x00\x31\x51\x30',  // Imprimir QR
};

/**
 * Función para abrir el cajón de dinero
 * @param {number} pin - Pin del cajón (2 o 5), por defecto 2
 * @returns {string} Comando ESC/POS
 */
export function abrirCajon(pin = 2) {
  return pin === 5 ? ESC_POS.OPEN_DRAWER_PIN5 : ESC_POS.OPEN_DRAWER_PIN2;
}

/**
 * Función para cortar el papel
 * @param {string} type - Tipo de corte: 'full', 'partial', 'full-feed'
 * @returns {string} Comando ESC/POS
 */
export function cortarPapel(type = 'full') {
  switch (type) {
    case 'partial':
      return ESC_POS.CUT_PARTIAL;
    case 'full-feed':
      return ESC_POS.CUT_FULL_FEED;
    case 'full':
    default:
      return ESC_POS.CUT_FULL;
  }
}

/**
 * Función para alimentar líneas de papel
 * @param {number} lines - Número de líneas a alimentar
 * @returns {string} Comando ESC/POS
 */
export function alimentarLineas(lines = 3) {
  return ESC_POS.FEED_LINES(lines);
}

/**
 * Función para generar secuencia de finalización estándar
 * @param {Object} options - Opciones de finalización
 * @param {boolean} options.abrirCajon - Abrir cajón de dinero
 * @param {number} options.lineasExtra - Líneas extra antes de cortar
 * @param {string} options.tipCorte - Tipo de corte
 * @returns {string} Secuencia de comandos
 */
export function finalizarImpresion(options = {}) {
  const {
    abrirCajon: shouldOpenDrawer = true,
    lineasExtra = 3,
    tipoCorte = 'full'
  } = options;

  let comandos = '';
  
  // Alimentar líneas extra
  if (lineasExtra > 0) {
    comandos += alimentarLineas(lineasExtra);
  }
  
  // Abrir cajón si se solicita
  if (shouldOpenDrawer) {
    comandos += abrirCajon();
  }
  
  // Cortar papel
  comandos += cortarPapel(tipoCorte);
  
  return comandos;
}

/**
 * Función para aplicar formato de texto
 * @param {string} texto - Texto a formatear
 * @param {Object} formato - Opciones de formato
 * @returns {string} Texto con comandos ESC/POS
 */
export function formatearTexto(texto, formato = {}) {
  const {
    bold = false,
    underline = false,
    size = 'normal', // 'normal', 'double-height', 'double-width', 'double-both'
    align = 'left'   // 'left', 'center', 'right'
  } = formato;

  let resultado = '';
  
  // Alineación
  switch (align) {
    case 'center':
      resultado += ESC_POS.ALIGN_CENTER;
      break;
    case 'right':
      resultado += ESC_POS.ALIGN_RIGHT;
      break;
    default:
      resultado += ESC_POS.ALIGN_LEFT;
  }
  
  // Tamaño
  switch (size) {
    case 'double-height':
      resultado += ESC_POS.TEXT_DOUBLE_HEIGHT;
      break;
    case 'double-width':
      resultado += ESC_POS.TEXT_DOUBLE_WIDTH;
      break;
    case 'double-both':
      resultado += ESC_POS.TEXT_DOUBLE_BOTH;
      break;
    default:
      resultado += ESC_POS.TEXT_NORMAL;
  }
  
  // Negrita
  if (bold) resultado += ESC_POS.BOLD_ON;
  
  // Subrayado
  if (underline) resultado += ESC_POS.UNDERLINE_ON;
  
  // Texto
  resultado += texto;
  
  // Resetear formato
  if (underline) resultado += ESC_POS.UNDERLINE_OFF;
  if (bold) resultado += ESC_POS.BOLD_OFF;
  resultado += ESC_POS.TEXT_NORMAL;
  resultado += ESC_POS.ALIGN_LEFT;
  
  return resultado;
}

/**
 * Función para imprimir código QR
 * @param {string} data - Datos para el QR
 * @param {number} size - Tamaño del QR (1-16)
 * @returns {string} Comandos ESC/POS para QR
 */
export function imprimirQR(data, size = 6) {
  return ESC_POS.QR_MODEL +
         ESC_POS.QR_SIZE(size) +
         ESC_POS.QR_ERROR_CORRECTION +
         ESC_POS.QR_STORE(data) +
         ESC_POS.QR_PRINT;
}

export default {
  ESC_POS,
  abrirCajon,
  cortarPapel,
  alimentarLineas,
  finalizarImpresion,
  formatearTexto,
  imprimirQR
};
