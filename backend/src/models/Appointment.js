const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  estado: { type: String, enum: ['pendiente', 'confirmada', 'completada', 'cancelada', 'rechazada'], default: 'pendiente' },
  motivo: { type: String, required: true },
  servicio: { type: String, required: true },
  notas: { type: String, default: '' },
  id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_profesional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);