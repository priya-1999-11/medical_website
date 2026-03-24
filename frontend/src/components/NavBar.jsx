import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 h-20">
      <div className="flex justify-between items-center px-8 h-full max-w-full">
        <Link to="/" className="text-xl font-bold tracking-tight text-blue-900 font-headline">
          Clinical Serenity
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/doctors"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Find Doctor
          </Link>
          <Link
            to="/#services"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Services
          </Link>
          <Link
            to="/book-appointment"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all scale-95 active:duration-100">
            Patient Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;