<template>
  <div class="categoria-form">
    <div class="form-container">
      <div class="form-header">
        <h1>Registrar Categoría</h1>
        <p class="subtitle">Completa los datos para crear una nueva categoría</p>
      </div>

      <form @submit.prevent="guardarCategoria" class="form">
        <div class="input-group">
          <label for="nombre">Nombre <span class="required">*</span></label>
          <input
            id="nombre"
            v-model="form.nombre"
            required
            placeholder="Ej. Papelería"
            class="input-field"
          />
        </div>

        <div class="input-group">
          <label for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            v-model="form.descripcion"
            placeholder="Ej. Útiles escolares, oficina, etc."
            class="textarea-field"
            rows="4"
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">
          <span class="btn-text">Guardar Categoría</span>
          <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5l10 -10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </form>

      <div class="messages">
        <div v-if="mensaje" class="message success">
          <svg class="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ mensaje }}
        </div>
        <div v-if="error" class="message error">
          <svg class="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"

const API_URL = process.env.VUE_APP_API_URL

const form = ref({
  nombre: "",
  descripcion: ""
})

const mensaje = ref("")
const error = ref("")

const guardarCategoria = async () => {
  mensaje.value = ""
  error.value = ""

  if (!form.value.nombre.trim()) {
    error.value = "El campo 'nombre' es obligatorio"
    return
  }

  try {
    await axios.post(`${API_URL}/categorias/create`, form.value)
    mensaje.value = "Categoría creada correctamente"
    form.value = { nombre: "", descripcion: "" }
  } catch (err) {
    console.error(err)
    error.value = "No se pudo guardar la categoría"
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.categoria-form {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #e53e3e;
  font-weight: 500;
}

.input-field,
.textarea-field {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
}

.input-field:focus,
.textarea-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.input-field::placeholder,
.textarea-field::placeholder {
  color: #a0aec0;
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  outline: none;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-text {
  display: flex;
  align-items: center;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(2px);
}

.messages {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 16px;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

.message-icon {
  flex-shrink: 0;
}

.success {
  background: rgba(72, 187, 120, 0.1);
  color: #2f855a;
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.error {
  background: rgba(245, 101, 101, 0.1);
  color: #c53030;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .categoria-form {
    padding: 16px;
  }
  
  .form-container {
    padding: 24px;
  }
  
  .form-header h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .input-field,
  .textarea-field,
  .submit-btn {
    font-size: 16px; /* Previene zoom en iOS */
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-container {
    background: rgba(26, 32, 44, 0.95);
  }
  
  .form-header h1 {
    color: #f7fafc;
  }
  
  .subtitle {
    color: #cbd5e0;
  }
  
  .input-group label {
    color: #f7fafc;
  }
  
  .input-field,
  .textarea-field {
    background: #2d3748;
    border-color: #4a5568;
    color: #f7fafc;
  }
  
  .input-field::placeholder,
  .textarea-field::placeholder {
    color: #718096;
  }
  
  .input-field:focus,
  .textarea-field:focus {
    border-color: #667eea;
    background: #374151;
  }
}
</style>