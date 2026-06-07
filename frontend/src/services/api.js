import axios from 'axios';

// FORZAR LA URL DEL BACKEND EN RENDER (Netlify no está leyendo la variable)
const API_URL = 'https://sistema-citas-api.onrender.com/api';

// Intentar usar variable de entorno si existe (para desarrollo local)
const finalAPIUrl = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') : API_URL;

console.log('🔗 API_URL configurada:', finalAPIUrl);
console.log('🔧 Modo:', import.meta.env.DEV ? 'Desarrollo Local' : 'Producción');

const api = axios.create({
  baseURL: finalAPIUrl,
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
      console.log(`🔑 Token agregado a ${config.url}`);
    } else {
      console.log(`⚠️ Sin token para ${config.url}`);
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
      console.error('❌ Error de red - No se puede conectar al backend:', finalAPIUrl);
      console.error('   Verifica que el backend esté corriendo en Render');
    } else {
      console.error(`❌ Error en respuesta: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;