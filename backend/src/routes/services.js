const express = require('express');
const router = express.Router();
const { auth, isProfesional, isAdmin } = require('../middleware/auth');
const Service = require('../models/Service');

// ========== OBTENER SERVICIOS DE UN PROFESIONAL ==========
router.get('/profesional/:id', async (req, res) => {
  try {
    const servicios = await Service.find({
      id_profesional: req.params.id,
      disponible: true
    });
    res.json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== OBTENER MIS SERVICIOS ==========
router.get('/mis-servicios', auth, isProfesional, async (req, res) => {
  try {
    const servicios = await Service.find({ id_profesional: req.userId });
    res.json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CREAR SERVICIO ==========
router.post('/', auth, isProfesional, async (req, res) => {
  try {
    const { nombre, duracion, precio, descripcion } = req.body;
    
    const servicio = new Service({
      nombre,
      duracion: duracion || 30,
      precio,
      descripcion: descripcion || '',
      id_profesional: req.userId,
      disponible: true
    });
    
    await servicio.save();
    res.json({ success: true, message: 'Servicio creado', data: servicio });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ACTUALIZAR SERVICIO ==========
router.put('/:id', auth, isProfesional, async (req, res) => {
  try {
    const servicio = await Service.findOne({
      _id: req.params.id,
      id_profesional: req.userId
    });
    
    if (!servicio) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }
    
    const { nombre, duracion, precio, descripcion, disponible } = req.body;
    if (nombre) servicio.nombre = nombre;
    if (duracion) servicio.duracion = duracion;
    if (precio) servicio.precio = precio;
    if (descripcion) servicio.descripcion = descripcion;
    if (disponible !== undefined) servicio.disponible = disponible;
    
    await servicio.save();
    res.json({ success: true, message: 'Servicio actualizado', data: servicio });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ELIMINAR SERVICIO ==========
router.delete('/:id', auth, isProfesional, async (req, res) => {
  try {
    const servicio = await Service.findOne({
      _id: req.params.id,
      id_profesional: req.userId
    });
    
    if (!servicio) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }
    
    await servicio.deleteOne();
    res.json({ success: true, message: 'Servicio eliminado' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;