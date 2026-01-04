import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Sistema de diseño global
import './styles/design-system.css'

// PWA: registra el Service Worker en producción
import './registerServiceWorker'

// Suprimir errores de ResizeObserver en desarrollo
const resizeObserverErr = window.console.error
window.console.error = (...args) => {
  if (args[0]?.toString().includes('ResizeObserver loop completed with undelivered notifications')) {
    return
  }
  resizeObserverErr(...args)
}

loadFonts()

createApp(App)

  .use(router)
  .use(vuetify)
  .mount('#app')
