import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { MdSearch, MdEvent, MdDescription, MdChevronRight, MdHistory } from 'react-icons/md';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctor_id') || sessionStorage.getItem('doctor_id');
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = appointments.filter(apt =>
    apt.patient_full_name.toLowerCase().includes(search.toLowerCase()) ||
    apt.patient_phone.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Welcome & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
         <div className="relative z-10">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Doctor Overview</div>
            <h1 className="text-4xl font-black tracking-tight mb-4">Patient Management</h1>
            <p className="text-slate-400 font-medium max-w-md">Manage your daily appointments and patient medical records securely from one central location.</p>
         </div>
         <div className="mt-8 md:mt-0 flex gap-6 relative z-10">
            <div className="p-1 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Visits</div>
               <div className="text-2xl font-black">{appointments.length}</div>
            </div>
            <div className="p-1 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today</div>
               <div className="text-2xl font-black text-blue-400">
                  {appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length}
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search patients by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             Live Patient Feed
          </div>
        </div>

        {/* List View */}
        <div className="overflow-x-auto p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-[40%]">Patient Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Visit Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Symptoms</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto opacity-50"></div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    {search ? 'No patients found matching your search.' : 'You have no appointments scheduled yet.'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-white transition-colors">
                           {apt.patient_full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{apt.patient_full_name}</div>
                          <div className="text-xs font-bold text-slate-400">{apt.patient_phone} • {apt.patient_age} Years • {apt.patient_gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                          <MdEvent className="text-blue-500" />
                          <span className="text-sm font-bold text-slate-700">{apt.appointment_date} <span className="text-slate-300">|</span> {apt.appointment_time}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-600 line-clamp-1 max-w-[200px] bg-slate-50 p-2 rounded-lg group-hover:bg-white transition-colors italic">
                        "{apt.patient_symptoms || 'No primary symptoms mentioned'}"
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                         onClick={() => navigate(`patient/${apt.id}${doctorId ? `?doctor_id=${doctorId}` : ''}`)}
                         className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                      >
                         <MdHistory size={16} />
                         View Records
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
