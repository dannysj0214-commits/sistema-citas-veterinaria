import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaFilePdf, FaPaw, FaStethoscope } from 'react-icons/fa';
import api from '../services/api';

const AtenderCitaModal = ({ show, onHide, cita, onCitaAtendida, token }) => {
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
      // Usar api en lugar de axios directo (api ya maneja el token)
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

      if (response.data.success) {
        setSuccess('Historia clínica guardada exitosamente');
        
        // Actualizar estado de la cita a completada
        await api.put(`/appointments/${cita._id}/estado`, { estado: 'completada' });
        
        setTimeout(() => {
          onCitaAtendida();
          onHide();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setError(error.response?.data?.message || 'Error al guardar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaFilePdf className="me-2" />
          Atención de Cita - Historia Clínica
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Información de la cita */}
          <div className="bg-light p-3 rounded mb-4">
            <h6 className="mb-3">Información de la Cita</h6>
            <Row>
              <Col md={6}>
                <small className="text-muted">Fecha:</small>
                <p className="mb-2"><strong>{cita?.fecha}</strong> - {cita?.hora}</p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Cliente:</small>
                <p className="mb-2"><strong>{cita?.id_cliente?.nombre}</strong></p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Servicio:</small>
                <p className="mb-2"><strong>{cita?.servicio}</strong></p>
              </Col>
              <Col md={6}>
                <small className="text-muted">Motivo:</small>
                <p className="mb-2"><strong>{cita?.motivo}</strong></p>
              </Col>
            </Row>
          </div>

          <h6 className="mb-3 text-primary">
            <FaPaw className="me-2" /> Datos del Paciente
          </h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre del Paciente *</Form.Label>
                <Form.Control
                  type="text"
                  name="paciente"
                  value={formData.paciente}
                  onChange={handleChange}
                  placeholder="Ej: Max, Luna, Rocky"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Especie</Form.Label>
                <Form.Select name="especie" value={formData.especie} onChange={handleChange}>
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
                <Form.Label>Raza</Form.Label>
                <Form.Control
                  type="text"
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  placeholder="Ej: Labrador, Persa"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Edad</Form.Label>
                <Form.Control
                  type="text"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  placeholder="Ej: 2 años, 6 meses"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Peso (kg)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="Ej: 15.5"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  name="temperatura"
                  value={formData.temperatura}
                  onChange={handleChange}
                  placeholder="Ej: 38.5"
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mb-3 text-primary mt-3">
            <FaStethoscope className="me-2" /> Datos Clínicos
          </h6>
          
          <Form.Group className="mb-3">
            <Form.Label>Diagnóstico *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              placeholder="Describa el diagnóstico del paciente..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tratamiento *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="tratamiento"
              value={formData.tratamiento}
              onChange={handleChange}
              placeholder="Indique el tratamiento a seguir..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Medicamentos Recetados</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
              placeholder="Lista de medicamentos, dosis y frecuencia..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales, recomendaciones, seguimiento..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            <FaSave className="me-2" />
            {loading ? 'Guardando...' : 'Guardar Historia Clínica'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AtenderCitaModal;