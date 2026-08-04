import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { packageService } from '../lib/packageService';
import { hospitalService } from '../lib/hospitalService';
import { 
  Search, ShieldCheck, Sparkles, Clock, CheckCircle2, ChevronRight, 
  TestTube, Building2, Calendar, FileText, Filter, ArrowRight, RefreshCw, ChevronDown
} from 'lucide-react';

const DiagnosticDirectory = () => {
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, pkgRes, hospRes] = await Promise.all([
        packageService.getCategories(),
        packageService.getPackages(),
        hospitalService.getHospitals()
      ]);
      setCategories(catRes || []);
      setPackages(pkgRes || []);
      setHospitals(hospRes || []);
    } catch (err) {
      console.error('Error loading diagnostic packages directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = search === '' || 
      pkg.package_name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || pkg.category_id === selectedCategory;
    const matchesHospital = selectedHospital === 'All' || pkg.hospital_id === selectedHospital;

    return matchesSearch && matchesCategory && matchesHospital;
  });

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedHospital('All');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
          {/* Subtle Glow & Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DATABASE-CONNECTED LAB DIAGNOSTICS</span>
            </div>

            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
              Diagnostic Health <span className="bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">Checkup Packages</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
              Explore 75+ parameter full-body checkups, cardiac profiles, diabetic monitoring, and specialized pathology panels with free home sample collection.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <Link
                to="/packages/track"
                className="py-3.5 px-7 bg-blue-700 hover:bg-blue-800 text-white border border-blue-600 font-bold text-sm rounded-2xl transition-all flex items-center gap-2 active:scale-95"
              >
                <Clock className="w-4 h-4 text-blue-200" />
                <span>Track Booking Status</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Search & Categories Filter Bar */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5">
            
            {/* Search Bar & Hospital Filter */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search package name, cardiac, diabetes, thyroid, or vitamin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              {/* Hospital Dropdown Filter */}
              <div className="relative">
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                >
                  <option value="All">All Hospital Campuses</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.hospital_name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Category Filter Pills (14 Recommended Categories) */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Diagnostic Categories ({categories.length})
                </span>
                {(selectedCategory !== 'All' || selectedHospital !== 'All' || search) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'All'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Packages
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Package Grid Section */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <h2 className="font-headline font-black text-2xl text-slate-900 tracking-tight">
                Verified Health Checkup Packages
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Showing {filteredPackages.length} packages loaded dynamically from database
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Free Home Collection Included</span>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-100 rounded-2xl" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-xl mx-auto">
              <TestTube className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-headline font-bold text-lg text-slate-900">No Diagnostic Packages Found</h3>
              <p className="text-xs text-slate-500 font-medium">
                No health checkup package matches your active search filters. Try clearing filters or searching another keyword.
              </p>
              <button
                onClick={resetFilters}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => {
                const categoryObj = categories.find(c => c.id === pkg.category_id);
                const hospitalObj = hospitals.find(h => h.id === pkg.hospital_id);

                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="p-7 space-y-5">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {categoryObj ? categoryObj.category_name : 'General Wellness'}
                        </span>

                        {pkg.original_price && pkg.original_price > pkg.price && (
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                            Save ${pkg.original_price - pkg.price}
                          </span>
                        )}
                      </div>

                      {/* Package Name & Desc */}
                      <div className="space-y-2">
                        <h3 className="font-headline font-black text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                          {pkg.package_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                          {pkg.description || 'Comprehensive laboratory diagnostic profile with fast digital report generation.'}
                        </p>
                      </div>

                      {/* Included Tests Summary Badge */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <TestTube className="w-3.5 h-3.5 text-blue-600" />
                            <span>Included Pathology Tests</span>
                          </span>
                          <span className="text-blue-600 font-black">{pkg.total_tests || 0} Parameters</span>
                        </div>

                        {pkg.fasting_required && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>Fasting required ({pkg.fasting_hours || '10-12'} hours)</span>
                          </div>
                        )}
                      </div>

                      {/* Provider Campus */}
                      {hospitalObj && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{hospitalObj.hospital_name}</span>
                        </div>
                      )}

                    </div>

                    {/* Footer Pricing & CTA */}
                    <div className="p-7 pt-0 space-y-4">
                      <div className="flex items-baseline justify-between pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-2xl font-black text-slate-900">${pkg.price}</span>
                          {pkg.original_price && (
                            <span className="text-xs text-slate-400 line-through ml-2">${pkg.original_price}</span>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          Free Home Collection
                        </span>
                      </div>

                      <Link
                        to={`/packages/${pkg.id}`}
                        className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-all shadow-md text-center flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>View Included Tests & Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DiagnosticDirectory;
