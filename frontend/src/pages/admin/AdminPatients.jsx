import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MdSearch, MdFilterList, MdEdit, MdDelete, MdPerson, MdPhone, MdAssignmentInd, MdHealing } from 'react-icons/md';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('All');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        const { error } = await supabase.from('patients').delete().eq('id', id);
        if (error) throw error;
        setPatients(patients.filter(p => p.id !== id));
        alert('Patient record deleted successfully.');
      } catch (error) {
        alert('Error deleting patient: ' + error.message);
      }
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.phone?.includes(searchTerm);
    const matchesGender = filterGender === 'All' || p.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 font-medium italic">Manage and monitor all registered patients</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-xl font-black text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">groups</span>
              Total: {patients.length}
           </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 relative group">
          <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <select
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900 appearance-none"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all p-6 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => handleDelete(patient.id)}
                  className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  title="Delete patient record"
                >
                  <MdDelete size={18} />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                  <MdPerson className="text-primary text-2xl group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight mb-0.5">{patient.name}</h3>
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                    {patient.gender || 'N/A'} • {patient.age}Y
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <MdPhone className="text-slate-300 group-hover:text-primary transition-colors" />
                  {patient.phone}
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group/symptoms">
                  <div className="flex items-center gap-2 mb-2">
                    <MdHealing className="text-slate-300 text-xs" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Symptoms</span>
                  </div>
                  <p className="text-slate-700 text-xs font-bold leading-relaxed italic line-clamp-3">
                    {patient.symptoms || 'No symptoms reported.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Joined {new Date(patient.created_at).toLocaleDateString()}</span>
                 <span className="text-slate-300">ID: {patient.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <span className="material-symbols-outlined text-4xl">search_off</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No patients found</h3>
          <p className="text-slate-500 font-medium italic">Adjust your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
