const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ========== LISTAR TODOS LOS USUARIOS ==========
router.get('/usuarios', auth, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== OBTENER UN USUARIO POR ID ==========
router.get('/usuarios/:id', auth, isAdmin, async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CREAR NUEVO USUARIO ==========
router.post('/usuarios', auth, isAdmin, async (req, res) => {
  try {
    const { nombre, email, password, telefono, rol, especialidad } = req.body;
    
    // Validaciones
    if (!nombre || !email || !password || !telefono || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    
    // Verificar si ya existe
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const nuevoUsuario = new User({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      rol,
      especialidad: rol === 'profesional' ? especialidad : undefined
    });
    
    await nuevoUsuario.save();
    
    // No enviar la contraseña en la respuesta
    const usuarioResponse = nuevoUsuario.toObject();
    delete usuarioResponse.password;
    
    res.json({ success: true, message: 'Usuario creado correctamente', data: usuarioResponse });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== EDITAR USUARIO ==========
router.put('/usuarios/:id', auth, isAdmin, async (req, res) => {
  try {
    console.log('🔵 PUT /usuarios/:id - Recibiendo petición');
    console.log('📝 ID:', req.params.id);
    console.log('📦 Body:', req.body);
    
    const { nombre, email, telefono, rol, especialidad } = req.body;
    
    // Buscar usuario
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Verificar si el email ya existe en otro usuario
    if (email && email !== usuario.email) {
      const emailExiste = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExiste) {
        return res.status(400).json({ success: false, message: 'El email ya está en uso por otro usuario' });
      }
    }
    
    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (telefono) usuario.telefono = telefono;
    if (rol) usuario.rol = rol;
    if (especialidad) usuario.especialidad = especialidad;
    
    await usuario.save();
    
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;
    
    console.log('✅ Usuario actualizado:', usuarioResponse);
    res.json({ success: true, message: 'Usuario actualizado correctamente', data: usuarioResponse });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ELIMINAR USUARIO ==========
router.delete('/usuarios/:id', auth, isAdmin, async (req, res) => {
  try {
    console.log('🔵 DELETE /usuarios/:id - Recibiendo petición');
    console.log('📝 ID:', req.params.id);
    
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // No permitir eliminar al administrador principal
    if (usuario.email === 'admin@test.com') {
      return res.status(400).json({ success: false, message: 'No se puede eliminar al administrador principal' });
    }
    
    // No permitir eliminarse a sí mismo
    if (usuario._id.toString() === req.userId.toString()) {
      return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo' });
    }
    
    await usuario.deleteOne();
    console.log('✅ Usuario eliminado:', usuario.email);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ESTADÍSTICAS PARA ADMIN ==========
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalClientes = await User.countDocuments({ rol: 'cliente' });
    const totalProfesionales = await User.countDocuments({ rol: 'profesional' });
    const totalUsuarios = await User.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalClientes,
        totalProfesionales,
        totalUsuarios
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;