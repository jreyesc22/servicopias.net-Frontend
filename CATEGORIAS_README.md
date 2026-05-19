# Sistema de Gestión de Categorías

##  Descripción

Sistema modular para la gestión completa de categorías del inventario, implementado siguiendo el patrón de separación de responsabilidades: composables para lógica de negocio, componentes hijos para UI, y comunicación basada en eventos.

## Arquitectura

```
CategoriaForm.vue (Vista Principal)
    ├── useCategorias (Composable - Lógica API)
    ├── FormCategoria.vue (Componente - Crear/Editar)
    └── ListaCategorias.vue (Componente - Listar)
```

## Estructura de Archivos

### Composable
- **Ubicación**: `src/components/composables/useCategorias.js`
- **Responsabilidad**: Manejo de estado global y llamadas a la API
- **Patrón**: Singleton con estado reactivo compartido

### Componentes Hijos
1. **FormCategoria.vue**: `src/components/configuracion/FormCategoria.vue`
   - Formulario dual para crear/editar categorías
   - No realiza llamadas directas a la API
   - Emite eventos al padre

2. **ListaCategorias.vue**: `src/components/configuracion/ListaCategorias.vue`
   - Muestra lista de categorías con búsqueda
   - Acciones de editar/eliminar con confirmación
   - Recibe datos via props, emite eventos al padre

### Vista Principal
- **Ubicación**: `src/views/CategoriaForm.vue`
- **Responsabilidad**: Coordinar composable y componentes hijos

## Flujo de Datos

### Crear Categoría

1. Usuario completa FormCategoria
2. FormCategoria emite "categoria-creada" con datos
3. CategoriaForm recibe evento → llama crearCategoria() del composable
4. Composable hace POST a API → actualiza estado
5. ListaCategorias recibe nuevas categorías via props
6. CategoriaForm muestra notificación de éxito/error
```

## Editar Categoría

1. Usuario hace clic en "editar" en ListaCategorias
2. ListaCategorias emite "editar" con categoría
3. CategoriaForm actualiza categoriaSeleccionada
4. FormCategoria recibe prop y cambia a modo edición
5. Usuario modifica y guarda
6. FormCategoria emite "categoria-actualizada"
7. CategoriaForm llama actualizarCategoria() del composable
8. Composable hace PUT a API → actualiza estado
9. FormCategoria vuelve a modo crear
10. CategoriaForm muestra notificación
```

### Eliminar Categoría
```
1. Usuario hace clic en "eliminar" en ListaCategorias
2. ListaCategorias muestra diálogo de confirmación
3. Usuario confirma → emite "eliminar" con ID
4. CategoriaForm llama eliminarCategoria() del composable
5. Composable hace DELETE a API → actualiza estado
6. CategoriaForm muestra notificación
```

##  API del Composable

### Estado Reactivo
javascript
const {
  categorias,           // ref([]) - Array de todas las categorías
  categoriasOrdenadas,  // computed - Categorías ordenadas alfabéticamente
  loading,              // ref(false) - Estado de carga
  error,                // ref(null) - Mensaje de error
  totalCategorias       // computed - Cantidad total
} = useCategorias()
```

### Métodos
javascript
// Cargar categorías desde API
await fetchCategorias()

// Crear nueva categoría
const resultado = await crearCategoria({ nombre, descripcion })
// resultado: { success: boolean, data?: object, error?: string }

// Actualizar categoría existente
const resultado = await actualizarCategoria(id, { nombre, descripcion })

// Eliminar categoría
const resultado = await eliminarCategoria(id)

// Búsqueda por ID
const categoria = buscarCategoriaPorId(id)

// Búsqueda por nombre
const resultados = buscarCategoriasPorNombre("papelería")

// Recargar datos
await recargarCategorias()

// Limpiar error
limpiarError()
```

## Props y Eventos

### FormCategoria.vue

**Props**:
```javascript
{
  categoriaEditar: {
    type: Object,
    default: null
    // Si se proporciona, el formulario entra en modo edición
  }
}
```

**Emits**:
```javascript
// Cuando se crea una nueva categoría
emit('categoria-creada', { nombre, descripcion })

// Cuando se actualiza una categoría existente
emit('categoria-actualizada', { nombre, descripcion })

// Cuando se cancela la edición
emit('cancelar')
```

### ListaCategorias.vue

**Props**:
```javascript
{
  categorias: {
    type: Array,
    required: true,
    default: () => []
  },
  cargando: {
    type: Boolean,
    default: false
  }
}
```

**Emits**:
```javascript
// Cuando se hace clic en editar
emit('editar', categoria)

// Cuando se confirma eliminar
emit('eliminar', categoriaId)

// Cuando se solicita recargar
emit('recargar')
```

## Características

### FormCategoria
- ✅ Modo dual: crear/editar con el mismo componente
- ✅ Validación de campos requeridos
- ✅ Mensajes de error inline
- ✅ Auto-limpieza después de crear
- ✅ Botón cancelar en modo edición
- ✅ Interfaz Vuetify 3

### ListaCategorias
- ✅ Búsqueda en tiempo real (nombre y descripción)
- ✅ Contador de categorías
- ✅ Botón de recarga manual
- ✅ Diálogo de confirmación para eliminar
- ✅ Estados de carga y vacío
- ✅ Iconos y diseño Material Design
- ✅ Hover effects en items

### Vista Principal
- ✅ Layout responsive de 2 columnas
- ✅ Snackbar de notificaciones global
- ✅ Coordinación de eventos entre componentes
- ✅ Manejo centralizado de errores

## Endpoints API

```javascript
// Base URL
const API_URL = process.env.VUE_APP_API_URL

// Obtener todas las categorías
GET /categorias

// Crear categoría
POST /categorias/create
Body: { nombre: string, descripcion?: string }

// Actualizar categoría
PUT /categorias/:id
Body: { nombre: string, descripcion?: string }

// Eliminar categoría
DELETE /categorias/:id
```

## Ventajas del Patrón Implementado

### Separación de Responsabilidades
- **Composable**: Lógica de negocio y llamadas API
- **Componentes**: Solo presentación y UI
- **Vista**: Coordinación de flujo

###  Reutilización
- `useCategorias` puede usarse en cualquier componente
- `FormCategoria` y `ListaCategorias` son independientes
- Fácil agregar nuevas vistas que usen las mismas categorías

### Testabilidad
- Composable puede testearse independientemente
- Componentes pueden testearse con props mockeadas
- No hay acoplamiento directo con la API

### Mantenibilidad
- Cambios en API solo afectan al composable
- Cambios de UI solo afectan a componentes
- Fácil debugging por responsabilidades claras

###  Estado Singleton
- Una sola fuente de verdad para categorías
- Cambios se reflejan automáticamente en todos los componentes
- No hay datos duplicados o desincronizados

##  Patrón de Comunicación

```
┌─────────────────────────────────────────┐
│       CategoriaForm.vue (Vista)         │
│  - Coordina flujo                       │
│  - Maneja eventos                       │
│  - Muestra notificaciones               │
└─────────────────────────────────────────┘
         ↓ usa                    ↑ emite eventos
┌────────────────────┐    ┌──────────────────────┐
│  useCategorias()   │    │  FormCategoria.vue   │
│  (Composable)      │    │  - Solo UI           │
│  - Estado global   │    │  - Validación        │
│  - Llamadas API    │    │  - Emite eventos     │
└────────────────────┘    └──────────────────────┘
         ↓ provides data
┌──────────────────────────────────────────┐
│       ListaCategorias.vue                │
│  - Recibe props                          │
│  - Muestra datos                         │
│  - Emite eventos de acción               │
└──────────────────────────────────────────┘
```

## Ejemplo de Uso en Otro Componente

```vue
<template>
  <v-select
    v-model="categoriaSeleccionada"
    :items="categoriasOrdenadas"
    item-title="nombre"
    item-value="id"
    label="Categoría"
    :loading="loading"
  />
</template>

<script setup>
import { onMounted } from 'vue'
import { useCategorias } from '@/components/composables/useCategorias'

const {
  categoriasOrdenadas,
  loading,
  fetchCategorias
} = useCategorias()

const categoriaSeleccionada = ref(null)

onMounted(async () => {
  // Si categorias ya fue inicializado en otro componente,
  // no hace llamada redundante a la API
  await fetchCategorias()
})
</script>
```

## Mejoras Futuras

- [ ] Paginación para listas grandes
- [ ] Filtros avanzados (activo/inactivo)
- [ ] Exportar categorías a CSV/Excel
- [ ] Importar categorías desde archivo
- [ ] Categorías anidadas/subcategorías
- [ ] Asignación de colores/iconos personalizados
- [ ] Contador de items por categoría
- [ ] Ordenamiento personalizado (drag & drop)

## Referencias

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vuetify 3 Components](https://vuetifyjs.com/en/components/all/)
- [Patrón Composable](https://vuejs.org/guide/reusability/composables.html)
