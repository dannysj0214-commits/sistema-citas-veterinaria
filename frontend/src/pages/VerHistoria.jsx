import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaFilePdf, FaUserMd, FaPaw, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VerHistoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historia, setHistoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const printRef = useRef();

  // Datos del veterinario
  const vetData = {
    nombre: 'Dany José Sarmiento Jiménez',
    titulo: 'Médico Veterinario',
    registro: 'MVP-78945',
    telefono: '301 234 5678',
    email: 'dannysj0214@gmail.com',
    direccion: 'Calle 123 #45-67, Bogotá, Colombia'
  };

  useEffect(() => {
    cargarHistoria();
  }, [id]);

  const cargarHistoria = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/medical-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Historia cargada:', response.data);
      setHistoria(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo cargar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Cargando historia clínica...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  if (!historia) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">No se encontró la historia clínica</Alert>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  return (
    <Container fluid className="historia-container">
      {/* Botones de acción - no se imprimen */}
      <div className="d-flex justify-content-end align-items-center mb-4 no-print" style={{ gap: '10px' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Volver
        </Button>
        <Button variant="primary" onClick={handleImprimir}>
          <FaPrint className="me-2" /> Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Contenido para imprimir - fondo blanco, letras negras */}
      <div ref={printRef} style={{ backgroundColor: 'white', color: 'black' }}>
        <Card style={{ border: 'none', boxShadow: 'none', backgroundColor: 'white' }}>
          {/* Encabezado de la clínica */}
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 20px 20px 20px', 
            borderBottom: '2px solid #1a1a1a',
            backgroundColor: 'white'
          }}>
            <h1 style={{ 
              color: '#1a1a1a', 
              fontSize: '24px', 
              fontWeight: 'bold',
              marginBottom: '5px',
              letterSpacing: '2px'
            }}>
              CLÍNICA VETERINARIA
            </h1>
            <h2 style={{ 
              color: '#333333', 
              fontSize: '16px', 
              fontStyle: 'italic',
              marginBottom: '10px'
            }}>
              "La Voz de los que no tienen voz"
            </h2>
            <div style={{ 
              fontSize: '11px', 
              color: '#555555',
              marginTop: '5px'
            }}>
              <FaPhone style={{ color: '#333', marginRight: '5px' }} /> Tel: {vetData.telefono} &nbsp;|&nbsp;
              <FaEnvelope style={{ color: '#333', marginRight: '5px' }} /> Email: {vetData.email} &nbsp;|&nbsp;
              <FaMapMarkerAlt style={{ color: '#333', marginRight: '5px' }} /> {vetData.direccion}
            </div>
          </div>

          {/* Título de Historia Clínica */}
          <div style={{ 
            textAlign: 'center', 
            padding: '15px', 
            backgroundColor: '#f0f0f0',
            margin: '20px 0'
          }}>
            <h3 style={{ 
              color: '#1a1a1a', 
              fontSize: '18px', 
              fontWeight: 'bold',
              margin: 0
            }}>
              HISTORIA CLÍNICA
            </h3>
            <p style={{ 
              color: '#333333', 
              fontSize: '12px', 
              margin: '5px 0 0 0'
            }}>
              N° {historia?.hc_numero}
            </p>
          </div>

          <div style={{ padding: '20px' }}>
            {/* DATOS DEL PROPIETARIO */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold',
                borderLeft: '3px solid #1a1a1a',
                paddingLeft: '10px',
                marginBottom: '15px'
              }}>
                DATOS DEL PROPIETARIO
              </h4>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '150px' }}>Nombre:</strong>
                <span style={{ color: '#333333' }}>{historia?.propietario}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '150px' }}>Fecha de Atención:</strong>
                <span style={{ color: '#333333' }}>{new Date(historia?.fecha).toLocaleDateString()}</span>
              </div>
            </div>

            {/* DATOS DEL PACIENTE */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold',
                borderLeft: '3px solid #1a1a1a',
                paddingLeft: '10px',
                marginBottom: '15px'
              }}>
                DATOS DEL PACIENTE
              </h4>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Nombre:</strong>
                <span style={{ color: '#333333', fontWeight: 'bold' }}>{historia?.paciente}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Especie:</strong>
                <span style={{ color: '#333333' }}>{historia?.especie || 'Canino'}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Raza:</strong>
                <span style={{ color: '#333333' }}>{historia?.raza || 'No registrada'}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Edad:</strong>
                <span style={{ color: '#333333' }}>{historia?.edad || 'No registrada'}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Peso:</strong>
                <span style={{ color: '#333333' }}>{historia?.peso || 'No registrado'} kg</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Temperatura:</strong>
                <span style={{ color: '#333333' }}>{historia?.temperatura || 'No registrada'} °C</span>
              </div>
            </div>

            {/* DIAGNÓSTICO */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold',
                borderLeft: '3px solid #1a1a1a',
                paddingLeft: '10px',
                marginBottom: '10px'
              }}>
                DIAGNÓSTICO
              </h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #dddddd',
                borderRadius: '4px',
                minHeight: '60px',
                color: '#1a1a1a'
              }}>
                {historia?.diagnostico || 'No registrado'}
              </div>
            </div>

            {/* TRATAMIENTO */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold',
                borderLeft: '3px solid #1a1a1a',
                paddingLeft: '10px',
                marginBottom: '10px'
              }}>
                TRATAMIENTO
              </h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #dddddd',
                borderRadius: '4px',
                minHeight: '60px',
                color: '#1a1a1a'
              }}>
                {historia?.tratamiento || 'No registrado'}
              </div>
            </div>

            {/* MEDICAMENTOS */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold',
                borderLeft: '3px solid #1a1a1a',
                paddingLeft: '10px',
                marginBottom: '10px'
              }}>
                MEDICAMENTOS RECETADOS
              </h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #dddddd',
                borderRadius: '4px',
                color: '#1a1a1a'
              }}>
                {historia?.medicamentos || 'No se recetaron medicamentos'}
              </div>
            </div>

            {/* OBSERVACIONES */}
            {historia?.observaciones && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ 
                  color: '#1a1a1a', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  borderLeft: '3px solid #1a1a1a',
                  paddingLeft: '10px',
                  marginBottom: '10px'
                }}>
                  OBSERVACIONES
                </h4>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f5f5f5', 
                  border: '1px solid #dddddd',
                  borderRadius: '4px',
                  color: '#1a1a1a'
                }}>
                  {historia?.observaciones}
                </div>
              </div>
            )}

            {/* DATOS DEL VETERINARIO */}
            <div style={{ marginBottom: '30px', marginTop: '30px' }}>
              <h4 style={{ 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold',
                borderLeft: '3px solid #1a1a1a',
                paddingLeft: '10px',
                marginBottom: '15px'
              }}>
                MÉDICO VETERINARIO
              </h4>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Nombre:</strong>
                <span style={{ color: '#333333' }}>{vetData.nombre}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Título:</strong>
                <span style={{ color: '#333333' }}>{vetData.titulo}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#1a1a1a', display: 'inline-block', width: '120px' }}>Registro Médico:</strong>
                <span style={{ color: '#333333' }}>{vetData.registro}</span>
              </div>
            </div>

            {/* FIRMAS */}
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #dddddd' }}>
              <Row>
                <Col md={6} style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '30px' }}>_________________________</div>
                  <strong style={{ color: '#1a1a1a' }}>Firma del Propietario</strong>
                  <div style={{ fontSize: '11px', color: '#666666', marginTop: '5px' }}>CC: ____________________</div>
                </Col>
                <Col md={6} style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '30px' }}>_________________________</div>
                  <strong style={{ color: '#1a1a1a' }}>Firma y Sello del Veterinario</strong>
                  <div style={{ fontSize: '11px', color: '#666666', marginTop: '5px' }}>{vetData.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#666666' }}>Registro: {vetData.registro}</div>
                </Col>
              </Row>
            </div>

            {/* PIE DE PÁGINA */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '40px', 
              paddingTop: '15px', 
              borderTop: '1px solid #dddddd',
              fontSize: '9px', 
              color: '#666666'
            }}>
              <div>Este documento es un registro médico válido según la ley 576 de 2000.</div>
              <div style={{ marginTop: '5px' }}>Documento generado electrónicamente - {new Date().toLocaleString()}</div>
              <div style={{ marginTop: '5px' }}>
                Clínica Veterinaria "La Voz de los que no tienen voz" - {vetData.telefono}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body, html, #root {
            background-color: white !important;
          }
          .container-fluid {
            padding: 0;
            margin: 0;
          }
          @page {
            size: letter;
            margin: 1.5cm;
          }
        }
      `}</style>
    </Container>
  );
};

export default VerHistoria;