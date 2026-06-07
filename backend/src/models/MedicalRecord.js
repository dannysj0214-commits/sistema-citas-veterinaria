const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  hc_numero: {
    type: String,
    unique: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  propietario: {
    type: String,
    required: true
  },
  paciente: {
    type: String,
    required: true
  },
  especie: {
    type: String,
    default: 'Canino'
  },
  raza: {
    type: String,
    default: ''
  },
  edad: {
    type: String,
    default: ''
  },
  peso: {
    type: String,
    default: ''
  },
  temperatura: {
    type: String,
    default: ''
  },
  diagnostico: {
    type: String,
    required: true
  },
  tratamiento: {
    type: String,
    required: true
  },
  medicamentos: {
    type: String,
    default: ''
  },
  observaciones: {
    type: String,
    default: ''
  },
  profesional: {
    type: String,
    required: true
  },
  profesional_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
});

// Generar número de historia clínica automáticamente
medicalRecordSchema.pre('save', async function(next) {
  if (!this.hc_numero) {
    const MedicalRecord = mongoose.model('MedicalRecord');
    const count = await MedicalRecord.countDocuments();
    this.hc_numero = `HC-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);