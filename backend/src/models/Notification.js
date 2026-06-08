const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['cita', 'sistema'], default: 'sistema' },
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  leido: { type: Boolean, default: false },
  link: { type: String, default: '' },
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);