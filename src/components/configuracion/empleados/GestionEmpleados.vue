<template>
  <div>
    <EmpleadoList 
      :empleados="empleados" 
      :loading="loading" 
      @crear="mostrarFormularioCrear"
      @reset-password="mostrarDialogoReset"
    />

    <EmpleadoForm 
      v-model="mostrarForm" 
      @save="handleCrearEmpleado" 
    />

    <PasswordResetDialog 
      v-model="mostrarReset" 
      :empleadoNombre="empleadoSeleccionado?.nombre"
      @confirm="handleResetPassword" 
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useEmpleados } from '@/components/composables/useEmpleados';
import EmpleadoList from './EmpleadoList.vue';
import EmpleadoForm from './EmpleadoForm.vue';
import PasswordResetDialog from './PasswordResetDialog.vue';

const { empleados, loading, error, fetchEmpleados, crearEmpleado, resetPassword } = useEmpleados();

const mostrarForm = ref(false);
const mostrarReset = ref(false);
const empleadoSeleccionado = ref(null);

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
});

onMounted(() => {
  fetchEmpleados();
});

const mostrarFormularioCrear = () => {
  mostrarForm.value = true;
};

const mostrarDialogoReset = (empleado) => {
  empleadoSeleccionado.value = empleado;
  mostrarReset.value = true;
};

const handleCrearEmpleado = async (nuevoEmpleado) => {
  const success = await crearEmpleado(nuevoEmpleado);
  if (success) {
    mostrarNotificacion('Empleado creado correctamente', 'success');
  } else {
    mostrarNotificacion(error.value || 'Error al crear empleado', 'error');
  }
};

const handleResetPassword = async (newPassword) => {
  if (empleadoSeleccionado.value) {
    const success = await resetPassword(empleadoSeleccionado.value.id, newPassword);
    if (success) {
      mostrarNotificacion('Contraseña restablecida correctamente', 'success');
    } else {
      mostrarNotificacion(error.value || 'Error al restablecer contraseña', 'error');
    }
  }
};

const mostrarNotificacion = (mensaje, color) => {
  snackbar.message = mensaje;
  snackbar.color = color;
  snackbar.show = true;
};
</script>
