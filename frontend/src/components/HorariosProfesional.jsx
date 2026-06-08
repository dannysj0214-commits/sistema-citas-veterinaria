import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaClock, FaCalendarWeek } from 'react-icons/fa';
import axios from 'axios';

// FORZAR URL DEL BACKEND EN LOCALHOST
const API_URL = 'http://localhost:5000/api';

const HorariosProfesional = ({ profesionalId, token }) => {
  const [horarios, setHorarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fin: '18:00'
  });

  const diasSemana = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' }
  ];

  useEffect(() => {
    cargarHorarios();
  }, []);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔵 Cargando horarios...');
      const response = await axios.get(`${API_URL}/availability/mis-horarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Horarios cargados:', response.data);
      setHorarios(response.data.data || []);
    } catch (error) {
      console.error('❌ Error cargando horarios:', error);
      setError('Error al cargar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (horario = null) => {
    if (horario) {
      setEditMode(true);
      setSelectedHorario(horario);
      setFormData({
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin
      });
    } else {
      setEditMode(false);
      setSelectedHorario(null);
      setFormData({
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fin: '18:00'
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validar datos
    if (!formData.hora_inicio || !formData.hora_fin) {
      setError('La hora de inicio y fin son requeridas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('📝 Guardando horario:', formData);
      console.log('🔑 Token:', token ? 'Presente' : 'No hay token');
      
      const response = await axios.post(`${API_URL}/availability`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Respuesta:', response.data);

      if (response.data.success) {
        setSuccess('Horario guardado correctamente');
        cargarHorarios();
        setShowModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('❌ Error guardando horario:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || 'Datos inválidos');
      } else {
        setError(error.response?.data?.message || 'Error al guardar el horario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      try {
        await axios.delete(`${API_URL}/availability/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Horario eliminado correctamente');
        cargarHorarios();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error eliminando horario:', error);
        setError('Error al eliminar el horario');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const getDiaNombre = (id) => {
    const dia = diasSemana.find(d => d.id === id);
    return dia ? dia.nombre : 'Desconocido';
  };

  return (
    <Card className="shadow-sm" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333' }}>
      <Card.Header style={{ backgroundColor: '#1a1a1a', color: '#d4a017', borderBottom: '1px solid #333' }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FaClock className="me-2" />Horarios de Atención (90 min por cita)</h5>
          <Button variant="primary" size="sm" onClick={() => handleOpenModal()} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            <FaPlus className="me-1" /> Agregar Horario
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
                <th style={{ color: '#d4a017' }}>Día</th>
                <th style={{ color: '#d4a017' }}>Hora Inicio</th>
                <th style={{ color: '#d4a017' }}>Hora Fin</th>
                <th style={{ color: '#d4a017' }}>Duración por Cita</th>
                <th style={{ color: '#d4a017' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ color: '#fff' }}>No hay horarios configurados</td>
                </tr>
              ) : (
                horarios.map(horario => (
                  <tr key={horario._id}>
                    <td style={{ color: '#fff' }}><strong>{getDiaNombre(horario.dia_semana)}</strong></td>
                    <td style={{ color: '#fff' }}>{horario.hora_inicio}</td>
                    <td style={{ color: '#fff' }}>{horario.hora_fin}</td>
                    <td><Badge bg="primary">90 minutos</Badge></td>
                    <td>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenModal(horario)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(horario._id)}
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

        <div className="mt-3 p-2 rounded" style={{ backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <small style={{ color: '#aaa' }}>
            <FaCalendarWeek className="me-1" style={{ color: '#d4a017' }} />
            <strong style={{ color: '#d4a017' }}>Nota:</strong> 
            <span style={{ color: '#aaa' }}> Las citas tendrán una duración de 90 minutos. Los horarios se generan automáticamente en intervalos de 90 minutos desde la hora de inicio hasta la hora de fin.</span>
          </small>
        </div>
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Horario' : 'Agregar Horario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Día de la semana *</Form.Label>
              <Form.Select
                value={formData.dia_semana}
                onChange={(e) => setFormData({ ...formData, dia_semana: parseInt(e.target.value) })}
              >
                {diasSemana.map(dia => (
                  <option key={dia.id} value={dia.id}>{dia.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora de Inicio *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora de Fin *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" style={{ backgroundColor: '#2a2a2a', borderColor: '#d4a017', color: '#fff' }}>
              <strong style={{ color: '#d4a017' }}>Información:</strong>
              <ul className="mb-0 mt-2" style={{ color: '#aaa' }}>
                <li>Las citas tendrán una duración de <strong style={{ color: '#d4a017' }}>90 minutos</strong></li>
                <li>Los horarios disponibles se generan automáticamente en intervalos de 90 minutos</li>
                <li>Ejemplo: Si inicia a las 08:00, los horarios serán: 08:00, 09:30, 11:00, etc.</li>
              </ul>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            {loading ? 'Guardando...' : 'Guardar Horario'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default HorariosProfesional;