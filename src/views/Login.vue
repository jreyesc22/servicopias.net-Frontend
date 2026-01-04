<template>
  <v-container fluid fill-height class="login-background gradient-background">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="login-card card-elevated glass-effect" flat>
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
                class="custom-input input-focus mb-2"
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
                class="custom-input input-focus"
                hide-details="auto"
                prepend-inner-icon="mdi-lock"
                :rules="[v => !!v || 'La contraseña es requerida']"
                required
              ></v-text-field>
              <v-btn 
                block
                size="large"
                class="login-btn btn-smooth mt-6"
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-3xl) var(--spacing-xl) var(--spacing-xl) var(--spacing-xl);
}

.card-content {
  padding: 0;
}

.login-title {
  font-weight: 900;
  font-size: var(--text-3xl);
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.login-subtitle {
  font-size: var(--text-base);
  color: var(--primary-color);
  opacity: 0.85;
  margin-bottom: 0;
  font-weight: 500;
}

.custom-input .v-input__control {
  border-radius: var(--border-radius);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}
.custom-input input {
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.custom-input input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--surface-elevated) inset !important;
}

.login-btn {
  background: var(--gradient-primary);
  color: #fff !important;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  transition: transform var(--transition-fast), box-shadow var(--transition-base);
}
.login-btn:hover {
  background: var(--gradient-primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px) scale(1.03);
}

.forgot-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-fast);
  font-size: var(--text-sm);
}
.forgot-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}
</style>
