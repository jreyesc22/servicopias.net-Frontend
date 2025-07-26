<template>
  <v-overlay :model-value="isLoading" class="d-flex align-center justify-center" persistent>
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-overlay>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="$route.fullPath" />
    </transition>
  </router-view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const isLoading = ref(false)
const router = useRouter()

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 300) // Ajusta según la duración de tu transición
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
