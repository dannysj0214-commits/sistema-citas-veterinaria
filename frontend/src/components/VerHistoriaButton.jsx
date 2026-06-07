import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaEye, FaFileMedical } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VerHistoriaButton = ({ citaId, paciente, variant = 'info', size = 'sm' }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleVerHistoria = async () => {
    setCargando(true);
    setError('');
    
    try {
      // Intentar obtener la historia por citaId
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let historiaId = null;
      
      if (user.rol === 'cliente') {
        const response = await axios.get(`${API_URL}/medical-records/cliente`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const historias = response.data.data || [];
        const historia = historias.find(h => h.appointment_id === citaId);
        if (historia) {
          historiaId = historia._id;
        }
      } else if (user.rol === 'profesional') {
        const response = await axios.get(`${API_URL}/medical-records/profesional/todas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const historias = response.data.data || [];
        const historia = historias.find(h => h.appointment_id === citaId);
        if (historia) {
          historiaId = historia._id;
        }
      }
      
      if (historiaId) {
        navigate(`/ver-historia/${historiaId}`);
      } else {
        alert(`No se encontró historia clínica para ${paciente || 'esta cita'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la historia clínica');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleVerHistoria}
      disabled={cargando}
      title="Ver historia clínica"
    >
      {cargando ? (
        <Spinner size="sm" className="me-1" />
      ) : (
        <FaFileMedical className="me-1" />
      )}
      Ver Historia
    </Button>
  );
};

export default VerHistoriaButton;