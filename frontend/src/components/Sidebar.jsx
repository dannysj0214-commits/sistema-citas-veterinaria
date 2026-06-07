import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HouseDoorFill, 
  CalendarCheck, 
  CalendarPlus, 
  PeopleFill, 
  BarChartFill, 
  FileTextFill, 
  BoxArrowRight,
  ClipboardPulse,
  PersonBadge
} from 'react-bootstrap-icons';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { icon: <HouseDoorFill size={20} />, text: 'INICIO', path: '/admin-dashboard' },
      { icon: <PersonBadge size={20} />, text: 'PROFESIONALES', path: '/profesionales' },
      { icon: <PeopleFill size={20} />, text: 'CLIENTES', path: '/clientes' },
      { icon: <BarChartFill size={20} />, text: 'REPORTES', path: '/reportes' },
    ],
    profesional: [
      { icon: <HouseDoorFill size={20} />, text: 'INICIO', path: '/profesional-dashboard' },
      { icon: <CalendarCheck size={20} />, text: 'MIS CITAS', path: '/mis-citas' },
      { icon: <FileTextFill size={20} />, text: 'HISTORIAS CLÍNICAS', path: '/profesional-dashboard' },
    ],
    cliente: [
      { icon: <HouseDoorFill size={20} />, text: 'INICIO', path: '/cliente-dashboard' },
      { icon: <CalendarPlus size={20} />, text: 'AGENDAR CITA', path: '/agendar-cita' },
      { icon: <CalendarCheck size={20} />, text: 'MIS CITAS', path: '/mis-citas' },
      { icon: <ClipboardPulse size={20} />, text: 'MIS HISTORIAS', path: '/mis-citas' },
    ]
  };

  const items = menuItems[user.rol] || menuItems.cliente;

  return (
    <div style={{ 
      width: '280px', 
      minHeight: '100vh', 
      backgroundColor: '#111111',
      color: '#ffffff',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid #222222'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '35px 20px', 
        borderBottom: '1px solid #222222',
        marginBottom: '20px'
      }}>
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
        <h3 style={{ 
          color: '#ffffff', 
          fontSize: '1.1rem', 
          fontWeight: 'bold',
          margin: '10px 0 8px',
          letterSpacing: '1px'
        }}>
          VETERINARIA
        </h3>
        <p style={{ 
          fontSize: '0.65rem', 
          color: '#999999',
          lineHeight: '1.3',
          fontWeight: 'bold',
          marginBottom: 0
        }}>
          LA VOZ DE LOS QUE NO TIENEN VOZ
        </p>
      </div>
      
      <Nav className="flex-column" style={{ padding: '0 15px' }}>
        {items.map((item, index) => (
          <Nav.Link
            key={index}
            as={Link}
            to={item.path}
            style={{
              color: location.pathname === item.path ? '#ffffff' : '#999999',
              backgroundColor: location.pathname === item.path ? '#222222' : 'transparent',
              padding: '12px 18px',
              margin: '5px 0',
              borderRadius: '10px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.85rem',
              fontWeight: location.pathname === item.path ? '600' : '400'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = '#222222';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#999999';
              } else {
                e.currentTarget.style.backgroundColor = '#222222';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
          >
            {item.icon}
            <span>{item.text}</span>
          </Nav.Link>
        ))}
        
        <div style={{ margin: '20px 0', borderTop: '1px solid #222222' }} />
        
        <Nav.Link 
          onClick={handleLogout} 
          style={{ 
            padding: '12px 18px', 
            color: '#999999',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '10px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#222222';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#999999';
          }}
        >
          <BoxArrowRight size={20} /> 
          <span>CERRAR SESIÓN</span>
        </Nav.Link>
      </Nav>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: '0.6rem',
        color: '#444444',
        padding: '10px'
      }}>
        SISTEMA VETERINARIO PROFESIONAL
      </div>
    </div>
  );
};

export default Sidebar;