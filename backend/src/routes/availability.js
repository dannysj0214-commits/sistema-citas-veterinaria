const express = require('express');
const router = express.Router();
const { auth, isProfesional } = require('../middleware/auth');
const Availability = require('../models/Availability');

router.get('/mis-horarios', auth, isProfesional, async (req, res) => {
  const horarios = await Availability.find({ id_profesional: req.userId });
  res.json({ success: true, data: horarios });
});

router.post('/', auth, isProfesional, async (req, res) => {
  const { dia_semana, hora_inicio, hora_fin } = req.body;
  let horario = await Availability.findOne({ id_profesional: req.userId, dia_semana });
  if (horario) {
    horario.hora_inicio = hora_inicio;
    horario.hora_fin = hora_fin;
  } else {
    horario = new Availability({ dia_semana, hora_inicio, hora_fin, id_profesional: req.userId });
  }
  await horario.save();
  res.json({ success: true, message: 'Horario guardado' });
});

router.delete('/:id', auth, isProfesional, async (req, res) => {
  await Availability.findOneAndDelete({ _id: req.params.id, id_profesional: req.userId });
  res.json({ success: true, message: 'Horario eliminado' });
});

module.exports = router;