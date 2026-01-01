<template>
  <v-card elevation="3" class="scanner-input-card">
    <v-card-text class="pa-4">
      <!-- Input de código de barras -->
      <v-text-field
        ref="scannerInputRef"
        v-model="codigoActual"
        label="Escanear código de barras"
        placeholder="Escanee o ingrese el código..."
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-barcode-scan"
        clearable
        autofocus
        :loading="procesando"
        :disabled="deshabilitado"
        @keyup.enter="procesarCodigo"
        @update:model-value="onInputChange"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-magnify"
            color="primary"
            :disabled="!codigoActual || procesando"
            @click="procesarCodigo"
          />
        </template>
      </v-text-field>

      <!-- Indicador de último escaneo -->
      <v-expand-transition>
        <v-alert
          v-if="ultimoResultado"
          :type="ultimoResultado.success ? 'success' : 'error'"
          variant="tonal"
          density="compact"
          class="mt-2"
          closable
          @click:close="ultimoResultado = null"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon :icon="ultimoResultado.success ? 'mdi-check-circle' : 'mdi-alert-circle'" class="mr-2" />
              <span>{{ ultimoResultado.message }}</span>
            </div>
            <v-chip 
              v-if="ultimoResultado.success && ultimoResultado.cantidadTotal"
              size="small" 
              color="success"
              variant="elevated"
            >
              x{{ ultimoResultado.cantidadTotal }}
            </v-chip>
          </div>
        </v-alert>
      </v-expand-transition>

      <!-- Información de ayuda -->
      <v-chip
        v-if="!ultimoResultado"
        size="small"
        variant="text"
        prepend-icon="mdi-information-outline"
        class="mt-2"
      >
        Presione Enter o escanee el código de barras
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  procesando: {
    type: Boolean,
    default: false
  },
  deshabilitado: {
    type: Boolean,
    default: false
  },
  mostrarEstadisticas: {
    type: Boolean,
    default: true
  },
  autoLimpiar: {
    type: Boolean,
    default: true
  },
  tiempoAutoLimpiar: {
    type: Number,
    default: 500 // 0.5 segundos para limpiar más rápido
  }
});

const emit = defineEmits(['codigo-escaneado', 'resultado']);

// Estado
const codigoActual = ref('');
const ultimoResultado = ref(null);
const scannerInputRef = ref(null);

// Estadísticas
const totalEscaneados = ref(0);
const exitosos = ref(0);
const errores = ref(0);

// Buffer para detección de scanner automático
let bufferTiempo = Date.now();
let bufferCodigo = '';
let timeoutScanner = null;

/**
 * Detectar si es un scanner (múltiples caracteres en muy poco tiempo)
 */
const onInputChange = (valor) => {
  const ahora = Date.now();
  const diferenciaTiempo = ahora - bufferTiempo;

  // Si hay menos de 50ms entre caracteres, probablemente es un scanner
  if (diferenciaTiempo < 50 && valor.length > bufferCodigo.length) {
    bufferCodigo = valor;
    
    // Limpiar timeout anterior
    if (timeoutScanner) {
      clearTimeout(timeoutScanner);
    }
    
    // Procesar automáticamente después de 30ms sin nuevos caracteres (más rápido)
    timeoutScanner = setTimeout(() => {
      if (valor && valor.length > 3) { // Mínimo 4 caracteres para considerar válido
        procesarCodigo();
      }
    }, 30);
  } else {
    bufferCodigo = '';
  }

  bufferTiempo = ahora;
};

/**
 * Procesar código escaneado o ingresado
 */
const procesarCodigo = async () => {
  if (!codigoActual.value || codigoActual.value.trim() === '') {
    return;
  }

  const codigo = codigoActual.value.trim();
  totalEscaneados.value++;

  // Emitir evento con el código
  emit('codigo-escaneado', codigo);

  // Limpiar input si autoLimpiar está activo
  if (props.autoLimpiar) {
    setTimeout(() => {
      codigoActual.value = '';
      enfocarInput();
    }, props.tiempoAutoLimpiar);
  }
};

/**
 * Actualizar resultado del escaneo
 */
const actualizarResultado = (resultado) => {
  ultimoResultado.value = resultado;
  
  if (resultado.success) {
    exitosos.value++;
  } else {
    errores.value++;
  }

  // Auto-ocultar después de 3 segundos
  setTimeout(() => {
    if (ultimoResultado.value === resultado) {
      ultimoResultado.value = null;
    }
  }, 3000);
};

/**
 * Enfocar input del scanner
 */
const enfocarInput = async () => {
  await nextTick();
  if (scannerInputRef.value) {
    scannerInputRef.value.focus();
  }
};

/**
 * Reiniciar estadísticas
 */
const reiniciarEstadisticas = () => {
  totalEscaneados.value = 0;
  exitosos.value = 0;
  errores.value = 0;
  ultimoResultado.value = null;
};

// Exponer métodos al padre
defineExpose({
  enfocarInput,
  actualizarResultado,
  reiniciarEstadisticas
});

// Auto-enfocar al montar
onMounted(() => {
  enfocarInput();
});

// Re-enfocar cuando se habilita
watch(() => props.deshabilitado, (nuevo) => {
  if (!nuevo) {
    enfocarInput();
  }
});
</script>

<style scoped>
.scanner-input-card {
  background: var(--pos-gradient-primary);
  color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  transition: all var(--transition-base);
}

.scanner-input-card:hover {
  box-shadow: var(--shadow-hover);
}

.scanner-input-card :deep(.v-field) {
  background: var(--surface-color) !important;
  border-radius: var(--border-radius);
  transition: all var(--transition-base);
}

.scanner-input-card :deep(.v-field:focus-within) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.scanner-input-card :deep(.v-field__input) {
  color: #000 !important;
  caret-color: var(--primary-color) !important;
  font-size: var(--text-lg);
}

.scanner-input-card :deep(.v-field__input)::placeholder {
  color: #666 !important;
  opacity: 0.7;
}

.scanner-input-card :deep(.v-label) {
  color: #333 !important;
  font-weight: 500;
}

.scanner-input-card :deep(.v-chip) {
  opacity: 0.9;
  transition: all var(--transition-fast);
}

.scanner-input-card :deep(.v-chip:hover) {
  opacity: 1;
  transform: scale(1.05);
}

.scanner-input-card :deep(.v-btn) {
  transition: all var(--transition-base);
}

.scanner-input-card :deep(.v-btn:hover) {
  transform: scale(1.1);
}

.scanner-input-card :deep(.v-alert) {
  border-radius: var(--border-radius);
  animation: slideInRight var(--transition-smooth) ease-out;
}
</style>
