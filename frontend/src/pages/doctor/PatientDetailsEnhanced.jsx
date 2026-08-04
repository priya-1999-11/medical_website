import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  MdArrowBack, MdPerson, MdHistory, MdAssignment, 
  MdUploadFile, MdSend, MdContentPaste, MdVisibility,
  MdCheckCircle, MdError, MdEdit, MdDelete, MdInfo,
  MdCalendarToday, MdAccessTime, MdNotes
} from 'react-icons/md';

const PatientDetailsEnhanced = () => {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctor_id') || sessionStorage.getItem('doctor_id');

  const [appointment, setAppointment] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('symptoms'); // Default to Symptoms as requested

  const fetchData = useCallback(async () => {
    if (!appointmentId || !doctorId) return;
    setLoading(true);
    try {
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('doctor_id', doctorId)
        .single();

      if (aptError || !aptData) throw new Error('Appointment not found or access denied');
      setAppointment(aptData);

      const { data: historyData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_phone', aptData.patient_phone)
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: false });
      setHistory(historyData || []);

      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_phone', aptData.patient_phone)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      
      if (prescriptionError) {
        console.error('Error fetching prescriptions:', prescriptionError);
        alert('Could not load past prescriptions. This may be due to security (RLS) policies.');
      }
      setPrescriptions(prescriptionData || []);

      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_phone', aptData.patient_phone)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      
      if (reportError) {
        console.error('Error fetching reports:', reportError);
        alert('Could not load lab reports.');
      }
      setReports(reportData || []);

    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Access Denied or Data Not Found.');
      navigate(`/doctor-dashboard${doctorId ? `?doctor_id=${doctorId}` : ''}`);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, doctorId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Data
  const previousVisits = useMemo(() => {
    return history.filter(h => h.id !== appointmentId);
  }, [history, appointmentId]);

  const isExistingPatient = previousVisits.length > 0;
  const visitCount = history.length;
  const lastVisitDate = isExistingPatient ? previousVisits[0]?.appointment_date : null;

  const sendWhatsApp = (text) => {
    if (!appointment) return;
    const message = `Hello ${appointment.patient_full_name},\n\nYour prescription from Dr. ${appointment.doctor_name}:\n\n${text}\n\nThank you for choosing Clinical Serenity.`;
    const url = `https://wa.me/${appointment.patient_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSavePrescription = async () => {
    if (!newPrescription.trim()) return;
    setSavingPrescription(true);
    try {
      const { error } = await supabase.from('prescriptions').insert([{
        doctor_id: doctorId,
        patient_phone: appointment.patient_phone,
        patient_name: appointment.patient_full_name,
        prescription_text: newPrescription,
      }]);
      if (error) throw error;
      setNewPrescription('');
      fetchData(); 
      alert('Prescription saved successfully!');
      sendWhatsApp(newPrescription);
    } catch (error) {
      alert('Error saving prescription: ' + error.message);
    } finally {
      setSavingPrescription(false);
    }
  };

  // Prescription Form States
  const [newPrescription, setNewPrescription] = useState('');
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const startEditing = (p) => {
    setEditingId(p.id);
    setEditingText(p.prescription_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleUpdatePrescription = async () => {
    if (!editingText.trim()) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ prescription_text: editingText })
        .eq('id', editingId)
        .eq('doctor_id', doctorId);
      if (error) throw error;
      setEditingId(null);
      fetchData();
      alert('Prescription updated successfully!');
    } catch (error) {
      alert('Error updating prescription: ' + error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id)
        .eq('doctor_id', doctorId);
      if (error) throw error;
      fetchData();
      alert('Prescription deleted.');
    } catch (error) {
      alert('Error deleting prescription: ' + error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingReport(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${appointment.patient_phone}.${fileExt}`;
      const filePath = `patient-reports/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('doctor-reports')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-reports')
        .getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('reports').insert([{
        doctor_id: doctorId,
        patient_phone: appointment.patient_phone,
        file_url: publicUrl,
        file_name: file.name
      }]);
      if (dbError) throw dbError;
      fetchData();
      alert('Report uploaded successfully!');
    } catch (error) {
      alert('Error uploading report: ' + error.message);
    } finally {
      setUploadingReport(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Patient Info */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/doctor-dashboard${doctorId ? `?doctor_id=${doctorId}` : ''}`)}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <MdArrowBack size={24} />
          </button>
          <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-3xl shadow-inner uppercase">
            {appointment.patient_full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{appointment.patient_full_name}</h1>
            </div>
            <div className="flex items-center gap-3 text-slate-500 font-bold text-sm mt-1">
               <span className="px-2 py-0.5 bg-slate-100 rounded-lg">{appointment.patient_phone}</span>
               <span>•</span>
               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg">{appointment.patient_age} Yrs</span>
               <span>•</span>
               <span className="px-2 py-0.5 bg-slate-100 rounded-lg">{appointment.patient_gender}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className={`p-4 px-6 rounded-2xl border text-center ${isExistingPatient ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</div>
              <div className={`text-sm font-black uppercase ${isExistingPatient ? 'text-green-600' : 'text-blue-600'}`}>
                 {isExistingPatient ? 'Existing Patient' : 'New Patient'}
              </div>
           </div>
           <div className="p-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visits</div>
              <div className="text-sm font-black text-slate-900">{visitCount}</div>
           </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-50 p-2">
           {[
             { id: 'symptoms', label: 'Current Symptoms', icon: <MdInfo /> },
             { id: 'history', label: 'Previous Visits', icon: <MdHistory /> },
             { id: 'prescriptions', label: 'Prescriptions', icon: <MdAssignment /> },
             { id: 'reports', label: 'Lab Reports', icon: <MdUploadFile /> }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex-1 py-4 flex items-center justify-center gap-3 font-bold transition-all rounded-2xl text-sm ${
                 activeTab === tab.id 
                 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                 : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
               }`}
             >
               {tab.icon}
               {tab.label}
             </button>
           ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-8 flex-1">
           {activeTab === 'symptoms' && (
             <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <MdInfo className="text-blue-600" />
                   Current Symptoms
                </h3>
                <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded-full tracking-tighter shadow-sm">Current Booking</div>
                   </div>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                         <MdNotes />
                      </div>
                      <div className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Latest Update: {appointment.appointment_date}</div>
                   </div>
                   <p className="text-2xl font-bold text-slate-800 italic leading-relaxed pl-4 border-l-4 border-blue-600 py-2">
                      "{appointment.patient_symptoms || 'No symptoms recorded for this booking.'}"
                   </p>
                </div>
                
                {/* Visual clarification for New Patient */}
                {!isExistingPatient && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700">
                     <MdError />
                     <span className="text-sm font-bold">This is a New Patient. No previous history found.</span>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'history' && (
             <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <MdHistory className="text-blue-600" />
                   Visit History (Past Records)
                </h3>
                {previousVisits.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {previousVisits.map((h, index) => (
                      <div key={h.id} className={`p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-blue-200 group ${index === 0 ? 'ring-1 ring-slate-200 shadow-sm' : ''}`}>
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                  <MdCalendarToday size={18} />
                               </div>
                               <div>
                                  <div className="font-black text-slate-900 uppercase tracking-tight">{h.appointment_date}</div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.appointment_time}</div>
                               </div>
                            </div>
                            <div className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{h.status}</div>
                         </div>
                         <div className="bg-white/50 p-4 rounded-2xl border border-slate-50 italic text-slate-600 font-medium">
                            "{h.patient_symptoms || 'No symptoms or notes recorded.'}"
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest border-2 border-dashed border-slate-100 rounded-[2rem]">
                     No previous visits found for this patient.
                  </div>
                )}
             </div>
           )}

           {activeTab === 'prescriptions' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <MdAssignment className="text-blue-600" />
                      New Prescription
                   </h3>
                   <div className="relative">
                      <textarea
                        value={newPrescription}
                        onChange={(e) => setNewPrescription(e.target.value)}
                        placeholder="Type medicine, dosage, and duration..."
                        className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none font-medium text-slate-700"
                      ></textarea>
                      <button 
                         onClick={handleSavePrescription}
                         disabled={savingPrescription}
                         className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-extrabold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                         {savingPrescription ? 'Saving...' : 'Save & WhatsApp'}
                      </button>
                   </div>
                </div>
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900">Past Prescriptions</h3>
                   <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {prescriptions.map(p => (
                        <div key={p.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</span>
                              <div className="flex gap-2">
                                 <button onClick={() => sendWhatsApp(p.prescription_text)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"><MdSend /></button>
                                 <button onClick={() => startEditing(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"><MdEdit /></button>
                                 <button onClick={() => handleDeletePrescription(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"><MdDelete /></button>
                              </div>
                           </div>
                           {editingId === p.id ? (
                             <div className="space-y-2">
                               <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-4 bg-white border border-blue-100 rounded-xl font-medium min-h-[100px]"></textarea>
                               <div className="flex justify-end gap-2">
                                 <button onClick={cancelEditing} className="px-3 py-1 text-xs font-bold text-slate-400">Cancel</button>
                                 <button onClick={handleUpdatePrescription} disabled={savingEdit} className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg">Update</button>
                               </div>
                             </div>
                           ) : (
                             <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-slate-700 bg-white/50 p-4 rounded-xl">{p.prescription_text}</pre>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'reports' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <MdUploadFile className="text-blue-600" />
                      Medical Reports
                   </h3>
                   <label className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                      <MdUploadFile />
                      {uploadingReport ? 'Uploading...' : 'Upload'}
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingReport} />
                   </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {reports.length === 0 ? (
                      <div className="col-span-4 py-20 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-50 rounded-[2rem]">No reports found</div>
                   ) : (
                      reports.map(r => (
                        <div key={r.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group">
                           <div className="w-full aspect-square bg-white rounded-2xl flex flex-col items-center justify-center mb-4 relative overflow-hidden">
                              <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                 <a href={r.file_url} target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-lg"><MdVisibility /></a>
                              </div>
                           </div>
                           <div className="text-sm font-bold text-slate-900 truncate px-1">{r.file_name}</div>
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 px-1">{new Date(r.created_at).toDateString()}</div>
                        </div>
                      ))
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsEnhanced;
