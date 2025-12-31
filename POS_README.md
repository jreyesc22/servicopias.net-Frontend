# Módulo POS (Punto de Venta) - ServiCopias.net

**Fecha de creación:** 30 de diciembre de 2025  
**Sistema:** ServiCopias - Sistema de Gestión de Ventas  
**Framework:** Vue 3 (Composition API) + Vuetify 3

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Componentes](#componentes)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Integración con Backend](#integración-con-backend)
6. [Uso y Características](#uso-y-características)

---

## 🎯 Descripción General

El módulo POS es un **sistema de punto de venta rápido** diseñado específicamente para ventas directas con escáner de código de barras. A diferencia del módulo de órdenes tradicional, el POS:

- ✅ **Enfoque en velocidad**: Ventas rápidas y eficientes
- ✅ **Escaneo automático**: Compatible con lectores de código de barras
- ✅ **Búsqueda manual**: Selector de productos integrado
- ✅ **Pago inmediato**: Proceso de pago simplificado
- ✅ **Reutilización de componentes**: Aprovecha componentes existentes del sistema

### Diferencias con Módulo de Órdenes

| Característica | Órdenes Tradicionales | POS (Venta Rápida) |
|----------------|----------------------|-------------------|
| **Enfoque** | Órdenes de trabajo/producción | Ventas directas al cliente |
| **Entrada** | Formulario detallado | Escáner de código de barras |
| **Estados** | Múltiples (pendiente, proceso, etc.) | Entregado inmediatamente |
| **Flujo** | Orden → Producción → Entrega → Pago | Producto → Pago → Entrega |
| **Cliente** | Datos completos | CF por defecto |

---

## 🏗️ Arquitectura

### Estructura de Carpetas

```
Frontend/src/
├── components/
│   ├── pos/
│   │   ├── ScannerInput.vue       # Input para escáner de código de barras
│   │   ├── CarritoPOS.vue         # Carrito de compras con tabla de items
│   │   └── PagoPOS.vue            # Dialog de procesamiento de pago
│   └── composables/
│       └── usePOS.js              # Lógica de negocio del POS
├── services/
│   └── pos.service.js             # Servicios HTTP para POS
└── views/
    └── POS.vue                    # Vista principal del POS

Backend/app/
├── controllers/
│   └── item.controller.js         # Búsqueda por código de barras
└── routes/
    └── item.routes.js             # Ruta GET /buscar-codigo/:codigo
```

---

## 🧩 Componentes

### 1. **ScannerInput.vue**
**Propósito:** Input especializado para escaneo de códigos de barras

**Características:**
- ✅ Auto-enfoque para mantener input activo
- ✅ Detección automática de scanner (vs. entrada manual)
- ✅ Estadísticas de escaneo (exitosos, errores)
- ✅ Feedback visual inmediato
- ✅ Auto-limpieza después de escanear

**Props:**
```javascript
{
  procesando: Boolean,        // Estado de carga
  deshabilitado: Boolean,     // Deshabilitar input
  mostrarEstadisticas: Boolean, // Mostrar contadores
  autoLimpiar: Boolean,       // Limpiar input automáticamente
  tiempoAutoLimpiar: Number   // Tiempo en ms para auto-limpiar
}
```

**Eventos:**
```javascript
@codigo-escaneado  // Emite el código escaneado
@resultado         // Emite resultado de búsqueda
```

**Métodos expuestos:**
```javascript
enfocarInput()           // Re-enfocar el input
actualizarResultado()    // Actualizar feedback visual
reiniciarEstadisticas()  // Reset contadores
```

---

### 2. **CarritoPOS.vue**
**Propósito:** Visualización y gestión del carrito de compras

**Características:**
- ✅ Tabla con imagen, nombre, precio y cantidad
- ✅ Botones +/- para ajustar cantidades
- ✅ Input numérico para cantidad manual
- ✅ Botón eliminar por item
- ✅ Botón vaciar carrito con confirmación
- ✅ Resumen de totales (subtotal, descuento, total)
- ✅ Botón "Procesar Venta"

**Props:**
```javascript
{
  items: Array,      // Items en el carrito
  descuento: Number  // Descuento aplicado (opcional)
}
```

**Eventos:**
```javascript
@actualizar-cantidad  // (itemId, nuevaCantidad)
@eliminar-item        // (itemId)
@vaciar-carrito       // ()
@procesar-venta       // ()
```

**Estructura de Item:**
```javascript
{
  id: Number,
  nombre: String,
  precio: Number,
  cantidad: Number,
  codigo_barras: String,
  stock: Number,
  imagen_url: String,
  descripcion: String
}
```

---

### 3. **PagoPOS.vue**
**Propósito:** Dialog para procesar el pago de la venta

**Características:**
- ✅ Resumen visual del total
- ✅ Formulario de datos del cliente (nombre, teléfono, NIT)
- ✅ Selector de método de pago
- ✅ Chips: Pago Completo vs. A Crédito
- ✅ Cálculo automático de cambio (para efectivo)
- ✅ Validaciones integradas
- ✅ Alertas de feedback

**Props:**
```javascript
{
  modelValue: Boolean,     // Control del dialog (v-model)
  total: Number,           // Total de la venta
  cantidadItems: Number,   // Cantidad de items
  cliente: Object,         // Datos del cliente
  tiposDePago: Array,      // Métodos de pago disponibles
  efectivoId: Number       // ID del tipo de pago efectivo
}
```

**Eventos:**
```javascript
@update:modelValue  // Control del dialog
@confirmar          // (datosPago) - Confirmar venta
@cancelar           // Cancelar operación
```

**Objeto datosPago:**
```javascript
{
  pagaCompleto: Boolean,        // true = pago completo, false = crédito
  tipoPagoId: Number,           // ID del método de pago
  efectivoRecibido: Number,     // Monto recibido (solo efectivo)
  cambio: Number                // Cambio calculado
}
```

---

### 4. **usePOS.js** (Composable)
**Propósito:** Lógica de negocio centralizada del POS

**Estado Reactivo:**
```javascript
const {
  // Estado
  carrito,              // ref([]) - Items en el carrito
  cargando,             // ref(false) - Estado de carga
  error,                // ref(null) - Mensajes de error
  ultimoCodigoEscaneado, // ref('') - Último código procesado
  productos,            // ref([]) - Productos disponibles
  busquedaTexto,        // ref('') - Texto de búsqueda
  cliente,              // ref({}) - Datos del cliente
  
  // Computed
  subtotal,             // Suma de precios x cantidad
  cantidadItems,        // Total de items en carrito
  total,                // Total final
  
  // Métodos
  buscarPorCodigo,      // async (codigo) => Promise<Result>
  agregarAlCarrito,     // (producto, cantidad = 1)
  actualizarCantidad,   // (itemId, nuevaCantidad)
  eliminarDelCarrito,   // (itemId)
  vaciarCarrito,        // ()
  cargarProductos,      // async () => Promise<void>
  buscarProductosTexto, // async (texto) => Promise<void>
  procesarVenta         // async (datosPago) => Promise<Result>
} = usePOS();
```

**Ejemplo de uso:**
```vue
<script setup>
import { usePOS } from '@/components/composables/usePOS';

const { 
  carrito, 
  total, 
  buscarPorCodigo, 
  procesarVenta 
} = usePOS();

const onEscanear = async (codigo) => {
  const resultado = await buscarPorCodigo(codigo);
  if (resultado.success) {
    console.log('Producto agregado:', resultado.item);
  }
};
</script>
```

---

### 5. **POS.vue** (Vista Principal)
**Propósito:** Vista que integra todos los componentes del POS

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Header con hora y empleado                 │
├──────────────────┬──────────────────────────┤
│ Scanner Input    │                          │
│ (col-7)          │  Carrito POS             │
│                  │  (col-5)                 │
│ Selector Manual  │                          │
│ de Productos     │                          │
└──────────────────┴──────────────────────────┘
```

**Características:**
- ✅ Reloj en tiempo real
- ✅ Nombre del empleado actual
- ✅ Integración con scanner
- ✅ Búsqueda manual de productos
- ✅ Carrito lateral
- ✅ Dialog de pago
- ✅ Dialog de éxito con opciones de imprimir/nueva venta
- ✅ Notificaciones con snackbar

---

## 🔄 Flujo de Trabajo

### Flujo Normal de Venta

```
1. Escanear/Buscar Producto
   ├─> ScannerInput captura código
   ├─> usePOS.buscarPorCodigo()
   ├─> Backend: GET /api/items/buscar-codigo/:codigo
   └─> Producto agregado al carrito

2. Ajustar Cantidades (opcional)
   ├─> CarritoPOS permite editar
   └─> usePOS.actualizarCantidad()

3. Procesar Venta
   ├─> Click en "Procesar Venta"
   ├─> Abrir PagoPOS dialog
   └─> Ingresar datos del cliente

4. Confirmar Pago
   ├─> Seleccionar método de pago
   ├─> usePOS.procesarVenta()
   ├─> Backend: POST /api/ordenes (con origen: 'pos')
   └─> Crear orden con estado 'entregado'

5. Finalizar
   ├─> Mostrar dialog de éxito
   ├─> Opción imprimir ticket
   └─> Opción nueva venta
```

### Diagrama de Estados

```
[Carrito Vacío] 
    ↓ escanear producto
[Producto Agregado] 
    ↓ ajustar cantidades
[Carrito Listo] 
    ↓ procesar venta
[Dialog Pago] 
    ↓ confirmar
[Procesando...] 
    ↓ éxito
[Venta Completada] 
    ↓ nueva venta
[Carrito Vacío]
```

---

## 🔌 Integración con Backend

### Nuevo Endpoint: Buscar por Código de Barras

**Ruta:** `GET /api/items/buscar-codigo/:codigo`  
**Controlador:** `item.controller.js > buscarPorCodigoBarras()`

**Request:**
```http
GET /api/items/buscar-codigo/7501234567890
Authorization: Bearer <token>
```

**Response exitoso (200):**
```json
{
  "encontrado": true,
  "item": {
    "id": 15,
    "nombre": "Papel Bond Tamaño Carta",
    "precio": "35.00",
    "stock": 100,
    "codigo_barras": "7501234567890",
    "imagen_url": "/uploads/images/papel.jpg",
    "categoria": {
      "id": 2,
      "nombre": "Papelería",
      "color": "#2196F3"
    }
  }
}
```

**Response error (404):**
```json
{
  "encontrado": false,
  "error": "Producto no encontrado con ese código de barras",
  "codigo_buscado": "7501234567890"
}
```

### Crear Venta POS

**Ruta:** `POST /api/ordenes`  
**Diferenciador:** Campo `origen: 'pos'`

**Request:**
```json
{
  "cliente_nombre": "Juan Pérez",
  "cliente_telefono": "12345678",
  "cliente_nit": "12345678",
  "origen": "pos",
  "estado": "entregado",
  "estado_pago": "pagado",
  "items": [
    {
      "itemId": 15,
      "cantidad": 2,
      "precio_unitario": 35.00
    }
  ],
  "empleadoId": 1,
  "abono": {
    "monto": 70.00,
    "tipoPagoId": 1
  }
}
```

---

## 💡 Uso y Características

### Características Destacadas

#### 1. **Escaneo Automático**
- El componente detecta entrada rápida de caracteres (< 50ms entre teclas)
- Auto-enfoca el input después de cada escaneo
- Mantiene estadísticas de escaneos exitosos/fallidos

#### 2. **Búsqueda Manual**
- Reutiliza el componente `SelectorProductos`
- Búsqueda por nombre, descripción o código
- Filtros por categoría
- Paginación integrada

#### 3. **Gestión de Carrito**
- Incremento/decremento de cantidades
- Input manual de cantidad
- Validaciones de stock (futuro)
- Eliminación individual o masiva

#### 4. **Proceso de Pago**
- Cliente por defecto: "CF"
- Opciones: Pago completo o a crédito
- Cálculo automático de cambio
- Validaciones en tiempo real

#### 5. **Feedback Visual**
- Notificaciones con snackbar
- Alertas de éxito/error
- Animaciones de transición
- Colores semánticos

### Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Enter` | Procesar código escaneado |
| `Esc` | Cerrar dialogs |
| `Tab` | Navegación entre campos |

### Mejores Prácticas

#### Para el Usuario
1. Mantener el scanner configurado con salto de línea (Enter) al final
2. Verificar cantidades antes de procesar venta
3. Confirmar datos del cliente si es necesario
4. Revisar cambio calculado en pagos con efectivo

#### Para el Desarrollador
1. Siempre usar el composable `usePOS` para lógica de negocio
2. No manipular directamente el carrito, usar métodos del composable
3. Validar disponibilidad de productos antes de agregar
4. Implementar manejo de errores en cada operación

---

## 🔄 Componentes Reutilizados

El POS reutiliza los siguientes componentes existentes:

| Componente | Ubicación | Uso en POS |
|------------|-----------|------------|
| `SelectorProductos` | `ordenes/` | Búsqueda manual de productos |
| `AbonarOrden` (lógica) | `caja/` | Inspiración para PagoPOS |
| `TicketPrinter` | `components/` | Impresión de tickets (futuro) |
| `WhatsAppSender` | `components/` | Envío de recibo (futuro) |

---

## 📊 Roadmap y Mejoras Futuras

### Fase 1 (Actual) ✅
- [x] Escaneo de código de barras
- [x] Búsqueda manual de productos
- [x] Gestión de carrito
- [x] Proceso de pago
- [x] Integración con backend

### Fase 2 (Próxima)
- [ ] Impresión de tickets
- [ ] Descuentos y promociones
- [ ] Validación de stock en tiempo real
- [ ] Clientes frecuentes (autocompletado)
- [ ] Historial de ventas del día

### Fase 3 (Futura)
- [ ] Modo offline con sincronización
- [ ] Reportes de ventas por empleado
- [ ] Integración con WhatsApp
- [ ] Soporte para múltiples cajas
- [ ] Dashboard de ventas en tiempo real

---

## 🐛 Solución de Problemas

### Problema: El scanner no funciona
**Solución:** Verificar que el scanner esté configurado para agregar Enter al final del código.

### Problema: Productos no se encuentran
**Solución:** Verificar que los productos tengan código de barras registrado en la base de datos.

### Problema: Error al procesar venta
**Solución:** Revisar logs del backend, verificar conexión a base de datos y validar token de autenticación.

### Problema: Cambio se calcula incorrectamente
**Solución:** Asegurar que el monto recibido sea mayor o igual al total de la venta.

---

## 📝 Notas Técnicas

- **Autenticación:** Requiere token JWT válido
- **Permisos:** Todos los empleados pueden usar el POS
- **Base de datos:** Usa las mismas tablas que órdenes tradicionales
- **Diferenciador:** Campo `origen: 'pos'` en la orden
- **Performance:** Optimizado para cargas de hasta 100 items en carrito

---

## 👥 Créditos

**Desarrollado por:** ServiCopias Dev Team  
**Fecha:** 30 de diciembre de 2025  
**Versión:** 1.0.0
