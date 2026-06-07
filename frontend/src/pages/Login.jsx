import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const rol = response.data.user.rol;
        if (rol === 'admin') navigate('/admin-dashboard');
        else if (rol === 'profesional') navigate('/profesional-dashboard');
        else navigate('/cliente-dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5}>
            <Card style={{ 
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '15px',
              boxShadow: 'none'
            }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Logo Veterinaria" 
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '15px',
                      border: '2px solid #ffffff'
                    }} 
                  />
                  <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>VETERINARIA</h2>
                  <p style={{ color: '#999999', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '8px' }}>
                    LA VOZ DE LOS QUE NO TIENEN VOZ
                  </p>
                  <div style={{ 
                    width: '40px', 
                    height: '1px', 
                    backgroundColor: '#333333', 
                    margin: '20px auto' 
                  }} />
                  <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 'normal' }}>INICIAR SESIÓN</h4>
                </div>
                
                {error && <Alert variant="dark">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ffffff', fontSize: '0.8rem' }}>EMAIL</Form.Label>
                    <Form.Control
                      type="email"
                      style={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333333', 
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Ingrese su email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: '#ffffff', fontSize: '0.8rem' }}>CONTRASEÑA</Form.Label>
                    <Form.Control
                      type="password"
                      style={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333333', 
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      border: 'none', 
                      fontWeight: 'bold',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      color: '#000000',
                      fontSize: '0.9rem'
                    }} 
                    disabled={loading}
                  >
                    {loading ? 'INGRESANDO...' : 'INGRESAR'}
                  </Button>
                </Form>

                <div style={{ margin: '25px 0' }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, transparent, #333333, transparent)', 
                    height: '1px' 
                  }} />
                </div>
                
                <div className="text-center">
                  <small style={{ color: '#666666', fontSize: '0.7rem' }}>CREDENCIALES DE PRUEBA</small>
                  <div className="mt-2" style={{ fontSize: '0.7rem', color: '#999999' }}>
                    <p className="mb-1"><strong style={{ color: '#ffffff' }}>ADMIN:</strong> admin@test.com / admin123</p>
                    <p className="mb-1"><strong style={{ color: '#ffffff' }}>PROFESIONAL:</strong> profesional@test.com / 123456</p>
                    <p><strong style={{ color: '#ffffff' }}>CLIENTE:</strong> cliente@test.com / 123456</p>
                  </div>
                  <Link to="/register" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.75rem', marginTop: '15px', display: 'inline-block', borderBottom: '1px solid #333333' }}>
                    ¿NO TIENES CUENTA? REGÍSTRATE
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;