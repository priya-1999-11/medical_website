import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DoctorDirectory from './pages/DoctorDirectory';
import AppointmentBooking from './pages/AppointmentBooking';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorDirectory />} />
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/book-appointment/:doctorId" element={<AppointmentBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;