import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const TreatmentCard = ({ title, icon, description, badge, count }) => {
  return (
    <Link
      to={`/doctors?department=${encodeURIComponent(title)}`}
      className="group bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Hover accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#275B99] to-[#4D9B2A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#4D9B2A] flex items-center justify-center group-hover:bg-[#4D9B2A] group-hover:text-white transition-all duration-300 shadow-sm">
            <span className="material-symbols-outlined text-2xl">
              {icon || 'medical_services'}
            </span>
          </div>
          {count && (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 group-hover:bg-green-100 group-hover:text-[#4D9B2A] px-3 py-1 rounded-full transition-colors">
              {count} Doctors
            </span>
          )}
        </div>

        {badge && (
          <span className="inline-block px-3 py-1 bg-green-50 text-[#4D9B2A] rounded-full text-[10px] font-bold mb-3 tracking-wider border border-green-100 uppercase">
            {badge}
          </span>
        )}

        <h3 className="font-headline font-extrabold text-xl text-slate-900 mb-2 tracking-tight group-hover:text-[#275B99] transition-colors">
          {title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
          {description || 'Specialized diagnostic procedures and advanced therapeutic treatments with expert clinicians.'}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-[#275B99] transition-all pt-2 border-t border-slate-50">
        <span>Find Specialists</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

export default TreatmentCard;
