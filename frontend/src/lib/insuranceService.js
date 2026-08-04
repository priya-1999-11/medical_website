import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * Insurance Service for dynamic database operations
 */
export const insuranceService = {
  /**
   * Get all insurance providers with search filter
   */
  async getProviders(search = '') {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${BACKEND_URL}/api/insurance/providers${params}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend query failed, fetching insurance providers from Supabase:', e);
    }

    try {
      let query = supabase.from('insurance_providers').select('*').eq('status', 'active');
      const { data, error } = await query;
      if (!error && data) {
        let results = data;
        if (search) {
          const s = search.toLowerCase();
          results = results.filter(p =>
            (p.provider_name && p.provider_name.toLowerCase().includes(s)) ||
            (p.description && p.description.toLowerCase().includes(s))
          );
        }
        return results;
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
    return [];
  },

  /**
   * Get insurance plans with optional provider_id, plan_type, or min_coverage
   */
  async getPlans(filters = {}) {
    const { providerId = '', planType = '', minCoverage = null } = filters;

    try {
      const params = new URLSearchParams();
      if (providerId) params.append('provider_id', providerId);
      if (planType && planType !== 'All Types') params.append('plan_type', planType);
      if (minCoverage) params.append('min_coverage', minCoverage);

      const res = await fetch(`${BACKEND_URL}/api/insurance/plans?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend plans query failed, falling back to Supabase:', e);
    }

    try {
      let query = supabase.from('insurance_plans').select('*').eq('status', 'active');
      if (providerId) query = query.eq('provider_id', providerId);
      if (planType && planType !== 'All Types') query = query.eq('plan_type', planType);

      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
    return [];
  },

  /**
   * Get hospital cashless insurance mappings
   */
  async getCashlessHospitals(providerId = '', hospitalId = '') {
    try {
      const params = new URLSearchParams();
      if (providerId) params.append('provider_id', providerId);
      if (hospitalId) params.append('hospital_id', hospitalId);

      const res = await fetch(`${BACKEND_URL}/api/insurance/cashless-hospitals?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend cashless query failed:', e);
    }
    return [];
  },

  /**
   * Submit a new insurance claim
   */
  async submitClaim(claimData) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/insurance/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend claim submission failed, falling back to Supabase:', e);
    }

    try {
      const claimNum = `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase.from('insurance_claims').insert({
        user_id: claimData.user_id || '00000000-0000-0000-0000-000000000001',
        hospital_id: claimData.hospital_id,
        provider_id: claimData.provider_id,
        plan_id: claimData.plan_id || null,
        claim_number: claimNum,
        claim_amount: claimData.claim_amount,
        approved_amount: 0,
        claim_status: 'submitted',
        remarks: claimData.remarks || 'Claim submitted successfully.'
      }).select().single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error submitting claim:', err);
      throw err;
    }
  },

  /**
   * Track claim status by claim_number or ID
   */
  async getClaimStatus(identifier) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/insurance/claims/${encodeURIComponent(identifier)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend claim tracking failed:', e);
    }
    return null;
  },

  /**
   * Fetch claim history for a user
   */
  async getUserClaims(userId = '00000000-0000-0000-0000-000000000001') {
    try {
      const res = await fetch(`${BACKEND_URL}/api/insurance/claims/user/${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend user claims query failed:', e);
    }
    return [];
  },

  /**
   * Upload or attach document to an insurance claim
   */
  async uploadDocument(claimId, docName, docType, file = null) {
    try {
      const formData = new FormData();
      formData.append('document_name', docName);
      formData.append('document_type', docType);
      if (file) formData.append('file', file);

      const res = await fetch(`${BACKEND_URL}/api/insurance/claims/${claimId}/documents`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend document upload failed:', e);
    }
    return null;
  },

  /**
   * Get insurance FAQs
   */
  async getFaqs() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/insurance/faqs`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend FAQs query failed:', e);
    }
    return [];
  }
};
