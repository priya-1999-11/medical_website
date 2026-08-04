import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdCloudUpload,
  MdMedicalServices, MdStar, MdCheckCircle
} from 'react-icons/md';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    package_name: '',
    package_code: '',
    category_id: '',
    hospital_id: '',
    description: '',
    original_price: 0,
    discount_price: 0,
    report_time: '24 Hours',
    home_collection: true,
    recommended_for: '',
    package_image: '',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diagnostic_packages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase.from('diagnostic_categories').select('id, category_name').eq('status', 'active');
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
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
    fetchPackages();
    fetchCategories();
    fetchHospitals();
  }, [fetchPackages, fetchCategories, fetchHospitals]);

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        package_name: pkg.package_name || '',
        package_code: pkg.package_code || '',
        category_id: pkg.category_id || '',
        hospital_id: pkg.hospital_id || '',
        description: pkg.description || '',
        original_price: pkg.original_price || 0,
        discount_price: pkg.discount_price || 0,
        report_time: pkg.report_time || '24 Hours',
        home_collection: pkg.home_collection ?? true,
        recommended_for: pkg.recommended_for || '',
        package_image: pkg.package_image || '',
        status: pkg.status || 'active'
      });
      setImagePreview(pkg.package_image);
    } else {
      setEditingPackage(null);
      setFormData({
        package_name: '', package_code: '', category_id: '', hospital_id: '',
        description: '', original_price: 0, discount_price: 0,
        report_time: '24 Hours', home_collection: true, recommended_for: '',
        package_image: '', status: 'active'
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.package_name.trim()) return alert('Package name is required.');
    if (!formData.original_price || parseFloat(formData.original_price) <= 0) return alert('Original price must be greater than 0.');

    setSubmitting(true);
    try {
      let finalImage = formData.package_image;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `pkg_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('avatars').upload(`packages/${fileName}`, imageFile);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('avatars').getPublicUrl(`packages/${fileName}`);
          finalImage = data.publicUrl;
        } catch {
          finalImage = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(imageFile);
          });
        }
      }

      const payload = {
        package_name: formData.package_name.trim(),
        package_code: formData.package_code.trim() || `PKG-${Date.now()}`,
        category_id: formData.category_id || null,
        hospital_id: formData.hospital_id || null,
        description: formData.description.trim(),
        original_price: parseFloat(formData.original_price) || 0,
        discount_price: parseFloat(formData.discount_price) || null,
        report_time: formData.report_time || '24 Hours',
        home_collection: formData.home_collection,
        recommended_for: formData.recommended_for.trim(),
        package_image: finalImage || '',
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      if (editingPackage) {
        const { error } = await supabase.from('diagnostic_packages').update(payload).eq('id', editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('diagnostic_packages').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      console.error('Error saving package:', err);
      alert('Failed to save: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete diagnostic package "${name}"?`)) return;
    try {
      const { error } = await supabase.from('diagnostic_packages').delete().eq('id', id);
      if (error) throw error;
      fetchPackages();
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  const handleToggleStatus = async (pkg) => {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase.from('diagnostic_packages').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', pkg.id);
      if (error) throw error;
      fetchPackages();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Resolve category name from ID
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.category_name : 'Uncategorized';
  };

  const filteredPackages = packages.filter(p => {
    const matchesSearch =
      (p.package_name && p.package_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.package_code && p.package_code.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || p.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Diagnostic Packages</span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Health Checkup Packages</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Manage diagnostic health packages, pricing, and test inclusions.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0">
          <MdAdd size={18} />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input type="text" placeholder="Search package name, code..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer">
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
          </select>
          <span className="text-xs text-slate-400 font-bold">{filteredPackages.length} packages</span>
        </div>
      </div>

      {/* Package Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-100">No diagnostic packages found.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 text-left">
                <tr>
                  <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Package</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Report Time</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {pkg.package_image ? (
                          <img src={pkg.package_image} alt={pkg.package_name} className="w-10 h-10 rounded-xl object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><MdMedicalServices size={18} /></div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{pkg.package_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{pkg.package_code || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-medium">{getCategoryName(pkg.category_id)}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs">
                        {pkg.discount_price && pkg.discount_price < pkg.original_price ? (
                          <>
                            <span className="font-black text-slate-900">₹{pkg.discount_price}</span>
                            <span className="text-slate-400 line-through ml-1.5">₹{pkg.original_price}</span>
                          </>
                        ) : (
                          <span className="font-black text-slate-900">₹{pkg.original_price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-medium">{pkg.report_time || '24h'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggleStatus(pkg)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${pkg.status === 'active' ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                        {pkg.status}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(pkg)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit"><MdEdit size={16} /></button>
                        <button onClick={() => handleDelete(pkg.id, pkg.package_name)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="font-black text-slate-900 text-xl">{editingPackage ? 'Edit Package' : 'Create New Diagnostic Package'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Package Name *</label>
                  <input type="text" required placeholder="e.g. Full Body Health Checkup" value={formData.package_name}
                    onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Package Code</label>
                  <input type="text" placeholder="e.g. FBC-001" value={formData.package_code}
                    onChange={(e) => setFormData({ ...formData, package_code: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Category</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Hospital</label>
                  <select value={formData.hospital_id} onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer">
                    <option value="">Select Hospital</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospital_name} — {h.city}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Report Time</label>
                  <input type="text" placeholder="e.g. 24 Hours" value={formData.report_time}
                    onChange={(e) => setFormData({ ...formData, report_time: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Original Price (₹) *</label>
                  <input type="number" required min="1" placeholder="e.g. 3500" value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Discount Price (₹)</label>
                  <input type="number" min="0" placeholder="e.g. 2499" value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Description</label>
                  <textarea rows={3} placeholder="Package details and included tests..." value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Recommended For</label>
                  <input type="text" placeholder="e.g. Men & Women above 30" value={formData.recommended_for}
                    onChange={(e) => setFormData({ ...formData, recommended_for: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <input type="checkbox" id="home-collection" checked={formData.home_collection} onChange={(e) => setFormData({ ...formData, home_collection: e.target.checked })} className="accent-blue-600" />
                  <label htmlFor="home-collection" className="font-bold text-slate-700 cursor-pointer">Home Sample Collection Available</label>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Package Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="pkg-img-upload" />
                  <label htmlFor="pkg-img-upload" className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                    <MdCloudUpload className="text-blue-600 text-base" />
                    <span className="font-bold text-slate-600">Upload Package Image</span>
                  </label>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-24 rounded-xl object-cover border mt-2" />}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
