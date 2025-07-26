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
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Usuario"
                type="text"
                solo
                flat
                class="custom-input"
                hide-details="auto"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                solo
                flat
                class="custom-input"
                hide-details="auto"
                prepend-inner-icon="mdi-lock"
              ></v-text-field>
              <v-btn 
                block
                size="large"
                class="login-btn mt-6"
                @click="login"
                depressed
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
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      // Aquí va la lógica de login real
      this.$router.push('/dashboard')
    }
  }
}
</script>
<style scoped>
.login-background {
  min-height: 100vh;
  background: linear-gradient(120deg, #355C7D 0%, #6C9A8B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(53, 92, 125, 0.2);
  background: rgba(255, 255, 255, 0.94);
  padding: 32px 24px 24px 24px;
  backdrop-filter: blur(8px);
}

.card-content {
  padding: 0;
}

.login-title {
  font-weight: 900;
  font-size: 2rem;
  color: #2a3f55;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.login-subtitle {
  font-size: 1.1rem;
  color: #6C9A8B;
  opacity: 0.9;
  margin-bottom: 0;
}

.custom-input .v-input__control {
  border-radius: 12px;
  box-shadow: 0 2px 10px 0 rgba(53, 92, 125, 0.07);
  background: #f5f9f8;
  transition: box-shadow .2s;
}
.custom-input input {
  font-size: 1rem;
  color: #2a3f55;
}
.custom-input input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #e6f0f0 inset !important;
  -webkit-text-fill-color: #2a3f55 !important;
}

.login-btn {
  background: linear-gradient(90deg, #355C7D 0%, #F67233 100%);
  color: #fff !important;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 16px;
  box-shadow: 0 4px 16px 0 rgba(53, 92, 125, 0.14);
  transition: background 0.2s, box-shadow 0.2s;
}
.login-btn:hover {
  background: linear-gradient(90deg, #2b4a63 0%, #e35d1f 100%);
  box-shadow: 0 6px 24px 0 rgba(53, 92, 125, 0.18);
}

.forgot-link {
  color: #F67233;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #cf5019;
  text-decoration: underline;
}
</style>
