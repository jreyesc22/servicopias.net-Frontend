<template>
  <v-dialog v-model="modelOpen" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ title }}</span>
        <v-spacer />
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="query"
              label="Buscar producto por nombre o código"
              clearable
              @keyup.enter="buscar"
              append-inner-icon="mdi-magnify"
              @click:append-inner="buscar"
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn color="primary" @click="buscar">Buscar</v-btn>
            <v-btn text class="ml-2" @click="limpiar">Limpiar</v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-2" />

        <div v-if="loading" class="text-center pa-4">
          <v-progress-circular indeterminate />
        </div>

        <div v-else>
          <PosItemList :items="items" @agregar="onAgregar" />
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import POSService from '@/services/pos.service'
import PosItemList from './PosItemList.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Buscar producto' }
})

const emits = defineEmits(['update:modelValue', 'agregar'])

const modelOpen = ref(props.modelValue)
const query = ref('')
const items = ref([])
const loading = ref(false)

watch(() => props.modelValue, (v) => { modelOpen.value = v })
watch(modelOpen, (v) => emits('update:modelValue', v))

const buscar = async () => {
  loading.value = true
  try {
    const resultados = await POSService.buscarProductos(query.value || '')
    // Asegurar formato de array
    items.value = Array.isArray(resultados) ? resultados : (resultados.productos || resultados || [])
  } catch (err) {
    console.error('Error en buscar productos:', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

const limpiar = () => {
  query.value = ''
  items.value = []
}

const close = () => {
  modelOpen.value = false
}

const onAgregar = (item) => {
  emits('agregar', item)
}
</script>

<style scoped>
.v-card-title {
  align-items: center;
}
</style>
