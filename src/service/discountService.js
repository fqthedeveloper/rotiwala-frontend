import api from './api';

export const getDiscounts = (params = {}) => api.get('/discounts/', { params });
export const createDiscount = (data) => api.post('/discounts/', data);
export const getDiscount = (id) => api.get(`/discounts/${id}/`);
export const updateDiscount = (id, data) => api.patch(`/discounts/${id}/`, data);
export const deleteDiscount = (id) => api.delete(`/discounts/${id}/`);

/* =========================================================
   ANALYTICS ENDPOINTS (Super Admin Only)
========================================================= */

/**
 * Get aggregated usage summary (daily/weekly/monthly)
 * @param {Object} params - Query parameters
 * @param {string} [params.shop] - Shop ID
 * @param {string} [params.start_date] - YYYY-MM-DD
 * @param {string} [params.end_date] - YYYY-MM-DD
 * @param {string} [params.group_by] - 'day' | 'week' | 'month'
 * @returns {Promise}
 */
export const getUsageSummary = (params = {}) =>
  api.get("/discounts/usage-summary/", { params });

/**
 * Get paginated list of usage records (both discounts & coupons)
 * @param {Object} params - Query parameters
 * @param {string} [params.shop] - Shop ID
 * @param {string} [params.start_date] - YYYY-MM-DD
 * @param {string} [params.end_date] - YYYY-MM-DD
 * @param {string} [params.type] - 'discount' | 'coupon' (optional)
 * @param {string} [params.order_type] - 'online' | 'walkin' (optional)
 * @param {string} [params.search] - Search term (order # or customer name)
 * @param {number} [params.page] - Page number (default 1)
 * @param {number} [params.page_size] - Items per page (default 10)
 * @returns {Promise}
 */
export const getUsageList = (params = {}) =>
  api.get("/discounts/usage-list/", { params });
