import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * Diagnostic Package Service for dynamic database operations
 */
export const packageService = {
  /**
   * Get all 14 diagnostic categories
   */
  async getCategories() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostic/categories`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend categories query failed, fetching from Supabase:', e);
    }

    try {
      const { data, error } = await supabase.from('diagnostic_categories').select('*').eq('status', 'active');
      if (!error && data) return data;
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    return [];
  },

  /**
   * Get diagnostic packages with optional search & filters
   */
  async getPackages(filters = {}) {
    const { search = '', categoryId = '', hospitalId = '', minPrice = null, maxPrice = null } = filters;

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId && categoryId !== 'All') params.append('category_id', categoryId);
      if (hospitalId && hospitalId !== 'All') params.append('hospital_id', hospitalId);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const res = await fetch(`${BACKEND_URL}/api/diagnostic/packages?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend packages query failed, falling back to Supabase:', e);
    }

    try {
      let query = supabase.from('diagnostic_packages').select('*').eq('status', 'active');
      if (categoryId && categoryId !== 'All') query = query.eq('category_id', categoryId);
      if (hospitalId && hospitalId !== 'All') query = query.eq('hospital_id', hospitalId);

      const { data, error } = await query;
      if (!error && data) {
        let results = data;
        if (search) {
          const s = search.toLowerCase();
          results = results.filter(p =>
            (p.package_name && p.package_name.toLowerCase().includes(s)) ||
            (p.description && p.description.toLowerCase().includes(s))
          );
        }
        return results;
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
    return [];
  },

  /**
   * Get single package details including included tests and slots
   */
  async getPackageById(packageId) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostic/packages/${packageId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`Backend query for package ${packageId} failed:`, e);
    }

    try {
      const { data: pkg } = await supabase.from('diagnostic_packages').select('*').eq('id', packageId).single();
      if (pkg) return pkg;
    } catch (err) {
      console.error('Error fetching package detail:', err);
    }
    return null;
  },

  /**
   * Get available home sample collection slots
   */
  async getSlots(hospitalId = '', date = '') {
    try {
      const params = new URLSearchParams();
      if (hospitalId) params.append('hospital_id', hospitalId);
      if (date) params.append('date', date);

      const res = await fetch(`${BACKEND_URL}/api/diagnostic/slots?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend slots query failed:', e);
    }
    return [];
  },

  /**
   * Book a diagnostic package
   */
  async bookPackage(bookingData) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostic/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend booking submission failed, falling back to Supabase:', e);
    }

    try {
      const refCode = `PKG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase.from('package_bookings').insert({
        user_id: bookingData.user_id || '00000000-0000-0000-0000-000000000001',
        patient_name: bookingData.patient_name || 'Percy Boyina',
        hospital_id: bookingData.hospital_id,
        package_id: bookingData.package_id,
        booking_reference: refCode,
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        amount: bookingData.amount,
        booking_status: 'confirmed',
        payment_status: 'paid'
      }).select().single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error booking package:', err);
      throw err;
    }
  },

  /**
   * Track booking status by reference code or ID
   */
  async getBookingStatus(identifier) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostic/bookings/${encodeURIComponent(identifier)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend booking tracking failed:', e);
    }
    return null;
  },

  /**
   * Fetch package booking history for a user
   */
  async getUserBookings(userId = '00000000-0000-0000-0000-000000000001') {
    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostic/bookings/user/${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend user bookings query failed:', e);
    }
    return [];
  }
};
