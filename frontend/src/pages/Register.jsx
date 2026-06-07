import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://sistema-citas-api.onrender.com/api';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente',
    especialidad: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (!formData.nombre || !formData.email || !formData.password || !formData.telefono) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      rol: formData.rol
    };

    // Si es profesional, agregar especialidad
    if (formData.rol === 'profesional') {
      if (!formData.especialidad) {
        setError('La especialidad es requerida para profesionales');
        setLoading(false);
        return;
      }
      dataToSend.especialidad = formData.especialidad;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, dataToSend);
      
      if (response.data.success) {
        setSuccess('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Error al registrar usuario');
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
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card style={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div style={{ fontSize: '3rem' }}>🐕</div>
                  <h2 style={{ color: '#d4a017', marginTop: '10px' }}>VETERINARIA</h2>
                  <p style={{ color: '#aaa' }}>"La Voz de los que no tienen voz"</p>
                  <hr style={{ backgroundColor: '#333' }} />
                  <h4 style={{ color: '#fff' }}>Crear Cuenta</h4>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#fff' }}>Nombre completo *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                      placeholder="Ingrese su nombre completo"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#fff' }}>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#fff' }}>Contraseña *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#fff' }}>Teléfono *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                      placeholder="Ej: 3001234567"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#fff' }}>Tipo de cuenta *</Form.Label>
                    <Form.Select
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                    >
                      <option value="cliente">🐾 Cliente (Dueño de mascota)</option>
                      <option value="profesional">👨‍⚕️ Profesional (Veterinario)</option>
                    </Form.Select>
                  </Form.Group>

                  {formData.rol === 'profesional' && (
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#fff' }}>Especialidad *</Form.Label>
                      <Form.Control
                        type="text"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }}
                        placeholder="Ej: Cardiología, Dermatología, Cirugía"
                        required
                      />
                    </Form.Group>
                  )}

                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-100 mt-2"
                    disabled={loading}
                    style={{ backgroundColor: '#d4a017', border: 'none', fontWeight: 'bold' }}
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <Link to="/login" style={{ color: '#d4a017' }}>
                    ¿Ya tienes cuenta? Inicia sesión aquí
                  </Link>
                </div>

                <hr style={{ backgroundColor: '#333', marginTop: '20px' }} />
                
                <div className="text-center">
                  <small style={{ color: '#666' }}>Credenciales de prueba:</small>
                  <div className="mt-2" style={{ fontSize: '0.7rem', color: '#aaa' }}>
                    <p className="mb-1"><strong style={{ color: '#d4a017' }}>Admin:</strong> admin@vet.com / admin123</p>
                    <p className="mb-1"><strong style={{ color: '#d4a017' }}>Profesional:</strong> daniela@vet.com / 123456</p>
                    <p><strong style={{ color: '#d4a017' }}>Cliente:</strong> carlos@cliente.com / 123456</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;