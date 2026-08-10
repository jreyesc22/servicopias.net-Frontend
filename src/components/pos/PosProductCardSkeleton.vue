<template>
  <v-card elevation="1" class="skeleton-card">
    <v-card-text class="pa-2">
      <div class="d-flex align-center gap-2">
        <v-skeleton-loader type="avatar" width="40" height="40"></v-skeleton-loader>
        <div class="flex-grow-1">
          <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
          <v-skeleton-loader type="text" width="40%"></v-skeleton-loader>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
// This component is purely presentational for loading states.
</script>

<style scoped>
.skeleton-card {
  border-radius: 8px;
}
</style>
