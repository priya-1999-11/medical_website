import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdLocalHospital, 
  MdPhone, 
  MdLocationOn, 
  MdStar, 
  MdCheckCircle, 
  MdCancel, 
  MdCloudUpload,
  MdClose
} from 'react-icons/md';

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [cities, setCities] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    hospital_name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    rating: 4.8,
    is_open: true,
    status: 'active',
    description: '',
    logo_url: '',
    banner_url: ''
  });

  // File Upload states
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('hospitals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setHospitals(data || []);

      const uniqueCities = Array.from(new Set((data || []).map(h => h.city).filter(Boolean)));
      setCities(uniqueCities);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleOpenModal = (hospital = null) => {
    if (hospital) {
      setEditingHospital(hospital);
      setFormData({
        hospital_name: hospital.hospital_name || '',
        city: hospital.city || '',
        address: hospital.address || '',
        phone: hospital.phone || '',
        email: hospital.email || '',
        website: hospital.website || '',
        rating: hospital.rating || 4.8,
        is_open: hospital.is_open ?? true,
        status: hospital.status || 'active',
        description: hospital.description || '',
        logo_url: hospital.logo_url || '',
        banner_url: hospital.banner_url || ''
      });
      setLogoPreview(hospital.logo_url);
      setBannerPreview(hospital.banner_url);
    } else {
      setEditingHospital(null);
      setFormData({
        hospital_name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        rating: 4.8,
        is_open: true,
        status: 'active',
        description: '',
        logo_url: '',
        banner_url: ''
      });
      setLogoPreview(null);
      setBannerPreview(null);
    }
    setLogoFile(null);
    setBannerFile(null);
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

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (file, pathPrefix) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pathPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;
      const filePath = `hospitals/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) {
        // Fallback Data URL if bucket upload fails
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload error:', err);
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.hospital_name.trim() || !formData.city.trim() || !formData.address.trim()) {
      return alert('Hospital Name, City, and Address are required.');
    }

    setSubmitting(true);
    try {
      let finalLogo = formData.logo_url;
      let finalBanner = formData.banner_url;

      if (logoFile) {
        finalLogo = await handleUploadImage(logoFile, 'logo');
      }
      if (bannerFile) {
        finalBanner = await handleUploadImage(bannerFile, 'banner');
      }

      const payload = {
        hospital_name: formData.hospital_name.trim(),
        hospital_code: editingHospital?.hospital_code || `HOSP-${Date.now()}`,
        city: formData.city.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        rating: parseFloat(formData.rating) || 4.8,
        is_open: formData.is_open,
        status: formData.status,
        description: formData.description.trim(),
        logo_url: finalLogo || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=200&auto=format&fit=crop',
        banner_url: finalBanner || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop'
      };

      if (editingHospital) {
        const { error } = await supabase.from('hospitals').update(payload).eq('id', editingHospital.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hospitals').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchHospitals();
    } catch (err) {
      console.error('Error saving hospital:', err);
      alert('Failed to save hospital: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete hospital "${name}"?`)) return;

    try {
      const { error } = await supabase.from('hospitals').delete().eq('id', id);
      if (error) throw error;
      fetchHospitals();
    } catch (err) {
      console.error('Error deleting hospital:', err);
      alert('Delete error: ' + err.message);
    }
  };

  const handleToggleStatus = async (hospital) => {
    const newStatus = hospital.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase.from('hospitals').update({ status: newStatus }).eq('id', hospital.id);
      if (error) throw error;
      fetchHospitals();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = 
      (h.hospital_name && h.hospital_name.toLowerCase().includes(search.toLowerCase())) ||
      (h.city && h.city.toLowerCase().includes(search.toLowerCase())) ||
      (h.address && h.address.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCity = filterCity === 'All' || h.city === filterCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Hospitals Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Empaneled Hospitals Directory</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Add, update, or remove super-specialty hospital campuses in the Supabase database.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <MdAdd size={18} />
          <span>Add New Hospital</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Search hospital name, city, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">City Filter:</span>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Hospitals Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-100">
          No hospitals found matching criteria.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              
              <div>
                {/* Banner & Logo */}
                <div className="relative h-36 bg-slate-900">
                  <img
                    src={hospital.banner_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop"}
                    alt={hospital.hospital_name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Status Toggle Badge */}
                  <button
                    onClick={() => handleToggleStatus(hospital)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md transition-all ${
                      hospital.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {hospital.status || 'Active'}
                  </button>

                  <div className="absolute -bottom-4 left-4">
                    <img
                      src={hospital.logo_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=200&auto=format&fit=crop"}
                      alt="Logo"
                      className="w-12 h-12 rounded-xl bg-white p-1 object-cover shadow-lg border border-slate-200"
                    />
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 pt-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">{hospital.hospital_name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <MdStar />
                      <span>{hospital.rating || 4.8}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <MdLocationOn className="text-blue-600 shrink-0" />
                    <span>{hospital.address}, {hospital.city}</span>
                  </p>

                  {hospital.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <MdPhone className="text-blue-600 shrink-0" />
                      <span>{hospital.phone}</span>
                    </p>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 pt-1 font-normal">
                    {hospital.description || 'Super-specialty accredited hospital campus.'}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenModal(hospital)}
                  className="flex-1 py-2 px-3 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <MdEdit size={16} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(hospital.id, hospital.hospital_name)}
                  className="py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  title="Delete Hospital"
                >
                  <MdDelete size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Hospital Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="font-black text-slate-900 text-xl">
                {editingHospital ? 'Edit Hospital Details' : 'Add New Hospital Campus'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <MdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prana Main Medical Center"
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">City / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="7095777377"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Full Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100 Serenity Medical Way, Suite 400"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Description / Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of hospital specialties and facilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                {/* Upload Logo */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Hospital Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload" className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                    <MdCloudUpload className="text-blue-600 text-base" />
                    <span className="font-bold text-slate-600">Choose Logo Image</span>
                  </label>
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border mt-2" />
                  )}
                </div>

                {/* Upload Banner */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Banner Image</label>
                  <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" id="banner-upload" />
                  <label htmlFor="banner-upload" className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                    <MdCloudUpload className="text-blue-600 text-base" />
                    <span className="font-bold text-slate-600">Choose Banner Image</span>
                  </label>
                  {bannerPreview && (
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-16 rounded-xl object-cover border mt-2" />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Hospital'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminHospitals;
