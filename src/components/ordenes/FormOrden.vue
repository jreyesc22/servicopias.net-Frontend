<template>
  <v-container :class="['form-orden', { 'form-expandida': pasoActual === 2 }]" fluid>
    <v-card elevation="2" class="pa-4">
      <v-card-title class="text-h6">Proceso de Nueva Orden</v-card-title>

      <BarraEstado :pasoActual="pasoActual" />

      <!-- Paso 1: Cliente -->
      <FormCliente
        v-if="pasoActual === 1"
        :cliente="orden"
        @continuar="continuarPaso2"
      />

      <!-- Paso 2: Productos (layout horizontal mejorado) -->
      <div v-if="pasoActual === 2">
        <v-row no-gutters>
          <v-col cols="12" md="6" class="pa-2">
            <SelectorProductos @agregar="agregarItem" />
          </v-col>

          <v-col cols="12" md="6" class="pa-2">
            <v-card class="pa-4" elevation="1" height="100%">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">Productos agregados</h3>

              <v-data-table
                :headers="[
                  { text: 'Producto', value: 'nombre' },
                  { text: 'Cantidad', value: 'cantidad' },
                  { text: 'Precio Unitario', value: 'precio_unitario' },
                  { text: 'Subtotal', value: 'subtotal' },
                  { text: 'Acción', value: 'accion', sortable: false }
                ]"
                :items="orden.items"
                density="compact"
                class="tabla-resumen"
                hide-default-footer
              >
                <template #item.precio_unitario="{ item }">
                  Q {{ item.precio_unitario.toFixed(2) }}
                </template>
                <template #item.subtotal="{ item }">
                  Q {{ item.subtotal.toFixed(2) }}
                </template>
                <template #item.accion="{ index }">
                  <v-btn icon color="error" @click="quitarItem(index)" size="small">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4 align-center justify-space-between">
          <v-col cols="12" md="6" class="text-start text-subtitle-1 font-weight-medium">
            <strong>Total: Q {{ totalOrden.toFixed(2) }}</strong>
          </v-col>
          <v-col cols="12" md="6" class="acciones">
            <v-btn color="grey" @click="pasoActual = 1" variant="outlined">
              <v-icon start>mdi-arrow-left</v-icon>
              Regresar
            </v-btn>
            <v-btn 
              color="primary" 
              :disabled="orden.items.length === 0" 
              @click="continuarPaso3"
              :loading="loading"
            >
              <v-icon start>mdi-arrow-right</v-icon>
              Siguiente
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Paso 3: Resumen -->
      <div v-if="pasoActual === 3">
        <ResumenOrden
          :orden="orden"
          :loading="loading"
          @confirmar="guardarOrden"
          @cancelar="pasoActual = 2"
        />
      </div>

      <!-- Paso 4 - Confirmación con navegación a caja -->
      <div v-if="pasoActual === 4" class="text-center pa-6">
        <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
        <h2 class="text-h5 mb-2">¡Orden Registrada Exitosamente!</h2>
        <p class="text-body-1 mb-4">Orden #{{ ordenGuardada?.id }}</p>

        <!-- Resumen de la orden creada -->
        <v-card variant="text" class="mx-auto my-2 pa-2" max-width="320" style="border: 1px solid #eee; border-radius: 10px;">
          <div class="d-flex flex-column align-start" style="gap: 2px;">
            <div class="text-caption text-grey-darken-1">Cliente</div>
            <div class="text-body-2 font-weight-medium mb-1">{{ ordenGuardada?.cliente_nombre }}</div>
            <div class="d-flex justify-space-between w-100">
              <span class="text-caption text-grey-darken-1">Total</span>
              <span class="font-weight-bold">Q {{ ordenGuardada?.total?.toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between w-100 mt-1">
              <span class="text-caption text-grey-darken-1">Estado</span>
              <v-chip 
                :color="ordenGuardada?.estado === 'entregado' ? 'success' : 'warning'" 
                size="x-small" 
                class="ml-1" 
                style="height: 20px;"
              >
                {{ ordenGuardada?.estado === 'entregado' ? 'Entregado' : 'Pendiente' }}
              </v-chip>
            </div>
          </div>
        </v-card>

        <!-- BOTONES DEL PASO REGISTRO ORDEN CON EXITO -->
        <div class="d-flex gap-3 justify-center mt-6">
          <v-btn 
            color="grey" 
            variant="outlined" 
            size="large"
            class="px-8 py-4 text-body-1 font-weight-bold"
            style="min-width: 200px;"
            @click="iniciarNuevaOrden"
          >
            <v-icon start size="large">mdi-plus</v-icon>
            NUEVA ORDEN
          </v-btn>

          <v-btn 
            color="primary" 
            variant="flat"
            size="large"
            class="px-8 py-4 text-body-1 font-weight-bold"
            style="min-width: 200px;"
            @click="pasoActual = 5"
          >
            <v-icon start size="large">mdi-cash-register</v-icon>
            PROCESAR PAGO
          </v-btn>
        </div>
      </div>


      <!-- Paso 5 - Caja de Pago -->
      <div v-if="pasoActual === 5">
        <!-- Validación: Solo mostrar si hay orden guardada -->
        <div v-if="!ordenGuardada" class="text-center pa-6">
          <v-alert type="warning" variant="tonal">
            No hay una orden válida para procesar el pago.
          </v-alert>
          <v-btn color="primary" @click="pasoActual = 1" class="mt-4">
            Crear Nueva Orden
          </v-btn>
        </div>

        <!-- Componente CajaPago con eventos-->
        <CajaPago
          v-else
          :orden="ordenParaCaja"
          :usuario="usuarioActual"
          @cobro-realizado="manejarCobroRealizado"
          @pago-completado="manejarPagoCompletado"
          @cancelar="pasoActual = 4"
          @regresar-paso="cambiarPaso"
        />

        <!-- Información de estado de pago -->
        <v-card 
          v-if="ordenGuardada && ordenGuardada.estado_pago !== 'pendiente'" 
          variant="tonal" 
          color="info" 
          class="mt-4 pa-4"
        >
          <v-card-title class="text-subtitle-1">
            <v-icon start>mdi-information</v-icon>
            Estado de Pago Actual
          </v-card-title>
          <div class="d-flex justify-space-between align-center">
            <span>Abonado:</span>
            <span class="font-weight-bold">Q {{ (ordenGuardada.abonado || 0).toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-space-between align-center">
            <span>Saldo Pendiente:</span>
            <span class="font-weight-bold">Q {{ (ordenGuardada.saldo_pendiente || 0).toFixed(2) }}</span>
          </div>
        </v-card>

        <!-- Opciones adicionales -->
        <div class="d-flex gap-3 justify-center mt-4">
          <v-btn 
            color="grey" 
            variant="outlined" 
            @click="pasoActual = 4"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Volver
          </v-btn>
          
          <!-- Opción para ir directo a ticket si está pagado -->
          <v-btn 
            v-if="ordenGuardada?.estado_pago === 'pagado'" 
            color="success" 
            @click="pasoActual = 6"
          >
            <v-icon start>mdi-printer</v-icon>
            Imprimir Ticket
          </v-btn>
        </div>
      </div>

      <!-- Paso 6 - Ticket (separado de caja) -->
      <div v-if="pasoActual === 6" class="text-center pa-6">
        <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
        <h2 class="text-h5 mb-4">¡Pago Completado!</h2>

        <!-- Información del pago - Centrado y mejor organizado -->
        <div class="d-flex justify-center mb-6">
          <v-card 
            v-if="pago" 
            variant="outlined" 
            class="pa-4 pago-resumen-card" 
            max-width="500"
          >
            <v-card-title class="text-subtitle-1 text-center pb-2">
              <v-icon start>mdi-receipt</v-icon>
              Detalles del Pago
            </v-card-title>
            
            <div class="pago-detalles">
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-2">Método:</span>
                <v-chip 
                  :color="pago.metodo === 'Efectivo' ? 'success' : 'primary'" 
                  size="small" 
                  variant="flat"
                >
                  {{ pago.metodo }}
                </v-chip>
              </div>
              
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-2">Monto:</span>
                <span class="text-h6 font-weight-bold text-primary">Q {{ pago.monto?.toFixed(2) }}</span>
              </div>
              
              <div v-if="pago.vuelto > 0" class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-2">Vuelto:</span>
                <span class="text-body-1 font-weight-medium text-success">Q {{ pago.vuelto?.toFixed(2) }}</span>
              </div>
              
              <div v-if="pago.numero_recibo" class="d-flex justify-space-between align-center">
                <span class="text-body-2">No. Recibo:</span>
                <span class="text-body-2 font-weight-medium">{{ pago.numero_recibo }}</span>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Ticket Printer (invisible) -->
        <TicketPrinter
          v-if="ordenGuardada && pago"
          ref="ticketPrinter"
          :orden="ordenGuardada"
          :pago="pago"
          @impresion-exitosa="manejarImpresionExitosa"
          @impresion-error="manejarImpresionError"
        />

        <!-- WhatsApp Sender (invisible) -->
        <WhatsAppSender
          v-if="ordenGuardada && pago && ordenGuardada.cliente_telefono && ordenGuardada.cliente_telefono !== 'N/A'"
          ref="whatsappSender"
          :orden="ordenGuardada"
          :pago="pago"
          button-text="Reenviar WhatsApp"
          @whatsapp-enviado="manejarWhatsAppEnviado"
          @whatsapp-error="manejarWhatsAppError"
        />

        <!-- Acciones finales - Solo iconos con tooltips -->
        <div class="d-flex justify-center gap-4 mt-6">
          <!-- Reimprimir Ticket -->
          <v-tooltip text="Reimprimir Ticket" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                fab
                size="large"
                @click="intentarReimprimir"
                :loading="estadoImpresion.imprimiendo"
                :disabled="!$refs.ticketPrinter"
              >
                <v-icon size="24">mdi-printer</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <!-- Enviar WhatsApp -->
          <v-tooltip 
            :text="$refs.whatsappSender ? 'Reenviar WhatsApp' : 'WhatsApp no disponible'" 
            location="top"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="success"
                fab
                size="large"
                @click="reenviarWhatsApp"
                :loading="estadoWhatsApp.enviando"
                :disabled="!$refs.whatsappSender"
              >
                <v-icon size="24">mdi-whatsapp</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <!-- Nueva Orden -->
          <v-tooltip text="Nueva Orden" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="info"
                fab
                size="large"
                @click="iniciarNuevaOrden"
              >
                <v-icon size="24">mdi-plus</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>

        <!-- Alertas -->
        <v-alert
          v-if="estadoImpresion.mostrarAlerta"
          :type="estadoImpresion.tipoAlerta"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="estadoImpresion.mostrarAlerta = false"
        >
          <v-alert-title>
            <v-icon start>{{ estadoImpresion.iconoAlerta }}</v-icon>
            {{ estadoImpresion.tituloAlerta }}
          </v-alert-title>
          <div>{{ estadoImpresion.mensajeAlerta }}</div>
        </v-alert>

        <v-alert
          v-if="estadoWhatsApp.mostrarAlerta"
          :type="estadoWhatsApp.tipoAlerta"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="estadoWhatsApp.mostrarAlerta = false"
        >
          <v-alert-title>
            <v-icon start>{{ estadoWhatsApp.iconoAlerta }}</v-icon>
            {{ estadoWhatsApp.tituloAlerta }}
          </v-alert-title>
          <div>{{ estadoWhatsApp.mensajeAlerta }}</div>
        </v-alert>
      </div>

    </v-card>

    <!-- Sistema de notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="top"
      elevation="6"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'"
          class="me-2"
        />
        {{ snackbar.text }}
      </div>
      <template #actions>
        <v-btn 
          variant="text" 
          icon="mdi-close"
          size="small"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>

    <!-- Loading overlay global -->
    <v-overlay 
      v-model="loading" 
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
      <div class="text-center mt-4">
        <div class="text-h6">Procesando...</div>
        <div class="text-body-2">Por favor espere</div>
      </div>
    </v-overlay>
  </v-container>
</template>

<script>
import FormCliente from './FormCliente.vue'
import SelectorProductos from './SelectorProductos.vue'
import ResumenOrden from './ResumenOrden.vue'
import CajaPago from '../caja/CajaPago.vue'
import TicketPrinter from '../TicketPrinter.vue'
import BarraEstado from './BarraEstado.vue'
import WhatsAppSender from '../WhatsAppSender.vue'
import AuthService from '@/services/auth.service'

export default {
  components: {
    FormCliente,
    SelectorProductos,
    ResumenOrden,
    CajaPago,
    TicketPrinter,
    BarraEstado,
    WhatsAppSender
  },
  data() {
    return {
      pasoActual: 1,
      pago: null,
      orden: {
        cliente_nombre: '',
        cliente_nit: '',
        cliente_telefono: '',
        estado: 'pendiente',
        total: 0,
        items: [],
        // Campos sincronizados con CajaPago
        abonado: 0,
        saldo_pendiente: 0,
        estado_pago: 'pendiente',
        fecha_pago_completo: null,
        tipoPago: {
          id: 1,
          nombre: 'Efectivo'
        }
      },
      ordenGuardada: null,
      loading: false,
      // Información del usuario actual
      usuarioActual: {
        id: 1, // ⚠️ IMPORTANTE: Reemplaza con el ID real del usuario logueado
        nombre: 'Usuario Sistema' // ⚠️ IMPORTANTE: Reemplaza con el nombre real
      },
      // Control de notificaciones
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      // Estado de impresión
      estadoImpresion: {
        imprimiendo: false,
        mostrarAlerta: false,
        tipoAlerta: 'info',
        tituloAlerta: '',
        mensajeAlerta: '',
        iconoAlerta: 'mdi-information'
      },
      // Estado de envío por WhatsApp
      estadoWhatsApp: {
        enviando: false,
        mostrarAlerta: false,
        tipoAlerta: 'info',
        tituloAlerta: '',
        mensajeAlerta: '',
        iconoAlerta: 'mdi-information'
      }
    }
  },
  computed: {
    totalOrden() {
      return this.orden.items.reduce((sum, i) => sum + i.subtotal, 0)
    },
    // Orden preparada para CajaPago con campos sincronizados
    ordenParaCaja() {
      return {
        ...this.ordenGuardada,
        tipoPago: this.ordenGuardada?.tipoPago || { id: 1, nombre: 'Efectivo' },
        abonado: this.ordenGuardada?.abonado || 0,
        saldo_pendiente: this.ordenGuardada?.saldo_pendiente || this.ordenGuardada?.total || 0,
        estado_pago: this.ordenGuardada?.estado_pago || 'pendiente'
      }
    }
  },
  methods: {
    continuarPaso2() {
      this.pasoActual = 2
    },
    continuarPaso3() {
      if (this.orden.items.length === 0) return
      this.pasoActual = 3
    },
    agregarItem(item) {
      const existente = this.orden.items.find(i => i.itemId === item.itemId)
      if (existente) {
        existente.cantidad += item.cantidad
        existente.subtotal += item.subtotal
      } else {
        this.orden.items.push({ ...item })
      }
    },
    quitarItem(index) {
      this.orden.items.splice(index, 1)
    },
    
    // Guardar orden con campos de pago sincronizados
    async guardarOrden(datosOrden) {
      if (!datosOrden.items.length) {
        this.mostrarNotificacion('Debe agregar al menos un producto.', 'error')
        return
      }

      this.loading = true
      try {
        datosOrden.total = this.totalOrden
        
        const currentUser = AuthService.getCurrentUser()
        const empleadoId = currentUser ? currentUser.id : null

        const payload = {
          cliente_nombre: datosOrden.cliente_nombre || 'Consumidor Final',
          cliente_nit: datosOrden.cliente_nit || 'CF',
          cliente_telefono: datosOrden.cliente_telefono || 'N/A',
          estado: datosOrden.estado, // 'pendiente' o 'entregado'
          total: datosOrden.total,
          empleadoId: empleadoId, // Agregado empleadoId
          // Campos de estado de pago sincronizados
          abonado: datosOrden.estado === 'entregado' ? datosOrden.total : 0,
          saldo_pendiente: datosOrden.estado === 'entregado' ? 0 : datosOrden.total,
          estado_pago: datosOrden.estado === 'entregado' ? 'pagado' : 'pendiente',
          items: datosOrden.items.map(i => ({
            itemId: i.itemId,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
            subtotal: i.subtotal
          }))
        }

        const res = await fetch(`${process.env.VUE_APP_API_URL}/ordenes/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const texto = await res.text()
        if (!res.ok) throw new Error(texto)

        const resData = JSON.parse(texto)
        
        // Guardar orden con todos los campos necesarios sincronizados
        this.ordenGuardada = {
          ...datosOrden,
          id: resData.orden.id,
          abonado: resData.orden.abonado || (datosOrden.estado === 'entregado' ? datosOrden.total : 0),
          saldo_pendiente: resData.orden.saldo_pendiente || (datosOrden.estado === 'entregado' ? 0 : datosOrden.total),
          estado_pago: resData.orden.estado_pago || (datosOrden.estado === 'entregado' ? 'pagado' : 'pendiente'),
          tipoPago: { id: 1, nombre: 'Efectivo' }
        }

        this.mostrarNotificacion('Orden guardada exitosamente', 'success')
        this.pasoActual = 4

      } catch (err) {
        console.error('Error al guardar la orden:', err)
        this.mostrarNotificacion('Hubo un error al guardar la orden.', 'error')
      } finally {
        this.loading = false
      }
    },

    // Manejar cobro realizado con estructura correcta
    manejarCobroRealizado(data) {
      console.log('Cobro realizado:', data)
      
      const { movimiento, ordenActualizada, tipo } = data
      
      // Actualizar la orden guardada con los nuevos valores
      if (movimiento) {
        this.actualizarOrdenLocal(movimiento)
      }
      
      // Si necesitas recargar desde el servidor
      if (ordenActualizada) {
        this.recargarOrdenDesdeServidor()
      }
      
      // Mostrar notificación
      const mensaje = tipo === 'pago_total' 
        ? 'Pago completado exitosamente' 
        : 'Abono registrado exitosamente'
      this.mostrarNotificacion(mensaje, 'success')
    },

    // Manejar pago completado with estructura correcta
    manejarPagoCompletado(data) {
      console.log('Pago completado:', data)
      
      const { 
        monto_pagado, 
        forma_pago, 
        vuelto, 
        numero_recibo, 
        es_pago_total,
        saldo_restante,
        fecha 
      } = data
      
      // Guardar información del pago para el ticket
      this.pago = {
        monto: monto_pagado,
        metodo: forma_pago,
        vuelto: vuelto,
        numero_recibo: numero_recibo,
        fecha: fecha
      }
      
      // Si es pago total, enviar WhatsApp automáticamente y luego ir a imprimir
      if (es_pago_total) {
        this.enviarWhatsAppAutomatico()
        this.pasoActual = 6
      }
    },

    // Nuevo método para envío automático de WhatsApp
    async enviarWhatsAppAutomatico() {
      // Solo enviar si hay teléfono válido
      if (!this.ordenGuardada?.cliente_telefono || 
          this.ordenGuardada.cliente_telefono === 'N/A' || 
          this.ordenGuardada.cliente_telefono.trim() === '') {
        console.log('No hay teléfono válido, omitiendo WhatsApp automático')
        return
      }

      try {
        // Esperar un poco para que se monte el componente
        await this.$nextTick()
        
        if (this.$refs.whatsappSender) {
          await this.$refs.whatsappSender.enviarPorWhatsApp()
          console.log('WhatsApp enviado automáticamente')
        }
      } catch (error) {
        console.warn('Error en envío automático de WhatsApp:', error)
        // No mostrar alerta para no interrumpir el flujo
      }
    },

    // Método para reenviar WhatsApp manualmente
    async reenviarWhatsApp() {
      if (!this.$refs.whatsappSender) {
        this.mostrarNotificacion('Error: Componente WhatsApp no disponible', 'error')
        return
      }

      this.estadoWhatsApp.enviando = true
      this.estadoWhatsApp.mostrarAlerta = false

      try {
        await this.$refs.whatsappSender.enviarPorWhatsApp()
      } catch (error) {
        console.error('Error en reenviar WhatsApp:', error)
      }
    },

    // Actualizar orden local después de un pago
    actualizarOrdenLocal(movimiento) {
      if (!movimiento || !this.ordenGuardada) return
      
      // Sumar el nuevo abono al total abonado
      this.ordenGuardada.abonado = (this.ordenGuardada.abonado || 0) + parseFloat(movimiento.monto)
      
      // Recalcular saldo pendiente
      this.ordenGuardada.saldo_pendiente = Math.max(0, this.ordenGuardada.total - this.ordenGuardada.abonado)
      
      // Actualizar estado de pago
      if (this.ordenGuardada.abonado >= this.ordenGuardada.total) {
        this.ordenGuardada.estado_pago = 'pagado'
        this.ordenGuardada.fecha_pago_completo = new Date().toISOString()
      } else if (this.ordenGuardada.abonado > 0) {
        this.ordenGuardada.estado_pago = 'parcial'
      } else {
        this.ordenGuardada.estado_pago = 'pendiente'
      }
    },

    // Recargar orden desde servidor (opcional)
    async recargarOrdenDesdeServidor() {
      if (!this.ordenGuardada?.id) return
      
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/ordenes/${this.ordenGuardada.id}`)
        if (res.ok) {
          const ordenActualizada = await res.json()
          this.ordenGuardada = {
            ...this.ordenGuardada,
            abonado: ordenActualizada.abonado || 0,
            saldo_pendiente: ordenActualizada.saldo_pendiente || 0,
            estado_pago: ordenActualizada.estado_pago || 'pendiente'
          }
        }
      } catch (error) {
        console.error('Error al recargar orden:', error)
      }
    },

    // Cambiar paso (para manejar navegación desde CajaPago)
    cambiarPaso(nuevoPaso) {
      this.pasoActual = nuevoPaso
    },

    // Manejar eventos del TicketPrinter
    manejarImpresionExitosa(data) {
      console.log('Impresión exitosa:', data);
      this.estadoImpresion = {
        imprimiendo: false,
        mostrarAlerta: true,
        tipoAlerta: 'success',
        tituloAlerta: 'Impresión Exitosa',
        mensajeAlerta: `Ticket impreso correctamente para la orden #${data.orden_id}`,
        iconoAlerta: 'mdi-check-circle'
      };
      this.mostrarNotificacion('Ticket impreso con éxito', 'success');
    },

    manejarImpresionError(data) {
      console.error('Error de impresión:', data);
      
      // Clasificar tipo de error
      let tipoAlerta = 'error';
      let tituloAlerta = 'Error de Impresión';
      let mensajeAlerta = data.error;
      
      if (data.error.includes('Servidor de impresión no disponible')) {
        tipoAlerta = 'warning';
        tituloAlerta = 'Impresora No Disponible';
        mensajeAlerta = 'No se puede conectar con la impresora. Verifique que esté encendida y conectada a la red.';
      } else if (data.error.includes('Error del servidor')) {
        tituloAlerta = 'Error del Servidor de Impresión';
        mensajeAlerta = 'El servidor de impresión respondió con un error. Intente nuevamente.';
      }
      
      this.estadoImpresion = {
        imprimiendo: false,
        mostrarAlerta: true,
        tipoAlerta: tipoAlerta,
        tituloAlerta: tituloAlerta,
        mensajeAlerta: mensajeAlerta,
        iconoAlerta: tipoAlerta === 'warning' ? 'mdi-printer-alert' : 'mdi-alert-circle'
      };
      
      this.mostrarNotificacion('Error al imprimir ticket', 'error');
    },

    manejarWhatsAppEnviado(data) {
      console.log('WhatsApp enviado:', data)
      
      const esAutomatico = !this.estadoWhatsApp.enviando // Si no está marcando como enviando manual
      
      this.estadoWhatsApp = {
        enviando: false,
        mostrarAlerta: !esAutomatico, // Solo mostrar alerta si fue manual
        tipoAlerta: 'success',
        tituloAlerta: 'WhatsApp Enviado',
        mensajeAlerta: `Mensaje enviado a ${data.telefono}`,
        iconoAlerta: 'mdi-whatsapp'
      }
      
      if (!esAutomatico) {
        this.mostrarNotificacion(`WhatsApp enviado a ${data.telefono}`, 'success')
      }
    },

    manejarWhatsAppError(data) {
      console.warn('Error WhatsApp:', data)
      
      const esAutomatico = !this.estadoWhatsApp.enviando
      
      this.estadoWhatsApp = {
        enviando: false,
        mostrarAlerta: !esAutomatico,
        tipoAlerta: 'warning',
        tituloAlerta: 'Error WhatsApp',
        mensajeAlerta: data.error,
        iconoAlerta: 'mdi-whatsapp'
      }
      
      if (!esAutomatico) {
        this.mostrarNotificacion(`Error WhatsApp: ${data.error}`, 'warning')
      }
    },

    // Método mejorado para reimprimir con manejo de estados
    async intentarReimprimir() {
      if (!this.$refs.ticketPrinter) {
        this.mostrarNotificacion('Error: Componente de impresión no disponible', 'error');
        return;
      }

      this.estadoImpresion.imprimiendo = true;
      this.estadoImpresion.mostrarAlerta = false;

      try {
        await this.$refs.ticketPrinter.imprimir();
      } catch (error) {
        // El error ya es manejado por los eventos, solo limpiamos el estado
        console.error('Error en reimprimir:', error);
      }
    },

    // Sistema de notificaciones
    mostrarNotificacion(texto, color = 'success') {
      this.snackbar = {
        show: true,
        text: texto,
        color: color
      }
    },

    // Limpiar datos al iniciar nueva orden
    iniciarNuevaOrden() {
      this.orden = {
        cliente_nombre: '',
        cliente_nit: '',
        cliente_telefono: '',
        estado: 'pendiente',
        total: 0,
        items: [],
        abonado: 0,
        saldo_pendiente: 0,
        estado_pago: 'pendiente',
        fecha_pago_completo: null,
        tipoPago: {
          id: 1,
          nombre: 'Efectivo'
        }
      }
      this.ordenGuardada = null
      this.pago = null
      this.pasoActual = 1
      
      // Limpiar estado de impresión
      this.estadoImpresion = {
        imprimiendo: false,
        mostrarAlerta: false,
        tipoAlerta: 'info',
        tituloAlerta: '',
        mensajeAlerta: '',
        iconoAlerta: 'mdi-information'
      }

      // Limpiar estado de WhatsApp
      this.estadoWhatsApp = {
        enviando: false,
        mostrarAlerta: false,
        tipoAlerta: 'info',
        tituloAlerta: '',
        mensajeAlerta: '',
        iconoAlerta: 'mdi-information'
      }
    }
  },

  // Inicializar usuario al montar componente
  async mounted() {
    // Aquí deberías obtener la información del usuario logueado
    // Ejemplo:
    // const usuario = await this.obtenerUsuarioActual()
    // this.usuarioActual = usuario
    
    console.log('Componente montado con usuario:', this.usuarioActual)
  }
}
</script>

<style scoped>
.form-orden {
  max-width: 1200px;
  margin: 0 auto;
  transition: max-width 0.3s ease;
}
.form-expandida {
  max-width: 1800px;
}

.barra-estado {
  font-weight: bold;
}
.barra-estado .activo {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}
.acciones {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.tabla-scroll {
  overflow-x: auto;
}
.tabla-resumen {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}

/* Estilos adicionales para el paso 6 - Ticket */
.pago-resumen-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pago-detalles {
  padding: 16px;
}

.text-h6 {
  font-size: 1.5rem;
  font-weight: 500;
}

.text-subtitle-1 {
  font-size: 1.125rem;
  font-weight: 400;
}

.text-body-1 {
  font-size: 1rem;
  font-weight: 300;
}

.text-body-2 {
  font-size: 0.875rem;
  font-weight: 300;
}

.text-caption {
  font-size: 0.75rem;
  font-weight: 500;
}

.v-icon {
  font-size: 1.5rem;
}
</style>