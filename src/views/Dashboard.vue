<!-- En tu App.vue o cualquier componente padre -->
<template>
  <div id="app">
    <DashboardOrdenes />
  </div>
</template>

<script>
import DashboardOrdenes from '../components/Dashboard/DashboardOrdenes.vue'

export default {
  name: 'App',
  components: {
    DashboardOrdenes
  }
}
</script>