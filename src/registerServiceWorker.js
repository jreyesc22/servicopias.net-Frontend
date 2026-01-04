/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('PWA listo: la app puede funcionar offline (cache).')
    },
    registered() {
      console.log('Service worker registrado.')
    },
    cached() {
      console.log('Contenido cacheado para uso offline.')
    },
    updatefound() {
      console.log('Nuevo contenido disponible; descargando...')
    },
    updated() {
      console.log('Nuevo contenido disponible; recarga para actualizar.')
    },
    offline() {
      console.log('Sin conexión; usando cache.')
    },
    error(error) {
      console.error('Error registrando el service worker:', error)
    }
  })
}
