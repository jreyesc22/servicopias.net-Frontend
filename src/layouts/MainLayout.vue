<template>
  <v-app>
    <!-- Menú lateral con navegación -->
    <SidebarMenu />

    <!-- Contenido principal con transición -->
   
  </v-app>
</template>

<script setup>
import SidebarMenu from '@/components/SidebarMenu.vue'
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
