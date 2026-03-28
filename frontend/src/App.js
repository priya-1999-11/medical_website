import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DoctorDirectory from './pages/DoctorDirectory';
import AppointmentBooking from './pages/AppointmentBooking';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Doctor Dashboard Imports
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorDirectory />} />
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/book-appointment/:doctorId" element={<AppointmentBooking />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="appointments" element={<AdminAppointments />} />
        </Route>

        {/* Doctor Routes (New) */}
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route 
          path="/doctor-dashboard" 
          element={
            <DoctorProtectedRoute>
              <DoctorLayout />
            </DoctorProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="patient/:id" element={<PatientDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;