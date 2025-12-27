<template>
  <v-card elevation="2" class="pa-4" max-width="900">
    <v-card-title class="d-flex align-center">
      <span class="text-h6">Listado de Empleados</span>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="busqueda"
        append-icon="mdi-magnify"
        label="Buscar empleado"
        variant="outlined"
        density="compact"
        hide-details
        class="max-width-200"
      ></v-text-field>
    </v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="empleados"
        :items-per-page="5"
        :search="busqueda"
        :loading="cargando"
        class="elevation-1"
        item-value="id"
      >
        <template v-slot:item.rol="{ item }">
          <v-chip
            :color="getRolColor(item.rol)"
            text-color="white"
            size="small"
          >
            {{ item.rol }}
          </v-chip>
        </template>
        
        <template v-slot:item.acciones="{ item }">
          <v-icon
            size="small"
            class="me-2"
            @click="editarEmpleado(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="error"
            @click="confirmarEliminacion(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
      
      <v-dialog v-model="dialogoEliminar" max-width="400">
        <v-card>
          <v-card-title class="text-h6">¿Eliminar empleado?</v-card-title>
          <v-card-text>
            Esta acción eliminará permanentemente al empleado <strong>{{ empleadoSeleccionado?.nombre }}</strong>. ¿Desea continuar?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="dialogoEliminar = false">Cancelar</v-btn>
            <v-btn color="error" variant="text" @click="eliminarEmpleado">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
  name: 'TablaEmpleados',
  data() {
    return {
      empleados: [],
      busqueda: '',
      cargando: false,
      headers: [
        { title: 'Nombre', key: 'nombre' },
        { title: 'Puesto', key: 'puesto' },
        { title: 'Usuario', key: 'usuario' },
        { title: 'Rol', key: 'rol' },
        { title: 'Acciones', key: 'acciones', sortable: false }
      ],
      dialogoEliminar: false,
      empleadoSeleccionado: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      apiUrl: process.env.VUE_APP_API_URL
    }
  },
  created() {
    this.cargarEmpleados()
  },
  methods: {
    async cargarEmpleados() {
      this.cargando = true
      try {
        const res = await axios.get(`${this.apiUrl}/empleados`)
        this.empleados = res.data
      } catch (err) {
        console.error('Error al cargar empleados:', err)
        this.snackbar = {
          show: true,
          text: 'Error al cargar los empleados',
          color: 'error'
        }
      } finally {
        this.cargando = false
      }
    },
    getRolColor(rol) {
      const colores = {
        'Administrador': 'indigo',
        'Operador': 'green',
        'Logistica': 'blue',
        'Contabilidad': 'orange'
      }
      return colores[rol] || 'grey'
    },
    editarEmpleado(item) {
      // Aquí podrías emitir un evento para editar el empleado
      this.$emit('editar-empleado', item)
    },
    confirmarEliminacion(item) {
      this.empleadoSeleccionado = item
      this.dialogoEliminar = true
    },
    async eliminarEmpleado() {
      try {
        await axios.delete(`${this.apiUrl}/empleados/${this.empleadoSeleccionado.id}`)
        this.dialogoEliminar = false
        
        // Actualizar la lista de empleados
        this.cargarEmpleados()
        
        this.snackbar = {
          show: true,
          text: 'Empleado eliminado correctamente',
          color: 'success'
        }
      } catch (err) {
        console.error('Error al eliminar empleado:', err)
        this.snackbar = {
          show: true,
          text: 'Error al eliminar el empleado',
          color: 'error'
        }
      }
    }
  }
}
</script>

<style scoped>
.max-width-200 {
  max-width: 200px;
}
</style>