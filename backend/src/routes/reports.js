const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

router.get('/stats', auth, isAdmin, async (req, res) => {
  const totalCitas = await Appointment.countDocuments();
  const citasPendientes = await Appointment.countDocuments({ estado: 'pendiente' });
  const citasCompletadas = await Appointment.countDocuments({ estado: 'completada' });
  const citasCanceladas = await Appointment.countDocuments({ estado: 'cancelada' });
  const totalClientes = await User.countDocuments({ rol: 'cliente' });
  const totalProfesionales = await User.countDocuments({ rol: 'profesional' });
  const totalHistorias = await MedicalRecord.countDocuments();
  
  res.json({ success: true, data: { citas: { total: totalCitas, pendientes: citasPendientes, completadas: citasCompletadas, canceladas: citasCanceladas }, usuarios: { clientes: totalClientes, profesionales: totalProfesionales }, historias: totalHistorias } });
});

router.get('/citas-por-estado', auth, isAdmin, async (req, res) => {
  const citasPorEstado = await Appointment.aggregate([{ $group: { _id: "$estado", count: { $sum: 1 } } }]);
  res.json({ success: true, data: citasPorEstado });
});

router.get('/citas-por-mes', auth, isAdmin, async (req, res) => {
  const citas = await Appointment.aggregate([
    { $addFields: { fechaDate: { $dateFromString: { dateString: "$fecha" } } } },
    { $group: { _id: { mes: { $month: "$fechaDate" }, año: { $year: "$fechaDate" } }, count: { $sum: 1 } } },
    { $sort: { "_id.año": 1, "_id.mes": 1 } }
  ]);
  res.json({ success: true, data: citas });
});

module.exports = router;