const express = require('express');
const router = express.Router();
const { auth, isProfesional, isCliente } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');

router.post('/', auth, isProfesional, async (req, res) => {
  try {
    const { propietario, paciente, especie, raza, edad, peso, temperatura, diagnostico, tratamiento, medicamentos, observaciones, cliente_id, appointment_id } = req.body;
    
    const medicalRecord = new MedicalRecord({
      propietario, paciente, especie: especie || 'Canino', raza: raza || '', edad: edad || '', peso: peso || '', temperatura: temperatura || '',
      diagnostico, tratamiento, medicamentos: medicamentos || '', observaciones: observaciones || '',
      profesional: req.user.nombre, profesional_id: req.userId, cliente_id, appointment_id
    });
    
    await medicalRecord.save();
    if (appointment_id) await Appointment.findByIdAndUpdate(appointment_id, { estado: 'completada' });
    
    await new Notification({ tipo: 'sistema', titulo: 'Historia Clínica', mensaje: `Historia de ${paciente} disponible`, id_usuario: cliente_id }).save();
    
    res.json({ success: true, message: 'Historia clínica creada', data: medicalRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/cliente', auth, isCliente, async (req, res) => {
  const historias = await MedicalRecord.find({ cliente_id: req.userId }).sort({ fecha: -1 });
  res.json({ success: true, data: historias });
});

router.get('/profesional/todas', auth, isProfesional, async (req, res) => {
  const historias = await MedicalRecord.find({ profesional_id: req.userId }).sort({ fecha: -1 });
  res.json({ success: true, data: historias });
});

router.get('/:id', auth, async (req, res) => {
  const historia = await MedicalRecord.findById(req.params.id);
  if (!historia) return res.status(404).json({ success: false, message: 'Historia no encontrada' });
  
  const esProfesional = historia.profesional_id?.toString() === req.userId.toString();
  const esCliente = historia.cliente_id.toString() === req.userId.toString();
  if (!esProfesional && !esCliente && req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  res.json({ success: true, data: historia });
});

module.exports = router;