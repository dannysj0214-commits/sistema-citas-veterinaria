import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaLightbulb, FaDollarSign, FaClock, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

// Servicios sugeridos predefinidos para mostrar al cliente
const SERVICIOS_SUGERIDOS_CLIENTE = [
  { nombre: 'Consulta General', precio: 50000, duracion: 90, descripcion: 'Revisión médica completa' },
  { nombre: 'Vacunación', precio: 80000, duracion: 90, descripcion: 'Esquema de vacunación' },
  { nombre: 'Desparasitación', precio: 35000, duracion: 90, descripcion: 'Desparasitación interna/externa' },
  { nombre: 'Baño y Corte', precio: 60000, duracion: 90, descripcion: 'Baño medicinal y estética' },
  { nombre: 'Urgencias', precio: 150000, duracion: 90, descripcion: 'Atención de urgencias' }
];

const AgendarCita = () => {
  const navigate = useNavigate();
  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarSugeridos, setMostrarSugeridos] = useState(true);
  
  const [formData, setFormData] = useState({
    profesionalId: '',
    fecha: '',
    hora: '',
    servicio: '',
    motivo: '',
    notas: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarProfesionales();
  }, []);

  useEffect(() => {
    if (formData.profesionalId) {
      cargarServicios(formData.profesionalId);
    }
  }, [formData.profesionalId]);

  useEffect(() => {
    if (formData.profesionalId && formData.fecha) {
      cargarHorarios();
    }
  }, [formData.profesionalId, formData.fecha]);

  const cargarProfesionales = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profesionales`);
      setProfesionales(response.data.data || []);
    } catch (error) {
      console.error('Error cargando profesionales:', error);
      setError('Error al cargar los profesionales');
    }
  };

  const cargarServicios = async (profesionalId) => {
    try {
      const response = await axios.get(`${API_URL}/services/profesional/${profesionalId}`);
      const serviciosData = response.data.data || [];
      setServicios(serviciosData);
      // Si hay servicios del profesional, ocultar sugeridos
      setMostrarSugeridos(serviciosData.length === 0);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setServicios([]);
      setMostrarSugeridos(true);
    }
  };

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/appointments/disponibles/${formData.profesionalId}?fecha=${formData.fecha}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHorarios(response.data.data || []);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'profesionalId') {
      setFormData(prev => ({ ...prev, servicio: '', hora: '' }));
      setServicios([]);
      setHorarios([]);
    }
    if (name === 'fecha') {
      setFormData(prev => ({ ...prev, hora: '' }));
    }
  };

  const seleccionarServicioSugerido = (servicio) => {
    setFormData(prev => ({ ...prev, servicio: servicio.nombre }));
    // Agregar el motivo automáticamente
    setFormData(prev => ({ 
      ...prev, 
      motivo: `Solicito ${servicio.nombre}. ${servicio.descripcion}` 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.profesionalId || !formData.fecha || !formData.hora || !formData.servicio || !formData.motivo) {
      setError('Por favor complete todos los campos requeridos');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/appointments`,
        {
          id_profesional: formData.profesionalId,
          fecha: formData.fecha,
          hora: formData.hora,
          servicio: formData.servicio,
          motivo: formData.motivo,
          notas: formData.notas
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Cita agendada exitosamente');
        setTimeout(() => {
          navigate('/mis-citas');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al agendar:', error);
      setError(error.response?.data?.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Container fluid>
      <h2 className="mb-4">Agendar Nueva Cita</h2>
      
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Profesional *</Form.Label>
                  <Form.Select
                    name="profesionalId"
                    value={formData.profesionalId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un profesional...</option>
                    {profesionales.map(prof => (
                      <option key={prof._id} value={prof._id}>
                        {prof.nombre} - {prof.especialidad || 'General'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={minDate}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Horario *</Form.Label>
                  <Form.Select
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    disabled={!formData.fecha || loading}
                    required
                  >
                    <option value="">Seleccione un horario...</option>
                    {horarios.map(hora => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </Form.Select>
                  {loading && <small className="text-muted">Cargando horarios...</small>}
                  {horarios.length === 0 && formData.fecha && !loading && (
                    <small className="text-warning">No hay horarios disponibles para esta fecha</small>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Servicio *</Form.Label>
                  {servicios.length > 0 ? (
                    <Form.Select
                      name="servicio"
                      value={formData.servicio}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un servicio...</option>
                      {servicios.map(serv => (
                        <option key={serv._id} value={serv.nombre}>
                          {serv.nombre} - ${serv.precio.toLocaleString()} ({serv.duracion} min)
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="text"
                      name="servicio"
                      value={formData.servicio}
                      onChange={handleChange}
                      placeholder="Escriba el servicio que necesita..."
                      required
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Motivo de la consulta *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    placeholder="Describa el motivo de su consulta..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notas adicionales (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Información adicional que desee agregar..."
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => navigate('/cliente-dashboard')}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Agendar Cita'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Servicios Sugeridos para el Cliente */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <FaLightbulb className="me-2" />
                Servicios Sugeridos
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">
                Haz clic en un servicio para autocompletar el formulario:
              </p>
              <div className="d-flex flex-column gap-2">
                {SERVICIOS_SUGERIDOS_CLIENTE.map((servicio, idx) => (
                  <Button
                    key={idx}
                    variant="outline-primary"
                    className="text-start"
                    onClick={() => seleccionarServicioSugerido(servicio)}
                  >
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div>
                        <strong>{servicio.nombre}</strong>
                        <div className="small text-muted">{servicio.descripcion}</div>
                      </div>
                      <div className="text-end">
                        <Badge bg="success" className="mb-1">
                          <FaDollarSign /> {servicio.precio.toLocaleString()}
                        </Badge>
                        <br />
                        <Badge bg="info">
                          <FaClock /> {servicio.duracion} min
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header as="h5">Información</Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <strong>📋 ¿Cómo funciona?</strong>
                  <p className="text-muted small mt-1">
                    1. Seleccione un profesional<br />
                    2. Elija una fecha disponible<br />
                    3. Seleccione un horario<br />
                    4. Complete los datos y confirme
                  </p>
                </li>
                <li className="mb-3">
                  <strong>⏰ Horarios de atención</strong>
                  <p className="text-muted small mt-1">
                    Las citas tienen una duración de 90 minutos.<br />
                    Los horarios se actualizan en tiempo real.
                  </p>
                </li>
                <li>
                  <strong>📱 Notificaciones</strong>
                  <p className="text-muted small mt-1">
                    Recibirá notificaciones cuando su cita sea confirmada.
                  </p>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgendarCita;