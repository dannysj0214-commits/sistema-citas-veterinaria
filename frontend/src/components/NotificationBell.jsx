import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Button, Spinner } from 'react-bootstrap';
import api from '../services/api';

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const response = await api.get('/notifications');
      setNotificaciones(response.data.notifications);
      setNoLeidas(response.data.noLeidas);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotificaciones();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotificaciones();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      cita_creada: '📅',
      cita_aceptada: '✅',
      cita_rechazada: '❌',
      cita_completada: '✓',
      historia_clinica: '📄'
    };
    return iconos[tipo] || '📢';
  };

  const abrirHistoria = (link) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="light" size="sm" className="position-relative">
        <i className="fas fa-bell"></i>
        {noLeidas > 0 && (
          <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill">
            {noLeidas > 9 ? '9+' : noLeidas}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Notificaciones</strong>
          {notificaciones.length > 0 && (
            <Button variant="link" size="sm" onClick={marcarTodasComoLeidas}>
              Marcar todas
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-3 text-muted">No hay notificaciones</div>
        ) : (
          notificaciones.map(notif => (
            <Dropdown.Item
              key={notif._id}
              onClick={() => {
                marcarComoLeida(notif._id);
                if (notif.link) abrirHistoria(notif.link);
              }}
              className={`border-bottom ${!notif.leido ? 'bg-light' : ''}`}
            >
              <div className="d-flex">
                <div className="me-2 fs-4">{getIconoTipo(notif.tipo)}</div>
                <div className="flex-grow-1">
                  <div className="fw-bold">{notif.titulo}</div>
                  <div className="small text-muted">{notif.mensaje}</div>
                  <div className="small text-muted mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
                {!notif.leido && <div className="ms-2"><Badge bg="info" pill>Nueva</Badge></div>}
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;