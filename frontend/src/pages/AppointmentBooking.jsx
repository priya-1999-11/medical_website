import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabaseClient';

const MORNING_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"];
const AFTERNOON_SLOTS = ["02:00 PM", "02:45 PM", "04:00 PM", "05:30 PM"];

const AppointmentBooking = () => {
  const { doctorId: initialDoctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDept = searchParams.get('dept');

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    department: initialDept || '',
    doctorId: initialDoctorId || '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptoms: '',
    smsConfirm: true,
    whatsappConfirm: true
  });
  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchDoctorById = useCallback(async (id) => {
    try {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (error) throw error;
      setSelectedDoctor(data);
      setFormData(prev => ({
        ...prev,
        department: data.department,
        doctorId: data.id
      }));
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  }, []);

  const fetchDoctorsByDepartment = useCallback(async (dept) => {
    if (!dept) return;
    try {
      // Fetch all available doctors for the department and filter case-insensitively
      // Note: fetching all and filtering in client is more robust for case/space issues
      // than Supabase eq which is case-sensitive.
      const { data, error } = await supabase.from('doctors').select('*');
      if (error) throw error;
      
      const filtered = (data || []).filter(doc => 
        doc.department?.trim().toLowerCase() === dept?.trim().toLowerCase()
      );
      
      setDoctors(filtered);
      
      // If the current selected doctor is not in the new department, clear them
      if (selectedDoctor && selectedDoctor.department?.trim().toLowerCase() !== dept?.trim().toLowerCase()) {
        setSelectedDoctor(null);
        setFormData(prev => ({ ...prev, doctorId: '' }));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase.from('departments').select('name').order('name');
        if (error) throw error;
        setDepartments(data.map(d => d.name) || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();

    if (initialDoctorId) {
      fetchDoctorById(initialDoctorId);
    }
  }, [initialDoctorId, fetchDoctorById]);

  useEffect(() => {
    if (formData.department) {
      fetchDoctorsByDepartment(formData.department);
    }
  }, [formData.department, fetchDoctorsByDepartment]);

  const fetchBookedSlots = useCallback(async () => {
    if (!formData.doctorId || !formData.appointmentDate) return;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', formData.doctorId)
        .eq('appointment_date', formData.appointmentDate)
        .neq('status', 'cancelled'); // Don't block cancelled slots

      if (error) throw error;
      setBookedSlots(data.map(apt => apt.appointment_time) || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  const handleDoctorChange = (id) => {
    const doc = doctors.find(d => d.id === id);
    setSelectedDoctor(doc);
    setFormData({ ...formData, doctorId: id });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.department || !formData.doctorId || !formData.appointmentTime || !formData.patientName || !formData.phone || !formData.age) {
      alert('Missing Information: Please select a department, doctor, time slot, and fill in all patient details.');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        doctor_id: formData.doctorId,
        doctor_name: selectedDoctor.name,
        department: formData.department,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        patient_full_name: formData.patientName,
        patient_age: parseInt(formData.age) || 0,
        patient_gender: formData.gender,
        patient_phone: formData.phone,
        patient_symptoms: formData.symptoms,
        consultation_fee: 150.0, // Standard fee
        status: 'confirmed'
      };

      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
      if (error) throw error;
      
      const confirmedApt = data[0];
      setConfirmedAppointment(confirmedApt);

      // 3. WhatsApp Redirect (New)
      if (formData.whatsappConfirm) {
        const cleanedPhone = formData.phone.replace(/[^\d]/g, '');
        const whatsappMessage = `Appointment Confirmed ✅
Doctor: ${selectedDoctor.name}
Department: ${formData.department}
Date: ${formData.appointmentDate}
Time: ${formData.appointmentTime}
Hospital: Clinical Serenity`;
        
        const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
      }

      // Trigger Notifications (Existing)
      try {
        const notificationData = {
          phone: formData.phone,
          doctor_name: selectedDoctor.name,
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          send_sms: formData.smsConfirm,
          send_whatsapp: formData.whatsappConfirm
        };

        fetch('http://localhost:8000/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        }).then(res => res.json())
          .then(resData => console.log('Notification response:', resData))
          .catch(err => console.error('Notification error:', err));
          
      } catch (notifErr) {
        console.error('Failed to trigger notification:', notifErr);
      }

      setBookingSuccess(true);
    } catch (error) {
      console.error('Booking Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess && confirmedAppointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="pt-32 pb-24 px-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-slate-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-500 mb-8">Your appointment ID is <span className="font-bold text-slate-800">#{confirmedAppointment.id.slice(0, 8)}</span></p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-bold text-slate-900">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Time</span>
                <span className="font-bold text-slate-900">{formData.appointmentTime} on {formData.appointmentDate}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{formData.patientName}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavBar />

      <main className="pt-32 pb-24 px-4 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Book Your Appointment</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Complete the form below to schedule a consultation with our world-class medical specialists.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Selection Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-sm">medication</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Medical Service</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Doctor</label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer disabled:opacity-50"
                    disabled={!formData.department}
                  >
                    <option value="">{formData.department ? 'Choose a Specialist' : 'Select Department First'}</option>
                    {doctors.length > 0 ? (
                      doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                      ))
                    ) : (
                      formData.department && <option disabled>No doctors available</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Doctor Card UI */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-sm">badge</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Doctor Profile</h2>
                </div>

                {selectedDoctor ? (
                  <div className="flex-1 bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-md mb-4 border-2 border-white">
                      <img
                        src={selectedDoctor.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop"}
                        alt={selectedDoctor.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">{selectedDoctor.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mb-2">{selectedDoctor.specialty}</p>
                    <p className="text-slate-500 text-xs mb-4">{selectedDoctor.experience_years} Years Experience</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-300">
                    <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
                    <p className="text-sm">Select a doctor to view their profile info here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Timing Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-sm">schedule</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Select Date & Time</h2>
            </div>

            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block text-center">Step 1: Choose Appointment Date</label>
              <div className="relative">
                <input 
                  type="date"
                  name="appointmentDate"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer text-center"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold text-center mt-3 uppercase tracking-tighter italic">Showing slots for: {new Date(formData.appointmentDate).toDateString()}</p>
            </div>

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-6">Step 2: Available Time Slots</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Morning Slots</h3>
                <div className="grid grid-cols-2 gap-3">
                  {MORNING_SLOTS.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => !isBooked && setFormData({ ...formData, appointmentTime: slot })}
                        disabled={isBooked}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          formData.appointmentTime === slot 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                          : isBooked 
                            ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50 active:scale-95'
                        }`}
                      >
                        {slot}
                        {isBooked && <div className="text-[8px] font-black uppercase tracking-tighter opacity-50">Booked</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Afternoon & Evening</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AFTERNOON_SLOTS.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => !isBooked && setFormData({ ...formData, appointmentTime: slot })}
                        disabled={isBooked}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          formData.appointmentTime === slot 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                          : isBooked 
                            ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50 active:scale-95'
                        }`}
                      >
                        {slot}
                        {isBooked && <div className="text-[8px] font-black uppercase tracking-tighter opacity-50">Booked</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Patient Details */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-sm">assignment_ind</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Patient Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  placeholder="Full name of patient"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Symptoms (Optional)</label>
                <input
                  type="text"
                  name="symptoms"
                  placeholder="Brief description of problem"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-50 cursor-pointer hover:bg-blue-50 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.smsConfirm ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  <span className="material-symbols-outlined text-[20px]">sms</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 leading-tight">SMS Alert</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Instant Text Confirmation</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.smsConfirm}
                  onChange={(e) => setFormData({...formData, smsConfirm: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
              </label>

              <label className="flex items-center gap-4 p-4 bg-green-50/30 rounded-2xl border border-green-50 cursor-pointer hover:bg-green-50 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.whatsappConfirm ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 leading-tight">WhatsApp</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Real-time Updates</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.whatsappConfirm}
                  onChange={(e) => setFormData({...formData, whatsappConfirm: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-slate-200 text-green-600 focus:ring-green-500 transition-all cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 4. Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 text-slate-500 font-bold hover:text-slate-800 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Cancel Booking
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-5 bg-[#0f172a] text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Confirming...
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentBooking;
