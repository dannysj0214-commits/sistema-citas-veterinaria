import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaFilePdf, FaPaw, FaStethoscope } from 'react-icons/fa';
import api from '../services/api';

const AtenderCitaModal = ({ show, onHide, cita, onCitaAtendida }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ paciente: '', especie: 'Canino', raza: '', edad: '', peso: '', temperatura: '', diagnostico: '', tratamiento: '', medicamentos: '', observaciones: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paciente) return setError('Nombre del paciente requerido');
    if (!formData.diagnostico) return setError('Diagnóstico requerido');
    if (!formData.tratamiento) return setError('Tratamiento requerido');
    setLoading(true);
    try {
      await api.post('/medical-records', { propietario: cita?.id_cliente?.nombre || '', paciente: formData.paciente, especie: formData.especie, raza: formData.raza, edad: formData.edad, peso: formData.peso, temperatura: formData.temperatura, diagnostico: formData.diagnostico, tratamiento: formData.tratamiento, medicamentos: formData.medicamentos, observaciones: formData.observaciones, cliente_id: cita?.id_cliente?._id, appointment_id: cita?._id });
      await api.put(`/appointments/${cita._id}/estado`, { estado: 'completada' });
      setSuccess('Historia guardada');
      setTimeout(() => { onCitaAtendida(); onHide(); }, 1500);
    } catch (err) { setError(err.response?.data?.message || 'Error'); } finally { setLoading(false); }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg"><Modal.Header closeButton><Modal.Title><FaFilePdf /> Atención de Cita</Modal.Title></Modal.Header>
      <Form onSubmit={handleSubmit}><Modal.Body>{error && <Alert variant="danger">{error}</Alert>}{success && <Alert variant="success">{success}</Alert>}
        <div className="bg-light p-3 rounded mb-3"><h6>Información de la Cita</h6><Row><Col><small>Fecha:</small><p><strong>{cita?.fecha}</strong> - {cita?.hora}</p></Col><Col><small>Cliente:</small><p><strong>{cita?.id_cliente?.nombre}</strong></p></Col></Row></div>
        <h6><FaPaw /> Datos del Paciente</h6><Row><Col md={6}><Form.Control className="mb-2" placeholder="Nombre del paciente *" value={formData.paciente} onChange={e => setFormData({ ...formData, paciente: e.target.value })} required /></Col>
        <Col md={3}><Form.Select value={formData.especie} onChange={e => setFormData({ ...formData, especie: e.target.value })}><option>Canino</option><option>Felino</option><option>Ave</option></Form.Select></Col>
        <Col md={3}><Form.Control placeholder="Raza" value={formData.raza} onChange={e => setFormData({ ...formData, raza: e.target.value })} /></Col></Row>
        <Row><Col><Form.Control className="mb-2" placeholder="Edad" value={formData.edad} onChange={e => setFormData({ ...formData, edad: e.target.value })} /></Col><Col><Form.Control className="mb-2" placeholder="Peso (kg)" value={formData.peso} onChange={e => setFormData({ ...formData, peso: e.target.value })} /></Col><Col><Form.Control className="mb-2" placeholder="Temperatura (°C)" value={formData.temperatura} onChange={e => setFormData({ ...formData, temperatura: e.target.value })} /></Col></Row>
        <h6 className="mt-3"><FaStethoscope /> Datos Clínicos</h6><Form.Control as="textarea" rows={2} className="mb-2" placeholder="Diagnóstico *" value={formData.diagnostico} onChange={e => setFormData({ ...formData, diagnostico: e.target.value })} required />
        <Form.Control as="textarea" rows={2} className="mb-2" placeholder="Tratamiento *" value={formData.tratamiento} onChange={e => setFormData({ ...formData, tratamiento: e.target.value })} required />
        <Form.Control as="textarea" rows={2} className="mb-2" placeholder="Medicamentos" value={formData.medicamentos} onChange={e => setFormData({ ...formData, medicamentos: e.target.value })} />
        <Form.Control as="textarea" rows={2} placeholder="Observaciones" value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
      </Modal.Body><Modal.Footer><Button variant="secondary" onClick={onHide}>Cancelar</Button><Button type="submit" variant="primary" disabled={loading}><FaSave /> {loading ? 'Guardando...' : 'Guardar'}</Button></Modal.Footer></Form>
    </Modal>
  );
};

export default AtenderCitaModal;