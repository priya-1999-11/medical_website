import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { MdDashboard, MdPeople, MdEvent, MdLogout, MdAssignment } from 'react-icons/md';
import { supabase } from '@/lib/supabaseClient';

const DoctorLayout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctorName, setDoctorName] = useState('Doctor');
  const doctorIdParam = searchParams.get('doctor_id');

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doctorId = doctorIdParam || sessionStorage.getItem('doctor_id');
      if (doctorId) {
        const { data } = await supabase.from('doctors').select('name').eq('id', doctorId).single();
        if (data) setDoctorName(data.name);
      }
    };
    fetchDoctorInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('doctor_id');
      navigate('/doctor-login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/doctor-login');
    }
  };

  const navLinks = [
    { name: 'My Dashboard', path: `/doctor-dashboard${doctorIdParam ? `?doctor_id=${doctorIdParam}` : ''}`, icon: <MdDashboard size={22} />, exact: true },
    { name: 'My Appointments', path: `/doctor-dashboard${doctorIdParam ? `?doctor_id=${doctorIdParam}` : ''}`, icon: <MdEvent size={22} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">medical_services</span>
            </div>
            Doctor Portal
          </h2>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className={({ isActive }) => (isActive ? 'text-blue-600' : 'text-slate-400')}>
                 {link.icon}
              </div>
              <span className="text-sm">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Logged in as</div>
            <div className="text-sm font-bold text-slate-900 line-clamp-1">{doctorName}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <MdLogout size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md h-20 flex items-center justify-between px-8 sticky top-0 z-10 border-b border-slate-100">
          <div className="flex items-center md:hidden">
            <button className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="ml-4 font-bold text-slate-900 italic">Doctor Portal</h2>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
               Welcome back, <span className="text-blue-600 italic">Dr. {doctorName.split(' ').pop()}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</div>
                <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">Active Now</div>
             </div>
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
               {doctorName.charAt(0)}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 overflow-auto bg-[#fafafa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
