import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';

const Calendar = ({ profesionalId, onCitaCreada }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [duracionCita, setDuracionCita] = useState(90);

  useEffect(() => {
    if (profesionalId) {
      fetchServicios();
    }
  }, [profesionalId]);

  const fetchServicios = async () => {
    try {
      const response = await api.get(`/services/profesional/${profesionalId}`);
      setServicios(response.data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    }
  };

  const fetchAvailableSlots = async (date) => {
    setLoading(true);
    try {
      const response = await api.get(`/appointments/disponibles/${profesionalId}?fecha=${date}`);
      console.log('Slots disponibles:', response.data);
      setAvailableSlots(response.data.slots_disponibles || []);
      setDuracionCita(response.data.profesional?.duracion_cita || 90);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info) => {
    const date = info.dateStr;
    setSelectedDate(date);
    fetchAvailableSlots(date);
    setShowModal(true);
  };

  const handleCreateCita = async () => {
    if (!selectedTime || !selectedServicio) {
      setError('Por favor seleccione una hora y un servicio');
      return;
    }

    setLoading(true);
    try {
      await api.post('/appointments', {
        profesional: profesionalId,
        servicio: selectedServicio,
        fecha: selectedDate,
        hora: selectedTime,
        notas: notas
      });
      
      setShowModal(false);
      setSelectedTime(null);
      setSelectedServicio('');
      setNotas('');
      setError('');
      
      if (onCitaCreada) onCitaCreada();
      alert('¡Cita agendada exitosamente!');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        initialView="dayGridMonth"
        locale="es"
        dateClick={handleDateClick}
        height="auto"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana'
        }}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agendar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <p><strong>Fecha seleccionada:</strong> {selectedDate}</p>
          <p><strong>Duración de la cita:</strong> {duracionCita} minutos</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Servicio</Form.Label>
            <Form.Select 
              value={selectedServicio} 
              onChange={(e) => setSelectedServicio(e.target.value)}
              required
            >
              <option value="">Seleccione un servicio</option>
              {servicios.map(serv => (
                <option key={serv._id} value={serv.nombre}>
                  {serv.nombre} - ${serv.precio} ({serv.duracion} min)
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Horarios disponibles</Form.Label>
            {loading ? (
              <div className="text-center"><Spinner animation="border" size="sm" /></div>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'success' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setSelectedTime(slot)}
                      className="rounded-pill"
                    >
                      {slot}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted">No hay horarios disponibles para este día</p>
                )}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas adicionales</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ingrese alguna nota adicional para el profesional..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleCreateCita}
            disabled={!selectedTime || !selectedServicio || loading}
          >
            {loading ? 'Procesando...' : 'Agendar Cita'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Calendar;