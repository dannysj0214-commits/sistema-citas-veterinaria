const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.get('/', auth, async (req, res) => {
  const notificaciones = await Notification.find({ id_usuario: req.userId }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notificaciones });
});

router.put('/:id/leer', auth, async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, id_usuario: req.userId }, { leido: true });
  res.json({ success: true, message: 'Notificación leída' });
});

module.exports = router;