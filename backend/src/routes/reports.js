const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

// ========== ESTADÍSTICAS GENERALES ==========
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalCitas = await Appointment.countDocuments();
    const citasPendientes = await Appointment.countDocuments({ estado: 'pendiente' });
    const citasCompletadas = await Appointment.countDocuments({ estado: 'completada' });
    const citasCanceladas = await Appointment.countDocuments({ estado: 'cancelada' });
    
    const totalClientes = await User.countDocuments({ rol: 'cliente' });
    const totalProfesionales = await User.countDocuments({ rol: 'profesional' });
    
    const totalHistorias = await MedicalRecord.countDocuments();
    
    res.json({
      success: true,
      data: {
        citas: {
          total: totalCitas,
          pendientes: citasPendientes,
          completadas: citasCompletadas,
          canceladas: citasCanceladas
        },
        usuarios: {
          clientes: totalClientes,
          profesionales: totalProfesionales
        },
        historias: totalHistorias
      }
    });
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CITAS POR MES ==========
router.get('/citas-por-mes', auth, isAdmin, async (req, res) => {
  try {
    const citas = await Appointment.aggregate([
      {
        $addFields: {
          fechaDate: { $dateFromString: { dateString: "$fecha" } }
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: "$fechaDate" },
            año: { $year: "$fechaDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.año": 1, "_id.mes": 1 } }
    ]);
    
    res.json({ success: true, data: citas });
  } catch (error) {
    console.error('Error en citas por mes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CITAS POR ESTADO ==========
router.get('/citas-por-estado', auth, isAdmin, async (req, res) => {
  try {
    const citasPorEstado = await Appointment.aggregate([
      {
        $group: {
          _id: "$estado",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ success: true, data: citasPorEstado });
  } catch (error) {
    console.error('Error en citas por estado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== TOP PROFESIONALES ==========
router.get('/top-profesionales', auth, isAdmin, async (req, res) => {
  try {
    const topProfesionales = await Appointment.aggregate([
      {
        $match: { estado: 'completada' }
      },
      {
        $group: {
          _id: "$id_profesional",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'profesional'
        }
      },
      { $unwind: "$profesional" },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          nombre: "$profesional.nombre",
          especialidad: "$profesional.especialidad",
          citas: "$count"
        }
      }
    ]);
    
    res.json({ success: true, data: topProfesionales });
  } catch (error) {
    console.error('Error en top profesionales:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== EXPORTAR DATOS A JSON ==========
router.get('/exportar', auth, isAdmin, async (req, res) => {
  try {
    const citas = await Appointment.find({})
      .populate('id_cliente', 'nombre email')
      .populate('id_profesional', 'nombre email especialidad');
    
    const usuarios = await User.find({}).select('-password');
    const historias = await MedicalRecord.find({});
    
    const exportData = {
      fechaExportacion: new Date(),
      resumen: {
        totalCitas: citas.length,
        totalUsuarios: usuarios.length,
        totalHistorias: historias.length
      },
      datos: {
        citas,
        usuarios,
        historiasClinicas: historias
      }
    };
    
    res.json({ success: true, data: exportData });
  } catch (error) {
    console.error('Error al exportar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;