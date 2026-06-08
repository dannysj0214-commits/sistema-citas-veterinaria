const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta_local');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new Error();
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Por favor, autentícate' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};

const isProfesional = (req, res, next) => {
  if (req.user.rol !== 'profesional' && req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};

const isCliente = (req, res, next) => {
  if (req.user.rol !== 'cliente' && req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};

module.exports = { auth, isAdmin, isProfesional, isCliente };