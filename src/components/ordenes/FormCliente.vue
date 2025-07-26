<template>
  <v-form ref="clienteForm" v-model="formValido">
    <v-row dense>
      <!-- NOMBRE -->
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="cliente.cliente_nombre"
          label="Nombre del cliente"
          density="compact"
          variant="outlined"
          :rules="[validarNombre]"
          @blur="formatearNombre"
        />
      </v-col>

      <!-- NIT -->
      <v-col cols="12" sm="3">
        <v-text-field
          v-model="cliente.cliente_nit"
          label="NIT"
          density="compact"
          variant="outlined"
          :rules="[validarNit]"
          @blur="formatearNit"
        />
      </v-col>

      <!-- TELÉFONO -->
      <v-col cols="12" sm="3">
        <v-text-field
          v-model="cliente.cliente_telefono"
          label="Teléfono"
          density="compact"
          variant="outlined"
          :rules="[validarTelefono]"
          @blur="formatearTelefono"
        />
      </v-col>

     
    </v-row>

    <v-btn class="mt-3" color="primary" @click="siguientePaso">Siguiente</v-btn>
  </v-form>
</template>

<script>
export default {
  props: {
    cliente: Object,
    tiposPago: Array
  },
  data() {
    return {
      formValido: false
    }
  },
  methods: {
    siguientePaso() {
      if (this.$refs.clienteForm.validate()) {
        this.$emit('continuar');
      }
    },

    // Validación: solo letras, sin símbolos, mínimo 2 letras
    formatearNombre() {
  if (!this.cliente.cliente_nombre || this.cliente.cliente_nombre.trim() === '') {
    this.cliente.cliente_nombre = 'CONSUMIDOR FINAL';
  } else {
    this.cliente.cliente_nombre = this.cliente.cliente_nombre
      .toUpperCase()
      .replace(/[^A-ZÁÉÍÓÚÑ ]/g, '');
  }
},

    // Validación de NIT: 10 caracteres (9 números + K o todo CF)
    validarNit(valor) {
  if (!valor) return true; // será "CF"
  
  const v = valor.toUpperCase().trim()

  // CF literal
  if (v === 'CF') return true;

  // 8 a 10 dígitos numéricos
  if (/^\d{8,10}$/.test(v)) return true;

  // 8 o 9 dígitos + letra K
  if (/^\d{8,9}K$/.test(v)) return true;

  return 'NIT inválido (debe tener 8-10 dígitos o terminar en K o ser CF)';
},

    formatearNit() {
      if (!this.cliente.cliente_nit || this.cliente.cliente_nit.trim() === '') {
        this.cliente.cliente_nit = 'CF';
      } else {
        this.cliente.cliente_nit = this.cliente.cliente_nit.toUpperCase();
      }
    },

    // Teléfono: 8 dígitos o "N/A"
    validarTelefono(valor) {
      if (!valor || valor.toUpperCase() === 'N/A') return true;
      const regex = /^\d{8}$/;
      return regex.test(valor) ? true : 'Teléfono inválido (8 dígitos o N/A)';
    },
    formatearTelefono() {
      const val = this.cliente.cliente_telefono?.trim();
      if (!val || val === '') {
        this.cliente.cliente_telefono = 'N/A';
      } else if (!/^\d{8}$/.test(val)) {
        this.cliente.cliente_telefono = 'N/A';
      }
    }
  }
}
</script>
