import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProfesionalDashboard from './pages/ProfesionalDashboard';
import ClienteDashboard from './pages/ClienteDashboard';
import MisCitas from './pages/MisCitas';
import Reportes from './pages/Reportes';
import Profesionales from './pages/Profesionales';
import Clientes from './pages/Clientes';
import VerHistoria from './pages/VerHistoria';
import AgendarCita from './pages/AgendarCita';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to={`/${user.rol}-dashboard`} />;
  }
  return children;
};

const Layout = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return children;
  
  return (
    <div style={{ display: 'flex', backgroundColor: '#000000', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, backgroundColor: '#000000' }}>
        <Navbar />
        <main style={{ padding: '20px', backgroundColor: '#000000' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/profesional-dashboard" element={
          <PrivateRoute allowedRoles={['profesional']}>
            <Layout><ProfesionalDashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/cliente-dashboard" element={
          <PrivateRoute allowedRoles={['cliente']}>
            <Layout><ClienteDashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/mis-citas" element={
          <PrivateRoute allowedRoles={['cliente', 'profesional']}>
            <Layout><MisCitas /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/agendar-cita" element={
          <PrivateRoute allowedRoles={['cliente']}>
            <Layout><AgendarCita /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/reportes" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><Reportes /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/profesionales" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><Profesionales /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/clientes" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><Clientes /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/ver-historia/:id" element={
          <PrivateRoute allowedRoles={['cliente', 'profesional']}>
            <Layout><VerHistoria /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/" element={
          !token ? <Navigate to="/login" /> : 
          user.rol === 'admin' ? <Navigate to="/admin-dashboard" /> :
          user.rol === 'profesional' ? <Navigate to="/profesional-dashboard" /> :
          <Navigate to="/cliente-dashboard" />
        } />
      </Routes>
    </Router>
  );
}

export default App;