import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppointmentBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({ morning: [], afternoon: [] });
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    department: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
    whatsappNotification: true,
    smsNotification: false,
    symptoms: ''
  });

  useEffect(() => {
    fetchDepartments();
    if (doctorId) {
      fetchDoctorById(doctorId);
    }
  }, [doctorId]);

  useEffect(() => {
    if (formData.department) {
      fetchDoctorsByDepartment(formData.department);
    }
  }, [formData.department]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots(formData.doctorId, formData.appointmentDate);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctorById = async (id) => {
    try {
      const response = await axios.get(`${API}/doctors/${id}`);
      const doctor = response.data;
      setSelectedDoctor(doctor);
      setFormData({
        ...formData,
        department: doctor.department,
        doctorId: doctor.id
      });
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  const fetchDoctorsByDepartment = async (department) => {
    try {
      const response = await axios.get(`${API}/doctors?department=${encodeURIComponent(department)}`);
      setDoctors(response.data);
      
      if (response.data.length > 0 && !formData.doctorId) {
        const firstDoctor = response.data[0];
        setSelectedDoctor(firstDoctor);
        setFormData({ ...formData, doctorId: firstDoctor.id });
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await axios.get(`${API}/doctors/${doctorId}/available-slots?date=${date}`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleDoctorChange = async (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    setSelectedDoctor(doctor);
    setFormData({ ...formData, doctorId: doctorId });
  };

  const handleTimeSlotSelect = (time) => {
    setFormData({ ...formData, appointmentTime: time });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        doctor_id: formData.doctorId,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        patient: {
          full_name: formData.patientName,
          age: parseInt(formData.age),
          gender: formData.gender,
          phone: formData.phone,
          whatsapp_notification: formData.whatsappNotification,
          sms_notification: formData.smsNotification,
          symptoms: formData.symptoms
        }
      };

      const response = await axios.post(`${API}/appointments`, appointmentData);
      setConfirmedAppointment(response.data);
      setBookingSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to book appointment. Please try again.');
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.department && formData.doctorId;
  const canProceedStep2 = formData.appointmentDate && formData.appointmentTime;
  const canProceedStep3 = formData.patientName && formData.age && formData.phone;

  if (bookingSuccess && confirmedAppointment) {
    return (
      <div className="min-h-screen bg-surface">
        <NavBar />
        <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center" data-testid="booking-success-message">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Appointment Confirmed!</h1>
            <p className="text-slate-600 mb-8">
              Your appointment has been successfully booked. A confirmation has been sent to your phone.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-lg mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Appointment ID:</span>
                  <span className="font-bold">{confirmedAppointment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Doctor:</span>
                  <span className="font-bold">{confirmedAppointment.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Department:</span>
                  <span className="font-bold">{confirmedAppointment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-bold">{confirmedAppointment.appointment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time:</span>
                  <span className="font-bold">{confirmedAppointment.appointment_time}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-3">
                  <span className="text-slate-600">Consultation Fee:</span>
                  <span className="font-bold text-primary">${confirmedAppointment.consultation_fee}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
              >
                Book Another
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-slate-900 tracking-tight mb-4">
            Schedule Your Visit
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Complete the following steps to secure your clinical consultation with
            our specialists.
          </p>
        </header>

        {/* Multi-Step Indicator */}
        <div className="mb-12 overflow-x-auto" data-testid="booking-stepper">
          <div className="flex items-center min-w-max md:min-w-0 justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-surface px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </div>
              <span className={`text-xs font-label font-bold ${step >= 1 ? 'text-primary' : 'text-slate-600'}`}>
                Specialist
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-surface px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </div>
              <span className={`text-xs font-label font-medium ${step >= 2 ? 'text-primary' : 'text-slate-600'}`}>
                Schedule
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 bg-surface px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </div>
              <span className={`text-xs font-label font-medium ${step >= 3 ? 'text-primary' : 'text-slate-600'}`}>
                Details
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2 bg-surface px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 4 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                4
              </div>
              <span className={`text-xs font-label font-medium ${step >= 4 ? 'text-primary' : 'text-slate-600'}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Select Specialist */}
            {step === 1 && (
              <section className="bg-white p-8 rounded-xl shadow-sm" data-testid="step-1-specialist">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">clinical_notes</span>
                  <h2 className="text-xl font-headline font-bold">Select Department & Doctor</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-label font-semibold text-slate-600">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                      data-testid="department-select"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label font-semibold text-slate-600">
                      Preferred Doctor
                    </label>
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={(e) => handleDoctorChange(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                      disabled={!formData.department}
                      data-testid="doctor-select"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedDoctor && (
                  <div className="flex items-center gap-6 p-4 rounded-xl border border-blue-100 bg-blue-50">
                    <img
                      alt={selectedDoctor.name}
                      className="w-20 h-20 rounded-xl object-cover"
                      src={selectedDoctor.photo_url}
                    />
                    <div>
                      <h3 className="font-headline font-bold text-slate-900">
                        {selectedDoctor.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-1">
                        {selectedDoctor.title} • {selectedDoctor.experience_years} years exp.
                      </p>
                      <div className="flex gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: i < Math.floor(selectedDoctor.rating) ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                        <span className="text-xs font-bold ml-1 text-slate-600">
                          {selectedDoctor.rating} ({selectedDoctor.review_count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Step 2: Choose Date & Time */}
            {step === 2 && (
              <section className="bg-white p-8 rounded-xl shadow-sm" data-testid="step-2-schedule">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    <h2 className="text-xl font-headline font-bold">Choose Date & Time</h2>
                  </div>
                  <div className="text-sm font-label text-primary font-bold">
                    {formData.appointmentDate}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-label font-semibold text-slate-600 mb-2 block">
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                    data-testid="date-input"
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                      Morning Slots
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.morning.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                          disabled={!slot.available}
                          className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.appointmentTime === slot.time
                              ? 'bg-primary text-white shadow-lg'
                              : slot.available
                              ? 'bg-slate-50 text-slate-900 hover:bg-blue-100'
                              : 'bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                          data-testid={`time-slot-${slot.time.replace(/\s/g, '-')}`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                      Afternoon & Evening
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.afternoon.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                          disabled={!slot.available}
                          className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.appointmentTime === slot.time
                              ? 'bg-primary text-white shadow-lg'
                              : slot.available
                              ? 'bg-slate-50 text-slate-900 hover:bg-blue-100'
                              : 'bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                          data-testid={`time-slot-${slot.time.replace(/\s/g, '-')}`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Patient Details */}
            {step === 3 && (
              <section className="bg-white p-8 rounded-xl shadow-sm" data-testid="step-3-patient-details">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h2 className="text-xl font-headline font-bold">Patient Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-label font-semibold text-slate-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                      placeholder="John Doe"
                      data-testid="patient-name-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-label font-semibold text-slate-600">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                        placeholder="28"
                        data-testid="patient-age-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-label font-semibold text-slate-600">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                        data-testid="patient-gender-select"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label font-semibold text-slate-600">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                      placeholder="+1 (555) 000-0000"
                      data-testid="patient-phone-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label font-semibold text-slate-600">
                      Notification Method
                    </label>
                    <div className="flex gap-4 p-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="whatsappNotification"
                          checked={formData.whatsappNotification}
                          onChange={handleInputChange}
                          className="rounded text-primary focus:ring-primary"
                        />{' '}
                        WhatsApp
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="smsNotification"
                          checked={formData.smsNotification}
                          onChange={handleInputChange}
                          className="rounded text-primary focus:ring-primary"
                        />{' '}
                        SMS
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-label font-semibold text-slate-600">
                      Describe Symptoms / Problem
                    </label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary p-3"
                      placeholder="Briefly describe your health concern..."
                      rows="4"
                      data-testid="patient-symptoms-textarea"
                    ></textarea>
                  </div>
                </div>
              </section>
            )}

            {/* Step 4: Review */}
            {step === 4 && selectedDoctor && (
              <section className="bg-white p-8 rounded-xl shadow-sm" data-testid="step-4-review">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">assignment</span>
                  <h2 className="text-xl font-headline font-bold">Review & Confirm</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-3 text-slate-600">Doctor Details</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="font-bold">{selectedDoctor.name}</p>
                      <p className="text-sm text-slate-600">{selectedDoctor.title}</p>
                      <p className="text-sm text-slate-600">{selectedDoctor.department}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3 text-slate-600">Appointment Schedule</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p>
                        <span className="font-bold">Date:</span> {formData.appointmentDate}
                      </p>
                      <p>
                        <span className="font-bold">Time:</span> {formData.appointmentTime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3 text-slate-600">Patient Information</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <p>
                        <span className="font-bold">Name:</span> {formData.patientName}
                      </p>
                      <p>
                        <span className="font-bold">Age:</span> {formData.age} years
                      </p>
                      <p>
                        <span className="font-bold">Gender:</span> {formData.gender}
                      </p>
                      <p>
                        <span className="font-bold">Phone:</span> {formData.phone}
                      </p>
                      {formData.symptoms && (
                        <p>
                          <span className="font-bold">Symptoms:</span> {formData.symptoms}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${
                  step === 1
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                data-testid="back-button"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2) ||
                    (step === 3 && !canProceedStep3)
                  }
                  className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-xl transition-all ${
                    (step === 1 && canProceedStep1) ||
                    (step === 2 && canProceedStep2) ||
                    (step === 3 && canProceedStep3)
                      ? 'bg-primary text-white hover:bg-blue-700 active:scale-95'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                  data-testid="next-button"
                >
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="confirm-appointment-button"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Appointment
                      <span className="material-symbols-outlined">check_circle</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar: Summary Sticky */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-headline font-extrabold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">assignment</span>
                Booking Summary
              </h3>
              <div className="space-y-6">
                {selectedDoctor && (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                        Doctor
                      </p>
                      <p className="font-semibold text-slate-900">{selectedDoctor.name}</p>
                      <p className="text-sm text-slate-600">{selectedDoctor.department}</p>
                    </div>
                  </div>
                )}
                {formData.appointmentDate && formData.appointmentTime && (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-blue-700">schedule</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                        Timing
                      </p>
                      <p className="font-semibold text-slate-900">{formData.appointmentDate}</p>
                      <p className="text-sm text-slate-600">{formData.appointmentTime}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-700">location_on</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-semibold text-slate-900">Central Medical Plaza</p>
                    <p className="text-sm text-slate-600">Building B, 3rd Floor</p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Consultation Fee</span>
                    <span className="font-bold text-slate-900">$120.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-primary">
                    <span>Insurance Coverage</span>
                    <span className="font-medium">- $100.00</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-300">
                    <span className="font-headline font-bold">Estimated Payable</span>
                    <span className="font-headline font-extrabold text-2xl text-primary">
                      $20.00
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-white rounded-xl border-l-4 border-primary">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">info</span>
                  <p className="text-xs leading-relaxed text-slate-600">
                    A confirmation SMS will be sent to your registered mobile number upon booking completion.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentBooking;
