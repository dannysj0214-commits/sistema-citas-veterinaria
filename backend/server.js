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

// ========== CONFIGURACIÓN CORS COMPLETA ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://sistema-citas-api.onrender.com',
  'https://sistemaveterinaria.netlify.app',
  'https://sistema-citas-frontend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`❌ CORS bloqueado: ${origin}`);
      return callback(new Error('CORS policy error'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/login, POST /api/auth/register, GET /api/auth/profile',
      professionals: 'GET /api/auth/profesionales',
      appointments: 'GET/POST /api/appointments, GET /api/appointments/cliente',
      services: 'GET /api/services/profesional/:id, POST /api/services',
      availability: 'GET/POST /api/availability',
      notifications: 'GET /api/notifications',
      reports: 'GET /api/reports/stats',
      admin: 'GET /api/admin/usuarios, GET /api/admin/stats',
      medicalRecords: 'POST /api/medical-records/professional, GET /api/medical-records/:id'
    }
  });
});

// ========== CONEXIÓN A MONGODB ==========
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI no está definida');
      return;
    }
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB Atlas correctamente');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado. Reconectando...');
  connectDB();
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ========================================`);
  console.log(`📡 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: https://sistema-citas-api.onrender.com`);
  console.log(`🔗 API Health: https://sistema-citas-api.onrender.com/api/health`);
  console.log(`========================================\n`);
});