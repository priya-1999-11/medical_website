import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MdAdd, MdEdit, MdDelete, MdSearch, MdShield, MdClose,
  MdCheckCircle, MdCancel, MdCloudUpload, MdPhone, MdEmail, MdLanguage
} from 'react-icons/md';

const AdminInsurance = () => {
  const [providers, setProviders] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Hospital assignment modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningProvider, setAssigningProvider] = useState(null);
  const [assignedHospitalIds, setAssignedHospitalIds] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    provider_name: '',
    description: '',
    support_email: '',
    support_phone: '',
    website: '',
    provider_logo: '',
    status: 'active'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insurance_providers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHospitals = useCallback(async () => {
    try {
      const { data } = await supabase.from('hospitals').select('id, hospital_name, city').eq('status', 'active');
      setHospitals(data || []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
    fetchHospitals();
  }, [fetchProviders, fetchHospitals]);

  const handleOpenModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        provider_name: provider.provider_name || '',
        description: provider.description || '',
        support_email: provider.support_email || '',
        support_phone: provider.support_phone || '',
        website: provider.website || '',
        provider_logo: provider.provider_logo || '',
        status: provider.status || 'active'
      });
      setLogoPreview(provider.provider_logo);
    } else {
      setEditingProvider(null);
      setFormData({
        provider_name: '', description: '', support_email: '',
        support_phone: '', website: '', provider_logo: '', status: 'active'
      });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.provider_name.trim()) return alert('Provider name is required.');
    setSubmitting(true);
    try {
      let finalLogo = formData.provider_logo;
      if (logoFile) {
        // Try Supabase storage, fallback to data URL
        try {
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `insurance_logo_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('avatars').upload(`insurance/${fileName}`, logoFile);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('avatars').getPublicUrl(`insurance/${fileName}`);
          finalLogo = data.publicUrl;
        } catch {
          finalLogo = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(logoFile);
          });
        }
      }

      const payload = {
        provider_name: formData.provider_name.trim(),
        description: formData.description.trim(),
        support_email: formData.support_email.trim(),
        support_phone: formData.support_phone.trim(),
        website: formData.website.trim(),
        provider_logo: finalLogo || '',
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      if (editingProvider) {
        const { error } = await supabase.from('insurance_providers').update(payload).eq('id', editingProvider.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('insurance_providers').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProviders();
    } catch (err) {
      console.error('Error saving provider:', err);
      alert('Failed to save: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete insurance provider "${name}"? This will also remove all linked plans and hospital assignments.`)) return;
    try {
      const { error } = await supabase.from('insurance_providers').delete().eq('id', id);
      if (error) throw error;
      fetchProviders();
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  const handleToggleStatus = async (provider) => {
    const newStatus = provider.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase.from('insurance_providers').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', provider.id);
      if (error) throw error;
      fetchProviders();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Hospital Assignment
  const handleOpenAssignModal = async (provider) => {
    setAssigningProvider(provider);
    try {
      const { data } = await supabase.from('hospital_insurance').select('hospital_id').eq('provider_id', provider.id);
      setAssignedHospitalIds((data || []).map(d => d.hospital_id));
    } catch (err) {
      setAssignedHospitalIds([]);
    }
    setIsAssignModalOpen(true);
  };

  const handleToggleHospitalAssignment = (hospitalId) => {
    setAssignedHospitalIds(prev =>
      prev.includes(hospitalId) ? prev.filter(id => id !== hospitalId) : [...prev, hospitalId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!assigningProvider) return;
    setSubmitting(true);
    try {
      // Delete existing assignments
      await supabase.from('hospital_insurance').delete().eq('provider_id', assigningProvider.id);
      // Insert new ones
      if (assignedHospitalIds.length > 0) {
        const rows = assignedHospitalIds.map(hid => ({
          hospital_id: hid,
          provider_id: assigningProvider.id,
          cashless_available: true,
          pre_authorization_required: true,
          status: 'active'
        }));
        const { error } = await supabase.from('hospital_insurance').insert(rows);
        if (error) throw error;
      }
      setIsAssignModalOpen(false);
      alert('Hospital assignments saved successfully!');
    } catch (err) {
      alert('Error saving assignments: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    (p.provider_name && p.provider_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Insurance Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Insurance Providers & Cashless Network</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Add, update, or remove empaneled insurance partners.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0">
          <MdAdd size={18} />
          <span>Add Insurance Provider</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative w-full sm:w-80">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input type="text" placeholder="Search provider name..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold shrink-0">{filteredProviders.length} providers</span>
      </div>

      {/* Provider Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : filteredProviders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-100">No insurance providers found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {provider.provider_logo ? (
                      <img src={provider.provider_logo} alt={provider.provider_name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><MdShield size={24} /></div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{provider.provider_name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">{provider.support_email || 'No email'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggleStatus(provider)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${provider.status === 'active' ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                    {provider.status}
                  </button>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{provider.description || 'Insurance partner with cashless facility.'}</p>
                {provider.support_phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><MdPhone className="text-blue-600" /> {provider.support_phone}</p>
                )}
                {provider.website && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><MdLanguage className="text-blue-600" /> {provider.website}</p>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button onClick={() => handleOpenModal(provider)} className="flex-1 py-2 px-3 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                  <MdEdit size={14} /> Edit
                </button>
                <button onClick={() => handleOpenAssignModal(provider)} className="flex-1 py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                  <MdCheckCircle size={14} /> Hospitals
                </button>
                <button onClick={() => handleDelete(provider.id, provider.provider_name)} className="py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-xl text-xs font-bold transition-all">
                  <MdDelete size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="font-black text-slate-900 text-xl">{editingProvider ? 'Edit Insurance Provider' : 'Add New Insurance Provider'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Provider Name *</label>
                <input type="text" required placeholder="e.g. Star Health Insurance" value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Description</label>
                <textarea rows={3} placeholder="Brief description of coverage..." value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Support Email</label>
                  <input type="email" placeholder="support@provider.com" value={formData.support_email}
                    onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Support Phone</label>
                  <input type="text" placeholder="+1 (800) 123-4567" value={formData.support_phone}
                    onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Website</label>
                <input type="text" placeholder="https://www.provider.com" value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Provider Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="ins-logo-upload" />
                <label htmlFor="ins-logo-upload" className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                  <MdCloudUpload className="text-blue-600 text-base" />
                  <span className="font-bold text-slate-600">Upload Logo</span>
                </label>
                {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border mt-2" />}
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Hospitals Modal */}
      {isAssignModalOpen && assigningProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="font-black text-slate-900 text-lg">Assign Hospitals</h2>
                <p className="text-[11px] text-slate-500 font-medium">{assigningProvider.provider_name}</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><MdClose size={24} /></button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {hospitals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No active hospitals found in database.</p>
              ) : hospitals.map((hosp) => (
                <label key={hosp.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  assignedHospitalIds.includes(hosp.id) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                  <input type="checkbox" checked={assignedHospitalIds.includes(hosp.id)} onChange={() => handleToggleHospitalAssignment(hosp.id)} className="accent-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900">{hosp.hospital_name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{hosp.city}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-end gap-3">
              <button onClick={() => setIsAssignModalOpen(false)} className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all">Cancel</button>
              <button onClick={handleSaveAssignments} disabled={submitting} className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50">
                {submitting ? 'Saving...' : `Save (${assignedHospitalIds.length} selected)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInsurance;
