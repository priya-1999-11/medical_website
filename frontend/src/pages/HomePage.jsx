import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabaseClient';
const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .contains('display_sections', ['meet_specialist'])
        .eq('available_today', true)
        .limit(3);
        
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDoctors(), fetchDepartments()]);
      setLoading(false);
    };
    init();
  }, [fetchDoctors, fetchDepartments]);

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-20 scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYyXGpF2VdxtNNARfHCSQOpnaGHqzReCYVAcVWUar36XsTXVD_yNcOgrt7fJSb0xNIxS-vk4U-AVm7YYjIJvvdrAkgNBqNMb7qsHegNyt4ViJhAow7jsAHU23-wxLLcWS2uA53PIaW0OV70IZnH98xiCGPT9sYWzYR25jumQXPtUgPNVZIeiMVbcxiv125WqRkEFK0TRXA0WFz9zRyM9NjujGydJ5aMzgbypUuK1hsVAdkLDShmjXKXoYnfEj7Ql8dk4qd92qOnzU"
              alt="Modern bright hospital lobby"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent"></div>
          </div>
          <div className="container mx-auto px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <span className="inline-block py-1 px-3 bg-blue-100 text-blue-800 rounded-full text-xs font-bold tracking-wider mb-6">
                TRUSTED MEDICAL EXCELLENCE
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Compassionate Care for Your{' '}
                <span className="text-primary italic">Community</span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                Experience a new standard of healthcare where clinical precision
                meets human warmth. We are committed to your family's lifelong
                wellness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/book-appointment"
                  className="flex items-center justify-center gap-3 bg-gradient-to-br from-primary to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all"
                  data-testid="hero-book-appointment-btn"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    calendar_month
                  </span>
                  Book Appointment
                </Link>
                <button className="flex items-center justify-center gap-3 bg-white border border-slate-300 text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emergency
                  </span>
                  Emergency Contact
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  className="w-full h-[500px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANKToOtOhjnvx1-XXVsCoAyRL21GX7KkUPtjri_L9Slh9nZH8Q9xDrV6zfBmdyuFEVqI9xTDXVqzNPzMTywdWhG62ZpgtXQholS08xlaZqGzgUqeQK_HZ_vy3R3icXaEOSbHOnT7tM2AecEpz1yrkjV34JA8ykO4oD7IioQ0UatoXYoyYtYXzZEcEL2pwuUmWegYHYIh13dNBgP93XpWCfzayhSUp6Hle2qyHyO4FxawhGF0BEUSAYL2GTtHjl48AwkE4MgyKSfeA"
                  alt="Friendly female doctor"
                />
              </div>
              <div className="absolute -bottom-6 -left-12 z-20 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-700">group</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">50k+</div>
                  <div className="text-xs text-slate-600 font-medium">
                    Patients Served Yearly
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Bento */}
        <section className="py-12 bg-surface" id="services">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/doctors"
                className="group flex items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/10"
                data-testid="quick-action-find-doctor"
              >
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    person_search
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-slate-900">
                    Find Doctor
                  </h3>
                  <p className="text-sm text-slate-600">
                    Search specialists by department
                  </p>
                </div>
              </Link>
              <a
                href="#"
                className="group flex items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/10"
              >
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-blue-700 text-3xl">
                    lab_profile
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-slate-900">
                    Lab Reports
                  </h3>
                  <p className="text-sm text-slate-600">
                    Secure access to your test results
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="group flex items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/10"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-slate-700 text-3xl">
                    directions
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-slate-900">
                    Get Directions
                  </h3>
                  <p className="text-sm text-slate-600">
                    Find the nearest branch & parking
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-8">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <h2 className="font-headline text-4xl font-bold mb-4">
                Specialized Medical Services
              </h2>
              <p className="text-slate-600 text-lg">
                Comprehensive care across all major disciplines with
                state-of-the-art diagnostic facilities.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {departments.length === 0 ? (
                <>
                  {/* Fallback to Medicine if none found (optional) */}
                  <div className="col-span-full py-20 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-[2rem]">
                    No departments added yet. Please check Admin Dashboard.
                  </div>
                </>
              ) : (
                departments.map(dept => (
                  <div key={dept.id} className="bg-white p-8 rounded-3xl hover:translate-y-[-8px] transition-transform shadow-sm">
                    <div className="text-primary mb-6">
                      <span
                        className="material-symbols-outlined text-4xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {dept.icon || 'medical_services'}
                      </span>
                    </div>
                    <h4 className="font-headline font-bold text-xl mb-3">
                      {dept.name}
                    </h4>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                      {dept.description}
                    </p>
                    <Link
                      to={`/book-appointment?dept=${encodeURIComponent(dept.name)}`}
                      className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all"
                    >
                      Book Now{' '}
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Doctors */}
        <section className="py-24 bg-surface overflow-hidden" data-testid="featured-doctors-section">
          <div className="container mx-auto px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
              <div>
                <h2 className="font-headline text-4xl font-bold mb-4">
                  Meet Our Specialists
                </h2>
                <p className="text-slate-600 max-w-xl">
                  Our team of globally recognized medical professionals is here
                  to provide the highest quality of care.
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex gap-4">
                <button className="p-3 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-3 rounded-full border border-slate-300 bg-white shadow-sm hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-3 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-slate-600">Loading doctors...</p>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="group" data-testid={`doctor-card-${doctor.id}`}>
                    <div className="relative rounded-[2rem] overflow-hidden mb-6 aspect-[4/5] bg-slate-100 shadow-lg">
                      <img
                        className="w-full h-full object-contain bg-slate-50 transition-transform duration-700 group-hover:scale-105"
                        src={doctor.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=500&auto=format&fit=crop'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=500&auto=format&fit=crop';
                        }}
                        alt={doctor.name}
                      />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl">
                          <div className="flex items-center gap-1 text-blue-100 bg-primary px-2 py-0.5 rounded-full w-fit text-[10px] font-bold mb-2 tracking-widest uppercase">
                            {doctor.department}
                          </div>
                          <h4 className="font-headline font-extrabold text-xl text-slate-900">
                            {doctor.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-slate-600 text-sm font-medium">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>
                            {doctor.schedule}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                data-testid="view-all-doctors-btn"
              >
                View All Doctors
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Health Packages */}
        <section className="py-12">
          <div className="container mx-auto px-8">
            <div className="bg-primary rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative shadow-2xl">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
              <div className="flex-1 z-10 text-center lg:text-left">
                <h3 className="font-headline text-white text-3xl md:text-5xl font-black mb-6">
                  Invest in Your Health with Premium Packages
                </h3>
                <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto lg:mx-0">
                  Up to 40% discount on comprehensive full-body screenings and
                  wellness assessments this season.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-white/20 transition-all">
                    <div>
                      <div className="text-white font-bold text-lg">
                        Full Body Checkup
                      </div>
                      <div className="text-white/70 text-sm">
                        64 Essential Tests
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-white transition-transform group-hover:translate-x-2">
                      arrow_forward
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-white/20 transition-all">
                    <div>
                      <div className="text-white font-bold text-lg">
                        Women's Wellness
                      </div>
                      <div className="text-white/70 text-sm">
                        PCOS & Hormonal Profile
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-white transition-transform group-hover:translate-x-2">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 z-10 relative">
                <div className="bg-white p-2 rounded-[2rem] shadow-xl rotate-3 scale-90 md:scale-100">
                  <img
                    className="w-full h-64 md:w-80 md:h-80 object-cover rounded-[1.5rem]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACjJjcZbmbJZ8eNMp9IBw5hU3g90WEuwpuVbfXzEjHZJ63bN_Ko0mSyKoxQLqQVjZtQjBf-Mff9DO0asJjzX190EEeiXde4e2QDnEzcF-jySQdsSA8K4aMqvnCC0hRKRc03siZvRtXlgZty9mcpjAwjH8zpgshMT7OlV-j8Ds0C7xpn_ojLA1kS2MjxT3l0xl9NxL-X62dTTMkJj9NydeylxJtH2AZZ-JYJNBVOo89xHDReitiArMy1mJ6uEB_Sdu5YfiMmWeBkUE"
                    alt="Lab equipment"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Location */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-stretch">
              <div className="lg:col-span-4 flex flex-col justify-center">
                <h2 className="font-headline text-4xl font-bold mb-8">
                  We're Here When You Need Us
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        phone_in_talk
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                        24/7 Helpline
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        +1 (800) SERENITY
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        location_on
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                        Main Campus
                      </div>
                      <div className="text-slate-900 leading-snug">
                        Medical Plaza District
                        <br />
                        Suite 400, Clinical Ave
                        <br />
                        Citywest, CW 50210
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        mail
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                        Email Support
                      </div>
                      <div className="text-slate-900">
                        care@clinicalserenity.com
                      </div>
                    </div>
                  </div>
                </div>
                <button className="mt-12 bg-white text-slate-900 font-bold py-4 px-8 rounded-xl shadow-md border border-slate-300 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                  View All Locations
                  <span className="material-symbols-outlined">map</span>
                </button>
              </div>
              <div className="lg:col-span-8 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                <img
                  className="w-full h-full object-cover grayscale opacity-50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQbHvdYk0jb8Uih-KFqPq_-dQZGoisfoHc3EprhIFpTWv8D4PdwM7daZZxpfJdJ0xQ2hxNtG99cErdfUjdmkcf4908pU1Vac2a3P2vZhAmeDNPWwozrFpbX-5hRiVqpA7T72aJG0peOKFvLOEL0CcRjUqe5JXjdXhE426ned62Zoax2zmumuBhG2wscZRywyld0O91tiRmDYPkiwytkzJc8DbcHTnokqx1MoJnx6pgQ-j2hF6JAB2FFtzdbe_Z6sYjbsI9jC4oVTM"
                  alt="Map location"
                />
                <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25"></div>
                    <div className="relative bg-white p-3 rounded-full shadow-2xl border-4 border-primary">
                      <span
                        className="material-symbols-outlined text-primary text-3xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_hospital
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
