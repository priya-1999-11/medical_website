import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight, Star, Building2, CheckCircle2 } from 'lucide-react';

const HospitalCard = ({ hospital }) => {
  if (!hospital) return null;

  const defaultBanner = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&h=400&auto=format&fit=crop";
  const displayImage = hospital.banner_url || hospital.image || defaultBanner;
  const name = hospital.hospital_name || hospital.name || `${hospital.city || 'Serenity'} Hospital`;
  const rating = hospital.rating ? Number(hospital.rating).toFixed(1) : '4.9';
  const totalReviews = hospital.total_reviews || 45;
  const isOpen = hospital.is_open !== false;

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between">
      <div>
        {/* Hospital Card Media / Image Header */}
        <div className="relative h-60 overflow-hidden bg-slate-900">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Top Status & Rating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {/* Rating Badge */}
            <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-700/80 shadow-md">
              <Star className="w-3.5 h-3.5 text-green-400 fill-green-400" />
              <span className="text-xs font-bold text-white">{rating}</span>
              <span className="text-[10px] text-slate-400 font-medium">({totalReviews})</span>
            </div>

            {/* Availability Status Badge */}
            <div className={`backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border shadow-md ${
              isOpen ? 'bg-green-950/80 border-green-500/40 text-green-300' : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-[#4D9B2A] animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isOpen ? 'Open Now • 24/7 Care' : 'Closed'}
              </span>
            </div>
          </div>

          {/* Hospital Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 flex items-center gap-3">
              {hospital.logo_url && (
                <img src={hospital.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover bg-white shrink-0" />
              )}
              <div>
                <h3 className="font-headline font-black text-white text-base md:text-lg tracking-tight line-clamp-1">
                  {name}
                </h3>
                {hospital.city && (
                  <p className="text-[11px] text-[#4D9B2A] font-bold uppercase tracking-wider">
                    {hospital.city} Campus
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-3.5 text-xs text-slate-600">
          <div className="flex gap-3 items-start font-medium">
            <MapPin className="w-4 h-4 text-[#275B99] shrink-0 mt-0.5" />
            <span className="leading-relaxed text-slate-700">{hospital.address || 'Medical District Avenue'}</span>
          </div>

          {hospital.phone && (
            <div className="flex gap-3 items-center font-medium">
              <Phone className="w-4 h-4 text-[#275B99] shrink-0" />
              <a href={`tel:${hospital.phone}`} className="font-bold text-slate-900 hover:text-[#275B99] transition-colors">
                {hospital.phone}
              </a>
            </div>
          )}

          {hospital.email && (
            <div className="flex gap-3 items-center font-medium">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`mailto:${hospital.email}`} className="text-slate-600 hover:text-slate-900 transition-colors break-all">
                {hospital.email}
              </a>
            </div>
          )}

          <div className="flex gap-3 items-center font-medium pt-2 border-t border-slate-100">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-600">
              {hospital.opening_time && hospital.closing_time 
                ? `Hours: ${hospital.opening_time.slice(0, 5)} - ${hospital.closing_time.slice(0, 5)}`
                : 'Mon - Sun: 24 Hours Emergency & OPD'}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Row */}
      <div className="p-6 pt-0 grid grid-cols-2 gap-2.5">
        <Link
          to={`/hospitals/${hospital.id}`}
          className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-[#275B99] rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-[#275B99]" />
          <span>Hospital Details</span>
        </Link>

        <Link
          to={`/book-appointment?hospitalId=${hospital.id}`}
          className="py-3 px-4 bg-[#275B99] hover:bg-[#4D9B2A] text-white rounded-xl font-bold text-xs transition-all shadow-md text-center flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>Book Visit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default HospitalCard;
