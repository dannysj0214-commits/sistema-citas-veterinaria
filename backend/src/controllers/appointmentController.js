const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Availability = require('../models/Availability');
const moment = require('moment');
const { crearNotificacion } = require('./notificationController');

const createAppointment = async (req, res) => {
  const { profesional, servicio, fecha, hora, notas } = req.body;

  try {
    const profesionalExistente = await User.findOne({ _id: profesional, rol: 'profesional', disponible: true });
    
    if (!profesionalExistente) {
      return res.status(404).json({ error: 'Profesional no encontrado o no disponible' });
    }

    const duracionCita = profesionalExistente.horario_atencion?.duracion_cita || 90;
    const fechaCita = new Date(`${fecha}T${hora}:00`);
    
    if (fechaCita < new Date()) {
      return res.status(400).json({ error: 'No se pueden agendar citas en fechas pasadas' });
    }

    const horaInicioCita = moment(hora, 'HH:mm');
    const horaFinCita = moment(hora, 'HH:mm').add(duracionCita, 'minutes');

    const citasExistentes = await Appointment.find({
      profesional,
      fecha: {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1))
      },
      estado: { $nin: ['cancelada'] }
    });

    let hayConflicto = false;
    for (const citaExistente of citasExistentes) {
      const inicioExistente = moment(citaExistente.hora, 'HH:mm');
      const finExistente = moment(citaExistente.hora, 'HH:mm').add(citaExistente.duracion || duracionCita, 'minutes');
      
      if (horaInicioCita.isBetween(inicioExistente, finExistente, null, '[)') ||
          horaFinCita.isBetween(inicioExistente, finExistente, null, '(]') ||
          inicioExistente.isBetween(horaInicioCita, horaFinCita, null, '[)')) {
        hayConflicto = true;
        break;
      }
    }

    if (hayConflicto) {
      return res.status(400).json({ error: 'El profesional ya tiene una cita en ese horario' });
    }

    const appointment = await Appointment.create({
      cliente: req.user.id,
      profesional,
      servicio,
      fecha: new Date(fecha),
      hora,
      duracion: duracionCita,
      notas,
      estado: 'pendiente'
    });

    await crearNotificacion(
      profesional,
      'cita_creada',
      'Nueva solicitud de cita',
      `${req.user.nombre} ha solicitado una cita para el ${fecha} a las ${hora}`,
      `/profesional/dashboard`
    );

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProfesionalAppointments = async (req, res) => {
  const { estado, fecha_inicio, fecha_fin } = req.query;

  try {
    let query = { profesional: req.user.id };
    if (estado && estado !== 'todos') query.estado = estado;
    if (fecha_inicio && fecha_fin) {
      query.fecha = { $gte: new Date(fecha_inicio), $lte: new Date(fecha_fin) };
    }

    const appointments = await Appointment.find(query)
      .populate('cliente', 'nombre email telefono')
      .sort({ fecha: 1, hora: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ cliente: req.user.id })
      .populate('profesional', 'nombre email especialidad telefono')
      .sort({ fecha: -1, hora: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error obteniendo citas del cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('cliente', 'nombre email telefono')
      .populate('profesional', 'nombre email especialidad telefono');

    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    if (appointment.cliente._id.toString() !== req.user.id && 
        appointment.profesional._id.toString() !== req.user.id &&
        req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver esta cita' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { estado, notas } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    if (appointment.profesional.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
    }

    appointment.estado = estado;
    if (notas) appointment.notas = notas;
    appointment.fecha_actualizacion = Date.now();
    await appointment.save();

    let tipoNotificacion = 'cita_aceptada';
    let titulo = 'Cita aceptada';
    let mensaje = `Tu cita del ${appointment.fecha.toLocaleDateString()} a las ${appointment.hora} ha sido aceptada`;
    
    if (estado === 'completada') {
      tipoNotificacion = 'cita_completada';
      titulo = 'Cita completada';
      mensaje = `Tu cita ha sido marcada como completada`;
    } else if (estado === 'cancelada') {
      tipoNotificacion = 'cita_rechazada';
      titulo = 'Cita cancelada';
      mensaje = `Tu cita ha sido cancelada`;
    }

    await crearNotificacion(appointment.cliente, tipoNotificacion, titulo, mensaje, '/mis-citas');

    res.json({ success: true, message: `Cita ${estado} correctamente`, appointment });
  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    if (appointment.cliente.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta cita' });
    }

    if (appointment.estado === 'cancelada') {
      return res.status(400).json({ error: 'La cita ya está cancelada' });
    }

    appointment.estado = 'cancelada';
    appointment.fecha_actualizacion = Date.now();
    await appointment.save();

    await crearNotificacion(
      appointment.profesional,
      'cita_rechazada',
      'Cita cancelada por el cliente',
      `${req.user.nombre} ha cancelado la cita del ${appointment.fecha.toLocaleDateString()} a las ${appointment.hora}`,
      '/profesional/dashboard'
    );

    res.json({ success: true, message: 'Cita cancelada exitosamente', appointment });
  } catch (error) {
    console.error('Error cancelando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAvailableSlots = async (req, res) => {
  const { profesionalId } = req.params;
  const { fecha } = req.query;

  try {
    const profesional = await User.findOne({ _id: profesionalId, rol: 'profesional' });
    if (!profesional) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const diaSemana = new Date(fecha).getDay();
    
    const availability = await Availability.findOne({
      profesional: profesionalId,
      dia_semana: diaSemana,
      disponible: true
    });

    if (!availability) {
      return res.json({ disponibles: [], mensaje: 'No hay horarios disponibles para este día' });
    }

    const duracionCita = profesional.horario_atencion?.duracion_cita || 90;
    
    const slots = [];
    let horaInicio = moment(availability.hora_inicio, 'HH:mm');
    const horaFin = moment(availability.hora_fin, 'HH:mm');

    const citasExistentes = await Appointment.find({
      profesional: profesionalId,
      fecha: {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1))
      },
      estado: { $nin: ['cancelada'] }
    });

    const horariosOcupados = [];
    citasExistentes.forEach(cita => {
      const inicioOcupado = moment(cita.hora, 'HH:mm');
      const finOcupado = moment(cita.hora, 'HH:mm').add(cita.duracion || duracionCita, 'minutes');
      let tiempo = inicioOcupado.clone();
      while (tiempo.isBefore(finOcupado)) {
        horariosOcupados.push(tiempo.format('HH:mm'));
        tiempo.add(30, 'minutes');
      }
    });

    while (horaInicio.clone().add(duracionCita, 'minutes').isSameOrBefore(horaFin)) {
      const horaSlot = horaInicio.format('HH:mm');
      
      let estaOcupado = false;
      for (let i = 0; i < duracionCita; i += 30) {
        const tiempoSlot = moment(horaInicio).add(i, 'minutes').format('HH:mm');
        if (horariosOcupados.includes(tiempoSlot)) {
          estaOcupado = true;
          break;
        }
      }
      
      if (!estaOcupado) {
        slots.push(horaSlot);
      }
      
      horaInicio.add(duracionCita, 'minutes');
    }

    res.json({
      profesional: {
        id: profesional._id,
        nombre: profesional.nombre,
        especialidad: profesional.especialidad,
        duracion_cita: duracionCita
      },
      fecha,
      slots_disponibles: slots
    });
  } catch (error) {
    console.error('Error obteniendo horarios disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createAppointment,
  getProfesionalAppointments,
  getClientAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots
};