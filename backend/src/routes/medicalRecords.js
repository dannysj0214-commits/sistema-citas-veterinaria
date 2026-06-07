const express = require('express');
const router = express.Router();
const { auth, isProfesional, isCliente, isAdmin } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ========== PROFESIONAL: CREAR HISTORIA CLÍNICA ==========
router.post('/', auth, isProfesional, async (req, res) => {
  try {
    const {
      propietario,
      paciente,
      especie,
      raza,
      edad,
      peso,
      temperatura,
      diagnostico,
      tratamiento,
      medicamentos,
      observaciones,
      cliente_id,
      appointment_id
    } = req.body;
    
    console.log('📝 Creando historia clínica para:', paciente);
    
    const cliente = await User.findById(cliente_id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    
    const medicalRecord = new MedicalRecord({
      propietario,
      paciente,
      especie: especie || 'Canino',
      raza: raza || '',
      edad: edad || '',
      peso: peso || '',
      temperatura: temperatura || '',
      diagnostico,
      tratamiento,
      medicamentos: medicamentos || '',
      observaciones: observaciones || '',
      profesional: req.user.nombre,
      profesional_id: req.userId,
      cliente_id,
      appointment_id
    });
    
    await medicalRecord.save();
    console.log('✅ Historia clínica creada:', medicalRecord.hc_numero);
    
    if (appointment_id) {
      await Appointment.findByIdAndUpdate(appointment_id, { estado: 'completada' });
    }
    
    const notification = new Notification({
      tipo: 'sistema',
      titulo: 'Historia Clínica Disponible',
      mensaje: `La historia clínica de ${paciente} ya está disponible para consulta`,
      id_usuario: cliente_id,
      link: `/ver-historia/${medicalRecord._id}`
    });
    await notification.save();
    
    res.json({ success: true, message: 'Historia clínica creada', data: medicalRecord });
  } catch (error) {
    console.error('❌ Error al crear historia:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CLIENTE: OBTENER MIS HISTORIAS ==========
router.get('/cliente', auth, isCliente, async (req, res) => {
  try {
    console.log('📋 Obteniendo historias del cliente:', req.userId);
    const historias = await MedicalRecord.find({ cliente_id: req.userId }).sort({ fecha: -1 });
    console.log(`✅ Encontradas ${historias.length} historias`);
    res.json({ success: true, data: historias });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PROFESIONAL: OBTENER SUS HISTORIAS ==========
router.get('/profesional/todas', auth, isProfesional, async (req, res) => {
  try {
    console.log('📋 Obteniendo historias del profesional:', req.userId);
    const historias = await MedicalRecord.find({ profesional_id: req.userId }).sort({ fecha: -1 });
    console.log(`✅ Encontradas ${historias.length} historias`);
    res.json({ success: true, data: historias });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== OBTENER HISTORIA POR ID ==========
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('🔍 Buscando historia por ID:', req.params.id);
    
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'ID no proporcionado' });
    }
    
    const historia = await MedicalRecord.findById(req.params.id);
    
    if (!historia) {
      return res.status(404).json({ success: false, message: 'Historia clínica no encontrada' });
    }
    
    // Verificar permisos
    const esProfesionalQueLaCreo = historia.profesional_id && historia.profesional_id.toString() === req.userId.toString();
    const esClienteDueño = historia.cliente_id.toString() === req.userId.toString();
    const esAdmin = req.user.rol === 'admin';
    
    if (!esProfesionalQueLaCreo && !esClienteDueño && !esAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para ver esta historia clínica' 
      });
    }
    
    console.log('✅ Historia encontrada:', historia.hc_numero);
    res.json({ success: true, data: historia });
  } catch (error) {
    console.error('❌ Error al obtener historia:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ADMIN: OBTENER TODAS LAS HISTORIAS ==========
router.get('/admin/todas', auth, isAdmin, async (req, res) => {
  try {
    const historias = await MedicalRecord.find({})
      .sort({ fecha: -1 })
      .populate('profesional_id', 'nombre email')
      .populate('cliente_id', 'nombre email');
    res.json({ success: true, data: historias });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;