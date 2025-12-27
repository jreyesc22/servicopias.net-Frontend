import { ref } from 'vue';
import EmpleadoService from '@/services/empleado.service';

export function useEmpleados() {
  const empleados = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchEmpleados = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await EmpleadoService.getAll();
      empleados.value = response;
    } catch (err) {
      error.value = 'Error al cargar empleados';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const crearEmpleado = async (empleado) => {
    loading.value = true;
    error.value = null;
    try {
      await EmpleadoService.create(empleado);
      await fetchEmpleados(); // Recargar lista
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear empleado';
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (id, newPassword) => {
    loading.value = true;
    error.value = null;
    try {
      await EmpleadoService.resetPassword(id, newPassword);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al restablecer contraseña';
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    empleados,
    loading,
    error,
    fetchEmpleados,
    crearEmpleado,
    resetPassword
  };
}
