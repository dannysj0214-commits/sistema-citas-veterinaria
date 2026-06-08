const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const serviceRoutes = require('./src/routes/services');
const availabilityRoutes = require('./src/routes/availability');
const notificationRoutes = require('./src/routes/notifications');
const medicalRecordRoutes = require('./src/routes/medicalRecords');
const reportRoutes = require('./src/routes/reports');
const adminRoutes = require('./src/routes/admin');

const app = express();

// CORS solo para localhost
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Conexión a MongoDB LOCAL
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sistema_citas')
  .then(() => console.log('✅ Conectado a MongoDB LOCAL'))
  .catch(err => console.error('❌ Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});