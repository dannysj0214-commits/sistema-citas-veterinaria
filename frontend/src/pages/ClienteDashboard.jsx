import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { Calendar, ClipboardCheck, Clock, Bell, FileMedical } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ClienteDashboard = () => {
  const [citas, setCitas] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔵 Cargando datos del cliente...');
      
      // Cargar citas del cliente
      const citasRes = await api.get('/appointments/cliente');
      console.log('📋 Citas cargadas:', citasRes.data);
      setCitas(citasRes.data.data || []);
      
      // Cargar historias clínicas
      const historiasRes = await api.get('/medical-records/cliente');
      setHistorias(historiasRes.data.data || []);
      
      // Cargar notificaciones
      const notifRes = await api.get('/notifications');
      const noLeidas = (notifRes.data.data || []).filter(n => !n.leido);
      setNotificaciones(noLeidas);
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const citasPendientes = citas.filter(c => c && c.estado === 'pendiente').length;
  const citasConfirmadas = citas.filter(c => c && c.estado === 'confirmada').length;
  const citasCompletadas = citas.filter(c => c && c.estado === 'completada').length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={cargarDatos}>Reintentar</Button>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="mb-4">¡Bienvenido, {user.nombre || 'Cliente'}!</h2>
      
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <Clock size={40} className="text-warning mb-2" />
              <h3>{citasPendientes}</h3>
              <Card.Text>Citas Pendientes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-info">
            <Card.Body>
              <Calendar size={40} className="text-info mb-2" />
              <h3>{citasConfirmadas}</h3>
              <Card.Text>Citas Confirmadas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <ClipboardCheck size={40} className="text-success mb-2" />
              <h3>{citasCompletadas}</h3>
              <Card.Text>Citas Completadas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-danger">
            <Card.Body>
              <Bell size={40} className="text-danger mb-2" />
              <h3>{notificaciones.length}</h3>
              <Card.Text>Notificaciones Nuevas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Próximas Citas</Card.Header>
            <Card.Body>
              {citas.filter(c => c && c.estado !== 'completada' && c.estado !== 'cancelada').length === 0 ? (
                <p className="text-muted text-center">No tienes citas próximas.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Profesional</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.filter(c => c && c.estado !== 'completada' && c.estado !== 'cancelada').map(cita => (
                        <tr key={cita._id}>
                          <td>{cita.fecha}</td>
                          <td>{cita.hora}</td>
                          <td>{cita.id_profesional?.nombre || 'Cargando...'}</td>
                          <td>{cita.servicio}</td>
                          <td>
                            <Badge bg={cita.estado === 'pendiente' ? 'warning' : 'info'}>
                              {cita.estado === 'pendiente' ? 'Pendiente' : 'Confirmada'}
                            </Badge>
                          </td>
                          <td>
                            <Link to="/mis-citas" className="btn btn-sm btn-primary">Ver</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Acciones Rápidas</Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Link to="/agendar-cita" className="btn btn-primary">
                  <Calendar className="me-2" /> Agendar Cita
                </Link>
                <Link to="/mis-citas" className="btn btn-outline-secondary">
                  Ver Mis Citas
                </Link>
              </div>
            </Card.Body>
          </Card>

          {historias.length > 0 && (
            <Card className="shadow-sm mt-3">
              <Card.Header as="h5">
                <FileMedical className="me-2" />
                Últimas Historias Clínicas
              </Card.Header>
              <Card.Body>
                {historias.slice(0, 3).map(historia => (
                  <div key={historia._id} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                      <strong>{historia.paciente}</strong>
                      <br />
                      <small className="text-muted">{historia.hc_numero}</small>
                    </div>
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={() => navigate(`/ver-historia/${historia._id}`)}
                    >
                      Ver
                    </Button>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ClienteDashboard;