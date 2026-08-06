import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  Smartphone, 
  Building2, 
  AlertCircle,
  FileText,
  Check,
  ChevronDown
} from 'lucide-react';

const MORNING_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"];
const AFTERNOON_SLOTS = ["02:00 PM", "02:45 PM", "04:00 PM", "05:30 PM"];

const AppointmentBooking = () => {
  const { doctorId: initialDoctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDept = searchParams.get('dept');

  const [currentStep, setCurrentStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [validationError, setValidationError] = useState('');

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
      // If initialized with doctor ID, default to Step 3 (Schedule) or 2
      setCurrentStep(3);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  }, []);

  const fetchDoctorsByDepartment = useCallback(async (dept) => {
    if (!dept) return;
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      if (error) throw error;
      
      const filtered = (data || []).filter(doc => 
        doc.department?.trim().toLowerCase() === dept?.trim().toLowerCase()
      );
      
      setDoctors(filtered);
      
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
    } else if (initialDept) {
      setCurrentStep(2);
    }
  }, [initialDoctorId, initialDept, fetchDoctorById]);

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
        .neq('status', 'cancelled');

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
    setValidationError('');
  };

  const handleDepartmentSelect = (deptName) => {
    setFormData({ ...formData, department: deptName, doctorId: '' });
    setSelectedDoctor(null);
    setValidationError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setValidationError('');
  };

  // Step Validation checks
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      if (!formData.department) {
        setValidationError('Please select a medical department to proceed.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.doctorId || !selectedDoctor) {
        setValidationError('Please select a specialist doctor to proceed.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.appointmentDate || !formData.appointmentTime) {
        setValidationError('Please select an appointment date and time slot.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.patientName || !formData.phone || !formData.age) {
        setValidationError('Please fill in all required patient details (Name, Age, Phone).');
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Final Validation
    if (!formData.department || !formData.doctorId || !formData.appointmentTime || !formData.patientName || !formData.phone || !formData.age) {
      setValidationError('Missing Information: Please complete all required fields.');
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
        consultation_fee: 150.0,
        status: 'confirmed'
      };

      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
      if (error) throw error;
      
      const confirmedApt = data[0];
      setConfirmedAppointment(confirmedApt);

      // WhatsApp Redirect (Preserved)
      if (formData.whatsappConfirm) {
        const cleanedPhone = formData.phone.replace(/[^\d]/g, '');
        const whatsappMessage = `Appointment Confirmed ✅
Doctor: ${selectedDoctor.name}
Department: ${formData.department}
Date: ${formData.appointmentDate}
Time: ${formData.appointmentTime}
Hospital: Prana Health Network`;
        
        const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
      }

      // Trigger Notifications (Preserved)
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

  // Steps Configuration for Progress Bar
  const stepsList = [
    { number: 1, title: 'Department', icon: Building2 },
    { number: 2, title: 'Specialist', icon: Stethoscope },
    { number: 3, title: 'Schedule', icon: Calendar },
    { number: 4, title: 'Patient Info', icon: User },
    { number: 5, title: 'Review & Confirm', icon: ShieldCheck },
  ];

  // Render Confirmation Success View
  if (bookingSuccess && confirmedAppointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 text-center border border-slate-100 animate-fade-in-up">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce-subtle" />
            </div>

            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wider mb-3 border border-emerald-100 uppercase">
              BOOKING CONFIRMED
            </span>

            <h1 className="font-headline text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Appointment Successfully Reserved!
            </h1>

            <p className="text-slate-500 text-sm mb-8">
              Your reference code is <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">#{confirmedAppointment.id.slice(0, 8)}</span>
            </p>
            
            {/* Appointment Details Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-8 text-left space-y-4 border border-slate-100">
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Doctor Specialist</span>
                <span className="font-bold text-slate-900 text-base">{selectedDoctor?.name}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-blue-700">{formData.department}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Date & Time</span>
                <span className="font-bold text-slate-900">{formData.appointmentTime} on {formData.appointmentDate}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Patient Name</span>
                <span className="font-bold text-slate-900">{formData.patientName} ({formData.age}Y)</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-slate-500 font-medium">Notifications</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> SMS & WhatsApp Sent
                </span>
              </div>
            </div>

            {/* Success Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(false);
                  setConfirmedAppointment(null);
                  setCurrentStep(1);
                  setFormData({
                    department: '',
                    doctorId: '',
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
                }}
                className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Book Another
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-md"
              >
                Return to Home
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient-dashboard')}
                className="py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="pt-28 md:pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header Title */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wider mb-3 border border-blue-100 uppercase">
            <ShieldCheck className="w-4 h-4" />
            EASY APPOINTMENT SCHEDULING
          </span>

          <h1 className="font-headline text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Schedule Your Clinical Visit
          </h1>

          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Follow the guided steps below to select your medical department, physician, preferred time slot, and patient details.
          </p>
        </header>

        {/* Multi-Step Wizard Progress Bar */}
        <div className="mb-12 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <div className="grid grid-cols-5 gap-2 relative">
            {stepsList.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.number);
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex flex-col items-center text-center group transition-all ${
                    isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                      : isCurrent
                      ? 'bg-slate-900 text-white shadow-md ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>

                  <span className={`text-[11px] font-bold tracking-tight hidden sm:block ${
                    isCurrent ? 'text-slate-900' : isCompleted ? 'text-blue-700' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Error Alert Banner */}
        {validationError && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Grid: Form Steps + Desktop Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* Left Main Form Container */}
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            
            {/* STEP 1: Select Department */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 1: Choose Medical Department
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Select the specialized department corresponding to your healthcare need.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {departments.map((dept) => {
                    const isSelected = formData.department?.toLowerCase() === dept.toLowerCase();
                    return (
                      <div
                        key={dept}
                        onClick={() => handleDepartmentSelect(dept)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 shadow-sm'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {dept}
                          </span>
                        </div>

                        {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Select Doctor */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 2: Choose Specialist Doctor
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Select your preferred clinician available in <span className="font-bold text-blue-700">{formData.department}</span>.
                  </p>
                </div>

                <div className="space-y-4">
                  {doctors.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
                      No doctors available in this department. Please select another department.
                    </div>
                  ) : (
                    doctors.map((doc) => {
                      const isSelected = formData.doctorId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleDoctorChange(doc.id)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={doc.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop"}
                              alt={doc.name}
                              className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border shrink-0"
                            />
                            <div>
                              <h3 className="font-headline font-bold text-slate-900 text-base mb-0.5">{doc.name}</h3>
                              <p className="text-xs font-semibold text-blue-700 mb-1">{doc.title || doc.specialty}</p>
                              <p className="text-[11px] text-slate-500">{doc.experience_years} Yrs Exp • Rating: {doc.rating || '5.0'} ★</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              doc.available_today ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {doc.available_today ? 'Available Today' : 'Next Available'}
                            </span>
                            {isSelected && <Check className="w-5 h-5 text-blue-700" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Select Date & Time */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 3: Select Date & Time Slot
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Choose an available appointment date and preferred time slot for your consultation.
                  </p>
                </div>

                {/* Date Picker Input */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Appointment Date:
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      name="appointmentDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Morning & Afternoon Slot Chips */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Morning Slots
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {MORNING_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = formData.appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => !isBooked && setFormData({ ...formData, appointmentTime: slot })}
                            disabled={isBooked}
                            className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                : isBooked
                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/40'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && <div className="text-[8px] font-black uppercase text-slate-400">Booked</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Afternoon & Evening Slots
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AFTERNOON_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = formData.appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => !isBooked && setFormData({ ...formData, appointmentTime: slot })}
                            disabled={isBooked}
                            className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                : isBooked
                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/40'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && <div className="text-[8px] font-black uppercase text-slate-400">Booked</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Patient Details */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 4: Patient Personal Details
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Fill in the details of the patient attending the clinical consultation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      placeholder="e.g. Percy Boyina"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      placeholder="e.g. 32"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Primary Symptoms / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      name="symptoms"
                      placeholder="Brief description of symptoms or medical history"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Notification Toggles */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.smsConfirm}
                      onChange={(e) => setFormData({...formData, smsConfirm: e.target.checked})}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">Send SMS Alert</div>
                      <div className="text-[10px] text-slate-500">Instant SMS confirmation</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-50 transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.whatsappConfirm}
                      onChange={(e) => setFormData({...formData, whatsappConfirm: e.target.checked})}
                      className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">WhatsApp Alert</div>
                      <div className="text-[10px] text-slate-500">Real-time chat notification</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Review & Confirm */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 5: Review Booking Summary
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Review your consultation details before finalizing your appointment reservation.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Department</span>
                    <span className="font-extrabold text-blue-700 text-sm">{formData.department}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Doctor Specialist</span>
                    <span className="font-extrabold text-slate-900 text-sm">{selectedDoctor?.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Date & Time</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formData.appointmentTime} on {formData.appointmentDate}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Patient Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formData.patientName} ({formData.age}Y, {formData.gender})</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="font-bold text-slate-500 uppercase">Consultation Fee</span>
                    <span className="font-black text-slate-900 text-base">$150.00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons Row */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 ml-auto"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-700/20 flex items-center gap-2 ml-auto disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* Right Sticky Booking Summary Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 sticky top-32">
            <h3 className="font-headline font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Department</div>
                  <div className="font-bold text-slate-800">{formData.department || 'Not selected'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Doctor Specialist</div>
                  <div className="font-bold text-slate-800">{selectedDoctor?.name || 'Not selected'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Date & Time</div>
                  <div className="font-bold text-slate-800">
                    {formData.appointmentTime ? `${formData.appointmentTime} on ${formData.appointmentDate}` : 'Not selected'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Standard Consultation</span>
                <span>$150.00</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total Fee</span>
                <span className="font-black text-blue-700 text-base">$150.00</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentBooking;
