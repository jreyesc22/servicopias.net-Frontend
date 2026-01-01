<template>
  <v-card class="kpi-card" :class="[`kpi-${variant}`, { 'kpi-hoverable': hoverable }]">
    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <!-- Icono -->
        <div class="kpi-icon-container" :class="`kpi-icon-${variant}`">
          <v-icon :size="iconSize" :color="computedIconColor">{{ icon }}</v-icon>
        </div>

        <!-- Contenido -->
        <div class="flex-grow-1 ml-4">
          <div class="kpi-title">{{ title }}</div>
          <div class="kpi-value" :class="`text-${computedValueColor}`">
            {{ formattedValue }}
          </div>
          <div v-if="subtitle" class="kpi-subtitle">
            {{ subtitle }}
          </div>
        </div>

        <!-- Badge opcional -->
        <v-chip
          v-if="badge"
          :color="badgeColor"
          size="small"
          variant="flat"
          class="kpi-badge"
        >
          {{ badge }}
        </v-chip>
      </div>

      <!-- Progreso opcional -->
      <v-progress-linear
        v-if="showProgress"
        :model-value="progressValue"
        :color="computedProgressColor"
        height="4"
        rounded
        class="mt-3"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

/**
 * KPI Card Component - Sistema de Diseño Global
 * 
 * Componente reutilizable para mostrar indicadores clave (KPIs)
 * Integrado con design-system.css
 * 
 * @example
 * <DashboardKPICard
 *   title="Ventas del Día"
 *   :value="15234.50"
 *   icon="mdi-cash-multiple"
 *   variant="success"
 *   format-as-currency
 *   subtitle="+12% vs ayer"
 * />
 */

const props = defineProps({
  // Contenido principal
  title: {
    type: String,
    required: true,
    description: 'Título del KPI'
  },
  value: {
    type: [Number, String],
    required: true,
    description: 'Valor del KPI'
  },
  subtitle: {
    type: String,
    default: '',
    description: 'Subtítulo opcional (ej: "vs mes anterior")'
  },

  // Icono
  icon: {
    type: String,
    required: true,
    description: 'Icono MDI (ej: "mdi-cash")'
  },
  iconSize: {
    type: [Number, String],
    default: 40,
    description: 'Tamaño del icono'
  },

  // Variante de color (primary, success, info, warning, error)
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'info', 'warning', 'error', 'purple'].includes(value),
    description: 'Variante de color del KPI'
  },

  // Colores personalizados (opcional)
  iconColor: {
    type: String,
    default: '',
    description: 'Color del icono (sobrescribe variant)'
  },
  valueColor: {
    type: String,
    default: '',
    description: 'Color del valor (sobrescribe variant)'
  },

  // Formato
  formatAsCurrency: {
    type: Boolean,
    default: false,
    description: 'Formatear como moneda (Q 1,234.56)'
  },
  currencySymbol: {
    type: String,
    default: 'Q',
    description: 'Símbolo de moneda'
  },

  // Badge opcional
  badge: {
    type: String,
    default: '',
    description: 'Texto del badge (ej: "+12%")'
  },
  badgeColor: {
    type: String,
    default: 'success',
    description: 'Color del badge'
  },

  // Barra de progreso opcional
  showProgress: {
    type: Boolean,
    default: false,
    description: 'Mostrar barra de progreso'
  },
  progressValue: {
    type: Number,
    default: 0,
    description: 'Valor de progreso (0-100)'
  },
  progressColor: {
    type: String,
    default: '',
    description: 'Color de la barra de progreso'
  },

  // Interactividad
  hoverable: {
    type: Boolean,
    default: true,
    description: 'Activar efecto hover'
  }
})

// Color del icono según variante
const computedIconColor = computed(() => {
  if (props.iconColor) return props.iconColor
  
  const colorMap = {
    primary: 'primary',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    purple: 'purple'
  }
  
  return colorMap[props.variant] || 'primary'
})

// Color del valor según variante
const computedValueColor = computed(() => {
  if (props.valueColor) return props.valueColor
  return props.variant
})

// Color de progreso según variante
const computedProgressColor = computed(() => {
  if (props.progressColor) return props.progressColor
  return props.variant
})

// Formatear valor
const formattedValue = computed(() => {
  if (props.formatAsCurrency) {
    const valor = parseFloat(props.value) || 0
    return `${props.currencySymbol} ${valor.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }
  return props.value
})
</script>

<style scoped>
/* Componente base */
.kpi-card {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  transition: all var(--transition-base);
  background: var(--surface-color);
  overflow: hidden;
  position: relative;
}

/* Hover effect */
.kpi-card.kpi-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* Contenedor de icono */
.kpi-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius);
  transition: all var(--transition-base);
}

/* Variantes de icono */
.kpi-icon-primary {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(21, 101, 192, 0.15) 100%);
}

.kpi-icon-success {
  background: linear-gradient(135deg, rgba(67, 160, 71, 0.1) 0%, rgba(46, 125, 50, 0.15) 100%);
}

.kpi-icon-info {
  background: linear-gradient(135deg, rgba(0, 172, 193, 0.1) 0%, rgba(2, 136, 209, 0.15) 100%);
}

.kpi-icon-warning {
  background: linear-gradient(135deg, rgba(251, 140, 0, 0.1) 0%, rgba(245, 124, 0, 0.15) 100%);
}

.kpi-icon-error {
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.1) 0%, rgba(211, 47, 47, 0.15) 100%);
}

.kpi-icon-purple {
  background: linear-gradient(135deg, rgba(123, 31, 162, 0.1) 0%, rgba(74, 20, 140, 0.15) 100%);
}

/* Hover en icono */
.kpi-card.kpi-hoverable:hover .kpi-icon-container {
  transform: scale(1.1) rotate(5deg);
}

/* Título */
.kpi-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: #616161;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

/* Valor */
.kpi-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-top: var(--spacing-xs);
  line-height: 1.2;
  transition: color var(--transition-base);
}

/* Subtítulo */
.kpi-subtitle {
  font-size: var(--text-xs);
  color: #9e9e9e;
  margin-top: var(--spacing-xs);
  font-weight: 500;
}

/* Badge */
.kpi-badge {
  font-weight: 700;
  font-size: var(--text-xs);
}

/* Animación de entrada */
.kpi-card {
  animation: fadeInUp var(--transition-smooth) ease-out;
}

/* Responsive */
@media (max-width: 960px) {
  .kpi-value {
    font-size: var(--text-2xl);
  }
  
  .kpi-title {
    font-size: var(--text-xs);
  }

  .kpi-icon-container {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 600px) {
  .kpi-value {
    font-size: var(--text-xl);
  }
  
  .kpi-icon-container {
    width: 40px;
    height: 40px;
  }
}

/* Variantes de card completo con borde sutil */
.kpi-card.kpi-primary {
  border-left: 4px solid var(--primary-color);
}

.kpi-card.kpi-success {
  border-left: 4px solid var(--success-color);
}

.kpi-card.kpi-info {
  border-left: 4px solid var(--info-color);
}

.kpi-card.kpi-warning {
  border-left: 4px solid var(--warning-color);
}

.kpi-card.kpi-error {
  border-left: 4px solid var(--error-color);
}

.kpi-card.kpi-purple {
  border-left: 4px solid #7b1fa2;
}
</style>
