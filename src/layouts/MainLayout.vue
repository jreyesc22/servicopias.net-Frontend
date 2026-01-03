<template>
  <v-app>
    <!-- Menú lateral con navegación -->
    <SidebarMenu />

    <!-- Contenido principal -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
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
