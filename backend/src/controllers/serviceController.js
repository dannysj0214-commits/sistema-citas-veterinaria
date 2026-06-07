const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Crear un nuevo servicio
// @route   POST /api/services
// @access  Private (Profesional/Admin)
const createService = async (req, res) => {
  const { nombre, descripcion, duracion, precio } = req.body;

  try {
    const service = await Service.create({
      nombre,
      descripcion,
      duracion: duracion || 30,
      precio: precio || 0,
      profesional: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      service
    });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// @desc    Obtener servicios de un profesional
// @route   GET /api/services/profesional/:profesionalId
// @access  Public
const getServicesByProfesional = async (req, res) => {
  const { profesionalId } = req.params;

  try {
    const services = await Service.find({ 
      profesional: profesionalId,
      disponible: true 
    });

    res.json(services);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// @desc    Obtener servicios del profesional autenticado
// @route   GET /api/services/mis-servicios
// @access  Private (Profesional/Admin)
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ profesional: req.user.id });
    res.json(services);
  } catch (error) {
    console.error('Error obteniendo mis servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// @desc    Actualizar un servicio
// @route   PUT /api/services/:id
// @access  Private (Profesional/Admin)
const updateService = async (req, res) => {
  const { nombre, descripcion, duracion, precio, disponible } = req.body;

  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Verificar que el servicio pertenece al profesional
    if (service.profesional.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para modificar este servicio' });
    }

    if (nombre) service.nombre = nombre;
    if (descripcion) service.descripcion = descripcion;
    if (duracion) service.duracion = duracion;
    if (precio) service.precio = precio;
    if (disponible !== undefined) service.disponible = disponible;

    await service.save();

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      service
    });
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// @desc    Eliminar un servicio
// @route   DELETE /api/services/:id
// @access  Private (Profesional/Admin)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Verificar que el servicio pertenece al profesional
    if (service.profesional.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este servicio' });
    }

    await service.deleteOne();

    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createService,
  getServicesByProfesional,
  getMyServices,
  updateService,
  deleteService
};