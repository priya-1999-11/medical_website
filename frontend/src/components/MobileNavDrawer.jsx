import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, Phone, Clock, MapPin, Stethoscope, User, Calendar, Info, Home } from 'lucide-react';

const MobileNavDrawer = ({ isOpen, onClose, departments = [], user, onNavigate }) => {
  const [showDepts, setShowDepts] = useState(false);
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in-up"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Link to="/" onClick={onClose} className="flex items-center gap-2 group">
            <img
              src="/prana_logo.png"
              alt="PRANA Healthcare Services"
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Alert Banner */}
        <div className="bg-green-50 p-4 border-b border-green-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4D9B2A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#4D9B2A] uppercase tracking-wider">24/7 Helpline</div>
            <a href="tel:+180073736489" className="text-sm font-extrabold text-slate-900 hover:underline">
              +1 (800) SERENITY
            </a>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1 flex-1">
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              isActive('/') 
                ? 'bg-blue-50 text-[#275B99] font-bold' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/doctors"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              isActive('/doctors') 
                ? 'bg-blue-50 text-[#275B99] font-bold' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors</span>
          </Link>

          {/* Services Accordion */}
          <div>
            <button
              onClick={() => setShowDepts(!showDepts)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm text-slate-700 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-slate-500">medical_services</span>
                <span>Services ({departments.length})</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDepts ? 'rotate-180 text-[#275B99]' : ''}`} />
            </button>

            {showDepts && (
              <div className="ml-4 pl-4 border-l-2 border-blue-100 my-1 space-y-1">
                {departments.map((dept) => (
                  <Link
                    key={dept.id}
                    to={`/book-appointment?dept=${encodeURIComponent(dept.name)}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#275B99] hover:bg-blue-50/50 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-[#275B99]">
                      {dept.icon || 'medical_services'}
                    </span>
                    <span>{dept.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/about"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              isActive('/about') 
                ? 'bg-blue-50 text-[#275B99] font-bold' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </Link>

          <Link
            to="/book-appointment"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              isActive('/book-appointment') 
                ? 'bg-blue-50 text-[#275B99] font-bold' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <button
            onClick={() => {
              onClose();
              onNavigate(user ? '/patient-dashboard' : '/patient-login');
            }}
            className="w-full bg-[#275B99] hover:bg-[#1F4B80] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <User className="w-4 h-4" />
            <span>{user ? 'Patient Dashboard' : 'Book Consultation'}</span>
          </button>
          
          <div className="text-center text-[10px] font-medium text-slate-400">
            Open Mon-Sun: 24 Hours Emergency Care
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
