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
    // Permitir solicitudes sin origen (como Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`❌ CORS bloqueado: ${origin}`);
      return callback(new Error('CORS policy error'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RUTAS DE LA API ==========
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// ========== RUTA DE SALUD ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ========== RUTA PRINCIPAL ==========
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

// ========== MANEJO DE ERRORES 404 ==========
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Ruta ${req.originalUrl} no encontrada` 
  });
});

// ========== CONEXIÓN A MONGODB ==========
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI no está definida en variables de entorno');
      return;
    }
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB Atlas correctamente');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    console.log('⚠️ Reintentando conexión en 5 segundos...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Manejo de eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado. Reconectando...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en MongoDB:', err);
});

// ========== INICIAR SERVIDOR ==========
// Render asigna el puerto mediante la variable de entorno PORT
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ========================================`);
  console.log(`📡 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`🔗 API Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`========================================\n`);
});

// ========== MANEJO DE CIERRE GRACEFUL ==========
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(async () => {
    console.log('Servidor cerrado');
    try {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada');
    } catch (err) {
      console.error('Error al cerrar MongoDB:', err);
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(async () => {
    console.log('Servidor cerrado');
    try {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada');
    } catch (err) {
      console.error('Error al cerrar MongoDB:', err);
    }
    process.exit(0);
  });
});

module.exports = app;