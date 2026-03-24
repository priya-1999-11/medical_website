import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    availableToday: false
  });

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = `${API}/doctors?`;
      if (filters.department && filters.department !== 'All Departments') {
        url += `department=${encodeURIComponent(filters.department)}&`;
      }
      if (filters.availableToday) {
        url += `available_today=true&`;
      }
      if (filters.search) {
        url += `search=${encodeURIComponent(filters.search)}&`;
      }

      const response = await axios.get(url);
      setDoctors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    setFilters({ ...filters, department: e.target.value });
  };

  const handleAvailabilityToggle = () => {
    setFilters({ ...filters, availableToday: !filters.availableToday });
  };

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        {/* Hero & Search Section */}
        <header className="mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Find Your Specialist
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Expert medical care tailored to your needs. Browse our directory of
            world-class clinicians and schedule your visit today.
          </p>
        </header>

        {/* Search/Filter Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main Search */}
          <div className="lg:col-span-6 bg-white p-2 rounded-full shadow-sm flex items-center border border-slate-200">
            <div className="pl-4 pr-2 text-slate-600">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 py-3"
              placeholder="Search by doctor name or specialty..."
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              data-testid="doctor-search-input"
            />
          </div>

          {/* Department Filter */}
          <div className="lg:col-span-3 bg-white px-4 rounded-full flex items-center border border-slate-200">
            <span className="material-symbols-outlined text-slate-600 mr-3">
              medication
            </span>
            <select
              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 py-3"
              value={filters.department}
              onChange={handleDepartmentChange}
              data-testid="department-filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="lg:col-span-3 bg-white px-6 rounded-full flex items-center justify-between border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600">
                calendar_today
              </span>
              <span className="text-sm font-medium text-slate-900">
                Available Today
              </span>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              className={`w-10 h-6 rounded-full relative p-1 transition-colors ${
                filters.availableToday ? 'bg-primary' : 'bg-slate-300'
              }`}
              data-testid="availability-toggle"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute transition-all ${
                  filters.availableToday ? 'right-1' : 'left-1'
                }`}
              ></div>
            </button>
          </div>
        </section>

        {/* Results Count */}
        <div className="mb-6 text-slate-600">
          Found <span className="font-bold text-slate-900">{doctors.length}</span>{' '}
          {doctors.length === 1 ? 'doctor' : 'doctors'}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" data-testid="doctors-grid">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                search_off
              </span>
              <p className="text-slate-600">No doctors found matching your criteria.</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-[0_20px_40px_rgba(25,28,29,0.06)] transition-all duration-300 border border-slate-100"
                data-testid={`doctor-card-${doctor.id}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={doctor.photo_url}
                    alt={doctor.name}
                  />
                  {doctor.available_today ? (
                    <div className="absolute top-4 right-4 bg-blue-100/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                        Available Today
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-slate-100/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                        Next: Tomorrow
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                        {doctor.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm tracking-wide font-headline">
                        {doctor.title}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="material-symbols-outlined text-lg">
                        language
                      </span>
                      <span className="text-sm">{doctor.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="material-symbols-outlined text-lg">
                        schedule
                      </span>
                      <span className="text-sm">{doctor.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-sm"
                            style={{
                              fontVariationSettings:
                                i < Math.floor(doctor.rating) ? "'FILL' 1" : "'FILL' 0"
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {doctor.rating} ({doctor.review_count} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="py-3 px-4 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
                      View Profile
                    </button>
                    <Link
                      to={`/book-appointment/${doctor.id}`}
                      className="py-3 px-4 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-primary/10 transition-all text-center"
                      data-testid={`book-now-btn-${doctor.id}`}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDirectory;
