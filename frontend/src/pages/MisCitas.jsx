import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaCalendarCheck, FaFileMedical, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AtenderCitaModal from '../components/AtenderCitaModal';

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [historiasMap, setHistoriasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      let citasRes;
      if (user.rol === 'cliente') {
        citasRes = await api.get('/appointments/cliente');
      } else {
        citasRes = await api.get('/appointments/profesional');
      }
      setCitas(citasRes.data.data || []);
      
      // Cargar historias para saber qué citas tienen historia clínica
      if (user.rol === 'cliente') {
        const historiasRes = await api.get('/medical-records/cliente');
        const map = {};
        (historiasRes.data.data || []).forEach(historia => {
          if (historia.appointment_id) {
            map[historia.appointment_id] = historia._id;
          }
        });
        setHistoriasMap(map);
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (id) => {
    if (window.confirm('¿Estás seguro de cancelar esta cita?')) {
      try {
        await api.delete(`/appointments/${id}`);
        cargarDatos();
        alert('Cita cancelada exitosamente');
      } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.message || 'Error al cancelar');
      }
    }
  };

  const confirmarCita = async (id) => {
    try {
      await api.put(`/appointments/${id}/estado`, { estado: 'confirmada' });
      cargarDatos();
      alert('Cita confirmada');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al confirmar');
    }
  };

  const rechazarCita = async (id) => {
    try {
      await api.put(`/appointments/${id}/estado`, { estado: 'rechazada' });
      cargarDatos();
      alert('Cita rechazada');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar');
    }
  };

  const verHistoria = (historiaId) => {
    if (historiaId) {
      navigate(`/ver-historia/${historiaId}`);
    } else {
      alert('No hay historia clínica disponible para esta cita');
    }
  };

  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'pendiente': return <Badge bg="warning">Pendiente</Badge>;
      case 'confirmada': return <Badge bg="info">Confirmada</Badge>;
      case 'completada': return <Badge bg="success">Completada</Badge>;
      case 'cancelada': return <Badge bg="danger">Cancelada</Badge>;
      case 'rechazada': return <Badge bg="secondary">Rechazada</Badge>;
      default: return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Cargando citas...</span>
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#d4a017' }}>Mis Citas</h2>
          {user.rol === 'cliente' && (
            <Button variant="primary" onClick={() => navigate('/agendar-cita')} style={{ backgroundColor: '#d4a017', border: 'none' }}>
              <FaCalendarCheck className="me-2" /> Agendar Nueva Cita
            </Button>
          )}
        </div>

        <Card style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333', borderRadius: '15px' }}>
          <Card.Body>
            {citas.length === 0 ? (
              <div className="text-center py-5">
                <FaCalendarCheck size={50} className="text-muted mb-3" />
                <p className="text-muted">No tienes citas registradas.</p>
                {user.rol === 'cliente' && (
                  <Button variant="primary" onClick={() => navigate('/agendar-cita')} style={{ backgroundColor: '#d4a017', border: 'none' }}>
                    Agendar mi primera cita
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <Table variant="dark" striped hover>
                  <thead>
                    <tr>
                      <th style={{ color: '#d4a017' }}>Fecha</th>
                      <th style={{ color: '#d4a017' }}>Hora</th>
                      <th style={{ color: '#d4a017' }}>{user.rol === 'cliente' ? 'Profesional' : 'Cliente'}</th>
                      <th style={{ color: '#d4a017' }}>Servicio</th>
                      <th style={{ color: '#d4a017' }}>Estado</th>
                      <th style={{ color: '#d4a017' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map(cita => {
                      const historiaId = historiasMap[cita._id];
                      return (
                        <tr key={cita._id}>
                          <td style={{ color: '#fff' }}>{cita.fecha}</td>
                          <td style={{ color: '#fff' }}>{cita.hora}</td>
                          <td style={{ color: '#fff' }}>
                            {user.rol === 'cliente' 
                              ? cita.id_profesional?.nombre || 'Cargando...'
                              : cita.id_cliente?.nombre || 'Cargando...'}
                          </td>
                          <td style={{ color: '#fff' }}>{cita.servicio}</td>
                          <td>{getEstadoBadge(cita.estado)}</td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              {/* Cliente: Cancelar cita pendiente */}
                              {cita.estado === 'pendiente' && user.rol === 'cliente' && (
                                <Button variant="danger" size="sm" onClick={() => cancelarCita(cita._id)}>
                                  <FaTimesCircle className="me-1" /> Cancelar
                                </Button>
                              )}
                              
                              {/* Profesional: Confirmar/Rechazar cita pendiente */}
                              {cita.estado === 'pendiente' && user.rol === 'profesional' && (
                                <>
                                  <Button variant="success" size="sm" onClick={() => confirmarCita(cita._id)}>
                                    <FaCheckCircle className="me-1" /> Confirmar
                                  </Button>
                                  <Button variant="danger" size="sm" onClick={() => rechazarCita(cita._id)}>
                                    <FaTimesCircle className="me-1" /> Rechazar
                                  </Button>
                                </>
                              )}
                              
                              {/* Profesional: Atender cita confirmada */}
                              {cita.estado === 'confirmada' && user.rol === 'profesional' && (
                                <Button variant="primary" size="sm" onClick={() => {
                                  setCitaSeleccionada(cita);
                                  setShowModal(true);
                                }} style={{ backgroundColor: '#d4a017', border: 'none' }}>
                                  <FaFileMedical className="me-1" /> Atender
                                </Button>
                              )}
                              
                              {/* Ver historia clínica */}
                              {cita.estado === 'completada' && (
                                <Button variant="info" size="sm" onClick={() => verHistoria(historiaId)}>
                                  <FaEye className="me-1" /> Ver Historia
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal para atender cita */}
        <AtenderCitaModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setCitaSeleccionada(null);
            cargarDatos();
          }}
          cita={citaSeleccionada}
          token={token}
          onCitaAtendida={cargarDatos}
        />
      </Container>
    </div>
  );
};

export default MisCitas;