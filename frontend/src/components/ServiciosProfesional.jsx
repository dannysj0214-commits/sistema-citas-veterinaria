import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaStethoscope, FaDollarSign, FaClock, FaLightbulb } from 'react-icons/fa';
import axios from 'axios';

// FORZAR URL DEL BACKEND EN LOCALHOST
const API_URL = 'http://localhost:5000/api';

// Servicios sugeridos predefinidos
const SERVICIOS_SUGERIDOS = [
  { nombre: 'Consulta General', duracion: 90, precio: 50000, descripcion: 'Revisión médica general, examen físico completo' },
  { nombre: 'Vacunación', duracion: 90, precio: 80000, descripcion: 'Aplicación de vacunas según esquema' },
  { nombre: 'Desparasitación', duracion: 90, precio: 35000, descripcion: 'Desparasitación interna y externa' },
  { nombre: 'Cirugía Menor', duracion: 90, precio: 200000, descripcion: 'Cirugías ambulatorias menores' },
  { nombre: 'Cirugía Mayor', duracion: 90, precio: 450000, descripcion: 'Cirugías que requieren hospitalización' },
  { nombre: 'Consulta Especializada', duracion: 90, precio: 120000, descripcion: 'Consulta con especialista' },
  { nombre: 'Urgencias 24h', duracion: 90, precio: 150000, descripcion: 'Atención de urgencias veterinarias' },
  { nombre: 'Hospitalización', duracion: 90, precio: 180000, descripcion: 'Hospitalización por día' },
  { nombre: 'Baño y Corte', duracion: 90, precio: 60000, descripcion: 'Baño medicinal, corte de uñas, limpieza' },
  { nombre: 'Odontología', duracion: 90, precio: 120000, descripcion: 'Limpieza dental, extracciones' }
];

const ServiciosProfesional = ({ profesionalId, token }) => {
  const [servicios, setServicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    duracion: 90,
    precio: 0,
    descripcion: ''
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔵 Cargando servicios desde:', `${API_URL}/services/mis-servicios`);
      const response = await axios.get(`${API_URL}/services/mis-servicios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Servicios cargados:', response.data);
      setServicios(response.data.data || []);
    } catch (error) {
      console.error('❌ Error cargando servicios:', error);
      setError('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (servicio = null) => {
    if (servicio) {
      setEditMode(true);
      setSelectedServicio(servicio);
      setFormData({
        nombre: servicio.nombre,
        duracion: servicio.duracion,
        precio: servicio.precio,
        descripcion: servicio.descripcion || ''
      });
    } else {
      setEditMode(false);
      setSelectedServicio(null);
      setFormData({
        nombre: '',
        duracion: 90,
        precio: 0,
        descripcion: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let response;
      if (editMode) {
        response = await axios.put(`${API_URL}/services/${selectedServicio._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post(`${API_URL}/services`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        setSuccess(editMode ? 'Servicio actualizado' : 'Servicio creado');
        cargarServicios();
        setShowModal(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error guardando servicio:', error);
      setError(error.response?.data?.message || 'Error al guardar el servicio');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await axios.delete(`${API_URL}/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Servicio eliminado correctamente');
        cargarServicios();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        setError('Error al eliminar el servicio');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const aplicarServicioSugerido = (sugerido) => {
    setFormData({
      nombre: sugerido.nombre,
      duracion: sugerido.duracion,
      precio: sugerido.precio,
      descripcion: sugerido.descripcion
    });
    setShowModal(true);
  };

  return (
    <Card className="shadow-sm" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333' }}>
      <Card.Header style={{ backgroundColor: '#1a1a1a', color: '#d4a017', borderBottom: '1px solid #333' }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FaStethoscope className="me-2" />Mis Servicios</h5>
          <Button variant="primary" size="sm" onClick={() => handleOpenModal()} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            <FaPlus className="me-1" /> Agregar Servicio
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="table-responsive">
          <Table variant="dark" striped bordered hover>
            <thead>
              <tr>
                <th style={{ color: '#d4a017' }}>Servicio</th>
                <th style={{ color: '#d4a017' }}>Duración</th>
                <th style={{ color: '#d4a017' }}>Precio</th>
                <th style={{ color: '#d4a017' }}>Descripción</th>
                <th style={{ color: '#d4a017' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ color: '#fff' }}>No hay servicios registrados</td>
                </tr>
              ) : (
                servicios.map(servicio => (
                  <tr key={servicio._id}>
                    <td style={{ color: '#fff' }}><strong>{servicio.nombre}</strong></td>
                    <td>
                      <Badge bg="info">
                        <FaClock className="me-1" /> {servicio.duracion} min
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="success">
                        <FaDollarSign className="me-1" /> ${servicio.precio.toLocaleString()}
                      </Badge>
                    </td>
                    <td style={{ color: '#fff' }}>{servicio.descripcion || '-'}</td>
                    <td>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenModal(servicio)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(servicio._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Servicios Sugeridos */}
        <div className="mt-4">
          <h6 className="text-muted mb-3">
            <FaLightbulb className="me-2 text-warning" />
            Servicios Sugeridos (click para agregar rápido)
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {SERVICIOS_SUGERIDOS.map((sug, idx) => (
              <Button
                key={idx}
                variant="outline-secondary"
                size="sm"
                onClick={() => aplicarServicioSugerido(sug)}
                title={sug.descripcion}
                style={{ borderColor: '#d4a017', color: '#d4a017' }}
              >
                {sug.nombre} - ${sug.precio.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </Card.Body>

      {/* Modal para agregar/editar servicio */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Servicio' : 'Agregar Servicio'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Servicio *</Form.Label>
              <Form.Control
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Consulta General, Vacunación, etc."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duración (minutos) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) })}
                    min={15}
                    step={15}
                  />
                  <Form.Text className="text-muted">
                    La duración base por cita es 90 minutos
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) })}
                    min={0}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción detallada del servicio..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            {loading ? 'Guardando...' : 'Guardar Servicio'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ServiciosProfesional;