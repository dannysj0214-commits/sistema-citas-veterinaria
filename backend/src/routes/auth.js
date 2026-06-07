const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// ========== REGISTRO DE USUARIO ==========
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registro - Datos recibidos:', req.body);
    
    const { nombre, email, password, telefono, rol, especialidad } = req.body;
    
    // Validaciones
    if (!nombre || !email || !password || !telefono) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Contraseña encriptada correctamente');
    
    // Crear usuario
    const userData = {
      nombre,
      email,
      password: hashedPassword,
      telefono,
      rol: rol || 'cliente'
    };
    
    if (rol === 'profesional' && especialidad) {
      userData.especialidad = especialidad;
    }
    
    const user = new User(userData);
    await user.save();
    console.log('✅ Usuario guardado:', user.email);
    
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor inicia sesión.'
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== INICIO DE SESIÓN ==========
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login - Email:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    console.log('✅ Usuario encontrado:', user.email);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 ¿Contraseña válida?', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'mi_secreto_super_seguro',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login exitoso para:', user.email);
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== OBTENER PERFIL ==========
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== LISTAR PROFESIONALES ==========
router.get('/profesionales', async (req, res) => {
  try {
    const profesionales = await User.find({ rol: 'profesional', disponible: true })
      .select('nombre email especialidad telefono');
    res.json({ success: true, data: profesionales });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ACTUALIZAR PERFIL ==========
router.put('/profile', auth, async (req, res) => {
  try {
    const { nombre, telefono } = req.body;
    const user = await User.findById(req.userId);
    
    if (nombre) user.nombre = nombre;
    if (telefono) user.telefono = telefono;
    
    await user.save();
    res.json({ success: true, message: 'Perfil actualizado', data: user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;