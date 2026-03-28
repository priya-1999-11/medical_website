import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '', title: '', specialty: '', department: '',
    experience_years: 0,
    available_today: true, photo_url: '', schedule: '',
    languages: ['English', 'Hindi'],
    display_sections: []
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const generateUUID = () => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return 'doc_' + Math.random().toString(36).substr(2, 9);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      if (error) throw error;
      const sorted = (data || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setDoctors(sorted);
      const { data: deptData } = await supabase.from('departments').select('name');
      setDepartments(deptData || []);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name || '',
        title: doctor.title || '',
        specialty: doctor.specialty || '',
        department: doctor.department || '',
        experience_years: doctor.experience_years || 0,
        available_today: doctor.available_today ?? true,
        photo_url: doctor.photo_url || '',
        schedule: doctor.schedule || '',
        languages: doctor.languages || ['English', 'Hindi'],
        display_sections: doctor.display_sections || []
      });
      setImagePreview(doctor.photo_url);
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '', title: '', specialty: '', department: '',
        experience_years: 0,
        available_today: true, photo_url: '', schedule: '',
        languages: ['English', 'Hindi'],
        display_sections: []
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim() || !formData.specialty.trim() || !formData.department || !formData.schedule) {
      return alert('Please fill in all required fields');
    }
    if (!formData.photo_url && !selectedFile) return alert('Photo is required');

    setUploading(true);
    try {
      let finalPhotoUrl = formData.photo_url;
      
      // Phase 1: Image Upload (Now Optional/Resilient)
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('doctor-images')
            .upload(`doctor-photos/${fileName}`, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('doctor-images')
            .getPublicUrl(`doctor-photos/${fileName}`);
          
          finalPhotoUrl = publicUrl;
        } catch (uploadErr) {
          console.warn('Storage Upload Failed:', uploadErr.message);
          
          // CRITICAL FIX: If storage upload fails, we save the Base64 string directly
          // to ensure the user's image is NOT LOST and reflects on the website immediately.
          if (imagePreview && imagePreview.startsWith('data:image')) {
            finalPhotoUrl = imagePreview;
            console.log('Using Base64 fallback for image');
          } else {
            finalPhotoUrl = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=300&auto=format&fit=crop';
          }
          
          alert(`Warning: Remote storage upload failed. Using direct image data to ensure the photo reflect on the website.`);
          // Continue to Phase 2 anyway
        }
      }

      // Phase 2: Database Save
      try {
        const doctorData = {
          name: formData.name.trim(),
          title: formData.title.trim(),
          specialty: formData.specialty.trim(),
          department: formData.department,
          experience_years: parseInt(formData.experience_years) || 0,
          schedule: formData.schedule,
          available_today: !!formData.available_today,
          photo_url: finalPhotoUrl,
          languages: formData.languages || ['English', 'Hindi'],
          display_sections: formData.display_sections || [],
          rating: formData.rating || 5.0,
          review_count: formData.review_count || 0,
          about: formData.about || `Expert in ${formData.specialty}`,
          schedule_details: {} 
        };

        // Try without manual ID first, fallback if needed
        const { error: saveError } = editingDoctor 
          ? await supabase.from('doctors').update(doctorData).eq('id', editingDoctor.id)
          : await supabase.from('doctors').insert([doctorData]);

        if (saveError) {
          // If insert without ID fails, try one more time with manual ID
          if (!editingDoctor && (saveError.message.includes('null value') || saveError.message.includes('id'))) {
            doctorData.id = generateUUID();
            const { error: retryError } = await supabase.from('doctors').insert([doctorData]);
            if (retryError) throw retryError;
          } else {
            throw saveError;
          }
        }
      } catch (saveErr) {
        throw new Error(`[Phase 2: Database Save] ${saveErr.message}${saveErr.details ? '\nDetails: ' + saveErr.details : ''}`);
      }

      alert('Doctor saved successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save Flow Failed:', err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor? This is permanent in Supabase!')) {
      try {
        const { error } = await supabase
          .from('doctors')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchData(); // Refresh UI
      } catch (error) {
        alert('Error deleting from Supabase: ' + error.message);
      }
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Doctors</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <MdAdd size={20} /> Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-64">
            <MdSearch className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-slate-500">
            Total output: {filteredDoctors.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Doctor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading data...</td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No doctors found.</td>
                </tr>
              ) : (
                filteredDoctors.map(doctor => (
                  <tr key={doctor.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={doctor.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop';
                          }}
                          alt={doctor.name}
                          className="w-10 h-10 rounded-lg object-contain bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{doctor.name}</div>
                          <div className="text-xs text-slate-500">{doctor.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doctor.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doctor.experience_years} Yrs</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${doctor.available_today ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {doctor.available_today ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(doctor)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-900">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="doctorForm" onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title (e.g. MD - Cardiologist)</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                  <input required type="text" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select 
                    required 
                    value={formData.department} 
                    onChange={e => setFormData({ ...formData, department: e.target.value })} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(dept => (
                      <option key={dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience Years</label>
                  <input required type="number" value={formData.experience_years} onChange={e => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Schedule / Timing</label>
                  <select 
                    required 
                    value={formData.schedule} 
                    onChange={e => setFormData({ ...formData, schedule: e.target.value })} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <option value="">Select Shift Timing...</option>
                    <option value="Mon - Fri: 09:00 - 13:00">Mon - Fri: 09:00 - 13:00</option>
                    <option value="Mon - Fri: 14:00 - 18:00">Mon - Fri: 14:00 - 18:00</option>
                    <option value="Mon - Sat: 10:00 - 16:00">Mon - Sat: 10:00 - 16:00</option>
                    <option value="Sat - Sun: 09:00 - 14:00">Sat - Sun: 09:00 - 14:00</option>
                    <option value="Night Shift: 20:00 - 06:00">Night Shift: 20:00 - 06:00</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-slate-700">Photo Upload (Recommended)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-slate-50" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-300">image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or GIF up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">OR</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Manual Photo URL</label>
                    <input type="url" value={formData.photo_url} onChange={e => {
                      setFormData({ ...formData, photo_url: e.target.value });
                      setImagePreview(e.target.value);
                    }} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                  </div>
                </div>
                <div className="col-span-2 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-[10px]">Display In Sections</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.display_sections?.includes('meet_specialist')} 
                        onChange={e => {
                          const current = formData.display_sections || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, display_sections: [...current, 'meet_specialist'] });
                          } else {
                            setFormData({ ...formData, display_sections: current.filter(s => s !== 'meet_specialist') });
                          }
                        }} 
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Meet Our Specialist</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.display_sections?.includes('find_specialist')} 
                        onChange={e => {
                          const current = formData.display_sections || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, display_sections: [...current, 'find_specialist'] });
                          } else {
                            setFormData({ ...formData, display_sections: current.filter(s => s !== 'find_specialist') });
                          }
                        }} 
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Find Your Specialist</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.available_today} onChange={e => setFormData({ ...formData, available_today: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-slate-700">Available Today for Appointments</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" form="doctorForm" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  editingDoctor ? 'Update Doctor' : 'Save Doctor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDoctors;
