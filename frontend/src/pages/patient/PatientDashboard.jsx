import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { 
  MdPerson, 
  MdPhone, 
  MdAssignmentInd, 
  MdHealing, 
  MdHistory, 
  MdLocalPharmacy, 
  MdEdit, 
  MdDelete, 
  MdLogout,
  MdAdd
} from 'react-icons/md';

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/patient-login');
          return;
        }
        setUser(user);

        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/patient-login');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your medical details?')) {
      try {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        setPatient(null);
        alert('Details deleted successfully.');
      } catch (error) {
        alert('Error deleting details: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">local_hospital</span>
            <span className="font-headline font-black text-xl text-slate-900 tracking-tight">Clinical Serenity</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-bold text-sm hidden sm:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              <MdLogout /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome, <span className="text-primary">{patient?.name || user?.user_metadata?.full_name || 'Patient'}</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Manage your medical profile and health records</p>
        </div>

        {patient ? (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Medical Profile Card */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -z-0 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Medical Profile</h2>
                    <span className="text-xs font-bold text-slate-400">ID: {patient.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/patient-details', { state: { editData: patient } })}
                      className="p-3 bg-blue-50 hover:bg-primary hover:text-white text-primary rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-sm"
                    >
                      <MdEdit /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl font-bold transition-all flex items-center gap-2 text-sm border border-red-100/50"
                    >
                      <MdDelete /> Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <MdPerson className="text-primary" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</span>
                    </div>
                    <p className="text-slate-900 font-black text-lg">{patient.name}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <MdPhone className="text-primary" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
                    </div>
                    <p className="text-slate-900 font-black text-lg">{patient.phone}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <MdAssignmentInd className="text-primary" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age / Gender</span>
                    </div>
                    <p className="text-slate-900 font-black text-lg">{patient.age}Y • {patient.gender || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-8 bg-blue-900/5 rounded-3xl border border-blue-100/50 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10">
                      <MdHealing size={100} />
                    </div>
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MdHealing /> Current Symptoms
                    </h3>
                    <p className="text-slate-700 leading-relaxed font-bold italic">
                      {patient.symptoms || 'No symptoms reported.'}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group/card">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MdLocalPharmacy className="text-primary" /> Previous Medications
                      </h3>
                      <p className="text-slate-700 font-bold italic leading-relaxed text-sm">
                        {patient.previous_medications || 'None recorded.'}
                      </p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group/card">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MdHistory className="text-primary" /> Existing Diseases
                      </h3>
                      <p className="text-slate-700 font-bold italic leading-relaxed text-sm">
                        {patient.diseases || 'None recorded.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Actions Side */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-primary to-blue-800 rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">Need a Consultation?</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-8 italic">Book an appointment with our specialists based on your current medical profile for a detailed evaluation.</p>
                </div>
                <Link
                  to="/book-appointment"
                  className="bg-white text-primary font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                >
                  <MdAdd /> Book Now
                </Link>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Security Tip</h4>
                 <p className="text-slate-600 text-sm italic leading-relaxed">Always keep your medical records up to date. You can edit your profile anytime your symptoms or medications change.</p>
                 <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                       <span className="material-symbols-outlined text-sm text-slate-500">lock</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Encrypted Storage</span>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 border-dashed">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-primary/5">
              <span className="material-symbols-outlined text-5xl text-primary animate-bounce">assignment_add</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Medical Profile Found</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-10 italic leading-relaxed">Your medical information is empty. Please fill in your details to help us provide better care for you.</p>
            <Link
              to="/patient-details"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-blue-700 text-white font-black px-10 py-5 rounded-[2rem] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.05] active:scale-95"
            >
              <MdAdd size={20} /> Fill Medical Details
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
