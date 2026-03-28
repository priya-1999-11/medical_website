import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const DoctorProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const validateDoctor = async (currentSession) => {
      if (!currentSession || !currentSession.user) {
        setIsDoctor(false);
        return;
      }

      const email = currentSession.user.email;

      const { data: docData, error: docError } = await supabase
        .from('doctors')
        .select('id, name')
        .eq('email', email)
        .single();
      
      if (docData && !docError) {
        setIsDoctor(true);
        sessionStorage.setItem('doctor_id', docData.id);
      } else {
        const mockDoctors = [
          'doctor1@gmail.com', 'doctor2@gmail.com', 'doctor3@gmail.com',
          'doctor1@hospital.com', 'doctor2@hospital.com', 'doctor3@hospital.com'
        ];

        if (mockDoctors.includes(email)) {
          setIsDoctor(true);
          if (!sessionStorage.getItem('doctor_id')) {
            sessionStorage.setItem('doctor_id', `mock-${email.split('@')[0]}`);
          }
        } else {
          setIsDoctor(false);
        }
      }
    };

    const checkAuth = async () => {
      try {
        const urlDoctorId = searchParams.get('doctor_id');
        if (urlDoctorId) sessionStorage.setItem('doctor_id', urlDoctorId);

        const { data } = await supabase.auth.getSession();
        setSession(data?.session);
        await validateDoctor(data?.session);
      } catch (err) {
        console.error('Auth check error:', err);
        setIsDoctor(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await validateDoctor(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !isDoctor) {
    return <Navigate to="/doctor-login" replace />;
  }

  return children;
};

export default DoctorProtectedRoute;
