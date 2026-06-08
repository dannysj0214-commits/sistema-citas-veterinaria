import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { FaUsers, FaUserMd, FaCalendarCheck, FaClipboardList } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// FORZAR LA URL DEL BACKEND EN LOCALHOST
const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    citas: { total: 0, pendientes: 0, completadas: 0, canceladas: 0 },
    usuarios: { clientes: 0, profesionales: 0 },
    historias: 0
  });
  const [citasPorMes, setCitasPorMes] = useState([]);
  const [citasPorEstado, setCitasPorEstado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔵 Cargando datos de admin...');
      console.log('🔗 API_URL:', API_URL);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token usado en petición:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN');
      
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // 1. Cargar estadísticas generales
      try {
        const statsRes = await axios.get(`${API_URL}/reports/stats`, config);
        console.log('✅ Stats response:', statsRes.data);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error('❌ Error en stats:', err);
        setError('Error al cargar estadísticas');
      }
      
      // 2. Cargar citas por estado
      try {
        const estadoRes = await axios.get(`${API_URL}/reports/citas-por-estado`, config);
        console.log('✅ Citas por estado:', estadoRes.data);
        setCitasPorEstado(estadoRes.data.data || []);
      } catch (err) {
        console.error('❌ Error en citas por estado:', err);
        setCitasPorEstado([]);
      }
      
      // 3. Cargar citas por mes
      try {
        const mesRes = await axios.get(`${API_URL}/reports/citas-por-mes`, config);
        console.log('✅ Citas por mes:', mesRes.data);
        setCitasPorMes(mesRes.data.data || []);
      } catch (err) {
        console.error('❌ Error en citas por mes:', err);
        setCitasPorMes([]);
      }
      
    } catch (error) {
      console.error('❌ Error general:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const pieData = {
    labels: citasPorEstado.length > 0 
      ? citasPorEstado.map(item => {
          const estados = {
            'pendiente': 'Pendientes',
            'confirmada': 'Confirmadas',
            'completada': 'Completadas',
            'cancelada': 'Canceladas',
            'rechazada': 'Rechazadas'
          };
          return estados[item._id] || item._id;
        })
      : ['Sin datos'],
    datasets: [
      {
        data: citasPorEstado.length > 0 
          ? citasPorEstado.map(item => item.count)
          : [1],
        backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545', '#6c757d'],
        borderWidth: 1,
      },
    ],
  };

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const citasPorMesData = new Array(12).fill(0);
  
  if (citasPorMes.length > 0) {
    citasPorMes.forEach(item => {
      if (item._id && item._id.mes >= 1 && item._id.mes <= 12) {
        citasPorMesData[item._id.mes - 1] = item.count;
      }
    });
  }

  const barData = {
    labels: meses,
    datasets: [
      {
        label: 'Citas',
        data: citasPorMesData,
        backgroundColor: '#36A2EB',
        borderRadius: 5,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Citas por Mes' },
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={cargarDatos}>Reintentar</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: 'url(/logo.png)',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundColor: '#000000',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 0
      }} />
      
      <Container fluid style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        <div className="text-center mb-4">
          <h2 style={{ color: '#d4a017' }}>Panel de Administración</h2>
          <p style={{ color: '#aaa' }}>"La Voz de los que no tienen voz"</p>
        </div>
        
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-primary" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Card.Body>
                <FaUsers size={40} className="text-primary mb-2" />
                <h3 style={{ color: '#fff' }}>{stats.usuarios?.clientes || 0}</h3>
                <Card.Text style={{ color: '#aaa' }}>Clientes Registrados</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-success" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Card.Body>
                <FaUserMd size={40} className="text-success mb-2" />
                <h3 style={{ color: '#fff' }}>{stats.usuarios?.profesionales || 0}</h3>
                <Card.Text style={{ color: '#aaa' }}>Profesionales</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-warning" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Card.Body>
                <FaCalendarCheck size={40} className="text-warning mb-2" />
                <h3 style={{ color: '#fff' }}>{stats.citas?.total || 0}</h3>
                <Card.Text style={{ color: '#aaa' }}>Total Citas</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-info" style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Card.Body>
                <FaClipboardList size={40} className="text-info mb-2" />
                <h3 style={{ color: '#fff' }}>{stats.citas?.pendientes || 0}</h3>
                <Card.Text style={{ color: '#aaa' }}>Citas Pendientes</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333' }}>
              <Card.Header style={{ backgroundColor: '#1a1a1a', color: '#d4a017' }}>Distribución de Citas por Estado</Card.Header>
              <Card.Body className="text-center">
                {citasPorEstado.length > 0 ? (
                  <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <Pie data={pieData} />
                  </div>
                ) : (
                  <p className="text-muted">No hay datos de citas por estado</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333' }}>
              <Card.Header style={{ backgroundColor: '#1a1a1a', color: '#d4a017' }}>Citas por Mes</Card.Header>
              <Card.Body>
                {citasPorMes.length > 0 ? (
                  <Bar options={barOptions} data={barData} />
                ) : (
                  <p className="text-muted text-center">No hay datos de citas por mes</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card style={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333' }}>
              <Card.Header style={{ backgroundColor: '#1a1a1a', color: '#d4a017' }}>Resumen General</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center">
                    <h6 style={{ color: '#aaa' }}>Citas Completadas</h6>
                    <h4 style={{ color: '#28a745' }}>{stats.citas?.completadas || 0}</h4>
                  </Col>
                  <Col md={3} className="text-center">
                    <h6 style={{ color: '#aaa' }}>Citas Canceladas</h6>
                    <h4 style={{ color: '#dc3545' }}>{stats.citas?.canceladas || 0}</h4>
                  </Col>
                  <Col md={3} className="text-center">
                    <h6 style={{ color: '#aaa' }}>Tasa de Éxito</h6>
                    <h4 style={{ color: '#17a2b8' }}>
                      {stats.citas?.total > 0 
                        ? Math.round((stats.citas.completadas / stats.citas.total) * 100) 
                        : 0}%
                    </h4>
                  </Col>
                  <Col md={3} className="text-center">
                    <h6 style={{ color: '#aaa' }}>Historias Clínicas</h6>
                    <h4 style={{ color: '#007bff' }}>{stats.historias || 0}</h4>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;