<template>
  <div>
    <!-- Botón activador -->
    <v-btn
      color="error"
      @click="abrirDialog"
      prepend-icon="mdi-cash-minus"
      :disabled="loading"
      size="large"
      elevation="2"
    >
      Registrar Egreso
    </v-btn>

    <!-- Dialog -->
    <v-dialog v-model="dialogVisible" max-width="700" persistent>
      <v-card>
        <!-- Header -->
        <v-card-title class="bg-error text-white pa-4">
          <div class="d-flex align-center">
            <v-icon color="white" size="28" class="me-3">mdi-cash-remove</v-icon>
            <div>
              <h3>Registrar Nuevo Egreso</h3>
              <p class="text-body-2 opacity-90 mb-0">Complete la información del movimiento de salida</p>
            </div>
          </div>
        </v-card-title>

        <v-form ref="formEgreso" v-model="formularioValido" @submit.prevent="guardarEgreso">
          <v-card-text class="pa-4">
            <v-row>
              <!-- Monto del egreso -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="egreso.monto"
                  label="Monto del Egreso *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  prefix="Q"
                  variant="outlined"
                  density="comfortable"
                  :rules="reglasRequeridas"
                  required
                  @input="calcularCambio"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="error" size="20">mdi-currency-usd</v-icon>
                  </template>
                </v-text-field>
              </v-col>

              <!-- Tipo de pago -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="egreso.id_tipo_pago"
                  :items="tiposPagoItems"
                  label="Tipo de Pago *"
                  variant="outlined"
                  density="comfortable"
                  :rules="reglasRequeridas"
                  required
                  @update:model-value="onTipoPagoChange"
                >
                  <template v-slot:prepend-inner>
                    <v-icon :color="getColorTipoPago(egreso.id_tipo_pago)" size="20">
                      {{ getIconoTipoPago(egreso.id_tipo_pago) }}
                    </v-icon>
                  </template>
                </v-select>
              </v-col>

              <!-- Descripción del egreso -->
              <v-col cols="12">
                <v-textarea
                  v-model="egreso.descripcion"
                  label="Descripción del Egreso *"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  counter="255"
                  :rules="reglasRequeridas"
                  required
                  placeholder="Ej: Compra de materiales, pago a proveedor, gastos operativos..."
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="grey" size="20">mdi-text</v-icon>
                  </template>
                </v-textarea>
              </v-col>

              <!-- Empleado responsable -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="egreso.id_empleado"
                  :items="empleadosItems"
                  label="Empleado Responsable *"
                  variant="outlined"
                  density="comfortable"
                  :rules="reglasRequeridas"
                  required
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="primary" size="20">mdi-account</v-icon>
                  </template>
                </v-select>
              </v-col>

              <!-- Número de recibo (solo para tarjeta/transferencia) -->
              <v-col cols="12" md="6" v-if="requiereRecibo">
                <v-text-field
                  v-model="egreso.numero_recibo"
                  label="Número de Recibo/Referencia *"
                  variant="outlined"
                  density="comfortable"
                  :rules="requiereRecibo ? reglasRequeridas : []"
                  :required="requiereRecibo"
                  placeholder="Ej: 123456789, REF-001"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="info" size="20">mdi-receipt</v-icon>
                  </template>
                </v-text-field>
              </v-col>

              <!-- Campos para efectivo -->
              <template v-if="esEfectivo">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="egreso.monto_recibido"
                    label="Monto Entregado en Efectivo"
                    type="number"
                    step="0.01"
                    min="0"
                    prefix="Q"
                    variant="outlined"
                    density="comfortable"
                    @input="calcularCambio"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon color="success" size="20">mdi-hand-coin</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6" v-if="mostrarCambio">
                  <v-text-field
                    :model-value="formatearMoneda(cambioCalculado)"
                    label="Cambio a Devolver"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    color="warning"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon color="warning" size="20">mdi-cash-refund</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
              </template>
            </v-row>

            <!-- Resumen del egreso -->
            <v-card class="mt-4" variant="outlined">
              <v-card-title class="bg-grey-lighten-4 pa-3">
                <v-icon class="me-2" size="20">mdi-information-outline</v-icon>
                Resumen del Egreso
              </v-card-title>
              <v-card-text class="pa-3">
                <v-row dense>
                  <v-col cols="6" sm="3">
                    <div class="text-body-2 text-grey">Monto Total</div>
                    <div class="text-h6 text-error">{{ formatearMoneda(egreso.monto || 0) }}</div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-body-2 text-grey">Método de Pago</div>
                    <div class="text-body-1">{{ getNombreTipoPago(egreso.id_tipo_pago) }}</div>
                  </v-col>
                  <v-col cols="6" sm="3" v-if="cambioCalculado > 0">
                    <div class="text-body-2 text-grey">Cambio a Devolver</div>
                    <div class="text-h6 text-warning">{{ formatearMoneda(cambioCalculado) }}</div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-body-2 text-grey">Empleado</div>
                    <div class="text-body-1">{{ getNombreEmpleado(egreso.id_empleado) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>

          <!-- Acciones -->
          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              variant="outlined"
              @click="cancelar"
              :disabled="guardando"
              size="large"
            >
              <v-icon start>mdi-close</v-icon>
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="elevated"
              type="submit"
              :loading="guardando"
              :disabled="!formularioValido"
              size="large"
              class="ml-2"
            >
              <v-icon start>mdi-content-save</v-icon>
              Registrar Egreso
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color"
      location="top right"
      timeout="4000"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2" size="20">
          {{ getSnackbarIcon(snackbar.color) }}
        </v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
import { useCajaAPI } from '../composables/useCajaAPI.js'
import { useTiposPago } from '@/components/composables/useTiposPago'
import { useEmpleados } from '@/components/composables/useEmpleados'
import { clasificarTipoPago } from '@/utils/tipoPagoClassification'

import AuthService from '@/services/auth.service'

export default {
  name: 'RegistrarEgreso',
  emits: ['egreso-creado', 'actualizar-movimientos'],
  data() {
    return {
      dialogVisible: false,
      formularioValido: false,
      guardando: false,
      
      // Datos de los composables (se llenan desde setup)
      // tiposPago: [], // Removed
      // empleados: [], // Removed
      
      egreso: {
        monto: null,
        tipo_movimiento: 'egreso',
        descripcion: '',
        numero_recibo: '',
        monto_recibido: null,
        cambio: null,
        id_empleado: null,
        id_orden: null,
        id_tipo_pago: null
      },
      reglasRequeridas: [
        v => !!v || 'Este campo es requerido',
        v => (v && v.toString().length > 0) || 'Este campo es requerido'
      ],
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    }
  },
  setup() {
    // Inicializar composables
    const cajaAPI = useCajaAPI()
    const { tiposPago, fetchTiposPago } = useTiposPago()
    const { empleados, fetchEmpleados } = useEmpleados()
    
    return {
      cajaAPI,
      tiposPagoData: tiposPago,
      fetchTiposPago,
      empleadosData: empleados,
      fetchEmpleados
    }
  },
  async created() {
    // Cargar datos iniciales
    await this.cargarDatosIniciales()
  },
  computed: {
    tiposPagoItems() {
      return (this.tiposPagoData || []).map(tipo => ({
        title: tipo.nombre,
        value: tipo.id,
        props: {
          subtitle: this.getDescripcionTipo(tipo)
        }
      }))
    },
    empleadosItems() {
      return (this.empleadosData || []).map(emp => ({
        title: emp.nombre,
        value: emp.id,
        props: {
          subtitle: emp.cargo || emp.puesto || 'Empleado'
        }
      }))
    },
    tipoSeleccionado() {
      const tipoId = Number(this.egreso.id_tipo_pago)
      return (this.tiposPagoData || []).find(tipo => Number(tipo.id) === tipoId)
    },
    clasificacionTipoPago() {
      return clasificarTipoPago(this.tipoSeleccionado || { id: this.egreso.id_tipo_pago, nombre: '' })
    },
    esEfectivo() {
      return this.clasificacionTipoPago.grupo === 'efectivo'
    },
    requiereRecibo() {
      return this.clasificacionTipoPago.grupo !== 'efectivo'
    },
    cambioCalculado() {
      if (!this.esEfectivo || !this.egreso.monto_recibido || !this.egreso.monto) {
        return 0
      }
      const cambio = parseFloat(this.egreso.monto_recibido) - parseFloat(this.egreso.monto)
      return cambio > 0 ? cambio : 0
    },
    mostrarCambio() {
      return this.esEfectivo && this.egreso.monto_recibido && parseFloat(this.egreso.monto_recibido) > parseFloat(this.egreso.monto || 0)
    },
    // Exponer el estado de loading del composable
    loading() {
      return this.cajaAPI.loading.value
    }
  },
  watch: {
    dialogVisible(newVal) {
      if (newVal) {
        this.inicializarFormulario()
      }
    },
    cambioCalculado(newVal) {
      this.egreso.cambio = newVal > 0 ? newVal : null
    }
  },
  methods: {
    async cargarDatosIniciales() {
      try {
        console.log('Cargando datos iniciales...')
        
        // Cargar tipos de pago
        await this.fetchTiposPago()
        
        // Cargar empleados
        await this.fetchEmpleados()
        
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        this.mostrarError('Error al cargar los datos necesarios')
      }
    },

    
    abrirDialog() {
      this.dialogVisible = true
    },
    
    inicializarFormulario() {
      const usuarioActual = AuthService.getCurrentUser() || {}
      
      this.egreso = {
        monto: null,
        tipo_movimiento: 'egreso',
        descripcion: '',
        numero_recibo: '',
        monto_recibido: null,
        cambio: null,
        id_empleado: usuarioActual.id || (this.empleadosData && this.empleadosData.length > 0 ? this.empleadosData[0].id : null),
        id_orden: null,
        id_tipo_pago: null
      }
      
      if (this.$refs.formEgreso) {
        this.$refs.formEgreso.resetValidation()
      }
    },
    
    onTipoPagoChange() {
      this.egreso.numero_recibo = ''
      this.egreso.monto_recibido = null
      this.egreso.cambio = null
    },
    
    calcularCambio() {
      this.$nextTick(() => {
        this.egreso.cambio = this.cambioCalculado > 0 ? this.cambioCalculado : null
      })
    },
    
    async guardarEgreso() {
      if (!this.formularioValido) {
        this.mostrarError('Por favor complete todos los campos requeridos')
        return
      }

      this.guardando = true
      try {
        const datosEgreso = {
          ...this.egreso,
          monto: parseFloat(this.egreso.monto),
          monto_recibido: this.egreso.monto_recibido ? parseFloat(this.egreso.monto_recibido) : null,
          cambio: this.egreso.cambio ? parseFloat(this.egreso.cambio) : null
        }

        // Validaciones antes de enviar
        if (this.requiereRecibo && !datosEgreso.numero_recibo) {
          this.mostrarError('El número de recibo es requerido para este tipo de pago')
          return
        }

        if (this.esEfectivo && datosEgreso.monto_recibido && datosEgreso.monto_recibido < datosEgreso.monto) {
          this.mostrarError('El monto recibido no puede ser menor al monto del egreso')
          return
        }

        console.log('Enviando datos del egreso:', datosEgreso)
        
        // Usar el composable en lugar de axios directo
        const response = await this.cajaAPI.crearMovimiento(datosEgreso)
        
        console.log('Respuesta del servidor:', response)
        
        if (response) {
          this.mostrarExito('Egreso registrado exitosamente')
          this.$emit('egreso-creado', response)
          this.$emit('actualizar-movimientos')
          this.cerrarDialog()
        }
      } catch (error) {
        console.error('Error al guardar egreso:', error)
        
        // Manejar diferentes tipos de error
        let mensaje = 'Error al registrar el egreso'
        
        if (error.message) {
          mensaje = error.message
        } else if (typeof error === 'string') {
          mensaje = error
        }
        
        this.mostrarError(mensaje)
      } finally {
        this.guardando = false
      }
    },
    
    cancelar() {
      this.cerrarDialog()
    },
    
    cerrarDialog() {
      this.dialogVisible = false
      this.inicializarFormulario()
    },
    
    getNombreTipoPago(id) {
      const tipoId = Number(id)
      const tipo = (this.tiposPagoData || []).find(t => Number(t.id) === tipoId)
      return tipo ? tipo.nombre : 'No seleccionado'
    },

    getClasificacionTipoPago(id) {
      const tipoId = Number(id)
      const tipo = (this.tiposPagoData || []).find(t => Number(t.id) === tipoId)
      return clasificarTipoPago(tipo || { id: tipoId, nombre: this.getNombreTipoPago(tipoId) })
    },
    
    getNombreEmpleado(id) {
      const empleado = (this.empleadosData || []).find(e => e.id === id)
      return empleado ? empleado.nombre : 'No seleccionado'
    },
    
    getColorTipoPago(id) {
      return this.getClasificacionTipoPago(id).color || 'slate-500'
    },
    
    getIconoTipoPago(id) {
      return this.getClasificacionTipoPago(id).icon || 'mdi-help-circle'
    },
    
    getDescripcionTipo(tipo) {
      const nombre = typeof tipo === 'string' ? tipo : (tipo?.nombre || '')
      const clasificacion = typeof tipo === 'object' ? (tipo?.clasificacion || clasificarTipoPago(tipo)) : clasificarTipoPago({ nombre })
      const descripciones = {
        'Efectivo': 'Pago en billetes y monedas',
        'Tarjeta de Crédito': 'Tarjeta de crédito',
        'Transferencia Bancaria': 'Transferencia bancaria electrónica'
      }
      return `${descripciones[nombre] || 'Método de pago'} · ${clasificacion.etiqueta}`
    },
    
    getSnackbarIcon(color) {
      const iconos = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information'
      }
      return iconos[color] || 'mdi-information'
    },
    
    formatearMoneda(monto) {
      return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ'
      }).format(monto)
    },
    
    mostrarExito(mensaje) {
      this.snackbar = { show: true, text: mensaje, color: 'success' }
    },
    
    mostrarError(mensaje) {
      this.snackbar = { show: true, text: mensaje, color: 'error' }
    }
  }
}
</script>

<style scoped>
/* Integración con design-system global */

/* Botón activador profesional */
.professional-btn {
  border-radius: var(--border-radius-lg);
  text-transform: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  transition: all var(--transition-smooth);
}

.professional-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover-error);
}

/* Dialog profesional */
.professional-dialog :deep(.v-overlay__content) {
  margin: var(--spacing-lg);
  max-width: 800px;
  width: calc(100vw - 48px);
}

.dialog-card {
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  background: var(--surface-elevated);
  backdrop-filter: blur(20px);
}

/* Header del dialog */
.dialog-header {
  background: var(--gradient-error);
  border-radius: 0;
}

.header-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

/* Grupos de inputs */
.input-group {
  margin-bottom: var(--spacing-sm);
}

.input-label {
  display: block;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-sm);
}

/* Inputs profesionales */
.professional-input :deep(.v-field),
.professional-select :deep(.v-field),
.professional-textarea :deep(.v-field) {
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);
  border-width: 2px;
}

.professional-input :deep(.v-field):hover,
.professional-select :deep(.v-field):hover,
.professional-textarea :deep(.v-field):hover {
  box-shadow: var(--shadow-medium);
}

.professional-input :deep(.v-field--focused),
.professional-select :deep(.v-field--focused),
.professional-textarea :deep(.v-field--focused) {
  box-shadow: var(--shadow-focus);
}

.change-input :deep(.v-field) {
  background: var(--gradient-warning-subtle);
}

/* Tarjeta de resumen */
.summary-card {
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  background: var(--surface-elevated);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.summary-header {
  background: var(--gradient-secondary);
  color: var(--color-white);
}

.summary-item {
  padding: var(--spacing-md) 0;
}

.summary-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-700);
}

/* Botones de acción */
.dialog-actions {
  border-top: 1px solid var(--border-color);
  background: var(--color-grey-50);
}

.action-btn-cancel {
  border-radius: var(--border-radius-lg);
  text-transform: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  margin-right: var(--spacing-md);
  transition: all var(--transition-base);
}

.action-btn-cancel:hover {
  transform: translateY(-2px);
  background: var(--hover-background);
}

.action-btn-save {
  background: var(--gradient-error);
  border-radius: var(--border-radius-lg);
  text-transform: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  transition: all var(--transition-smooth);
}

.action-btn-save:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover-error);
}

/* Snackbar profesional */
.professional-snackbar {
  border-radius: var(--border-radius-lg);
}

.professional-snackbar :deep(.v-snackbar__content) {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
}

/* Animaciones */
.dialog-card {
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Estados de inputs */
.professional-input :deep(.v-field--error),
.professional-select :deep(.v-field--error),
.professional-textarea :deep(.v-field--error) {
  border-color: var(--color-error);
  box-shadow: var(--shadow-error);
}

/* Responsive */
@media (max-width: 768px) {
  .professional-dialog :deep(.v-overlay__content) {
    margin: var(--spacing-md);
    width: calc(100vw - 24px);
  }
  
  .dialog-header {
    padding: var(--spacing-lg) !important;
  }
  
  .header-icon-wrapper {
    width: 50px;
    height: 50px;
  }
  
  .action-btn-cancel,
  .action-btn-save {
    width: 100%;
    margin-bottom: var(--spacing-md);
  }
}

/* Estados de carga */
.action-btn-save:disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Efectos de focus mejorados */
.professional-input :deep(.v-field__input),
.professional-select :deep(.v-field__input),
.professional-textarea :deep(.v-field__input) {
  padding: var(--spacing-md) var(--spacing-lg);
}

/* Iconos en inputs */
.professional-input :deep(.v-field__prepend-inner),
.professional-select :deep(.v-field__prepend-inner),
.professional-textarea :deep(.v-field__prepend-inner) {
  padding-top: var(--spacing-md);
}
</style>