import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://sistema-citas-api.onrender.com/api';

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
                  <div style={{ fontSize: '3rem' }}>🐕</div>
                  <h2 style={{ color: '#d4a017', marginTop: '10px' }}>VETERINARIA</h2>
                  <p style={{ color: '#aaa' }}>"La Voz de los que no tienen voz"</p>
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
                
                <div className="text-center">
                  <small style={{ color: '#666' }}>Credenciales de prueba:</small>
                  <div className="mt-2" style={{ fontSize: '0.7rem', color: '#aaa' }}>
                    <p className="mb-1"><strong style={{ color: '#d4a017' }}>Admin:</strong> admin@vet.com / admin123</p>
                    <p className="mb-1"><strong style={{ color: '#d4a017' }}>Profesional:</strong> daniela@vet.com / admin123</p>
                    <p><strong style={{ color: '#d4a017' }}>Cliente:</strong> carlos@cliente.com / admin123</p>
                  </div>
                  <Link to="/register" style={{ color: '#d4a017', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}>
                    ¿No tienes cuenta? Regístrate
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