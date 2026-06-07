import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Toast, ToastContainer } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

// FORZAR URL DEL BACKEND EN RENDER
const API_URL = 'https://sistema-citas-api.onrender.com/api';

const Profesionales = () => {
  const [profesionales, setProfesionales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProfesional, setSelectedProfesional] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    especialidad: ''
  });

  const token = localStorage.getItem('token');

  const showMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const cargarProfesionales = async () => {
    try {
      console.log('🔵 Cargando profesionales desde:', `${API_URL}/admin/usuarios`);
      const response = await axios.get(`${API_URL}/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Respuesta:', response.data);
      const todos = response.data.data;
      const soloProfesionales = todos.filter(u => u.rol === 'profesional');
      setProfesionales(soloProfesionales);
    } catch (error) {
      console.error('❌ Error al cargar profesionales:', error);
      showMessage('Error al cargar profesionales', 'danger');
    }
  };

  useEffect(() => {
    cargarProfesionales();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAgregar = () => {
    setEditMode(false);
    setSelectedProfesional(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      especialidad: ''
    });
    setShowModal(true);
  };

  const handleEditar = (profesional) => {
    setEditMode(true);
    setSelectedProfesional(profesional);
    setFormData({
      nombre: profesional.nombre,
      email: profesional.email,
      telefono: profesional.telefono,
      especialidad: profesional.especialidad || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleGuardar = async () => {
    try {
      if (editMode) {
        const dataToSend = {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          rol: 'profesional',
          especialidad: formData.especialidad
        };
        
        const response = await axios.put(
          `${API_URL}/admin/usuarios/${selectedProfesional._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          showMessage('Profesional actualizado correctamente');
          cargarProfesionales();
          setShowModal(false);
        }
      } else {
        if (!formData.password) {
          showMessage('La contraseña es requerida', 'danger');
          return;
        }
        
        const response = await axios.post(
          `${API_URL}/admin/usuarios`,
          {
            ...formData,
            rol: 'profesional'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          showMessage('Profesional creado correctamente');
          cargarProfesionales();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      showMessage(error.response?.data?.message || 'Error al guardar', 'danger');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        const response = await axios.delete(
          `${API_URL}/admin/usuarios/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          showMessage('Profesional eliminado correctamente');
          cargarProfesionales();
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        showMessage(error.response?.data?.message || 'Error al eliminar', 'danger');
      }
    }
  };

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
      
      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#d4a017' }}>Gestión de Profesionales</h2>
          <Button variant="primary" onClick={handleAgregar} style={{ backgroundColor: '#d4a017', border: 'none' }}>
            <FaUserPlus className="me-2" /> Agregar Profesional
          </Button>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th style={{ color: '#d4a017' }}>Nombre</th>
                <th style={{ color: '#d4a017' }}>Email</th>
                <th style={{ color: '#d4a017' }}>Teléfono</th>
                <th style={{ color: '#d4a017' }}>Especialidad</th>
                <th style={{ color: '#d4a017' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map(prof => (
                <tr key={prof._id}>
                  <td style={{ color: '#fff' }}>{prof.nombre}</td>
                  <td style={{ color: '#fff' }}>{prof.email}</td>
                  <td style={{ color: '#fff' }}>{prof.telefono}</td>
                  <td style={{ color: '#fff' }}>{prof.especialidad || '-'}</td>
                  <td>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEditar(prof)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleEliminar(prof._id, prof.nombre)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {profesionales.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center" style={{ color: '#fff' }}>No hay profesionales registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para agregar/editar */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? 'Editar Profesional' : 'Agregar Profesional'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              {!editMode && (
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Especialidad</Form.Label>
                <Form.Control
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleInputChange}
                  placeholder="Ej: Cardiología, Dermatología, etc."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleGuardar}>
              {editMode ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast para mensajes */}
        <ToastContainer position="top-end" className="p-3">
          <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
            <Toast.Header>
              <strong className="me-auto">Notificación</strong>
            </Toast.Header>
            <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

export default Profesionales;