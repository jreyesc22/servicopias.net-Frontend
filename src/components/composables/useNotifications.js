// composables/useNotifications.js
import { ref, reactive } from 'vue'

export function useNotifications() {
  const snackbar = reactive({
    success: false,
    successMsg: '',
    error: false,
    errorMsg: '',
    info: false,
    infoMsg: '',
    warning: false,
    warningMsg: ''
  })

  const showMessage = ({ type, message, timeout = null }) => {
    // Cerrar otros snackbars primero
    Object.keys(snackbar).forEach(key => {
      if (key.includes('success') || key.includes('error') || key.includes('info') || key.includes('warning')) {
        snackbar[key] = false
      }
    })

    // Mostrar el nuevo mensaje
    switch (type) {
      case 'success':
        snackbar.successMsg = message
        snackbar.success = true
        break
      case 'error':
        snackbar.errorMsg = message
        snackbar.error = true
        break
      case 'info':
        snackbar.infoMsg = message
        snackbar.info = true
        break
      case 'warning':
        snackbar.warningMsg = message
        snackbar.warning = true
        break
      default:
        console.warn(`Tipo de notificación desconocido: ${type}`)
    }

    // Auto-cerrar si se especifica timeout
    if (timeout) {
      setTimeout(() => {
        snackbar[type] = false
      }, timeout)
    }
  }

  const mostrarExito = (mensaje, timeout = 3000) => {
    showMessage({ type: 'success', message: mensaje, timeout })
  }

  const mostrarError = (mensaje, timeout = 5000) => {
    showMessage({ type: 'error', message: mensaje, timeout })
  }

  const mostrarInfo = (mensaje, timeout = 3000) => {
    showMessage({ type: 'info', message: mensaje, timeout })
  }

  const mostrarAdvertencia = (mensaje, timeout = 4000) => {
    showMessage({ type: 'warning', message: mensaje, timeout })
  }

  const cerrarTodas = () => {
    snackbar.success = false
    snackbar.error = false
    snackbar.info = false
    snackbar.warning = false
  }

  const limpiarMensajes = () => {
    snackbar.successMsg = ''
    snackbar.errorMsg = ''
    snackbar.infoMsg = ''
    snackbar.warningMsg = ''
    cerrarTodas()
  }

  // Mensajes predefinidos comunes
  const mensajesPredefinidos = {
    guardado: 'Guardado correctamente',
    actualizado: 'Actualizado correctamente',
    eliminado: 'Eliminado correctamente',
    errorGeneral: 'Ha ocurrido un error inesperado',
    errorConexion: 'Error de conexión. Verifique su conexión a internet',
    camposRequeridos: 'Por favor complete todos los campos requeridos',
    archivoSubido: 'Archivo subido correctamente',
    errorArchivo: 'Error al subir el archivo'
  }

  const usarMensajePredefinido = (clave, tipo = 'info') => {
    const mensaje = mensajesPredefinidos[clave]
    if (mensaje) {
      showMessage({ type, message: mensaje })
    } else {
      console.warn(`Mensaje predefinido no encontrado: ${clave}`)
    }
  }

  return {
    snackbar,
    showMessage,
    mostrarExito,
    mostrarError,
    mostrarInfo,
    mostrarAdvertencia,
    cerrarTodas,
    limpiarMensajes,
    usarMensajePredefinido,
    mensajesPredefinidos
  }
}