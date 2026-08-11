<template>
  <v-card class="welcome-card mb-6" elevation="2">
    <v-card-text class="text-center pa-8">
      <v-icon size="80" color="primary" class="mb-4">mdi-chart-bar</v-icon>
      <h2 class="text-h4 mb-2">¡Bienvenido al módulo de Registros y Reportes!</h2>
      <p class="text-h6 text-grey-darken-1 mb-6">
        Consulta el rendimiento y estadísticas del negocio
      </p>
      <v-row justify="center">
        <v-col cols="12" md="4">
          <v-card class="quick-action-card" @click="emitirCambioVista('ventas_usuario')" hover>
            <v-card-text class="d-flex align-center">
              <v-icon size="40" color="primary" class="mr-4">mdi-account-cash</v-icon>
              <div>
                <h4 class="text-h6 text-left">Ventas por Usuario</h4>
                <p class="text-body-2 text-grey-darken-1 text-left">Consulta el rendimiento y lo que ha vendido cada empleado</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="quick-action-card" @click="emitirCambioVista('reporte_general')" hover>
            <v-card-text class="d-flex align-center">
              <v-icon size="40" color="success" class="mr-4">mdi-chart-line</v-icon>
              <div>
                <h4 class="text-h6 text-left">Reporte General</h4>
                <p class="text-body-2 text-grey-darken-1 text-left">Resumen global de las ventas e ingresos del negocio</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="quick-action-card" @click="emitirCambioVista('ingresos_categoria')" hover>
            <v-card-text class="d-flex align-center">
              <v-icon size="40" color="purple" class="mr-4">mdi-shape</v-icon>
              <div>
                <h4 class="text-h6 text-left">Ingresos por Categoría</h4>
                <p class="text-body-2 text-grey-darken-1 text-left">Total de ingresos agrupado por cada categoría de items</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
const emit = defineEmits(['cambiarVista']);

const emitirCambioVista = (vista) => {
  emit('cambiarVista', vista);
};
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #f0faffe7 0%, #e6f4ff99 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(21, 101, 192, 0.06);
}

.quick-action-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid transparent;
  height: 100%;
}

.quick-action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
