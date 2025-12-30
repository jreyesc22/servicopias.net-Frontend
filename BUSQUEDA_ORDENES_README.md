# Sistema de Búsqueda de Órdenes

## 📋 Descripción

Sistema avanzado de búsqueda y filtrado de órdenes implementado con arquitectura modular. Permite buscar órdenes por ID, cliente, fecha única o rango de fechas, con soporte para paginación del lado del servidor.

## 🏗️ Arquitectura

```
ListaOrdenes.vue (Componente)
    ├── useBusquedaOrdenes (Composable - Lógica de búsqueda)
    └── ordenesService (Service - Llamadas API)
```

## 📁 Estructura de Archivos

### Service
- **Ubicación**: `src/services/ordenes.service.js`
- **Responsabilidad**: Abstracción de llamadas HTTP a la API de órdenes
- **Métodos disponibles**:
  - `getAll(params)` - Todas las órdenes con paginación
  - `getById(id)` - Orden específica por ID
  - `searchByCliente(params)` - Búsqueda por nombre o NIT
  - `searchByDateRange(params)` - Búsqueda por rango de fechas
  - `getResumenByDateRange(params)` - Solo estadísticas sin datos
  - `create(orden)` - Crear nueva orden
  - `update(id, updates)` - Actualizar orden
  - `delete(id)` - Eliminar orden
  - `getPublicStatus(id)` - Estado público (sin auth)

### Composable
- **Ubicación**: `src/components/composables/useBusquedaOrdenes.js`
- **Responsabilidad**: Estado reactivo y lógica de búsqueda
- **Patrón**: Estado local (no singleton, cada componente tiene su instancia)

### Componente
- **Ubicación**: `src/components/ordenes/ListaOrdenes.vue`
- **Responsabilidad**: UI y coordinación de búsquedas

## 🔍 Tipos de Búsqueda

### 1. Todas las Órdenes (Default)
```javascript
// Carga todas las órdenes con paginación
await cargarTodas()
```

**Endpoint**: `GET /ordenes/all?page=1&limit=100`

**Respuesta**:
```json
{
  "ordenes": [...],
  "pagination": {
    "total": 150,
    "totalPages": 2,
    "currentPage": 1,
    "pageSize": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Buscar por ID
```javascript
filtros.tipo = 'id'
filtros.id = '123'
await ejecutarBusqueda()
```

**Endpoint**: `GET /ordenes/123`

**Uso**: Búsqueda rápida de una orden específica

### 3. Buscar por Cliente
```javascript
filtros.tipo = 'cliente'
filtros.cliente_nombre = 'Juan Pérez'
filtros.cliente_nit = '12345678'
await ejecutarBusqueda()
```

**Endpoint**: `GET /ordenes/search?cliente_nombre=Juan&cliente_nit=12345678`

**Características**:
- Búsqueda parcial (usa `ILIKE %término%` en backend)
- Puede buscar por nombre, NIT o ambos
- No requiere coincidencia exacta

### 4. Buscar por Fecha Única
```javascript
filtros.tipo = 'fecha'
filtros.fecha = '2025-12-30'
await ejecutarBusqueda()
```

**Endpoint**: `GET /ordenes/date-range?fechaInicio=2025-12-30&fechaFin=2025-12-30`

**Nota**: Internamente usa el endpoint de rango con fechas iguales

### 5. Buscar por Rango de Fechas
```javascript
filtros.tipo = 'rango'
filtros.fechaInicio = '2025-12-01'
filtros.fechaFin = '2025-12-31'
filtros.estado = 'entregado' // Opcional
filtros.estadoPago = 'pagado' // Opcional
await ejecutarBusqueda()
```

**Endpoint**: `GET /ordenes/date-range?fechaInicio=2025-12-01&fechaFin=2025-12-31&estado=entregado&estadoPago=pagado&page=1&limit=100`

**Respuesta**:
```json
{
  "ordenes": [...],
  "pagination": {...},
  "filtros": {
    "fechaInicio": "2025-12-01",
    "fechaFin": "2025-12-31",
    "estado": "entregado",
    "estadoPago": "pagado"
  },
  "estadisticas": {
    "totalOrdenes": 45,
    "ventasTotales": 15000.00,
    "totalAbonado": 12000.00,
    "totalPendiente": 3000.00,
    "ticketPromedio": 333.33,
    "estadosPago": {
      "pagado": 30,
      "parcial": 10,
      "pendiente": 5
    },
    "estadosOrden": {
      "entregado": 45
    }
  }
}
```

## 📡 API del Composable

### Estado Reactivo
```javascript
const {
  loading,              // ref(boolean) - Indicador de carga
  error,                // ref(string|null) - Mensaje de error
  resultados,           // ref(Array) - Órdenes encontradas
  filtros,              // ref(Object) - Filtros actuales
  paginacion,           // ref(Object) - Info de paginación
  ultimaBusqueda,       // ref(Object|null) - Última búsqueda realizada
  totalResultados,      // computed - Total de resultados
  tieneResultados       // computed - Boolean si hay resultados
} = useBusquedaOrdenes()
```

### Objeto `filtros`
```javascript
{
  tipo: 'todos',        // 'todos' | 'id' | 'cliente' | 'fecha' | 'rango'
  id: '',               // Para tipo 'id'
  cliente_nombre: '',   // Para tipo 'cliente'
  cliente_nit: '',      // Para tipo 'cliente'
  fecha: '',            // Para tipo 'fecha' (YYYY-MM-DD)
  fechaInicio: '',      // Para tipo 'rango' (YYYY-MM-DD)
  fechaFin: '',         // Para tipo 'rango' (YYYY-MM-DD)
  estado: null,         // Para tipo 'rango' (opcional)
  estadoPago: null      // Para tipo 'rango' (opcional)
}
```

### Objeto `paginacion`
```javascript
{
  page: 1,              // Página actual
  limit: 100,           // Items por página
  total: 0,             // Total de resultados
  totalPages: 0         // Total de páginas
}
```

### Métodos

#### `ejecutarBusqueda()`
Ejecuta búsqueda según `filtros.tipo` actual
```javascript
const resultado = await ejecutarBusqueda()
// resultado: { success: boolean, data?: Array, error?: string, ... }
```

#### `buscarPorId(id)`
Buscar orden específica por ID
```javascript
const resultado = await buscarPorId(123)
```

#### `buscarPorCliente(params)`
Buscar por nombre o NIT de cliente
```javascript
const resultado = await buscarPorCliente({
  cliente_nombre: 'Juan',
  cliente_nit: '12345678'
})
```

#### `buscarPorFecha(fecha)`
Buscar órdenes de una fecha específica
```javascript
const resultado = await buscarPorFecha('2025-12-30')
```

#### `buscarPorRangoFechas(params)`
Buscar por rango de fechas con filtros opcionales
```javascript
const resultado = await buscarPorRangoFechas({
  fechaInicio: '2025-12-01',
  fechaFin: '2025-12-31',
  estado: 'entregado',
  estadoPago: 'pagado'
})
```

#### `cargarTodas()`
Cargar todas las órdenes (reset de búsqueda)
```javascript
await cargarTodas()
```

#### `cambiarPagina(page)`
Cambiar de página manteniendo filtros
```javascript
await cambiarPagina(2)
```

#### `cambiarLimite(limit)`
Cambiar items por página
```javascript
await cambiarLimite(50)
```

#### `limpiarBusqueda()`
Resetear todos los filtros y resultados
```javascript
limpiarBusqueda()
```

#### `limpiarError()`
Limpiar solo mensaje de error
```javascript
limpiarError()
```

## 🎨 Características del UI

### Selector de Tipo de Búsqueda
- **Todas las órdenes**: Vista completa paginada
- **Buscar por ID**: Campo numérico para ID específico
- **Buscar por Cliente**: Campos para nombre y/o NIT
- **Buscar por Fecha**: Selector de fecha única
- **Rango de Fechas**: Dos fechas + filtros opcionales de estado

### Filtros Dinámicos
- UI se adapta según el tipo de búsqueda seleccionado
- Solo muestra campos relevantes
- Auto-limpieza al cambiar tipo

### Paginación Inteligente
- Soporta paginación del servidor
- Mantiene página actual al cambiar límite
- Oculta controles si solo hay 1 página

### Estados Visuales
- Indicador de carga (spinner)
- Mensaje cuando no hay resultados
- Chip de "Resultados filtrados" cuando hay búsqueda activa
- Alertas de error con opción de cerrar

## 🔌 Endpoints Backend

### Base URL
```
http://localhost:3000/ordenes
```

### Listar Todas
```http
GET /ordenes/all?page=1&limit=100
```

### Buscar por ID
```http
GET /ordenes/:id
```

### Buscar por Cliente
```http
GET /ordenes/search?cliente_nombre=Juan&cliente_nit=12345678
```

### Buscar por Rango de Fechas
```http
GET /ordenes/date-range?fechaInicio=2025-12-01&fechaFin=2025-12-31&estado=entregado&estadoPago=pagado&page=1&limit=100
```

### Resumen por Rango (solo estadísticas)
```http
GET /ordenes/resumen-date-range?fechaInicio=2025-12-01&fechaFin=2025-12-31
```

## ⚠️ Importante: Orden de Rutas

Las rutas en Express deben estar en el orden correcto para evitar conflictos:

```javascript
// ✅ CORRECTO: Rutas específicas primero
router.get('/search', controller.search)
router.get('/date-range', controller.findByDateRange)
router.get('/public/:id', controller.getPublicOrderStatus)
router.get('/:id', controller.findOne)

// ❌ INCORRECTO: :id captura todas las rutas
router.get('/:id', controller.findOne)
router.get('/search', controller.search) // Nunca se alcanza
```

## 📊 Validaciones Backend

### Rango de Fechas
- Formato: `YYYY-MM-DD`
- `fechaInicio` y `fechaFin` son requeridos
- Validación con `moment.js`
- Respuesta 400 si formato inválido

### Búsqueda por Cliente
- Al menos `cliente_nombre` o `cliente_nit` requerido
- Búsqueda parcial case-insensitive
- Usa `ILIKE` en PostgreSQL

## 🎯 Ejemplo de Uso Completo

```vue
<template>
  <div>
    <!-- Selector de tipo -->
    <v-select v-model="filtros.tipo" :items="tipos" />
    
    <!-- Campos dinámicos según tipo -->
    <v-text-field 
      v-if="filtros.tipo === 'id'" 
      v-model="filtros.id" 
      label="ID de Orden"
    />
    
    <!-- Botón buscar -->
    <v-btn @click="buscar" :loading="loading">
      Buscar
    </v-btn>
    
    <!-- Resultados -->
    <v-data-table 
      :items="resultados" 
      :loading="loading"
    />
    
    <!-- Paginación -->
    <v-pagination 
      :model-value="paginacion.page"
      :length="paginacion.totalPages"
      @update:model-value="cambiarPaginaLocal"
    />
  </div>
</template>

<script setup>
import { useBusquedaOrdenes } from '@/composables/useBusquedaOrdenes'

const {
  loading,
  resultados,
  filtros,
  paginacion,
  ejecutarBusqueda,
  cambiarPagina
} = useBusquedaOrdenes()

const buscar = async () => {
  await ejecutarBusqueda()
}

const cambiarPaginaLocal = async (page) => {
  await cambiarPagina(page)
}
</script>
```

## 🚀 Mejoras Futuras

- [ ] Guardar búsquedas favoritas
- [ ] Exportar resultados de búsqueda a Excel/PDF
- [ ] Búsqueda avanzada con múltiples criterios combinados
- [ ] Autocompletado de clientes
- [ ] Historial de búsquedas recientes
- [ ] Filtros guardados por usuario
- [ ] Búsqueda por código de barras
- [ ] Búsqueda fuzzy (tolerante a errores tipográficos)

## 📚 Referencias

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Express Routing](https://expressjs.com/en/guide/routing.html)
- [Sequelize Operators](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators)
- [Moment.js](https://momentjs.com/docs/)
