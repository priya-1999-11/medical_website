import React from 'react';
import { MdSettings } from 'react-icons/md';

const AdminSettings = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            System Settings
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Portal Settings & Configurations</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Configure global site options, API credentials, and administrative preferences.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <MdSettings size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Settings Module Placeholder</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          System configuration parameters will be implemented in subsequent phases.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
