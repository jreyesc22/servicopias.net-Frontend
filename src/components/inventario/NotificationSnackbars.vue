<template>
  <div>
    <!-- Snackbar de éxito -->
    <v-snackbar 
      v-model="snackbar.success" 
      :timeout="3000" 
      color="success"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ snackbar.successMsg }}
    </v-snackbar>

    <!-- Snackbar de error -->
    <v-snackbar 
      v-model="snackbar.error" 
      :timeout="5000" 
      color="error"
      location="top"
    >
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ snackbar.errorMsg }}
      <template v-slot:actions>
        <v-btn 
          color="white" 
          variant="text" 
          @click="snackbar.error = false"
          size="small"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Snackbar de información -->
    <v-snackbar 
      v-model="snackbar.info" 
      :timeout="3000" 
      color="info"
      location="top"
    >
      <v-icon class="mr-2">mdi-information</v-icon>
      {{ snackbar.infoMsg }}
    </v-snackbar>

    <!-- Snackbar de advertencia -->
    <v-snackbar 
      v-model="snackbar.warning" 
      :timeout="4000" 
      color="warning"
      location="top"
    >
      <v-icon class="mr-2">mdi-alert</v-icon>
      {{ snackbar.warningMsg }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'NotificationSnackbars',
  props: {
    snackbar: {
      type: Object,
      required: true,
      default: () => ({
        success: false,
        successMsg: '',
        error: false,
        errorMsg: '',
        info: false,
        infoMsg: '',
        warning: false,
        warningMsg: ''
      })
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para snackbars si es necesario */
:deep(.v-snackbar__wrapper) {
  margin-top: 20px;
}

:deep(.v-snackbar__content) {
  align-items: center;
}
</style>