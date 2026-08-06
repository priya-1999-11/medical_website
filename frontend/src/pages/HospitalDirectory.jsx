import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Star, Clock, Filter, Sparkles, RefreshCw, ChevronDown, Check } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { hospitalService } from '../lib/hospitalService';

const HospitalDirectory = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasHospitals, setHasHospitals] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedMinRating, setSelectedMinRating] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(false);

  const [options, setOptions] = useState({
    cities: ['Hyderabad'],
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Gynecology'],
    ratings: [4.5, 4.0, 3.5]
  });

  useEffect(() => {
    const loadOptions = async () => {
      const opt = await hospitalService.getFilterOptions();
      if (opt) {
        setOptions(prev => ({ ...prev, ...opt }));
      }
    };
    loadOptions();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await hospitalService.getHospitals({
        search,
        city: selectedCity,
        department: selectedDepartment,
        minRating: selectedMinRating ? parseFloat(selectedMinRating) : null,
        isOpen: onlyOpen ? true : null
      });
      setHospitals(data || []);
      
      // Check if database itself is completely empty
      if (search === '' && selectedCity === 'All Cities' && selectedDepartment === 'All Departments' && !selectedMinRating && !onlyOpen) {
        setHasHospitals((data || []).length > 0);
      }
    } catch (err) {
      console.error('Failed to load hospitals:', err);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, [search, selectedCity, selectedDepartment, selectedMinRating, onlyOpen]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCity('All Cities');
    setSelectedDepartment('All Departments');
    setSelectedMinRating('');
    setOnlyOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Header Section */}
        <section className="relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
          {/* Subtle Glow & Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DATABASE-CONNECTED NETWORK</span>
            </div>

            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
              Specialty <span className="bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">Medical Facilities</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
              Explore our state-of-the-art medical complexes, emergency trauma centers, and diagnostic institutes.
            </p>
          </div>
        </section>

        {/* Dynamic Search & Multi-Criteria Filter Bar */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
            
            {/* Search Input Row */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hospital name, location, address, or treatment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              
              {/* City Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Location / City
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                  >
                    <option value="All Cities">All Cities</option>
                    {options.cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Department / Specialty
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                  >
                    <option value="All Departments">All Departments</option>
                    {options.departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Minimum Rating
                </label>
                <div className="relative">
                  <select
                    value={selectedMinRating}
                    onChange={(e) => setSelectedMinRating(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">★ 4.5 & Above</option>
                    <option value="4.0">★ 4.0 & Above</option>
                    <option value="3.5">★ 3.5 & Above</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Open Status Toggle & Reset Button */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyOpen(!onlyOpen)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    onlyOpen
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>24/7 Open</span>
                  {onlyOpen && <Check className="w-3 h-3 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  title="Reset Filters"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* Hospitals Results Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          {/* Header Counter */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <h2 className="font-headline font-black text-2xl text-slate-900 tracking-tight">
                Verified Hospitals
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {loading ? 'Fetching dynamic database entries...' : `Showing ${hospitals.length} hospital campus${hospitals.length === 1 ? '' : 'es'}`}
              </p>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                  <div className="h-48 bg-slate-200 rounded-2xl" />
                  <div className="h-6 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : !hasHospitals ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="font-headline text-xl font-bold text-slate-900 mb-2">No Hospitals Available</h3>
              <p className="text-xs text-slate-500 font-medium">
                Please check back later or contact hospital network support.
              </p>
            </div>
          ) : hospitals.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="font-headline text-xl font-bold text-slate-900 mb-2">No Hospitals Found</h3>
              <p className="text-xs text-slate-500 mb-6">
                We couldn't find any hospitals matching your current filter criteria. Try adjusting your search query or city selection.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Hospitals Grid */
            <div className="grid md:grid-cols-2 gap-8">
              {hospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HospitalDirectory;
