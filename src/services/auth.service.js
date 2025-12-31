import ApiService from './api.service'

class AuthService {
  async login(usuario, contrasena) {
    try {
      const response = await ApiService.post('/empleados/login', { usuario, contrasena })
      if (response.accessToken) {
        ApiService.setAuthToken(response.accessToken, true) // Persist token by default or based on "remember me"
        // Store user info en AMBOS formatos para compatibilidad
        localStorage.setItem('user', JSON.stringify(response))
        localStorage.setItem('empleado', JSON.stringify(response)) // ← Para POS y otros módulos
      }
      return response
    } catch (error) {
      throw error
    }
  }

  logout() {
    ApiService.removeAuthToken()
    localStorage.removeItem('user')
    localStorage.removeItem('empleado') // ← Limpiar también empleado
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) return JSON.parse(userStr)
    return null
  }

  getCurrentEmpleado() {
    // Alias para compatibilidad con módulos que buscan 'empleado'
    const empleadoStr = localStorage.getItem('empleado')
    if (empleadoStr) return JSON.parse(empleadoStr)
    // Fallback a 'user' si no existe 'empleado'
    return this.getCurrentUser()
  }
  
  isAuthenticated() {
      return !!ApiService.getAuthToken();
  }

  async changePassword(userId, currentPassword, newPassword) {
    return ApiService.put(`/empleados/update-password/${userId}`, {
      currentPassword,
      newPassword
    });
  }
}

export default new AuthService()
