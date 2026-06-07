import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { FaDownload, FaChartPie, FaChartBar, FaUsers, FaCalendarCheck, FaFileMedical } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API_URL = 'http://localhost:5000/api';

const Reportes = () => {
  const [stats, setStats] = useState({
    citas: { total: 0, pendientes: 0, completadas: 0, canceladas: 0 },
    usuarios: { clientes: 0, profesionales: 0 },
    historias: 0
  });
  const [citasPorEstado, setCitasPorEstado] = useState([]);
  const [citasPorMes, setCitasPorMes] = useState([]);
  const [topProfesionales, setTopProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔵 Cargando datos de reportes...');
      
      // 1. Cargar estadísticas generales
      try {
        const statsRes = await axios.get(`${API_URL}/reports/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Stats:', statsRes.data);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error('❌ Error en stats:', err);
        setError('Error al cargar estadísticas');
      }
      
      // 2. Cargar citas por estado
      try {
        const estadoRes = await axios.get(`${API_URL}/reports/citas-por-estado`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Citas por estado:', estadoRes.data);
        setCitasPorEstado(estadoRes.data.data || []);
      } catch (err) {
        console.error('❌ Error en citas por estado:', err);
        setCitasPorEstado([]);
      }
      
      // 3. Cargar citas por mes
      try {
        const mesRes = await axios.get(`${API_URL}/reports/citas-por-mes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Citas por mes:', mesRes.data);
        setCitasPorMes(mesRes.data.data || []);
      } catch (err) {
        console.error('❌ Error en citas por mes:', err);
        setCitasPorMes([]);
      }
      
      // 4. Cargar top profesionales
      try {
        const topRes = await axios.get(`${API_URL}/reports/top-profesionales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Top profesionales:', topRes.data);
        setTopProfesionales(topRes.data.data || []);
      } catch (err) {
        console.error('❌ Error en top profesionales:', err);
        setTopProfesionales([]);
      }
      
    } catch (error) {
      console.error('❌ Error general:', error);
      setError('Error al cargar los datos de reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarJSON = async () => {
    try {
      setExportando(true);
      const response = await axios.get(`${API_URL}/reports/exportar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_citas_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Reporte exportado exitosamente');
      }
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al exportar los datos');
    } finally {
      setExportando(false);
    }
  };

  // Preparar datos para gráfico de pastel
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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} citas` } }
    }
  };

  // Preparar datos para gráfico de barras
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
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Distribución de Citas por Mes' },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw} citas` } }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Número de Citas' } },
      x: { title: { display: true, text: 'Meses del Año' } }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Cargando reportes...</span>
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
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reportes y Estadísticas</h2>
        <Button 
          variant="success" 
          onClick={handleExportarJSON}
          disabled={exportando}
        >
          <FaDownload className="me-2" />
          {exportando ? 'Exportando...' : 'Exportar a JSON'}
        </Button>
      </div>

      {/* Tarjetas de resumen */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-primary">
            <Card.Body>
              <FaCalendarCheck size={40} className="text-primary mb-2" />
              <h3>{stats.citas?.total || 0}</h3>
              <Card.Text>Total Citas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <FaUsers size={40} className="text-success mb-2" />
              <h3>{stats.usuarios?.clientes || 0}</h3>
              <Card.Text>Clientes Registrados</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-info">
            <Card.Body>
              <FaUsers size={40} className="text-info mb-2" />
              <h3>{stats.usuarios?.profesionales || 0}</h3>
              <Card.Text>Profesionales</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <FaFileMedical size={40} className="text-warning mb-2" />
              <h3>{stats.historias || 0}</h3>
              <Card.Text>Historias Clínicas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-primary text-white">
              <FaChartPie className="me-2" />
              Distribución por Estado
            </Card.Header>
            <Card.Body className="text-center">
              {citasPorEstado.length > 0 ? (
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              ) : (
                <p className="text-muted">No hay datos de citas por estado</p>
              )}
            </Card.Body>
            <Card.Footer className="text-muted">
              Total de citas analizadas: {stats.citas?.total || 0}
            </Card.Footer>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-primary text-white">
              <FaChartBar className="me-2" />
              Citas por Mes
            </Card.Header>
            <Card.Body>
              {citasPorMes.length > 0 ? (
                <Bar options={barOptions} data={barData} />
              ) : (
                <p className="text-muted text-center">No hay datos de citas por mes</p>
              )}
            </Card.Body>
            <Card.Footer className="text-muted">
              Distribución mensual de las citas
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Top Profesionales */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-success text-white">
              <FaUsers className="me-2" />
              Top Profesionales con más citas atendidas
            </Card.Header>
            <Card.Body>
              {topProfesionales.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr className="table-success">
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Especialidad</th>
                      <th>Citas Atendidas</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProfesionales.map((prof, index) => {
                      const porcentaje = stats.citas?.total > 0 
                        ? Math.round((prof.citas / stats.citas.total) * 100) 
                        : 0;
                      return (
                        <tr key={index}>
                          <td><strong>{index + 1}</strong></td>
                          <td>{prof.nombre}</td>
                          <td>{prof.especialidad || 'General'}</td>
                          <td>
                            <span className="badge bg-success rounded-pill">
                              {prof.citas} citas
                            </span>
                          </td>
                          <td>
                            <div className="progress" style={{ height: '20px' }}>
                              <div 
                                className="progress-bar bg-success" 
                                style={{ width: `${porcentaje}%` }}
                              >
                                {porcentaje}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center">No hay datos de profesionales</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumen detallado */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-info text-white">
              Resumen Detallado
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center border-end">
                  <h6 className="text-muted">Citas Completadas</h6>
                  <h2 className="text-success">{stats.citas?.completadas || 0}</h2>
                  <small className="text-muted">
                    {stats.citas?.total > 0 
                      ? `${Math.round((stats.citas.completadas / stats.citas.total) * 100)}% del total`
                      : '0% del total'}
                  </small>
                </Col>
                <Col md={3} className="text-center border-end">
                  <h6 className="text-muted">Citas Pendientes</h6>
                  <h2 className="text-warning">{stats.citas?.pendientes || 0}</h2>
                  <small className="text-muted">
                    {stats.citas?.total > 0 
                      ? `${Math.round((stats.citas.pendientes / stats.citas.total) * 100)}% del total`
                      : '0% del total'}
                  </small>
                </Col>
                <Col md={3} className="text-center border-end">
                  <h6 className="text-muted">Citas Canceladas</h6>
                  <h2 className="text-danger">{stats.citas?.canceladas || 0}</h2>
                  <small className="text-muted">
                    {stats.citas?.total > 0 
                      ? `${Math.round((stats.citas.canceladas / stats.citas.total) * 100)}% del total`
                      : '0% del total'}
                  </small>
                </Col>
                <Col md={3} className="text-center">
                  <h6 className="text-muted">Tasa de Éxito</h6>
                  <h2 className="text-primary">
                    {stats.citas?.total > 0 
                      ? Math.round((stats.citas.completadas / stats.citas.total) * 100) 
                      : 0}%
                  </h2>
                  <small className="text-muted">Citas completadas exitosamente</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Fecha de generación */}
      <div className="text-center mt-4">
        <small className="text-muted">
          Reporte generado el: {new Date().toLocaleString()}
        </small>
      </div>
    </Container>
  );
};

export default Reportes;