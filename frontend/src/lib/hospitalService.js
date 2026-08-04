import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * Hospital Service for dynamic database operations
 */
export const hospitalService = {
  /**
   * Fetch filter dropdown options (cities, departments)
   */
  async getFilterOptions() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/hospitals/filters/options`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend filter options failed, fetching from Supabase directly:', e);
    }

    // Direct Supabase fallback
    try {
      const { data: hospData } = await supabase.from('hospitals').select('city');
      const cities = hospData ? Array.from(new Set(hospData.map(h => h.city).filter(Boolean))) : [];
      
      const { data: deptData } = await supabase.from('hospital_departments').select('department_name');
      const departments = deptData ? Array.from(new Set(deptData.map(d => d.department_name).filter(Boolean))) : [];

      return {
        cities: cities.length > 0 ? cities : ['Citywest', 'Eastside', 'Metro City', 'Northland'],
        departments: departments.length > 0 ? departments : ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Gynecology'],
        ratings: [4.5, 4.0, 3.5, 3.0]
      };
    } catch (err) {
      return {
        cities: ['Citywest', 'Eastside', 'Metro City', 'Northland'],
        departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Gynecology'],
        ratings: [4.5, 4.0, 3.5, 3.0]
      };
    }
  },

  /**
   * Get hospitals list with dynamic multi-criteria filtering
   */
  async getHospitals(filters = {}) {
    const { search = '', city = '', department = '', minRating = null, isOpen = null } = filters;

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (city && city !== 'All Cities') params.append('city', city);
      if (department && department !== 'All Departments') params.append('department', department);
      if (minRating) params.append('min_rating', minRating);
      if (isOpen !== null && isOpen !== undefined && isOpen !== '') params.append('is_open', isOpen);

      const res = await fetch(`${BACKEND_URL}/api/hospitals?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend query failed, fetching hospitals from Supabase JS client:', e);
    }

    // Supabase JS Client query fallback
    try {
      let query = supabase.from('hospitals').select('*').eq('status', 'active');
      if (city && city !== 'All Cities') query = query.eq('city', city);
      if (minRating) query = query.gte('rating', parseFloat(minRating));
      if (isOpen !== null && isOpen !== undefined && isOpen !== '') query = query.eq('is_open', isOpen === 'true' || isOpen === true);

      const { data, error } = await query;
      if (!error && data) {
        let results = data;
        if (search) {
          const s = search.toLowerCase();
          results = results.filter(h => 
            (h.hospital_name && h.hospital_name.toLowerCase().includes(s)) ||
            (h.city && h.city.toLowerCase().includes(s)) ||
            (h.address && h.address.toLowerCase().includes(s)) ||
            (h.description && h.description.toLowerCase().includes(s))
          );
        }
        return results;
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }

    return [];
  },

  /**
   * Get single hospital details including departments, doctors, tests, packages, reviews, gallery
   */
  async getHospitalById(hospitalId) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/hospitals/${hospitalId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`Backend query for hospital ${hospitalId} failed, falling back to Supabase client:`, e);
    }

    // Direct Supabase query fallback
    try {
      const { data: hosp } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single();
      if (!hosp) return null;

      const { data: departments } = await supabase.from('hospital_departments').select('*').eq('hospital_id', hospitalId);
      const { data: doctors } = await supabase.from('doctors').select('*').eq('hospital_id', hospitalId);
      const { data: diagnostic_tests } = await supabase.from('diagnostic_tests').select('*').eq('hospital_id', hospitalId);
      const { data: diagnostic_packages } = await supabase.from('diagnostic_packages').select('*').eq('hospital_id', hospitalId);
      const { data: reviews } = await supabase.from('hospital_reviews').select('*').eq('hospital_id', hospitalId);
      const { data: images } = await supabase.from('hospital_images').select('*').eq('hospital_id', hospitalId);

      return {
        ...hosp,
        departments: departments || [],
        doctors: doctors || [],
        diagnostic_tests: diagnostic_tests || [],
        diagnostic_packages: diagnostic_packages || [],
        reviews: reviews || [],
        images: images || []
      };
    } catch (err) {
      console.error('Error fetching hospital details:', err);
      return null;
    }
  },

  /**
   * Submit a review for a hospital
   */
  async submitReview(hospitalId, reviewData) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/hospitals/${hospitalId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend review submission failed, falling back to Supabase:', e);
    }

    try {
      const { data, error } = await supabase.from('hospital_reviews').insert({
        hospital_id: hospitalId,
        rating: reviewData.rating,
        review: reviewData.review,
        user_id: reviewData.user_id || null
      }).select().single();

      if (error) throw error;
      return { message: 'Review submitted', review: data };
    } catch (err) {
      console.error('Error submitting review:', err);
      throw err;
    }
  }
};
