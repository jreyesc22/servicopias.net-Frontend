<template>
  <v-card class="pa-4 kpi-card elevation-4" :color="color">
    <div class="d-flex align-center mb-2">
      <v-icon size="40" :color="iconColor">{{ icon }}</v-icon>
      <div class="ml-3">
        <div class="kpi-title">{{ title }}</div>
        <div class="kpi-value" :class="`text-${iconColor}`">
          {{ formattedValue }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardKPICard',
  
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'blue-lighten-5'
    },
    iconColor: {
      type: String,
      default: 'blue-darken-2'
    },
    formatAsCurrency: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formattedValue() {
      if (this.formatAsCurrency) {
        const valor = parseFloat(this.value) || 0
        return `Q ${valor.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      }
      return this.value
    }
  }
}
</script>

<style scoped>
.kpi-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.kpi-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #616161;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 4px;
}

@media (max-width: 960px) {
  .kpi-value {
    font-size: 1.5rem;
  }
  
  .kpi-title {
    font-size: 0.75rem;
  }
}
</style>
