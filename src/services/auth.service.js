import ApiService from './api.service'

class AuthService {
  async login(usuario, contrasena) {
    try {
      const response = await ApiService.post('/empleados/login', { usuario, contrasena })
      if (response.accessToken) {
        ApiService.setAuthToken(response.accessToken, true) // Persist token by default or based on "remember me"
        // Store user info
        localStorage.setItem('user', JSON.stringify(response))
      }
      return response
    } catch (error) {
      throw error
    }
  }

  logout() {
    ApiService.removeAuthToken()
    localStorage.removeItem('user')
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) return JSON.parse(userStr)
    return null
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
