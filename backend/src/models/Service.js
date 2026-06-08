const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  duracion: { type: Number, required: true, default: 90 },
  precio: { type: Number, required: true },
  descripcion: { type: String, default: '' },
  id_profesional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disponible: { type: Boolean, default: true }
});

module.exports = mongoose.model('Service', serviceSchema);