import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const VerHistoriaClinicaProfesional = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      const response = await api.get(`/medical-records/${id}`);
      setRecord(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPos = 20;

    // Título
    doc.setFontSize(16);
    doc.text('CONSEJO PROFESIONAL', 105, yPos, { align: 'center' });
    yPos += 7;
    doc.setFontSize(14);
    doc.text('DE MEDICINA VETERINARIA Y DE ZOOTECNIA DE COLOMBIA', 105, yPos, { align: 'center' });
    yPos += 7;
    doc.setFontSize(12);
    doc.text('FORMATO HISTORIA CLÍNICA VETERINARIA', 105, yPos, { align: 'center' });
    yPos += 10;

    // Datos del propietario
    doc.setFontSize(10);
    doc.text(`HC #: ${record.hc_numero || 'N/A'}`, 20, yPos);
    doc.text(`Fecha: ${new Date(record.fecha).toLocaleDateString()}`, 140, yPos);
    yPos += 7;
    doc.text(`Hora: ${new Date(record.fecha).toLocaleTimeString()}`, 20, yPos);
    yPos += 10;

    // Propietario
    doc.setFillColor(200, 200, 200);
    doc.rect(20, yPos, 170, 7, 'F');
    doc.text('DATOS DEL PROPIETARIO', 25, yPos + 5);
    yPos += 10;
    doc.text(`Nombre: ${record.propietario.nombre} ${record.propietario.apellidos}`, 20, yPos);
    doc.text(`Documento: ${record.propietario.tipo_documento} ${record.propietario.numero_documento}`, 120, yPos);
    yPos += 6;
    doc.text(`Dirección: ${record.propietario.direccion || 'N/A'}`, 20, yPos);
    doc.text(`Teléfono: ${record.propietario.telefono_celular || 'N/A'}`, 120, yPos);
    yPos += 10;

    // Paciente
    doc.setFillColor(200, 200, 200);
    doc.rect(20, yPos, 170, 7, 'F');
    doc.text('RESEÑA DEL PACIENTE', 25, yPos + 5);
    yPos += 10;
    doc.text(`Nombre: ${record.paciente.nombre}`, 20, yPos);
    doc.text(`Especie: ${record.paciente.especie}`, 80, yPos);
    doc.text(`Raza: ${record.paciente.raza || 'N/A'}`, 120, yPos);
    yPos += 6;
    doc.text(`Sexo: ${record.paciente.sexo}`, 20, yPos);
    doc.text(`Peso: ${record.paciente.peso_gr || 'N/A'} gr`, 80, yPos);
    doc.text(`Color: ${record.paciente.color_pelaje || 'N/A'}`, 120, yPos);
    yPos += 10;

    // Motivo y Diagnóstico
    doc.setFillColor(200, 200, 200);
    doc.rect(20, yPos, 170, 7, 'F');
    doc.text('CONSULTA', 25, yPos + 5);
    yPos += 10;
    doc.text(`Motivo: ${record.anamnesis.motivo_consulta}`, 20, yPos);
    yPos += 6;
    doc.text(`Diagnóstico: ${record.diagnostico_definitivo || record.diagnostico_presuntivo}`, 20, yPos);
    yPos += 10;

    // Tratamiento
    doc.setFillColor(200, 200, 200);
    doc.rect(20, yPos, 170, 7, 'F');
    doc.text('TRATAMIENTO', 25, yPos + 5);
    yPos += 10;
    const splitTratamiento = doc.splitTextToSize(record.plan_terapeutico || 'N/A', 160);
    doc.text(splitTratamiento, 20, yPos);
    yPos += splitTratamiento.length * 6 + 10;

    // Profesional
    doc.setFillColor(200, 200, 200);
    doc.rect(20, yPos, 170, 7, 'F');
    doc.text('PROFESIONAL', 25, yPos + 5);
    yPos += 10;
    doc.text(`Nombre: ${record.profesional.nombre}`, 20, yPos);
    doc.text(`Matrícula: ${record.profesional.matricula_profesional}`, 120, yPos);
    yPos += 10;
    doc.text(`Firma: ${record.profesional.firma || record.profesional.nombre}`, 20, yPos);

    doc.save(`historia_clinica_${record.hc_numero}.pdf`);
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;
  if (!record) return <div className="text-center mt-5">No se encontró la historia clínica</div>;

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h3>CONSEJO PROFESIONAL</h3>
        <h4>DE MEDICINA VETERINARIA Y DE ZOOTECNIA DE COLOMBIA</h4>
        <h5>FORMATO HISTORIA CLÍNICA VETERINARIA</h5>
        <hr />
      </div>

      <div className="text-end mb-3">
        <Button variant="dark" onClick={exportarPDF}>
          <i className="fas fa-file-pdf me-2"></i> Exportar a PDF
        </Button>
        <Button variant="secondary" className="ms-2" onClick={() => window.print()}>
          <i className="fas fa-print me-2"></i> Imprimir
        </Button>
      </div>

      {/* Resto del contenido - igual que antes */}
      <Row>
        <Col md="6"><Card><Card.Header className="bg-dark text-white">Identificación</Card.Header><Card.Body><p><strong>HC #:</strong> {record.hc_numero}</p><p><strong>Fecha:</strong> {new Date(record.fecha).toLocaleDateString()}</p><p><strong>Hora:</strong> {new Date(record.fecha).toLocaleTimeString()}</p></Card.Body></Card></Col>
        <Col md="6"><Card><Card.Header className="bg-dark text-white">Propietario</Card.Header><Card.Body><p><strong>Nombre:</strong> {record.propietario.nombre} {record.propietario.apellidos}</p><p><strong>Documento:</strong> {record.propietario.tipo_documento} {record.propietario.numero_documento}</p><p><strong>Teléfono:</strong> {record.propietario.telefono_celular}</p></Card.Body></Card></Col>
      </Row>

      <Card className="mt-3"><Card.Header className="bg-dark text-white">Paciente</Card.Header><Card.Body><Row><Col md="4"><strong>Nombre:</strong> {record.paciente.nombre}</Col><Col md="4"><strong>Especie:</strong> {record.paciente.especie}</Col><Col md="4"><strong>Raza:</strong> {record.paciente.raza}</Col><Col md="4"><strong>Sexo:</strong> {record.paciente.sexo}</Col><Col md="4"><strong>Peso:</strong> {record.paciente.peso_gr} gr</Col><Col md="4"><strong>Color:</strong> {record.paciente.color_pelaje}</Col></Row></Card.Body></Card>

      <Card className="mt-3"><Card.Header className="bg-dark text-white">Motivo de Consulta</Card.Header><Card.Body><p>{record.anamnesis.motivo_consulta}</p></Card.Body></Card>

      <Card className="mt-3"><Card.Header className="bg-dark text-white">Diagnóstico</Card.Header><Card.Body><p><strong>Presuntivo:</strong> {record.diagnostico_presuntivo || 'N/A'}</p><p><strong>Definitivo:</strong> {record.diagnostico_definitivo || 'N/A'}</p></Card.Body></Card>

      <Card className="mt-3"><Card.Header className="bg-dark text-white">Plan Terapéutico</Card.Header><Card.Body><p>{record.plan_terapeutico}</p></Card.Body></Card>

      <Card className="mt-3"><Card.Header className="bg-dark text-white">Profesional</Card.Header><Card.Body><Row><Col md="6"><strong>Nombre:</strong> {record.profesional.nombre}</Col><Col md="6"><strong>Matrícula:</strong> {record.profesional.matricula_profesional}</Col></Row></Card.Body></Card>
    </Container>
  );
};

export default VerHistoriaClinicaProfesional;