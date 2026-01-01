# 🔄 Migración de useCardUI al Sistema de Diseño Global

Guía para migrar componentes que usan `useCardUI` al nuevo sistema de diseño global.

## 📋 Tabla de Contenidos

- [¿Qué cambió?](#qué-cambió)
- [Ventajas](#ventajas)
- [Migración paso a paso](#migración-paso-a-paso)
- [Ejemplos de migración](#ejemplos-de-migración)
- [API de useCardUI actualizada](#api-de-usecardui-actualizada)

---

## 🔄 ¿Qué cambió?

### Antes (useCardUI standalone)

Los gradientes, colores y estilos estaban duplicados en cada componente:

```javascript
import { useCardUI } from '../composables/useCardUI'

const { todosLosEstilos } = useCardUI()
```

```vue
<style scoped>
/* Se copiaban ~200 líneas de CSS en cada componente */
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}
/* ... más estilos duplicados */
</style>
```

### Ahora (Integrado con design-system.css)

Los estilos están centralizados y disponibles globalmente:

```javascript
import { useCardUI } from '../composables/useCardUI'

// Solo usar helpers de JavaScript, no estilos
const { 
  getHeaderConfig, 
  getChipColor, 
  formatearMoneda 
} = useCardUI()
```

```vue
<template>
  <!-- Usar clases globales directamente -->
  <v-card-title class="bg-gradient-primary text-white">
    Título
  </v-card-title>
</template>

<style scoped>
/* Solo estilos específicos del componente */
.mi-clase-especifica {
  padding: var(--spacing-lg);
}
</style>
```

---

## ✅ Ventajas

### 1. **Menos código duplicado**
- Antes: ~200 líneas CSS por componente
- Ahora: 0 líneas duplicadas, clases globales

### 2. **Cambios centralizados**
- Un cambio en `design-system.css` afecta toda la app
- No necesitas actualizar múltiples componentes

### 3. **Mejor rendimiento**
- CSS cargado una sola vez
- Menos CSS para parsear

### 4. **Mantenimiento más fácil**
- Una sola fuente de verdad para estilos
- Menos errores de inconsistencia

---

## 🔧 Migración paso a paso

### Paso 1: Identificar uso de estilos duplicados

Buscar en el componente:

```vue
<script>
import { useCardUI } from '../composables/useCardUI'

const { todosLosEstilos } = useCardUI() // ⚠️ DEPRECADO
</script>

<style scoped>
/* 200+ líneas de estilos copiados */
</style>
```

### Paso 2: Actualizar imports

```diff
<script setup>
import { useCardUI } from '../composables/useCardUI'

-const { todosLosEstilos, getHeaderConfig, getChipColor } = useCardUI()
+const { getHeaderConfig, getChipColor, formatearMoneda, getIcono } = useCardUI()
</script>
```

### Paso 3: Eliminar estilos duplicados

```diff
<style scoped>
-/* Eliminar estas secciones que ya están globalmente */
-.bg-gradient-primary { ... }
-.bg-gradient-success { ... }
-.text-primary { ... }
-.text-success { ... }
-.totales-container { ... }
-.info-section { ... }
-/* etc... */

/* Solo mantener estilos específicos del componente */
+.mi-componente-especifico {
+  padding: var(--spacing-lg);
+  border-radius: var(--border-radius);
+}
</style>
```

### Paso 4: Usar clases globales en template

```diff
<template>
  <v-card>
-    <v-card-title :style="{ background: getHeaderConfig({ tipo: 'primary' }).gradiente }">
+    <v-card-title class="bg-gradient-primary text-white">
      Mi Título
    </v-card-title>
    
    <v-card-text>
-      <div :style="{ color: '#1976d2' }">
+      <div class="text-primary">
        Texto con color
      </div>
      
-      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px;">
+      <div class="totales-container">
        Totales
      </div>
    </v-card-text>
  </v-card>
</template>
```

---

## 📖 Ejemplos de migración

### Ejemplo 1: SelectorProductos.vue

#### ❌ Antes

```vue
<script setup>
import { useCardUI } from '../composables/useCardUI'

const { 
  todosLosEstilos,
  getHeaderConfig,
  getChipColor 
} = useCardUI()
</script>

<template>
  <v-card>
    <v-card-title :style="{ background: getHeaderConfig({ tipo: 'primary' }).gradiente }">
      Productos
    </v-card-title>
  </v-card>
</template>

<style scoped>
/* 200+ líneas de CSS duplicadas aquí */
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}
.text-primary {
  color: #1976d2 !important;
}
/* ... etc */
</style>
```

#### ✅ Después

```vue
<script setup>
import { useCardUI } from '../composables/useCardUI'

// Solo helpers de JavaScript
const { getHeaderConfig, getChipColor } = useCardUI()
</script>

<template>
  <v-card>
    <!-- Usar clases globales -->
    <v-card-title class="bg-gradient-primary text-white">
      Productos
    </v-card-title>
  </v-card>
</template>

<style scoped>
/* Solo estilos específicos del componente */
.selector-grid {
  display: grid;
  gap: var(--spacing-md);
}
</style>
```

### Ejemplo 2: TablaResumenProductos.vue

#### ❌ Antes

```vue
<template>
  <div class="totales-container">
    <p class="text-primary">Total: {{ formatearMoneda(total) }}</p>
  </div>
</template>

<style scoped>
.totales-container {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.text-primary {
  color: #1976d2 !important;
}
</style>
```

#### ✅ Después

```vue
<script setup>
import { useCardUI } from '../composables/useCardUI'
const { formatearMoneda } = useCardUI()
</script>

<template>
  <!-- Usar clases globales directamente -->
  <div class="totales-container">
    <p class="text-primary">Total: {{ formatearMoneda(total) }}</p>
  </div>
</template>

<style scoped>
/* Sin estilos duplicados - las clases ya están disponibles globalmente */
</style>
```

---

## 🎯 API de useCardUI actualizada

### Helpers de JavaScript (Mantener usando)

```javascript
const {
  // Configuración de headers
  getHeaderConfig,          // ✅ Usar
  
  // Colores y estilos
  getChipColor,            // ✅ Usar
  getIcono,                // ✅ Usar
  crearChipEstado,         // ✅ Usar
  
  // Formateadores
  formatearMoneda,         // ✅ Usar
  
  // Configuraciones
  getEmptyStateConfig,     // ✅ Usar
  getPaginacionTexto,      // ✅ Usar
  
  // Referencias (para casos especiales)
  gradientes,              // ⚠️ Usar solo si es necesario
  chipColors,              // ⚠️ Usar solo si es necesario
  iconos                   // ⚠️ Usar solo si es necesario
} = useCardUI()
```

### Propiedades deprecadas

```javascript
const {
  todosLosEstilos,   // ❌ DEPRECADO - Usar clases globales
  estilosGlobales    // ❌ DEPRECADO - Usar clases globales
} = useCardUI()
```

---

## 📚 Clases CSS Globales Disponibles

### Gradientes

```html
<div class="bg-gradient-primary">Azul</div>
<div class="bg-gradient-success">Verde</div>
<div class="bg-gradient-info">Cyan</div>
<div class="bg-gradient-warning">Naranja</div>
<div class="bg-gradient-error">Rojo</div>
<div class="bg-gradient-purple">Morado</div>
```

### Colores de texto

```html
<p class="text-primary">Texto azul</p>
<p class="text-success">Texto verde</p>
<p class="text-error">Texto rojo</p>
<p class="text-warning">Texto naranja</p>
<p class="text-info">Texto cyan</p>
<p class="text-grey">Texto gris</p>
<p class="text-white">Texto blanco</p>
```

### Contenedores

```html
<div class="totales-container">
  <!-- Fondo elevado, padding, sombra -->
</div>

<div class="info-section">
  <!-- Sección de información -->
</div>
```

### Variables CSS disponibles

```css
/* Usar en cualquier componente */
.mi-clase {
  color: var(--primary-color);
  background: var(--gradient-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  transition: all var(--transition-base);
}
```

---

## 🔍 Componentes a migrar

Lista de componentes que usan `useCardUI`:

- [x] ✅ Sistema actualizado y documentado
- [ ] `SelectorProductos.vue` - Eliminar estilos duplicados
- [ ] `TablaResumenProductos.vue` - Eliminar estilos duplicados
- [ ] `ResumenOrden.vue` - Eliminar estilos duplicados

### Checklist de migración por componente

```markdown
- [ ] Importar solo helpers necesarios de useCardUI
- [ ] Eliminar `todosLosEstilos` del destructuring
- [ ] Eliminar estilos CSS duplicados
- [ ] Reemplazar inline styles por clases globales
- [ ] Usar variables CSS en estilos específicos
- [ ] Probar que todo funciona correctamente
- [ ] Actualizar esta lista
```

---

## 🐛 Troubleshooting

### Problema: Los estilos no se aplican

**Causa:** El componente puede tener estilos locales que sobrescriben los globales.

**Solución:**
```vue
<style scoped>
/* Eliminar estilos que colisionen */
/* Usar !important solo si es necesario */
</style>
```

### Problema: Colores diferentes

**Causa:** Los gradientes hardcodeados en el componente pueden diferir ligeramente.

**Solución:**
1. Revisar `design-system.css` para colores actuales
2. Ajustar si es necesario para consistencia
3. Eliminar valores hardcodeados

### Problema: `todosLosEstilos` genera warning

**Causa:** Esta propiedad está deprecada.

**Solución:**
```diff
-const { todosLosEstilos } = useCardUI()
+// No usar todosLosEstilos, usar clases globales
```

---

## 📖 Referencias

- [Sistema de Diseño Global](./DESIGN_SYSTEM_README.md)
- [design-system.css](./src/styles/design-system.css)
- [useCardUI.js](./src/components/composables/useCardUI.js)

---

**Última actualización:** 1 de enero de 2026  
**Versión:** 2.0.0  
**Status:** ✅ Integrado con design-system.css
