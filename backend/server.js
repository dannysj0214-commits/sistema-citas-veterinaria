const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express primero
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Puerto
const PORT = process.env.PORT || 5000;

// Importar rutas (DESPUÉS de crear app)
const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const serviceRoutes = require('./src/routes/services');
const availabilityRoutes = require('./src/routes/availability');
const notificationRoutes = require('./src/routes/notifications');
const reportRoutes = require('./src/routes/reports');
const adminRoutes = require('./src/routes/admin');
const medicalRecordsRoutes = require('./src/routes/medicalRecords');

// Conexión a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/sistema_citas';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Rutas (DESPUÉS de conectar)
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    nombre: 'Sistema de Gestión de Citas para Servicios Profesionales',
    version: '2.0.0',
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

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`📅 Citas: http://localhost:${PORT}/api/appointments`);
    console.log(`💼 Servicios: http://localhost:${PORT}/api/services`);
    console.log(`⏰ Horarios: http://localhost:${PORT}/api/availability`);
    console.log(`🔔 Notificaciones: http://localhost:${PORT}/api/notifications`);
    console.log(`📊 Reportes: http://localhost:${PORT}/api/reports/stats`);
    console.log(`👑 Admin: http://localhost:${PORT}/api/admin/usuarios`);
    console.log(`📋 Medical Records: http://localhost:${PORT}/api/medical-records`);
  });
};

startServer();