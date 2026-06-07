const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Availability = require('../models/Availability');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Por favor, autentícate' });
  }
};

const isCliente = (req, res, next) => {
  if (req.user.rol !== 'cliente' && req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren permisos de cliente' });
  }
  next();
};

const isProfesional = (req, res, next) => {
  if (req.user.rol !== 'profesional' && req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren permisos de profesional' });
  }
  next();
};

// ========== CLIENTE: CREAR CITA ==========
router.post('/', auth, isCliente, async (req, res) => {
  try {
    const { fecha, hora, motivo, servicio, id_profesional, notas } = req.body;
    
    // Validar que el profesional existe
    const profesional = await User.findOne({ _id: id_profesional, rol: 'profesional' });
    if (!profesional) {
      return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
    }
    
    // Verificar que la cita no esté ocupada
    const citaExistente = await Appointment.findOne({
      id_profesional,
      fecha,
      hora,
      estado: { $nin: ['cancelada', 'rechazada'] }
    });
    
    if (citaExistente) {
      return res.status(400).json({ success: false, message: 'El horario no está disponible' });
    }
    
    // Crear cita
    const appointment = new Appointment({
      fecha,
      hora,
      motivo,
      servicio,
      notas: notas || '',
      id_cliente: req.userId,
      id_profesional,
      estado: 'pendiente'
    });
    
    await appointment.save();
    
    // Crear notificación para el profesional
    const notification = new Notification({
      tipo: 'cita',
      titulo: 'Nueva cita solicitada',
      mensaje: `El cliente ${req.user.nombre} ha solicitado una cita para ${fecha} a las ${hora}`,
      id_usuario: id_profesional,
      link: `/mis-citas`
    });
    await notification.save();
    
    res.json({ success: true, message: 'Cita creada exitosamente', data: appointment });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CLIENTE: OBTENER MIS CITAS ==========
router.get('/cliente', auth, isCliente, async (req, res) => {
  try {
    const citas = await Appointment.find({ id_cliente: req.userId })
      .populate('id_profesional', 'nombre email especialidad')
      .sort({ fecha: -1, hora: -1 });
    res.json({ success: true, data: citas });
  } catch (error) {
    console.error('Error al obtener citas del cliente:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PROFESIONAL: OBTENER MIS CITAS ==========
router.get('/profesional', auth, isProfesional, async (req, res) => {
  try {
    const citas = await Appointment.find({ id_profesional: req.userId })
      .populate('id_cliente', 'nombre email telefono')
      .sort({ fecha: -1, hora: -1 });
    res.json({ success: true, data: citas });
  } catch (error) {
    console.error('Error al obtener citas del profesional:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PROFESIONAL: ACTUALIZAR ESTADO DE CITA ==========
router.put('/:id/estado', auth, isProfesional, async (req, res) => {
  try {
    const { estado } = req.body;
    const cita = await Appointment.findById(req.params.id);
    
    if (!cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    
    if (cita.id_profesional.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta cita' });
    }
    
    cita.estado = estado;
    await cita.save();
    
    // Crear notificación para el cliente
    const mensajeEstado = estado === 'confirmada' ? 'confirmada' : estado === 'rechazada' ? 'rechazada' : 'actualizada';
    const notification = new Notification({
      tipo: 'cita',
      titulo: `Cita ${mensajeEstado}`,
      mensaje: `Tu cita del ${cita.fecha} a las ${cita.hora} ha sido ${mensajeEstado}`,
      id_usuario: cita.id_cliente,
      link: `/mis-citas`
    });
    await notification.save();
    
    res.json({ success: true, message: `Cita ${estado} correctamente`, data: cita });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CLIENTE: CANCELAR CITA ==========
router.delete('/:id', auth, isCliente, async (req, res) => {
  try {
    const cita = await Appointment.findById(req.params.id);
    
    if (!cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    
    if (cita.id_cliente.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para cancelar esta cita' });
    }
    
    if (cita.estado === 'completada') {
      return res.status(400).json({ success: false, message: 'No se puede cancelar una cita ya completada' });
    }
    
    cita.estado = 'cancelada';
    await cita.save();
    
    // Notificar al profesional
    const notification = new Notification({
      tipo: 'cita',
      titulo: 'Cita cancelada',
      mensaje: `El cliente ha cancelado la cita del ${cita.fecha} a las ${cita.hora}`,
      id_usuario: cita.id_profesional,
      link: `/mis-citas`
    });
    await notification.save();
    
    res.json({ success: true, message: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== OBTENER HORARIOS DISPONIBLES CON INTERVALOS DE 90 MINUTOS ==========
router.get('/disponibles/:profesionalId', auth, async (req, res) => {
  try {
    const { profesionalId } = req.params;
    const { fecha } = req.query;
    
    if (!fecha) {
      return res.json({ success: true, data: [] });
    }
    
    // Obtener horarios del profesional para ese día
    const diaSemana = new Date(fecha).getDay();
    // Convertir día de JS (0=Domingo) a nuestro formato (1=Lunes)
    let diaParaBuscar = diaSemana === 0 ? 6 : diaSemana - 1;
    
    const horario = await Availability.findOne({
      id_profesional: profesionalId,
      dia_semana: diaParaBuscar,
      disponible: true
    });
    
    if (!horario) {
      return res.json({ success: true, data: [] });
    }
    
    // Generar slots de 90 minutos
    const horasDisponibles = [];
    const DURACION_CITA = 90; // minutos
    
    // Convertir horas a minutos para facilitar el cálculo
    const [horaInicio, minInicio] = horario.hora_inicio.split(':').map(Number);
    const [horaFin, minFin] = horario.hora_fin.split(':').map(Number);
    
    let inicioMinutos = horaInicio * 60 + minInicio;
    const finMinutos = horaFin * 60 + minFin;
    
    // Obtener citas ya agendadas para esa fecha
    const citasAgendadas = await Appointment.find({
      id_profesional: profesionalId,
      fecha: fecha,
      estado: { $nin: ['cancelada', 'rechazada'] }
    });
    
    const horasOcupadas = new Set(citasAgendadas.map(c => c.hora));
    
    // Generar slots cada 90 minutos
    while (inicioMinutos + DURACION_CITA <= finMinutos) {
      const horas = Math.floor(inicioMinutos / 60);
      const minutos = inicioMinutos % 60;
      const horaStr = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      
      if (!horasOcupadas.has(horaStr)) {
        horasDisponibles.push(horaStr);
      }
      
      inicioMinutos += DURACION_CITA;
    }
    
    res.json({ success: true, data: horasDisponibles });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;