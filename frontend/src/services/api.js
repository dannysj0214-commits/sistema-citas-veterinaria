import axios from 'axios';

// Usar la variable de entorno de Netlify o Render
const API_URL = import.meta.env.VITE_API_URL || 'https://sistema-citas-api.onrender.com/api';

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
    }
    console.log(`📝 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    console.log(`✅ Respuesta exitosa: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Sesión expirada, redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.error('❌ Error en respuesta:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;