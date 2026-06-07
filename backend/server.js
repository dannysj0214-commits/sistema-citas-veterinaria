const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const serviceRoutes = require('./src/routes/services');
const availabilityRoutes = require('./src/routes/availability');
const notificationRoutes = require('./src/routes/notifications');
const medicalRecordRoutes = require('./src/routes/medicalRecords');
const reportRoutes = require('./src/routes/reports');
const adminRoutes = require('./src/routes/admin');

const app = express();

// Mostrar configuración de .env
console.log('📁 .env cargado - MONGO_URI:', process.env.MONGO_URI);

// ========== CONFIGURACIÓN CORS CORREGIDA ==========
const allowedOrigins = [
  // Desarrollo local
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5000',
  // Backend Render
  'https://sistema-citas-api.onrender.com',
  // Frontend Netlify
  'https://sistemaveterinaria.netlify.app',
  'https://sistema-citas-frontend.onrender.com',
  'https://elaborate-lebkuchen-fd6abe.netlify.app',
  'https://sistema-citas-veterinaria.netlify.app',
  // Frontend Vercel
  'https://frontend-ck6vcg0c8-dany-s-projects19.vercel.app',
  'https://frontend-514k33pj4-dany-s-projects19.vercel.app',
  'https://frontend-neon-omega-51.vercel.app',
  'https://frontend-dhoq2zt1v-dany-s-projects19.vercel.app',
  'https://frontend-9ukjdye1v-dany-s-projects19.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (Postman, curl)
    if (!origin) return callback(null, true);
    
    // Permitir todos los localhost para desarrollo
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Verificar si el origen está permitido
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS permitido: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS bloqueado: ${origin}`);
      callback(null, true); // Temporal: permite pero registra
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RUTAS ==========
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// ========== RUTAS PÚBLICAS ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    nombre: 'Sistema de Gestión de Citas para Servicios Profesionales',
    version: '2.0.0',
    status: 'online'
  });
});

// ========== CONEXIÓN A MONGODB ==========
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI || mongoURI === 'undefined') {
      console.log('⚠️ MONGO_URI no definida, usando localhost');
      mongoURI = 'mongodb://localhost:27017/sistema_citas';
    }
    
    console.log(`🔧 Conectando a: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    
    if (mongoURI.includes('mongodb+srv')) {
      console.log('✅ Conectado a MongoDB ATLAS (nube)');
    } else if (mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1')) {
      console.log('✅ Conectado a MongoDB LOCAL');
    } else {
      console.log('✅ Conectado a MongoDB');
    }
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    console.log('⚠️ Reintentando en 5 segundos...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado. Reconectando...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en MongoDB:', err);
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ========================================`);
  console.log(`📡 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 CORS permitidos: ${allowedOrigins.length} dominios`);
  console.log(`========================================\n`);
});