<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <!-- Header Verde -->
      <v-sheet color="green-darken-3" class="pa-4">
        <div class="text-white text-h6">Registrar Nuevo Ingreso</div>
        <div class="text-white text-body-2">
          Complete la información del movimiento de entrada
        </div>
      </v-sheet>

      <!-- Formulario -->
      <v-card-text>
        <v-form ref="formRef" v-model="isValid" validate-on="blur">
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="form.monto"
                label="Monto del Ingreso"
                type="number"
                prepend-inner-icon="mdi-cash-multiple"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Requerido']"
              />
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="form.id_tipo_pago"
                label="Tipo de Pago"
                :items="metodosPago"
                item-title="nombre"
                item-value="id"
                prepend-inner-icon="mdi-credit-card"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Requerido']"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.descripcion"
            label="Descripción del Ingreso"
            variant="outlined"
            density="compact"
            rows="3"
            :rules="[v => !!v || 'Requerido']"
          />

          <v-select
            v-model="form.id_empleado"
            label="Empleado Responsable"
            :items="empleados"
            item-title="nombre"
            item-value="id"
            variant="outlined"
            density="compact"
            :rules="[v => !!v || 'Requerido']"
          />
        </v-form>

        <!-- Resumen -->
        <v-sheet class="mt-4 pa-4" border>
          <div class="text-subtitle-2 mb-2">
            <v-icon start color="green">mdi-information</v-icon>
            Resumen del Ingreso
          </div>
          <v-row>
            <v-col cols="4">
              <div class="text-caption">Monto Total</div>
              <div class="text-green text-h6">Q {{ form.monto || '0.00' }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-caption">Método de Pago</div>
              <div>{{ metodoSeleccionado || 'No seleccionado' }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-caption">Empleado</div>
              <div>{{ empleadoSeleccionado || 'No seleccionado' }}</div>
            </v-col>
          </v-row>
        </v-sheet>

        <!-- Mensaje -->
        <v-alert
          v-if="mensaje"
          :type="mensajeTipo"
          class="mt-3"
          density="compact"
        >
          {{ mensaje }}
        </v-alert>
      </v-card-text>

      <!-- Acciones -->
      <v-card-actions class="justify-space-between">
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="green-darken-3" :loading="loading" @click="guardarIngreso">
          <v-icon start>mdi-content-save</v-icon>
          Registrar Ingreso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import axios from "axios";
import AuthService from '@/services/auth.service';

const dialog = ref(true);
const formRef = ref(null);
const isValid = ref(false);
const loading = ref(false);

const mensaje = ref("");
const mensajeTipo = ref("success");

const form = reactive({
  monto: "",
  id_tipo_pago: "",
  descripcion: "",
  id_empleado: "",
  tipo_movimiento: "ENTRADA",
});

const empleados = ref([]);
const metodosPago = ref([]);

const metodoSeleccionado = computed(() => {
  const sel = metodosPago.value.find(m => m.id === form.id_tipo_pago);
  return sel ? sel.nombre : "";
});

const empleadoSeleccionado = computed(() => {
  const sel = empleados.value.find(e => e.id === form.id_empleado);
  return sel ? sel.nombre : "";
});

onMounted(async () => {
  const currentUser = AuthService.getCurrentUser();
  if (currentUser) {
    form.id_empleado = currentUser.id;
  }

  empleados.value = [
    { id: 1, nombre: "Dev" },
    { id: 2, nombre: "Admin" },
  ];
  metodosPago.value = [
    { id: 1, nombre: "Efectivo" },
    { id: 2, nombre: "Tarjeta" },
  ];
});

const guardarIngreso = async () => {
  mensaje.value = "";

  const valid = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  try {
    const payload = {
      ...form,
      monto: parseFloat(form.monto),
    };

    const res = await axios.post("/movimientos", payload);

    mensaje.value = res.data.mensaje || "Ingreso registrado correctamente";
    mensajeTipo.value = "success";
    dialog.value = false;
  } catch (err) {
    mensaje.value = err.response?.data?.error || "Error al registrar el ingreso";
    mensajeTipo.value = "error";
  } finally {
    loading.value = false;
  }
};
</script>
