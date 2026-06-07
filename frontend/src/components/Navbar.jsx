import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Badge, Dropdown } from 'react-bootstrap';
import { Bell, PersonCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NavigationBar = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const response = await api.get('/notifications');
      const data = response.data.data || [];
      setNotificaciones(data.slice(0, 5));
      setNoLeidas(data.filter(n => !n.leido).length);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.put(`/notifications/${id}/leer`);
      cargarNotificaciones();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Navbar style={{ backgroundColor: '#000000', borderBottom: '1px solid #222222', padding: '10px 25px' }}>
      <Navbar.Brand style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🐕</div>
        <div>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#ffffff' }}>VETERINARIA</span>
          <small style={{ display: 'block', fontSize: '7px', color: '#999999' }}>LA VOZ DE LOS QUE NO TIENEN VOZ</small>
        </div>
      </Navbar.Brand>
      
      <Nav className="ms-auto" style={{ alignItems: 'center', gap: '15px' }}>
        <Dropdown align="end">
          <Dropdown.Toggle variant="link" style={{ color: '#ffffff', textDecoration: 'none', position: 'relative', padding: '0' }}>
            <Bell size={20} />
            {noLeidas > 0 && (
              <Badge bg="dark" pill style={{ position: 'absolute', top: '-8px', right: '-12px', fontSize: '9px', backgroundColor: '#333333', color: '#ffffff' }}>
                {noLeidas}
              </Badge>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '10px', minWidth: '300px' }}>
            <Dropdown.Header style={{ color: '#ffffff', fontWeight: 'bold', padding: '12px 15px' }}>NOTIFICACIONES</Dropdown.Header>
            {notificaciones.length === 0 ? (
              <Dropdown.ItemText style={{ color: '#666666', textAlign: 'center', padding: '20px' }}>No hay notificaciones</Dropdown.ItemText>
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
                  <small style={{ color: '#666666', fontSize: '0.6rem', marginTop: '5px', display: 'block' }}>{new Date(notif.createdAt).toLocaleString()}</small>
                </Dropdown.Item>
              ))
            )}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown align="end">
          <Dropdown.Toggle variant="link" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '25px', backgroundColor: '#111111' }}>
            <PersonCircle size={18} /> <span style={{ fontSize: '0.85rem' }}>{user.nombre?.split(' ')[0] || 'USUARIO'}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '10px', minWidth: '220px' }}>
            <Dropdown.Header style={{ color: '#ffffff', textAlign: 'center', padding: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>{user.nombre}</div>
              <small style={{ color: '#666666', fontSize: '0.7rem' }}>{user.email}</small>
            </Dropdown.Header>
            <Dropdown.Divider style={{ backgroundColor: '#222222' }} />
            <Dropdown.Item onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ color: '#999999' }}>CERRAR SESIÓN</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default NavigationBar;