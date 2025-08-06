<template>
  <div class="mb-4">
    <v-card elevation="2" class="preview-card">
      <!-- Preview de imagen -->
      <template v-if="type === 'imagen'">
        <v-img
          :src="preview || url"
          height="150"
          cover
          class="preview-image"
        >
          <v-btn
            icon="mdi-close"
            size="small"
            color="error"
            class="remove-btn"
            @click="$emit('remove')"
            :disabled="loading"
          />
        </v-img>
        <v-card-subtitle class="text-caption">
          {{ filename || 'Imagen actual' }}
        </v-card-subtitle>
      </template>

      <!-- Preview de PDF -->
      <template v-else-if="type === 'pdf'">
        <v-card-text class="d-flex align-center pa-3">
          <v-icon color="red" size="large" class="mr-3">mdi-file-pdf</v-icon>
          <div class="flex-grow-1">
            <div class="text-subtitle-2">{{ filename || 'PDF actual' }}</div>
            <div class="text-caption text-grey">Documento PDF</div>
          </div>
          <v-btn
            icon="mdi-close"
            size="small"
            color="error"
            @click="$emit('remove')"
            :disabled="loading"
          />
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'FilePreview',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['imagen', 'pdf'].includes(value)
    },
    preview: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    filename: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['remove']
}
</script>

<style scoped>
.preview-card {
  border-radius: 8px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-card:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.preview-image {
  position: relative;
}

.remove-btn {
  position: absolute !important;
  top: 8px;
  right: 8px;
  z-index: 2;
}

@media (max-width: 767px) {
  .preview-card {
    margin-bottom: 0.5rem;
  }
}
</style>