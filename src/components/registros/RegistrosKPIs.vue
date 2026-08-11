<template>
  <v-row class="mb-6" v-if="kpiCards.length > 0">
    <v-col
      v-for="kpi in kpiCards"
      :key="kpi.title"
      cols="12"
      sm="6"
      lg="3"
    >
      <DashboardKPICard
        :variant="kpi.variant"
        :icon="kpi.icon"
        :title="kpi.title"
        :value="kpi.value"
        :subtitle="kpi.subtitle"
        :format-as-currency="kpi.formatAsCurrency"
        :currency-symbol="kpi.currencySymbol"
        :hoverable="true"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import DashboardKPICard from '@/components/Dashboard/DashboardKPICard.vue';

defineProps({
  kpiCards: {
    type: Array,
    default: () => []
  }
});
</script>
