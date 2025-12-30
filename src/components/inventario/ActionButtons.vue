<template>
  <div>
    <v-divider class="my-6" />
    
    <v-row class="action-buttons" justify="end">
      <v-col cols="auto">
        <v-btn 
          color="grey-lighten-1" 
          variant="outlined" 
          @click="$emit('cancel')" 
          prepend-icon="mdi-close"
          :disabled="loading"
          size="large"
        >
          Cancelar
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn 
          type="submit" 
          color="primary" 
          prepend-icon="mdi-content-save"
          :loading="loading"
          :disabled="!formValido || duplicadoError"
          size="large"
          elevation="2"
        >
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    formValido: {
      type: Boolean,
      default: false
    },
    duplicadoError: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel']
}
</script>

<style scoped>
.action-buttons {
  padding: 0 1rem;
}

/* Móviles */
@media (max-width: 767px) {
  .action-buttons {
    gap: 0.5rem;
  }
  
  .action-buttons .v-col {
    flex: 1;
  }
  
  .action-buttons .v-btn {
    width: 100%;
  }
}
</style>