import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Badge, Dropdown } from 'react-bootstrap';
import { Bell, PersonCircle, Gear } from 'react-bootstrap-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const NavigationBar = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || [];
      setNotificaciones(data.slice(0, 5));
      setNoLeidas(data.filter(n => !n.leido).length);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarNotificaciones();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Navbar style={{ 
      backgroundColor: '#000000', 
      borderBottom: '1px solid #222222', 
      padding: '10px 25px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
    }}>
      <Navbar.Brand style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%',
            objectFit: 'cover'
          }} 
        />
        <div>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '0.9rem', 
            color: '#ffffff',
            letterSpacing: '1px'
          }}>
            VETERINARIA
          </span>
          <small style={{ 
            display: 'block', 
            fontSize: '7px', 
            color: '#999999', 
            marginTop: '-2px',
            fontWeight: 'bold'
          }}>
            LA VOZ DE LOS QUE NO TIENEN VOZ
          </small>
        </div>
      </Navbar.Brand>
      
      <Nav className="ms-auto" style={{ alignItems: 'center', gap: '15px' }}>
        {/* Notificaciones */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="link" style={{ color: '#ffffff', textDecoration: 'none', position: 'relative', padding: '0' }}>
            <Bell size={20} />
            {noLeidas > 0 && (
              <Badge 
                bg="dark" 
                pill 
                style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '-12px', 
                  fontSize: '9px',
                  padding: '2px 5px',
                  backgroundColor: '#333333',
                  color: '#ffffff'
                }}
              >
                {noLeidas}
              </Badge>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ 
            backgroundColor: '#111111', 
            border: '1px solid #333333',
            borderRadius: '10px',
            minWidth: '300px'
          }}>
            <Dropdown.Header style={{ color: '#ffffff', fontWeight: 'bold', padding: '12px 15px' }}>
               NOTIFICACIONES
            </Dropdown.Header>
            {notificaciones.length === 0 ? (
              <Dropdown.ItemText style={{ color: '#666666', textAlign: 'center', padding: '20px' }}>
                No hay notificaciones
              </Dropdown.ItemText>
            ) : (
              notificaciones.map(notif => (
                <Dropdown.Item 
                  key={notif._id} 
                  onClick={() => marcarComoLeida(notif._id)}
                  style={{ 
                    color: '#ffffff', 
                    whiteSpace: 'normal',
                    backgroundColor: notif.leido ? 'transparent' : '#1a1a1a',
                    borderBottom: '1px solid #222222',
                    padding: '12px 15px'
                  }}
                >
                  <strong style={{ color: '#ffffff', fontSize: '0.8rem' }}>{notif.titulo}</strong>
                  <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#999999' }}>{notif.mensaje}</div>
                  <small style={{ color: '#666666', fontSize: '0.6rem', marginTop: '5px', display: 'block' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>
                </Dropdown.Item>
              ))
            )}
          </Dropdown.Menu>
        </Dropdown>

        {/* Usuario */}
        <Dropdown align="end">
          <Dropdown.Toggle 
            variant="link" 
            style={{ 
              color: '#ffffff', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '25px',
              backgroundColor: '#111111'
            }}
          >
            <PersonCircle size={18} /> 
            <span style={{ fontSize: '0.85rem' }}>{user.nombre?.split(' ')[0] || 'USUARIO'}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ 
            backgroundColor: '#111111', 
            border: '1px solid #333333',
            borderRadius: '10px',
            minWidth: '220px'
          }}>
            <Dropdown.Header style={{ color: '#ffffff', textAlign: 'center', padding: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>{user.nombre}</div>
              <small style={{ color: '#666666', fontSize: '0.7rem' }}>{user.email}</small>
            </Dropdown.Header>
            <Dropdown.Divider style={{ backgroundColor: '#222222' }} />
            <Dropdown.Item 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }} 
              style={{ color: '#ff6b6b' }}
            >
               CERRAR SESIÓN
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default NavigationBar;