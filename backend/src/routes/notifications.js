const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// ========== OBTENER MIS NOTIFICACIONES ==========
router.get('/', auth, async (req, res) => {
  try {
    const notificaciones = await Notification.find({ id_usuario: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notificaciones });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== MARCAR COMO LEÍDA ==========
router.put('/:id/leer', auth, async (req, res) => {
  try {
    const notificacion = await Notification.findOne({
      _id: req.params.id,
      id_usuario: req.userId
    });
    
    if (!notificacion) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    
    notificacion.leido = true;
    await notificacion.save();
    
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== MARCAR TODAS COMO LEÍDAS ==========
router.put('/leer-todas', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { id_usuario: req.userId, leido: false },
      { leido: true }
    );
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CONTAR NO LEÍDAS ==========
router.get('/no-leidas/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      id_usuario: req.userId,
      leido: false
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;