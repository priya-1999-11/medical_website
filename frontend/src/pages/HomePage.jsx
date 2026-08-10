import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabaseClient';
import { hospitalService } from '../lib/hospitalService';
import { packageService } from '../lib/packageService';
import { insuranceService } from '../lib/insuranceService';
import { 
  Search, ArrowRight, ShieldCheck, Stethoscope, Clock, Calendar, 
  Building2, MapPin, CheckCircle2, ChevronDown, 
  Send, Star, Activity, Award, Phone, Users, FileText, HeartPulse,
  Microscope, Check
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [selectedWhyChoose, setSelectedWhyChoose] = useState(null);
  
  // Hero Slider states and synchronized slides definition
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [sliderAutoplay, setSliderAutoplay] = useState(true);

  const heroSlides = [
    {
      id: 1,
      badge: "PRANA Healthcare Services Network",
      line1: "Integrated Care Built Around",
      line2Prefix: "You ",
      line2Amp: "&",
      line2Suffix: " Your Loved Ones",
      hasAmp: true,
      subtitle: "A unified ecosystem of clinical experts, modern hospital campuses, and transparent medical coverage. Caring for you at every milestone.",
      image_url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1600&auto=format&fit=crop",
      cardTitle: "State-of-the-Art Hospital Plaza",
      cardSubtitle: "PRANA Partner Network • 24 Hours"
    },
    {
      id: 2,
      badge: "Advanced Facilities & Expert Care",
      line1: "Advanced Hospitals,",
      line2: "Trusted Care",
      hasAmp: false,
      subtitle: "Explore leading hospitals equipped with modern facilities, experienced specialists, and patient-focused healthcare services.",
      image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
      cardTitle: "Modern Multi-Specialty Campus",
      cardSubtitle: "Advanced Operating & ICU Facilities"
    },
    {
      id: 3,
      badge: "Connected Healthcare Network",
      line1: "Right Hospital,",
      line2: "Right Care, Right Time",
      hasAmp: false,
      subtitle: "Find the right hospital and specialist for your healthcare needs with a simpler, more connected care experience.",
      image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop",
      cardTitle: "Specialist Care Network",
      cardSubtitle: "Personalized Patient Healthcare Services"
    }
  ];

  useEffect(() => {
    const loadHomepageData = async () => {
      setLoading(true);
      try {
        const { data: docData } = await supabase.from('doctors').select('*').limit(4);
        const { data: deptData } = await supabase.from('departments').select('*').order('name');
        const hospData = await hospitalService.getHospitals();
        const pkgData = await packageService.getPackages();
        const provData = await insuranceService.getProviders();

        setDoctors(docData || []);
        setDepartments(deptData || []);
        setHospitals(hospData ? hospData.slice(0, 3) : []);
        setPackages(pkgData ? pkgData.slice(0, 3) : []);
        setInsuranceProviders(provData || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomepageData();
  }, []);

  useEffect(() => {
    if (!sliderAutoplay) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [sliderAutoplay, heroSlides.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Static list for Featured Departments fallback
  const featuredDeptList = [
    { title: 'Cardiology', desc: 'Comprehensive heart care, ECG, & interventional procedures.', icon: 'favorite', count: '12 Specialists' },
    { title: 'Neurology', desc: 'Advanced brain, spine, & neurological disease management.', icon: 'psychology', count: '8 Specialists' },
    { title: 'Orthopedics', desc: 'Joint replacement, trauma care, & sports medicine.', icon: 'orthopedics', count: '15 Specialists' },
    { title: 'Pediatrics', desc: 'Dedicated child healthcare, neonatal care, & vaccinations.', icon: 'child_care', count: '10 Specialists' },
    { title: 'General Medicine', desc: 'Primary diagnosis, preventive checkups, & chronic care.', icon: 'medical_services', count: '20 Specialists' },
    { title: 'Dental', desc: 'Oral health, restorative dentistry, & cosmetic procedures.', icon: 'dentistry', count: '9 Specialists' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col justify-between overflow-x-hidden relative">
      {/* Hospital Theme Background Layer with Opacity */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0 opacity-[0.14]"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop')` }}
      />

      <div className="relative z-10">
        <NavBar />

        {/* ========================================================= */}
        {/* 1. HERO SECTION — FULL-WIDTH HOSPITAL BACKGROUND WITH DARK OVERLAY */}
        {/* ========================================================= */}
        <section 
          className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-cover bg-center overflow-hidden border-b border-blue-900"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1600&auto=format&fit=crop')` }}
        >
          {/* Dark Brand Overlay (Blue/Slate blend matching logo colors) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/80 to-[#163861]/75 z-0" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Left Content */}
              <div 
                className="lg:col-span-7 space-y-6 text-center lg:text-left overflow-hidden"
                onMouseEnter={() => setSliderAutoplay(false)}
                onMouseLeave={() => setSliderAutoplay(true)}
              >
                
                {/* Hospital Badge - Synchronized with active slide */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#4D9B2A] text-xs font-bold tracking-wide transition-all duration-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4D9B2A] animate-pulse" />
                  <span className="text-white">{heroSlides[currentSlideIndex].badge}</span>
                </div>

                {/* Synchronized Hero Text Horizontal Carousel Track */}
                <div className="overflow-hidden w-full">
                  <div 
                    className="flex transition-transform duration-600 ease-in-out"
                    style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                  >
                    {heroSlides.map((slide) => (
                      <div
                        key={slide.id}
                        className="w-full shrink-0 flex-none space-y-3"
                      >
                        {/* Main Headline */}
                        <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-[1.15]">
                          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{slide.line1}</span> <br />
                          <span className="text-[#4d9b2a]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                            {slide.hasAmp ? (
                              <>
                                {slide.line2Prefix}
                                <span style={{ fontFamily: "'Manrope', sans-serif" }}>{slide.line2Amp}</span>
                                {slide.line2Suffix}
                              </>
                            ) : (
                              slide.line2
                            )}
                          </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-slate-300 text-base md:text-lg max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
                          {slide.subtitle}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search Box */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/10 max-w-xl mx-auto lg:mx-0 text-left">
                  <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                    <Search className="w-5 h-5 text-[#275B99] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search doctor name, specialty, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-32 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#275B99] focus:border-[#275B99] transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#275B99] hover:bg-[#1F4B80] text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Search</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Popular Tags */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Popular:</span>
                    {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'].map((spec) => (
                      <button
                        key={spec}
                        onClick={() => {
                          setSearchQuery(spec);
                          navigate(`/doctors?search=${encodeURIComponent(spec)}`);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#275B99] font-semibold rounded-lg transition-all border border-slate-200 hover:border-blue-200"
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    to="/book-appointment"
                    className="py-4 px-8 bg-[#275B99] hover:bg-[#1F4B80] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2.5 active:scale-95"
                  >
                    <Calendar className="w-4.5 h-4.5" />
                    <span>Book Appointment</span>
                  </Link>

                  <Link
                    to="/doctors"
                    className="py-4 px-8 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 font-bold text-sm rounded-2xl transition-all flex items-center gap-2.5 shadow-sm active:scale-95"
                  >
                    <Stethoscope className="w-4.5 h-4.5 text-green-300" />
                    <span>Find Doctor</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#4D9B2A]" />
                    <span>ISO 9001 Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#275B99]" />
                    <span>24/7 Emergency Care</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#4D9B2A]" />
                    <span>100% Cashless Support</span>
                  </div>
                </div>

              </div>

              {/* Hero Right — Hospital Facility Slider/Carousel */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
                <div 
                  className="relative w-full aspect-[4/3] sm:aspect-[14/10] rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900/80 group cursor-pointer"
                  onMouseEnter={() => setSliderAutoplay(false)}
                  onMouseLeave={() => setSliderAutoplay(true)}
                >
                  {/* Slider Track with horizontal slide transition */}
                  <div 
                    className="flex h-full w-full transition-transform duration-600 ease-in-out"
                    style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                  >
                    {heroSlides.map((slide) => (
                      <div
                        key={slide.id}
                        className="relative w-full h-full shrink-0 flex-none"
                      >
                        <img
                          src={slide.image_url}
                          alt={slide.cardTitle}
                          className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        
                        {/* Banner overlay label */}
                        <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-3 z-20">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#275B99] flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-headline font-bold text-slate-900 text-sm">
                              {slide.cardTitle}
                            </h4>
                            <p className="text-[11px] text-[#4D9B2A] font-semibold">
                              {slide.cardSubtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none" />
                </div>

                {/* Navigation dots below the slider */}
                <div className="flex gap-2.5 mt-4 z-20 relative">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentSlideIndex 
                          ? 'bg-[#4D9B2A] w-6' 
                          : 'bg-white/40 hover:bg-white/75'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Floating Badge — Rating */}
                <div className="absolute -top-4 -right-2 sm:right-2 bg-white p-3.5 px-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-30 pointer-events-none">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-[#4D9B2A] flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-[#4D9B2A]" />
                  </div>
                  <div>
                    <span className="font-headline font-extrabold text-slate-900 text-xs block">4.9 / 5.0 Rating</span>
                    <span className="text-[10px] text-slate-500 font-semibold">12,000+ Happy Patients</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. QUICK HEALTHCARE SERVICES */}
        {/* ========================================================= */}
        <section className="py-16 bg-white/90 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#4D9B2A] uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Patient Services
              </span>
              <h2 className="font-headline text-3xl font-black text-slate-900">
                Seamless Care Access
              </h2>
              <p className="text-slate-600 text-sm">
                Direct connection to specialized clinical wings, recovery centers, and digital claims support.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {[
                { title: 'Clinical Specialists', subtitle: 'Expert consultations', icon: Stethoscope, path: '/doctors', bg: 'bg-blue-50 text-[#275B99]' },
                { title: 'Our Care Facilities', subtitle: 'State-of-the-art centers', icon: Building2, path: '/hospitals', bg: 'bg-green-50 text-[#4D9B2A]' },
                { title: 'Direct Coverage', subtitle: 'Stress-free billing', icon: ShieldCheck, path: '/insurance', bg: 'bg-blue-50 text-[#275B99]' },
                { title: 'Wellness Panels', subtitle: 'Proactive screenings', icon: Activity, path: '/packages', bg: 'bg-green-50 text-[#4D9B2A]' },
                { title: 'Advanced Diagnostics', subtitle: 'High-precision testing', icon: Microscope, path: '/book-appointment', bg: 'bg-blue-50 text-[#275B99]' },
                { title: 'Immediate Response', subtitle: '24/7 emergency dispatch', icon: Phone, path: '/book-appointment', bg: 'bg-green-50 text-[#4D9B2A]' },
              ].map((serv, idx) => {
                const IconComp = serv.icon;
                return (
                  <Link
                    key={idx}
                    to={serv.path}
                    className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#275B99]/40 hover:-translate-y-1.5 transition-all flex flex-col items-center text-center space-y-3"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${serv.bg} flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>
                      <IconComp className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-slate-900 text-sm group-hover:text-[#275B99] transition-colors">{serv.title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{serv.subtitle}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. STATISTICS SECTION */}
        {/* ========================================================= */}
        <section className="py-14 bg-gradient-to-r from-[#275B99] to-[#1F4B80] text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divider-y lg:divider-y-0">
              
              <div className="space-y-1 p-4">
                <div className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-white">500+</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100">Medical Experts</div>
              </div>

              <div className="space-y-1 p-4">
                <div className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-white">50+</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100">Integrated Facilities</div>
              </div>

              <div className="space-y-1 p-4">
                <div className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-white">10,000+</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100">Lives Restored</div>
              </div>

              <div className="space-y-1 p-4">
                <div className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#4D9B2A] bg-white/10 rounded-2xl py-1">24/7</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">Priority Trauma Care</div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. WHY CHOOSE PRANA HEALTHCARE */}
        {/* ========================================================= */}
        <section className="py-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-14">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#275B99] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Clinical Excellence
              </span>
              <h2 className="font-headline text-3xl md:text-4xl font-black text-slate-900">
                Redefining the Care Journey
              </h2>
              <p className="text-slate-600 text-sm md:text-base">
                Experience an integrated approach that connects elite specialists, modern infrastructure, and digitized workflows.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Board-Certified Leaders',
                  desc: 'Consult with recognized specialists who lead their respective medical disciplines with honor and care.',
                  icon: Users,
                  color: 'text-[#275B99] bg-blue-50 border-blue-100'
                },
                {
                  title: 'Direct Billing Integration',
                  desc: 'Enjoy stress-free administration with real-time coverage approvals directly at our desks.',
                  icon: ShieldCheck,
                  color: 'text-[#4D9B2A] bg-green-50 border-green-100'
                },
                {
                  title: 'Advanced Medical Technology',
                  desc: 'Benefit from precision instrumentation, robot-assisted surgical suites, and high-fidelity testing.',
                  icon: Microscope,
                  color: 'text-[#275B99] bg-blue-50 border-blue-100'
                },
                {
                  title: 'Frictionless Scheduling',
                  desc: 'Secure your priority time slot online to eliminate unnecessary waiting room delays.',
                  icon: Calendar,
                  color: 'text-[#4D9B2A] bg-green-50 border-green-100'
                },
                {
                  title: 'Integrated Clinical Portal',
                  desc: 'Access your entire medical file, test results, and care history on a secure, encrypted portal.',
                  icon: FileText,
                  color: 'text-[#275B99] bg-blue-50 border-blue-100'
                },
                {
                  title: 'Priority Trauma Response',
                  desc: 'Rely on Level-1 trauma response teams and intensive care physicians active round-the-clock.',
                  icon: Phone,
                  color: 'text-[#4D9B2A] bg-green-50 border-green-100'
                },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                const isSelected = selectedWhyChoose === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedWhyChoose(isSelected ? null : idx)}
                    className={`cursor-pointer rounded-3xl p-8 border transition-all duration-300 space-y-4 flex flex-col justify-between select-none ${
                      isSelected 
                        ? 'bg-slate-200/95 border-[#275B99] shadow-inner scale-[0.98]' 
                        : 'bg-white border-slate-200/80 shadow-sm hover:shadow-xl hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className={`w-14 h-14 rounded-2xl ${item.color} border flex items-center justify-center transition-transform ${isSelected ? 'scale-110' : ''}`}>
                        <ItemIcon className="w-7 h-7" />
                      </div>
                      <h3 className="font-headline font-bold text-xl text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#275B99] pt-2">
                      <Check className="w-4 h-4 text-[#4D9B2A]" />
                      <span>{isSelected ? 'Selected Feature Highlight' : 'Verified Healthcare Standard'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. FEATURED DEPARTMENTS */}
        {/* ========================================================= */}
        <section className="py-20 bg-white/90 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
            
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#4D9B2A] uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  Medical Specialties
                </span>
                <h2 className="font-headline text-3xl md:text-4xl font-black text-slate-900">
                  Featured Departments
                </h2>
              </div>

              <Link
                to="/doctors"
                className="text-xs font-bold text-[#275B99] hover:underline flex items-center gap-1"
              >
                <span>View All Specialties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(departments.length > 0 ? departments.slice(0, 6) : featuredDeptList).map((dept, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#275B99] flex items-center justify-center font-bold group-hover:bg-[#275B99] group-hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-2xl">
                          {dept.icon || 'medical_services'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#4D9B2A] bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                        {dept.count || 'Available'}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-xl text-slate-900 group-hover:text-[#275B99] transition-colors">
                      {dept.name || dept.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {dept.description || dept.desc || 'Specialized diagnostic procedures and advanced therapeutic treatments with expert clinicians.'}
                    </p>
                  </div>

                  <Link
                    to={`/doctors?department=${encodeURIComponent(dept.name || dept.title)}`}
                    className="text-xs font-bold text-[#275B99] hover:underline flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-100"
                  >
                    <span>Consult Department Doctor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. TRUSTED HOSPITALS */}
        {/* ========================================================= */}
        <section className="py-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
            
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#275B99] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Accredited Network
                </span>
                <h2 className="font-headline text-3xl font-black text-slate-900">
                  Our Integrated Centers
                </h2>
              </div>

              <Link
                to="/hospitals"
                className="py-3 px-6 bg-[#275B99] hover:bg-[#1F4B80] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>Explore All Hospitals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {hospitals.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto w-full">
                <p className="text-slate-500 font-medium text-sm">No Hospitals Available.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {hospitals.map((hosp) => (
                  <div key={hosp.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="relative h-48 bg-slate-900">
                        <img src={hosp.banner_url || hosp.logo_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600'} alt={hosp.hospital_name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-[#4D9B2A] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          24/7 OPEN
                        </div>
                      </div>
                      <div className="p-6 pt-0 space-y-1">
                        <h3 className="font-headline font-bold text-slate-900 text-lg line-clamp-1">{hosp.hospital_name}</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#275B99]" />
                          <span className="truncate">{hosp.address}, {hosp.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 space-y-2">
                      <Link to={`/hospitals/${hosp.id}`} className="w-full py-3 bg-[#275B99] hover:bg-[#1F4B80] text-white rounded-xl text-xs font-bold transition-all text-center block active:scale-95">
                        Explore Hospital Details
                      </Link>
                      {hosp.website ? (
                        <a
                          href={hosp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <span>Visit Website</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </a>
                      ) : (
                        <div className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl font-medium text-xs text-center border border-slate-100 select-none">
                          Website Not Available
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. INSURANCE PARTNERS */}
        {/* ========================================================= */}
        <section className="py-16 bg-white/90 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#4D9B2A] uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Insurance Coverage
              </span>
              <h2 className="font-headline text-2xl md:text-3xl font-black text-slate-900">
                Direct Coverage Partners
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {(insuranceProviders.length > 0 ? insuranceProviders : [
                { id: 1, provider_name: 'Star Health Insurance' },
                { id: 2, provider_name: 'Care Health Insurance' },
                { id: 3, provider_name: 'HDFC ERGO Health' },
                { id: 4, provider_name: 'Niva Bupa Health' },
                { id: 5, provider_name: 'ICICI Lombard' }
              ]).map((prov) => (
                <div key={prov.id} className="flex items-center gap-3 bg-slate-50 px-6 py-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-[#4D9B2A]" />
                  <span className="font-headline font-bold text-slate-800 text-xs md:text-sm">{prov.provider_name}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Need coverage guidance? <Link to="/insurance" className="text-[#275B99] font-bold hover:underline">Connect with our billing coordinators</Link>
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. HEALTH PACKAGES */}
        {/* ========================================================= */}
        <section className="py-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
            
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#275B99] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Preventive Care
                </span>
                <h2 className="font-headline text-3xl font-black text-slate-900">
                  Proactive Screenings & Health Panels
                </h2>
              </div>

              <Link
                to="/packages"
                className="py-3 px-6 bg-[#275B99] hover:bg-[#1F4B80] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>View All Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {packages.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto w-full">
                <p className="text-slate-500 font-medium text-sm">No Diagnostic Packages Available.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-[#4D9B2A] rounded-full text-xs font-bold border border-green-200">
                        <span>{pkg.total_tests || 75}+ Parameters</span>
                      </div>

                      <h3 className="font-headline font-bold text-xl text-slate-900">{pkg.package_name}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{pkg.description}</p>

                      <div className="flex items-baseline gap-3 pt-2">
                        <span className="text-2xl font-black text-slate-900">${pkg.price}</span>
                        {pkg.original_price && pkg.original_price > pkg.price && (
                          <span className="text-sm text-slate-400 line-through font-medium">${pkg.original_price}</span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/packages/${pkg.id}`}
                      className="w-full py-3.5 bg-[#275B99] hover:bg-[#1F4B80] text-white rounded-2xl font-bold text-xs shadow-md transition-all text-center block active:scale-95"
                    >
                      Book Health Package
                    </Link>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. TESTIMONIALS */}
        {/* ========================================================= */}
        <section className="py-20 bg-white/90 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#4D9B2A] uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Patient Feedback
              </span>
              <h2 className="font-headline text-3xl font-black text-slate-900">
                Real Care Outcomes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Jenkins',
                  role: 'Cardiovascular Patient',
                  comment: 'The care I received at the cardiac center was outstanding. The scheduling was direct, and the clinical team outlined my options with great clarity.',
                  rating: 5
                },
                {
                  name: 'Robert Miller',
                  role: 'Integrated Billing Patient',
                  comment: 'The billing coordination took less than thirty minutes. Outstanding clinical facilities, highly supportive nursing care, and a smooth return home.',
                  rating: 5
                },
                {
                  name: 'Elena Rostova',
                  role: 'Wellness Screening Patient',
                  comment: 'Scheduled my screening panel online. The lab clinician arrived precisely on time, and my records were available securely within the day.',
                  rating: 5
                }
              ].map((test, idx) => (
                <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#4D9B2A]">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#4D9B2A]" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs md:text-sm leading-relaxed italic">
                      "{test.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#275B99] text-white flex items-center justify-center font-bold text-sm">
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-slate-900 text-sm">{test.name}</h4>
                      <p className="text-[11px] text-[#4D9B2A] font-semibold">{test.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-[#275B99] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-headline text-3xl font-black text-slate-900">
              Questions &amp; Answers
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How do I schedule a consultation with a specialist?",
                a: "Use the clinical search bar, select your specialist, choose from the real-time calendar, and confirm your slot instantly."
              },
              {
                q: "How is direct medical coverage coordinated?",
                a: "Our billing desk coordinates directly with your provider to process pre-authorization approvals within thirty minutes."
              },
              {
                q: "Are screenings available with home sample collection?",
                a: "Yes, selecting any wellness panel allows you to request home collection at your convenience."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-headline font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#275B99]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
