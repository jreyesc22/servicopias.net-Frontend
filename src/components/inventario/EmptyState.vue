<template>
  <div class="empty-state">
    <v-icon :size="iconSize" :color="iconColor">{{ icon }}</v-icon>
    <div class="text-body-2 text-grey mt-2">
      {{ message }}
    </div>
    <div v-if="subtitle" class="text-caption text-grey-lighten-1 mt-1">
      {{ subtitle }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: 'mdi-file-image'
    },
    message: {
      type: String,
      default: 'No hay elementos para mostrar'
    },
    subtitle: {
      type: String,
      default: null
    },
    iconSize: {
      type: [String, Number],
      default: 48
    },
    iconColor: {
      type: String,
      default: 'grey-lighten-1'
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  opacity: 0.7;
  text-align: center;
  padding: 2rem;
}

@media (max-width: 767px) {
  .empty-state {
    min-height: 150px;
    padding: 1rem;
  }
}
</style>