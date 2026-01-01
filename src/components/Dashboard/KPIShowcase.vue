<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          📊 Showcase de KPI Cards
        </h1>
        <p class="text-subtitle-1 text-grey">
          Ejemplos de todos los estilos y variantes del componente DashboardKPICard
        </p>
      </v-col>
    </v-row>

    <!-- Variantes básicas -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">🎨 Variantes de Color</h2>
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="2">
          <DashboardKPICard
            title="Primary"
            :value="1234"
            icon="mdi-information"
            variant="primary"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="2">
          <DashboardKPICard
            title="Success"
            :value="5678"
            icon="mdi-check-circle"
            variant="success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="2">
          <DashboardKPICard
            title="Info"
            :value="910"
            icon="mdi-information-outline"
            variant="info"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="2">
          <DashboardKPICard
            title="Warning"
            :value="234"
            icon="mdi-alert"
            variant="warning"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="2">
          <DashboardKPICard
            title="Error"
            :value="42"
            icon="mdi-alert-circle"
            variant="error"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="2">
          <DashboardKPICard
            title="Purple"
            :value="789"
            icon="mdi-star"
            variant="purple"
          />
        </v-col>
      </v-row>
    </section>

    <!-- Con formato de moneda -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">💰 Formato de Moneda</h2>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Ventas del Día"
            :value="15234.50"
            icon="mdi-cash-multiple"
            variant="success"
            format-as-currency
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Ventas del Mes"
            :value="425678.25"
            icon="mdi-trending-up"
            variant="primary"
            format-as-currency
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Meta Anual"
            :value="1250000.00"
            icon="mdi-target"
            variant="info"
            format-as-currency
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Deuda Pendiente"
            :value="8432.75"
            icon="mdi-currency-usd-off"
            variant="error"
            format-as-currency
          />
        </v-col>
      </v-row>
    </section>

    <!-- Con subtítulos -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">📝 Con Subtítulos</h2>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Órdenes Hoy"
            :value="87"
            icon="mdi-file-document-multiple"
            variant="primary"
            subtitle="↑ 15% vs ayer"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Clientes Activos"
            :value="342"
            icon="mdi-account-group"
            variant="success"
            subtitle="28 nuevos este mes"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Productos Vendidos"
            :value="1248"
            icon="mdi-package-variant"
            variant="info"
            subtitle="↓ 5% vs semana pasada"
          />
        </v-col>
      </v-row>
    </section>

    <!-- Con badges -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">🏷️ Con Badges</h2>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Ventas Completadas"
            :value="124"
            icon="mdi-check-all"
            variant="success"
            badge="+18%"
            badge-color="success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="En Proceso"
            :value="45"
            icon="mdi-clock-outline"
            variant="warning"
            badge="ACTIVO"
            badge-color="warning"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Tiempo Real"
            :value="892"
            icon="mdi-sync"
            variant="info"
            badge="LIVE"
            badge-color="error"
          />
        </v-col>
      </v-row>
    </section>

    <!-- Con barra de progreso -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">📊 Con Barra de Progreso</h2>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Meta Mensual"
            :value="75240.00"
            icon="mdi-target"
            variant="primary"
            format-as-currency
            subtitle="Meta: Q 100,000"
            show-progress
            :progress-value="75"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Órdenes Completadas"
            :value="145"
            icon="mdi-check-circle-outline"
            variant="success"
            subtitle="De 200 órdenes"
            show-progress
            :progress-value="72.5"
            progress-color="success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Espacio en Disco"
            :value="8.4"
            icon="mdi-harddisk"
            variant="warning"
            subtitle="De 10 GB usados"
            show-progress
            :progress-value="84"
            progress-color="warning"
          />
        </v-col>
      </v-row>
    </section>

    <!-- Ejemplos completos -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">🚀 Ejemplos Completos</h2>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Ventas del Día"
            :value="18645.75"
            icon="mdi-cash-register"
            variant="success"
            format-as-currency
            subtitle="↑ 22% vs ayer"
            badge="+22%"
            badge-color="success"
            show-progress
            :progress-value="85"
            progress-color="success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Órdenes Activas"
            :value="42"
            icon="mdi-file-document-multiple"
            variant="primary"
            subtitle="12 pendientes de pago"
            badge="LIVE"
            badge-color="info"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Clientes Nuevos"
            :value="28"
            icon="mdi-account-multiple-plus"
            variant="info"
            subtitle="Este mes"
            badge="+15%"
            badge-color="success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <DashboardKPICard
            title="Alertas"
            :value="3"
            icon="mdi-bell-alert"
            variant="error"
            subtitle="Requieren atención"
            badge="URGENTE"
            badge-color="error"
          />
        </v-col>
      </v-row>
    </section>

    <!-- Sin hover -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-bold mb-4">🔒 Sin Efecto Hover</h2>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <DashboardKPICard
            title="Dato Estático"
            :value="999"
            icon="mdi-lock"
            variant="primary"
            :hoverable="false"
          />
        </v-col>
      </v-row>
    </section>
  </v-container>
</template>

<script setup>
import DashboardKPICard from './DashboardKPICard.vue'
</script>

<style scoped>
section {
  padding: var(--spacing-lg) 0;
}

h2 {
  color: var(--primary-color);
  border-bottom: 3px solid var(--primary-light);
  padding-bottom: var(--spacing-sm);
  display: inline-block;
}
</style>
