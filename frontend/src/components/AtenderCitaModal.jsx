import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaFilePdf, FaPaw, FaStethoscope } from 'react-icons/fa';
import api from '../services/api';

const AtenderCitaModal = ({ show, onHide, cita, onCitaAtendida }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    paciente: '',
    especie: 'Canino',
    raza: '',
    edad: '',
    peso: '',
    temperatura: '',
    diagnostico: '',
    tratamiento: '',
    medicamentos: '',
    observaciones: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paciente) return setError('Nombre del paciente requerido');
    if (!formData.diagnostico) return setError('Diagnóstico requerido');
    if (!formData.tratamiento) return setError('Tratamiento requerido');
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Crear historia clínica con el nombre del profesional que atiende
      const response = await api.post('/medical-records', {
        propietario: cita?.id_cliente?.nombre || '',
        paciente: formData.paciente,
        especie: formData.especie,
        raza: formData.raza,
        edad: formData.edad,
        peso: formData.peso,
        temperatura: formData.temperatura,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        medicamentos: formData.medicamentos,
        observaciones: formData.observaciones,
        cliente_id: cita?.id_cliente?._id,
        appointment_id: cita?._id,
        profesional: user.nombre  // ← NOMBRE DEL DOCTOR QUE ATIENDE
      });
      
      if (response.data.success) {
        setSuccess('Historia clínica guardada exitosamente');
        
        // Actualizar estado de la cita a completada
        await api.put(`/appointments/${cita._id}/estado`, { estado: 'completada' });
        
        setTimeout(() => {
          onCitaAtendida();
          onHide();
        }, 1500);
      }
    } catch (err) { 
      setError(err.response?.data?.message || 'Error al guardar la historia clínica');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#1a1a1a', color: '#d4a017', borderBottom: '1px solid #333' }}>
        <Modal.Title style={{ color: '#d4a017' }}>
          <FaFilePdf className="me-2" /> Atención de Cita - Historia Clínica
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#111111' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h6 style={{ color: '#d4a017' }}>Información de la Cita</h6>
            <Row>
              <Col md={6}>
                <small className="text-muted">Fecha:</small>
                <p style={{ color: '#fff' }}><strong>{cita?.fecha}</strong> - {cita?.hora}</p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Cliente:</small>
                <p style={{ color: '#fff' }}><strong>{cita?.id_cliente?.nombre}</strong></p>
              </Col>
            </Row>
          </div>
          
          <h6 style={{ color: '#d4a017' }}><FaPaw /> Datos del Paciente</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control 
                className="mb-2" 
                name="paciente"
                placeholder="Nombre del paciente *" 
                value={formData.paciente} 
                onChange={handleChange} 
                required 
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              />
            </Col>
            <Col md={3}>
              <Form.Select 
                name="especie"
                value={formData.especie} 
                onChange={handleChange}
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              >
                <option value="Canino">Canino</option>
                <option value="Felino">Felino</option>
                <option value="Ave">Ave</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control 
                name="raza"
                placeholder="Raza" 
                value={formData.raza} 
                onChange={handleChange} 
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              />
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Control 
                name="edad"
                placeholder="Edad" 
                value={formData.edad} 
                onChange={handleChange} 
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              />
            </Col>
            <Col md={4}>
              <Form.Control 
                name="peso"
                type="number"
                placeholder="Peso (kg)" 
                value={formData.peso} 
                onChange={handleChange} 
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              />
            </Col>
            <Col md={4}>
              <Form.Control 
                name="temperatura"
                type="number"
                placeholder="Temperatura (°C)" 
                value={formData.temperatura} 
                onChange={handleChange} 
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
              />
            </Col>
          </Row>
          
          <h6 className="mt-3" style={{ color: '#d4a017' }}><FaStethoscope /> Datos Clínicos</h6>
          <Form.Control 
            as="textarea" 
            rows={2} 
            className="mb-2" 
            name="diagnostico"
            placeholder="Diagnóstico *" 
            value={formData.diagnostico} 
            onChange={handleChange} 
            required 
            style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
          />
          <Form.Control 
            as="textarea" 
            rows={2} 
            className="mb-2" 
            name="tratamiento"
            placeholder="Tratamiento *" 
            value={formData.tratamiento} 
            onChange={handleChange} 
            required 
            style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
          />
          <Form.Control 
            as="textarea" 
            rows={2} 
            className="mb-2" 
            name="medicamentos"
            placeholder="Medicamentos" 
            value={formData.medicamentos} 
            onChange={handleChange} 
            style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
          />
          <Form.Control 
            as="textarea" 
            rows={2} 
            name="observaciones"
            placeholder="Observaciones" 
            value={formData.observaciones} 
            onChange={handleChange} 
            style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
          />
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AtenderCitaModal;