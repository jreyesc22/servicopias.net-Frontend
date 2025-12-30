# Diagrama de Arquitectura del Dashboard

## 🏗️ Estructura de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DashboardOrdenes.vue                             │
│                        (Componente Principal)                           │
│                                                                         │
│  Responsabilidades:                                                     │
│  - Orquestación de componentes hijos                                    │
│  - Ciclo de vida (mounted, beforeUnmount)                               │
│  - Uso del composable useDashboardData()                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ DashboardFilters.vue │  │  Chart Cards     │  │  Data Tables         │
│                      │  │  (4 gráficos)    │  │                      │
│ - Date Range Picker  │  │                  │  │ - Products Table     │
│ - Period Select      │  │ 1. Line Chart    │  │ - Top vendidos       │
│ - Products Limit     │  │ 2. Bar Chart     │  │ - Medals (top 3)     │
│                      │  │ 3. Trend Chart   │  │ - Images/Icons       │
│ Props:               │  │ 4. Doughnut      │  │                      │
│ - rangoFechas       │  │                  │  │ Props:               │
│ - periodoTendencia  │  │ Props (cada uno):│  │ - productos []       │
│ - limitProductos    │  │ - title          │  │ - limit              │
│                      │  │ - icon           │  │ - loading            │
│ Emits:               │  │ - iconColor      │  │                      │
│ - update:*          │  │ - chartType      │  └──────────────────────┘
│                      │  │ - data           │
└──────────────────────┘  │ - options        │
                          │                  │
                          └──────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐      ┌──────────────────────┐
        │ DashboardChartCard   │      │  chartOptions.js     │
        │                      │      │                      │
        │ - Dynamic component  │◄─────│ - lineChartOptions   │
        │ - Line / Bar / Pie   │      │ - barChartOptions    │
        │ - Skeleton loader    │      │ - pieChartOptions    │
        │ - Responsive         │      │ - tendenciaOptions   │
        └──────────────────────┘      └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                           KPI Components                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │ DashboardKPICard │  │ KPISection       │  │ GlobalStats      │
    │                  │  │                  │  │                  │
    │ Reutilizable     │◄─│ Usa 4 KPICards  │  │ 3 KPIs globales  │
    │                  │  │                  │  │                  │
    │ Props:           │  │ Props:           │  │ Props:           │
    │ - title          │  │ - kpis {}        │  │ - globalStats {} │
    │ - value          │  │ - rangoTexto     │  │                  │
    │ - icon           │  │                  │  │ Muestra:         │
    │ - color          │  │ Muestra:         │  │ - Ventas total   │
    │ - iconColor      │  │ - Ventas         │  │ - Órdenes total  │
    │ - formatCurrency │  │ - Órdenes        │  │ - Ticket prom.   │
    │                  │  │ - Ticket prom.   │  │                  │
    │ Formatea:        │  │ - Unidades       │  └──────────────────┘
    │ - Moneda (Q)     │  │                  │
    │ - Números        │  └──────────────────┘
    └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      Capa de Datos (Lógica)                             │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │              useDashboardData.js (Composable)                │
    │                                                              │
    │  Estado Reactivo:                                            │
    │  ├─ cargando, cargandoProductos, error                       │
    │  ├─ rangoFechas, periodoTendencia, limitProductos            │
    │  ├─ kpis {}, globalStats {}                                  │
    │  ├─ productosMasVendidos []                                  │
    │  └─ lineChartData, barChartData, pieChartData, tendenciaData │
    │                                                              │
    │  Métodos:                                                    │
    │  ├─ cargarDashboard()                                        │
    │  ├─ configurarGraficos()                                     │
    │  ├─ cargarTendencia()                                        │
    │  ├─ cargarEstadisticasGlobales()                             │
    │  ├─ cargarProductosMasVendidos()                             │
    │  ├─ recargarDatos()                                          │
    │  ├─ inicializarFechas()                                      │
    │  └─ onRangoChange() [debounced]                              │
    │                                                              │
    │  Computed:                                                   │
    │  └─ rangoFechasTexto                                         │
    └──────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    ApiService (@/services)    │
                    │                               │
                    │  - getResumenByDateRange()    │
                    │  - getTendenciasVentas()      │
                    │  - getEstadisticasGenerales() │
                    │  - getProductosMasVendidos()  │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      Backend API REST         │
                    │  /api/estadisticas/*          │
                    └───────────────────────────────┘
```

## 🔄 Flujo de Datos (Props Down, Events Up)

```
                        Usuario interactúa
                               │
                               ▼
                    ┌─────────────────────┐
                    │  DashboardFilters   │
                    │  emite: update:*    │
                    └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  DashboardOrdenes   │
                    │  actualiza estado   │
                    └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  useDashboardData   │
                    │  carga datos API    │
                    └─────────────────────┘
                               │
                               ▼
            ┌──────────────────┴──────────────────┐
            │                                     │
            ▼                                     ▼
    Estado reactivo                      Componentes hijos
    se actualiza                         reciben props
            │                                     │
            └─────────────►  Re-render  ◄─────────┘
```

## 📊 Distribución de Responsabilidades

| Componente               | Líneas | Responsabilidad                    |
|--------------------------|--------|------------------------------------|
| DashboardOrdenes.vue     | ~120   | Orquestación                       |
| DashboardFilters.vue     | ~80    | Controles de filtrado              |
| DashboardKPICard.vue     | ~90    | Tarjeta KPI reutilizable           |
| DashboardKPISection.vue  | ~70    | Sección de KPIs del periodo        |
| DashboardGlobalStats.vue | ~100   | Estadísticas históricas            |
| DashboardChartCard.vue   | ~80    | Tarjeta de gráfico reutilizable    |
| DashboardProductsTable   | ~120   | Tabla de productos                 |
| useDashboardData.js      | ~220   | Lógica de datos y estado           |
| chartOptions.js          | ~120   | Configuraciones de gráficos        |

**Total:** ~1000 líneas distribuidas en 9 archivos modulares
**Antes:** ~800 líneas en 1 solo archivo monolítico

## 🎯 Ventajas de la Arquitectura

### Separación de Concerns
- ✅ Presentación (componentes Vue)
- ✅ Lógica de negocio (composable)
- ✅ Configuración (chartOptions)

### Reutilización
- ✅ DashboardKPICard → Usar en cualquier dashboard
- ✅ DashboardChartCard → Cualquier tipo de gráfico
- ✅ useDashboardData → Lógica compartible

### Testabilidad
- ✅ Componentes pequeños = tests más simples
- ✅ Composable testeable independientemente
- ✅ Props/emits bien definidos

### Mantenibilidad
- ✅ Cada archivo < 150 líneas
- ✅ Una responsabilidad por componente
- ✅ Fácil de navegar y modificar
