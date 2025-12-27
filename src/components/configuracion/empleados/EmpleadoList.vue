<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="empleados"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Lista de Empleados</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark class="mb-2" @click="$emit('crear')">
            Nuevo Empleado
          </v-btn>
        </v-toolbar>
      </template>
      
      <template v-slot:item.actions="{ item }">
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon
              size="small"
              class="me-2"
              v-bind="props"
              @click="$emit('reset-password', item)"
            >
              mdi-lock-reset
            </v-icon>
          </template>
          <span>Restablecer Contraseña</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  empleados: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['crear', 'reset-password']);

const headers = [
  { title: 'Nombre', align: 'start', key: 'nombre' },
  { title: 'Usuario', align: 'start', key: 'usuario' },
  { title: 'Puesto', align: 'start', key: 'puesto' },
  { title: 'Rol', align: 'start', key: 'rol' },
  { title: 'Acciones', key: 'actions', sortable: false },
];
</script>
