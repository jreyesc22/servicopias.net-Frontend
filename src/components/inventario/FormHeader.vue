<template>
  <v-card-title class="form-header">
    <v-icon class="mr-3" color="white">mdi-package-variant</v-icon>
    <span class="text-h5 font-weight-medium">
      {{ item ? 'Editar' : 'Crear' }} {{ tipo === 'producto' ? 'Producto' : 'Servicio' }}
    </span>
    <v-spacer />
    <v-chip 
      :color="tipo === 'producto' ? 'blue' : 'deep-purple accent-4'" 
      variant="tonal" 
      size="small"
    >
      {{ tipo }}
    </v-chip>
  </v-card-title>
</template>

<script>
export default {
  name: 'FormHeader',
  props: {
    item: {
      type: Object,
      default: null
    },
    tipo: {
      type: String,
      default: 'producto'
    }
  }
}
</script>

<style scoped>
.form-header {
  background: linear-gradient(135deg, #667eea 0%, #6a1eb6 100%);
  color: white !important;
  padding: 1.5rem 2rem;
}

.form-header .v-icon {
  color: white !important;
}

@media (max-width: 767px) {
  .form-header {
    padding: 1rem;
    text-align: center;
  }
  
  .form-header .text-h5 {
    font-size: 1.1rem !important;
  }
}
</style>