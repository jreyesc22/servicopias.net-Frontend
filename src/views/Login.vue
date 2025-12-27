<template>
  <v-container fluid fill-height class="login-background">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="login-card" flat>
          <v-card-text class="card-content">
            <div class="text-center mb-8">
              <h2 class="login-title">Bienvenido</h2>
              <p class="login-subtitle">Inicia sesión en tu cuenta</p>
            </div>
            
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="error = ''"
            >
              {{ error }}
            </v-alert>

            <v-form ref="form" @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Usuario"
                type="text"
                variant="solo"
                flat
                class="custom-input mb-2"
                hide-details="auto"
                prepend-inner-icon="mdi-account"
                :rules="[v => !!v || 'El usuario es requerido']"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                variant="solo"
                flat
                class="custom-input"
                hide-details="auto"
                prepend-inner-icon="mdi-lock"
                :rules="[v => !!v || 'La contraseña es requerida']"
                required
              ></v-text-field>
              <v-btn 
                block
                size="large"
                class="login-btn mt-6"
                type="submit"
                :loading="loading"
                :disabled="loading"
                color="primary"
                elevation="2"
              >
                Ingresar
              </v-btn>
            </v-form>
            <div class="text-center mt-6">
              <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AuthService from '@/services/auth.service';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) return

      this.loading = true
      this.error = ''

      try {
        await AuthService.login(this.username, this.password)
        this.$router.push('/dashboard')
      } catch (error) {
        console.error(error)
        if (error.message && error.message.includes('401')) {
           this.error = 'Usuario o contraseña incorrectos'
        } else {
           this.error = 'Error al iniciar sesión. Intente nuevamente.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style scoped>


.login-background {
  min-height: 100vh;
  background: linear-gradient(120deg, #e0e7ef 0%, #f5f7fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: 22px;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.13);
  background: rgba(255,255,255,0.98);
  padding: 40px 28px 28px 28px;
  border: 1.5px solid #e3e8ee;
  backdrop-filter: blur(6px);
}

.card-content {
  padding: 0;
}

.login-title {
  font-weight: 900;
  font-size: 2.2rem;
  color: #222b45;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(60,60,60,0.04);
}

.login-subtitle {
  font-size: 1.08rem;
  color: #5a6a85;
  opacity: 0.92;
  margin-bottom: 0;
  font-weight: 500;
}

.custom-input .v-input__control {
  border-radius: 12px;
  background: #f7fafd;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 60, 0.04);
  transition: box-shadow .2s, border .2s;
}
.custom-input input {
  font-size: 1.08rem;
  color: #222b45;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.custom-input input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px #1976d233;
}
.custom-input input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #e6f0f0 inset !important;
  -webkit-text-fill-color: #222b45 !important;
}

.login-btn {
  background: linear-gradient(90deg, #1976d2 0%, #43a4ff 100%);
  color: #fff !important;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 14px;
  box-shadow: 0 4px 16px 0 rgba(25, 118, 210, 0.13);
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.login-btn:hover {
  background: linear-gradient(90deg, #1565c0 0%, #1976d2 100%);
  box-shadow: 0 8px 32px 0 rgba(25, 118, 210, 0.18);
  transform: translateY(-2px) scale(1.03);
}

.forgot-link {
  color: #1976d2;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.98rem;
}
.forgot-link:hover {
  color: #0d47a1;
  text-decoration: underline;
}
</style>
