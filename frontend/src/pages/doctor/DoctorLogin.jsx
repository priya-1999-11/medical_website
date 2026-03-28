import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorPrompt('');

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Verify if this user exists in the doctors table
      let doctorData;
      let dbError;

      const { data, error } = await supabase
        .from('doctors')
        .select('id, name')
        .eq('email', email)
        .single();
      
      if (data && !error) {
        doctorData = data;
      } else {
        const mockDoctors = [
          'doctor1@gmail.com', 'doctor2@gmail.com', 'doctor3@gmail.com',
          'doctor1@hospital.com', 'doctor2@hospital.com', 'doctor3@hospital.com'
        ];
        
        if (mockDoctors.includes(email)) {
          // Dummy data for testing
          doctorData = { id: `mock-${email.split('@')[0]}`, name: `Test ${email.split('@')[0]}` };
        } else {
          dbError = error;
        }
      }

      if (dbError || !doctorData) {
        // Sign out if they aren't a doctor
        await supabase.auth.signOut();
        throw new Error('Access Denied: You are not registered as a doctor.');
      }

      // 3. Store doctor info and navigate
      sessionStorage.setItem('doctor_id', doctorData.id);
      navigate(`/doctor-dashboard?doctor_id=${doctorData.id}`);
    } catch (err) {
      setErrorPrompt(err.message);
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Doctor Portal</h1>
          <p className="text-slate-500 font-medium">Access your patient records & prescriptions</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {errorPrompt && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {errorPrompt}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Doctor Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Secret Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-5 font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
          Professional Medical Portal • Clinical Serenity Hospital
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
