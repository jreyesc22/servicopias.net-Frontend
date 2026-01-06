<template>
  <div class="form-section">
    <h3 class="section-title">
      <v-icon class="mr-2" color="primary">mdi-file-multiple</v-icon>
      Archivos Multimedia
    </h3>
    
    <v-row>
      <!-- Columna de carga -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="upload-section">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon class="mr-2">mdi-upload</v-icon>
            Cargar Archivos
          </v-card-title>
          
          <v-card-text>
            <v-file-input
              label="Imagen (JPG/PNG - Máx 5MB)"
              accept="image/*"
              @change="(event) => handleFileUpload(event, 'imagen')"
              @update:model-value="(files) => handleFileUpload(files, 'imagen')"
              prepend-icon="mdi-image"
              :disabled="loading"
              :error="erroresArchivos.imagen !== null"
              :error-messages="erroresArchivos.imagen"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-file-input
              label="PDF (Máx 10MB)"
              accept="application/pdf"
              @change="(event) => handleFileUpload(event, 'pdf')"
              @update:model-value="(files) => handleFileUpload(files, 'pdf')"
              prepend-icon="mdi-file-pdf"
              :disabled="loading"
              :error="erroresArchivos.pdf !== null"
              :error-messages="erroresArchivos.pdf"
              variant="outlined"
              density="comfortable"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Columna de previews -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="preview-section">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon class="mr-2">mdi-eye</v-icon>
            Vista Previa
          </v-card-title>
          
          <v-card-text>
            <!-- Preview de imagen -->
            <FilePreview
              v-if="previews.imagen || localItem.imagen_url"
              type="imagen"
              :preview="previews.imagen"
              :url="resolveMediaUrl(localItem.imagen_url)"
              :filename="archivos.imagen?.name"
              :loading="loading"
              @remove="$emit('remove-file', 'imagen')"
            />

            <!-- Preview de PDF -->
            <FilePreview
              v-if="previews.pdf || localItem.pdf_url"
              type="pdf"
              :preview="previews.pdf"
              :url="resolveMediaUrl(localItem.pdf_url)"
              :filename="archivos.pdf?.name"
              :loading="loading"
              @remove="$emit('remove-file', 'pdf')"
            />

            <!-- Estado vacío -->
            <EmptyState
              v-if="!hasAnyFile"
              icon="mdi-file-image"
              message="Los archivos seleccionados aparecerán aquí"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import FilePreview from './filePreview.vue'
import EmptyState from './EmptyState.vue'
import { resolveMediaUrl } from '@/utils/mediaUrl'

export default {
  name: 'FileUploadSection',
  components: {
    FilePreview,
    EmptyState
  },
  props: {
    localItem: { type: Object, required: true },
    archivos: { type: Object, required: true },
    previews: { type: Object, required: true },
    erroresArchivos: { type: Object, required: true },
    loading: { type: Boolean, default: false }
  },
  emits: ['file-upload', 'remove-file', 'show-message'],
  computed: {
    hasAnyFile() {
      return this.previews.imagen || this.localItem.imagen_url || 
             this.previews.pdf || this.localItem.pdf_url
    }
  },
  methods: {
    resolveMediaUrl,
    handleFileUpload(event, tipo) {
      const result = this.$emit('file-upload', event, tipo)
      if (result?.success) {
        this.$emit('show-message', { type: 'info', message: result.message })
      }
    }
  }
}
</script>