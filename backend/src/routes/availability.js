const express = require('express');
const router = express.Router();
const { auth, isProfesional } = require('../middleware/auth');
const Availability = require('../models/Availability');

// ========== OBTENER HORARIOS DEL PROFESIONAL ==========
router.get('/mis-horarios', auth, isProfesional, async (req, res) => {
  try {
    const horarios = await Availability.find({ id_profesional: req.userId });
    res.json({ success: true, data: horarios });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CREAR/ACTUALIZAR HORARIO ==========
router.post('/', auth, isProfesional, async (req, res) => {
  try {
    const { dia_semana, hora_inicio, hora_fin } = req.body;
    
    // Buscar si ya existe horario para ese día
    let horario = await Availability.findOne({
      id_profesional: req.userId,
      dia_semana
    });
    
    if (horario) {
      // Actualizar existente
      horario.hora_inicio = hora_inicio;
      horario.hora_fin = hora_fin;
      horario.disponible = true;
      await horario.save();
    } else {
      // Crear nuevo
      horario = new Availability({
        dia_semana,
        hora_inicio,
        hora_fin,
        id_profesional: req.userId,
        disponible: true
      });
      await horario.save();
    }
    
    res.json({ success: true, message: 'Horario guardado', data: horario });
  } catch (error) {
    console.error('Error al guardar horario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ELIMINAR HORARIO ==========
router.delete('/:id', auth, isProfesional, async (req, res) => {
  try {
    const horario = await Availability.findOne({
      _id: req.params.id,
      id_profesional: req.userId
    });
    
    if (!horario) {
      return res.status(404).json({ success: false, message: 'Horario no encontrado' });
    }
    
    await horario.deleteOne();
    res.json({ success: true, message: 'Horario eliminado' });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== OBTENER HORARIOS DE UN PROFESIONAL (PÚBLICO) ==========
router.get('/profesional/:id', async (req, res) => {
  try {
    const horarios = await Availability.find({
      id_profesional: req.params.id,
      disponible: true
    });
    res.json({ success: true, data: horarios });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;