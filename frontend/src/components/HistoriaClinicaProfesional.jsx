import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Table } from 'react-bootstrap';
import api from '../services/api';

const HistoriaClinicaProfesional = ({ show, onHide, cita, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    propietario: {
      nombre: '',
      apellidos: '',
      tipo_documento: 'CC',
      numero_documento: '',
      direccion: '',
      telefono_fijo: '',
      telefono_celular: '',
      email: ''
    },
    paciente: {
      nombre: '',
      especie: '',
      raza: '',
      sexo: 'Macho',
      fecha_nacimiento: '',
      peso_gr: '',
      color_pelaje: '',
      chip_numero: '',
      otras_identificaciones: '',
      fin_zootecnico: '',
      origen_procedencia: ''
    },
    anamnesis: {
      dieta: '',
      enfermedades_previas: '',
      esterilizado: 'No',
      numero_partos: '',
      cirugias_previas: '',
      esquema_vacunal: '',
      ultima_desparasitacion: '',
      tratamientos_recientes: '',
      viajes_recientes: '',
      vive_con_otros_animales: '',
      comportamiento: '',
      motivo_consulta: cita?.motivo || ''
    },
    examen_fisico: {
      condicion_corporal: '',
      fc: '',
      fr: '',
      tllc: '',
      trpc: '',
      pulso: '',
      mucosas: '',
      porcentaje_deshidratacion: '',
      organos_sentidos: '',
      piel_pelaje: '',
      ganglios_linfaticos: '',
      sistema_digestivo: '',
      sistema_respiratorio: '',
      sistema_endocrino: '',
      sistema_musculo_esqueletico: '',
      sistema_nervioso: '',
      sistema_urinario: '',
      sistema_reproductivo: '',
      palpacion_rectal: '',
      otros: ''
    },
    abordaje_diagnostico: [{ lista_problemas: '', lista_maestra: '', diagnosticos_diferenciales: '' }],
    examenes_complementarios: [{ fecha_orden: '', examen: '', resultados: '' }],
    diagnostico_presuntivo: '',
    diagnostico_definitivo: '',
    plan_terapeutico: '',
    pronostico: '',
    evolucion: [{ fecha_hora: '', observaciones: '' }],
    observaciones: '',
    anexos: '',
    profesional: {
      nombre: '',
      matricula_profesional: ''
    }
  });

  useEffect(() => {
    if (cita) {
      setFormData(prev => ({
        ...prev,
        anamnesis: { ...prev.anamnesis, motivo_consulta: cita.motivo || '' }
      }));
    }
  }, [cita]);

  const handleChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const handleArrayChange = (section, index, field, value) => {
    const newArray = [...formData[section]];
    newArray[index][field] = value;
    setFormData({ ...formData, [section]: newArray });
  };

  const addArrayItem = (section, emptyItem) => {
    setFormData({
      ...formData,
      [section]: [...formData[section], emptyItem]
    });
  };

  const removeArrayItem = (section, index) => {
    const newArray = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/medical-records/professional', {
        cita_id: cita._id,
        ...formData
      });
      
      if (onSuccess) onSuccess();
      onHide();
      alert('✅ Historia clínica guardada exitosamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static" style={{ maxWidth: '95%', marginLeft: '2.5%' }}>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>
          <i className="fas fa-file-medical me-2"></i>
          FORMATO HISTORIA CLÍNICA VETERINARIA
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="text-center mb-4">
            <h3>CONSEJO PROFESIONAL</h3>
            <h4>DE MEDICINA VETERINARIA Y DE ZOOTECNIA DE COLOMBIA</h4>
            <h5>FORMATO HISTORIA CLÍNICA VETERINARIA</h5>
            <hr />
          </div>

          {/* 1. Información de la Institución */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">1. Información de la Institución</div>
            <div className="card-body">
              <Row>
                <Col md="8"><Form.Label>Nombre</Form.Label><Form.Control type="text" defaultValue="Veterinaria - La Voz de los que no tienen voz" disabled /></Col>
                <Col md="4"><Form.Label>Teléfono</Form.Label><Form.Control type="text" defaultValue="302 116 70 98" disabled /></Col>
              </Row>
            </div>
          </div>

          {/* 2. Identificación */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">2. Identificación de la Historia clínica</div>
            <div className="card-body">
              <Row>
                <Col md="4"><Form.Label>HC #</Form.Label><Form.Control type="text" placeholder="Automático" disabled /></Col>
                <Col md="4"><Form.Label>Fecha</Form.Label><Form.Control type="date" value={new Date().toISOString().split('T')[0]} disabled /></Col>
                <Col md="4"><Form.Label>Hora</Form.Label><Form.Control type="time" value={new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} disabled /></Col>
              </Row>
            </div>
          </div>

          {/* 3. Datos del propietario */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">3. Datos del propietario</div>
            <div className="card-body">
              <Row>
                <Col md="6"><Form.Label>Nombre</Form.Label><Form.Control value={formData.propietario.nombre} onChange={(e) => handleChange('propietario', 'nombre', e.target.value)} required /></Col>
                <Col md="6"><Form.Label>Apellidos</Form.Label><Form.Control value={formData.propietario.apellidos} onChange={(e) => handleChange('propietario', 'apellidos', e.target.value)} required /></Col>
                <Col md="3"><Form.Label>Tipo Doc.</Form.Label><Form.Select value={formData.propietario.tipo_documento} onChange={(e) => handleChange('propietario', 'tipo_documento', e.target.value)}><option value="CC">CC</option><option value="TI">TI</option><option value="CE">CE</option><option value="NIT">NIT</option></Form.Select></Col>
                <Col md="3"><Form.Label>Número</Form.Label><Form.Control value={formData.propietario.numero_documento} onChange={(e) => handleChange('propietario', 'numero_documento', e.target.value)} required /></Col>
                <Col md="6"><Form.Label>Dirección</Form.Label><Form.Control value={formData.propietario.direccion} onChange={(e) => handleChange('propietario', 'direccion', e.target.value)} /></Col>
                <Col md="3"><Form.Label>Teléfono fijo</Form.Label><Form.Control value={formData.propietario.telefono_fijo} onChange={(e) => handleChange('propietario', 'telefono_fijo', e.target.value)} /></Col>
                <Col md="3"><Form.Label>Teléfono celular</Form.Label><Form.Control value={formData.propietario.telefono_celular} onChange={(e) => handleChange('propietario', 'telefono_celular', e.target.value)} required /></Col>
                <Col md="6"><Form.Label>Email</Form.Label><Form.Control type="email" value={formData.propietario.email} onChange={(e) => handleChange('propietario', 'email', e.target.value)} /></Col>
              </Row>
            </div>
          </div>

          {/* 4. Reseña */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">4. Reseña</div>
            <div className="card-body">
              <Row>
                <Col md="4"><Form.Label>Nombre paciente</Form.Label><Form.Control value={formData.paciente.nombre} onChange={(e) => handleChange('paciente', 'nombre', e.target.value)} required /></Col>
                <Col md="4"><Form.Label>Especie</Form.Label><Form.Control value={formData.paciente.especie} onChange={(e) => handleChange('paciente', 'especie', e.target.value)} required /></Col>
                <Col md="4"><Form.Label>Raza</Form.Label><Form.Control value={formData.paciente.raza} onChange={(e) => handleChange('paciente', 'raza', e.target.value)} /></Col>
                <Col md="3"><Form.Label>Sexo</Form.Label><Form.Select value={formData.paciente.sexo} onChange={(e) => handleChange('paciente', 'sexo', e.target.value)}><option value="Macho">Macho</option><option value="Hembra">Hembra</option><option value="Macho Esterilizado">Macho Esterilizado</option><option value="Hembra Esterilizada">Hembra Esterilizada</option></Form.Select></Col>
                <Col md="3"><Form.Label>Fecha nacimiento</Form.Label><Form.Control type="date" value={formData.paciente.fecha_nacimiento} onChange={(e) => handleChange('paciente', 'fecha_nacimiento', e.target.value)} /></Col>
                <Col md="3"><Form.Label>Peso (gr)</Form.Label><Form.Control type="number" value={formData.paciente.peso_gr} onChange={(e) => handleChange('paciente', 'peso_gr', e.target.value)} /></Col>
                <Col md="3"><Form.Label>Color pelaje</Form.Label><Form.Control value={formData.paciente.color_pelaje} onChange={(e) => handleChange('paciente', 'color_pelaje', e.target.value)} /></Col>
              </Row>
            </div>
          </div>

          {/* 5. Anamnesis - Motivo de consulta */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">5. Motivo de consulta</div>
            <div className="card-body">
              <Form.Control as="textarea" rows={3} value={formData.anamnesis.motivo_consulta} onChange={(e) => handleChange('anamnesis', 'motivo_consulta', e.target.value)} required />
            </div>
          </div>

          {/* 6. Diagnóstico */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">6. Diagnóstico</div>
            <div className="card-body">
              <Form.Group className="mb-3"><Form.Label>Diagnóstico Presuntivo</Form.Label><Form.Control as="textarea" rows={2} value={formData.diagnostico_presuntivo} onChange={(e) => setFormData({ ...formData, diagnostico_presuntivo: e.target.value })} /></Form.Group>
              <Form.Group><Form.Label>Diagnóstico Definitivo</Form.Label><Form.Control as="textarea" rows={2} value={formData.diagnostico_definitivo} onChange={(e) => setFormData({ ...formData, diagnostico_definitivo: e.target.value })} required /></Form.Group>
            </div>
          </div>

          {/* 7. Plan Terapéutico */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">7. Plan Terapéutico</div>
            <div className="card-body">
              <Form.Control as="textarea" rows={3} value={formData.plan_terapeutico} onChange={(e) => setFormData({ ...formData, plan_terapeutico: e.target.value })} required />
            </div>
          </div>

          {/* 8. Profesional */}
          <div className="card mb-3">
            <div className="card-header bg-dark text-white">8. Datos del Profesional</div>
            <div className="card-body">
              <Row>
                <Col md="6"><Form.Label>Nombre MV o MVZ tratante</Form.Label><Form.Control value={formData.profesional.nombre} onChange={(e) => handleChange('profesional', 'nombre', e.target.value)} required /></Col>
                <Col md="6"><Form.Label>Matrícula profesional</Form.Label><Form.Control value={formData.profesional.matricula_profesional} onChange={(e) => handleChange('profesional', 'matricula_profesional', e.target.value)} required /></Col>
              </Row>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button type="submit" variant="dark" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Historia Clínica'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default HistoriaClinicaProfesional;