import React, { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const navigate = useNavigate();

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
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" style={{ color: '#ffffff', textDecoration: 'none', position: 'relative', padding: '0' }}>
        <Bell size={20} />
        {noLeidas > 0 && (
          <Badge bg="danger" pill style={{ position: 'absolute', top: '-8px', right: '-12px', fontSize: '10px' }}>
            {noLeidas}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <Dropdown.Header style={{ color: '#d4a017' }}>Notificaciones</Dropdown.Header>
        {notificaciones.length === 0 ? (
          <Dropdown.ItemText style={{ color: '#888' }}>No hay notificaciones</Dropdown.ItemText>
        ) : (
          notificaciones.map(notif => (
            <Dropdown.Item 
              key={notif._id} 
              onClick={() => marcarComoLeida(notif._id)}
              style={{ color: '#fff', whiteSpace: 'normal', backgroundColor: notif.leido ? 'transparent' : '#2a2a2a' }}
            >
              <strong>{notif.titulo}</strong>
              <div><small>{notif.mensaje}</small></div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;