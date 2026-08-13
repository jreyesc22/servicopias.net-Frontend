<template>
  <!-- ActionsBar — usa clase global card-actions-bar del design-system -->
  <v-card-actions class="card-actions-bar d-flex justify-end align-center ga-2">
    <span v-if="loading" class="text-caption text-disabled">
      <v-icon size="14" class="mr-1">mdi-loading</v-icon>
      Cargando datos…
    </span>

    <v-btn
      variant="tonal"
      color="warning"
      :loading="loading"
      prepend-icon="mdi-refresh"
      class="btn-smooth"
      @click="$emit('reload')"
    >
      Actualizar
    </v-btn>
  </v-card-actions>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['reload'])
</script>

<!-- Sin <style scoped>: todo el diseño viene del design-system global -->
