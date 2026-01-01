# 📊 DashboardKPICard - Componente de Indicadores Clave

Componente reutilizable para mostrar KPIs (Key Performance Indicators) con diseño consistente y profesional.

## 📋 Características

- ✅ Integrado con sistema de diseño global
- ✅ 6 variantes de color predefinidas
- ✅ Formato automático de moneda
- ✅ Subtítulos y badges opcionales
- ✅ Barra de progreso opcional
- ✅ Efectos hover suaves
- ✅ Totalmente responsive
- ✅ Composition API (Vue 3)
- ✅ TypeScript-ready

---

## 🎯 Uso Básico

### Ejemplo Simple

```vue
<template>
  <DashboardKPICard
    title="Ventas del Día"
    :value="15234.50"
    icon="mdi-cash-multiple"
    variant="success"
    format-as-currency
  />
</template>

<script setup>
import DashboardKPICard from '@/components/Dashboard/DashboardKPICard.vue'
</script>
```

### Resultado:
```
┌─────────────────────────────────┐
│ 💰  Ventas del Día             │
│     Q 15,234.50                 │
└─────────────────────────────────┘
```

---

## 🎨 Variantes de Color

### Primary (Azul)
```vue
<DashboardKPICard
  title="Total Órdenes"
  :value="145"
  icon="mdi-file-document-multiple"
  variant="primary"
/>
```

### Success (Verde)
```vue
<DashboardKPICard
  title="Ventas del Mes"
  :value="85240.00"
  icon="mdi-trending-up"
  variant="success"
  format-as-currency
/>
```

### Info (Cyan)
```vue
<DashboardKPICard
  title="Clientes Nuevos"
  :value="28"
  icon="mdi-account-multiple-plus"
  variant="info"
/>
```

### Warning (Naranja)
```vue
<DashboardKPICard
  title="Órdenes Pendientes"
  :value="12"
  icon="mdi-clock-alert"
  variant="warning"
/>
```

### Error (Rojo)
```vue
<DashboardKPICard
  title="Pagos Vencidos"
  :value="3"
  icon="mdi-alert-circle"
  variant="error"
/>
```

### Purple (Morado)
```vue
<DashboardKPICard
  title="Productos Populares"
  :value="42"
  icon="mdi-star"
  variant="purple"
/>
```

---

## 🔧 Props Completas

### Contenido Principal

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `title` | String | ✅ | - | Título del KPI |
| `value` | Number/String | ✅ | - | Valor a mostrar |
| `subtitle` | String | ❌ | '' | Texto adicional (ej: "+12% vs ayer") |

### Icono

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `icon` | String | ✅ | - | Icono MDI (ej: "mdi-cash") |
| `iconSize` | Number/String | ❌ | 40 | Tamaño del icono |

### Colores

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `variant` | String | ❌ | 'primary' | Color: primary, success, info, warning, error, purple |
| `iconColor` | String | ❌ | '' | Color personalizado del icono |
| `valueColor` | String | ❌ | '' | Color personalizado del valor |

### Formato

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `formatAsCurrency` | Boolean | ❌ | false | Formatear como moneda |
| `currencySymbol` | String | ❌ | 'Q' | Símbolo de moneda |

### Badge Opcional

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `badge` | String | ❌ | '' | Texto del badge (ej: "+15%") |
| `badgeColor` | String | ❌ | 'success' | Color del badge |

### Progreso Opcional

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `showProgress` | Boolean | ❌ | false | Mostrar barra de progreso |
| `progressValue` | Number | ❌ | 0 | Valor de progreso (0-100) |
| `progressColor` | String | ❌ | '' | Color de la barra |

### Interactividad

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `hoverable` | Boolean | ❌ | true | Activar efecto hover |

---

## 📚 Ejemplos Avanzados

### KPI con Subtítulo

```vue
<DashboardKPICard
  title="Ventas del Día"
  :value="15234.50"
  icon="mdi-cash-multiple"
  variant="success"
  format-as-currency
  subtitle="↑ 12% vs ayer"
/>
```

### KPI con Badge

```vue
<DashboardKPICard
  title="Órdenes Completadas"
  :value="87"
  icon="mdi-check-circle"
  variant="success"
  badge="+15%"
  badge-color="success"
/>
```

### KPI con Barra de Progreso

```vue
<DashboardKPICard
  title="Meta Mensual"
  :value="75234.00"
  icon="mdi-target"
  variant="primary"
  format-as-currency
  subtitle="Meta: Q 100,000"
  show-progress
  :progress-value="75"
  progress-color="primary"
/>
```

### KPI con Colores Personalizados

```vue
<DashboardKPICard
  title="Usuarios Activos"
  :value="1234"
  icon="mdi-account-group"
  variant="info"
  icon-color="cyan"
  value-color="cyan-darken-2"
/>
```

### KPI Sin Hover

```vue
<DashboardKPICard
  title="Total Productos"
  :value="456"
  icon="mdi-package-variant"
  variant="purple"
  :hoverable="false"
/>
```

---

## 🎨 Composición en Grid

### Dashboard 4 Columnas

```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Ventas del Día"
          :value="kpis.ventasHoy"
          icon="mdi-cash-multiple"
          variant="success"
          format-as-currency
          subtitle="↑ 12% vs ayer"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Órdenes Activas"
          :value="kpis.ordenesActivas"
          icon="mdi-file-document-multiple"
          variant="primary"
          badge="En tiempo real"
          badge-color="info"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Clientes Nuevos"
          :value="kpis.clientesNuevos"
          icon="mdi-account-multiple-plus"
          variant="info"
          subtitle="Este mes"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <DashboardKPICard
          title="Pendientes"
          :value="kpis.pendientes"
          icon="mdi-clock-alert"
          variant="warning"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import DashboardKPICard from '@/components/Dashboard/DashboardKPICard.vue'

const kpis = ref({
  ventasHoy: 15234.50,
  ordenesActivas: 42,
  clientesNuevos: 18,
  pendientes: 5
})
</script>
```

---

## 🎯 Casos de Uso

### 1. Dashboard de Ventas

```vue
<v-row>
  <v-col cols="12" md="3">
    <DashboardKPICard
      title="Ventas del Día"
      :value="ventasHoy"
      icon="mdi-cash-register"
      variant="success"
      format-as-currency
      :badge="`${porcentajeCambio}%`"
      :badge-color="porcentajeCambio > 0 ? 'success' : 'error'"
    />
  </v-col>
</v-row>
```

### 2. Dashboard de Órdenes

```vue
<DashboardKPICard
  title="Órdenes Pendientes"
  :value="ordenesPendientes"
  icon="mdi-clock-outline"
  variant="warning"
  show-progress
  :progress-value="(ordenesCompletadas / totalOrdenes) * 100"
  progress-color="success"
  :subtitle="`${ordenesCompletadas}/${totalOrdenes} completadas`"
/>
```

### 3. Dashboard de Inventario

```vue
<DashboardKPICard
  title="Productos Bajo Stock"
  :value="productosBajoStock"
  icon="mdi-alert"
  variant="error"
  :hoverable="true"
  @click="verProductosBajoStock"
/>
```

---

## 🎨 Personalización de Estilos

### Modificar Colores

El componente usa variables CSS del sistema de diseño global:

```css
/* En tu componente o CSS global */
:root {
  --primary-color: #1976D2;    /* Cambia el azul */
  --success-color: #43A047;    /* Cambia el verde */
  --error-color: #E53935;      /* Cambia el rojo */
}
```

### Agregar Clase Personalizada

```vue
<DashboardKPICard
  class="mi-kpi-personalizado"
  title="Mi KPI"
  :value="123"
  icon="mdi-star"
/>
```

```css
<style scoped>
.mi-kpi-personalizado {
  border: 2px dashed var(--primary-color);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
```

---

## 📱 Responsive Design

El componente es totalmente responsive:

- **Desktop (>960px):** Tamaño completo, ícono 64px
- **Tablet (600-960px):** Ícono 48px, fuente reducida
- **Mobile (<600px):** Ícono 40px, layout compacto

```vue
<v-row>
  <!-- En mobile: 1 columna, en tablet: 2, en desktop: 4 -->
  <v-col cols="12" sm="6" md="3">
    <DashboardKPICard ... />
  </v-col>
</v-row>
```

---

## ♿ Accesibilidad

El componente incluye:
- ✅ Contraste adecuado de colores
- ✅ Tamaños de fuente legibles
- ✅ Iconos con significado visual
- ✅ Transiciones suaves (respeta `prefers-reduced-motion`)

---

## 🔄 Migración desde Versión Anterior

### ❌ Antes (Versión Antigua)

```vue
<DashboardKPICard
  title="Ventas"
  :value="1234"
  icon="mdi-cash"
  color="blue-lighten-5"
  icon-color="blue-darken-2"
  format-as-currency
/>
```

### ✅ Después (Nueva Versión)

```vue
<DashboardKPICard
  title="Ventas"
  :value="1234"
  icon="mdi-cash"
  variant="primary"
  format-as-currency
/>
```

**Cambios principales:**
- `color` → `variant` (más semántico)
- `icon-color` → se infiere de `variant` (o usar `iconColor` si es necesario)
- Nuevas props: `subtitle`, `badge`, `showProgress`

---

## 🐛 Troubleshooting

### El icono no se muestra

**Problema:** El icono aparece como texto  
**Solución:** Verificar que el nombre del icono sea correcto y tenga prefijo `mdi-`

```vue
<!-- ❌ Incorrecto -->
<DashboardKPICard icon="cash" />

<!-- ✅ Correcto -->
<DashboardKPICard icon="mdi-cash" />
```

### Los colores no coinciden

**Problema:** Los colores son diferentes a los esperados  
**Solución:** Verificar que `design-system.css` esté importado en `main.js`

### El formato de moneda está mal

**Problema:** El formato de número no es correcto  
**Solución:** Ajustar el locale o usar prop `currencySymbol`

```vue
<DashboardKPICard
  :value="1234.56"
  format-as-currency
  currency-symbol="$"
/>
<!-- Resultado: $ 1,234.56 -->
```

---

## 📖 Referencias

- [Sistema de Diseño Global](./DESIGN_SYSTEM_README.md)
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Vuetify Cards](https://vuetifyjs.com/en/components/cards/)

---

## ✅ Checklist de Implementación

- [ ] Importar componente
- [ ] Definir props requeridas (`title`, `value`, `icon`)
- [ ] Elegir `variant` apropiada
- [ ] Agregar `subtitle` si es necesario
- [ ] Configurar formato de moneda si aplica
- [ ] Probar responsive en diferentes tamaños
- [ ] Verificar accesibilidad y contraste

---

**Última actualización:** 1 de enero de 2026  
**Versión:** 2.0.0  
**Status:** ✅ Integrado con design-system.css
