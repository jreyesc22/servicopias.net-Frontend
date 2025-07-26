<template>
  <v-container fluid class="d-flex justify-center">
    <v-card class="pa-4 mb-4" max-width="700" elevation="2">
      <v-form ref="form" v-model="formValido" @submit.prevent="guardar">
          <v-select
          v-model="localItem.tipo"
          :items="['producto', 'servicio']"
          label="Tipo"
          :rules="[v => !!v || 'Seleccione un tipo']"
          required
        />
       
        <v-text-field
          v-model="localItem.nombre"
          label="Nombre"
          :rules="[v => !!v || 'Este campo es requerido']"
          required
        />

     
        <v-text-field
          v-model.number="localItem.precio"
          label="Precio"
          type="number"
          step="0.01"
          :rules="[
            v => !!v || 'El precio es obligatorio',
            v => v >= 0.01 || 'Debe ser mayor que 0'
          ]"
          required
        />

        <v-text-field
          v-if="localItem.tipo === 'producto'"
          v-model.number="localItem.stock"
          label="Stock"
          type="number"
          :rules="[
            v => v !== null && v !== '' || 'El stock es obligatorio',
            v => v >= 0 || 'No puede ser negativo'
          ]"
          required
        />

        <v-select
          v-model="localItem.categoriaId"
          :items="categorias"
          item-title="nombre"
          item-value="id"
          label="Categoría"
          :rules="[v => !!v || 'Seleccione una categoría']"
          required
        />

        <v-text-field
          v-model="localItem.codigo_barras"
          label="Código de Barras"
        />

        <v-textarea
          v-model="localItem.descripcion"
          label="Descripción"
          rows="3"
        />

        <v-file-input
          label="Imagen (JPG/PNG)"
          accept="image/*"
          @change="handleFile($event, 'imagen')"
          prepend-icon="mdi-image"
        />

        <v-file-input
          label="PDF"
          accept="application/pdf"
          @change="handleFile($event, 'pdf')"
          prepend-icon="mdi-file-pdf"
        />

        <v-row class="mt-4" justify="end" no-gutters>
          <v-col cols="auto">
            <v-btn type="submit" color="primary" prepend-icon="mdi-content-save">
              Guardar
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="grey" variant="flat" @click="$emit('cerrar')" prepend-icon="mdi-close">
              Cancelar
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <v-snackbar v-model="snackbar.success" :timeout="3000" color="success">
        Producto guardado correctamente.
      </v-snackbar>

      <v-snackbar v-model="snackbar.error" :timeout="4000" color="error">
        {{ snackbar.errorMsg }}
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'FormProductoServicio',
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  emits: ['guardar', 'cerrar'],
  data() {
    return {
      formValido: false,
      loading: false,
      snackbar: {
        success: false,
        error: false,
        errorMsg: ''
      },
      localItem: {
        nombre: '',
        tipo: 'producto',
        precio: 0,
        stock: 0,
        codigo_barras: '',
        descripcion: '',
        imagen_url: '',
        pdf_url: '',
        categoriaId: ''
      },
      archivos: {
        imagen: null,
        pdf: null
      },
      categorias: []
    }
  },
  watch: {
    // ✅ SOLUCIÓN: Reactividad a cambios del prop
    item: {
      handler(newItem) {
        if (newItem) {
          this.localItem = { ...newItem }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.cargarCategorias()
  },
  methods: {
    // ✅ SOLUCIÓN: Manejo correcto de archivos
    handleFile(files, tipo) {
      if (files && files.length > 0) {
        this.archivos[tipo] = files[0]
      } else {
        this.archivos[tipo] = null
      }
    },

    resetForm() {
      this.localItem = {
        nombre: '',
        tipo: 'producto',
        precio: 0,
        stock: 0,
        codigo_barras: '',
        descripcion: '',
        imagen_url: '',
        pdf_url: '',
        categoriaId: ''
      }
      this.archivos = { imagen: null, pdf: null }
    },

    // ✅ SOLUCIÓN: Validación de respuesta
    async cargarCategorias() {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/categorias/list`)
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        
        if (Array.isArray(data)) {
          this.categorias = data
        } else {
          throw new Error('Formato de respuesta inválido')
        }
      } catch (err) {
        console.error('Error cargando categorías:', err)
        this.snackbar.errorMsg = 'Error al cargar categorías'
        this.snackbar.error = true
        this.categorias = []
      }
    },

    // ✅ SOLUCIÓN: Subida de archivos condicional
    async subirArchivos() {
      if (!this.archivos.imagen && !this.archivos.pdf) {
        return // No hay archivos que subir
      }

      try {
        const formData = new FormData()
        if (this.archivos.imagen) {
          formData.append('imagen', this.archivos.imagen)
        }
        if (this.archivos.pdf) {
          formData.append('pdf', this.archivos.pdf)
        }

        const res = await fetch(`${process.env.VUE_APP_API_URL}/items/upload`, {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          throw new Error(`Error uploading files: ${res.status}`)
        }

        const data = await res.json()
        
        if (data.imagen_url) this.localItem.imagen_url = data.imagen_url
        if (data.pdf_url) this.localItem.pdf_url = data.pdf_url
        
      } catch (error) {
        console.error('Error subiendo archivos:', error)
        throw error
      }
    },

    // ✅ SOLUCIÓN: Validación robusta
    async validarDuplicados() {
      const nombre = this.localItem.nombre?.trim()
      const precio = parseFloat(this.localItem.precio)

      if (!nombre || isNaN(precio) || precio <= 0) {
        this.snackbar.errorMsg = 'Nombre o precio inválidos'
        this.snackbar.error = true
        return false
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/items/validar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            precio,
            id: this.localItem.id || null,
            codigo_barras: this.localItem.codigo_barras || null
          })
        })

        if (!response.ok) {
          throw new Error(`Validation error: ${response.status}`)
        }

        const data = await response.json()
        
        if (!data.valido) {
          this.snackbar.errorMsg = data.mensaje || 'Item duplicado'
          this.snackbar.error = true
          return false
        }
        
        return true
      } catch (err) {
        console.error('Error validando duplicados:', err)
        this.snackbar.errorMsg = 'Error de validación'
        this.snackbar.error = true
        return false
      }
    },

    // ✅ SOLUCIÓN: Método guardar mejorado
    async guardar() {
      this.loading = true
      
      try {
        // Validar formulario
        const { valid } = await this.$refs.form.validate()
        if (!valid) return

        // Validar duplicados
        const esUnico = await this.validarDuplicados()
        if (!esUnico) return

        // Subir archivos si existen
        await this.subirArchivos()

        // Guardar item
        const url = this.item
          ? `${process.env.VUE_APP_API_URL}/items/${this.item.id}`
          : `${process.env.VUE_APP_API_URL}/items/create`
        
        const response = await fetch(url, {
          method: this.item ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.localItem)
        })

        if (!response.ok) {
          throw new Error(`Save error: ${response.status}`)
        }

        this.snackbar.success = true
        this.$emit('guardar')
        setTimeout(() => this.$emit('cerrar'), 1500)
        
      } catch (error) {
        console.error('Error guardando:', error)
        this.snackbar.errorMsg = 'Error al guardar el item'
        this.snackbar.error = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  width: 100%;
}
</style>