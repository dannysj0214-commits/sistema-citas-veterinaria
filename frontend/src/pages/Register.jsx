import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { register } from '../services/auth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirmPassword: '', telefono: '', rol: 'cliente' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true); setError('');
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/login');
    } catch (err) { setError(err.response?.data?.error || 'Error al registrar usuario'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      position: 'relative'
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: 'url("/logo.png")',
        backgroundRepeat: 'repeat',
        backgroundSize: '100px',
        pointerEvents: 'none'
      }}></div>
      
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center"><Col md={6}>
          <Card className="shadow" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <Card.Header className="bg-dark text-white text-center py-4" style={{ borderBottom: 'none' }}>
              <img 
                src="/logo.png" 
                alt="Logo Veterinaria" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  marginBottom: '15px',
                  backgroundColor: 'white',
                  padding: '8px'
                }} 
                onError={(e) => e.target.style.display = 'none'}
              />
              <h4 className="mb-0">Registrarse</h4>
              <small>Crea tu cuenta</small>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3"><Form.Label>Nombre completo</Form.Label><Form.Control type="text" name="nombre" placeholder="Juan Pérez" value={formData.nombre} onChange={handleChange} required style={{ borderRadius: '10px', padding: '12px' }} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} required style={{ borderRadius: '10px', padding: '12px' }} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Teléfono</Form.Label><Form.Control type="tel" name="telefono" placeholder="3001234567" value={formData.telefono} onChange={handleChange} style={{ borderRadius: '10px', padding: '12px' }} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Contraseña</Form.Label><Form.Control type="password" name="password" placeholder="••••••" value={formData.password} onChange={handleChange} required style={{ borderRadius: '10px', padding: '12px' }} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Confirmar contraseña</Form.Label><Form.Control type="password" name="confirmPassword" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} required style={{ borderRadius: '10px', padding: '12px' }} /></Form.Group>
                <Form.Group className="mb-4"><Form.Label>Tipo de cuenta</Form.Label><Form.Select name="rol" value={formData.rol} onChange={handleChange} style={{ borderRadius: '10px', padding: '12px' }}><option value="cliente">Cliente (Solicitar citas)</option><option value="profesional">Profesional (Ofrecer servicios)</option></Form.Select></Form.Group>
                <Button type="submit" variant="dark" className="w-100" disabled={loading} style={{ borderRadius: '10px', padding: '12px', fontWeight: 'bold' }}>{loading ? 'Registrando...' : 'Registrarse'}</Button>
              </Form>
              <hr /><div className="text-center"><Link to="/login" style={{ color: '#1a1a1a', textDecoration: 'none' }}>¿Ya tienes cuenta? Inicia sesión aquí</Link></div>
            </Card.Body>
          </Card>
        </Col></Row>
      </Container>
    </div>
  );
};

export default Register;