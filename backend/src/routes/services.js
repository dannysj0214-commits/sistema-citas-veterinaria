const express = require('express');
const router = express.Router();
const { auth, isProfesional } = require('../middleware/auth');
const Service = require('../models/Service');

router.get('/mis-servicios', auth, isProfesional, async (req, res) => {
  const servicios = await Service.find({ id_profesional: req.userId });
  res.json({ success: true, data: servicios });
});

router.get('/profesional/:id', async (req, res) => {
  const servicios = await Service.find({ id_profesional: req.params.id, disponible: true });
  res.json({ success: true, data: servicios });
});

router.post('/', auth, isProfesional, async (req, res) => {
  const { nombre, duracion, precio, descripcion } = req.body;
  const servicio = new Service({ nombre, duracion: duracion || 90, precio, descripcion: descripcion || '', id_profesional: req.userId });
  await servicio.save();
  res.json({ success: true, message: 'Servicio creado' });
});

router.put('/:id', auth, isProfesional, async (req, res) => {
  const servicio = await Service.findOne({ _id: req.params.id, id_profesional: req.userId });
  if (!servicio) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
  
  const { nombre, duracion, precio, descripcion, disponible } = req.body;
  if (nombre) servicio.nombre = nombre;
  if (duracion) servicio.duracion = duracion;
  if (precio) servicio.precio = precio;
  if (descripcion) servicio.descripcion = descripcion;
  if (disponible !== undefined) servicio.disponible = disponible;
  
  await servicio.save();
  res.json({ success: true, message: 'Servicio actualizado' });
});

router.delete('/:id', auth, isProfesional, async (req, res) => {
  await Service.findOneAndDelete({ _id: req.params.id, id_profesional: req.userId });
  res.json({ success: true, message: 'Servicio eliminado' });
});

module.exports = router;