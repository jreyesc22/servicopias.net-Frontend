<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Restablecer Contraseña</span>
      </v-card-title>
      <v-card-text>
        <p class="mb-4">Ingrese la nueva contraseña para <strong>{{ empleadoNombre }}</strong>.</p>
        <v-form ref="form" v-model="valid" @submit.prevent="confirmar">
          <v-text-field
            v-model="newPassword"
            label="Nueva Contraseña"
            type="password"
            :rules="[v => !!v || 'La contraseña es requerida', v => v.length >= 6 || 'Mínimo 6 caracteres']"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" variant="text" @click="confirmar" :disabled="!valid">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  empleadoNombre: String
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const dialog = ref(props.modelValue);
const newPassword = ref('');
const valid = ref(false);

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) {
    newPassword.value = '';
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const close = () => {
  dialog.value = false;
};

const confirmar = () => {
  if (valid.value) {
    emit('confirm', newPassword.value);
    close();
  }
};
</script>
