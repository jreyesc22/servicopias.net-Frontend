<template>
  <v-app>
    <!-- Barra superior con botón hamburguesa -->
    <v-app-bar app color="primary" dark elevation="2">
      <v-app-bar-nav-icon 
        @click="toggleDrawer" 
        aria-label="Abrir menú de navegación"
        :loading="loading"
      />
      <v-toolbar-title class="text-truncate">
        {{ currentTitle }}
      </v-toolbar-title>
      
      <!-- Espaciador -->
      <v-spacer />
      
      <!-- Botón de cerrar sesión o usuario -->
      <v-btn icon aria-label="Opciones de usuario">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Menú lateral responsivo -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!isMobile && !isTablet"
      :temporary="isMobile || isTablet"
      app
      color="blue-grey-darken-3"
      class="drawer-transition"
      :width="drawerWidth"
      :mini-variant="isTablet && drawer"
      :expand-on-hover="isTablet"
    >
      <!-- Header del drawer -->
 

      <v-divider class="mx-4" style="border-color: rgba(255,255,255,0.2);" />

      <!-- Menú principal -->
      <v-list dense nav class="py-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.id"
          :to="item.route"
          link
          :active="isActiveRoute(item.route)"
          active-class="active-item"
          @click="handleMenuClick"
          class="mx-2 my-1 rounded-lg menu-item"
        >
          <template #prepend>
            <v-icon 
              :color="isActiveRoute(item.route) ? 'white' : 'blue-grey-lighten-1'"
              :title="item.title"
              size="20"
            >
              {{ item.icon }}
            </v-icon>
          </template>
          
          <v-list-item-title 
            :class="[
              'ml-3',
              isActiveRoute(item.route) ? 'text-white font-weight-medium' : 'text-blue-grey-lighten-1'
            ]"
          >
            {{ item.title }}
          </v-list-item-title>

          <!-- Indicador de ruta activa -->
          <template #append v-if="isActiveRoute(item.route)">
            <v-icon size="16" color="white">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>

      <!-- Footer del drawer -->
      <template #append>
        <v-divider class="mx-4" style="border-color: rgba(255,255,255,0.2);" />
        <v-list dense>
          <v-list-item class="mx-2 my-1 rounded-lg menu-item" @click="handleLogout">
            <template #prepend>
              <v-icon color="red-lighten-1" size="20">mdi-logout</v-icon>
            </template>
            <v-list-item-title class="text-red-lighten-1 ml-3">
              Cerrar Sesión
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main>
      <v-container fluid class="pa-4">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </v-container>
    </v-main>

    <!-- Overlay para móvil y tablet -->
    <v-overlay 
      v-if="(isMobile || isTablet) && drawer" 
      @click="drawer = false"
      class="d-lg-none"
    />
  </v-app>
</template>

<script>
export default {
  name: 'SidebarMenu',
  data() {
    return {
      drawer: true,
      loading: false,
      drawerWidth: 280,
      menuItems: [
        { 
          id: 'dashboard', 
          title: 'Inicio', 
          icon: 'mdi-view-dashboard', 
          route: '/Dashboard',
          color: 'primary'
        },
        { 
          id: 'ordenes', 
          title: 'Órdenes', 
          icon: 'mdi-format-list-bulleted', 
          route: '/Ordenes',
          color: 'success'
        },
        { 
          id: 'inventario', 
          title: 'Inventario', 
          icon: 'mdi-archive', 
          route: '/inventario',
          color: 'info'
        },
        { 
          id: 'taller', 
          title: 'Taller de Impresión', 
          icon: 'mdi-wrench', 
          route: '/Taller',
          color: 'warning'
        },
        { 
          id: 'caja', 
          title: 'Caja', 
          icon: 'mdi-cash-register', 
          route: '/Caja',
          color: 'green'
        },
        { 
          id: 'registros', 
          title: 'Registros', 
          icon: 'mdi-file-document', 
          route: '/registros',
          color: 'purple'
        },
        { 
          id: 'configuracion', 
          title: 'Configuración', 
          icon: 'mdi-cog', 
          route: '/configuracion',
          color: 'grey'
        },
      ],
    };
  },
  computed: {
    isMobile() {
      return this.$vuetify.display.smAndDown;
    },
    isTablet() {
      return this.$vuetify.display.mdAndDown && !this.isMobile;
    },
    currentTitle() {
      const route = this.$route.path;
      const item = this.menuItems.find(i => i.route === route);
      return item ? item.title : 'Centro de Impresiones';
    },
    drawerWidth() {
      if (this.isMobile) return 280;
      if (this.isTablet) return 240;
      return 280;
    },
  },
  watch: {
    // Cerrar drawer en móvil cuando cambie la ruta
    '$route'() {
      if (this.isMobile) {
        this.drawer = false;
      }
    },
    // Ajustar drawer según el tamaño de pantalla
    isMobile(newVal) {
      if (newVal) {
        this.drawer = false;
      } else {
        this.drawer = true;
      }
    },
    isTablet(newVal) {
      if (newVal) {
        this.drawer = false;
      }
    }
  },
  mounted() {
    // Configurar drawer según el tamaño de pantalla inicial
    this.drawer = !this.isMobile && !this.isTablet;
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    handleMenuClick() {
      // Cerrar drawer en móvil/tablet al hacer clic en un elemento del menú
      if (this.isMobile || this.isTablet) {
        this.drawer = false;
      }
    },
    isActiveRoute(route) {
      // Mejorar la lógica de detección de ruta activa
      return this.$route.path === route || this.$route.path.startsWith(route + '/');
    },
    handleLogout() {
      this.$store.dispatch('auth/logout')
      .then(() => {
        this.$router.push('/login');
      })
      .catch(err => {
        console.error('Error al cerrar sesión:', err);
      });
    }
  }
};
</script>

<style scoped>
.drawer-transition {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-left: 3px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item {
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.menu-item:hover .v-icon {
  color: white !important;
}

.menu-item:hover .v-list-item-title {
  color: white !important;
}

/* Mejoras en la tipografía */
.v-toolbar-title {
  font-size: 1.2rem;
  font-weight: 500;
}

/* Animación del overlay en móvil */
.v-overlay {
  transition: opacity 0.3s ease;
}

/* Mejoras en el scroll del drawer */
.v-navigation-drawer {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.v-navigation-drawer::-webkit-scrollbar {
  width: 6px;
}

.v-navigation-drawer::-webkit-scrollbar-track {
  background: transparent;
}

.v-navigation-drawer::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.v-navigation-drawer::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-toolbar-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1rem;
  }
  
  .v-list-item-title {
    font-size: 0.9rem;
  }
  
  .v-navigation-drawer {
    width: 100% !important;
    max-width: 300px;
  }
}

@media (max-width: 400px) {
  .v-app-bar {
    padding: 0 8px;
  }
  
  .v-container {
    padding: 12px;
  }
}
</style>