const express = require('express');
const router = express.Router();
const { auth, isCliente, isProfesional } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Availability = require('../models/Availability');

router.post('/', auth, isCliente, async (req, res) => {
  try {
    const { fecha, hora, motivo, servicio, id_profesional, notas } = req.body;
    
    const profesional = await User.findOne({ _id: id_profesional, rol: 'profesional' });
    if (!profesional) {
      return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
    }
    
    const citaExistente = await Appointment.findOne({ id_profesional, fecha, hora, estado: { $nin: ['cancelada', 'rechazada'] } });
    if (citaExistente) {
      return res.status(400).json({ success: false, message: 'El horario no está disponible' });
    }
    
    const appointment = new Appointment({ fecha, hora, motivo, servicio, notas: notas || '', id_cliente: req.userId, id_profesional });
    await appointment.save();
    
    await new Notification({ tipo: 'cita', titulo: 'Nueva cita', mensaje: `${req.user.nombre} solicitó una cita`, id_usuario: id_profesional }).save();
    
    res.json({ success: true, message: 'Cita creada', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/cliente', auth, isCliente, async (req, res) => {
  const citas = await Appointment.find({ id_cliente: req.userId }).populate('id_profesional', 'nombre especialidad').sort({ fecha: -1 });
  res.json({ success: true, data: citas });
});

router.get('/profesional', auth, isProfesional, async (req, res) => {
  const citas = await Appointment.find({ id_profesional: req.userId }).populate('id_cliente', 'nombre telefono').sort({ fecha: -1 });
  res.json({ success: true, data: citas });
});

router.put('/:id/estado', auth, isProfesional, async (req, res) => {
  const { estado } = req.body;
  const cita = await Appointment.findById(req.params.id);
  if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
  
  cita.estado = estado;
  await cita.save();
  
  await new Notification({ tipo: 'cita', titulo: `Cita ${estado}`, mensaje: `Tu cita ha sido ${estado}`, id_usuario: cita.id_cliente }).save();
  
  res.json({ success: true, message: `Cita ${estado}` });
});

router.delete('/:id', auth, isCliente, async (req, res) => {
  const cita = await Appointment.findById(req.params.id);
  if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
  if (cita.estado === 'completada') return res.status(400).json({ success: false, message: 'No se puede cancelar una cita completada' });
  
  cita.estado = 'cancelada';
  await cita.save();
  
  res.json({ success: true, message: 'Cita cancelada' });
});

router.get('/disponibles/:profesionalId', auth, async (req, res) => {
  const { profesionalId } = req.params;
  const { fecha } = req.query;
  
  const diaSemana = new Date(fecha).getDay();
  const horario = await Availability.findOne({ id_profesional: profesionalId, dia_semana: diaSemana });
  if (!horario) return res.json({ success: true, data: [] });
  
  const horasDisponibles = [];
  let [horaInicio, minInicio] = horario.hora_inicio.split(':').map(Number);
  const [horaFin, minFin] = horario.hora_fin.split(':').map(Number);
  
  let inicioMinutos = horaInicio * 60 + minInicio;
  const finMinutos = horaFin * 60 + minFin;
  
  const citasAgendadas = await Appointment.find({ id_profesional: profesionalId, fecha, estado: { $nin: ['cancelada', 'rechazada'] } });
  const horasOcupadas = new Set(citasAgendadas.map(c => c.hora));
  
  while (inicioMinutos + 90 <= finMinutos) {
    const horas = Math.floor(inicioMinutos / 60);
    const minutos = inicioMinutos % 60;
    const horaStr = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    if (!horasOcupadas.has(horaStr)) horasDisponibles.push(horaStr);
    inicioMinutos += 90;
  }
  
  res.json({ success: true, data: horasDisponibles });
});

module.exports = router;