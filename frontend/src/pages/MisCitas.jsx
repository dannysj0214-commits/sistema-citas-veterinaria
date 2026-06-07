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

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      let citasRes;
      if (user.rol === 'cliente') {
        citasRes = await api.get('/appointments/cliente');
      } else {
        citasRes = await api.get('/appointments/profesional');
      }
      setCitas(citasRes.data.data || []);
      
      if (user.rol === 'cliente') {
        const historiasRes = await api.get('/medical-records/cliente');
        const map = {};
        (historiasRes.data.data || []).forEach(h => {
          if (h.appointment_id) map[h.appointment_id] = h._id;
        });
        setHistoriasMap(map);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (id) => {
    if (window.confirm('¿Cancelar esta cita?')) {
      try {
        await api.delete(`/appointments/${id}`);
        cargarDatos();
        alert('Cita cancelada');
      } catch (error) {
        alert('Error al cancelar');
      }
    }
  };

  const confirmarCita = async (id) => {
    try {
      await api.put(`/appointments/${id}/estado`, { estado: 'confirmada' });
      cargarDatos();
      alert('Cita confirmada');
    } catch (error) {
      alert('Error al confirmar');
    }
  };

  const rechazarCita = async (id) => {
    try {
      await api.put(`/appointments/${id}/estado`, { estado: 'rechazada' });
      cargarDatos();
      alert('Cita rechazada');
    } catch (error) {
      alert('Error al rechazar');
    }
  };

  const verHistoria = (historiaId) => {
    if (historiaId) navigate(`/ver-historia/${historiaId}`);
    else alert('No hay historia clínica disponible');
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <h2 className="mb-4">Mis Citas</h2>
      <Card className="shadow-sm">
        <Card.Body>
          {citas.length === 0 ? (
            <p className="text-muted text-center">No hay citas registradas</p>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Fecha</th><th>Hora</th>
                    <th>{user.rol === 'cliente' ? 'Profesional' : 'Cliente'}</th>
                    <th>Servicio</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(cita => (
                    <tr key={cita._id}>
                      <td>{cita.fecha}</td>
                      <td>{cita.hora}</td>
                      <td>{user.rol === 'cliente' ? cita.id_profesional?.nombre : cita.id_cliente?.nombre}</td>
                      <td>{cita.servicio}</td>
                      <td><Badge bg={cita.estado === 'pendiente' ? 'warning' : cita.estado === 'confirmada' ? 'info' : 'success'}>{cita.estado}</Badge></td>
                      <td>
                        {cita.estado === 'pendiente' && user.rol === 'cliente' && (
                          <Button variant="danger" size="sm" onClick={() => cancelarCita(cita._id)}>Cancelar</Button>
                        )}
                        {cita.estado === 'pendiente' && user.rol === 'profesional' && (
                          <>
                            <Button variant="success" size="sm" className="me-2" onClick={() => confirmarCita(cita._id)}>Confirmar</Button>
                            <Button variant="danger" size="sm" onClick={() => rechazarCita(cita._id)}>Rechazar</Button>
                          </>
                        )}
                        {cita.estado === 'confirmada' && user.rol === 'profesional' && (
                          <Button variant="primary" size="sm" onClick={() => { setCitaSeleccionada(cita); setShowModal(true); }}>Atender</Button>
                        )}
                        {cita.estado === 'completada' && (
                          <Button variant="info" size="sm" onClick={() => verHistoria(historiasMap[cita._id])}>Ver Historia</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      <AtenderCitaModal show={showModal} onHide={() => { setShowModal(false); setCitaSeleccionada(null); cargarDatos(); }} cita={citaSeleccionada} token={localStorage.getItem('token')} onCitaAtendida={cargarDatos} />
    </Container>
  );
};

export default MisCitas;