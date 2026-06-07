const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  dia_semana: {
    type: Number, // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    required: true,
    min: 0,
    max: 6
  },
  hora_inicio: {
    type: String,
    required: true
  },
  hora_fin: {
    type: String,
    required: true
  },
  id_profesional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  disponible: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Availability', availabilitySchema);