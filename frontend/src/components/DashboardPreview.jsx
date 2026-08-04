import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Calendar, Activity, FileText, Lock, ChevronRight, User, CheckCircle2 } from 'lucide-react';

const DEFAULT_DOCTOR_AVATAR = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop";

const DashboardPreview = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchSampleDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .limit(2);
        if (!error && data && data.length > 0) {
          setDoctors(data);
        }
      } catch (err) {
        console.error('Error fetching doctors for dashboard preview:', err);
      }
    };
    fetchSampleDoctors();
  }, []);

  const leadDoctor = doctors[0] || {
    name: 'Doctor Name Not Available',
    title: 'Senior Medical Specialist',
    photo_url: DEFAULT_DOCTOR_AVATAR
  };

  const secondDoctor = doctors[1] || leadDoctor;

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-wider mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            PATIENT PORTAL PREVIEW
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tight mb-6">
            Your Medical History, <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Unified in One Secure Dashboard
            </span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            Access past consultations, digital prescriptions, lab reports, and appointment schedules anytime from your personal health command center.
          </p>
        </div>

        {/* Dashboard Mockup Grid */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-slate-700/80 shadow-2xl">
          {/* Mock Top Nav */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-700/60 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Logged in Patient</div>
                <div className="text-sm font-bold text-white">Patient Health Portal</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                256-bit Encrypted
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile & Vitals */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Vital Metrics
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">120 / 80</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Optimal Range</div>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">72 <span className="text-xs font-normal text-slate-400">bpm</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Normal Resting</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Recent Prescriptions
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                    <div>
                      <div className="text-xs font-bold text-white">Amoxicillin 500mg</div>
                      <div className="text-[10px] text-slate-400">{leadDoctor.name} • 2x Daily</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                    <div>
                      <div className="text-xs font-bold text-white">Atorvastatin 10mg</div>
                      <div className="text-[10px] text-slate-400">{secondDoctor.name} • 1x Night</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Upcoming Appointments & Records */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Upcoming Consultations
                  </h4>
                  <span className="text-xs text-emerald-400 font-semibold cursor-pointer">View Calendar</span>
                </div>

                <div className="bg-gradient-to-r from-emerald-950/40 to-slate-800 p-5 rounded-xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={leadDoctor.photo_url || DEFAULT_DOCTOR_AVATAR} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_DOCTOR_AVATAR;
                      }}
                      alt={leadDoctor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0" 
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{leadDoctor.name}</div>
                      <div className="text-xs text-emerald-400 font-semibold">{leadDoctor.title || leadDoctor.specialty || 'Senior Specialist'}</div>
                      <div className="text-xs text-slate-400 mt-1">Today at 02:45 PM • Main Campus Room 304</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Action Banner inside Preview */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="font-headline font-black text-2xl mb-1 text-slate-950">
                    Ready to Access Your Portal?
                  </h3>
                  <p className="text-slate-900 text-sm font-medium">
                    Sign in to your patient account to schedule visits and view live medical records.
                  </p>
                </div>

                <Link
                  to="/patient-login"
                  className="bg-slate-950 hover:bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shrink-0 flex items-center gap-2 active:scale-95"
                >
                  <span>Access Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
