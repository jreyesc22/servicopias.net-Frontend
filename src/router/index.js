import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/auth/login' // Redirige al login por defecto
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'registros', name: 'Registros', component: () => import('@/views/Registros.vue') },
      { path: 'inventario', name: 'Inventario', component: () => import('@/views/Inventario.vue') },
      { path: 'configuracion', name: 'Configuracion', component: () => import('@/views/Configuracion.vue') },
      { path: 'categorias/nueva', name: 'NuevaCategoria', component: () => import('@/views/CategoriaForm.vue') },
      { path: 'Taller', name: 'OrdeneTaller', component: () => import('@/views/Taller.vue') },
      { path: 'caja', name: 'Caja', component: () => import('@/views/Caja.vue') },
      { path: 'ordenes', name: 'Ordenes', component: () => import('@/views/Ordenes.vue') }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: () => import('@/views/Login.vue') }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})