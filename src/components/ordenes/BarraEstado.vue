<template>
  <v-card class="pa-4">
    <v-row class="justify-space-between align-center mb-4">
      <v-col
        v-for="(paso, index) in pasos"
        :key="index"
        class="text-center"
        cols="2"
      >
        <div class="step-container">
          <div
            class="step-icon"
            :class="{ activo: pasoActual === index + 1, completado: pasoActual > index + 1 }"
          >
            <v-icon>
              {{ paso.icono }}
            </v-icon>
          </div>
          <div class="step-label">
            {{ paso.nombre }}
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Barra de progreso -->
    <v-progress-linear
      :model-value="(pasoActual - 1) * 25"
      height="6"
      color="primary"
      striped
      rounded
      class="mt-n4"
    />
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  pasoActual: {
    type: Number,
    required: true
  }
})

const pasos = [
  { nombre: 'Cliente', icono: 'mdi-account' },
  { nombre: 'Productos', icono: 'mdi-cart' },
  { nombre: 'Resumen', icono: 'mdi-receipt' },
  { nombre: 'Confirmación', icono: 'mdi-checkbox-marked-circle-outline' },
  { nombre: 'Caja', icono: 'mdi-cash' }
]
</script>

<style scoped>
.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon {
  background-color: #e0e0e0;
  color: #757575;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
}

.step-icon.activo {
  background-color: #1976d2;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.6);
}

.step-icon.completado {
  background-color: #4caf50;
  color: white;
}

.step-label {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
