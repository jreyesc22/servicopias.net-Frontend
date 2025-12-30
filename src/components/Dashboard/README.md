# Dashboard de Ventas - Estructura de Componentes

## 📁 Estructura del Proyecto

El dashboard ha sido refactorizado en componentes modulares y reutilizables para facilitar el mantenimiento y escalabilidad.

```
Dashboard/
├── DashboardOrdenes.vue          # Componente principal (orquestador)
├── DashboardFilters.vue          # Filtros de análisis
├── DashboardKPICard.vue          # Tarjeta reutilizable para KPIs
├── DashboardKPISection.vue       # Sección de KPIs del periodo
├── DashboardGlobalStats.vue      # Estadísticas históricas
├── DashboardChartCard.vue        # Tarjeta reutilizable para gráficos
├── DashboardProductsTable.vue    # Tabla de productos más vendidos
├── useDashboardData.js           # Composable con lógica de datos
└── chartOptions.js               # Configuraciones de gráficos
```

## 🧩 Componentes

### DashboardOrdenes.vue (Principal)
**Responsabilidad:** Orquestar todos los componentes del dashboard.

**Props:** Ninguna (componente raíz)

**Funcionalidad:**
- Coordina la carga de datos mediante el composable
- Renderiza todos los componentes hijos
- Maneja el ciclo de vida (mounted, unmounted)

---

### DashboardFilters.vue
**Responsabilidad:** Controles de filtrado del dashboard.

**Props:**
- `rangoFechas` (Object): Rango de fechas seleccionado
- `periodoTendencia` (String): Periodo para gráfico de tendencias
- `limitProductos` (Number): Cantidad de productos a mostrar

**Emits:**
- `update:rangoFechas`: Cuando cambia el rango de fechas
- `update:periodoTendencia`: Cuando cambia el periodo
- `update:limitProductos`: Cuando cambia el límite de productos

**Funcionalidad:**
- Date range picker para selección de fechas
- Select para periodo de tendencias
- Select para cantidad de productos

---

### DashboardKPICard.vue
**Responsabilidad:** Mostrar un KPI individual con formato consistente.

**Props:**
- `title` (String, required): Título del KPI
- `value` (Number|String, required): Valor a mostrar
- `icon` (String, required): Ícono del KPI
- `color` (String): Color de fondo de la tarjeta
- `iconColor` (String): Color del ícono
- `formatAsCurrency` (Boolean): Si debe formatear como moneda

**Funcionalidad:**
- Tarjeta animada con hover effect
- Formateo automático de valores (número o moneda)
- Diseño responsivo

---

### DashboardKPISection.vue
**Responsabilidad:** Mostrar la sección completa de KPIs del periodo.

**Props:**
- `kpis` (Object, required): Objeto con los KPIs
  - `ventasTotales`: Ventas totales
  - `totalOrdenes`: Total de órdenes
  - `ticketPromedio`: Ticket promedio
  - `totalUnidades`: Total de unidades vendidas
- `rangoFechasTexto` (String, required): Texto descriptivo del rango

**Funcionalidad:**
- Renderiza 4 tarjetas KPI con colores diferentes
- Muestra el periodo seleccionado como título

---

### DashboardGlobalStats.vue
**Responsabilidad:** Mostrar estadísticas históricas (todos los tiempos).

**Props:**
- `globalStats` (Object, required): Estadísticas globales
  - `ventasTotales`: Ventas históricas totales
  - `totalOrdenes`: Total de órdenes históricas
  - `ticketPromedio`: Ticket promedio global

**Funcionalidad:**
- 3 tarjetas con estadísticas históricas
- Formato de moneda personalizado
- Estilos diferenciados de las tarjetas de periodo

---

### DashboardChartCard.vue
**Responsabilidad:** Tarjeta reutilizable para cualquier tipo de gráfico.

**Props:**
- `title` (String, required): Título del gráfico
- `icon` (String, required): Ícono del gráfico
- `iconColor` (String): Color del ícono
- `chartType` (String, required): Tipo de gráfico ('line', 'bar', 'doughnut')
- `data` (Object, required): Datos del gráfico
- `options` (Object, required): Opciones de configuración

**Funcionalidad:**
- Renderiza dinámicamente el componente de gráfico según el tipo
- Muestra skeleton loader mientras carga
- Hover effect en la tarjeta

---

### DashboardProductsTable.vue
**Responsabilidad:** Tabla de productos más vendidos.

**Props:**
- `productos` (Array, required): Lista de productos
- `limit` (Number, required): Cantidad de productos a mostrar
- `loading` (Boolean): Estado de carga

**Funcionalidad:**
- Tabla con v-data-table de Vuetify
- Columnas: Posición, Producto, Unidades, Ingresos, Órdenes
- Medallas (oro, plata, bronce) para top 3
- Imágenes de productos con fallback a ícono
- Formato de moneda y chips personalizados

---

## 🔧 Composables y Utilidades

### useDashboardData.js
**Responsabilidad:** Lógica de negocio y estado del dashboard (Composition API).

**Estado Reactivo:**
```javascript
{
  cargando,              // Estado de carga general
  cargandoProductos,     // Estado de carga de productos
  error,                 // Mensaje de error
  rangoFechas,           // Rango de fechas seleccionado
  periodoTendencia,      // Periodo para tendencias
  limitProductos,        // Límite de productos
  kpis,                  // KPIs del periodo
  globalStats,           // Estadísticas globales
  productosMasVendidos,  // Lista de productos
  lineChartData,         // Datos gráfico de línea
  barChartData,          // Datos gráfico de barras
  pieChartData,          // Datos gráfico circular
  tendenciaChartData     // Datos gráfico de tendencia
}
```

**Métodos:**
- `cargarDashboard()`: Carga datos del dashboard por rango de fechas
- `configurarGraficos(resumen)`: Configura datos de gráficos
- `cargarTendencia()`: Carga gráfico de tendencias
- `cargarEstadisticasGlobales()`: Carga estadísticas históricas
- `cargarProductosMasVendidos()`: Carga productos más vendidos
- `recargarDatos()`: Recarga todos los datos
- `inicializarFechas()`: Establece fechas por defecto (últimos 7 días)
- `onRangoChange()`: Handler con debounce para cambio de fechas

**Computed:**
- `rangoFechasTexto`: Texto formateado del rango de fechas

---

### chartOptions.js
**Responsabilidad:** Configuraciones reutilizables para gráficos de Chart.js.

**Exports:**
- `lineChartOptions`: Configuración para gráficos de línea
- `barChartOptions`: Configuración para gráficos de barras
- `pieChartOptions`: Configuración para gráficos circulares
- `tendenciaChartOptions`: Configuración para gráfico de tendencia

**Características:**
- Responsive y aspect ratio configurado
- Tooltips personalizados con formato de moneda
- Animaciones suaves
- Callbacks para formateo de ejes

---

## 🔄 Flujo de Datos

```
1. DashboardOrdenes (mounted)
   └─> useDashboardData.inicializarFechas()
   └─> useDashboardData.cargarDashboard()
   └─> useDashboardData.cargarEstadisticasGlobales()
   └─> useDashboardData.cargarProductosMasVendidos()

2. Usuario cambia filtros
   └─> DashboardFilters emite eventos
   └─> DashboardOrdenes actualiza estado reactivo
   └─> useDashboardData recarga datos necesarios
   └─> Componentes hijos se actualizan reactivamente

3. Datos fluyen hacia abajo (props)
   DashboardOrdenes
   ├─> DashboardFilters (filtros actuales)
   ├─> DashboardChartCard (datos + opciones de gráficos)
   ├─> DashboardProductsTable (productos + estado)
   ├─> DashboardKPISection (KPIs + texto de rango)
   └─> DashboardGlobalStats (estadísticas globales)
```

---

## 🎨 Ventajas de la Refactorización

### ✅ Mantenibilidad
- Cada componente tiene una única responsabilidad
- Código más fácil de entender y modificar
- Menos de 150 líneas por componente

### ✅ Reutilización
- DashboardKPICard puede usarse en cualquier vista
- DashboardChartCard funciona con cualquier tipo de gráfico
- chartOptions.js centraliza configuraciones

### ✅ Testabilidad
- Componentes pequeños son más fáciles de testear
- Lógica separada en composable
- Props y emits bien definidos

### ✅ Performance
- Actualizaciones reactivas más granulares
- Menos re-renders innecesarios
- Composition API optimizada para Vue 3

### ✅ Escalabilidad
- Fácil agregar nuevos KPIs o gráficos
- Composable puede extenderse sin afectar UI
- Estructura modular permite crecimiento

---

## 📦 Dependencias

- **Vue 3**: Framework principal
- **Vuetify 3**: Biblioteca UI
- **Chart.js**: Librería de gráficos
- **vue-chartjs**: Wrapper Vue para Chart.js

---

## 🔧 Uso

### Importar y usar DashboardOrdenes:
```vue
<template>
  <DashboardOrdenes />
</template>

<script>
import DashboardOrdenes from '@/components/Dashboard/DashboardOrdenes.vue'

export default {
  components: { DashboardOrdenes }
}
</script>
```

### Reutilizar un componente individual:
```vue
<template>
  <DashboardKPICard
    title="Ventas del Día"
    :value="1500.50"
    icon="mdi-cash"
    color="green-lighten-5"
    icon-color="green-darken-2"
    format-as-currency
  />
</template>
```

---

## 🐛 Troubleshooting

### Gráficos no se muestran
- Verificar que `data.labels` tenga elementos
- Revisar que el backend esté devolviendo `ventasPorDia` como array

### KPIs muestran 0
- Verificar que el backend devuelva `estadisticas` como objeto
- Revisar estructura de respuesta en `useDashboardData.js`

### Errores de props
- Verificar que todos los props requeridos se estén pasando
- Revisar tipos de datos (String, Number, Object, Array)

---

## 📝 Próximas Mejoras

- [ ] Agregar tests unitarios para cada componente
- [ ] Implementar cache de datos con vuex/pinia
- [ ] Agregar exportación a PDF/Excel
- [ ] Implementar filtros avanzados (por categoría, estado, etc.)
- [ ] Agregar comparación de periodos
- [ ] Implementar gráficos interactivos con drill-down
