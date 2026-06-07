import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaCalendarCheck, FaFileMedical, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AtenderCitaModal from '../components/AtenderCitaModal';

const API_URL = 'http://localhost:5000/api';

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [historiasMap, setHistoriasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar citas
      let url;
      if (user.rol === 'cliente') {
        url = '/appointments/cliente';
      } else if (user.rol === 'profesional') {
        url = '/appointments/profesional';
      } else {
        url = '/appointments/todas';
      }
      
      const citasRes = await axios.get(`${API_URL}${url}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setCitas(citasRes.data.data || []);
      
      // Cargar historias para cliente
      if (user.rol === 'cliente') {
        const historiasRes = await axios.get(`${API_URL}/medical-records/cliente`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const map = {};
        (historiasRes.data.data || []).forEach(historia => {
          if (historia.appointment_id) {
            map[historia.appointment_id] = historia._id;
          }
        });
        setHistoriasMap(map);
      }
      
      // Cargar historias para profesional
      if (user.rol === 'profesional') {
        const historiasRes = await axios.get(`${API_URL}/medical-records/profesional/todas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const map = {};
        (historiasRes.data.data || []).forEach(historia => {
          if (historia.appointment_id) {
            map[historia.appointment_id] = historia._id;
          }
        });
        setHistoriasMap(map);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (id) => {
    if (window.confirm('¿Cancelar esta cita?')) {
      try {
        await axios.delete(`${API_URL}/appointments/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        cargarDatos();
        alert('Cita cancelada');
      } catch (error) {
        alert('Error al cancelar');
      }
    }
  };

  const confirmarCita = async (id) => {
    try {
      await axios.put(`${API_URL}/appointments/${id}/estado`, 
        { estado: 'confirmada' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarDatos();
      alert('Cita confirmada');
    } catch (error) {
      alert('Error al confirmar');
    }
  };

  const rechazarCita = async (id) => {
    try {
      await axios.put(`${API_URL}/appointments/${id}/estado`, 
        { estado: 'rechazada' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarDatos();
      alert('Cita rechazada');
    } catch (error) {
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
      case 'pendiente': return <Badge bg="warning" style={{ fontSize: '12px' }}>📋 Pendiente</Badge>;
      case 'confirmada': return <Badge bg="info" style={{ fontSize: '12px' }}>✅ Confirmada</Badge>;
      case 'completada': return <Badge bg="success" style={{ fontSize: '12px' }}>✔️ Completada</Badge>;
      case 'cancelada': return <Badge bg="danger" style={{ fontSize: '12px' }}>❌ Cancelada</Badge>;
      case 'rechazada': return <Badge bg="secondary" style={{ fontSize: '12px' }}>⛔ Rechazada</Badge>;
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
    <Container fluid>
      <h2 className="mb-4">📅 Mis Citas</h2>
      
      <Card style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <Card.Body>
          {citas.length === 0 ? (
            <p className="text-center text-muted">No hay citas registradas</p>
          ) : (
            <div className="table-responsive">
              <Table striped hover style={{ color: '#fff' }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>{user.rol === 'cliente' ? 'Profesional' : 'Cliente'}</th>
                    <th>Servicio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(cita => {
                    const historiaId = historiasMap[cita._id];
                    return (
                      <tr key={cita._id}>
                        <td>{cita.fecha}</td>
                        <td>{cita.hora}</td>
                        <td>
                          {user.rol === 'cliente' 
                            ? cita.id_profesional?.nombre || 'N/A'
                            : cita.id_cliente?.nombre || 'N/A'}
                        </td>
                        <td>{cita.servicio}</td>
                        <td>{getEstadoBadge(cita.estado)}</td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            {/* Cancelar (solo cliente, cita pendiente) */}
                            {cita.estado === 'pendiente' && user.rol === 'cliente' && (
                              <Button variant="danger" size="sm" onClick={() => cancelarCita(cita._id)}>
                                <FaTimesCircle className="me-1" /> Cancelar
                              </Button>
                            )}
                            
                            {/* Confirmar/Rechazar (solo profesional, cita pendiente) */}
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
                            
                            {/* Atender (solo profesional, cita confirmada) */}
                            {cita.estado === 'confirmada' && user.rol === 'profesional' && (
                              <Button variant="primary" size="sm" onClick={() => {
                                setCitaSeleccionada(cita);
                                setShowModal(true);
                              }}>
                                <FaFileMedical className="me-1" /> Atender
                              </Button>
                            )}
                            
                            {/* Ver Historia (cuando existe historia clínica) */}
                            {historiaId && (
                              <Button 
                                variant="info" 
                                size="sm"
                                onClick={() => verHistoria(historiaId)}
                              >
                                <FaEye className="me-1" /> Ver Historia
                              </Button>
                            )}
                            
                            {/* Mensaje si está completada pero no hay historia */}
                            {cita.estado === 'completada' && !historiaId && (
                              <span className="text-muted small">Cargando historia...</span>
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
  );
};

export default MisCitas;