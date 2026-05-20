<template>
  <!-- Barra de acciones para futuras expansiones -->
  <v-card-actions class="bg-surface-elevated d-flex justify-end">
    <v-btn 
      variant="text" 
      color="info" 
      prepend-icon="mdi-refresh" 
      @click="$emit('reload')"
    >
      Actualizar
    </v-btn>
  </v-card-actions>
</template>

<script setup>
defineEmits(['reload'])
</script>

<style scoped>
.bg-surface-elevated {
  background: var(--surface-elevated, #F8FAFC) !important;
}

.d-flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}
</style>
