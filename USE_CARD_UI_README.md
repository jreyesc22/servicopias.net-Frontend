# Composable de UI - useCardUI

> **⚠️ ACTUALIZACIÓN IMPORTANTE (1 de enero de 2026):**  
> Este composable ha sido integrado con el nuevo [Sistema de Diseño Global](./DESIGN_SYSTEM_README.md).  
> Consulta la [Guía de Migración](./USE_CARD_UI_MIGRATION.md) para actualizar tus componentes.

**Fecha de creación:** 30 de diciembre de 2025  
**Última actualización:** 1 de enero de 2026 (Integración con design-system.css)  
**Sistema:** ServiCopias - Composable de Diseño UI  
**Framework:** Vue 3 Composition API

---

## ⚡ Inicio Rápido (Uso Actual)

### ✅ Forma recomendada (Después de migración)

```javascript
import { useCardUI } from '@/components/composables/useCardUI'

// Solo importar helpers de JavaScript
const { 
  getHeaderConfig,      // Configuración de headers
  getChipColor,         // Colores de chips
  formatearMoneda,      // Formateo de moneda
  getIcono,             // Iconos por tipo
  crearChipEstado       // Crear chips de estado
} = useCardUI()
```

```vue
<template>
  <!-- Usar clases CSS globales -->
  <v-card-title class="bg-gradient-primary text-white">
    {{ getHeaderConfig({ tipo: 'primary', titulo: 'Mi Título' }).titulo }}
  </v-card-title>
  
  <v-card-text>
    <div class="totales-container">
      <p class="text-primary">{{ formatearMoneda(1234.56) }}</p>
    </div>
  </v-card-text>
</template>

<style scoped>
/* Solo estilos específicos del componente */
/* Las clases globales ya están disponibles */
</style>
```

### 📚 Documentación Relacionada

- **[Guía de Migración](./USE_CARD_UI_MIGRATION.md)** - Cómo actualizar componentes
- **[Sistema de Diseño](./DESIGN_SYSTEM_README.md)** - Variables y clases disponibles
- **[design-system.css](./src/styles/design-system.css)** - Estilos globales

---

## 📋 Propósito

`useCardUI` es un composable que centraliza toda la configuración visual y de diseño de los componentes de la aplicación. Proporciona estilos consistentes, helpers para formateo, y configuraciones reutilizables **sin afectar la lógica de negocio** de los componentes.

### Ventajas

✅ **Consistencia Visual** - Mismo diseño en todos los componentes  
✅ **Separación de Responsabilidades** - Diseño separado de lógica  
✅ **Mantenibilidad** - Cambios de diseño en un solo lugar  
✅ **Reutilización** - Mismas funciones en múltiples componentes  
✅ **Escalabilidad** - Fácil agregar nuevos estilos/configuraciones

---

## 🎨 Configuraciones Disponibles

### 1. Gradientes

Colores gradient predefinidos para headers de cards:

```javascript
const { gradientes } = useCardUI()

// Valores disponibles:
gradientes.primary   // Azul (#1976d2 → #1565c0)
gradientes.success   // Verde (#2e7d32 → #1b5e20)
gradientes.info      // Azul claro (#0288d1 → #01579b)
gradientes.warning   // Naranja (#f57c00 → #e65100)
gradientes.error     // Rojo (#d32f2f → #c62828)
gradientes.purple    // Morado (#7b1fa2 → #4a148c)
```

### 2. Colores de Chips

Mapeo de tipos/estados a colores de Vuetify:

```javascript
const { chipColors } = useCardUI()

// Tipos de items
chipColors.producto         // 'blue'
chipColors.servicio         // 'green'

// Estados de orden
chipColors.pendiente        // 'warning'
chipColors['en proceso']    // 'blue'
chipColors['en produccion'] // 'purple'
chipColors.finalizado       // 'success'
chipColors.entregado        // 'success'
chipColors.cancelado        // 'error'

// Estados de pago
chipColors.pagado           // 'success'
chipColors.parcial          // 'warning'
```

### 3. Iconos

Biblioteca de iconos Material Design Icons predefinidos:

```javascript
const { iconos } = useCardUI()

// Items
iconos.producto      // 'mdi-package'
iconos.servicio      // 'mdi-tools'

// Carrito
iconos.carrito       // 'mdi-cart-plus'
iconos.carritoCheck  // 'mdi-cart-check'

// Cliente
iconos.cliente       // 'mdi-account'
iconos.telefono      // 'mdi-phone'
iconos.nit           // 'mdi-card-account-details'

// Acciones
iconos.buscar        // 'mdi-magnify'
iconos.filtro        // 'mdi-shape'
iconos.limpiar       // 'mdi-filter-off'
iconos.editar        // 'mdi-pencil'
iconos.eliminar      // 'mdi-delete'
iconos.agregar       // 'mdi-plus'

// Archivos
iconos.imagen        // 'mdi-image'
iconos.pdf           // 'mdi-file-pdf-box'

// Estados
iconos.check         // 'mdi-check-circle'
iconos.error         // 'mdi-alert-circle'
iconos.info          // 'mdi-information'
```

---

## 🛠️ Helpers Principales

### `getHeaderConfig(config)`

Genera configuración completa para headers de v-card.

**Parámetros:**
```javascript
{
  tipo: String,           // 'primary' | 'success' | 'info' | etc
  icono: String,          // Nombre del icono (ej: 'carrito')
  titulo: String,         // Texto del título
  contador: Number,       // Número opcional para chip contador
  contadorTexto: String   // Texto personalizado del contador
}
```

**Retorna:**
```javascript
{
  gradiente: String,      // CSS gradient
  icono: String,          // Icono MDI completo
  titulo: String,         // Título del header
  mostrarContador: Boolean,
  contadorValor: Number,
  contadorTexto: String
}
```

**Ejemplo:**
```vue
<script setup>
import { computed } from 'vue'
import { useCardUI } from '@/composables/useCardUI'

const { getHeaderConfig } = useCardUI()

const headerConfig = computed(() => getHeaderConfig({
  tipo: 'primary',
  icono: 'carrito',
  titulo: 'Seleccionar Productos',
  contador: 50,
  contadorTexto: '50 disponibles'
}))
</script>

<template>
  <v-card-title 
    class="text-white d-flex align-center"
    :style="{ background: headerConfig.gradiente }"
  >
    <v-icon class="mr-3">{{ headerConfig.icono }}</v-icon>
    <span>{{ headerConfig.titulo }}</span>
    <v-spacer />
    <v-chip color="white" variant="outlined" size="small">
      {{ headerConfig.contadorTexto }}
    </v-chip>
  </v-card-title>
</template>
```

---

### `getChipColor(tipo)`

Obtiene color de chip según tipo o estado.

**Ejemplo:**
```javascript
const { getChipColor } = useCardUI()

getChipColor('producto')        // 'blue'
getChipColor('pendiente')       // 'warning'
getChipColor('en proceso')      // 'blue'
```

---

### `getIcono(tipo)`

Obtiene icono MDI según tipo.

**Ejemplo:**
```javascript
const { getIcono } = useCardUI()

getIcono('carrito')    // 'mdi-cart-plus'
getIcono('cliente')    // 'mdi-account'
getIcono('telefono')   // 'mdi-phone'
```

---

### `crearChipEstado(estado, opciones)`

Crea objeto de configuración para v-chip.

**Parámetros:**
```javascript
estado: String         // Estado o tipo
opciones: {
  color: String,       // Color del chip (opcional)
  size: String,        // Tamaño: 'small' | 'default' | 'large'
  variant: String,     // Variante: 'tonal' | 'outlined' | 'flat'
  texto: String        // Texto personalizado
}
```

**Ejemplo:**
```vue
<script setup>
const { crearChipEstado } = useCardUI()

const estadoChip = computed(() => 
  crearChipEstado(orden.value.estado, {
    color: orden.value.estado === 'entregado' ? 'success' : 'warning',
    texto: orden.value.estado.toUpperCase()
  })
)
</script>

<template>
  <v-chip 
    :color="estadoChip.color" 
    :size="estadoChip.size"
    :variant="estadoChip.variant"
  >
    {{ estadoChip.texto }}
  </v-chip>
</template>
```

---

### `formatearMoneda(valor, simbolo)`

Formatea números como moneda.

**Parámetros:**
- `valor`: Number - Cantidad a formatear
- `simbolo`: String - Símbolo de moneda (default: 'Q')

**Ejemplo:**
```javascript
const { formatearMoneda } = useCardUI()

formatearMoneda(25.5)        // 'Q 25.50'
formatearMoneda(100, '$')    // '$ 100.00'
```

---

### `getEmptyStateConfig(tipo)`

Configuración para estados vacíos/sin datos.

**Tipos disponibles:**
- `'carrito'` - Carrito vacío
- `'noResultados'` - Sin resultados de búsqueda
- `'error'` - Error al cargar
- `'cargando'` - Estado de carga

**Retorna:**
```javascript
{
  icono: String,      // Icono MDI
  titulo: String,     // Título principal
  mensaje: String,    // Mensaje descriptivo
  color: String       // Color del icono
}
```

**Ejemplo:**
```vue
<script setup>
const { getEmptyStateConfig } = useCardUI()
const emptyConfig = getEmptyStateConfig('carrito')
</script>

<template>
  <div v-if="items.length === 0" class="text-center py-8">
    <v-icon size="64" :color="emptyConfig.color">
      {{ emptyConfig.icono }}
    </v-icon>
    <p class="text-h6 text-grey mt-4">{{ emptyConfig.titulo }}</p>
    <p class="text-caption text-grey">{{ emptyConfig.mensaje }}</p>
  </div>
</template>
```

---

### `getPaginacionTexto(pagina, porPagina, total)`

Genera texto de paginación.

**Retorna:**
```javascript
{
  rango: String,           // "1 - 10"
  total: Number,           // Total de items
  texto: String,           // "Mostrando 1 - 10 de 50"
  paginaActual: Number,    // Página actual
  totalPaginas: Number     // Total de páginas
}
```

**Ejemplo:**
```vue
<script setup>
const { getPaginacionTexto } = useCardUI()

const paginacionInfo = computed(() => 
  getPaginacionTexto(pagina.value, 10, filtrados.value.length)
)
</script>

<template>
  <div class="d-flex justify-space-between align-center">
    <div class="text-caption text-grey">
      {{ paginacionInfo.texto }}
    </div>
    <span>
      Página {{ paginacionInfo.paginaActual }} / {{ paginacionInfo.totalPaginas }}
    </span>
  </div>
</template>
```

---

## 🎨 Estilos CSS

El composable proporciona estilos CSS como strings para copiar en `<style scoped>`:

### Uso de Estilos

```javascript
const { estilosGlobales, todosLosEstilos } = useCardUI()

// Estilos individuales
estilosGlobales.gradients    // Clases .bg-gradient-*
estilosGlobales.table        // Estilos de v-table
estilosGlobales.text         // Clases de texto
estilosGlobales.containers   // Contenedores
estilosGlobales.responsive   // Media queries

// Todos los estilos juntos
todosLosEstilos.value        // String con todos los estilos
```

### Estilos Incluidos

#### Tablas
```css
.v-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.v-table thead tr th {
  background-color: #f5f5f5;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.producto-row:hover,
.item-row:hover {
  background-color: #f9f9f9;
}
```

#### Texto
```css
.text-white {
  color: white !important;
}

.text-primary {
  color: #1976d2 !important;
}

.text-success {
  color: #2e7d32 !important;
}

.text-grey {
  color: #9e9e9e !important;
}
```

#### Contenedores
```css
.totales-container {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.info-section {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
}
```

---

## 📦 Casos de Uso

### 1. SelectorProductos.vue

```vue
<script setup>
import { computed } from 'vue'
import { useProductosSelector } from '@/composables/useProductosSelector'
import { useCardUI } from '@/composables/useCardUI'

// Lógica de productos (negocio)
const { filtrados, pagina, porPagina } = useProductosSelector()

// UI y diseño
const { 
  getHeaderConfig, 
  getPaginacionTexto,
  getEmptyStateConfig 
} = useCardUI()

const headerConfig = computed(() => getHeaderConfig({
  tipo: 'primary',
  icono: 'carrito',
  titulo: 'Seleccionar Productos',
  contador: filtrados.value.length,
  contadorTexto: `${filtrados.value.length} disponibles`
}))

const paginacionInfo = computed(() => 
  getPaginacionTexto(pagina.value, porPagina.value, filtrados.value.length)
)

const emptyConfig = getEmptyStateConfig('noResultados')
</script>
```

### 2. TablaResumenProductos.vue

```vue
<script setup>
import { computed } from 'vue'
import { useCardUI } from '@/composables/useCardUI'

const props = defineProps({
  items: Array
})

const { 
  getHeaderConfig, 
  formatearMoneda,
  getEmptyStateConfig 
} = useCardUI()

const headerConfig = computed(() => getHeaderConfig({
  tipo: 'success',
  icono: 'carritoCheck',
  titulo: 'Carrito de Compra',
  contador: props.items.length,
  contadorTexto: `${props.items.length} items`
}))

const emptyConfig = getEmptyStateConfig('carrito')
</script>
```

### 3. ResumenOrden.vue

```vue
<script setup>
import { computed } from 'vue'
import { useCardUI } from '@/composables/useCardUI'

const props = defineProps({
  orden: Object
})

const { 
  getHeaderConfig,
  getIcono,
  formatearMoneda,
  crearChipEstado 
} = useCardUI()

const headerConfig = computed(() => getHeaderConfig({
  tipo: 'info',
  icono: 'mdi-file-document-check',
  titulo: 'Resumen de la Orden'
}))

const estadoChip = computed(() => 
  crearChipEstado(estadoSeleccionado.value, {
    color: estadoSeleccionado.value === 'entregado' ? 'success' : 'warning',
    texto: estadoSeleccionado.value.toUpperCase()
  })
)
</script>
```

---

## 🔄 Arquitectura y Flujo

### Separación de Responsabilidades

```
┌─────────────────────────────────────┐
│   Componente (*.vue)                │
│                                     │
│  ┌────────────────────────────┐    │
│  │  Lógica de Negocio         │    │
│  │  - useProductosSelector    │    │
│  │  - useBusquedaOrdenes      │    │
│  │  - Validaciones            │    │
│  │  - API Calls               │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │  UI y Diseño               │    │
│  │  - useCardUI               │    │
│  │  - Headers                 │    │
│  │  - Estilos                 │    │
│  │  - Formateo visual         │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Ventajas

1. **Mantenibilidad:** Cambios de diseño no afectan lógica
2. **Testabilidad:** Lógica y UI se prueban independientemente
3. **Reutilización:** Mismo diseño en múltiples componentes
4. **Escalabilidad:** Fácil agregar nuevos componentes con diseño consistente

---

## 📝 Mejores Prácticas

### ✅ Hacer

```vue
<!-- Usar helpers del composable -->
<script setup>
const { formatearMoneda, getIcono } = useCardUI()
</script>

<template>
  <span>{{ formatearMoneda(total) }}</span>
  <v-icon>{{ getIcono('cliente') }}</v-icon>
</template>
```

### ❌ No Hacer

```vue
<!-- Hardcodear valores que están en el composable -->
<template>
  <span>Q {{ total.toFixed(2) }}</span>
  <v-icon>mdi-account</v-icon>
</template>
```

---

## 🚀 Extensibilidad

### Agregar Nuevos Gradientes

```javascript
// En useCardUI.js
const gradientes = {
  // ... existentes
  custom: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)'
}
```

### Agregar Nuevos Iconos

```javascript
// En useCardUI.js
const iconos = {
  // ... existentes
  favorito: 'mdi-heart',
  compartir: 'mdi-share-variant'
}
```

### Agregar Nuevos Empty States

```javascript
// En getEmptyStateConfig()
const configs = {
  // ... existentes
  sinFavoritos: {
    icono: 'mdi-heart-outline',
    titulo: 'Sin favoritos',
    mensaje: 'Agrega productos a favoritos',
    color: 'grey'
  }
}
```

---

**Última actualización:** 30 de diciembre de 2025  
**Componente:** useCardUI.js  
**Tipo:** Composable de UI/Diseño
