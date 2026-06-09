import React, { useState, useEffect } from 'react';
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

  // Datos de la clínica (solo para contacto, no para el veterinario)
  const clinicaData = {
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
      setHistoria(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo cargar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    // Crear una ventana nueva para imprimir
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Historia Clínica - Veterinaria</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
            padding: 40px;
          }
          .historia-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #1a1a1a;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #1a1a1a;
          }
          .header h2 {
            font-size: 14px;
            font-style: italic;
            margin: 5px 0;
            color: #333;
          }
          .header .contacto {
            font-size: 10px;
            color: #555;
            margin-top: 8px;
          }
          .titulo {
            text-align: center;
            background: #f0f0f0;
            padding: 10px;
            margin: 20px 0;
            border: 1px solid #ddd;
          }
          .titulo h3 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            color: #1a1a1a;
          }
          .titulo p {
            font-size: 12px;
            margin: 5px 0 0;
            color: #555;
          }
          .seccion {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
          }
          .seccion-titulo {
            background: #1a1a1a;
            color: white;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: bold;
          }
          .tabla-datos {
            width: 100%;
            border-collapse: collapse;
          }
          .tabla-datos td {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
          }
          .tabla-datos .label {
            width: 25%;
            font-weight: bold;
            background: #f9f9f9;
            color: #333;
          }
          .tabla-datos .valor {
            width: 25%;
            color: #1a1a1a;
          }
          .caja-texto {
            padding: 12px;
            background: #f9f9f9;
            min-height: 60px;
            color: #1a1a1a;
            line-height: 1.5;
          }
          .firmas {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .firma {
            text-align: center;
            width: 45%;
          }
          .firma .linea {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .firma .texto {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .firma .cc {
            font-size: 10px;
            color: #555;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 9px;
            color: #666;
          }
          .footer p {
            margin: 3px 0;
          }
          @media print {
            body {
              padding: 0;
            }
            @page {
              size: letter;
              margin: 1.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="historia-container">
          <div class="header">
            <h1>CLÍNICA VETERINARIA</h1>
            <h2>"La Voz de los que no tienen voz"</h2>
            <div class="contacto">
              Tel: ${clinicaData.telefono} | Email: ${clinicaData.email} | ${clinicaData.direccion}
            </div>
          </div>
          <div class="titulo">
            <h3>HISTORIA CLÍNICA</h3>
            <p>N° ${historia?.hc_numero}</p>
          </div>
          <div class="seccion">
            <div class="seccion-titulo">📋 DATOS DEL PROPIETARIO</div>
            <table class="tabla-datos">
              <tr><td class="label">Nombre:</td><td class="valor">${historia?.propietario}</td><td class="label">Fecha de Atención:</td><td class="valor">${new Date(historia?.fecha).toLocaleDateString()}</td></tr>
            </table>
          </div>
          <div class="seccion">
            <div class="seccion-titulo">🐾 DATOS DEL PACIENTE</div>
            <table class="tabla-datos">
              <tr><td class="label">Nombre:</td><td class="valor"><strong>${historia?.paciente}</strong></td><td class="label">Especie:</td><td class="valor">${historia?.especie || 'Canino'}</td></tr>
              <tr><td class="label">Raza:</td><td class="valor">${historia?.raza || 'No registrada'}</td><td class="label">Edad:</td><td class="valor">${historia?.edad || 'No registrada'}</td></tr>
              <tr><td class="label">Peso:</td><td class="valor">${historia?.peso || 'No registrado'} kg</td><td class="label">Temperatura:</td><td class="valor">${historia?.temperatura || 'No registrada'} °C</td></tr>
            </table>
          </div>
          <div class="seccion">
            <div class="seccion-titulo">📝 DIAGNÓSTICO</div>
            <div class="caja-texto">${historia?.diagnostico || 'No registrado'}</div>
          </div>
          <div class="seccion">
            <div class="seccion-titulo">💊 TRATAMIENTO</div>
            <div class="caja-texto">${historia?.tratamiento || 'No registrado'}</div>
          </div>
          <div class="seccion">
            <div class="seccion-titulo">💊 MEDICAMENTOS RECETADOS</div>
            <div class="caja-texto">${historia?.medicamentos || 'No se recetaron medicamentos'}</div>
          </div>
          ${historia?.observaciones ? `
          <div class="seccion">
            <div class="seccion-titulo">📌 OBSERVACIONES</div>
            <div class="caja-texto">${historia?.observaciones}</div>
          </div>` : ''}
          <div class="seccion">
            <div class="seccion-titulo">👨‍⚕️ MÉDICO VETERINARIO</div>
            <table class="tabla-datos">
              <tr><td class="label">Nombre:</td><td colspan="3"><strong>${historia?.profesional || 'No registrado'}</strong></td}</tr>
              <tr><td class="label">Título:</td><td colspan="3">Médico Veterinario</td}</tr>
              <tr><td class="label">Registro Médico:</td><td colspan="3">MVP-${historia?.hc_numero || '000000'}</td}</tr>
            </table>
          </div>
          <div class="firmas">
            <div class="firma"><div class="linea">_________________________</div><div class="texto">Firma del Propietario</div><div class="cc">CC: ____________________</div></div>
            <div class="firma"><div class="linea">_________________________</div><div class="texto">Firma y Sello del Veterinario</div><div class="cc">${historia?.profesional || ''}</div><div class="cc">Registro: MVP-${historia?.hc_numero || '000000'}</div></div>
          </div>
          <div class="footer">
            <p>Este documento es un registro médico válido según la ley 576 de 2000.</p>
            <p>Documento generado electrónicamente - ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 1000); };
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
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
    <Container fluid>
      {/* Botones de acción */}
      <div className="d-flex justify-content-end align-items-center mb-4" style={{ gap: '10px' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Volver
        </Button>
        <Button variant="primary" onClick={handleImprimir}>
          <FaPrint className="me-2" /> Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Vista previa de la historia clínica */}
      <div className="historia-container" style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        background: 'white', 
        fontFamily: 'Segoe UI, Arial, sans-serif',
        padding: '40px',
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}>
        <div className="header" style={{ textAlign: 'center', borderBottom: '3px solid #1a1a1a', paddingBottom: '20px', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>CLÍNICA VETERINARIA</h1>
          <h2 style={{ fontSize: '14px', fontStyle: 'italic', margin: '5px 0' }}>"La Voz de los que no tienen voz"</h2>
          <div style={{ fontSize: '10px', color: '#555', marginTop: '8px' }}>
            Tel: ${clinicaData.telefono} | Email: ${clinicaData.email} | ${clinicaData.direccion}
          </div>
        </div>

        <div className="titulo" style={{ textAlign: 'center', background: '#f0f0f0', padding: '10px', margin: '20px 0', border: '1px solid #ddd' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>HISTORIA CLÍNICA</h3>
          <p style={{ fontSize: '12px', margin: '5px 0 0' }}>N° {historia?.hc_numero}</p>
        </div>

        <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>📋 DATOS DEL PROPIETARIO</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%', padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Nombre:</td>
                <td style={{ width: '25%', padding: '8px 12px' }}>{historia?.propietario}</td>
                <td style={{ width: '25%', padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Fecha de Atención:</td>
                <td style={{ width: '25%', padding: '8px 12px' }}>{new Date(historia?.fecha).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>🐾 DATOS DEL PACIENTE</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <td><td style={{ width: '25%', padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Nombre:</td><td style={{ width: '25%', padding: '8px 12px' }}><strong>{historia?.paciente}</strong></td><td style={{ width: '25%', padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Especie:</td><td style={{ width: '25%', padding: '8px 12px' }}>{historia?.especie || 'Canino'}</td></tr>
              <tr><td style={{ padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Raza:</td><td style={{ padding: '8px 12px' }}>{historia?.raza || 'No registrada'}</td><td style={{ padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Edad:</td><td style={{ padding: '8px 12px' }}>{historia?.edad || 'No registrada'}</td></tr>
              <tr><td style={{ padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Peso:</td><td style={{ padding: '8px 12px' }}>{historia?.peso || 'No registrado'} kg</td><td style={{ padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Temperatura:</td><td style={{ padding: '8px 12px' }}>{historia?.temperatura || 'No registrada'} °C</td}</tr>
            </tbody>
          </table>
        </div>

        <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>📝 DIAGNÓSTICO</div>
          <div style={{ padding: '12px', background: '#f9f9f9', minHeight: '60px' }}>{historia?.diagnostico || 'No registrado'}</div>
        </div>

        <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>💊 TRATAMIENTO</div>
          <div style={{ padding: '12px', background: '#f9f9f9', minHeight: '60px' }}>{historia?.tratamiento || 'No registrado'}</div>
        </div>

        <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>💊 MEDICAMENTOS RECETADOS</div>
          <div style={{ padding: '12px', background: '#f9f9f9' }}>{historia?.medicamentos || 'No se recetaron medicamentos'}</div>
        </div>

        {historia?.observaciones && (
          <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
            <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>📌 OBSERVACIONES</div>
            <div style={{ padding: '12px', background: '#f9f9f9' }}>{historia?.observaciones}</div>
          </div>
        )}

        <div className="seccion" style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="seccion-titulo" style={{ background: '#1a1a1a', color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold' }}>👨‍⚕️ MÉDICO VETERINARIO</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ width: '25%', padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Nombre:</td><td style={{ width: '75%', padding: '8px 12px' }} colSpan="3"><strong>{historia?.profesional || 'No registrado'}</strong></td}</tr>
              <tr><td style={{ padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Título:</td><td style={{ padding: '8px 12px' }}>Médico Veterinario</td}还<td style={{ padding: '8px 12px', fontWeight: 'bold', background: '#f9f9f9' }}>Registro Médico:</td><td style={{ padding: '8px 12px' }}>MVP-${historia?.hc_numero || '000000'}</td}</tr>
            </tbody>
          </table>
        </div>

        <div className="firmas" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ marginBottom: '10px' }}>_________________________</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Firma del Propietario</div>
            <div style={{ fontSize: '10px', color: '#555' }}>CC: ____________________</div>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ marginBottom: '10px' }}>_________________________</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Firma y Sello del Veterinario</div>
            <div style={{ fontSize: '10px', color: '#555' }}>{historia?.profesional || ''}</div>
            <div style={{ fontSize: '10px', color: '#555' }}>Registro: MVP-${historia?.hc_numero || '000000'}</div>
          </div>
        </div>

        <div className="footer" style={{ textAlign: 'center', marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #ddd', fontSize: '9px', color: '#666' }}>
          <p>Este documento es un registro médico válido según la ley 576 de 2000.</p>
          <p>Documento generado electrónicamente - {new Date().toLocaleString()}</p>
        </div>
      </div>
    </Container>
  );
};

export default VerHistoria;