import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MdSearch, MdCheckCircle, MdCancel, MdSchedule, MdEdit, MdDelete, MdClose } from 'react-icons/md';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [editForm, setEditForm] = useState({
    patient_full_name: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    status: ''
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          doctor_name,
          department,
          appointment_date,
          appointment_time,
          patient_full_name,
          patient_phone,
          status,
          consultation_fee,
          created_at
        `)
        .order('appointment_date', { ascending: false });
        
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      alert('Appointment deleted successfully');
      fetchAppointments();
    } catch (error) {
      alert('Error deleting appointment: ' + error.message);
    }
  };

  const openEditModal = (apt) => {
    setEditingApt(apt);
    setEditForm({
      patient_full_name: apt.patient_full_name,
      patient_phone: apt.patient_phone,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      status: apt.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('appointments')
        .update(editForm)
        .eq('id', editingApt.id);
        
      if (error) throw error;
      alert('Appointment updated successfully');
      setIsEditModalOpen(false);
      fetchAppointments();
    } catch (error) {
      alert('Error updating appointment: ' + error.message);
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.patient_full_name.toLowerCase().includes(search.toLowerCase()) ||
    apt.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
    apt.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Appointments</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-64 md:w-80">
            <MdSearch className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by patient, doctor, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-slate-500">
            {filteredAppointments.length} Bookings
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date / Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Doctor / Dept</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading data...</td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No appointments found.</td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{new Date(apt.appointment_date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{apt.appointment_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{apt.patient_full_name}</div>
                      <div className="text-xs text-slate-500">{apt.patient_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{apt.doctor_name}</div>
                      <div className="text-xs text-slate-500">{apt.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(apt)}
                          title="Edit Appointment"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded bg-white shadow-sm border border-slate-100"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(apt.id)}
                          title="Delete Appointment"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded bg-white shadow-sm border border-slate-100"
                        >
                          <MdDelete size={18} />
                        </button>
                        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                        {apt.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => updateStatus(apt.id, 'completed')}
                              title="Mark as Completed"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-white shadow-sm border border-slate-100"
                            >
                              <MdCheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              title="Cancel Appointment"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded bg-white shadow-sm border border-slate-100"
                            >
                              <MdCancel size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Edit Appointment</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.patient_full_name}
                    onChange={(e) => setEditForm({...editForm, patient_full_name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.patient_phone}
                    onChange={(e) => setEditForm({...editForm, patient_phone: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" 
                    required
                    value={editForm.appointment_date}
                    onChange={(e) => setEditForm({...editForm, appointment_date: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Slot</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.appointment_time}
                    onChange={(e) => setEditForm({...editForm, appointment_time: e.target.value})}
                    placeholder="e.09:00 AM"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
