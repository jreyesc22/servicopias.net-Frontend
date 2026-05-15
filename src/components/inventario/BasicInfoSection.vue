<template>
  <div class="form-section">
    <h3 class="section-title">
      <v-icon class="mr-2" color="primary">mdi-information</v-icon>
      Información Básica
    </h3>
    
    <v-row>
      <!-- Tipo y Nombre -->
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="localItem.tipo"
          :items="tipoItems"
          item-title="title"
          item-value="value"
          label="Tipo"
          :rules="[rules.tipo]"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          required
        />
      </v-col>

      <v-col cols="12" sm="6" md="8">
        <v-text-field
          v-model="localItem.nombre"
          label="Nombre del producto/servicio"
          :rules="[rules.required]"
          :disabled="loading"
          :error="duplicadoError"
          :error-messages="duplicadoError ? 'Este nombre ya existe' : ''"
          @input="$emit('validate-name', localItem.nombre)"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-tag"
          required
        />
      </v-col>

      <!-- Precio y Stock -->
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model.number="localItem.precio"
          label="Precio"
          type="number"
          step="0.01"
          :rules="[rules.required, rules.precio]"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-currency-usd"
          required
        />
      </v-col>

      <v-col 
        v-if="localItem.tipo === 'producto' || localItem.tipo === 'insumo'" 
        cols="12" sm="6" md="4"
      >
        <v-text-field
          v-model.number="localItem.stock"
          label="Stock disponible"
          type="number"
          :rules="[rules.required, rules.stock]"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-package"
          required
        />
      </v-col>

      <!-- Categoría -->
      <v-col cols="12" sm="6" :md="['producto', 'insumo'].includes(localItem.tipo) ? 4 : 8">
        <v-select
          v-model="localItem.categoriaId"
          :items="categorias"
          item-title="nombre"
          item-value="id"
          label="Categoría"
          :rules="[rules.categoria]"
          :loading="loadingCategorias"
          :disabled="loading"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-folder"
          required
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'BasicInfoSection',
  props: {
    localItem: { type: Object, required: true },
    categorias: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    loadingCategorias: { type: Boolean, default: false },
    duplicadoError: { type: Boolean, default: false },
    rules: { type: Object, required: true }
  },
  emits: ['validate-name'],
  data() {
    return {
      tipoItems: [
        { title: 'Producto', value: 'producto' },
        { title: 'Servicio', value: 'servicio' },
        { title: 'Insumo', value: 'insumo' }
      ]
    }
  }
}
</script>