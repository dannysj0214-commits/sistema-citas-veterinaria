const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.get('/usuarios', auth, isAdmin, async (req, res) => {
  const usuarios = await User.find({}).select('-password');
  res.json({ success: true, data: usuarios });
});

router.post('/usuarios', auth, isAdmin, async (req, res) => {
  const { nombre, email, password, telefono, rol, especialidad } = req.body;
  const existe = await User.findOne({ email });
  if (existe) return res.status(400).json({ success: false, message: 'Email ya registrado' });
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const usuario = new User({ nombre, email, password: hashedPassword, telefono, rol, especialidad: rol === 'profesional' ? especialidad : undefined });
  await usuario.save();
  
  res.json({ success: true, message: 'Usuario creado' });
});

router.put('/usuarios/:id', auth, isAdmin, async (req, res) => {
  const { nombre, email, telefono, rol, especialidad } = req.body;
  const usuario = await User.findById(req.params.id);
  if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  
  if (nombre) usuario.nombre = nombre;
  if (email) usuario.email = email;
  if (telefono) usuario.telefono = telefono;
  if (rol) usuario.rol = rol;
  if (especialidad) usuario.especialidad = especialidad;
  
  await usuario.save();
  res.json({ success: true, message: 'Usuario actualizado' });
});

router.delete('/usuarios/:id', auth, isAdmin, async (req, res) => {
  const usuario = await User.findById(req.params.id);
  if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  if (usuario.email === 'admin@vet.com') return res.status(400).json({ success: false, message: 'No se puede eliminar al admin principal' });
  
  await usuario.deleteOne();
  res.json({ success: true, message: 'Usuario eliminado' });
});

module.exports = router;