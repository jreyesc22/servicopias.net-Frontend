<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Nuevo Empleado</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" @submit.prevent="guardar">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="empleado.nombre"
                  label="Nombre Completo"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="empleado.usuario"
                  label="Usuario"
                  :rules="[v => !!v || 'El usuario es requerido']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="empleado.puesto"
                  label="Puesto"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="empleado.rol"
                  :items="roles"
                  label="Rol"
                  :rules="[v => !!v || 'El rol es requerido']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="empleado.contrasena"
                  label="Contraseña"
                  type="password"
                  :rules="[v => !!v || 'La contraseña es requerida']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="close">
          Cancelar
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="guardar" :disabled="!valid">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialog = ref(props.modelValue);
const valid = ref(false);
const form = ref(null);

const empleado = reactive({
  nombre: '',
  usuario: '',
  puesto: '',
  rol: '',
  contrasena: ''
});

const roles = ['admin', 'cajero', 'taller', 'empleado'];

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) {
    resetForm();
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const resetForm = () => {
  empleado.nombre = '';
  empleado.usuario = '';
  empleado.puesto = '';
  empleado.rol = '';
  empleado.contrasena = '';
  if (form.value) form.value.resetValidation();
};

const close = () => {
  dialog.value = false;
};

const guardar = () => {
  if (valid.value) {
    emit('save', { ...empleado });
    close();
  }
};
</script>
