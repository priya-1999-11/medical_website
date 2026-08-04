import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { MdPerson, MdPhone, MdAssignmentInd, MdHealing, MdHistory, MdLocalPharmacy, MdArrowBack } from 'react-icons/md';

const PatientDetailsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    symptoms: '',
    previous_medications: '',
    diseases: '',
  });

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/patient-login');
          return;
        }

        if (editData) {
          setFormData(editData);
        } else {
          // Check if record already exists for this user
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setFormData(data);
          } else {
            // Pre-fill from auth metadata if available
            setFormData(prev => ({
              ...prev,
              name: user.user_metadata?.full_name || '',
              phone: user.user_metadata?.phone || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingData();
  }, [navigate, editData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const payload = {
        ...formData,
        user_id: user.id,
        age: parseInt(formData.age),
      };

      // Upsert logic: If record with user_id exists, update it. Else insert.
      const { error } = await supabase
        .from('patients')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      alert('Medical details saved successfully!');
      navigate('/patient-dashboard');
    } catch (error) {
      alert('Error saving details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/patient-dashboard')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm"
        >
          <MdArrowBack /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-blue-700 p-8 md:p-12 text-white">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Medical History & Details</h1>
            <p className="text-blue-100 opacity-80 italic">Please provide accurate information for better care.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span> Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
                  <div className="relative group">
                    <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all font-medium text-slate-900"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number *</label>
                  <div className="relative group">
                    <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. +1 234 567 890"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Age *</label>
                  <div className="relative group">
                    <MdAssignmentInd className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="number"
                      name="age"
                      required
                      placeholder="e.g. 25"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Gender</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 group-focus-within:text-primary transition-colors">wc</span>
                    <select
                      name="gender"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 appearance-none"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Info Section */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span> Medical Condition
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Current Symptoms</label>
                  <div className="relative group">
                    <MdHealing className="absolute left-4 top-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <textarea
                      name="symptoms"
                      rows="3"
                      placeholder="Describe what you're feeling..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 resize-none"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Previous Medications</label>
                    <div className="relative group">
                      <MdLocalPharmacy className="absolute left-4 top-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <textarea
                        name="previous_medications"
                        rows="3"
                        placeholder="List medications you've taken..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 resize-none"
                        value={formData.previous_medications}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Existing Diseases</label>
                    <div className="relative group">
                      <MdHistory className="absolute left-4 top-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <textarea
                        name="diseases"
                        rows="3"
                        placeholder="e.g. Diabetes, Hypertension..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 resize-none"
                        value={formData.diseases}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Medical Details
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient-dashboard')}
                className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsForm;
