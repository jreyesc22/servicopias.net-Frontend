<template>
 <v-card class="pa-2 mb-4">
      <div class="compact-stepper">
        <div class="steps-row">
          <div
            v-for="(paso, index) in pasos"
            :key="index"
            class="step-item"
          >
            <div
              class="step-icon-mini"
              :class="{ activo: pasoActual === index + 1, completado: pasoActual > index + 1 }"
            >
              <v-icon size="16">{{ paso.icono }}</v-icon>
            </div>
            <span class="step-text">{{ paso.nombre }}</span>
          </div>
        </div>
        <v-progress-linear
          :model-value="((pasoActual - 1) / (pasos.length - 1)) * 100"
          height="3"
          color="primary"
          rounded
          class="mt-2"
        />
      </div>
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
.compact-stepper {
  width: 100%;
}

.steps-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-icon-mini {
  background-color: #e0e0e0;
  color: #757575;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  margin-bottom: 4px;
}

.step-icon-mini.activo {
  background-color: #1976d2;
  color: white;
}

.step-icon-mini.completado {
  background-color: #4caf50;
  color: white;
}

.step-text {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}
</style>
