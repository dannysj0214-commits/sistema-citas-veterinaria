const Notification = require('../models/Notification');

// Obtener notificaciones del usuario
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ usuario: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const noLeidas = await Notification.countDocuments({ usuario: req.user.id, leido: false });
    
    res.json({ notifications, noLeidas });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, usuario: req.user.id },
      { leido: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

// Marcar todas como leídas
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { usuario: req.user.id, leido: false },
      { leido: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
};

// Crear notificación (helper)
const crearNotificacion = async (usuarioId, tipo, titulo, mensaje, link = '') => {
  try {
    const notification = new Notification({
      usuario: usuarioId,
      tipo,
      titulo,
      mensaje,
      link,
      leido: false,
      createdAt: new Date()
    });
    await notification.save();
    console.log(`✅ Notificación creada para usuario ${usuarioId}: ${titulo}`);
    return notification;
  } catch (error) {
    console.error('Error creando notificación:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  crearNotificacion
};