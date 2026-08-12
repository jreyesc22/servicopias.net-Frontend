<template>
  <v-dialog v-model="open" max-width="480px" persistent>
    <v-card class="client-modal">
      <!-- Header con gradiente info del design-system -->
      <v-card-title class="client-modal__header bg-gradient-info d-flex align-center pa-4">
        <v-icon color="white" size="24" class="mr-3">mdi-account-edit</v-icon>
        <div>
          <div class="text-h6 text-white font-weight-bold">Cliente de la venta</div>
          <div class="text-caption text-white opacity-80">
            Ingresa los datos del cliente para esta orden
          </div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="white" @click="close" />
      </v-card-title>

      <!-- Badge de cliente actual si viene prellenado -->
      <div v-if="initial?.nombre && initial.nombre !== 'CF'" class="client-modal__current pa-3 pb-0">
        <v-chip
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-account-check"
        >
          Cliente actual: {{ initial.nombre }}
        </v-chip>
      </div>

      <v-card-text class="pa-4 pt-3">
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="form.nombre"
            label="Nombre del cliente"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-account"
            placeholder="Consumidor Final"
            class="mb-3"
            hide-details="auto"
          />
          <v-text-field
            v-model="form.telefono"
            label="Teléfono"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-phone"
            placeholder="Opcional"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="form.nit"
            label="NIT / Identificación"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-identifier"
            placeholder="CF"
            hide-details
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0 client-modal__footer">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          prepend-icon="mdi-close"
          @click="close"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-check-circle"
          @click="guardar"
        >
          Guardar Cliente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initial:    { type: Object,  default: () => ({ nombre: 'CF', telefono: '', nit: 'CF' }) },
});

const emits = defineEmits(['update:modelValue', 'save']);

const open    = ref(props.modelValue);
const formRef = ref(null);
const form    = ref({ ...props.initial });

// ─── Watchers (sin cambios de lógica) ────────────────────────────────────────
watch(() => props.modelValue, (v) => { open.value = v; });
watch(open,                   (v) => emits('update:modelValue', v));
watch(() => props.initial,    (v) => { form.value = { ...v }; }, { immediate: true });

const rules = {
  required: v => (v && v.toString().trim().length > 0) || 'El nombre es requerido',
};

const close = () => { open.value = false; };

const guardar = () => {
  const valid = !(!form.value.nombre || String(form.value.nombre).trim() === '');
  if (!valid) return;
  emits('save', { ...form.value });
  open.value = false;
};
</script>

<style scoped>
.client-modal {
  border-radius: var(--border-radius-lg) !important;
  overflow: hidden;
}

.client-modal__header {
  background: var(--gradient-info);
}

.client-modal__footer {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.client-modal__current {
  background-color: rgba(25, 118, 210, 0.04);
}
</style>
