import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import api from '../services/api';

const HistoriaClinicaModal = ({ show, onHide, cita, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    propietario: { nombre: '', apellidos: '', tipo_documento: 'CC', numero_documento: '', telefono_celular: '', email: '' },
    paciente: { nombre: '', especie: '', raza: '', sexo: 'Macho', peso_gr: '', color_pelaje: '' },
    motivo_consulta: '',
    sintomas: '',
    temperatura: '',
    peso: '',
    frecuencia_cardiaca: '',
    frecuencia_respiratoria: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    medicamentos: [{ nombre: '', dosis: '', frecuencia: '', duracion: '' }],
    proxima_cita: { fecha: '', motivo: '' },
    profesional_nombre: '',
    profesional_matricula: ''
  });

  useEffect(() => {
    if (cita) {
      setFormData(prev => ({ ...prev, motivo_consulta: cita.motivo || '', sintomas: cita.sintomas || '' }));
    }
  }, [cita]);

  const handleChange = (section, field, value) => {
    setFormData({ ...formData, [section]: { ...formData[section], [field]: value } });
  };

  const handleMedicamentoChange = (index, field, value) => {
    const nuevos = [...formData.medicamentos];
    nuevos[index][field] = value;
    setFormData({ ...formData, medicamentos: nuevos });
  };

  const addMedicamento = () => {
    setFormData({ ...formData, medicamentos: [...formData.medicamentos, { nombre: '', dosis: '', frecuencia: '', duracion: '' }] });
  };

  const removeMedicamento = (index) => {
    setFormData({ ...formData, medicamentos: formData.medicamentos.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/medical-records', { cita_id: cita._id, ...formData });
      if (onSuccess) onSuccess();
      onHide();
      alert('✅ Historia clínica guardada');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title><i className="fas fa-file-medical me-2"></i>Historia Clínica</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="text-center mb-4"><h4>LA VETERINARIA</h4><p>"La Voz de los que no tienen voz"</p><hr /></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white">DATOS DEL PROPIETARIO</div><div className="card-body"><Row>
            <Col md="6"><Form.Label>Nombre</Form.Label><Form.Control value={formData.propietario.nombre} onChange={(e) => handleChange('propietario', 'nombre', e.target.value)} required /></Col>
            <Col md="6"><Form.Label>Apellidos</Form.Label><Form.Control value={formData.propietario.apellidos} onChange={(e) => handleChange('propietario', 'apellidos', e.target.value)} required /></Col>
            <Col md="3"><Form.Label>Tipo Doc.</Form.Label><Form.Select value={formData.propietario.tipo_documento} onChange={(e) => handleChange('propietario', 'tipo_documento', e.target.value)}><option value="CC">CC</option><option value="TI">TI</option><option value="CE">CE</option></Form.Select></Col>
            <Col md="3"><Form.Label>N° Documento</Form.Label><Form.Control value={formData.propietario.numero_documento} onChange={(e) => handleChange('propietario', 'numero_documento', e.target.value)} required /></Col>
            <Col md="6"><Form.Label>Teléfono</Form.Label><Form.Control value={formData.propietario.telefono_celular} onChange={(e) => handleChange('propietario', 'telefono_celular', e.target.value)} required /></Col>
          </Row></div></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white">DATOS DEL PACIENTE</div><div className="card-body"><Row>
            <Col md="4"><Form.Label>Nombre</Form.Label><Form.Control value={formData.paciente.nombre} onChange={(e) => handleChange('paciente', 'nombre', e.target.value)} required /></Col>
            <Col md="4"><Form.Label>Especie</Form.Label><Form.Control value={formData.paciente.especie} onChange={(e) => handleChange('paciente', 'especie', e.target.value)} required /></Col>
            <Col md="4"><Form.Label>Raza</Form.Label><Form.Control value={formData.paciente.raza} onChange={(e) => handleChange('paciente', 'raza', e.target.value)} /></Col>
            <Col md="3"><Form.Label>Sexo</Form.Label><Form.Select value={formData.paciente.sexo} onChange={(e) => handleChange('paciente', 'sexo', e.target.value)}><option value="Macho">Macho</option><option value="Hembra">Hembra</option></Form.Select></Col>
            <Col md="3"><Form.Label>Peso (gr)</Form.Label><Form.Control type="number" value={formData.paciente.peso_gr} onChange={(e) => handleChange('paciente', 'peso_gr', e.target.value)} /></Col>
            <Col md="3"><Form.Label>Color</Form.Label><Form.Control value={formData.paciente.color_pelaje} onChange={(e) => handleChange('paciente', 'color_pelaje', e.target.value)} /></Col>
          </Row></div></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white">SIGNOS VITALES</div><div className="card-body"><Row>
            <Col md="3"><Form.Label>Temperatura (°C)</Form.Label><Form.Control type="number" step="0.1" value={formData.temperatura} onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })} /></Col>
            <Col md="3"><Form.Label>Peso (kg)</Form.Label><Form.Control type="number" step="0.1" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} /></Col>
            <Col md="3"><Form.Label>Frec. Cardíaca</Form.Label><Form.Control type="number" value={formData.frecuencia_cardiaca} onChange={(e) => setFormData({ ...formData, frecuencia_cardiaca: e.target.value })} /></Col>
            <Col md="3"><Form.Label>Frec. Respiratoria</Form.Label><Form.Control type="number" value={formData.frecuencia_respiratoria} onChange={(e) => setFormData({ ...formData, frecuencia_respiratoria: e.target.value })} /></Col>
          </Row></div></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white">CONSULTA</div><div className="card-body">
            <Form.Group className="mb-3"><Form.Label>Motivo</Form.Label><Form.Control as="textarea" rows={2} value={formData.motivo_consulta} onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Síntomas</Form.Label><Form.Control as="textarea" rows={2} value={formData.sintomas} onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Diagnóstico</Form.Label><Form.Control as="textarea" rows={2} value={formData.diagnostico} onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Tratamiento</Form.Label><Form.Control as="textarea" rows={2} value={formData.tratamiento} onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })} required /></Form.Group>
            <Form.Group><Form.Label>Observaciones</Form.Label><Form.Control as="textarea" rows={2} value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} /></Form.Group>
          </div></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white d-flex justify-content-between"><span>MEDICAMENTOS</span><Button type="button" size="sm" variant="light" onClick={addMedicamento}>+ Agregar</Button></div><div className="card-body">
            {formData.medicamentos.map((med, idx) => (<Row key={idx} className="mb-2"><Col md="4"><Form.Control placeholder="Nombre" value={med.nombre} onChange={(e) => handleMedicamentoChange(idx, 'nombre', e.target.value)} /></Col><Col md="2"><Form.Control placeholder="Dosis" value={med.dosis} onChange={(e) => handleMedicamentoChange(idx, 'dosis', e.target.value)} /></Col><Col md="2"><Form.Control placeholder="Frecuencia" value={med.frecuencia} onChange={(e) => handleMedicamentoChange(idx, 'frecuencia', e.target.value)} /></Col><Col md="3"><Form.Control placeholder="Duración" value={med.duracion} onChange={(e) => handleMedicamentoChange(idx, 'duracion', e.target.value)} /></Col><Col md="1"><Button variant="danger" size="sm" onClick={() => removeMedicamento(idx)}><i className="fas fa-trash"></i></Button></Col></Row>))}
          </div></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white">PRÓXIMA CITA</div><div className="card-body"><Row>
            <Col md="6"><Form.Label>Fecha</Form.Label><Form.Control type="datetime-local" onChange={(e) => setFormData({ ...formData, proxima_cita: { ...formData.proxima_cita, fecha: e.target.value } })} /></Col>
            <Col md="6"><Form.Label>Motivo</Form.Label><Form.Control onChange={(e) => setFormData({ ...formData, proxima_cita: { ...formData.proxima_cita, motivo: e.target.value } })} /></Col>
          </Row></div></div>

          <div className="card mb-3"><div className="card-header bg-dark text-white">PROFESIONAL</div><div className="card-body"><Row>
            <Col md="6"><Form.Label>Nombre</Form.Label><Form.Control value={formData.profesional_nombre} onChange={(e) => setFormData({ ...formData, profesional_nombre: e.target.value })} required /></Col>
            <Col md="6"><Form.Label>Matrícula</Form.Label><Form.Control value={formData.profesional_matricula} onChange={(e) => setFormData({ ...formData, profesional_matricula: e.target.value })} required /></Col>
          </Row></div></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button type="submit" variant="dark" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default HistoriaClinicaModal;