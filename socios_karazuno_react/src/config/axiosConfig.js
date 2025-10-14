// src/config/axiosConfig.js

import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a TODAS las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Tu backend usa JWT, así que usamos el formato Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 Petición:', config.method.toUpperCase(), config.url, 'Token presente:', !!token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación

api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('❌ Error de autenticación:', error.response?.status, error.config?.url);

      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export default api;