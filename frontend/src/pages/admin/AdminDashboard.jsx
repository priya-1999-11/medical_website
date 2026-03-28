import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MdPeople, MdEvent, MdLocalHospital } from 'react-icons/md';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    departments: 0,
    appointments: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, deptRes, apptRes] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        doctors: docRes?.count || 0,
        departments: deptRes?.count || 0,
        appointments: apptRes?.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MdPeople size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Doctors</p>
              <p className="text-3xl font-black text-slate-900">{stats.doctors}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MdLocalHospital size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Departments</p>
              <p className="text-3xl font-black text-slate-900">{stats.departments}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MdEvent size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Appointments</p>
              <p className="text-3xl font-black text-slate-900">{stats.appointments}</p>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for recent activity tables */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-lg text-slate-900 mb-4">Quick Actions</h3>
        <p className="text-slate-600 text-sm">Use the sidebar to navigate to the specific management modules for Doctors, Departments, and Appointments.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
