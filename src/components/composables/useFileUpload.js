// composables/useFileUpload.js
import { ref, onBeforeUnmount } from 'vue'

export function useFileUpload() {
  const archivos = ref({ imagen: null, pdf: null })
  const previews = ref({ imagen: null, pdf: null })
  const erroresArchivos = ref({ imagen: null, pdf: null })
  
  const limites = {
    imagen: 5 * 1024 * 1024, // 5MB
    pdf: 10 * 1024 * 1024    // 10MB
  }

  const handleFile = (event, tipo) => {
    erroresArchivos.value[tipo] = null
    
    let files = null
    if (event && event.target && event.target.files) {
      files = event.target.files
    } else if (Array.isArray(event)) {
      files = event
    } else if (event) {
      files = [event]
    }
    
    if (!files || files.length === 0) {
      archivos.value[tipo] = null
      limpiarPreview(tipo)
      return
    }

    const file = files[0]
    if (!file) {
      archivos.value[tipo] = null
      limpiarPreview(tipo)
      return
    }

    // Validar tamaño
    if (file.size > limites[tipo]) {
      const sizeMB = (limites[tipo] / (1024 * 1024)).toFixed(0)
      erroresArchivos.value[tipo] = `El archivo es muy grande (máximo ${sizeMB}MB)`
      return
    }

    // Validar tipo
    if (tipo === 'imagen' && !file.type.startsWith('image/')) {
      erroresArchivos.value[tipo] = 'Solo se permiten archivos de imagen'
      return
    }

    if (tipo === 'pdf' && file.type !== 'application/pdf') {
      erroresArchivos.value[tipo] = 'Solo se permiten archivos PDF'
      return
    }

    archivos.value[tipo] = file
    crearPreview(file, tipo)
    
    return { success: true, file, message: `${tipo === 'imagen' ? 'Imagen' : 'PDF'} seleccionado: ${file.name}` }
  }

  const crearPreview = (file, tipo) => {
    limpiarPreview(tipo)
    if (tipo === 'imagen') {
      previews.value.imagen = URL.createObjectURL(file)
    } else if (tipo === 'pdf') {
      previews.value.pdf = file.name
    }
  }

  const limpiarPreview = (tipo) => {
    if (tipo === 'imagen' && previews.value.imagen) {
      URL.revokeObjectURL(previews.value.imagen)
      previews.value.imagen = null
    } else if (tipo === 'pdf') {
      previews.value.pdf = null
    }
  }

  const limpiarPreviews = () => {
    limpiarPreview('imagen')
    limpiarPreview('pdf')
  }

  const eliminarArchivo = (tipo, localItem) => {
    archivos.value[tipo] = null
    limpiarPreview(tipo)
    erroresArchivos.value[tipo] = null
    
    if (localItem && localItem[`${tipo}_url`]) {
      localItem[`${tipo}_url`] = ''
    }
  }

  const resetArchivos = () => {
    archivos.value = { imagen: null, pdf: null }
    limpiarPreviews()
    erroresArchivos.value = { imagen: null, pdf: null }
  }

  onBeforeUnmount(() => {
    limpiarPreviews()
  })

  return {
    archivos,
    previews,
    erroresArchivos,
    handleFile,
    eliminarArchivo,
    resetArchivos,
    limpiarPreviews
  }
}