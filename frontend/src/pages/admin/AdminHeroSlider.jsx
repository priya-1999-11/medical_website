import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdCloudUpload,
  MdClose,
  MdArrowUpward,
  MdArrowDownward,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';

const AdminHeroSlider = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    is_active: true,
    display_order: 0
  });

  // File Upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchSliderImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_slider_images')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching hero slider images:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliderImages();
  }, [fetchSliderImages]);

  const handleOpenModal = (slide = null) => {
    if (slide) {
      setEditingImage(slide);
      setFormData({
        title: slide.title || '',
        image_url: slide.image_url || '',
        is_active: slide.is_active ?? true,
        display_order: slide.display_order ?? 0
      });
      setImagePreview(slide.image_url);
    } else {
      setEditingImage(null);
      // Automatically calculate next display order
      const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order || 0)) + 1 : 1;
      setFormData({
        title: '',
        image_url: '',
        is_active: true,
        display_order: nextOrder
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

  const handleUploadImage = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `slider_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;
      const filePath = `slider/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) {
        // Fallback to base64 Data URL if storage bucket fails/missing
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Storage upload error, using base64 fallback:', err);
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!imagePreview && !imageFile) {
      return alert('An image is required.');
    }

    setSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        finalImageUrl = await handleUploadImage(imageFile);
      }

      const payload = {
        title: formData.title.trim(),
        image_url: finalImageUrl,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order) || 0
      };

      if (editingImage) {
        const { error } = await supabase.from('hero_slider_images').update(payload).eq('id', editingImage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slider_images').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchSliderImages();
    } catch (err) {
      console.error('Error saving slider image:', err);
      alert('Failed to save slider image: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const label = title || 'this slider image';
    if (!window.confirm(`Are you sure you want to delete "${label}"?`)) return;

    try {
      const { error } = await supabase.from('hero_slider_images').delete().eq('id', id);
      if (error) throw error;
      fetchSliderImages();
    } catch (err) {
      console.error('Error deleting slider image:', err);
      alert('Failed to delete slider image.');
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      const { error } = await supabase
        .from('hero_slider_images')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);
      if (error) throw error;
      fetchSliderImages();
    } catch (err) {
      console.error('Error toggling active state:', err);
    }
  };

  const handleMove = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSlide = images[index];
    const targetSlide = images[targetIndex];

    try {
      // Swap display orders
      const tempOrder = currentSlide.display_order;
      
      const { error: err1 } = await supabase
        .from('hero_slider_images')
        .update({ display_order: targetSlide.display_order })
        .eq('id', currentSlide.id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from('hero_slider_images')
        .update({ display_order: tempOrder })
        .eq('id', targetSlide.id);
      if (err2) throw err2;

      fetchSliderImages();
    } catch (err) {
      console.error('Error reordering slider images:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hero Slider Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage auto-playing banner images, their order, and activation status on the Home Page Hero section.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <MdAdd size={18} />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse space-y-4">
              <div className="h-40 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-xl mx-auto shadow-sm space-y-3">
          <p className="text-slate-500 font-medium text-sm">No slider images uploaded yet.</p>
          <button
            onClick={() => handleOpenModal()}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`bg-white rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 flex flex-col justify-between ${
                slide.is_active ? 'border-slate-200/80 hover:shadow-lg' : 'border-slate-100 opacity-60'
              }`}
            >
              <div>
                {/* Image Container */}
                <div className="relative h-44 bg-slate-900">
                  <img src={slide.image_url} alt={slide.title || 'Slide Image'} className="w-full h-full object-cover" />
                  
                  {/* Overlay Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="bg-slate-950/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full border border-slate-700">
                      Order: {slide.display_order}
                    </span>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm border transition-colors ${
                        slide.is_active 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {slide.is_active ? <MdCheckCircle /> : <MdCancel />}
                      <span>{slide.is_active ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{slide.title || 'Untitled Banner Image'}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{slide.image_url}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                {/* Reordering buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Up"
                  >
                    <MdArrowUpward size={14} />
                  </button>
                  <button
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Down"
                  >
                    <MdArrowDownward size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenModal(slide)}
                    className="py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <MdEdit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id, slide.title)}
                    className="p-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg transition-all"
                    title="Delete Image"
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="font-black text-slate-900 text-lg">
                {editingImage ? 'Edit Slider Image' : 'Add Slider Image'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Slide Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. State-of-the-Art Hospital Plaza"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Status</label>
                  <select
                    value={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-1 pt-2">
                <label className="font-bold text-slate-700 uppercase">Slide Image File</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="slide-image-file" />
                <label 
                  htmlFor="slide-image-file" 
                  className="w-full p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <MdCloudUpload className="text-blue-600 text-lg" />
                  <span className="font-bold text-slate-600">Upload Banner Image File</span>
                </label>

                <div className="text-[10px] text-slate-400 font-medium text-center py-1">OR</div>

                <label className="font-bold text-slate-700 uppercase">Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/banner-photo.jpg"
                  value={formData.image_url}
                  onChange={e => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* Image Preview Box */}
              {imagePreview && (
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-500 uppercase">Selected Preview</label>
                  <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border">
                    <img src={imagePreview} alt="Selected Slide Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
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
                  {submitting ? 'Saving...' : 'Save Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlider;
