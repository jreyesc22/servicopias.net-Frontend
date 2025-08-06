// composables/useFormValidation.js
import { ref } from 'vue'
import { debounce } from 'lodash'
import { useApiService } from './useApiService'

export function useFormValidation() {
  const { validarNombre, validarItem } = useApiService()
  
  const duplicadoError = ref(false)
  const loading = ref(false)
  const validando = ref(false)

  const validarNombreDuplicado = async (nombre, itemId = null) => {
    if (!nombre || nombre.length < 2) {
      duplicadoError.value = false
      return
    }

    validando.value = true
    try {
      const data = await validarNombre(nombre, itemId)
      duplicadoError.value = !data.valido
      
      if (!data.valido && data.mensaje) {
        console.warn('Nombre duplicado:', data.mensaje)
      }
    } catch (err) {
      console.error('Error validando nombre:', err)
      // En caso de error de red, no bloquear el formulario
      duplicadoError.value = false
    } finally {
      validando.value = false
    }
  }

  const validarNombreDebounced = debounce((nombre, itemId) => {
    validarNombreDuplicado(nombre, itemId)
  }, 500)

  const validarDuplicados = async (localItem) => {
    const nombre = localItem.nombre?.trim()
    const precio = parseFloat(localItem.precio)

    // Validaciones básicas
    if (!nombre || nombre.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres')
    }

    if (isNaN(precio) || precio <= 0) {
      throw new Error('El precio debe ser un número mayor a 0')
    }

    // Validación de stock para productos
    if (localItem.tipo === 'producto') {
      const stock = parseInt(localItem.stock)
      if (isNaN(stock) || stock < 0) {
        throw new Error('El stock debe ser un número mayor o igual a 0')
      }
    }

    // Validación en el backend
    try {
      return await validarItem(localItem)
    } catch (err) {
      throw new Error('Error de validación: ' + err.message)
    }
  }

  // Reglas de validación para usar en los componentes
  const rules = {
    // Reglas básicas
    required: v => !!v || 'Este campo es requerido',
    requiredSelect: v => v !== null && v !== undefined && v !== '' || 'Seleccione una opción',
    
    // Reglas numéricas
    precio: v => {
      const num = parseFloat(v)
      return (!isNaN(num) && num >= 0.01) || 'Debe ser mayor que 0'
    },
    stock: v => {
      const num = parseInt(v)
      return (!isNaN(num) && num >= 0) || 'No puede ser negativo'
    },
    numeric: v => !isNaN(parseFloat(v)) || 'Debe ser un número válido',
    positiveNumber: v => {
      const num = parseFloat(v)
      return (!isNaN(num) && num > 0) || 'Debe ser un número positivo'
    },
    integer: v => {
      const num = parseInt(v)
      return (!isNaN(num) && Number.isInteger(num)) || 'Debe ser un número entero'
    },

    // Reglas de texto
    minLength: (min) => v => (v && v.length >= min) || `Mínimo ${min} caracteres`,
    maxLength: (max) => v => (v && v.length <= max) || `Máximo ${max} caracteres`,
    exactLength: (length) => v => (v && v.length === length) || `Debe tener exactamente ${length} caracteres`,

    // Reglas específicas del formulario
    tipo: v => !!v || 'Seleccione un tipo',
    categoria: v => !!v || 'Seleccione una categoría',
    
    // Reglas de formato
    email: v => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !v || pattern.test(v) || 'Email inválido'
    },
    
    phone: v => {
      const pattern = /^[\+]?[1-9][\d]{0,15}$/
      return !v || pattern.test(v) || 'Teléfono inválido'
    },

    url: v => {
      try {
        return !v || new URL(v) || 'URL inválida'
      } catch {
        return 'URL inválida'
      }
    },

    // Reglas de código de barras
    codigoBarras: v => {
      if (!v) return true // Opcional
      const cleaned = v.replace(/\s/g, '')
      return (cleaned.length >= 8 && cleaned.length <= 18) || 'Código de barras debe tener entre 8 y 18 dígitos'
    },

    // Reglas de rango
    range: (min, max) => v => {
      const num = parseFloat(v)
      return (!isNaN(num) && num >= min && num <= max) || `Debe estar entre ${min} y ${max}`
    },

    // Reglas de fecha
    dateNotFuture: v => {
      if (!v) return true
      const date = new Date(v)
      const now = new Date()
      return date <= now || 'La fecha no puede ser futura'
    },

    dateNotPast: v => {
      if (!v) return true
      const date = new Date(v)
      const now = new Date()
      return date >= now || 'La fecha no puede ser pasada'
    }
  }

  // Validadores complejos combinados
  const validadores = {
    // Validar precio según tipo de producto
    precioSegunTipo: (tipo) => (v) => {
      const precio = parseFloat(v)
      if (isNaN(precio) || precio <= 0) {
        return 'Precio inválido'
      }
      
      if (tipo === 'servicio' && precio < 1) {
        return 'Los servicios deben costar al menos $1'
      }
      
      if (tipo === 'producto' && precio < 0.01) {
        return 'Los productos deben costar al menos $0.01'
      }
      
      return true
    },

    // Validar stock solo para productos
    stockSoloProductos: (tipo) => (v) => {
      if (tipo !== 'producto') return true
      
      const stock = parseInt(v)
      if (isNaN(stock)) {
        return 'Stock requerido para productos'
      }
      
      if (stock < 0) {
        return 'Stock no puede ser negativo'
      }
      
      return true
    }
  }

  // Función para validar formulario completo
  const validarFormularioCompleto = async (formData, formRef) => {
    try {
      // Validar usando las reglas de Vuetify
      const { valid } = await formRef.validate()
      if (!valid) {
        throw new Error('Por favor complete todos los campos requeridos correctamente')
      }

      // Validaciones adicionales de negocio
      await validarDuplicados(formData)

      return true
    } catch (error) {
      throw error
    }
  }

  // Función para resetear validaciones
  const resetValidaciones = (formRef) => {
    duplicadoError.value = false
    validando.value = false
    if (formRef) {
      formRef.resetValidation()
    }
  }

  // Función para validar campos individuales
  const validarCampo = (valor, reglas) => {
    if (!Array.isArray(reglas)) {
      reglas = [reglas]
    }

    for (const regla of reglas) {
      const resultado = regla(valor)
      if (resultado !== true) {
        return resultado // Retorna el mensaje de error
      }
    }
    
    return true
  }

  return {
    // Estado
    duplicadoError,
    loading,
    validando,
    
    // Métodos principales
    validarNombreDebounced,
    validarDuplicados,
    validarFormularioCompleto,
    resetValidaciones,
    validarCampo,
    
    // Reglas y validadores
    rules,
    validadores
  }
}