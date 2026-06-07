import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

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
      console.log('🔐 Intentando login a:', `${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const rol = response.data.user.rol;
        console.log('✅ Login exitoso. Rol:', rol);
        
        if (rol === 'admin') navigate('/admin-dashboard');
        else if (rol === 'profesional') navigate('/profesional-dashboard');
        else navigate('/cliente-dashboard');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función para autocompletar credenciales
  const setCredenciales = (emailValue, passwordValue) => {
    setEmail(emailValue);
    setPassword(passwordValue);
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
            <Card style={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '15px' }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  {/* LOGO */}
                  <img 
                    src="/logo.png" 
                    alt="Logo Veterinaria" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '15px',
                      border: '2px solid #d4a017'
                    }} 
                  />
                  <h2 style={{ color: '#d4a017', marginTop: '10px' }}>VETERINARIA</h2>
                  <p style={{ color: '#aaa' }}>La Voz de los que no tienen voz</p>
                  <hr style={{ backgroundColor: '#333' }} />
                  <h4 style={{ color: '#fff' }}>Iniciar Sesión</h4>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#fff' }}>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingrese su email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: '#fff' }}>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                      required
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-100"
                    disabled={loading}
                    style={{ backgroundColor: '#d4a017', border: 'none', fontWeight: 'bold' }}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </Form>

                <hr style={{ backgroundColor: '#333', marginTop: '20px' }} />
                
                {/* SECCIÓN DE CREDENCIALES DE PRUEBA */}
                <div className="text-center">
                  <small style={{ color: '#666', fontSize: '0.7rem' }}>━━━━━━━━━━━ CREDENCIALES DE PRUEBA ━━━━━━━━━━━</small>
                  
                  {/* Credencial Administrador */}
                  <div 
                    className="mt-3 p-2 rounded" 
                    style={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #d4a017',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setCredenciales('admin@vet.com', 'admin123')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#d4a017' }}> ADMINISTRADOR</strong>
                        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>admin@vet.com</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>Contraseña: admin123</div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#d4a017' }}>Click</div>
                    </div>
                  </div>

                  {/* Credencial Profesional */}
                  <div 
                    className="mt-2 p-2 rounded" 
                    style={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setCredenciales('profesional@test.com', '123456')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#d4a017' }}> PROFESIONAL</strong>
                        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>profesional@test.com</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>Contraseña: 123456</div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#d4a017' }}>Click</div>
                    </div>
                  </div>

                  {/* Credencial Cliente */}
                  <div 
                    className="mt-2 p-2 rounded" 
                    style={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setCredenciales('cliente@test.com', '123456')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#d4a017' }}> CLIENTE</strong>
                        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>cliente@test.com</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>Contraseña: 123456</div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#d4a017' }}>Click</div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link to="/register" style={{ color: '#d4a017', textDecoration: 'none' }}>
                    ¿No tienes cuenta? Regístrate aquí
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