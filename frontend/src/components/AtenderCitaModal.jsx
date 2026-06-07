import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaFilePdf, FaPaw, FaStethoscope } from 'react-icons/fa';
import api from '../services/api';  // <-- USAR api, NO axios

const AtenderCitaModal = ({ show, onHide, cita, onCitaAtendida }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.paciente) {
      setError('El nombre del paciente es requerido');
      setLoading(false);
      return;
    }
    if (!formData.diagnostico) {
      setError('El diagnóstico es requerido');
      setLoading(false);
      return;
    }
    if (!formData.tratamiento) {
      setError('El tratamiento es requerido');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Guardando historia clínica...');
      
      // Crear historia clínica - usando api
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
        appointment_id: cita?._id
      });

      console.log('✅ Respuesta:', response.data);

      if (response.data.success) {
        setSuccess('Historia clínica guardada exitosamente');
        
        // Actualizar estado de la cita a completada - usando api
        await api.put(`/appointments/${cita._id}/estado`, { estado: 'completada' });
        
        setTimeout(() => {
          onCitaAtendida();
          onHide();
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      console.error('Status:', error.response?.status);
      console.error('URL:', error.config?.url);
      setError(error.response?.data?.message || 'Error al guardar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton style={{ backgroundColor: '#1a1a1a', color: '#d4a017', borderBottom: '1px solid #333' }}>
        <Modal.Title style={{ color: '#d4a017' }}>
          <FaFilePdf className="me-2" />
          Atención de Cita - Historia Clínica
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#111111' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Información de la cita */}
          <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h6 style={{ color: '#d4a017' }} className="mb-3">Información de la Cita</h6>
            <Row>
              <Col md={6}>
                <small className="text-muted">Fecha:</small>
                <p className="mb-2" style={{ color: '#fff' }}><strong>{cita?.fecha}</strong> - {cita?.hora}</p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Cliente:</small>
                <p className="mb-2" style={{ color: '#fff' }}><strong>{cita?.id_cliente?.nombre}</strong></p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Servicio:</small>
                <p className="mb-2" style={{ color: '#fff' }}><strong>{cita?.servicio}</strong></p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Motivo:</small>
                <p className="mb-2" style={{ color: '#fff' }}><strong>{cita?.motivo}</strong></p>
              </Col>
            </Row>
          </div>

          <h6 style={{ color: '#d4a017' }} className="mb-3">
            <FaPaw className="me-2" /> Datos del Paciente
          </h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: '#fff' }}>Nombre del Paciente *</Form.Label>
                <Form.Control
                  type="text"
                  name="paciente"
                  value={formData.paciente}
                  onChange={handleChange}
                  placeholder="Ej: Max, Luna, Rocky"
                  required
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ color: '#fff' }}>Especie</Form.Label>
                <Form.Select 
                  name="especie" 
                  value={formData.especie} 
                  onChange={handleChange}
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                >
                  <option value="Canino">Canino (Perro)</option>
                  <option value="Felino">Felino (Gato)</option>
                  <option value="Ave">Ave</option>
                  <option value="Roedor">Roedor</option>
                  <option value="Reptil">Reptil</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ color: '#fff' }}>Raza</Form.Label>
                <Form.Control
                  type="text"
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  placeholder="Ej: Labrador, Persa"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: '#fff' }}>Edad</Form.Label>
                <Form.Control
                  type="text"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  placeholder="Ej: 2 años, 6 meses"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: '#fff' }}>Peso (kg)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="Ej: 15.5"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: '#fff' }}>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  name="temperatura"
                  value={formData.temperatura}
                  onChange={handleChange}
                  placeholder="Ej: 38.5"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 style={{ color: '#d4a017' }} className="mb-3 mt-3">
            <FaStethoscope className="me-2" /> Datos Clínicos
          </h6>
          
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#fff' }}>Diagnóstico *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              placeholder="Describa el diagnóstico del paciente..."
              required
              style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#fff' }}>Tratamiento *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="tratamiento"
              value={formData.tratamiento}
              onChange={handleChange}
              placeholder="Indique el tratamiento a seguir..."
              required
              style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#fff' }}>Medicamentos Recetados</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
              placeholder="Lista de medicamentos, dosis y frecuencia..."
              style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#fff' }}>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales, recomendaciones, seguimiento..."
              style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            <FaSave className="me-2" />
            {loading ? 'Guardando...' : 'Guardar Historia Clínica'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AtenderCitaModal;