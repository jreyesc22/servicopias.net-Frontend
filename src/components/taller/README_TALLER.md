# Módulo Taller - Documentación

## 📋 Descripción General

El módulo de taller gestiona las órdenes en proceso de producción, permitiendo visualizar, filtrar y actualizar el estado de las órdenes que están siendo preparadas.

## 🏗️ Arquitectura

### Estructura de Archivos

```
taller/
├── ordenTaller.vue          # Componente principal de UI
├── OrdenItemsmodal.vue      # Modal para visualizar items
├── README_TALLER.md         # Esta documentación
└── ../composables/
    └── useTallerOrdenes.js  # Lógica de negocio (composable)
```

### Servicios Utilizados

```
services/
└── ordenes.service.js       # Servicio API para órdenes (singleton)
```

## 🔧 Componentes

### 1. **ordenTaller.vue**
Componente principal que muestra la interfaz del taller.

**Responsabilidades:**
- Renderizar la UI (tabla, filtros, estadísticas)
- Manejar eventos de usuario
- Mostrar notificaciones
- Coordinar el modal de items

**Props:** Ninguna

**Emits:** Ninguno

**Características:**
- Tabla responsive con Vuetify DataTable
- Filtros múltiples (estado + origen)
- Estadísticas en tiempo real
- Acciones rápidas por estado
- Botón de guardar cambios visible cuando hay modificaciones

### 2. **useTallerOrdenes.js** (Composable)
Composable que centraliza toda la lógica de negocio del taller.

**Estado Reactivo:**
```javascript
{
  ordenes: [],              // Array de órdenes
  cargando: false,          // Estado de carga
  busqueda: '',             // Término de búsqueda
  filtroEstado: 'todos',    // Filtro por estado
  filtroOrigen: 'todos',    // Filtro por origen (local/web)
  error: null               // Mensajes de error
}
```

**Computed Properties:**
```javascript
ordenesPendientes         // Contador de pendientes
ordenesEnProceso          // Contador en proceso
ordenesEnProduccion       // Contador en producción
ordenesLocales            // Contador de origen local
ordenesWeb                // Contador de origen web
ordenesFiltradas          // Órdenes filtradas (estado + origen + búsqueda)
```

**Métodos Principales:**
```javascript
obtenerOrdenes()                    // Cargar órdenes desde API
obtenerOrdenCompleta(id)            // Obtener orden con items
actualizarEstado(orden, estado)     // Actualizar estado de orden
marcarEstadoCambiado(orden)         // Marcar orden como modificada
guardarEstado(orden)                // Guardar cambios de estado
cambiarEstadoRapido(orden, estado)  // Cambio rápido de estado
```

**Helpers:**
```javascript
getEstadoColor(estado)              // Color por estado
getEstadoIcono(estado)              // Ícono por estado
getOrigenColor(origen)              // Color por origen
getOrigenIcono(origen)              // Ícono por origen
getAccionRapida(estado)             // Acción rápida disponible
formatearFecha(fecha)               // Formatear fecha
calcularDiasTranscurridos(fecha)    // Calcular días desde fecha
```

### 3. **ordenes.service.js** (Servicio API)
Servicio singleton que encapsula todas las llamadas a la API de órdenes.

**Métodos Disponibles:**
```javascript
getAll(params)                  // Obtener todas las órdenes
getById(id)                     // Obtener orden por ID
searchByCliente(params)         // Buscar por cliente
searchByDateRange(params)       // Buscar por rango de fechas
getResumenByDateRange(params)   // Obtener resumen estadístico
create(orden)                   // Crear nueva orden
update(id, updates)             // Actualizar orden
delete(id)                      // Eliminar orden
getPublicStatus(id)             // Estado público (sin auth)
```

## 📊 Modelo de Datos

### Orden (en el taller)

```javascript
{
  id: Number,
  cliente_nombre: String,
  cliente_telefono: String,
  cliente_nit: String,
  fecha: Date,
  estado: String,              // 'pendiente' | 'en proceso' | 'en produccion'
  origen: String,              // 'local' | 'web' ⭐ NUEVO
  items: Array,
  estadoOriginal: String,      // Para detectar cambios
  estadoCambiado: Boolean,     // Flag de modificación
  loading: Boolean             // Estado de guardado
}
```

## 🎨 Estados Disponibles

### Estados del Taller
| Estado | Color | Ícono | Descripción |
|--------|-------|-------|-------------|
| pendiente | orange | mdi-clock-outline | Orden recibida, esperando proceso |
| en proceso | blue | mdi-cogs | Orden en preparación |
| en produccion | purple | mdi-factory | Orden en producción activa |
| finalizado | green | mdi-check-circle-outline | Orden completada |
| entregado | success | mdi-truck-check | Orden entregada al cliente |
| cancelado | red | mdi-cancel | Orden cancelada |

### Orígenes ⭐ NUEVO
| Origen | Color | Ícono | Descripción |
|--------|-------|-------|-------------|
| local | indigo | mdi-store | Orden creada en local |
| web | teal | mdi-web | Orden desde página web |

## 🔄 Flujo de Trabajo

### 1. Carga Inicial
```
Usuario accede → useTallerOrdenes.obtenerOrdenes()
                ↓
          ordenes.service.getAll()
                ↓
          Filtrar estados activos (pendiente, en proceso, en produccion)
                ↓
          Renderizar tabla con órdenes
```

### 2. Cambio de Estado
```
Usuario cambia estado en select → marcarEstadoCambiado()
                                  ↓
                          Botón guardar se hace visible
                                  ↓
          Usuario presiona guardar → guardarEstado()
                                  ↓
                          ordenes.service.update()
                                  ↓
          Si estado es final → Remover de lista taller
```

### 3. Acción Rápida
```
Usuario presiona botón acción rápida → cambiarEstadoRapido()
                                       ↓
                          Determinar siguiente estado (getAccionRapida)
                                       ↓
                          ordenes.service.update()
                                       ↓
                          Actualizar UI inmediatamente
```

### 4. Filtrado
```
Usuario selecciona filtros → Computed ordenesFiltradas
                            ↓
                    Aplicar filtro estado
                            ↓
                    Aplicar filtro origen ⭐ NUEVO
                            ↓
                    Aplicar búsqueda texto
                            ↓
                    Renderizar resultados
```

## 🎯 Filtros Disponibles

### Filtro por Estado
- **Todos**: Muestra todas las órdenes
- **Pendiente**: Solo órdenes pendientes
- **En Proceso**: Solo órdenes en proceso
- **En Producción**: Solo órdenes en producción

### Filtro por Origen ⭐ NUEVO
- **Todos**: Muestra órdenes de todos los orígenes
- **Local**: Solo órdenes creadas localmente
- **Web**: Solo órdenes desde la página web

### Búsqueda por Texto
Busca en:
- Nombre del cliente
- Teléfono del cliente
- NIT del cliente

## 📱 Responsive Design

El componente está optimizado para tablets y pantallas grandes:

- **Tablet (≥ 768px)**: Vista completa con todas las columnas
- **Mobile (< 768px)**: Ajuste de tamaños de botones y chips

## 🔐 Seguridad

- ⚠️ **TODO**: Implementar autenticación
- ⚠️ **TODO**: Obtener `id_usuario` del contexto de autenticación
- Actualmente usa `id_usuario: 1` hardcoded

## 🚀 Mejoras Futuras

1. **Autenticación**
   - Integrar sistema de usuarios
   - Obtener usuario actual del contexto

2. **Tiempo Real**
   - Implementar WebSockets para actualizaciones en vivo
   - Notificaciones de nuevas órdenes

3. **Historial**
   - Registro de cambios de estado
   - Auditoría de modificaciones

4. **Filtros Avanzados**
   - Rango de fechas
   - Múltiples estados simultáneos
   - Filtro por empleado asignado

5. **Exportación**
   - Exportar lista filtrada a Excel
   - Generar reportes PDF

## 📝 Uso del Composable en Otros Componentes

```javascript
import { useTallerOrdenes } from '@/components/composables/useTallerOrdenes';

export default {
  setup() {
    const {
      ordenes,
      cargando,
      obtenerOrdenes,
      actualizarEstado,
      getEstadoColor
    } = useTallerOrdenes();

    // Usar métodos y estado reactivo
    obtenerOrdenes();

    return {
      ordenes,
      cargando,
      actualizarEstado,
      getEstadoColor
    };
  }
};
```

## 🐛 Troubleshooting

### Problema: Órdenes no se cargan
**Solución**: Verificar que la API esté corriendo y `VUE_APP_API_URL` esté configurada correctamente.

### Problema: Filtros no funcionan
**Solución**: Verificar que las órdenes tengan los campos `estado` y `origen` correctamente asignados.

### Problema: Error al guardar estado
**Solución**: Verificar permisos de usuario y que el endpoint `/ordenes/update/:id` esté disponible.

## 📚 Referencias

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vuetify 3 DataTable](https://vuetifyjs.com/en/components/data-tables/)
- [Axios Documentation](https://axios-http.com/docs/intro)
