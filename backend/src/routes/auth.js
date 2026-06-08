const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// ========== REGISTRO ==========
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, rol, especialidad } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      rol: rol || 'cliente',
      especialidad: rol === 'profesional' ? especialidad : undefined
    });
    
    await user.save();
    
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login intento - Email:', req.body.email);
    
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
    console.log('📝 Contraseña guardada en BD:', user.password);
    console.log('🔑 Contraseña ingresada:', password);
    
    let isMatch = false;
    
    // Si la contraseña guardada empieza con $2a$, es bcrypt
    if (user.password && user.password.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Comparando con bcrypt');
    } else {
      // Si es texto plano, comparar directamente
      isMatch = (password === user.password);
      console.log('🔐 Comparando en texto plano');
    }
    
    console.log('🔐 ¿Contraseña válida?', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'mi_clave_secreta_local',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login exitoso para:', user.email);
    
    res.json({
      success: true,
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

// ========== PERFIL ==========
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json({ success: true, data: user });
});

// ========== PROFESIONALES ==========
router.get('/profesionales', async (req, res) => {
  const profesionales = await User.find({ rol: 'profesional', disponible: true })
    .select('nombre email especialidad');
  res.json({ success: true, data: profesionales });
});

module.exports = router;