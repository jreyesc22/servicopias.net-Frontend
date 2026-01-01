# 🎨 Sistema de Diseño Global - ServiCopias.net Frontend

Sistema de diseño unificado para el panel administrativo y módulo POS del proyecto ServiCopias.net

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Variables CSS](#variables-css)
- [Animaciones](#animaciones)
- [Componentes Base](#componentes-base)
- [Uso en Componentes](#uso-en-componentes)
- [Ejemplos](#ejemplos)

---

## 📦 Instalación

El sistema de diseño ya está importado globalmente en `main.js`:

```javascript
import './styles/design-system.css'
```

Todas las variables y clases de utilidad están disponibles automáticamente en todos los componentes.

---

## 🎨 Variables CSS

### Colores Principales

```css
--primary-color: #1976D2;
--primary-light: #42A5F5;
--primary-dark: #1565C0;

--secondary-color: #43A047;
--secondary-light: #66BB6A;
--secondary-dark: #2E7D32;

--success-color: #43A047;
--error-color: #E53935;
--warning-color: #FB8C00;
--info-color: #00ACC1;
```

### Gradientes del POS

```css
--pos-gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--pos-gradient-background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
--pos-gradient-success: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
```

### Sombras

```css
--shadow-xs: 0 2px 8px rgba(21, 101, 192, 0.04);
--shadow-sm: 0 4px 12px rgba(21, 101, 192, 0.06);
--shadow-light: 0 4px 20px rgba(21, 101, 192, 0.08);
--shadow-medium: 0 8px 32px rgba(21, 101, 192, 0.12);
--shadow-large: 0 16px 48px rgba(21, 101, 192, 0.16);
--shadow-hover: 0 12px 40px rgba(21, 101, 192, 0.15);
--shadow-elevated: 0 20px 60px rgba(21, 101, 192, 0.20);
```

### Border Radius

```css
--border-radius-sm: 8px;
--border-radius: 12px;
--border-radius-lg: 16px;
--border-radius-xl: 24px;
--border-radius-2xl: 32px;
```

### Spacing

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 5rem;     /* 80px */
```

### Transiciones

```css
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-smooth: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## ✨ Animaciones

### Animaciones Disponibles

```css
@keyframes fadeInUp       /* Fade in con movimiento hacia arriba */
@keyframes fadeIn         /* Simple fade in */
@keyframes slideInLeft    /* Slide desde la izquierda */
@keyframes slideInRight   /* Slide desde la derecha */
@keyframes float          /* Flotación suave */
@keyframes pulse          /* Pulsación suave */
@keyframes scaleIn        /* Escala desde 0.9 a 1 */
@keyframes shimmer        /* Shimmer para skeleton loaders */
```

### Clases de Utilidad

```html
<!-- Animaciones básicas -->
<div class="animate-fade-in-up">Aparece con fade in hacia arriba</div>
<div class="animate-fade-in">Aparece con fade in simple</div>
<div class="animate-slide-in-left">Slide desde izquierda</div>
<div class="animate-slide-in-right">Slide desde derecha</div>
<div class="animate-scale-in">Scale in</div>
<div class="animate-pulse">Pulsación infinita</div>
<div class="animate-float">Flotación suave</div>

<!-- Delays para animaciones escalonadas -->
<div class="animate-fade-in-up delay-100">Aparece primero</div>
<div class="animate-fade-in-up delay-200">Aparece segundo</div>
<div class="animate-fade-in-up delay-300">Aparece tercero</div>
```

---

## 🧩 Componentes Base

### Gradientes

```vue
<template>
  <v-card class="gradient-primary">
    <!-- Header con gradiente morado -->
  </v-card>
  
  <v-container class="gradient-background">
    <!-- Fondo con gradiente suave -->
  </v-container>
</template>
```

### Cards Elevadas

```vue
<template>
  <v-card class="card-elevated">
    <!-- Card con sombra y efecto hover automático -->
  </v-card>
</template>
```

### Botones con Transición

```vue
<template>
  <v-btn class="btn-smooth">
    <!-- Botón con hover suave -->
  </v-btn>
</template>
```

### Efecto Glass

```vue
<template>
  <div class="glass-effect">
    <!-- Efecto cristal con blur -->
  </div>
</template>
```

### Badges

```vue
<template>
  <span class="badge-success">Pagado</span>
  <span class="badge-error">Pendiente</span>
  <span class="badge-warning">En Proceso</span>
</template>
```

### KPIs (Indicadores Clave)

```vue
<template>
  <!-- Grid de KPIs -->
  <div class="kpi-grid">
    <DashboardKPICard
      title="Ventas del Día"
      :value="15234.50"
      icon="mdi-cash-multiple"
      variant="success"
      format-as-currency
    />
    <!-- Más KPIs... -->
  </div>
</template>
```

**Clases de utilidad para KPIs:**
```html
<div class="kpi-number">1,234</div>
<div class="kpi-label">Ventas Totales</div>
<div class="kpi-trend-up">↑ 12%</div>
<div class="kpi-trend-down">↓ 5%</div>
<div class="kpi-trend-neutral">→ 0%</div>
```

📖 **[Ver documentación completa de KPIs](./KPI_CARD_README.md)**

---

## 🔧 Uso en Componentes

### Ejemplo: Componente con Variables CSS

```vue
<template>
  <v-card class="mi-componente">
    <v-card-title>Mi Título</v-card-title>
    <v-card-text>Contenido</v-card-text>
  </v-card>
</template>

<style scoped>
.mi-componente {
  background: var(--pos-gradient-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  transition: all var(--transition-base);
}

.mi-componente:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}
</style>
```

### Ejemplo: Componente con Animaciones

```vue
<template>
  <div class="animate-fade-in-up">
    <v-card class="card-elevated">
      <v-card-title class="animate-slide-in-left delay-100">
        Título animado
      </v-card-title>
      <v-card-text class="animate-slide-in-right delay-200">
        Contenido animado
      </v-card-text>
    </v-card>
  </div>
</template>
```

---

## 📖 Ejemplos de Componentes

### ScannerInput (POS)

```vue
<style scoped>
.scanner-input-card {
  background: var(--pos-gradient-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  transition: all var(--transition-base);
}

.scanner-input-card:hover {
  box-shadow: var(--shadow-hover);
}
</style>
```

### CarritoPOS

```vue
<style scoped>
.carrito-pos-card {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  transition: all var(--transition-base);
}

.carrito-item {
  transition: all var(--transition-base);
}

.carrito-item:hover {
  transform: scale(1.01);
}
</style>
```

### Vista POS

```vue
<style scoped>
.pos-view {
  background: var(--pos-gradient-background);
}

.pos-header {
  background: var(--pos-gradient-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-large);
}
</style>
```

---

## 🎯 Mejores Prácticas

### 1. Usar Variables en lugar de Valores Directos

❌ **Evitar:**
```css
.mi-componente {
  box-shadow: 0 8px 32px rgba(21, 101, 192, 0.12);
  border-radius: 16px;
  transition: all 0.3s ease;
}
```

✅ **Correcto:**
```css
.mi-componente {
  box-shadow: var(--shadow-medium);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);
}
```

### 2. Aprovechar Clases de Utilidad

❌ **Evitar:**
```vue
<template>
  <div class="mi-animacion">Contenido</div>
</template>

<style scoped>
.mi-animacion {
  animation: fadeInUp 0.4s ease-out;
}
@keyframes fadeInUp { /* ... */ }
</style>
```

✅ **Correcto:**
```vue
<template>
  <div class="animate-fade-in-up">Contenido</div>
</template>
```

### 3. Consistencia en Transiciones

Usar siempre las transiciones predefinidas:
- `--transition-fast` (0.15s) - Hover de botones, interacciones rápidas
- `--transition-base` (0.3s) - Transiciones estándar
- `--transition-smooth` (0.4s) - Animaciones suaves
- `--transition-slow` (0.6s) - Animaciones complejas

### 4. Aplicar Hover Effects

```css
.mi-componente {
  transition: all var(--transition-base);
}

.mi-componente:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}
```

---

## 🔄 Migración de Componentes Existentes

### Paso 1: Identificar estilos inline

Buscar en componentes:
- `background: linear-gradient(...)`
- `box-shadow: 0 ...`
- `border-radius: 16px`
- `transition: all 0.3s`

### Paso 2: Reemplazar con variables

```diff
<style scoped>
.mi-card {
-  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
+  background: var(--pos-gradient-primary);
-  box-shadow: 0 8px 32px rgba(21, 101, 192, 0.12);
+  box-shadow: var(--shadow-medium);
-  border-radius: 16px;
+  border-radius: var(--border-radius-lg);
-  transition: all 0.3s ease;
+  transition: all var(--transition-base);
}
</style>
```

### Paso 3: Agregar efectos hover

```css
.mi-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}
```

---

## � Referencias

- [Vuetify Documentation](https://vuetifyjs.com/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Animations (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Migración de useCardUI](./USE_CARD_UI_MIGRATION.md)

---

## 🔗 Integración con useCardUI

El composable `useCardUI` ha sido actualizado para trabajar junto con el sistema de diseño global:

### ✅ Usar (Helpers de JavaScript)

```javascript
import { useCardUI } from '@/components/composables/useCardUI'

const {
  getHeaderConfig,      // Configuración de headers
  getChipColor,         // Colores de chips por estado
  formatearMoneda,      // Formatear valores monetarios
  getIcono,             // Obtener iconos por tipo
  crearChipEstado,      // Crear configuración de chip
  getEmptyStateConfig,  // Estados vacíos
  getPaginacionTexto    // Texto de paginación
} = useCardUI()
```

### ❌ No usar (Deprecado)

```javascript
// DEPRECADO: Los estilos ya están en design-system.css
const { todosLosEstilos, estilosGlobales } = useCardUI()
```

### Migración

Si tu componente usa `useCardUI`, consulta la [guía de migración completa](./USE_CARD_UI_MIGRATION.md).

**Pasos rápidos:**
1. Eliminar `todosLosEstilos` de imports
2. Eliminar CSS duplicado del `<style>` del componente
3. Usar clases globales: `bg-gradient-primary`, `text-primary`, etc.
4. Mantener solo helpers de JavaScript

---

## 🐛 Troubleshooting

### Variables no se aplican

**Problema:** Las variables CSS no funcionan  
**Solución:** Verificar que `design-system.css` esté importado en `main.js`

### Animaciones no funcionan

**Problema:** Las clases de animación no tienen efecto  
**Solución:** Verificar que no haya conflictos con estilos de Vuetify

### Hover effects no funcionan en móvil

**Problema:** Los efectos hover no se ven en dispositivos táctiles  
**Solución:** Agregar media queries para deshabilitar en móvil:

```css
@media (hover: none) {
  .mi-componente:hover {
    transform: none;
  }
}
```

---

## ✅ Checklist de Implementación

Al crear o migrar un componente:

- [ ] Usar variables CSS para colores
- [ ] Usar variables para sombras
- [ ] Usar variables para border-radius
- [ ] Usar variables para transiciones
- [ ] Agregar efectos hover cuando sea apropiado
- [ ] Considerar animaciones para entradas/salidas
- [ ] Verificar accesibilidad con `:focus-visible`
- [ ] Probar en modo oscuro (si aplica)
- [ ] Verificar responsive design

---

**Última actualización:** 1 de enero de 2026  
**Versión:** 1.0.0  
**Mantenedor:** ServiCopias.net Team
