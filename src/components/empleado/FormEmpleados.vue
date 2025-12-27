<template>
  <v-card elevation="2" class="pa-4" max-width="600">
    <v-card-title class="text-h6">Registro de Empleado</v-card-title>
    <v-card-text>
      <v-form ref="empleadoForm" v-model="formValido" @submit.prevent="guardarEmpleado">
        <v-text-field
          v-model="empleado.nombre"
          label="Nombre completo"
          variant="outlined"
          density="compact"
          :rules="[v => !!v || 'Campo requerido']"
          required
        />
        <v-text-field
          v-model="empleado.puesto"
          label="Puesto"
          variant="outlined"
          density="compact"
        />
        <v-text-field
          v-model="empleado.usuario"
          label="Usuario"
          variant="outlined"
          density="compact"
          :rules="[v => !!v || 'Campo requerido']"
          required
        />
        <v-text-field
          v-model="empleado.contrasena"
          label="Contraseña"
          type="password"
          variant="outlined"
          density="compact"
          :rules="[v => !!v || 'Campo requerido']"
          required
        />
        <v-select
          v-model="empleado.rol"
          :items="roles"
          label="Rol"
          variant="outlined"
          density="compact"
          :rules="[v => !!v || 'Seleccione un rol']"
          required
        />
        <v-row justify="end" class="mt-4">
          <v-btn color="primary" type="submit" :disabled="!formValido">
            Guardar
          </v-btn>
        </v-row>
      </v-form>
    </v-card-text>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" color="white" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from "axios"

export default {
  name: 'FormularioEmpleado',
  data() {
    return {
      formValido: false,
      empleado: {
        nombre: '',
        puesto: 'Atencion al Cliente',
        usuario: '',
        contrasena: '',
        rol: 'Operador'
      },
      roles: ['Administrador', 'Operador', 'Logistica','Contabilidad'],
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      apiUrl: process.env.VUE_APP_API_URL
    }
  },
  methods: {
    async guardarEmpleado() {
      try {
        const res = await axios.post(`${this.apiUrl}/empleados/new`, this.empleado)
        this.snackbar = {
          show: true,
          text: 'Empleado guardado correctamente',
          color: 'success'
        }
        console.log('Empleado creado:', res.data)
        this.resetearFormulario()
      } catch (err) {
        console.error('Error al guardar empleado:', err)
        this.snackbar = {
          show: true,
          text: 'Error al guardar empleado',
          color: 'error'
        }
      }
    },
    resetearFormulario() {
      this.empleado = {
        nombre: '',
        puesto: '',
        usuario: '',
        contrasena: '',
        rol: 'Operador'
      }
      this.formValido = false
    }
  }
}
</script>

<style scoped>
.v-card {
  max-width: 600px;
  margin: auto;
}
</style>
