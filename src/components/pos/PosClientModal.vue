<template>
  <v-dialog v-model="open" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h6">Cliente de la venta</span>
        <v-spacer />
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-text-field v-model="form.nombre" label="Nombre" :rules="[rules.required]" />
          <v-text-field v-model="form.telefono" label="Teléfono" />
          <v-text-field v-model="form.nit" label="NIT / Identificación" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="guardar">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initial: { type: Object, default: () => ({ nombre: 'CF', telefono: '', nit: 'CF' }) }
})

const emits = defineEmits(['update:modelValue', 'save'])

const open = ref(props.modelValue)
const formRef = ref(null)
const form = ref({ ...props.initial })

watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => emits('update:modelValue', v))
watch(() => props.initial, (v) => { form.value = { ...v } }, { immediate: true })

const rules = {
  required: v => (v && v.toString().trim().length > 0) || 'Requerido'
}

const close = () => { open.value = false }

const guardar = () => {
  // Validación simple
  const valid = !(!form.value.nombre || String(form.value.nombre).trim() === '')
  if (!valid) {
    // Forzar enfoque o mostrar error simple
    return
  }

  emits('save', { ...form.value })
  open.value = false
}
</script>

<style scoped>
</style>
