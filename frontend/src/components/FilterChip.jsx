import React from 'react';

const FilterChip = ({ label, active, onClick, count, icon }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 border whitespace-nowrap active:scale-95 ${
        active
          ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
      }`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px]">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            active
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default FilterChip;
