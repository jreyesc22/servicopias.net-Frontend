<template>
  <v-card elevation="4" class="pa-4 chart-card">
    <v-card-title class="text-h6 font-weight-bold mb-3">
      <v-icon left :color="iconColor">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text>
      <component 
        v-if="hasData"
        :is="chartComponent" 
        :data="data" 
        :options="options"
      />
      <v-skeleton-loader v-else type="image" height="300" />
    </v-card-text>
  </v-card>
</template>

<script>
import { Line, Bar, Doughnut } from 'vue-chartjs'

export default {
  name: 'DashboardChartCard',

  components: {
    Line,
    Bar,
    Doughnut
  },

  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    chartType: {
      type: String,
      required: true,
      validator: (value) => ['line', 'bar', 'doughnut'].includes(value)
    },
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: true
    }
  },

  computed: {
    chartComponent() {
      const components = {
        line: Line,
        bar: Bar,
        doughnut: Doughnut
      }
      return components[this.chartType]
    },
    hasData() {
      return this.data.labels && this.data.labels.length > 0
    }
  }
}
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
