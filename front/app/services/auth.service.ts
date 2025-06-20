// src/services/auth.service.ts
const API_BASE_URL = 'http://localhost:3000'

export const AuthService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',      
      credentials: 'include', // Necesario para cookies
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(credentials),
    });
    return await response.json();
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  },

  logout: async () => {
    console.log('Cerrando sesión');
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },
};