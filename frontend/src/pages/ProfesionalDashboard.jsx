import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Tabs, Tab, Table, Button } from 'react-bootstrap';
import { FaCalendarCheck, FaClock, FaCheckCircle, FaTimesCircle, FaFileMedical, FaEye, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import HorariosProfesional from '../components/HorariosProfesional';
import ServiciosProfesional from '../components/ServiciosProfesional';

const ProfesionalDashboard = () => {
  const [citas, setCitas] = useState([]);
  const [historias, setHistorias] = useState([]);
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
      
      const citasRes = await api.get('/appointments/profesional');
      setCitas(citasRes.data.data || []);
      
      const historiasRes = await api.get('/medical-records/profesional/todas');
      setHistorias(historiasRes.data.data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const citasPendientes = citas.filter(c => c.estado === 'pendiente').length;
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length;
  const citasCompletadas = citas.filter(c => c.estado === 'completada').length;
  const citasCanceladas = citas.filter(c => c.estado === 'cancelada').length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Button onClick={cargarDatos}>Reintentar</Button>
      </Container>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: 'url(/logo.png)',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundColor: '#000000',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 0
      }} />
      
      <Container fluid style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        <div className="text-center mb-4">
          <h2 style={{ color: '#d4a017' }}>¡Bienvenido, Dr(a). {user.nombre}!</h2>
          <p style={{ color: '#aaa' }}>"La Voz de los que no tienen voz"</p>
        </div>
        
        <Row className="mb-4">
          <Col md={3}><Card className="text-center shadow-sm border-warning" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}><Card.Body><FaClock size={40} className="text-warning mb-2" /><h3 style={{ color: '#fff' }}>{citasPendientes}</h3><Card.Text style={{ color: '#aaa' }}>Pendientes</Card.Text></Card.Body></Card></Col>
          <Col md={3}><Card className="text-center shadow-sm border-info" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}><Card.Body><FaCalendarCheck size={40} className="text-info mb-2" /><h3 style={{ color: '#fff' }}>{citasConfirmadas}</h3><Card.Text style={{ color: '#aaa' }}>Confirmadas</Card.Text></Card.Body></Card></Col>
          <Col md={3}><Card className="text-center shadow-sm border-success" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}><Card.Body><FaCheckCircle size={40} className="text-success mb-2" /><h3 style={{ color: '#fff' }}>{citasCompletadas}</h3><Card.Text style={{ color: '#aaa' }}>Completadas</Card.Text></Card.Body></Card></Col>
          <Col md={3}><Card className="text-center shadow-sm border-danger" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}><Card.Body><FaTimesCircle size={40} className="text-danger mb-2" /><h3 style={{ color: '#fff' }}>{citasCanceladas}</h3><Card.Text style={{ color: '#aaa' }}>Canceladas</Card.Text></Card.Body></Card></Col>
        </Row>

        <Tabs defaultActiveKey="citas" className="mb-4">
          <Tab eventKey="citas" title="Mis Citas">
            <Card className="shadow-sm mt-3" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Card.Body>
                {citas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length === 0 ? (
                  <p className="text-muted text-center">No hay citas próximas</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th style={{ color: '#fff' }}>Fecha</th>
                          <th style={{ color: '#fff' }}>Hora</th>
                          <th style={{ color: '#fff' }}>Cliente</th>
                          <th style={{ color: '#fff' }}>Servicio</th>
                          <th style={{ color: '#fff' }}>Estado</th>
                          <th style={{ color: '#fff' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').map(cita => (
                          <tr key={cita._id}>
                            <td style={{ color: '#fff' }}>{cita.fecha}</td>
                            <td style={{ color: '#fff' }}>{cita.hora}</td>
                            <td style={{ color: '#fff' }}>{cita.id_cliente?.nombre}</td>
                            <td style={{ color: '#fff' }}>{cita.servicio}</td>
                            <td><Badge bg={cita.estado === 'pendiente' ? 'warning' : 'info'}>{cita.estado}</Badge></td>
                            <td><Button variant="primary" size="sm" onClick={() => navigate('/mis-citas')}>Atender</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="historias" title="Historias Clínicas">
            <Card className="shadow-sm mt-3" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Card.Body>
                {historias.length === 0 ? (
                  <p className="text-muted text-center">No hay historias clínicas</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th style={{ color: '#fff' }}>N° Historia</th>
                          <th style={{ color: '#fff' }}>Fecha</th>
                          <th style={{ color: '#fff' }}>Paciente</th>
                          <th style={{ color: '#fff' }}>Propietario</th>
                          <th style={{ color: '#fff' }}>Diagnóstico</th>
                          <th style={{ color: '#fff' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historias.map(historia => (
                          <tr key={historia._id}>
                            <td style={{ color: '#fff' }}><Badge bg="primary">{historia.hc_numero}</Badge></td>
                            <td style={{ color: '#fff' }}>{new Date(historia.fecha).toLocaleDateString()}</td>
                            <td style={{ color: '#fff' }}><strong>{historia.paciente}</strong></td>
                            <td style={{ color: '#fff' }}>{historia.propietario}</td>
                            <td style={{ color: '#fff' }}>{historia.diagnostico?.substring(0, 40)}...</td>
                            <td>
                              <Button variant="info" size="sm" onClick={() => navigate(`/ver-historia/${historia._id}`)}>
                                <FaEye className="me-1" /> Ver
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="horarios" title="Horarios">
            <div className="mt-3">
              <HorariosProfesional profesionalId={user.id} token={localStorage.getItem('token')} />
            </div>
          </Tab>
          
          <Tab eventKey="servicios" title="Servicios">
            <div className="mt-3">
              <ServiciosProfesional profesionalId={user.id} token={localStorage.getItem('token')} />
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default ProfesionalDashboard;