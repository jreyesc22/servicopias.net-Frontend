<template>
  <div class="form-section">
    <h3 class="section-title">
      <v-icon class="mr-2" color="primary">mdi-details</v-icon>
      Detalles Adicionales
    </h3>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localItem.codigo_barras"
          label="Código de Barras (Opcional)"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-barcode"
        />
      </v-col>

      <v-col cols="12" md="6">
        <div class="d-flex align-center justify-center h-100">
          <v-chip-group>
            <v-chip 
              v-if="localItem.codigo_barras" 
              color="success" 
              variant="tonal"
            >
              <v-icon start>mdi-check</v-icon>
              Código configurado
            </v-chip>
            <v-chip v-else color="grey" variant="tonal">
              <v-icon start>mdi-barcode-off</v-icon>
              Sin código de barras
            </v-chip>
          </v-chip-group>
        </div>
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="localItem.descripcion"
          label="Descripción"
          rows="3"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-text"
          auto-grow
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'DetailsSection',
  props: {
    localItem: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.form-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.section-title {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e3f2fd;
}

@media (max-width: 767px) {
  .form-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-size: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>