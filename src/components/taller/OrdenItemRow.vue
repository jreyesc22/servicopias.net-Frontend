<template>
  <v-card class="mb-3" outlined>
    <v-card-text>
      <v-row align="center">
        <!-- Información del producto -->
        <v-col cols="12" md="6">
          <div class="text-subtitle1 font-weight-bold">
            {{ item.item?.nombre || 'Producto sin nombre' }}
          </div>
          <div class="text-caption text-grey-darken-1">
            ID: {{ item.item?.id || '-' }}
          </div>
        </v-col>
        
        <!-- Cantidad -->
        <v-col cols="6" md="3">
          <div class="text-subtitle2 text-grey-darken-1">Cantidad:</div>
          <div class="text-body-1">{{ item.cantidad }}</div>
        </v-col>
        
        <!-- Estado PDF y acciones -->
        <v-col cols="6" md="3" class="text-center">
          <!-- Tiene PDF -->
          <div v-if="tienePDF" class="d-flex flex-column align-center">
            <v-icon 
              :color="estaImpreso ? 'green' : 'red'" 
              size="large" 
              class="mb-1"
            >
              {{ estaImpreso ? 'mdi-file-pdf-box-outline' : 'mdi-file-pdf-box' }}
            </v-icon>
            
            <!-- Botón descargar -->
            <v-btn 
              size="small" 
              :color="estaImpreso ? 'green' : 'red'"
              :variant="estaImpreso ? 'flat' : 'outlined'"
              @click="$emit('descargar')"
              :loading="descargando"
            >
              <v-icon start>
                {{ estaImpreso ? 'mdi-check' : 'mdi-download' }}
              </v-icon>
              {{ estaImpreso ? 'Impreso' : 'PDF' }}
            </v-btn>
            
            <!-- Botón toggle estado -->
            <v-btn
              size="x-small"
              :color="estaImpreso ? 'orange' : 'success'"
              variant="text"
              @click="$emit('toggle-impreso')"
              class="mt-1"
            >
              <v-icon size="16">
                {{ estaImpreso ? 'mdi-undo' : 'mdi-check-circle' }}
              </v-icon>
            </v-btn>
          </div>
          
          <!-- Sin PDF -->
          <div v-else class="d-flex flex-column align-center">
            <v-icon color="grey" size="large" class="mb-1">mdi-file-question</v-icon>
            <v-chip size="small" color="grey" variant="outlined">
              Sin PDF
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Información adicional (descripción, observaciones) -->
      <v-row v-if="item.descripcion || item.observaciones" class="mt-2">
        <v-col cols="12">
          <v-divider class="mb-2"></v-divider>
          <div v-if="item.descripcion" class="mb-1">
            <span class="text-subtitle2 text-grey-darken-1">Descripción:</span>
            {{ item.descripcion }}
          </div>
          <div v-if="item.observaciones">
            <span class="text-subtitle2 text-grey-darken-1">Observaciones:</span>
            {{ item.observaciones }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'OrdenItemRow',
  props: {
    item: {
      type: Object,
      required: true
    },
    tienePDF: {
      type: Boolean,
      default: false
    },
    estaImpreso: {
      type: Boolean,
      default: false
    },
    descargando: {
      type: Boolean,
      default: false
    }
  },
  emits: ['descargar', 'toggle-impreso']
}
</script>

<style scoped>
.text-subtitle2 {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
