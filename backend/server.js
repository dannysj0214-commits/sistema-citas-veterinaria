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

// ========== CONFIGURACIÓN CORS ==========
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
      console.log(`CORS bloqueado: ${origin}`);
      return callback(new Error('CORS policy error'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// ========== RUTAS ==========
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

app.get('/', (req, res) => {
  res.json({
    nombre: 'Sistema de Gestión de Citas',
    version: '2.0.0',
    status: 'online'
  });
});

// ========== CONEXIÓN A MONGODB ==========
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ========== INICIAR SERVIDOR ==========
// Render asigna el puerto mediante la variable de entorno PORT
const PORT = process.env.PORT || 10000;  // <-- Usar 10000 como fallback

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`🔗 API Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`========================================`);
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