import axios from 'axios';

// FORZAR URL DEL BACKEND EN RENDER
const API_URL = 'https://sistema-citas-api.onrender.com/api';

console.log('🔗 API_URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token agregado a: ${config.url}`);
    } else {
      console.log(`⚠️ No hay token para: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta exitosa: ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Sesión expirada (401), redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.code === 'ERR_NETWORK') {
      console.error('❌ Error de red - No se puede conectar al backend:', API_URL);
    } else {
      console.error(`❌ Error en respuesta: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;