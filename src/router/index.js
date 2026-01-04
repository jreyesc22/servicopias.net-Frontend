import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthService from '@/services/auth.service'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'registros', name: 'Registros', component: () => import('@/views/Registros.vue') },
      { path: 'inventario', name: 'Inventario', component: () => import('@/views/Inventario.vue') },
      { path: 'configuracion', name: 'Configuracion', component: () => import('@/views/Configuracion.vue') },
      { path: 'categorias/nueva', name: 'NuevaCategoria', component: () => import('@/views/CategoriaForm.vue') },
      { path: 'Taller', name: 'OrdeneTaller', component: () => import('@/views/Taller.vue') },
      { path: 'caja', name: 'Caja', component: () => import('@/views/Caja.vue') },
      { path: 'ordenes', name: 'Ordenes', component: () => import('@/views/Ordenes.vue') },
      { path: 'pos', name: 'POS', component: () => import('@/views/POS.vue') }
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

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = AuthService.isAuthenticated()

  if (requiresAuth && !isAuthenticated) {
    next('/auth/login')
    } else if (to.path === '/auth/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
