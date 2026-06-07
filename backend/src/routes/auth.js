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
    const user = new User({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      rol: rol || 'cliente',
      especialidad: rol === 'profesional' ? especialidad : undefined
    });
    
    await user.save();
    console.log('✅ Usuario guardado:', user.email);
    
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor inicia sesión.',
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
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
    
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    console.log('✅ Usuario encontrado:', user.email);
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 ¿Contraseña válida?', isMatch);
    
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta para:', user.email);
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    // Crear token
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

module.exports = router;