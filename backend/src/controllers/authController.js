const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Login de usuario
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese email y contraseña'
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    const token = generateToken(user._id);

    // Devolver todos los datos del usuario incluyendo registro_medico y titulo
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        registro_medico: user.registro_medico || 'No registrado',
        titulo: user.titulo || 'Médico Veterinario',
        especialidad: user.especialidad || 'General'
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Registro de usuario
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, role, telefono, registro_medico, titulo } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      role: role || 'cliente',
      telefono: telefono || '',
      registro_medico: registro_medico || '',
      titulo: titulo || 'Médico Veterinario'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        telefono: user.telefono,
        registro_medico: user.registro_medico,
        titulo: user.titulo
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};